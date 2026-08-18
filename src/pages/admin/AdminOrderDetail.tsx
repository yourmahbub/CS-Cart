import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Printer, Mail, Phone, MapPin, StickyNote } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { computeMargin } from '../../lib/pricing';
import {
  ORDER_STATUSES, ORDER_STATUS_STYLE, PAYMENT_STATUSES, formatOrderDate,
} from '../../lib/orderStatus';

/**
 * One order, on its own page rather than in a dialog, so it can be linked to,
 * refreshed, opened in a new tab and printed.
 */
export default function AdminOrderDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get<{ order: any }>(`/admin/orders/${encodeURIComponent(String(number))}`)
      .then((d) => { if (!cancelled) setOrder(d.order); })
      .catch((err: any) => { if (!cancelled) setError(err?.message ?? 'That order could not be loaded.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [number]);

  const update = async (patch: { status?: string; paymentStatus?: string }) => {
    if (!order) return;
    setSaving(true);
    try {
      const { order: next } = await api.put<{ order: any }>(`/admin/orders/${order.id}`, patch);
      // The update endpoint does not recompute cost, so keep what we loaded.
      setOrder((prev: any) => ({ ...prev, ...next }));
    } catch (err: any) {
      setError(err?.message ?? 'Could not update the order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading order…
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-lg mx-auto my-16 text-center">
        <Package className="w-10 h-10 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Order not found</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
      </div>
    );
  }

  const address = order.shippingAddress ?? {};
  const margin = computeMargin(order.subtotal, order.cost);

  return (
    <div className="max-w-5xl mx-auto my-6 flex flex-col gap-6 print:my-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            aria-label="Back to orders"
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order {order.number}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Placed {formatOrderDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${ORDER_STATUS_STYLE[order.status] ?? ''}`}>
            {order.status}
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm print:hidden">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items and totals */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Panel title={`Items (${order.items?.length ?? 0})`}>
            <div className="flex flex-col divide-y divide-gray-100">
              {(order.items ?? []).map((it: any, i: number) => {
                const options = Object.values(it.options || {}).filter(Boolean).join(' · ');
                return (
                  <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 shrink-0 border border-gray-100 rounded-lg p-1.5">
                      {it.image
                        ? <img src={it.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        : <Package className="w-full h-full text-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {it.productId ? (
                        <Link to={`/admin/products`} className="text-sm text-gray-900 font-medium hover:text-[#00a651] line-clamp-2">
                          {it.title}
                        </Link>
                      ) : (
                        <div className="text-sm text-gray-900 font-medium line-clamp-2">{it.title}</div>
                      )}
                      <div className="text-[12px] text-gray-500 mt-0.5">
                        {options && <>{options} · </>}{formatPrice(it.unitPrice)} × {it.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatPrice(it.unitPrice * it.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col gap-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Shipping" value={formatPrice(order.shipping)} />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
              {order.discount > 0 && <Row label="Discount" value={`− ${formatPrice(order.discount)}`} />}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100 mt-1.5">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Panel>

          {/* Cost and profit never leave the admin. */}
          <Panel title="Margin" subtitle="Visible to you only — never sent to the storefront.">
            {margin.unknown ? (
              <p className="text-sm text-gray-500">
                No cost price was recorded for these items, so profit cannot be calculated.
                Add a cost price on each product to see it here.
              </p>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                <Stat label="Cost of goods" value={formatPrice(margin.cost)} />
                <Stat label="Profit" value={formatPrice(margin.profit)} tone={margin.loss ? 'bad' : 'good'} />
                <Stat label="Margin" value={`${margin.margin}%`} tone={margin.loss ? 'bad' : 'good'} />
              </div>
            )}
          </Panel>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <Panel title="Status" className="print:hidden">
            <div className="flex flex-col gap-4">
              <Field label="Order status">
                <select
                  value={order.status}
                  disabled={saving}
                  onChange={(e) => update({ status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm capitalize outline-none focus:border-[#00a651] disabled:opacity-60"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </Field>
              <Field label="Payment status">
                <select
                  value={order.paymentStatus}
                  disabled={saving}
                  onChange={(e) => update({ paymentStatus: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm capitalize outline-none focus:border-[#00a651] disabled:opacity-60"
                >
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </Field>
              <div className="text-[12px] text-gray-500">
                Paid by <span className="capitalize font-medium text-gray-700">{order.paymentMethod}</span>
                {order.paymentRef && <> · ref <span className="font-mono">{order.paymentRef}</span></>}
              </div>
            </div>
          </Panel>

          <Panel title="Customer">
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="font-medium text-gray-900">{address.fullName || '—'}</div>
              {order.email && (
                <a href={`mailto:${order.email}`} className="flex items-center gap-2 text-gray-600 hover:text-[#00a651] break-all">
                  <Mail className="w-4 h-4 shrink-0" /> {order.email}
                </a>
              )}
              {order.phone && (
                <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-[#00a651]">
                  <Phone className="w-4 h-4 shrink-0" /> {order.phone}
                </a>
              )}
            </div>
          </Panel>

          <Panel title="Ship to">
            <div className="flex gap-2 text-sm text-gray-600 leading-relaxed">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
              <div>
                {address.line1 && <>{address.line1}<br /></>}
                {address.line2 && <>{address.line2}<br /></>}
                {(address.city || address.postcode) && <>{address.city} {address.postcode}<br /></>}
                {address.country}
              </div>
            </div>
          </Panel>

          {order.note && (
            <Panel title="Customer note">
              <div className="flex gap-2 text-sm text-gray-600">
                <StickyNote className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                <p className="whitespace-pre-line">{order.note}</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Panel({ title, subtitle, children, className = '' }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-gray-600"><span>{label}</span><span>{value}</span></div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[12.5px] font-semibold text-gray-700">{label}</span>
    {children}
  </label>
);

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) => (
  <div className="border border-gray-100 rounded-xl px-4 py-3">
    <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">{label}</div>
    <div className={`text-lg font-bold ${tone === 'bad' ? 'text-red-600' : tone === 'good' ? 'text-[#00a651]' : 'text-gray-900'}`}>
      {value}
    </div>
  </div>
);
