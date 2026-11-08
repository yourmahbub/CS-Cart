import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag, 
  Tag, ShieldCheck, Truck, RotateCcw, Check, ArrowRight, Sparkles 
} from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();
  const { 
    items, 
    cartTotal, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    formatPrice, 
    appliedCoupon, 
    couponDiscount, 
    applyCoupon, 
    removeCoupon 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#00a651]/20 rounded-full blur-[30px] animate-pulse"></div>
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <ShoppingBag className="w-12 h-12 text-[#00a651]" strokeWidth={1.5} />
             <div className="absolute top-2 right-4 w-3 h-3 bg-[#e3000f] rounded-full"></div>
             <div className="absolute bottom-6 left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
             <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Your cart is empty</h1>
        <p className="text-gray-500 mb-10 max-w-md text-center text-[16px] leading-relaxed">
          Looks like you haven't added anything to your cart yet. Discover our latest products and exclusive deals today.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] text-white px-10 py-4 rounded-xl font-bold text-[16px] shadow-[0_4px_14px_rgba(0,166,81,0.2)] hover:shadow-[0_6px_20px_rgba(0,166,81,0.3)] hover:-translate-y-0.5 transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 150;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const finalTotal = Math.max(0, cartTotal - couponDiscount);

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
        <button 
          onClick={clearCart} 
          className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-2">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#00a651]" />
            {amountNeeded > 0 ? (
              <>Add <span className="text-[#00a651]">{formatPrice(amountNeeded)}</span> more to qualify for <span className="underline">FREE Standard Delivery</span>!</>
            ) : (
              <span className="text-[#00a651] flex items-center gap-1">
                <Check className="w-4 h-4" /> You unlocked FREE Standard Delivery!
              </span>
            )}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-emerald-200/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00a651] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cart Items */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="hidden sm:flex border-b border-gray-100 pb-4 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            <div className="w-[50%]">Product</div>
            <div className="w-[20%] text-center">Quantity</div>
            <div className="w-[20%] text-right">Price</div>
            <div className="w-[10%] text-right"></div>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={`${item.product.id}_${idx}`} className="flex flex-col sm:flex-row sm:items-center py-6 px-2 gap-4">
                <div className="sm:w-[50%] flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl p-2 flex-shrink-0">
                    <img src={item.product.image || undefined} alt={item.product.title} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <Link to={`/product/${item.product.id}`} className="text-[14px] font-bold text-gray-900 hover:text-[#00a651] line-clamp-2">
                      {item.product.title}
                    </Link>
                    {item.product.selectedColor && (
                      <span className="inline-block text-xs text-gray-500 mt-1 mr-3">
                        Color: <span className="font-semibold">{item.product.selectedColor}</span>
                      </span>
                    )}
                    {item.product.selectedSize && (
                      <span className="inline-block text-xs text-gray-500 mt-1">
                        Size: <span className="font-semibold">{item.product.selectedSize}</span>
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1 font-mono">CODE: {item.product.code}</p>
                  </div>
                </div>

                <div className="sm:w-[20%] flex justify-between sm:justify-center items-center">
                  <div className="flex items-center border border-gray-200 rounded-full h-10 w-[100px] overflow-hidden bg-gray-50">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-1/3 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-1/3 h-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-1/3 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="sm:hidden text-right text-[16px] font-bold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>

                <div className="hidden sm:block sm:w-[20%] text-right text-[16px] font-bold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </div>

                <div className="sm:w-[10%] flex justify-end">
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link to="/" className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Promo Code Box */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#00a651]" /> Discount Code / Voucher
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00a651]" />
                    <div>
                      <p className="text-xs font-bold text-green-900">{appliedCoupon.code}</p>
                      <p className="text-[11px] text-green-700">{appliedCoupon.label}</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. WELCOME10" 
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs uppercase outline-none focus:border-[#00a651]"
                  />
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1.5 font-medium">{couponError}</p>}
              <div className="mt-2 text-[11px] text-gray-400">
                Try: <span className="font-mono font-bold text-gray-600">WELCOME10</span> (10% off) or <span className="font-mono font-bold text-gray-600">SAVE20</span> (20% off)
              </div>
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col gap-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#00a651] font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping estimate</span>
                <span className="font-medium text-gray-900">
                  {amountNeeded === 0 ? <span className="text-[#00a651]">FREE</span> : formatPrice(5.99)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base font-bold text-gray-900">Estimated Total</span>
                <span className="text-2xl font-extrabold text-gray-900">{formatPrice(finalTotal + (amountNeeded === 0 ? 0 : 5.99))}</span>
              </div>
              <p className="text-xs text-gray-500">Taxes calculated during checkout.</p>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#00a651] hover:bg-[#008c44] text-white py-4 rounded-xl font-bold text-[15px] shadow-[0_4px_14px_rgba(0,166,81,0.25)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500 font-medium">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#00a651]" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-5 h-5 text-[#00a651]" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-[#00a651]" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
