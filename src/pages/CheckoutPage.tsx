import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { 
  CheckCircle2, CreditCard, Truck, Banknote, ShieldCheck, 
  MapPin, Printer, ArrowRight, Package, Tag, Clock, Check, Copy 
} from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    items, 
    cartTotal, 
    formatPrice, 
    clearCart, 
    appliedCoupon, 
    couponDiscount, 
    applyCoupon, 
    removeCoupon,
    currentUser,
    showToast 
  } = useCart();
  const { addOrder } = useAdmin();

  // Form states initialized with currentUser if present
  const [form, setForm] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'New York',
    zip: currentUser?.zip || '10001',
    notes: '',
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');
  const shippingCost = shippingMethod === 'express' ? 9.99 : (cartTotal >= 50 || shippingMethod === 'pickup' ? 0 : 5.99);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');
  const [cardData, setCardData] = useState({
    name: currentUser?.name || '',
    number: '',
    expiry: '',
    cvc: '',
  });

  // Coupon code input on checkout
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const grandTotal = Math.max(0, cartTotal - couponDiscount + shippingCost);

  if (items.length === 0 && !placedOrder) {
    navigate('/cart');
    return null;
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponCode('');
      showToast('Coupon Applied!', 'success', `${appliedCoupon?.label || 'Discount applied'}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.address) {
      showToast('Please fill required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const paymentLabel = 
      paymentMethod === 'cod' 
        ? 'Cash on Delivery (COD)' 
        : paymentMethod === 'wallet'
        ? 'Mobile Banking / Digital Wallet'
        : `Credit Card (ending in ${cardData.number.slice(-4) || '4242'})`;

    const shippingLabel = 
      shippingMethod === 'standard' 
        ? 'Standard Courier (3-5 days)' 
        : shippingMethod === 'express' 
        ? 'Express Delivery (1-2 days)' 
        : 'Store Pickup';

    const newOrder = {
      id: generatedId,
      customer: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      total: grandTotal,
      subtotal: cartTotal,
      shippingCost,
      discount: couponDiscount,
      items: items.map((i: any) => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        image: i.product.image || i.product.images?.[0],
        quantity: i.quantity,
        selectedColor: i.product.selectedColor,
        selectedSize: i.product.selectedSize,
      })),
      status: 'processing',
      paymentMethod: paymentLabel,
      shippingMethod: shippingLabel,
      shippingAddress: {
        address: form.address,
        city: form.city,
        zip: form.zip,
        notes: form.notes,
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setTimeout(() => {
      addOrder(newOrder);
      setPlacedOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      showToast('Order Placed Successfully!', 'success', `Order ${generatedId} is now being processed.`);
    }, 1200);
  };

  // ---------------- ORDER SUCCESS RECEIPT VIEW ----------------
  if (placedOrder) {
    return (
      <main className="max-w-[900px] mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-50 text-[#00a651] rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#00a651] mb-2 block">Order Confirmed</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">
            We've sent a full confirmation receipt to <span className="font-semibold text-gray-800">{placedOrder.email}</span>. Your order will be dispatched shortly.
          </p>

          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-800 mb-8">
            Order Reference: <span className="text-[#00a651]">{placedOrder.id}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(placedOrder.id);
                showToast('Copied to Clipboard!', 'info', placedOrder.id);
              }}
              title="Copy Order ID"
              className="text-gray-400 hover:text-gray-700 ml-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              to={`/track-order?orderId=${placedOrder.id}`}
              className="bg-[#00a651] hover:bg-[#008c44] text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#00a651]/20 cursor-pointer"
            >
              <Truck className="w-4 h-4" /> Track Package
            </Link>
            <button 
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <Link
              to="/account"
              className="border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 px-5 py-3 rounded-xl font-bold text-xs transition-colors"
            >
              View in My Orders
            </Link>
          </div>

          {/* Detailed Receipt Breakdown Box */}
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 max-w-xl mx-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs text-gray-500">
              <span>Date: {placedOrder.date}</span>
              <span>Payment: {placedOrder.paymentMethod}</span>
            </div>

            <div className="space-y-3">
              {placedOrder.items.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <img src={it.image} alt={it.title} className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-200 p-0.5 shrink-0 mix-blend-multiply" />
                    <div className="truncate">
                      <p className="font-bold text-gray-900 truncate">{it.title}</p>
                      <p className="text-[11px] text-gray-500">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(placedOrder.subtotal)}</span>
              </div>
              {placedOrder.discount > 0 && (
                <div className="flex justify-between text-[#00a651] font-semibold">
                  <span>Discount:</span>
                  <span>-{formatPrice(placedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{placedOrder.shippingCost === 0 ? 'FREE' : formatPrice(placedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-[#00a651]">{formatPrice(placedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 text-xs text-gray-600">
              <p className="font-bold text-gray-900 mb-0.5">Shipping Address:</p>
              <p>{placedOrder.customer} · {placedOrder.phone}</p>
              <p>{placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city} {placedOrder.shippingAddress.zip}</p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              to="/" 
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------------- MAIN CHECKOUT FORM VIEW ----------------
  return (
    <main className="max-w-[1440px] mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your order details with secure encrypted checkout.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Columns - Form Sections */}
        <div className="flex-1 w-full space-y-6">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Customer & Delivery Address */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00a651] text-white flex items-center justify-center text-xs font-bold">1</div>
                  Customer & Shipping Address
                </h2>
                {currentUser && (
                  <span className="text-xs text-[#00a651] font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Logged in as {currentUser.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">First Name *</label>
                  <input 
                    required 
                    value={form.firstName} 
                    onChange={e => setForm({...form, firstName: e.target.value})} 
                    type="text" 
                    placeholder="Alex"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Last Name *</label>
                  <input 
                    required 
                    value={form.lastName} 
                    onChange={e => setForm({...form, lastName: e.target.value})} 
                    type="text" 
                    placeholder="Johnson"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Email Address *</label>
                  <input 
                    required 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    type="email" 
                    placeholder="alex@example.com"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Phone Number *</label>
                  <input 
                    required 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    type="tel" 
                    placeholder="+1 (917) 722-7425"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Street Address *</label>
                  <input 
                    required 
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    type="text" 
                    placeholder="1234 Broadway Ave, Apt 4B"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">City *</label>
                  <input 
                    required 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    type="text" 
                    placeholder="New York"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Postal / ZIP Code *</label>
                  <input 
                    required 
                    value={form.zip} 
                    onChange={e => setForm({...form, zip: e.target.value})} 
                    type="text" 
                    placeholder="10001"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Delivery Notes (Optional)</label>
                  <input 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                    type="text" 
                    placeholder="E.g. Ring the doorbell, gate access code #4321"
                    className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none transition-all" 
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping Method Selection */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#00a651] text-white flex items-center justify-center text-xs font-bold">2</div>
                Select Shipping Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label 
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    shippingMethod === 'standard' 
                      ? 'border-[#00a651] bg-emerald-50/40 ring-1 ring-[#00a651]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">Standard Courier</span>
                    <Truck className="w-4 h-4 text-[#00a651]" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">3–5 Business Days</p>
                  <span className="text-sm font-bold text-gray-900">
                    {cartTotal >= 50 ? <span className="text-[#00a651]">FREE</span> : '$5.99'}
                  </span>
                </label>

                <label 
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    shippingMethod === 'express' 
                      ? 'border-[#00a651] bg-emerald-50/40 ring-1 ring-[#00a651]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">Express Priority</span>
                    <Clock className="w-4 h-4 text-[#ff6600]" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">1–2 Business Days</p>
                  <span className="text-sm font-bold text-gray-900">$9.99</span>
                </label>

                <label 
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    shippingMethod === 'pickup' 
                      ? 'border-[#00a651] bg-emerald-50/40 ring-1 ring-[#00a651]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">Store Pickup</span>
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Ready in 2 Hours</p>
                  <span className="text-sm font-bold text-[#00a651]">FREE</span>
                </label>
              </div>
            </section>

            {/* 3. Payment Method Selection */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#00a651] text-white flex items-center justify-center text-xs font-bold">3</div>
                Payment Method
              </h2>

              <div className="space-y-3 mb-6">
                <label 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[#00a651] bg-emerald-50/30 ring-1 ring-[#00a651]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                      <Banknote className="w-5 h-5 text-[#00a651]" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Cash on Delivery (COD)</span>
                      <span className="text-xs text-gray-500">Pay conveniently with cash or card upon receiving your package.</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#00a651] bg-[#00a651]' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>

                <label 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-[#00a651] bg-emerald-50/30 ring-1 ring-[#00a651]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Credit / Debit Card</span>
                      <span className="text-xs text-gray-500">Visa, MasterCard, American Express, UnionPay</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#00a651] bg-[#00a651]' : 'border-gray-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>

                <label 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'wallet' ? 'border-[#00a651] bg-emerald-50/30 ring-1 ring-[#00a651]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">Digital Wallet / Mobile Banking</span>
                      <span className="text-xs text-gray-500">Apple Pay, PayPal, bKash / Nagad Instant Pay</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#00a651] bg-[#00a651]' : 'border-gray-300'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              </div>

              {/* Card inputs if card selected */}
              {paymentMethod === 'card' && (
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Name on Card</label>
                    <input 
                      type="text" 
                      value={cardData.name} 
                      onChange={e => setCardData({...cardData, name: e.target.value})} 
                      placeholder="John Doe" 
                      className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      value={cardData.number} 
                      onChange={e => setCardData({...cardData, number: e.target.value})} 
                      placeholder="4242 •••• •••• 4242" 
                      className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm font-mono outline-none focus:border-[#00a651]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        value={cardData.expiry} 
                        onChange={e => setCardData({...cardData, expiry: e.target.value})} 
                        placeholder="MM/YY" 
                        className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">CVC / CVV</label>
                      <input 
                        type="password" 
                        maxLength={4} 
                        value={cardData.cvc} 
                        onChange={e => setCardData({...cardData, cvc: e.target.value})} 
                        placeholder="123" 
                        className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#00a651]" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Right Column - Order Summary & Payment Button */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
              Order Summary ({totalItems})
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item: any) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0 relative overflow-hidden">
                    <img 
                      src={item.product.image || item.product.images?.[0]} 
                      alt={item.product.title} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.product.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.product.selectedColor || item.product.selectedSize ? `${item.product.selectedColor || ''} ${item.product.selectedSize ? `· Size: ${item.product.selectedSize}` : ''}` : formatPrice(item.product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-4 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#00a651]" />
                    {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                  </span>
                  <button 
                    onClick={removeCoupon} 
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                    placeholder="Coupon (e.g. WELCOME10)" 
                    className="flex-1 h-10 border border-gray-300 rounded-xl px-3 text-xs outline-none focus:border-[#00a651] uppercase" 
                  />
                  <button 
                    type="submit" 
                    className="px-4 h-10 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#00a651] font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold text-gray-900">
                  {shippingCost === 0 ? <span className="text-[#00a651]">FREE</span> : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax:</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-gray-900 block">Total Amount</span>
                <span className="text-[11px] text-gray-400">Includes all taxes and delivery</span>
              </div>
              <span className="text-2xl font-black text-[#00a651]">
                {formatPrice(grandTotal)}
              </span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#00a651] hover:bg-[#008c44] text-white text-[15px] font-bold rounded-full transition-all shadow-[0_4px_16px_rgba(0,166,81,0.3)] hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Place Order ({formatPrice(grandTotal)})
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Bank-grade 256-Bit SSL Encrypted Security</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
