import React, { useState } from 'react';
import { Eye, Search, Filter, ArrowDownToLine, MoreHorizontal, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';

// Mock orders data
const initialOrders = [
  { id: '#ORD-7352', date: 'Oct 24, 2023', customer: 'Alex Johnson', email: 'alex.j@example.com', total: '$1,299.00', status: 'delivered', items: 2 },
  { id: '#ORD-7353', date: 'Oct 24, 2023', customer: 'Sarah Williams', email: 'sarah.w@example.com', total: '$349.50', status: 'processing', items: 3 },
  { id: '#ORD-7354', date: 'Oct 25, 2023', customer: 'Michael Brown', email: 'm.brown@example.com', total: '$89.99', status: 'shipped', items: 1 },
  { id: '#ORD-7355', date: 'Oct 25, 2023', customer: 'Emily Davis', email: 'emily.d@example.com', total: '$450.00', status: 'cancelled', items: 2 },
  { id: '#ORD-7356', date: 'Oct 26, 2023', customer: 'James Wilson', email: 'j.wilson@example.com', total: '$2,199.99', status: 'processing', items: 5 },
  { id: '#ORD-7357', date: 'Oct 26, 2023', customer: 'Olivia Moore', email: 'olivia.m@example.com', total: '$149.00', status: 'delivered', items: 1 },
];

export default function AdminOrders() {
  const [orders] = useState(initialOrders);
  const [search, setSearch] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12} /> Delivered</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock size={12} /> Processing</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Truck size={12} /> Shipped</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-full aspect-auto h-full">
       <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage customer orders.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <Tooltip content="Filter" position="top">
               <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <Filter size={18} />
               </button>
             </Tooltip>
             <Tooltip content="Export CSV" position="top">
               <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <ArrowDownToLine size={18} />
               </button>
             </Tooltip>
          </div>
       </div>

       <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                   <th className="px-8 py-4 font-bold">Order ID</th>
                   <th className="px-6 py-4 font-bold">Date</th>
                   <th className="px-6 py-4 font-bold">Customer</th>
                   <th className="px-6 py-4 font-bold">Status</th>
                   <th className="px-6 py-4 font-bold">Total</th>
                   <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-8 py-4 font-mono font-medium text-[#00a651]">{order.id}</td>
                       <td className="px-6 py-4 text-gray-500">{order.date}</td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-gray-900">{order.customer}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{order.email}</div>
                       </td>
                       <td className="px-6 py-4">
                         {getStatusBadge(order.status)}
                       </td>
                       <td className="px-6 py-4 font-medium text-gray-900">
                         {order.total}
                         <div className="text-xs text-gray-500 font-normal">{order.items} items</div>
                       </td>
                       <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip content="View Details" position="top">
                               <button className="p-2 border border-gray-200 text-gray-600 hover:text-[#00a651] hover:bg-[#00a651]/10 hover:border-[#00a651]/30 rounded-lg transition-colors shadow-sm bg-white">
                                 <Eye size={16} />
                               </button>
                             </Tooltip>
                             <Tooltip content="More actions" position="top">
                               <button className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors shadow-sm bg-white">
                                 <MoreHorizontal size={16} />
                               </button>
                             </Tooltip>
                          </div>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                      No orders found matching "{search}"
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
       <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
             Showing <span className="font-medium text-gray-900">{filteredOrders.length}</span> results
          </div>
          <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
       </div>
    </div>
  );
}
