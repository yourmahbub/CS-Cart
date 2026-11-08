import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { 
  User, Heart, Package, LogOut, CheckCircle2, Clock, Truck, 
  MapPin, Printer, ArrowRight, Trash2, ShoppingBag, 
  ChevronRight, Sparkles, ShieldCheck, Mail, Phone, X, AlertCircle
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (currentUser) {
    navigate('/account');
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, email.split('@')[0]);
      navigate('/account');
    }
  };

  const handleQuickDemoLogin = () => {
    login('alex.j@example.com', 'Alex Johnson');
    navigate('/account');
  };

  return (
    <div className="max-w-[520px] mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-[#00a651]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00a651]">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center">Sign In</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Access your order history, track shipments, and manage wishlist
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.j@example.com" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(0,166,81,0.25)] hover:shadow-lg cursor-pointer text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase font-semibold">Or continue with</span>
        </div>

        <button 
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full h-11 border border-gray-200 hover:border-gray-900 bg-gray-50 hover:bg-white text-gray-800 font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#ffb200]" />
          Instant Demo Account (Alex Johnson)
        </button>

        <p className="mt-8 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#00a651] font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  if (currentUser) {
    navigate('/account');
    return null;
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      login(email, name, phone);
      navigate('/account');
    }
  };

  return (
    <div className="max-w-[520px] mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-[#00a651]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00a651]">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center">Create an Account</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Join us today to save wishlists, manage orders, and receive member perks
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (917) 722-7425" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm transition-all" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(0,166,81,0.25)] hover:shadow-lg cursor-pointer text-sm"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00a651] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, addToCart, formatPrice } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm">
          <Heart className="w-12 h-12 text-rose-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Your Wishlist is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Keep track of items you love. Click the heart icon on any product card or details page to save it for later.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3.5 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md shadow-[#00a651]/20"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => addToCart(item, 1));
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            My Wishlist ({wishlistItems.length})
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review saved items and move them to cart at any time.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 bg-[#00a651] hover:bg-[#008c44] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Move All to Cart
          </button>
          <button 
            type="button"
            onClick={clearWishlist}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((product) => (
          <div 
            key={product.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group"
          >
            <button 
              type="button"
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer"
              title="Remove from Wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link to={`/product/${product.id}`} className="block mb-3">
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden p-3 flex items-center justify-center mb-3">
                <img 
                  src={product.image || undefined} 
                  alt={product.title} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#00a651] transition-colors">
                {product.title}
              </h3>
            </Link>

            <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-lg font-bold text-gray-900 leading-none">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-xs text-gray-400 line-through block mt-0.5">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              <button 
                type="button"
                onClick={() => addToCart(product, 1)}
                className="px-4 py-2 bg-[#00a651] hover:bg-[#008c44] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile, formatPrice } = useCart();
  const { orders } = useAdmin();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);

  // Edit profile state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [zip, setZip] = useState(currentUser?.zip || '');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Filter orders related to this user or all recent orders
  const userOrders = orders.filter((o: any) => 
    o.email?.toLowerCase() === currentUser.email?.toLowerCase() || 
    o.customer?.toLowerCase().includes(currentUser.name.toLowerCase())
  );
  const displayOrders = userOrders.length > 0 ? userOrders : orders.slice(0, 5);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, address, city, zip });
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-10">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-[#1a2f23] rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#00a651] text-white flex items-center justify-center text-2xl font-black shadow-lg">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{currentUser.name}</h1>
              <span className="bg-[#00a651]/20 border border-[#00a651]/40 text-[#4ade80] text-xs font-bold px-2.5 py-0.5 rounded-full">
                VIP Member
              </span>
            </div>
            <p className="text-gray-300 text-sm mt-1">{currentUser.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Member since {currentUser.createdAt || 'Jan 2024'}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Main Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-[280px] bg-white border border-gray-200 rounded-2xl p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto shrink-0 shadow-sm">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#00a651] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({displayOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#00a651] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'addresses' ? 'bg-[#00a651] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> Shipping Addresses
          </button>
          <Link 
            to="/wishlist"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all text-left whitespace-nowrap"
          >
            <Heart className="w-4 h-4 text-rose-500" /> Wishlist
          </Link>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 w-full min-w-0">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                <span>Recent Orders</span>
                <span className="text-xs font-semibold text-gray-500">Auto-synced</span>
              </h2>

              {displayOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium text-sm">No orders found.</p>
                  <Link to="/" className="inline-block mt-4 text-[#00a651] font-bold text-sm hover:underline">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayOrders.map((order: any) => {
                    const statusColor = 
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <div 
                        key={order.id}
                        className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all bg-gray-50/50 flex flex-col gap-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                          <div>
                            <span className="font-mono font-bold text-sm text-gray-900 mr-3">{order.id}</span>
                            <span className="text-xs text-gray-500">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusColor}`}>
                              {order.status}
                            </span>
                            <span className="font-extrabold text-base text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Items preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex flex-wrap items-center gap-3 py-1">
                            {order.items.slice(0, 4).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5 pr-3">
                                <img src={item.image} alt={item.title} className="w-10 h-10 object-contain rounded" />
                                <div className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[140px]">
                                  {item.title}
                                </div>
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <span className="text-xs text-gray-500 font-bold">+{order.items.length - 4} more</span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                          <span className="text-gray-500">
                            {order.paymentMethod || 'Credit Card'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => setTrackingOrder(order)}
                              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-900 text-gray-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5 text-[#00a651]" /> Track Order
                            </button>
                            <button 
                              type="button"
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" /> View Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Details</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address (Read Only)</label>
                  <input 
                    disabled 
                    type="email" 
                    value={currentUser.email} 
                    className="w-full h-11 border border-gray-200 bg-gray-50 rounded-xl px-4 text-sm text-gray-500 cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Street Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    placeholder="1234 Broadway Ave"
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">City</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">ZIP Code</label>
                    <input 
                      type="text" 
                      value={zip} 
                      onChange={e => setZip(e.target.value)}
                      placeholder="10001"
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Update Address
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* TRACKING MODAL */}
      {trackingOrder && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-default"
          onClick={() => setTrackingOrder(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Track Order #{trackingOrder.id}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Carrier: Express FastDelivery Air</p>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Stepper */}
            <div className="space-y-6 relative pl-6 border-l-2 border-[#00a651] my-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#00a651] ring-4 ring-[#00a651]/20"></div>
                <h4 className="text-sm font-bold text-gray-900">Order Confirmed & Payment Verified</h4>
                <p className="text-xs text-gray-500">{trackingOrder.date} - Complete</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#00a651] ring-4 ring-[#00a651]/20"></div>
                <h4 className="text-sm font-bold text-gray-900">Picked & Packaged at Warehouse</h4>
                <p className="text-xs text-gray-500">Quality check passed</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ${trackingOrder.status === 'delivered' || trackingOrder.status === 'shipped' ? 'bg-[#00a651] ring-4 ring-[#00a651]/20' : 'bg-gray-300'}`}></div>
                <h4 className="text-sm font-bold text-gray-900">In Transit with Courier</h4>
                <p className="text-xs text-gray-500">{trackingOrder.status === 'shipped' ? 'Out for distribution' : 'Estimated 1-2 days'}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ${trackingOrder.status === 'delivered' ? 'bg-[#00a651] ring-4 ring-[#00a651]/20' : 'bg-gray-300'}`}></div>
                <h4 className="text-sm font-bold text-gray-900">Delivered</h4>
                <p className="text-xs text-gray-500">{trackingOrder.status === 'delivered' ? 'Package signed and received' : 'Pending final drop-off'}</p>
              </div>
            </div>

            <button 
              onClick={() => setTrackingOrder(null)}
              className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Tracking
            </button>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE RECEIPT MODAL */}
      {selectedOrderForInvoice && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-default overflow-y-auto"
          onClick={() => setSelectedOrderForInvoice(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-6 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[#00a651] font-extrabold text-2xl">Uni</span>
                  <span className="text-gray-900 font-extrabold text-2xl">theme</span>
                  <span className="text-xs bg-gray-900 text-white font-bold px-1.5 py-0.5 rounded">2</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Official E-Commerce Sales Invoice</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 font-mono text-xs font-bold rounded-lg border border-green-200">
                  {selectedOrderForInvoice.id}
                </span>
                <p className="text-xs text-gray-500 mt-1">{selectedOrderForInvoice.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs text-gray-600">
              <div>
                <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-1">Billed & Shipped To:</h5>
                <p className="font-bold text-gray-800 text-sm">{selectedOrderForInvoice.customer || currentUser.name}</p>
                <p>{selectedOrderForInvoice.email || currentUser.email}</p>
                <p>{selectedOrderForInvoice.phone || currentUser.phone}</p>
                <p>{selectedOrderForInvoice.shippingAddress?.address || currentUser.address || '1234 Broadway Ave, New York'}</p>
              </div>
              <div className="text-right">
                <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-1">Payment Method:</h5>
                <p className="font-bold text-gray-800">{selectedOrderForInvoice.paymentMethod || 'Credit Card'}</p>
                <p className="text-green-600 font-bold mt-1">✓ PAID & AUTHORIZED</p>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-bold uppercase">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrderForInvoice.items && selectedOrderForInvoice.items.length > 0 ? (
                    selectedOrderForInvoice.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-gray-900">{item.title}</td>
                        <td className="p-3 text-center">{item.quantity || 1}</td>
                        <td className="p-3 text-right font-bold">{formatPrice(item.price * (item.quantity || 1))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-medium text-gray-900">Standard Product Order Package</td>
                      <td className="p-3 text-center">1</td>
                      <td className="p-3 text-right font-bold">{formatPrice(selectedOrderForInvoice.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatPrice(selectedOrderForInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping:</span>
                  <span className="font-medium text-[#00a651]">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Total Paid:</span>
                  <span className="text-[#00a651]">{formatPrice(selectedOrderForInvoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer modal buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008c44] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
