import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Users, Package, MessageSquare, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle, Wallet, Receipt, Languages,
  PackageX, EyeOff, Info, ArrowUpRight, CheckCircle2, CalendarDays,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { ORDER_STATUS_STYLE, formatOrderDate } from '../../lib/orderStatus';

const PRESETS = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: 'all', label: 'All', days: 0 },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'] | 'custom';

/**
 * Minutes east of UTC. Orders are stored in UTC but a shop's day is its own,
 * so the server needs the offset to line day boundaries up with the till.
 */
const TZ = -new Date().getTimezoneOffset();

const isoDay = (ms: number) => new Date(ms + TZ * 60000).toISOString().slice(0, 10);
const today = () => isoDay(Date.now());
/** n days before the given calendar day, staying on calendar days. */
const minusDays = (day: string, n: number) => new Date(Date.parse(day + 'T00:00:00Z') - n * 86400000).toISOString().slice(0, 10);

/** A preset resolved to the window it means right now. */
function windowFor(key: PresetKey): { from: string; to: string; all: boolean } {
  const to = today();
  const preset = PRESETS.find((p) => p.key === key);
  if (!preset || preset.days === 0) return { from: '', to, all: true };
  return { from: minusDays(to, preset.days - 1), to, all: false };
}

/**
 * The four headline figures. Picking one redraws the chart below it.
 *
 * The previous layout drew a sparkline per metric *and* a separate full chart
 * of the same data, so every number appeared twice and neither had room. One
 * chart driven by the selection says more in less space.
 */
const METRICS = [
  { key: 'revenue', label: 'Revenue', icon: Wallet, money: true },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, money: false },
  { key: 'profit', label: 'Profit', icon: TrendingUp, money: true },
  { key: 'aov', label: 'Avg order', icon: Receipt, money: true },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

const ACCENT = '#00a651';
const SURFACE = 'bg-white rounded-2xl ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]';
const STATUS_DOT = ['bg-amber-400', 'bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-gray-400', 'bg-red-400'];

const trimZero = (s: string) => (s.endsWith('.0') ? s.slice(0, -2) : s);

/** 2858 -> "2.9k". Axis ticks only need magnitude, not exact figures. */
function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return trimZero((n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)) + 'm';
  if (abs >= 1_000) return trimZero((n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)) + 'k';
  return String(Math.round(n * 100) / 100);
}

export default function AdminDashboard() {
  const { formatPrice } = useCart();
  const [preset, setPreset] = useState<PresetKey>('30d');
  const [range, setRange] = useState(() => windowFor('30d'));
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = range.all
      ? `all=1&to=${range.to}&tz=${TZ}`
      : `from=${range.from}&to=${range.to}&tz=${TZ}`;
    api.get<any>(`/admin/stats?${qs}`)
      .then((d) => { if (!cancelled) { setStats(d); setError(''); } })
      .catch((err: any) => { if (!cancelled) setError(err?.message ?? 'The dashboard could not load.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range.from, range.to, range.all]);

  const choosePreset = (key: PresetKey) => {
    setPreset(key);
    if (key !== 'custom') setRange(windowFor(key));
  };

  /** Editing either end keeps the other, so a half-typed range never fetches. */
  const setEnd = (which: 'from' | 'to', value: string) => {
    if (!value) return;
    setPreset('custom');
    setRange((prev) => {
      const next = { ...prev, all: false, [which]: value };
      if (!next.from) next.from = next.to;
      if (!next.to) next.to = next.from;
      return next;
    });
  };

  if (loading && !stats) return <Skeleton />;
  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto my-24 text-center">
        <AlertTriangle className="w-9 h-9 mx-auto mb-3 text-amber-400" />
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const {
    current, previous, series, previousSeries, statusBreakdown,
    topProducts, lowStock, recentOrders, tasks, totals,
  } = stats;
  const comparable = !!stats.hasPrevious;

  const rangeLabel = stats.days === 1
    ? (stats.to === today() ? 'Today' : stats.to)
    : preset === 'all'
      ? `All time · ${stats.from} to ${stats.to}`
      : `${stats.from} to ${stats.to} · ${stats.days} days`;
  const fmt = (key: MetricKey, v: number) =>
    METRICS.find((m) => m.key === key)!.money ? formatPrice(v) : String(v);

  return (
    <div className={`flex flex-col gap-5 transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 tracking-[-0.01em]">Overview</h2>
          <p className="text-[13px] text-gray-500 mt-0.5 tabular-nums">
            {rangeLabel}
            {comparable && (
              <span className="text-gray-400">
                {' · compared with '}
                {stats.days === 1 ? 'the day before' : 'the ' + stats.days + ' days before'}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-0.5" role="tablist" aria-label="Date range">
            {PRESETS.map((r) => (
              <button
                key={r.key} role="tab" aria-selected={preset === r.key}
                onClick={() => choosePreset(r.key)}
                className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold tabular-nums transition-all ${
                  preset === r.key ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ring-1 transition-colors ${
            preset === 'custom' ? 'bg-white ring-[#00a651]/40' : 'bg-gray-100/80 ring-transparent'
          }`}>
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="date" aria-label="From"
              value={range.all ? (stats?.from ?? '') : range.from}
              max={range.to || undefined}
              min={stats?.firstOrderDate ?? undefined}
              onChange={(e) => setEnd('from', e.target.value)}
              className="bg-transparent text-[12px] font-semibold text-gray-700 tabular-nums outline-none w-[110px]"
            />
            <span className="text-gray-300 text-[12px]">→</span>
            <input
              type="date" aria-label="To"
              value={range.to}
              min={range.all ? undefined : range.from || undefined}
              max={today()}
              onChange={(e) => setEnd('to', e.target.value)}
              className="bg-transparent text-[12px] font-semibold text-gray-700 tabular-nums outline-none w-[110px]"
            />
          </div>
        </div>
      </header>

      {/* Hero: the metric you pick drives the chart underneath it, with the
          work queue alongside so the page opens on something actionable. */}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <Analytics
          metric={metric} setMetric={setMetric}
          current={current} previous={previous}
          series={series} previousSeries={previousSeries}
          comparable={comparable} fmt={fmt}
        />
        <ActionQueue tasks={tasks} />
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

      {/* Operations: three equal panels. The old counters strip was filler and
          is gone; the two figures worth keeping moved into the orders header. */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        <TopProducts rows={topProducts} formatPrice={formatPrice} />
        <StatusBreakdown rows={statusBreakdown} formatPrice={formatPrice} totalOrders={totals.orders} />
        <LowStock rows={lowStock} />
      </div>

      <RecentOrders rows={recentOrders} formatPrice={formatPrice} totals={totals} />
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

const AllClear = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center py-8">
    <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
    <p className="text-[13px] text-gray-500">{children}</p>
  </div>
);

function Skeleton() {
  const bar = 'animate-pulse bg-gray-100 rounded-2xl';
  return (
    <div className="flex flex-col gap-5">
      <div className={`${bar} h-9 w-56 rounded-xl`} />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <div className={`${bar} h-[420px]`} />
        <div className={`${bar} h-[260px]`} />
      </div>
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => <div key={i} className={`${bar} h-[260px]`} />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero analytics                                                      */
/* ------------------------------------------------------------------ */

function Delta({ now, was, show }: { now: number; was: number; show: boolean }) {
  if (!show) return null;
  // Growth from nothing is not a percentage, so it reads as "new".
  const delta = was > 0 ? Math.round(((now - was) / Math.abs(was)) * 1000) / 10 : null;
  const flat = delta === 0;
  const up = delta != null && delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
      delta == null || flat ? 'bg-gray-100 text-gray-500' : up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
    }`}>
      {delta != null && !flat && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
      {delta == null ? (now > 0 ? 'new' : '—') : `${delta > 0 ? '+' : ''}${delta}%`}
    </span>
  );
}

function Analytics({ metric, setMetric, current, previous, series, previousSeries, comparable, fmt }: {
  metric: MetricKey; setMetric: (m: MetricKey) => void;
  current: any; previous: any; series: any[]; previousSeries: any[];
  comparable: boolean; fmt: (k: MetricKey, v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = METRICS.find((m) => m.key === metric)!;
  const showPrev = comparable && previousSeries?.length === series.length;

  const W = 780, H = 210, PAD_B = 24;
  const values = series.map((p) => p[metric] ?? 0);
  const prevValues = showPrev ? previousSeries.map((p) => p[metric] ?? 0) : [];
  const max = Math.max(...values, ...prevValues, 1);
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const y = (v: number) => (H - PAD_B) - (v / max) * (H - PAD_B - 12);
  const toPath = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const line = toPath(values);
  const area = `${line} L${W},${H - PAD_B} L0,${H - PAD_B} Z`;
  const ticks = [max, max / 2, 0];
  const point = hover != null ? series[hover] : null;
  const prevPoint = hover != null && showPrev ? previousSeries[hover] : null;
  const hasData = values.some((v) => v > 0);

  return (
    <section className={`${SURFACE} overflow-hidden`}>
      {/* The metric picker doubles as the figure display. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-900/[0.06]">
        {METRICS.map((m) => {
          const on = m.key === metric;
          const Icon = m.icon;
          return (
            <button
              key={m.key} onClick={() => setMetric(m.key)} aria-pressed={on}
              className={`relative text-start px-4 py-3.5 transition-colors border-e last:border-e-0 border-gray-900/[0.06] ${
                on ? 'bg-gray-50/70' : 'hover:bg-gray-50/40'
              }`}
            >
              {on && <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: ACCENT }} />}
              <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-gray-500">
                <Icon size={12} className={on ? 'text-[#00a651]' : 'text-gray-400'} /> {m.label}
              </span>
              <span className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                <span className={`text-[19px] font-bold tabular-nums tracking-[-0.02em] ${on ? 'text-gray-900' : 'text-gray-500'}`}>
                  {fmt(m.key, current[m.key])}
                </span>
                <Delta now={current[m.key]} was={previous[m.key]} show={comparable} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3 mb-2 min-h-[20px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-gray-500">{active.label} per day</span>
          {showPrev && (
            <span className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 rounded" style={{ background: ACCENT }} /> This period</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-gray-300" /> Previous</span>
            </span>
          )}
        </div>

        {!hasData ? (
          <Empty>No {active.label.toLowerCase()} recorded in this period.</Empty>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-10 flex flex-col justify-between pb-[28px] pointer-events-none text-end pe-2">
              {ticks.map((t, i) => (
                <span key={i} className="text-[10px] text-gray-400 tabular-nums leading-none">{compact(t)}</span>
              ))}
            </div>

            <div className="ps-10">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[210px] block"
                   role="img" aria-label={`${active.label} per day`}>
                <defs>
                  <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {ticks.map((t, i) => (
                  <line key={i} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke="#111827"
                        strokeOpacity={i === 2 ? 0.12 : 0.05} strokeWidth="1"
                        vectorEffect="non-scaling-stroke" strokeDasharray={i === 2 ? '' : '4 4'} />
                ))}
                {showPrev && (
                  <path d={toPath(prevValues)} fill="none" stroke="#9ca3af" strokeWidth="1.5"
                        strokeDasharray="5 4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                )}
                <path d={area} fill="url(#heroFill)" />
                <path d={line} fill="none" stroke={ACCENT} strokeWidth="2.25" vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round" strokeLinecap="round" />
                {hover != null && (
                  <>
                    <line x1={hover * step} x2={hover * step} y1="0" y2={H - PAD_B}
                          stroke={ACCENT} strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <circle cx={hover * step} cy={y(values[hover])} r="3.5" fill="#fff" stroke={ACCENT}
                            strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </>
                )}
              </svg>

              <div className="absolute inset-y-0 start-10 end-0 flex" style={{ bottom: 24 }} onMouseLeave={() => setHover(null)}>
                {series.map((p, i) => (
                  <div key={p.day} className="flex-1 cursor-crosshair" onMouseEnter={() => setHover(i)} />
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-gray-400 tabular-nums -mt-1.5">
                <span>{series[0].day.slice(5)}</span>
                <span>{series[series.length - 1].day.slice(5)}</span>
              </div>
            </div>

            {point && (
              <div
                className="absolute -top-1 pointer-events-none bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap z-10"
                style={{
                  left: `calc(2.5rem + ${(hover! / Math.max(series.length - 1, 1)) * 100}%)`,
                  transform: `translateX(${hover! > series.length / 2 ? '-100%' : '0'})`,
                }}
              >
                <div className="font-semibold tabular-nums">{fmt(metric, point[metric] ?? 0)}</div>
                <div className="text-white/60 tabular-nums">{point.day}</div>
                {prevPoint && <div className="text-white/40 tabular-nums mt-0.5">was {fmt(metric, prevPoint[metric] ?? 0)}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Action queue                                                        */
/* ------------------------------------------------------------------ */

function ActionQueue({ tasks }: { tasks: any }) {
  // Ordered by what it costs to ignore: money first, then customers, then
  // catalogue hygiene. Each line carries both plural forms so a count of one
  // never reads as a bug.
  const items = [
    { n: tasks.pendingOrders, one: 'order to fulfil', many: 'orders to fulfil', to: '/admin/orders', icon: ShoppingCart, tone: 'text-blue-600 bg-blue-50', urgent: true },
    { n: tasks.outOfStock, one: 'product out of stock', many: 'products out of stock', to: '/admin/products', icon: PackageX, tone: 'text-red-600 bg-red-50', urgent: true },
    { n: tasks.pendingReviews, one: 'review to moderate', many: 'reviews to moderate', to: '/admin/reviews', icon: MessageSquare, tone: 'text-purple-600 bg-purple-50' },
    { n: tasks.withoutCost, one: 'product with no cost price', many: 'products with no cost price', to: '/admin/products', icon: Wallet, tone: 'text-amber-600 bg-amber-50' },
    { n: tasks.unpublished, one: 'product unpublished', many: 'products unpublished', to: '/admin/products', icon: EyeOff, tone: 'text-gray-500 bg-gray-100' },
    { n: tasks.withoutArabic, one: 'product with no Arabic title', many: 'products with no Arabic title', to: '/admin/products', icon: Languages, tone: 'text-teal-600 bg-teal-50' },
    { n: tasks.categoriesWithoutArabic, one: 'category with no Arabic name', many: 'categories with no Arabic name', to: '/admin/categories', icon: Languages, tone: 'text-teal-600 bg-teal-50' },
  ].filter((i) => i.n > 0);

  const urgent = items.filter((i) => i.urgent).reduce((s, i) => s + i.n, 0);

  return (
    <Panel
      title="Needs attention"
      action={urgent > 0
        ? <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold tabular-nums">{urgent} urgent</span>
        : undefined}
      bodyClass="px-2 py-2"
    >
      {items.length === 0 ? <AllClear>All clear — nothing needs you right now.</AllClear> : (
        <div className="flex flex-col">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.many} to={i.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50/80 transition-colors group">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${i.tone}`}>
                  <Icon size={14} />
                </span>
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

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

function TopProducts({ rows, formatPrice }: { rows: any[]; formatPrice: (n: number) => string }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <Panel title="Best sellers" action={<PanelLink to="/admin/products">Products</PanelLink>} bodyClass="px-2 py-2">
      {rows.length === 0 ? <Empty>Nothing sold in this period.</Empty> : (
        <div className="flex flex-col">
          {rows.slice(0, 5).map((r, i) => (
            <div key={`${r.id}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
              <span className="w-4 text-[11px] font-bold text-gray-300 tabular-nums shrink-0">{i + 1}</span>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-gray-50 ring-1 ring-gray-900/[0.04] p-1">
                {r.image
                  ? <img src={r.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  : <Package className="w-full h-full text-gray-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-gray-900 truncate font-medium">{r.title}</div>
                <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max((r.revenue / max) * 100, 3)}%`, background: ACCENT }} />
                </div>
              </div>
              <div className="text-end shrink-0">
                <div className="text-[12.5px] font-bold text-gray-900 tabular-nums whitespace-nowrap">{formatPrice(r.revenue)}</div>
                <div className="text-[11px] text-gray-400 tabular-nums">{r.units} sold</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function StatusBreakdown({ rows, formatPrice, totalOrders }: {
  rows: any[]; formatPrice: (n: number) => string; totalOrders: number;
}) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return (
    <Panel title="Orders by status" action={<span className="text-[11px] text-gray-400 tabular-nums">{totalOrders} all time</span>}>
      {total === 0 ? <Empty>No orders in this period.</Empty> : (
        <div className="flex flex-col gap-3.5">
          {/* One stacked bar reads the mix faster than a row of separate bars. */}
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            {rows.map((r, i) => (
              <div key={r.status} title={`${r.status}: ${r.n}`}
                   className={STATUS_DOT[i % STATUS_DOT.length]}
                   style={{ width: `${(r.n / total) * 100}%` }} />
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={r.status} className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[i % STATUS_DOT.length]}`} />
              <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wide border capitalize shrink-0 ${ORDER_STATUS_STYLE[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {r.status}
              </span>
              <span className="text-[11px] text-gray-400 tabular-nums">{r.n}</span>
              <span className="ms-auto text-[12px] font-semibold text-gray-900 tabular-nums whitespace-nowrap">{formatPrice(r.total)}</span>
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
      {rows.length === 0 ? <AllClear>Every published product has stock.</AllClear> : (
        <div className="flex flex-col">
          {rows.slice(0, 6).map((r) => (
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

function RecentOrders({ rows, formatPrice, totals }: {
  rows: any[]; formatPrice: (n: number) => string; totals: any;
}) {
  return (
    <Panel
      title="Latest orders"
      action={
        <span className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-3 text-[11px] text-gray-400 tabular-nums">
            <span className="flex items-center gap-1" title="Products"><Package size={12} /> {totals.products}</span>
            <span className="flex items-center gap-1" title="Customers"><Users size={12} /> {totals.customers}</span>
          </span>
          <PanelLink to="/admin/orders">All orders</PanelLink>
        </span>
      }
      bodyClass="p-0"
    >
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
