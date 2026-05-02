import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Menu as MenuIcon, FileText, Image as ImageIcon, Settings, LogOut, Store, Search, Bell, LayoutTemplate, Layers, ShoppingCart, Users, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Tooltip } from '../../components/Tooltip';

export default function AdminLayout() {
  const location = useLocation();
  const { siteSettings } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Product Template', path: '/admin/page-builder', icon: LayoutTemplate },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Home Layout', path: '/admin/home-builder', icon: LayoutTemplate },
    { name: 'Menu', path: '/admin/menu', icon: MenuIcon },
    { name: 'Pages', path: '/admin/pages', icon: FileText },
    { name: 'Sliders', path: '/admin/sliders', icon: ImageIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Overview';
    const path = location.pathname.split('/').pop() || '';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="h-screen bg-white flex font-sans text-gray-900 overflow-hidden">
      {/* Sidebar - Advanced Unique Glass/Minimal UI */}
      <aside className={`bg-white border-r border-gray-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col hidden md:flex shrink-0 z-20 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Floating Toggle Button */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)} 
           className="absolute -right-3.5 top-9 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:shadow transition-all z-50 focus:outline-none"
        >
           {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* Logo */}
        <div className={`h-[88px] flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
           <div className={`flex items-center overflow-hidden`}>
             <div className={`w-9 h-9 rounded-xl bg-[#00a651] flex items-center justify-center shrink-0 shadow-sm shadow-[#00a651]/20 transition-all duration-300 ${!isCollapsed ? 'mr-3' : ''}`}>
               <Store className="text-white" size={18} strokeWidth={2.5} />
             </div>
             <span className={`font-bold text-[19px] tracking-tight text-gray-900 truncate transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {siteSettings.logoText}
             </span>
           </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-2 flex flex-col px-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
           {nav.map((item, index) => {
             const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
             const Icon = item.icon;
             
             return (
               <Tooltip key={item.path} content={isCollapsed ? item.name : ''} position="right" disabled={!isCollapsed}>
                 <Link
                   to={item.path}
                   className={`flex items-center rounded-2xl text-[14px] font-semibold transition-all duration-200 group w-full mb-1.5 ${
                     isActive ? 'bg-[#00a651] text-white shadow-[0_4px_12px_rgba(0,166,81,0.25)]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                   } ${isCollapsed ? 'justify-center p-3 aspect-square' : 'px-3.5 py-3'}`}
                 >
                   <div className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${isCollapsed ? '' : 'w-7 mr-3'} ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                     <Icon size={isCollapsed ? 20 : 18} strokeWidth={isActive ? 2.5 : 2.2} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#00a651]/80 drop-shadow-sm'} />
                   </div>
                   
                   {!isCollapsed && <span className="truncate tracking-wide">{item.name}</span>}
                 </Link>
               </Tooltip>
             )
           })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 mt-auto border-t border-gray-100/50">
           <Tooltip content={isCollapsed ? 'Exit to Store' : ''} position="right" disabled={!isCollapsed}>
             <Link to="/" className={`flex items-center rounded-2xl text-[14px] font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group w-full border border-transparent ${isCollapsed ? 'justify-center p-3 aspect-square' : 'px-3.5 py-3'}`}>
                <div className={`flex items-center justify-center shrink-0 transition-transform ${isCollapsed ? '' : 'w-7 mr-3'}`}>
                  <LogOut size={isCollapsed ? 20 : 18} strokeWidth={2.2} className="text-gray-400 group-hover:text-red-500" />
                </div>
                {!isCollapsed && <span className="truncate tracking-wide">Exit to Store</span>}
             </Link>
           </Tooltip>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
         <header className="h-[88px] bg-white flex items-center justify-between px-10 shrink-0 z-10 sticky top-0 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                 {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="relative hidden md:block">
                  <Search className="w-[18px] h-[18px] text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search everywhere..." className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] w-72 bg-white transition-all placeholder:text-gray-400 shadow-sm shadow-gray-100/50 hover:border-gray-300" />
               </div>
               <Tooltip content="Notifications (2)" position="bottom">
                 <button className="relative w-11 h-11 rounded-2xl bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors flex items-center justify-center border border-gray-200 shadow-sm shadow-gray-100/50 group">
                    <Bell size={20} className="group-hover:animate-pulse" />
                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                 </button>
               </Tooltip>
               <div className="h-8 w-px bg-gray-200 mx-2"></div>
               <div className="flex items-center gap-3.5 cursor-pointer group">
                 <div className="text-right hidden sm:block">
                   <div className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-[#00a651] transition-colors">Admin User</div>
                   <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1.5">Store Owner</div>
                 </div>
                 <div className="w-11 h-11 rounded-2xl border border-gray-200 overflow-hidden shadow-sm shadow-gray-100/50 group-hover:border-[#00a651] group-hover:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] transition-all">
                   <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-full h-full object-cover" />
                 </div>
               </div>
            </div>
         </header>
         <div className="flex-1 overflow-auto bg-white p-10" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-[1400px] mx-auto w-full pb-10">
               <Outlet />
            </div>
         </div>
      </main>
    </div>
  );
}
