import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Menu, Search, Phone, BarChart2, Heart, User, ShoppingBag, LayoutGrid, X, ChevronRight, LayoutTemplate, Gem, Mic, Shirt, Dumbbell, PenTool, Gamepad2, List, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { mockCategories } from '../data/mockData';
import { megaMenuData } from '../data/megaMenuData';
import { MegaMenu } from './MegaMenu';
import { Tooltip } from './Tooltip';

const iconMap: Record<string, React.ElementType> = {
  LayoutTemplate,
  Gem,
  Mic,
  Shirt,
  Dumbbell,
  PenTool,
  Gamepad2,
  List
};

export function Header() {
  const { cartCount, compareItems, currency, setCurrency, language, setLanguage, t } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown states
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState('Boston');
  const [activeCategoryId, setActiveCategoryId] = useState(megaMenuData[0].id);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for click outside
  const infoRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Detected Location';
            if (city) {
              setUserLocation(city);
            }
          } catch (e) {
            console.error("Geocoding failed", e);
            // Fallback to IP API if Nominatim fails or rate-limits
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              const ipData = await ipRes.json();
              if (ipData.city) {
                setUserLocation(ipData.city);
              }
            } catch (err) {
               console.error("IP geocoding failed", err);
            }
          }
        },
        async (err) => {
          console.error("Geolocation permission denied or failed", err);
          // Fallback to IP-based location if permission denied
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData.city) {
              setUserLocation(ipData.city);
            }
          } catch (ipErr) {
            console.error("IP geocoding failed", ipErr);
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) setIsInfoOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) setIsCurrencyOpen(false);
      if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLanguageOpen(false);
      if (phoneRef.current && !phoneRef.current.contains(event.target as Node)) setIsPhoneOpen(false);
      if (catRef.current && !catRef.current.contains(event.target as Node) && !document.getElementById('mega-menu')?.contains(event.target as Node)) setIsCatOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="w-full flex flex-col sticky top-[-36px] z-50">
      {/* Top Bar */}
      <div className="bg-[#2a2a2a] text-[#b3b3b3] text-[12px] flex items-center relative z-[60] h-[36px]">
        <div className="max-w-[1440px] w-full mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            <span>{userLocation}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/delivery" className="hover:text-white transition-colors hidden md:block">{t('Delivery and payment')}</Link>
            <Link to="/returns" className="hover:text-white transition-colors hidden md:block">{t('Returns')}</Link>
            <Link to="/stores" className="hover:text-white transition-colors hidden md:block">{t('Store locator')}</Link>
            <Link to="/contacts" className="hover:text-white transition-colors hidden md:block">{t('Contacts')}</Link>
            <Link to="/admin" className="hover:text-white transition-colors hidden md:flex items-center gap-1 text-[#ffcc00] font-medium"><Settings className="w-3.5 h-3.5" /> Admin</Link>
            
            <div className="relative" ref={infoRef}>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors hidden sm:flex"
                onClick={() => setIsInfoOpen(!isInfoOpen)}
              >
                {t('Information')} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`} />
              </div>
              {isInfoOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <Link to="/about" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>About Us</Link>
                  <Link to="/delivery" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Delivery Information</Link>
                  <Link to="/returns" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Privacy Policy</Link>
                  <Link to="/contacts" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Contact Us</Link>
                </div>
              )}
            </div>
            
            <div className="relative hidden sm:block" ref={currencyRef}>
              <div 
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              >
                {currency} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
              </div>
              {isCurrencyOpen && (
                <div className="absolute top-full right-0 mt-1 w-20 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('$'); setIsCurrencyOpen(false); }}>$ (USD)</div>
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('€'); setIsCurrencyOpen(false); }}>€ (EUR)</div>
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('£'); setIsCurrencyOpen(false); }}>£ (GBP)</div>
                </div>
              )}
            </div>
            
            <div className="relative hidden sm:block" ref={langRef}>
              <div 
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-left"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                {language} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </div>
              {isLanguageOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setLanguage('English'); setIsLanguageOpen(false); }}>English</div>
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setLanguage('Spanish'); setIsLanguageOpen(false); }}>Espanol</div>
                  <div className="px-4 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setLanguage('French'); setIsLanguageOpen(false); }}>Français</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`flex items-center text-white border-b border-black/20 transition-all duration-300 ease-in-out ${isScrolled ? 'h-[60px] bg-[#1a1a1a]/95 backdrop-blur-md shadow-md' : 'h-[76px] bg-[#1a1a1a] shadow-lg'}`}>
        <div className="relative max-w-[1440px] w-full mx-auto px-4 flex items-center justify-between gap-6 h-full">
          
          {/* Menu & Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="text-white p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className={`flex items-start transition-transform duration-300 ease-in-out origin-left ${isScrolled ? 'scale-90' : 'scale-100'}`}>
              <span className="text-[#00a651] font-bold text-[24px] sm:text-[28px] leading-none tracking-tight">Uni</span>
              <span className="text-white font-bold text-[24px] sm:text-[28px] leading-none tracking-tight whitespace-nowrap">theme</span>
              <span className="text-white w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] border rounded-full text-[8px] sm:text-[9px] flex items-center justify-center font-bold ml-0.5 mb-auto.5">2</span>
            </Link>
          </div>

          {/* Categories & Search - Desktop Only */}
          <div className="flex-1 max-w-[800px] gap-3 items-center mx-2 hidden lg:flex">
            <button 
              ref={catRef}
              onClick={() => setIsCatOpen(!isCatOpen)}
              className={`bg-[#00a651] hover:bg-[#008c44] text-white px-4 rounded-xl flex items-center justify-between gap-3 font-medium transition-all duration-300 ease-in-out min-w-[150px] relative z-10 cursor-pointer ${isScrolled ? 'h-[40px]' : 'h-[44px]'}`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                <span>{t('Categories')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 opacity-80 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <MegaMenu closeMenu={() => setIsCatOpen(false)} />
            )}

            <form onSubmit={handleSearch} className={`flex-1 flex overflow-hidden bg-white rounded-full focus-within:ring-2 ring-[#00a651] transition-all duration-300 ease-in-out ${isScrolled ? 'h-[40px]' : 'h-[44px]'}`}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search products')} 
                className="flex-1 h-full px-5 outline-none text-[14px] text-gray-800 placeholder:text-gray-500 bg-transparent"
              />
              <button type="submit" className="h-full px-5 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center border-l border-gray-200 cursor-pointer">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </form>
          </div>

          {/* Right Info & Icons */}
          <div className="flex items-center gap-6">
            <div className="relative" ref={phoneRef}>
              <div 
                className="flex items-center gap-1.5 cursor-pointer group hidden xl:flex"
                onClick={() => setIsPhoneOpen(!isPhoneOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-[#00a651]/20 group-hover:bg-[#00a651] flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-[#00a651] group-hover:text-white transition-colors" fill="currentColor" />
                </div>
                <div className="flex items-center text-white font-bold text-[15px]">
                  +1(917)722-7425 <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isPhoneOpen ? 'text-white rotate-180' : 'text-gray-400'}`} />
                </div>
              </div>
              {isPhoneOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                  <div className="px-5 py-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Working Hours</p>
                    <p className="text-sm font-medium">Mon-Fri: 9:00 - 18:00</p>
                  </div>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <Link to="/contacts" className="flex flex-col px-5 py-2 hover:bg-gray-50 transition-colors" onClick={() => setIsPhoneOpen(false)}>
                     <span className="text-sm font-bold text-gray-900 group-hover:text-[#00a651]">Request a call back</span>
                     <span className="text-xs text-gray-500">We will call you in 15 minutes</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-5 text-white">
              <Tooltip content="Compare Products" position="bottom">
                <Link to="/compare" className="hover:text-[#00a651] transition-colors relative cursor-pointer hidden sm:block">
                  <BarChart2 className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                  {compareItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#00a651] text-white text-[10px] sm:text-[11px] font-bold w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex items-center justify-center rounded-full shadow-sm">
                      {compareItems.length}
                    </span>
                  )}
                </Link>
              </Tooltip>
              <Tooltip content="Wishlist" position="bottom">
                <Link to="/wishlist" className="hover:text-[#00a651] transition-colors relative cursor-pointer hidden sm:block">
                  <Heart className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                </Link>
              </Tooltip>
              <Tooltip content="My Account" position="bottom">
                <Link to="/login" className="hover:text-[#00a651] transition-colors relative block cursor-pointer">
                  <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                </Link>
              </Tooltip>
              <Tooltip content="Shopping Cart" position="bottom">
                <Link to="/cart" className="hover:text-[#00a651] transition-colors relative mt-1 block cursor-pointer">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-1.5 -right-2 bg-[#00a651] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-[#1a1a1a]">
                    {cartCount}
                  </span>
                </Link>
              </Tooltip>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar (under main header, visible only on small screens) */}
      <div className="bg-[#1a1a1a] px-4 pb-3 lg:hidden border-b border-black/20 text-white">
        <form onSubmit={handleSearch} className="flex overflow-hidden bg-white/10 rounded-full h-[40px] focus-within:ring-2 ring-[#00a651] transition-shadow w-full">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search products')} 
            className="flex-1 h-full px-5 outline-none text-[14px] text-white placeholder:text-gray-400 bg-transparent"
          />
          <button type="submit" className="h-full px-5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer text-gray-300">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Hamburger Mobile Menu / Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex bg-white sm:bg-black/50 overflow-hidden">
          {/* Sidebar */}
          <div className="relative w-full sm:w-[320px] bg-white h-full shadow-2xl flex flex-col flex-shrink-0 transform transition-transform duration-300">
            {/* Header of sidebar */}
            <div className="bg-[#242424] text-white p-5 flex items-center justify-between border-b border-white/10">
              <Link to="/" className="flex items-start" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-[#00a651] font-bold text-[28px] leading-none tracking-tight">Uni</span>
                <span className="text-white font-bold text-[28px] leading-none tracking-tight whitespace-nowrap">theme</span>
                <span className="text-white w-[14px] h-[14px] border border-gray-500 rounded-full text-[9px] flex items-center justify-center font-bold ml-1 mb-auto.5 text-gray-400">2</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 bg-gray-500/20 hover:bg-gray-500/40 rounded-full flex items-center justify-center transition-colors cursor-pointer text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sign in section */}
            <div className="bg-[#2a2a2a] p-5 flex items-start gap-4">
               <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center flex-shrink-0">
                 <User className="w-5 h-5 text-gray-300" />
               </div>
               <div className="flex flex-col">
                  <div className="text-white font-bold text-[15px] flex items-center gap-1.5">
                     <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00a651] transition-colors cursor-pointer">Sign in</Link>
                     <span className="text-gray-500 font-normal">|</span>
                     <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00a651] transition-colors cursor-pointer">Register</Link>
                  </div>
                  <p className="text-gray-400 text-[12px] mt-0.5">Sign in to get more opportunities</p>
               </div>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto pb-6">
              {megaMenuData.map((category) => {
                const Icon = iconMap[category.icon] || LayoutGrid;
                const isActive = activeCategoryId === category.id;
                return (
                  <div 
                    key={category.id}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    className={`flex items-start gap-4 p-[16px_20px] cursor-pointer transition-colors relative border-b border-gray-100 ${isActive ? 'bg-white' : 'hover:bg-gray-50'}`}
                  >
                    <div className="mt-0.5 text-gray-400 flex items-center justify-center w-8 h-8 flex-shrink-0 border border-gray-200 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[15px] text-gray-900">{category.title}</span>
                        {category.badge && (
                          <span className={`text-[9px] font-bold text-white px-1.5 py-[2px] rounded ${category.badgeColor || 'bg-gray-700'}`}>
                            {category.badge}
                          </span>
                        )}
                      </div>
                      {category.subtitle && (
                        <p className="text-[13px] text-gray-500 leading-tight pr-4">{category.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center h-8">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Subcategories (Desktop/Tablet view of drawer) */}
          <div className="hidden sm:flex flex-1 bg-[#f9f9f9] h-full overflow-y-auto">
             <div className="w-full max-w-5xl p-10">
               {(() => {
                 const activeCategory = megaMenuData.find(c => c.id === activeCategoryId);
                 return (
                   <div className="grid grid-cols-4 gap-x-8 gap-y-12">
                     {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
                       activeCategory.subcategories.map((sub, idx) => (
                         <div key={idx} className={idx > 3 ? "border-t border-gray-200 pt-8 mt-4" : ""}>
                            <h3 className="font-bold text-[15px] text-gray-900 mb-4 cursor-pointer hover:text-[#00a651]">{sub.title}</h3>
                            {sub.links && sub.links.length > 0 && (
                               <ul className="space-y-3">
                                  {sub.links.map((link, lIdx) => (
                                    <li key={lIdx} className="text-[14px] text-gray-600 hover:text-[#00a651] cursor-pointer">
                                      {link.label}
                                    </li>
                                  ))}
                                  <li className="text-[14px] text-[#0066cc] cursor-pointer mt-1 hover:underline">
                                    More <ChevronDown className="inline w-3 h-3"/>
                                  </li>
                               </ul>
                            )}
                         </div>
                       ))
                     ) : (
                       <div className="col-span-4 text-gray-400 py-10">No subcategories available.</div>
                     )}
                   </div>
                 );
               })()}
             </div>
          </div>
        </div>
      )}
    </header>
  );
}
