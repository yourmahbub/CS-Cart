import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Loader2, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { ORDER_STATUSES, ORDER_STATUS_STYLE, formatOrderDate } from '../../lib/orderStatus';

export default function AdminOrders() {
  const { formatPrice } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
            {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
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
                <th className="px-6 py-4 w-10"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 cursor-pointer group" onClick={() => navigate(`/admin/orders/${o.number}`)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{o.number}</div>
                    <div className="text-xs text-gray-500">{formatOrderDate(o.createdAt)}</div>
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
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize outline-none cursor-pointer ${ORDER_STATUS_STYLE[o.status]}`}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize bg-white text-gray-900">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-300 group-hover:text-[#00a651] transition-colors">
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
