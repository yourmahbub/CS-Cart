import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart, formatPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#00a651]/20 rounded-full blur-[30px] animate-pulse"></div>
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <ShoppingBag className="w-12 h-12 text-[#00a651]" strokeWidth={1.5} />
             {/* Small accent dots */}
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

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cart Items */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 pb-4 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
            <div className="w-[50%]">Product</div>
            <div className="w-[20%] text-center">Quantity</div>
            <div className="w-[20%] text-right">Price</div>
            <div className="w-[10%] text-right"></div>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center py-6 px-2">
                <div className="w-[50%] flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl p-2 flex-shrink-0">
                    <img src={item.product.image || undefined} alt={item.product.title} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <Link to={`/product/${item.product.id}`} className="text-[14px] font-bold text-gray-900 hover:text-[#00a651] line-clamp-2">
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 font-mono">CODE: {item.product.code}</p>
                  </div>
                </div>

                <div className="w-[20%] flex justify-center">
                  <div className="flex items-center border border-gray-200 rounded-full h-10 w-[100px] overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-1/3 h-full flex items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-1/3 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="w-[20%] text-right text-[16px] font-bold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </div>

                <div className="w-[10%] flex justify-end">
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping estimate</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax estimate</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button className="w-full bg-[#00a651] hover:bg-[#008c44] text-white text-[15px] font-bold py-4 rounded-full transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
