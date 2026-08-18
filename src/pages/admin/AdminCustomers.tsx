import React, { useEffect, useState, useMemo } from 'react';
import { Search, Users, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';

export default function AdminCustomers() {
  const { formatPrice } = useCart();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<{ customers: any[] }>('/admin/customers')
      .then((d) => setCustomers(d.customers))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [customers, search]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">{customers.length} registered account(s).</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00a651]" />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading customers…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          No customers yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Spent</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    {c.name}
                    {c.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00a651] bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">
                        <ShieldCheck size={10} /> ADMIN
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-600">{c.orders}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(c.spent)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(c.created_at.replace(' ', 'T') + 'Z').toLocaleDateString()}
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
