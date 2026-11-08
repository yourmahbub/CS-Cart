import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Package, Truck, CheckCircle2, Clock, 
  MapPin, AlertCircle, ArrowLeft, Printer, ShoppingBag 
} from 'lucide-react';

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('orderId') || '';
  const [orderQuery, setOrderQuery] = useState(initialId);
  const { orders } = useAdmin();
  const { formatPrice } = useCart();
  const [searchedOrder, setSearchedOrder] = useState<any | null>(() => {
    if (initialId) {
      return orders.find((o: any) => o.id?.toLowerCase() === initialId.toLowerCase()) || null;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialId));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = orderQuery.trim().toLowerCase();
    if (!clean) {
      setSearchedOrder(null);
      return;
    }
    const found = orders.find((o: any) => 
      o.id?.toLowerCase() === clean || 
      o.email?.toLowerCase() === clean ||
      o.phone?.includes(clean)
    );
    setSearchedOrder(found || null);
  };

  // Status step calculations
  const getStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
      case 'pending':
        return 1;
      case 'paid':
      case 'confirmed':
        return 2;
      case 'shipped':
      case 'in_transit':
        return 3;
      case 'completed':
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = searchedOrder ? getStep(searchedOrder.status) : 1;

  return (
    <main className="max-w-[1000px] mx-auto px-4 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-16 h-16 bg-[#00a651]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00a651]">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Track Your Order</h1>
        <p className="text-gray-500 text-sm">
          Enter your Order ID (e.g. <span className="font-mono text-gray-800 font-semibold">{orders[0]?.id || 'ORD-4829'}</span>) or contact email to see real-time delivery status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order ID or Email..." 
            className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-2xl shadow-sm outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 text-sm font-medium transition-all"
          />
        </div>
        <button 
          type="submit" 
          className="h-14 px-8 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#00a651]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          Track Package
        </button>
      </form>

      {/* Results View */}
      {hasSearched && (
        searchedOrder ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Bar with Order ID & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-gray-100 text-gray-800 px-3 py-1 rounded-lg">
                    {searchedOrder.id}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    Placed on {searchedOrder.date || 'Recent'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">
                  Estimated Delivery: <span className="text-[#00a651]">In 2–4 Business Days</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
            </div>

            {/* Visual Tracking Progress Bar */}
            <div className="py-6 px-2 sm:px-6 mb-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="relative">
                {/* Connecting Track Line */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0">
                  <div 
                    className="h-full bg-[#00a651] transition-all duration-700" 
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="flex justify-between relative z-10 text-center">
                  {[
                    { step: 1, label: 'Order Placed', icon: Clock, desc: 'Received & Queued' },
                    { step: 2, label: 'Processing', icon: Package, desc: 'Quality Check & Packed' },
                    { step: 3, label: 'Shipped', icon: Truck, desc: 'Out for Courier' },
                    { step: 4, label: 'Delivered', icon: CheckCircle2, desc: 'Delivered to Door' }
                  ].map((s) => {
                    const Icon = s.icon;
                    const isDone = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center max-w-[90px] sm:max-w-[120px]">
                        <div 
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone 
                              ? 'bg-[#00a651] text-white shadow-md shadow-[#00a651]/25 ring-4 ring-white' 
                              : 'bg-white text-gray-400 border-2 border-gray-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold mt-2.5 leading-tight ${isCurrent ? 'text-[#00a651]' : 'text-gray-800'}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5">
                          {s.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery Details & Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00a651]" /> Shipping Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{searchedOrder.customer}</p>
                  <p>{searchedOrder.shippingAddress?.address || 'Street address on file'}</p>
                  <p>{searchedOrder.shippingAddress?.city || 'City'}, {searchedOrder.shippingAddress?.zip || 'Zip Code'}</p>
                  <p className="text-gray-500 pt-1">Phone: {searchedOrder.phone || 'Provided during checkout'}</p>
                  <p className="text-gray-500">Email: {searchedOrder.email || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#00a651]" /> Order Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {(searchedOrder.items || []).map((it: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="truncate pr-2 font-medium text-gray-800">
                          {it.title || it.name || 'Product'} × {it.quantity || 1}
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">
                          {formatPrice(it.price * (it.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                    <span>Total Paid</span>
                    <span className="text-[#00a651]">{formatPrice(searchedOrder.total)}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Payment: <span className="font-medium text-gray-700">{searchedOrder.paymentMethod || 'Credit Card / COD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Order Found</h2>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find an order matching "{orderQuery}". Please check the spelling of your Order ID or contact email and try again.
            </p>
            <Link 
              to="/contacts" 
              className="inline-flex items-center gap-2 text-xs font-bold text-[#00a651] hover:underline"
            >
              Contact customer support for help <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        )
      )}
    </main>
  );
}
