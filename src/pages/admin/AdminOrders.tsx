import React, { useEffect, useMemo, useState } from 'react';
import { Search, Package, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded', 'failed'];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<any>(null);

  const load = () =>
    api.get<{ orders: any[] }>('/admin/orders')
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matches = !q || o.number.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q);
      return matches && (statusFilter === 'all' || o.status === statusFilter);
    });
  }, [orders, search, statusFilter]);

  const setStatus = async (id: number, status: string) => {
    try {
      const { order } = await api.put<{ order: any }>(`/admin/orders/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? order : o)));
      setViewing((v: any) => (v && v.id === id ? order : v));
    } catch (err: any) {
      alert(err?.message ?? 'Could not update the order.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">{orders.length} order(s) placed.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00a651]" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#00a651]">
            <option value="all">All status</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setViewing(o)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{o.number}</div>
                    <div className="text-xs text-gray-500">{new Date(o.createdAt.replace(' ', 'T') + 'Z').toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{o.shippingAddress?.fullName || '—'}</div>
                    <div className="text-xs text-gray-500">{o.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{o.items.length}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(o.total)}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {o.paymentMethod} · <span className="capitalize">{o.paymentStatus}</span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize outline-none cursor-pointer ${STATUS_STYLE[o.status]}`}>
                      {STATUSES.map((s) => <option key={s} value={s} className="capitalize bg-white text-gray-900">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Order {viewing.number}</h3>
                <p className="text-[12px] text-gray-500">{new Date(viewing.createdAt.replace(' ', 'T') + 'Z').toLocaleString()}</p>
              </div>
              <button onClick={() => setViewing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-4 text-[13px]">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Customer</div>
                  <div className="text-gray-600">{viewing.shippingAddress?.fullName}</div>
                  <div className="text-gray-600">{viewing.email}</div>
                  {viewing.phone && <div className="text-gray-600">{viewing.phone}</div>}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Ship to</div>
                  <div className="text-gray-600 leading-relaxed">
                    {viewing.shippingAddress?.line1}<br />
                    {viewing.shippingAddress?.line2 && <>{viewing.shippingAddress.line2}<br /></>}
                    {viewing.shippingAddress?.city} {viewing.shippingAddress?.postcode}<br />
                    {viewing.shippingAddress?.country}
                  </div>
                </div>
              </div>

              {viewing.note && (
                <div className="text-[13px]">
                  <div className="font-semibold text-gray-900 mb-1">Note</div>
                  <p className="text-gray-600">{viewing.note}</p>
                </div>
              )}

              <div>
                <div className="font-semibold text-gray-900 mb-2 text-[13px]">Items</div>
                <div className="flex flex-col gap-2">
                  {viewing.items.map((it: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2">
                      <div className="w-10 h-10 shrink-0 p-1">
                        {it.image && <img src={it.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-gray-900 line-clamp-1">{it.title}</div>
                        <div className="text-[11px] text-gray-500">
                          {Object.values(it.options || {}).filter(Boolean).join(' · ')} × {it.quantity}
                        </div>
                      </div>
                      <div className="text-[13px] font-semibold">{formatPrice(it.unitPrice * it.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-1 text-[13px]">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(viewing.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatPrice(viewing.shipping)}</span></div>
                {viewing.tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(viewing.tax)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 text-[15px] pt-1"><span>Total</span><span>{formatPrice(viewing.total)}</span></div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
              <select value={viewing.status} onChange={(e) => setStatus(viewing.id, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm capitalize">
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <button onClick={() => setViewing(null)} className="px-4 py-2 text-sm font-medium text-white bg-[#00a651] rounded-lg hover:bg-[#008c44]">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
