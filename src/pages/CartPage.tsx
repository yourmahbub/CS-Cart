import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { lines, subtotal, shipping, tax, total, updateQuantity, removeFromCart, formatPrice, busy, error } = useCart();

  if (lines.length === 0) {
    return (
      <main className="max-w-[900px] mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add something you like and it'll show up here.</p>
        <Link to="/" className="inline-flex items-center px-6 h-11 bg-[#ff5c00] text-white font-bold rounded-xl hover:brightness-95">
          Start shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1100px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping cart</h1>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Link to={`/product/${l.productId}`} className="w-16 h-16 border border-gray-100 rounded-lg p-1.5 shrink-0">
                {l.image && <img src={l.image} alt={l.title} className="w-full h-full object-contain mix-blend-multiply" />}
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${l.productId}`} className="text-[13.5px] text-gray-900 hover:text-[#0058a3] line-clamp-2 leading-snug">
                  {l.title}
                </Link>
                <div className="text-[11.5px] text-gray-500 mt-0.5">
                  {[l.options?.color, l.options?.size, l.options?.guarantee, l.options?.servicePlan].filter(Boolean).join(' · ')}
                </div>
                {!l.inStock && <div className="text-[11.5px] text-red-600 mt-0.5">Out of stock</div>}
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg h-9 shrink-0">
                <button onClick={() => updateQuantity(i, l.quantity - 1)} disabled={busy}
                  className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40"
                  aria-label="Decrease quantity">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-[13px]">{l.quantity}</span>
                <button onClick={() => updateQuantity(i, l.quantity + 1)} disabled={busy}
                  className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40"
                  aria-label="Increase quantity">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-24 text-right shrink-0">
                <div className="font-bold text-gray-900 text-[14px]">{formatPrice(l.lineTotal)}</div>
                {l.quantity > 1 && <div className="text-[11px] text-gray-400">{formatPrice(l.unitPrice)} each</div>}
              </div>

              <button onClick={() => removeFromCart(i)} disabled={busy}
                className="p-2 text-gray-400 hover:text-red-600 shrink-0 disabled:opacity-40" aria-label="Remove item">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <aside className="border border-gray-200 rounded-xl p-5 lg:sticky lg:top-4">
          <h2 className="font-bold text-gray-900 mb-4">Order summary</h2>
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span><span>{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
            </div>
            {tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(tax)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-[17px] border-t border-gray-200 pt-3 mt-2">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link to="/checkout"
            className="w-full h-12 mt-5 bg-[#ff5c00] hover:brightness-95 text-white font-bold rounded-xl flex items-center justify-center">
            Proceed to checkout
          </Link>
          <Link to="/" className="block text-center text-[13px] text-gray-500 hover:text-gray-900 mt-3">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
