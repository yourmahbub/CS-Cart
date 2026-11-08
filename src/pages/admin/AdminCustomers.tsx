import React, { useState } from 'react';
import { Eye, Search, Filter, ArrowDownToLine, MoreHorizontal, User, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';

// Mock customers data
const initialCustomers = [
  { id: '#CUST-1029', name: 'Alex Johnson', email: 'alex.j@example.com', phone: '+1 (555) 123-4567', date: 'Oct 24, 2023', orders: 12, spent: '$4,299.00', status: 'active' },
  { id: '#CUST-1030', name: 'Sarah Williams', email: 'sarah.w@example.com', phone: '+1 (555) 987-6543', date: 'Oct 24, 2023', orders: 3, spent: '$1,349.50', status: 'active' },
  { id: '#CUST-1031', name: 'Michael Brown', email: 'm.brown@example.com', phone: '+1 (555) 456-7890', date: 'Oct 25, 2023', orders: 1, spent: '$89.99', status: 'inactive' },
  { id: '#CUST-1032', name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1 (555) 234-5678', date: 'Oct 25, 2023', orders: 5, spent: '$1,450.00', status: 'active' },
  { id: '#CUST-1033', name: 'James Wilson', email: 'j.wilson@example.com', phone: '+1 (555) 345-6789', date: 'Oct 26, 2023', orders: 2, spent: '$2,199.99', status: 'active' },
];

export default function AdminCustomers() {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-full aspect-auto h-full">
       <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customers Directory</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and view customer profiles and histories.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search customers..." 
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
                   <th className="px-8 py-4 font-bold">Customer Info</th>
                   <th className="px-6 py-4 font-bold">Contact</th>
                   <th className="px-6 py-4 font-bold">Joined</th>
                   <th className="px-6 py-4 font-bold">Orders</th>
                   <th className="px-6 py-4 font-bold">Total Spent</th>
                   <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-8 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                             {customer.name.charAt(0)}
                           </div>
                           <div>
                             <div className="font-bold text-gray-900">{customer.name}</div>
                             <div className="text-xs text-[#00a651] font-mono mt-0.5">{customer.id}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                            <Mail size={14} className="text-gray-400" />
                            {customer.email}
                         </div>
                         <div className="flex items-center gap-1.5 text-gray-500 text-xs text-gray-400">
                            <Phone size={14} className="text-gray-400" />
                            {customer.phone}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-gray-500">
                         <div className="flex items-center gap-1.5">
                           <Calendar size={14} className="text-gray-400" />
                           {customer.date}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 font-medium text-gray-900">
                           <ShoppingBag size={14} className="text-gray-400" />
                           {customer.orders}
                         </div>
                       </td>
                       <td className="px-6 py-4 font-bold text-gray-900">
                         {customer.spent}
                       </td>
                       <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip content="View Profile" position="top">
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
                      No customers found matching "{search}"
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
       <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
             Showing <span className="font-medium text-gray-900">{filteredCustomers.length}</span> results
          </div>
          <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
       </div>
    </div>
  );
}
