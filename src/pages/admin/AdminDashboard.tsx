import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Users, Package, MessageSquare, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle, Wallet, Receipt, Layers, Languages,
  PackageX, EyeOff, Info, ArrowUpRight, Boxes,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { ORDER_STATUS_STYLE, formatOrderDate } from '../../lib/orderStatus';

const RANGES = [
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
  { days: 0, label: 'All' },
];

const ACCENT = '#00a651';

/** Drops a trailing ".0" so 2.0k reads as 2k. */
const trimZero = (s: string) => (s.endsWith('.0') ? s.slice(0, -2) : s);

/** 2858 -> "2.9k". Axis ticks only need magnitude, not exact figures. */
function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return trimZero((n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)) + 'm';
  if (abs >= 1_000) return trimZero((n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)) + 'k';
  return String(Math.round(n * 100) / 100);
}

/* Shared surface treatment — a hairline ring and a soft lift rather than a
   flat 1px grey border, which is what made the panels read as unfinished. */
const SURFACE = 'bg-white rounded-2xl ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]';

export default function AdminDashboard() {
  const { formatPrice } = useCart();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<any>(`/admin/stats?days=${days}`)
      .then((d) => { if (!cancelled) { setStats(d); setError(''); } })
      .catch((err: any) => { if (!cancelled) setError(err?.message ?? 'The dashboard could not load.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (loading && !stats) return <Skeleton />;

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto my-24 text-center">
        <AlertTriangle className="w-9 h-9 mx-auto mb-3 text-amber-400" />
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const { current, previous, series, statusBreakdown, topProducts, lowStock, recentOrders, tasks, totals } = stats;
  const comparable = days !== 0 && previous.orders > 0;
  const spark = (key: string) => series.map((p: any) => p[key] ?? 0);

  return (
    <div className={`flex flex-col gap-5 transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 tracking-[-0.01em]">Overview</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {days === 0 ? 'All time' : `Last ${days} days`}
            {comparable && <span className="text-gray-400"> · versus the {days} days before</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-0.5" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.days}
              role="tab"
              aria-selected={days === r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold tabular-nums transition-all ${
                days === r.days
                  ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatPrice(current.revenue)} icon={Wallet}
             now={current.revenue} was={previous.revenue} show={comparable} spark={spark('revenue')} />
        <Kpi label="Orders" value={String(current.orders)} icon={ShoppingCart} to="/admin/orders"
             now={current.orders} was={previous.orders} show={comparable} spark={spark('orders')} />
        <Kpi label="Average order" value={formatPrice(current.aov)} icon={Receipt}
             now={current.aov} was={previous.aov} show={comparable} spark={spark('revenue')} />
        <Kpi label="Profit" hint={current.margin ? `${current.margin}% margin` : undefined}
             value={formatPrice(current.profit)} icon={TrendingUp}
             now={current.profit} was={previous.profit} show={comparable} spark={spark('profit')}
             negative={current.profit < 0} />
      </div>

      {tasks.linesWithoutCost > 0 && (
        <div className="flex items-start gap-2.5 bg-blue-50/70 ring-1 ring-blue-200/70 text-blue-900 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span>
            {tasks.linesWithoutCost === 1
              ? 'One order line in this period carries no cost price, so it counts as pure profit.'
              : `${tasks.linesWithoutCost} order lines in this period carry no cost price, so they count as pure profit.`}
            {' '}The true margin is below {current.margin}%. Cost is stamped onto the order when it is placed, so
            recording it now corrects future orders rather than past ones.
          </span>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 flex flex-col gap-5">
          <RevenueChart series={series} formatPrice={formatPrice} />
          <TopProducts rows={topProducts} formatPrice={formatPrice} />
        </div>
        <div className="flex flex-col gap-5">
          <Tasks tasks={tasks} />
          <StatusBreakdown rows={statusBreakdown} formatPrice={formatPrice} />
          <LowStock rows={lowStock} />
        </div>
      </div>

      <RecentOrders rows={recentOrders} formatPrice={formatPrice} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Counter label="Products" value={totals.products} icon={Package} to="/admin/products" />
        <Counter label="Categories" value={totals.categories} icon={Layers} to="/admin/home-sections?tab=categories" />
        <Counter label="Customers" value={totals.customers} icon={Users} to="/admin/customers" />
        <Counter label="Orders all time" value={totals.orders} icon={Boxes} to="/admin/orders" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function Panel({ title, action, children, bodyClass = 'p-5' }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; bodyClass?: string;
}) {
  return (
    <section className={`${SURFACE} overflow-hidden flex flex-col`}>
      <div className="px-5 h-[52px] shrink-0 border-b border-gray-900/[0.06] flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.07em] text-gray-500">{title}</h3>
        {action}
      </div>
      <div className={`${bodyClass} flex-1`}>{children}</div>
    </section>
  );
}

const PanelLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-[#00a651] transition-colors">
    {children} <ArrowUpRight className="w-3.5 h-3.5" />
  </Link>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[13px] text-gray-400 text-center py-8">{children}</p>
);

function Skeleton() {
  const bar = 'animate-pulse bg-gray-100 rounded-xl';
  return (
    <div className="flex flex-col gap-5">
      <div className={`${bar} h-9 w-56`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`${bar} h-[132px]`} />)}
      </div>
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 flex flex-col gap-5">
          <div className={`${bar} h-[280px]`} />
          <div className={`${bar} h-[300px]`} />
        </div>
        <div className="flex flex-col gap-5">
          <div className={`${bar} h-[200px]`} />
          <div className={`${bar} h-[160px]`} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI                                                                 */
/* ------------------------------------------------------------------ */

/** A bare sparkline — enough shape to read the trend without axes. */
function Sparkline({ points, negative }: { points: number[]; negative?: boolean }) {
  const d = useMemo(() => {
    if (points.length < 2) return null;
    const W = 100, H = 28;
    const max = Math.max(...points, 0);
    const min = Math.min(...points, 0);
    const span = max - min || 1;
    const step = W / (points.length - 1);
    const line = points.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(H - ((v - min) / span) * (H - 4) - 2).toFixed(1)}`).join(' ');
    return { line, area: `${line} L${W},${H} L0,${H} Z`, W, H };
  }, [points]);
  if (!d) return null;
  const stroke = negative ? '#dc2626' : ACCENT;
  const id = `sp${negative ? 'n' : 'p'}`;
  return (
    <svg viewBox={`0 0 ${d.W} ${d.H}`} preserveAspectRatio="none" className="w-full h-7 mt-3 block" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d.area} fill={`url(#${id})`} />
      <path d={d.line} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({ label, hint, value, icon: Icon, now, was, show, spark, to, negative }: {
  label: string; hint?: string; value: string; icon: any;
  now: number; was: number; show: boolean; spark: number[]; to?: string; negative?: boolean;
}) {
  // Growth from nothing is not a percentage, so it reads as "new".
  const delta = was > 0 ? Math.round(((now - was) / Math.abs(was)) * 1000) / 10 : null;
  const up = delta != null && delta > 0;
  const flat = delta === 0;

  const body = (
    <div className={`${SURFACE} p-4 h-full transition-all hover:ring-gray-900/[0.12] hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_4px_10px_rgba(16,24,40,0.08)]`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-gray-500">
          <Icon size={13} className="text-gray-400" /> {label}
        </span>
        {show && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
            delta == null ? 'bg-gray-100 text-gray-500'
              : flat ? 'bg-gray-100 text-gray-500'
              : up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {delta != null && !flat && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            {delta == null ? (now > 0 ? 'new' : '—') : `${delta > 0 ? '+' : ''}${delta}%`}
          </span>
        )}
      </div>
      <div className="mt-2.5 text-[26px] leading-none font-bold text-gray-900 tabular-nums tracking-[-0.02em] break-words">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[12px] text-gray-500 tabular-nums">{hint}</div>}
      <Sparkline points={spark} negative={negative} />
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

function Counter({ label, value, icon: Icon, to }: { label: string; value: number; icon: any; to: string }) {
  return (
    <Link to={to} className={`${SURFACE} px-4 py-3.5 flex items-center gap-3 transition-all hover:ring-gray-900/[0.12] group`}>
      <span className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 group-hover:text-[#00a651] transition-colors">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-bold text-gray-900 leading-none tabular-nums">{value}</span>
        <span className="block text-[11px] uppercase tracking-[0.06em] font-semibold text-gray-400 truncate mt-1">{label}</span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue chart                                                       */
/* ------------------------------------------------------------------ */

function RevenueChart({ series, formatPrice }: { series: any[]; formatPrice: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const W = 760, H = 200, PAD_B = 22;
  const max = Math.max(...series.map((p) => p.revenue), 1);
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const y = (v: number) => (H - PAD_B) - (v / max) * (H - PAD_B - 10);

  const line = series.map((p, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${y(p.revenue).toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H - PAD_B} L0,${H - PAD_B} Z`;
  const total = series.reduce((s, p) => s + p.revenue, 0);
  const ticks = [max, max / 2, 0];
  const active = hover != null ? series[hover] : null;

  return (
    <Panel
      title="Revenue"
      action={<span className="text-[12px] text-gray-500 tabular-nums">Total <span className="font-bold text-gray-900">{formatPrice(total)}</span></span>}
      bodyClass="px-5 pt-4 pb-3"
    >
      {total === 0 ? <Empty>No revenue in this period yet.</Empty> : (
        <div className="relative" ref={wrapRef}>
          {/* Y axis labels sit outside the plot so the line keeps the full width. */}
          <div className="absolute inset-y-0 left-0 w-10 flex flex-col justify-between pb-[26px] pointer-events-none text-end pe-2">
            {ticks.map((t, i) => (
              <span key={i} className="text-[10px] text-gray-400 tabular-nums leading-none">{compact(t)}</span>
            ))}
          </div>

          <div className="ps-10">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[200px] block" role="img" aria-label="Revenue over time">
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              {ticks.map((t, i) => (
                <line key={i} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke="#111827" strokeOpacity={i === 2 ? 0.12 : 0.05}
                      strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray={i === 2 ? '' : '4 4'} />
              ))}
              <path d={area} fill="url(#revFill)" />
              <path d={line} fill="none" stroke={ACCENT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              {hover != null && (
                <>
                  <line x1={hover * step} x2={hover * step} y1="0" y2={H - PAD_B}
                        stroke={ACCENT} strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <circle cx={hover * step} cy={y(series[hover].revenue)} r="3.5" fill="#fff" stroke={ACCENT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </>
              )}
            </svg>

            {/* Hover targets, one per day. */}
            <div className="absolute inset-y-0 start-10 end-0 flex" style={{ bottom: 22 }} onMouseLeave={() => setHover(null)}>
              {series.map((p, i) => (
                <div key={p.day} className="flex-1 cursor-crosshair" onMouseEnter={() => setHover(i)} />
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 tabular-nums -mt-1">
              <span>{series[0].day.slice(5)}</span>
              <span>{series[series.length - 1].day.slice(5)}</span>
            </div>
          </div>

          {active && (
            <div
              className="absolute -top-1 pointer-events-none bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap z-10"
              style={{
                left: `calc(2.5rem + ${(hover! / Math.max(series.length - 1, 1)) * 100}%)`,
                transform: `translateX(${hover! > series.length / 2 ? '-100%' : '0'})`,
              }}
            >
              <div className="font-semibold tabular-nums">{formatPrice(active.revenue)}</div>
              <div className="text-white/60 tabular-nums">{active.day} · {active.orders} order{active.orders === 1 ? '' : 's'}</div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

function TopProducts({ rows, formatPrice }: { rows: any[]; formatPrice: (n: number) => string }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <Panel title="Best sellers" action={<PanelLink to="/admin/products">Products</PanelLink>} bodyClass="px-2 py-2">
      {rows.length === 0 ? <Empty>Nothing sold in this period.</Empty> : (
        <div className="flex flex-col">
          {rows.map((r, i) => (
            <div key={`${r.id}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
              <span className="w-5 text-[11px] font-bold text-gray-300 tabular-nums shrink-0">{i + 1}</span>
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 ring-1 ring-gray-900/[0.04] p-1">
                {r.image
                  ? <img src={r.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  : <Package className="w-full h-full text-gray-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-gray-900 truncate font-medium">{r.title}</div>
                <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((r.revenue / max) * 100, 3)}%`, background: ACCENT }} />
                </div>
              </div>
              <div className="text-end shrink-0">
                <div className="text-[13px] font-bold text-gray-900 tabular-nums whitespace-nowrap">{formatPrice(r.revenue)}</div>
                <div className="text-[11px] text-gray-400 tabular-nums">{r.units} sold</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Tasks({ tasks }: { tasks: any }) {
  // Each entry carries both forms so a count of one never reads as broken.
  const items = [
    { n: tasks.pendingOrders, one: 'order to fulfil', many: 'orders to fulfil', to: '/admin/orders', icon: ShoppingCart, tone: 'text-blue-600' },
    { n: tasks.pendingReviews, one: 'review to moderate', many: 'reviews to moderate', to: '/admin/reviews', icon: MessageSquare, tone: 'text-purple-600' },
    { n: tasks.outOfStock, one: 'product out of stock', many: 'products out of stock', to: '/admin/products', icon: PackageX, tone: 'text-red-600' },
    { n: tasks.withoutCost, one: 'product with no cost price', many: 'products with no cost price', to: '/admin/products', icon: Wallet, tone: 'text-amber-600' },
    { n: tasks.unpublished, one: 'product unpublished', many: 'products unpublished', to: '/admin/products', icon: EyeOff, tone: 'text-gray-500' },
    { n: tasks.withoutArabic, one: 'product with no Arabic title', many: 'products with no Arabic title', to: '/admin/products', icon: Languages, tone: 'text-teal-600' },
    { n: tasks.categoriesWithoutArabic, one: 'category with no Arabic name', many: 'categories with no Arabic name', to: '/admin/categories', icon: Languages, tone: 'text-teal-600' },
  ].filter((i) => i.n > 0);

  return (
    <Panel title="Needs attention" bodyClass="px-2 py-2">
      {items.length === 0 ? <Empty>Nothing outstanding.</Empty> : (
        <div className="flex flex-col">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.many} to={i.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50/80 transition-colors group">
                <Icon size={15} className={`shrink-0 ${i.tone}`} />
                <span className="flex-1 min-w-0 text-[12.5px] text-gray-600 truncate">
                  <span className="font-bold text-gray-900 tabular-nums">{i.n}</span> {i.n === 1 ? i.one : i.many}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00a651] group-hover:translate-x-0.5 rtl:rotate-180 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function StatusBreakdown({ rows, formatPrice }: { rows: any[]; formatPrice: (n: number) => string }) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return (
    <Panel title="Orders by status">
      {total === 0 ? <Empty>No orders in this period.</Empty> : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.status}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wide border capitalize ${ORDER_STATUS_STYLE[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {r.status}
                </span>
                <span className="text-[12px] text-gray-900 font-semibold tabular-nums whitespace-nowrap">{formatPrice(r.total)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full" style={{ width: `${(r.n / total) * 100}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 tabular-nums shrink-0">{r.n}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function LowStock({ rows }: { rows: any[] }) {
  return (
    <Panel title="Running low" action={<PanelLink to="/admin/products">Manage</PanelLink>} bodyClass="px-2 py-2">
      {rows.length === 0 ? <Empty>Every published product has stock.</Empty> : (
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-colors">
              <span className="flex-1 min-w-0 truncate text-[12.5px] text-gray-600">{r.title}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold tabular-nums shrink-0 ${
                r.stock <= 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {r.stock <= 0 ? 'OUT' : `${r.stock} LEFT`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function RecentOrders({ rows, formatPrice }: { rows: any[]; formatPrice: (n: number) => string }) {
  return (
    <Panel title="Latest orders" action={<PanelLink to="/admin/orders">All orders</PanelLink>} bodyClass="p-0">
      {rows.length === 0 ? <Empty>No orders yet.</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-[0.06em] text-gray-400 font-bold bg-gray-50/60">
                <th className="px-5 py-2.5 font-bold">Order</th>
                <th className="px-5 py-2.5 font-bold">Customer</th>
                <th className="px-5 py-2.5 font-bold">Placed</th>
                <th className="px-5 py-2.5 font-bold">Payment</th>
                <th className="px-5 py-2.5 font-bold">Status</th>
                <th className="px-5 py-2.5 font-bold text-end">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/[0.05] text-[12.5px]">
              {rows.map((o) => (
                <tr key={o.number} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${o.number}`} className="font-semibold text-gray-900 hover:text-[#00a651] font-mono text-[12px]">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500 truncate max-w-[200px]">{o.email}</td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap tabular-nums">{formatOrderDate(o.createdAt)}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{o.paymentStatus}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wide border capitalize ${ORDER_STATUS_STYLE[o.status] ?? ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-end font-bold text-gray-900 tabular-nums whitespace-nowrap">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
