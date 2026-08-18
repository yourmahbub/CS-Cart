import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Users, Package, MessageSquare, DollarSign, ArrowRight, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';

export default function AdminDashboard() {
  const { formatPrice } = useCart();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>('/admin/stats').then(setStats).catch(() => setStats(null));
    api.get<{ orders: any[] }>('/admin/orders').then((d) => setOrders(d.orders.slice(0, 6))).catch(() => setOrders([]));
  }, []);

  if (!stats) {
    return (
      <div className="py-20 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  const cards = [
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, tone: 'bg-green-50 text-green-600' },
    {
      label: `Profit${stats.margin ? ` · ${stats.margin}% margin` : ''}`,
      value: formatPrice(stats.profit ?? 0),
      icon: TrendingUp,
      tone: (stats.profit ?? 0) < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
    },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, tone: 'bg-blue-50 text-blue-600', to: '/admin/orders' },
    { label: 'Customers', value: stats.customers, icon: Users, tone: 'bg-purple-50 text-purple-600', to: '/admin/customers' },
    { label: 'Products', value: stats.products, icon: Package, tone: 'bg-orange-50 text-orange-600', to: '/admin/products' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          const body = (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors h-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.tone}`}>
                <Icon size={19} />
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{c.value}</div>
              <div className="text-[13px] text-gray-500">{c.label}</div>
            </div>
          );
          return c.to ? <Link key={c.label} to={c.to}>{body}</Link> : <div key={c.label}>{body}</div>;
        })}
      </div>

      {stats.productsWithoutCost > 0 && (
        <Link to="/admin/products"
          className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 hover:border-amber-300">
          <span className="flex items-center gap-2.5 text-[14px] text-amber-900">
            <AlertTriangle size={18} />
            <span>
              <b>{stats.productsWithoutCost}</b> product(s) have no cost price — their sales count as pure profit,
              so the figure above is overstated.
            </span>
          </span>
          <ArrowRight size={18} className="text-amber-700 shrink-0" />
        </Link>
      )}

      {stats.pendingReviews > 0 && (
        <Link to="/admin/reviews"
          className="flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 hover:border-yellow-300">
          <span className="flex items-center gap-2.5 text-[14px] text-yellow-800">
            <MessageSquare size={18} />
            <span><b>{stats.pendingReviews}</b> review(s) awaiting approval</span>
          </span>
          <ArrowRight size={18} className="text-yellow-700" />
        </Link>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-[13px] font-semibold text-[#00a651] hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-12 text-center text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3.5 font-medium text-gray-900">{o.number}</td>
                  <td className="px-6 py-3.5 text-gray-600">{o.shippingAddress?.fullName || o.email}</td>
                  <td className="px-6 py-3.5 text-gray-500 capitalize">{o.status}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
