import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Menu as MenuIcon, FileText, Image as ImageIcon, Settings, LogOut, Store, Search, Bell, LayoutTemplate, Layers, ShoppingCart, Users, ChevronLeft, ChevronRight, MessageSquare, SlidersHorizontal, Languages, Check, LayoutPanelTop, X, ChevronDown, Blocks } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { api } from '../../lib/api';
import { useLang } from '../../context/LanguageContext';
import { LANGS } from '../../lib/i18n';
import { Tooltip } from '../../components/Tooltip';

export default function AdminLayout() {
  const location = useLocation();
  const { siteSettings } = useAdmin();
  // The admin panel keeps its own language, independent of the storefront's.
  const { adminLang, setAdminLang, tAdmin } = useLang();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});

  // Collapsed groups persist so the sidebar looks the same next visit.
  const [closedGroups, setClosedGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('admin_nav_closed') || '[]'); } catch { return []; }
  });

  const toggleGroup = (id: string) => {
    setClosedGroups((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try { localStorage.setItem('admin_nav_closed', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Badge counts. Failure is silent — the nav must render regardless.
  useEffect(() => {
    let alive = true;
    const load = () => api.get<Record<string, number>>('/admin/stats')
      .then((d) => { if (alive) setStats(d); })
      .catch(() => {});
    load();
    const timer = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(timer); };
  }, [location.pathname]);

  /**
   * Navigation is grouped by job-to-be-done, not by feature name. Adding a
   * screen means adding one line to the right group — nothing else changes.
   *
   *   badge: key into the stats payload, rendered as a count pill
   */
  const NAV_GROUPS: {
    id: string;
    label: string;
    items: { name: string; path: string; icon: any; badge?: string; end?: boolean }[];
  }[] = [
    {
      id: 'overview',
      label: 'Overview_group',
      items: [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true }],
    },
    {
      id: 'sales',
      label: 'Sales',
      items: [
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, badge: 'pendingOrders' },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare, badge: 'pendingReviews' },
      ],
    },
    {
      id: 'catalog',
      label: 'Catalog',
      items: [
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
      ],
    },
    {
      id: 'storefront',
      label: 'Storefront',
      items: [
        { name: 'Home Layout', path: '/admin/home-builder', icon: LayoutTemplate },
        { name: 'Home Sections', path: '/admin/home-sections', icon: Blocks },
        { name: 'Product Layout', path: '/admin/page-builder', icon: LayoutPanelTop },
        { name: 'Product Page Settings', path: '/admin/product-page', icon: SlidersHorizontal },
        { name: 'Menu', path: '/admin/menu', icon: MenuIcon },
        { name: 'Pages', path: '/admin/pages', icon: FileText },
        { name: 'Sliders', path: '/admin/sliders', icon: ImageIcon },
      ],
    },
    {
      id: 'config',
      label: 'Configuration',
      items: [{ name: 'Settings', path: '/admin/settings', icon: Settings }],
    },
  ];

  const nav = NAV_GROUPS.flatMap((g) => g.items);

  const getPageTitle = () => {
    if (location.pathname === '/admin') return tAdmin('Overview');
    const match = nav.find((n) => n.path === location.pathname);
    if (match) return tAdmin(match.name);
    const path = location.pathname.split('/').pop() || '';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="h-screen bg-white flex font-sans text-gray-900 overflow-hidden">
      {/* Sidebar - Advanced Unique Glass/Minimal UI */}
      <aside className={`bg-white border-e border-gray-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col hidden md:flex shrink-0 z-20 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Floating Toggle Button */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)} 
           className="absolute ltr:-right-3.5 rtl:-left-3.5 top-9 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:shadow transition-all z-50 focus:outline-none"
        >
           {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* Logo */}
        <div className={`h-[88px] flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
           <div className={`flex items-center overflow-hidden`}>
             <div className={`w-9 h-9 rounded-xl bg-[#00a651] flex items-center justify-center shrink-0 shadow-sm shadow-[#00a651]/20 transition-all duration-300 ${!isCollapsed ? 'me-3' : ''}`}>
               <Store className="text-white" size={18} strokeWidth={2.5} />
             </div>
             <span className={`font-bold text-[19px] tracking-tight text-gray-900 truncate transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {siteSettings.logoText}
             </span>
           </div>
        </div>

        {/* Quick jump — filters the whole nav, so the list can grow safely */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder={tAdmin('Jump to…')}
                aria-label={tAdmin('Jump to…')}
                className="w-full ps-9 pe-8 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-[13px] outline-none transition-colors placeholder:text-gray-400"
              />
              {navQuery && (
                <button
                  onClick={() => setNavQuery('')}
                  aria-label="Clear"
                  className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 flex flex-col px-3 overflow-y-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {(() => {
            const q = navQuery.trim().toLowerCase();
            const groups = NAV_GROUPS
              .map((g) => ({
                ...g,
                items: q ? g.items.filter((i) => tAdmin(i.name).toLowerCase().includes(q)) : g.items,
              }))
              .filter((g) => g.items.length > 0);

            if (groups.length === 0) {
              return <p className="px-3 py-6 text-[13px] text-gray-400 text-center">{tAdmin('No matches')}</p>;
            }

            return groups.map((group) => {
              // A search always reveals its results, whatever the saved state.
              const open = !!q || !closedGroups.includes(group.id);

              return (
                <div key={group.id} className="mb-1">
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between px-3 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {tAdmin(group.label)}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${open ? '' : '-rotate-90 rtl:rotate-90'}`}
                      />
                    </button>
                  )}

                  {/* A rule stands in for the group heading when collapsed */}
                  {isCollapsed && group.id !== NAV_GROUPS[0].id && (
                    <div className="h-px bg-gray-100 mx-2 my-2" />
                  )}

                  {(open || isCollapsed) && group.items.map((item) => {
                    const isActive = item.end
                      ? location.pathname === item.path
                      : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    const Icon = item.icon;
                    const count = item.badge ? Number(stats[item.badge]) || 0 : 0;

                    return (
                      <Tooltip
                        key={item.path}
                        content={isCollapsed ? tAdmin(item.name) + (count ? ` (${count})` : '') : ''}
                        position="right"
                        disabled={!isCollapsed}
                      >
                        <Link
                          to={item.path}
                          aria-current={isActive ? 'page' : undefined}
                          className={`relative flex items-center rounded-xl text-[13.5px] font-semibold transition-colors duration-150 group w-full mb-0.5 ${
                            isActive
                              ? 'bg-[#00a651]/10 text-[#00a651]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                        >
                          {/* Active marker on the inline-start edge */}
                          {isActive && !isCollapsed && (
                            <span className="absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#00a651]" />
                          )}

                          <span className={`flex items-center justify-center shrink-0 ${isCollapsed ? '' : 'w-6 me-2.5'}`}>
                            <Icon
                              size={isCollapsed ? 19 : 17}
                              strokeWidth={isActive ? 2.4 : 2}
                              className={isActive ? 'text-[#00a651]' : 'text-gray-400 group-hover:text-gray-600'}
                            />
                          </span>

                          {!isCollapsed && <span className="truncate">{tAdmin(item.name)}</span>}

                          {count > 0 && (
                            isCollapsed ? (
                              <span className="absolute top-1 ltr:right-1 rtl:left-1 w-2 h-2 rounded-full bg-[#ff5c00] ring-2 ring-white" />
                            ) : (
                              <span className="ms-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[#ff5c00] text-white text-[11px] font-bold flex items-center justify-center">
                                {count > 99 ? '99+' : count}
                              </span>
                            )
                          )}
                        </Link>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            });
          })()}
        </nav>

        {/* Footer actions */}
        <div className="p-4 mt-auto border-t border-gray-100/50">
           <Tooltip content={isCollapsed ? tAdmin('Exit to Store') : ''} position="right" disabled={!isCollapsed}>
             <Link to="/" className={`flex items-center rounded-2xl text-[14px] font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group w-full border border-transparent ${isCollapsed ? 'justify-center p-3 aspect-square' : 'px-3.5 py-3'}`}>
                <div className={`flex items-center justify-center shrink-0 transition-transform ${isCollapsed ? '' : 'w-7 me-3'}`}>
                  <LogOut size={isCollapsed ? 20 : 18} strokeWidth={2.2} className="text-gray-400 group-hover:text-red-500" />
                </div>
                {!isCollapsed && <span className="truncate tracking-wide">{tAdmin('Exit to Store')}</span>}
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
                  <Search className="w-[18px] h-[18px] text-gray-400 absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder={tAdmin('Search everywhere...')} className="ps-11 pe-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] w-72 bg-white transition-all placeholder:text-gray-400 shadow-sm shadow-gray-100/50 hover:border-gray-300" />
               </div>
               {/* Admin panel language — separate from the storefront's */}
               <div className="relative">
                 <Tooltip content={tAdmin('Admin language')} position="bottom">
                   <button
                     onClick={() => setIsLangOpen(!isLangOpen)}
                     className="h-11 px-3.5 rounded-2xl bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors flex items-center gap-2 border border-gray-200 shadow-sm shadow-gray-100/50 font-semibold text-sm"
                   >
                     <Languages size={18} />
                     <span className="uppercase tracking-wide">{adminLang}</span>
                   </button>
                 </Tooltip>
                 {isLangOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                     <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
                       <div className="px-4 pb-2 mb-1 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                         {tAdmin('Admin language')}
                       </div>
                       {LANGS.map((l) => (
                         <button
                           key={l.code}
                           onClick={() => { setAdminLang(l.code); setIsLangOpen(false); }}
                           className={`w-full px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                             adminLang === l.code ? 'text-[#00a651] font-semibold' : 'text-gray-700'
                           }`}
                         >
                           <span dir={l.dir}>{l.native}</span>
                           {adminLang === l.code && <Check size={15} />}
                         </button>
                       ))}
                       <p className="px-4 pt-2 mt-1 border-t border-gray-100 text-[11px] text-gray-400 leading-snug">
                         Only changes this panel. The storefront language is set separately by each visitor.
                       </p>
                     </div>
                   </>
                 )}
               </div>

               <Tooltip content="Notifications (2)" position="bottom">
                 <button className="relative w-11 h-11 rounded-2xl bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors flex items-center justify-center border border-gray-200 shadow-sm shadow-gray-100/50 group">
                    <Bell size={20} className="group-hover:animate-pulse" />
                    <span className="absolute top-2.5 ltr:right-3 rtl:left-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                 </button>
               </Tooltip>
               <div className="h-8 w-px bg-gray-200 mx-2"></div>
               <div className="flex items-center gap-3.5 cursor-pointer group">
                 <div className="ltr:text-right rtl:text-left hidden sm:block">
                   <div className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-[#00a651] transition-colors">Admin User</div>
                   <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1.5">{tAdmin('Store Owner')}</div>
                 </div>
                 <div className="w-11 h-11 rounded-2xl border border-gray-200 overflow-hidden shadow-sm shadow-gray-100/50 group-hover:border-[#00a651] group-hover:shadow-[0_0_0_3px_rgba(0,166,81,0.1)] transition-all">
                   <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-full h-full object-cover" />
                 </div>
               </div>
            </div>
         </header>
         {/*
           No max-width: admin screens use the full pane. Screens that read better
           narrow (pages, menu, category editor) set their own max-width.

           Padding lives on the inner wrapper, NOT on the scroll container. A padded
           scroll container offsets `sticky top-0` by that padding, which left the
           product editor's sticky header floating below the top with page content
           visible in the gap. With the scrollport unpadded, top-0 means top — and
           full-bleed screens can still cancel the padding with -m-10.
         */}
         <div className="flex-1 overflow-auto bg-white" style={{ scrollbarWidth: 'thin' }}>
            <div className="w-full p-10">
               <Outlet />
            </div>
         </div>
      </main>
    </div>
  );
}
