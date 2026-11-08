import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Menu as MenuIcon, FileText, Image as ImageIcon, Settings, LogOut, Store, Search, Bell, LayoutTemplate, Layers, ShoppingCart, Users, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Tooltip } from '../../components/Tooltip';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    siteSettings, 
    products, 
    orders, 
    categories, 
    notifications = [], 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    clearNotifications,
    simulateNewOrder 
  } = useAdmin();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Header interactive dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [orderSimulatedToast, setOrderSimulatedToast] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  const unreadNotifsCount = notifications.filter((n: any) => !n.read).length;

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

  // Close dropdowns on route change or click outside
  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K shortcut to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Overview';
    const path = location.pathname.split('/').pop() || '';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Search results calculation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], orders: [], pages: [], nav: [] };

    const matchedProducts = products.filter((p: any) => 
      p.title?.toLowerCase().includes(q) || 
      p.code?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedOrders = orders.filter((o: any) => 
      o.id?.toLowerCase().includes(q) || 
      o.customer?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedNav = nav.filter((n: any) => 
      n.name.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      products: matchedProducts,
      orders: matchedOrders,
      nav: matchedNav,
      total: matchedProducts.length + matchedOrders.length + matchedNav.length
    };
  }, [searchQuery, products, orders, nav]);

  const handleSimulateOrder = () => {
    simulateNewOrder();
    setOrderSimulatedToast(true);
    setTimeout(() => setOrderSimulatedToast(false), 3500);
  };

  return (
    <div className="h-screen bg-white flex font-sans text-gray-900 overflow-hidden relative">
      {/* Toast Alert for Simulated Order */}
      {orderSimulatedToast && (
        <div className="fixed top-5 right-5 z-[9999] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-[#00a651] text-white flex items-center justify-center font-bold">✓</div>
          <div>
            <div className="text-sm font-bold">Live Order Received!</div>
            <div className="text-xs text-gray-300">Revenue and order analytics have been updated.</div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Advanced Glass/Minimal UI */}
      <aside className={`bg-white border-r border-gray-200/70 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] fixed md:relative h-full ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Floating Toggle Button (Desktop Only) */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)} 
           title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           className="hidden md:flex absolute -right-3.5 top-9 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:shadow transition-all z-50 focus:outline-none cursor-pointer"
        >
           {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* Logo */}
        <div className={`h-[88px] flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
           <Link to="/admin" className="flex items-center overflow-hidden group">
             <div className={`w-9 h-9 rounded-xl bg-[#00a651] flex items-center justify-center shrink-0 shadow-sm shadow-[#00a651]/20 transition-all duration-300 ${!isCollapsed ? 'mr-3' : ''}`}>
               <Store className="text-white" size={18} strokeWidth={2.5} />
             </div>
             <div className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                <span className="font-bold text-[19px] tracking-tight text-gray-900 truncate block">
                   {siteSettings?.logoText || 'MegaStore'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block -mt-0.5">Control Panel</span>
             </div>
           </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-2 flex flex-col px-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
           {nav.map((item) => {
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
         {/* Top Header */}
         <header className="h-[88px] bg-white flex items-center justify-between px-6 sm:px-10 shrink-0 z-30 sticky top-0 border-b border-gray-200/60 shadow-xs">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 border border-gray-200 rounded-xl text-gray-700 md:hidden hover:bg-gray-50"
                title="Open menu"
              >
                <MenuIcon size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                   {getPageTitle()}
                </h1>
                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                  MegaStore Control Center & Analytics
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
               {/* Search Everywhere Input with Interactive Dropdown */}
               <div className="relative" ref={searchContainerRef}>
                  <div className="relative hidden md:block">
                     <Search className="w-[18px] h-[18px] text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                     <input 
                       ref={searchInputRef}
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => {
                         setSearchQuery(e.target.value);
                         setSearchOpen(true);
                       }}
                       onFocus={() => setSearchOpen(true)}
                       placeholder="Search everywhere... (Cmd+K)" 
                       className="pl-11 pr-10 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] w-72 lg:w-80 bg-white transition-all placeholder:text-gray-400 shadow-sm shadow-gray-100/50 hover:border-gray-300" 
                     />
                     {searchQuery && (
                       <button 
                         onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded bg-gray-100"
                       >
                         ✕
                       </button>
                     )}
                  </div>

                  {/* Search Results Dropdown Panel */}
                  {searchOpen && searchQuery.trim().length > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500">
                        <span>Search Results for "{searchQuery}"</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                          {searchResults.total} matches
                        </span>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
                        {/* Products Matches */}
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">Products</div>
                            <div className="space-y-1">
                              {searchResults.products.map((p: any) => (
                                <Link 
                                  key={p.id} 
                                  to="/admin/products"
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                                    <img src={p.image} alt={p.title} className="w-full h-full object-contain mix-blend-multiply" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#00a651]">{p.title}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                      <span className="font-mono">{p.code}</span>
                                      <span>·</span>
                                      <span className="font-bold text-gray-900">${p.price}</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Orders Matches */}
                        {searchResults.orders.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">Orders</div>
                            <div className="space-y-1">
                              {searchResults.orders.map((o: any) => (
                                <Link 
                                  key={o.id} 
                                  to="/admin/orders"
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 group-hover:text-[#00a651] font-mono">{o.id}</div>
                                    <div className="text-xs text-gray-500">{o.customer} · {o.email}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900">${typeof o.total === 'number' ? o.total.toFixed(2) : o.total}</div>
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{o.status}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Navigation Matches */}
                        {searchResults.nav.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">Admin Sections</div>
                            <div className="space-y-1">
                              {searchResults.nav.map((n: any) => (
                                <Link 
                                  key={n.path}
                                  to={n.path}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 hover:text-[#00a651]"
                                >
                                  <n.icon size={16} />
                                  <span>{n.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchResults.total === 0 && (
                          <div className="py-8 text-center text-sm text-gray-500">
                            No matching products, orders, or pages found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
               </div>

               {/* Notifications Center Popover */}
               <div className="relative" ref={notifContainerRef}>
                 <Tooltip content={`Notifications (${unreadNotifsCount} unread)`} position="bottom">
                   <button 
                     onClick={() => setNotificationsOpen(!notificationsOpen)}
                     className={`relative w-11 h-11 rounded-2xl bg-white text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center border shadow-xs cursor-pointer ${
                       notificationsOpen ? 'border-[#00a651] ring-2 ring-[#00a651]/20' : 'border-gray-200 hover:border-gray-300'
                     }`}
                   >
                      <Bell size={20} />
                      {unreadNotifsCount > 0 && (
                        <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                          {unreadNotifsCount}
                        </span>
                      )}
                   </button>
                 </Tooltip>

                 {/* Notifications Dropdown Panel */}
                 {notificationsOpen && (
                   <div className="absolute right-0 top-full mt-3 w-[360px] sm:w-[400px] bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                     <div className="p-4 bg-gray-50 flex items-center justify-between">
                       <div>
                         <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                         <p className="text-xs text-gray-500 mt-0.5">{unreadNotifsCount} unread store updates</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {unreadNotifsCount > 0 && (
                           <button 
                             onClick={markAllNotificationsAsRead}
                             className="text-xs font-semibold text-[#00a651] hover:underline cursor-pointer"
                           >
                             Mark all read
                           </button>
                         )}
                         <button 
                           onClick={clearNotifications}
                           className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                           title="Clear all"
                         >
                           Clear
                         </button>
                       </div>
                     </div>

                     <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                       {notifications.length > 0 ? (
                         notifications.map((notif: any) => (
                           <div 
                             key={notif.id}
                             onClick={() => {
                               markNotificationAsRead(notif.id);
                               if (notif.type === 'order') navigate('/admin/orders');
                               if (notif.type === 'stock') navigate('/admin/products');
                               if (notif.type === 'review') navigate('/admin/reviews');
                               setNotificationsOpen(false);
                             }}
                             className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                               !notif.read ? 'bg-emerald-50/30' : ''
                             }`}
                           >
                             <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                               notif.type === 'order' ? 'bg-blue-50 text-blue-600' :
                               notif.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                               notif.type === 'review' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                             }`}>
                               {notif.type === 'order' && <ShoppingCart size={18} />}
                               {notif.type === 'stock' && <Package size={18} />}
                               {notif.type === 'review' && <MessageSquare size={18} />}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between gap-2">
                                 <h4 className="text-sm font-bold text-gray-900 truncate">{notif.title}</h4>
                                 <span className="text-[11px] text-gray-400 shrink-0">{notif.time}</span>
                               </div>
                               <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                             </div>
                             {!notif.read && (
                               <div className="w-2 h-2 rounded-full bg-[#00a651] shrink-0 mt-2"></div>
                             )}
                           </div>
                         ))
                       ) : (
                         <div className="py-12 text-center text-sm text-gray-500">
                           No notifications at this time.
                         </div>
                       )}
                     </div>

                     <div className="p-3 bg-gray-50/80 text-center">
                       <button 
                         onClick={handleSimulateOrder}
                         className="text-xs font-bold text-[#00a651] hover:text-[#008c44] flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer"
                       >
                         <span>⚡ Simulate Customer Order for Live Test</span>
                       </button>
                     </div>
                   </div>
                 )}
               </div>

               <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

               {/* Admin Profile with Interactive Dropdown */}
               <div className="relative" ref={profileContainerRef}>
                 <div 
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="flex items-center gap-3 cursor-pointer group p-1 rounded-2xl hover:bg-gray-50 transition-colors"
                 >
                   <div className="text-right hidden sm:block">
                     <div className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-[#00a651] transition-colors">Admin User</div>
                     <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Store Owner</div>
                   </div>
                   <div className="w-11 h-11 rounded-2xl border border-gray-200 overflow-hidden shadow-xs group-hover:border-[#00a651] group-hover:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] transition-all">
                     <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-full h-full object-cover" />
                   </div>
                 </div>

                 {/* Profile Dropdown Panel */}
                 {profileOpen && (
                   <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                     <div className="p-4 bg-gray-50">
                       <div className="font-bold text-sm text-gray-900">Admin User</div>
                       <div className="text-xs text-gray-500 mt-0.5">store.owner@megastore.com</div>
                       <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Super Administrator
                       </div>
                     </div>

                     <div className="p-2 space-y-1">
                       <Link 
                         to="/admin/settings" 
                         onClick={() => setProfileOpen(false)}
                         className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                       >
                         <Settings size={16} className="text-gray-400" />
                         <span>Store Settings</span>
                       </Link>
                       <Link 
                         to="/admin/orders" 
                         onClick={() => setProfileOpen(false)}
                         className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                       >
                         <ShoppingCart size={16} className="text-gray-400" />
                         <span>Manage Orders</span>
                       </Link>
                       <Link 
                         to="/admin/products" 
                         onClick={() => setProfileOpen(false)}
                         className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                       >
                         <Package size={16} className="text-gray-400" />
                         <span>Inventory Catalog</span>
                       </Link>
                       <button
                         onClick={() => {
                           handleSimulateOrder();
                           setProfileOpen(false);
                         }}
                         className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#00a651] rounded-xl hover:bg-[#00a651]/10 transition-colors text-left cursor-pointer"
                       >
                         <span>⚡ Create Test Live Order</span>
                       </button>
                     </div>

                     <div className="p-2">
                       <Link 
                         to="/" 
                         onClick={() => setProfileOpen(false)}
                         className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                       >
                         <Store size={16} className="text-gray-400" />
                         <span>Back to Live Store</span>
                       </Link>
                     </div>
                   </div>
                 )}
               </div>
            </div>
         </header>

         {/* Content Viewport */}
         <div className="flex-1 overflow-auto bg-gray-50/50 p-4 sm:p-8 lg:p-10" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-[1500px] mx-auto w-full pb-10">
               <Outlet />
            </div>
         </div>
      </main>
    </div>
  );
}
