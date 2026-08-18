import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Users, Package, MessageSquare, TrendingUp, TrendingDown, Minus,
  ArrowRight, Loader2, AlertTriangle, Wallet, Receipt, Layers, Languages,
  PackageX, EyeOff, Info,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { ORDER_STATUS_STYLE, formatOrderDate } from '../../lib/orderStatus';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 0, label: 'All time' },
];

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

  if (loading && !stats) {
    return (
      <div className="py-24 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto my-20 text-center">
        <AlertTriangle className="w-9 h-9 mx-auto mb-3 text-amber-400" />
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const { current, previous, series, statusBreakdown, topProducts, lowStock, recentOrders, tasks, totals } = stats;
  const periodLabel = days === 0 ? 'all time' : `the last ${days} days`;
  const comparable = days !== 0 && previous.orders > 0;

  return (
    <div className={`flex flex-col gap-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
      {/* Range picker */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Showing {periodLabel}
            {comparable && ' · compared with the period before it'}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                days === r.days ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Headline figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatPrice(current.revenue)} icon={Wallet}
             tone="bg-green-50 text-green-600" now={current.revenue} was={previous.revenue} show={comparable} />
        <Kpi label="Orders" value={String(current.orders)} icon={ShoppingCart} to="/admin/orders"
             tone="bg-blue-50 text-blue-600" now={current.orders} was={previous.orders} show={comparable} />
        <Kpi label="Average order" value={formatPrice(current.aov)} icon={Receipt}
             tone="bg-indigo-50 text-indigo-600" now={current.aov} was={previous.aov} show={comparable} />
        <Kpi
          label={`Profit${current.margin ? ` · ${current.margin}% margin` : ''}`}
          value={formatPrice(current.profit)} icon={TrendingUp}
          tone={current.profit < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
          now={current.profit} was={previous.profit} show={comparable}
        />
      </div>

      {/* Profit is only as honest as the cost data behind it. */}
      {tasks.linesWithoutCost > 0 && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-[13px]">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {tasks.linesWithoutCost === 1
              ? 'One order line in this period carries no cost price, so it counts as pure profit.'
              : `${tasks.linesWithoutCost} order lines in this period carry no cost price, so they count as pure profit.`}
            {' '}The real margin is lower than {current.margin}%. Cost is recorded on the order when it is placed,
            so setting it now fixes future orders, not past ones.
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RevenueChart series={series} formatPrice={formatPrice} />
          <TopProducts rows={topProducts} formatPrice={formatPrice} />
        </div>

        <div className="flex flex-col gap-6">
          <Tasks tasks={tasks} />
          <StatusBreakdown rows={statusBreakdown} formatPrice={formatPrice} />
          <LowStock rows={lowStock} />
        </div>
      </div>

      <RecentOrders rows={recentOrders} formatPrice={formatPrice} />

      {/* Catalogue size, independent of the period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Counter label="Products" value={totals.products} icon={Package} to="/admin/products" />
        <Counter label="Categories" value={totals.categories} icon={Layers} to="/admin/home-sections?tab=categories" />
        <Counter label="Customers" value={totals.customers} icon={Users} to="/admin/customers" />
        <Counter label="Orders, all time" value={totals.orders} icon={ShoppingCart} to="/admin/orders" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Panel({ title, action, children, className = '' }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 text-center py-6">{children}</p>
);

function Kpi({ label, value, icon: Icon, tone, now, was, show, to }: {
  label: string; value: string; icon: any; tone: string;
  now: number; was: number; show: boolean; to?: string;
}) {
  // Growth from zero is not a percentage, so it is reported as new rather than
  // as an infinite jump.
  const delta = was > 0 ? Math.round(((now - was) / Math.abs(was)) * 1000) / 10 : null;
  const Trend = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendTone = delta == null || delta === 0 ? 'text-gray-400'
    : delta > 0 ? 'text-emerald-600' : 'text-red-600';

  const body = (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon size={19} />
        </div>
        {show && (
          <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${trendTone}`}>
            <Trend className="w-3.5 h-3.5" />
            {delta == null ? (now > 0 ? 'new' : '—') : `${delta > 0 ? '+' : ''}${delta}%`}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-none mb-1.5 break-words">{value}</div>
      <div className="text-[13px] text-gray-500">{label}</div>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

function Counter({ label, value, icon: Icon, to }: { label: string; value: number; icon: any; to: string }) {
  return (
    <Link to={to} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:border-gray-300 transition-colors">
      <span className="w-9 h-9 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-bold text-gray-900 leading-none">{value}</span>
        <span className="block text-[12px] text-gray-500 truncate">{label}</span>
      </span>
    </Link>
  );
}

/** Revenue over time, drawn as an inline SVG area — no charting dependency. */
function RevenueChart({ series, formatPrice }: { series: any[]; formatPrice: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, peak, W, H } = useMemo(() => {
    const W = 720, H = 180;
    const max = Math.max(...series.map((p) => p.revenue), 1);
    const step = series.length > 1 ? W / (series.length - 1) : W;
    const pts = series.map((p, i) => [i * step, H - (p.revenue / max) * (H - 16) - 8]);
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return { path: d, area: `${d} L${W},${H} L0,${H} Z`, peak: max, W, H };
  }, [series]);

  const total = series.reduce((s, p) => s + p.revenue, 0);
  const active = hover != null ? series[hover] : null;

  if (!series.length) return <Panel title="Revenue"><Empty>No data yet.</Empty></Panel>;

  return (
    <Panel
      title="Revenue over time"
      action={
        <span className="text-[12px] text-gray-500">
          {active
            ? <><span className="font-semibold text-gray-900">{formatPrice(active.revenue)}</span> · {active.day} · {active.orders} order{active.orders === 1 ? '' : 's'}</>
            : <>Peak {formatPrice(peak)} · total {formatPrice(total)}</>}
        </span>
      }
    >
      {total === 0 ? (
        <Empty>No revenue in this period yet.</Empty>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[180px] block" role="img" aria-label="Revenue over time">
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a651" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#00a651" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#rev)" />
            <path d={path} fill="none" stroke="#00a651" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {hover != null && (
              <line
                x1={(hover / Math.max(series.length - 1, 1)) * W} x2={(hover / Math.max(series.length - 1, 1)) * W}
                y1="0" y2={H} stroke="#00a651" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {/* Hover targets sit above the chart so every day is reachable. */}
          <div className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
            {series.map((p, i) => (
              <div key={p.day} className="flex-1 h-full cursor-crosshair" onMouseEnter={() => setHover(i)} title={`${p.day}: ${formatPrice(p.revenue)}`} />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mt-2">
            <span>{series[0].day}</span>
            <span>{series[series.length - 1].day}</span>
          </div>
        </div>
      )}
    </Panel>
  );
}

function TopProducts({ rows, formatPrice }: { rows: any[]; formatPrice: (n: number) => string }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <Panel title="Best sellers" action={<Link to="/admin/products" className="text-[12px] font-semibold text-[#00a651] hover:underline">All products</Link>}>
      {rows.length === 0 ? <Empty>Nothing sold in this period.</Empty> : (
        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={`${r.id}-${i}`} className="flex items-center gap-3">
              <span className="w-6 text-[12px] font-bold text-gray-400 shrink-0">{i + 1}</span>
              <div className="w-9 h-9 shrink-0 border border-gray-100 rounded-lg p-1">
                {r.image
                  ? <img src={r.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  : <Package className="w-full h-full text-gray-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-gray-900 truncate">{r.title}</div>
                <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#00a651] rounded-full" style={{ width: `${Math.max((r.revenue / max) * 100, 2)}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{formatPrice(r.revenue)}</div>
                <div className="text-[11px] text-gray-500">{r.units} sold</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Tasks({ tasks }: { tasks: any }) {
  const items = [
    { n: tasks.pendingOrders, label: 'orders waiting to be fulfilled', to: '/admin/orders', icon: ShoppingCart, tone: 'text-blue-600 bg-blue-50' },
    { n: tasks.pendingReviews, label: 'reviews awaiting moderation', to: '/admin/reviews', icon: MessageSquare, tone: 'text-purple-600 bg-purple-50' },
    { n: tasks.outOfStock, label: 'published products out of stock', to: '/admin/products', icon: PackageX, tone: 'text-red-600 bg-red-50' },
    { n: tasks.withoutCost, label: 'products with no cost price', to: '/admin/products', icon: Wallet, tone: 'text-amber-600 bg-amber-50' },
    { n: tasks.unpublished, label: 'products still unpublished', to: '/admin/products', icon: EyeOff, tone: 'text-gray-600 bg-gray-100' },
    { n: tasks.withoutArabic, label: 'products with no Arabic title', to: '/admin/products', icon: Languages, tone: 'text-teal-600 bg-teal-50' },
    { n: tasks.categoriesWithoutArabic, label: 'categories with no Arabic name', to: '/admin/categories', icon: Languages, tone: 'text-teal-600 bg-teal-50' },
  ].filter((i) => i.n > 0);

  return (
    <Panel title="Needs attention">
      {items.length === 0 ? <Empty>Nothing outstanding. </Empty> : (
        <div className="flex flex-col gap-2">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.label} to={i.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors group">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i.tone}`}>
                  <Icon size={15} />
                </span>
                <span className="flex-1 min-w-0 text-[13px] text-gray-700">
                  <span className="font-bold text-gray-900">{i.n}</span> {i.label}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#00a651] rtl:rotate-180 shrink-0" />
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
        <div className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <div key={r.status} className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize shrink-0 ${ORDER_STATUS_STYLE[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {r.status}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(r.n / total) * 100}%` }} />
              </div>
              <span className="text-[12px] text-gray-500 shrink-0 tabular-nums">{r.n}</span>
              <span className="text-[12px] font-semibold text-gray-900 shrink-0 whitespace-nowrap">{formatPrice(r.total)}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function LowStock({ rows }: { rows: any[] }) {
  return (
    <Panel title="Running low" action={<Link to="/admin/products" className="text-[12px] font-semibold text-[#00a651] hover:underline">Manage</Link>}>
      {rows.length === 0 ? <Empty>Every published product has stock.</Empty> : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 text-[13px]">
              <span className="flex-1 min-w-0 truncate text-gray-700">{r.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                r.stock <= 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {r.stock <= 0 ? 'Out of stock' : `${r.stock} left`}
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
    <Panel title="Latest orders" action={<Link to="/admin/orders" className="text-[12px] font-semibold text-[#00a651] hover:underline">View all</Link>}>
      {rows.length === 0 ? <Empty>No orders yet.</Empty> : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left min-w-[620px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Placed</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-end">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {rows.map((o) => (
                <tr key={o.number} className="hover:bg-gray-50/60">
                  <td className="py-3">
                    <Link to={`/admin/orders/${o.number}`} className="font-semibold text-gray-900 hover:text-[#00a651]">
                      {o.number}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600 truncate max-w-[200px]">{o.email}</td>
                  <td className="py-3 text-gray-500 whitespace-nowrap">{formatOrderDate(o.createdAt)}</td>
                  <td className="py-3 text-gray-600 capitalize">{o.paymentStatus}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${ORDER_STATUS_STYLE[o.status] ?? ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-end font-semibold text-gray-900 whitespace-nowrap">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
