import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Package, Menu, FileText, Image, DollarSign, Users, ShoppingCart, TrendingUp, MoreVertical, ArrowRight, Settings, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const salesData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 2400 },
  { name: 'Fri', total: 2800 },
  { name: 'Sat', total: 3200 },
  { name: 'Sun', total: 3900 },
];

const trafficData = [
  { name: 'Week 1', visitors: 4000 },
  { name: 'Week 2', visitors: 4500 },
  { name: 'Week 3', visitors: 5100 },
  { name: 'Week 4', visitors: 6800 },
];

export default function AdminDashboard() {
  const { products, menuItems, pages, sliders } = useAdmin();

  const fakeStats = [
    { title: 'Total Revenue', value: '$24,562.00', icon: DollarSign, trend: '+12.5%', color: 'text-[#00a651]', bg: 'bg-[#00a651]/10' },
    { title: 'Orders', value: '456', icon: ShoppingCart, trend: '+5.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Visitors', value: '12,431', icon: Users, trend: '+18.4%', color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Active Products', value: products.length, icon: Package, trend: '0%', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
       {/* Dashboard Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
           <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
         </div>
         <div className="flex items-center gap-3">
           <Link to="/admin/settings" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
             <Settings size={16} /> Manage Store
           </Link>
           <Link to="/" target="_blank" className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
             View Live Store <ExternalLink size={16} />
           </Link>
         </div>
       </div>

       {/* Top Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fakeStats.map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4 transform transition-transform hover:-translate-y-1 hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-start">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                      <stat.icon size={24} />
                   </div>
                   <div className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {stat.trend.startsWith('+') && <TrendingUp size={12} />}
                      {stat.trend}
                   </div>
                </div>
                <div className="mt-2">
                   <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
                   <p className="text-sm text-gray-500 font-semibold">{stat.title}</p>
                </div>
             </div>
          ))}
       </div>

       {/* Charts Row */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col min-h-[400px]">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Sales performance over the last 7 days</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"><MoreVertical size={20} /></button>
             </div>
             <div className="flex-1 w-full relative">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00a651" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#00a651" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} tickFormatter={(val) => `$${val}`} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                         itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '16px' }}
                         labelStyle={{ color: '#64748b', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}
                         formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                       />
                       <Area type="monotone" dataKey="total" stroke="#00a651" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                     </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col min-h-[400px]">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Store Traffic</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Monthly visitors</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"><MoreVertical size={20} /></button>
             </div>
             <div className="flex-1 w-full relative">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={trafficData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} />
                       <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                       />
                       <Bar dataKey="visitors" fill="#0f172a" radius={[6, 6, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
       </div>

       {/* Store Control Panels */}
       <div className="mb-4">
         <h2 className="text-xl font-bold text-gray-900 mb-6 px-1">Quick Actions</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/admin/menu" className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-start hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all cursor-pointer block group">
               <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Menu size={28} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Navigation</h3>
               <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">Manage header links and mega menu layout for your storefront.</p>
               <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-blue-600 font-bold text-sm">Manage Menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </div>
            </Link>
            
            <Link to="/admin/sliders" className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-start hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all cursor-pointer block group">
               <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Image size={28} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Promo Sliders</h3>
               <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">Update hero banners on the homepage to highlight new campaigns.</p>
               <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-purple-600 font-bold text-sm">Manage Sliders</span>
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </div>
            </Link>

            <Link to="/admin/pages" className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-start hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all cursor-pointer block group">
               <div className="w-14 h-14 rounded-2xl bg-[#00a651]/10 text-[#00a651] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <FileText size={28} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Static Pages</h3>
               <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">Edit content for About Us, Delivery, Terms, and other informational pages.</p>
               <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-[#00a651] font-bold text-sm">Manage Pages</span>
                  <div className="w-8 h-8 rounded-full bg-[#00a651]/10 text-[#00a651] flex items-center justify-center group-hover:bg-[#00a651] group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </div>
            </Link>

            <Link to="/admin/home-builder" className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-start hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gray-200 transition-all cursor-pointer block group">
               <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Package size={28} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Dynamic Controller</h3>
               <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">Reorder and toggle sections displayed on the storefront home page.</p>
               <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-orange-600 font-bold text-sm">Home Builder</span>
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </div>
            </Link>
         </div>
       </div>
    </div>
  )
}
