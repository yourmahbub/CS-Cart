import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Menu, Search, Phone, BarChart2, Heart, User, ShoppingBag, LayoutGrid, X, ChevronRight, LayoutTemplate, Gem, Mic, Shirt, Dumbbell, PenTool, Gamepad2, List, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { mockCategories } from '../data/mockData';
import { megaMenuData } from '../data/megaMenuData';
import { MegaMenu } from './MegaMenu';
import { Tooltip } from './Tooltip';

import { useAdmin } from '../context/AdminContext';
import { Truck, LogOut, Package, Sparkles } from 'lucide-react';

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
  const { cartCount, compareItems, currency, setCurrency, language, setLanguage, t, currentUser, logout, formatPrice, wishlistItems, login } = useCart();
  const { products } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Dropdown states
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState('Boston');
  const [activeCategoryId, setActiveCategoryId] = useState(megaMenuData[0].id);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for click outside
  const infoRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live search suggestions
  const searchSuggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2 || !products) return [];
    return products.filter((p: any) => 
      p.title?.toLowerCase().includes(q) || 
      p.code?.toLowerCase().includes(q) ||
      (Array.isArray(p.categories) && p.categories.some((c: string) => c.toLowerCase().includes(q)))
    ).slice(0, 5);
  }, [searchQuery, products]);

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
      if (userRef.current && !userRef.current.contains(event.target as Node)) setIsUserOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchFocused(false);
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
    <header className="w-full max-w-full flex flex-col sticky top-[-36px] z-50 overflow-x-clip">
      {/* Top Bar */}
      <div className="bg-[#2a2a2a] text-[#b3b3b3] text-[12px] flex items-center relative z-[60] h-[36px] w-full max-w-full overflow-hidden">
        <div className="max-w-[1440px] w-full mx-auto px-4 flex justify-between items-center overflow-hidden">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors max-w-[50%] sm:max-w-none overflow-hidden">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{userLocation}</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <Link to="/track-order" className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
              <Truck className="w-3.5 h-3.5" /> Track Order
            </Link>
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
                  <Link to="/faq" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Help & FAQ</Link>
                  <Link to="/delivery" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Delivery Information</Link>
                  <Link to="/returns" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Returns & Refunds</Link>
                  <Link to="/terms" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Terms & Conditions</Link>
                  <Link to="/privacy" className="block px-4 py-2 hover:bg-gray-50 hover:text-[#00a651] transition-colors" onClick={() => setIsInfoOpen(false)}>Privacy Policy</Link>
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
                <div className="absolute top-full right-0 mt-1 w-24 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('$'); setIsCurrencyOpen(false); }}>$ (USD)</div>
                  <div className="px-3 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('€'); setIsCurrencyOpen(false); }}>€ (EUR)</div>
                  <div className="px-3 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('£'); setIsCurrencyOpen(false); }}>£ (GBP)</div>
                  <div className="px-3 py-1.5 hover:bg-gray-50 hover:text-[#00a651] cursor-pointer transition-colors" onClick={() => { setCurrency('৳'); setIsCurrencyOpen(false); }}>৳ (BDT)</div>
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
      <div className={`flex items-center text-white border-b border-black/20 transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden ${isScrolled ? 'h-[60px] bg-[#1a1a1a]/95 backdrop-blur-md shadow-md' : 'h-[76px] bg-[#1a1a1a] shadow-lg'}`}>
        <div className="relative max-w-[1440px] w-full mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-6 h-full">
          
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

            <div className="relative flex-1" ref={searchRef}>
              <form onSubmit={handleSearch} className={`flex overflow-hidden bg-white rounded-full focus-within:ring-2 ring-[#00a651] transition-all duration-300 ease-in-out ${isScrolled ? 'h-[40px]' : 'h-[44px]'}`}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={t('Search products')} 
                  className="flex-1 h-full px-5 outline-none text-[14px] text-gray-800 placeholder:text-gray-500 bg-transparent"
                />
                <button type="submit" className="h-full px-5 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center border-l border-gray-200 cursor-pointer">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] text-gray-900 animate-in fade-in duration-150">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>Products matching "{searchQuery}"</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>
                  {searchSuggestions.length > 0 ? (
                    <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                      {searchSuggestions.map((item: any) => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            navigate(`/product/${item.id}`);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="p-3 flex items-center gap-3.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <img src={item.image} alt={item.title} className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1 bg-white flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#00a651] truncate transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-400">Code: {item.code || item.id}</p>
                          </div>
                          <span className="text-sm font-bold text-[#00a651] whitespace-nowrap">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No products match your search. Press Enter to view all results.
                    </div>
                  )}
                  <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        handleSearch(e);
                        setIsSearchFocused(false);
                      }}
                      className="text-xs font-bold text-[#00a651] hover:underline cursor-pointer"
                    >
                      View all results for "{searchQuery}" →
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex items-center justify-center rounded-full shadow-sm">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </Tooltip>

              {/* User Account Dropdown */}
              <div className="relative" ref={userRef}>
                <Tooltip content={currentUser ? currentUser.name : "My Account"} position="bottom">
                  <button 
                    type="button"
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="hover:text-[#00a651] transition-colors relative block cursor-pointer"
                  >
                    {currentUser ? (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#00a651] text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-white/30">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                    )}
                  </button>
                </Tooltip>

                {isUserOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-3 z-[100] animate-in fade-in duration-150">
                    {currentUser ? (
                      <>
                        <div className="px-5 py-2.5 border-b border-gray-100">
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                          <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link 
                            to="/account" 
                            className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00a651] font-medium transition-colors"
                            onClick={() => setIsUserOpen(false)}
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            My Account & Orders
                          </Link>
                          <Link 
                            to="/track-order" 
                            className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00a651] font-medium transition-colors"
                            onClick={() => setIsUserOpen(false)}
                          >
                            <Truck className="w-4 h-4 text-emerald-500" />
                            Track Order
                          </Link>
                          <Link 
                            to="/wishlist" 
                            className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00a651] font-medium transition-colors"
                            onClick={() => setIsUserOpen(false)}
                          >
                            <Heart className="w-4 h-4 text-rose-500" />
                            Wishlist ({wishlistItems.length})
                          </Link>
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-3 px-5 py-2 text-sm text-amber-600 hover:bg-amber-50 font-medium transition-colors"
                            onClick={() => setIsUserOpen(false)}
                          >
                            <Settings className="w-4 h-4 text-amber-500" />
                            Store Admin Panel
                          </Link>
                        </div>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          type="button"
                          onClick={() => {
                            logout();
                            setIsUserOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-3 px-5 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-5 py-2 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">Welcome to UniTheme</p>
                          <p className="text-xs text-gray-500 mt-0.5">Sign in to manage orders & wishlist</p>
                        </div>
                        <div className="p-3 space-y-2">
                          <Link 
                            to="/login"
                            onClick={() => setIsUserOpen(false)}
                            className="block w-full py-2 bg-[#00a651] hover:bg-[#008c44] text-white text-center font-bold text-xs rounded-xl transition-all shadow-sm"
                          >
                            Sign In
                          </Link>
                          <Link 
                            to="/register"
                            onClick={() => setIsUserOpen(false)}
                            className="block w-full py-2 border border-gray-200 hover:border-gray-900 text-gray-800 text-center font-semibold text-xs rounded-xl transition-all"
                          >
                            Create Account
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              login('alex.j@example.com', 'Alex Johnson');
                              setIsUserOpen(false);
                              navigate('/account');
                            }}
                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-dashed border-gray-300 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Instant Demo Sign In
                          </button>
                        </div>
                        <div className="h-px bg-gray-100"></div>
                        <div className="py-1">
                          <Link 
                            to="/track-order" 
                            className="flex items-center gap-3 px-5 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-[#00a651] font-medium transition-colors"
                            onClick={() => setIsUserOpen(false)}
                          >
                            <Truck className="w-3.5 h-3.5 text-emerald-500" />
                            Track Order
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

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
      <div className="bg-[#1a1a1a] px-3 sm:px-4 pb-3 lg:hidden border-b border-black/20 text-white relative w-full max-w-full overflow-hidden">
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
               <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center flex-shrink-0 bg-white/5">
                 <User className="w-5 h-5 text-gray-300" />
               </div>
               <div className="flex flex-col flex-1">
                  {currentUser ? (
                    <div>
                      <div className="text-white font-bold text-[15px] flex items-center justify-between">
                        <span>{currentUser.name}</span>
                        <button 
                          onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                          className="text-xs text-rose-400 hover:underline font-normal cursor-pointer"
                        >
                          Sign out
                        </button>
                      </div>
                      <p className="text-gray-400 text-[12px] truncate">{currentUser.email}</p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-[#00a651] font-semibold hover:underline">My Account</Link>
                        <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-400 hover:underline">Track Order</Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white font-bold text-[15px] flex items-center gap-1.5">
                         <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00a651] transition-colors cursor-pointer">Sign in</Link>
                         <span className="text-gray-500 font-normal">|</span>
                         <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#00a651] transition-colors cursor-pointer">Register</Link>
                      </div>
                      <p className="text-gray-400 text-[12px] mt-0.5">Sign in to track orders and save wishlists</p>
                      <button 
                        onClick={() => { login('alex.j@example.com', 'Alex Johnson'); setIsMobileMenuOpen(false); navigate('/account'); }}
                        className="text-amber-400 text-xs font-semibold hover:underline mt-1.5 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Quick Demo Sign In
                      </button>
                    </div>
                  )}
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
