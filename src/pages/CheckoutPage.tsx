import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StatusBadge } from './UserPages';

const input =
  'w-full h-11 bg-white border border-gray-300 rounded-xl px-4 outline-none focus:border-[#ff5c00] text-[14px]';

export function CheckoutPage() {
  const { lines, subtotal, shipping, tax, total, formatPrice, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [methods, setMethods] = useState<any[]>([]);
  const [form, setForm] = useState({
    email: '', phone: '', fullName: '', line1: '', line2: '',
    city: '', region: '', postcode: '', country: '', note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<{ paymentMethods: any[] }>('/checkout/options')
      .then((d) => {
        setMethods(d.paymentMethods);
        if (d.paymentMethods[0]) setPaymentMethod(d.paymentMethods[0].id);
      })
      .catch(() => setMethods([{ id: 'cod', label: 'Cash on delivery' }]));
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, email: f.email || user.email, fullName: f.fullName || user.name }));
  }, [user]);

  useEffect(() => {
    if (params.get('cancelled')) setError('Payment was cancelled. Your cart is unchanged.');
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post<{ orderNumber: string; redirectUrl?: string }>('/checkout', {
        email: form.email,
        phone: form.phone,
        paymentMethod,
        note: form.note,
        address: {
          fullName: form.fullName, line1: form.line1, line2: form.line2,
          city: form.city, region: form.region, postcode: form.postcode, country: form.country,
        },
      });
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      await refreshCart();
      navigate(`/order/${res.orderNumber}`, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Could not place your order.');
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="max-w-[900px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
        <Link to="/" className="text-[#0058a3] hover:underline font-medium">Continue shopping</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1100px] mx-auto px-4 py-8">
      <Link to="/cart" className="text-[13px] text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="flex flex-col gap-6">
          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">Contact</h2>
            {!user && (
              <p className="text-[12.5px] text-gray-500 mb-3">
                <Link to="/login?next=/checkout" className="text-[#0058a3] hover:underline">Sign in</Link> to save this order to your account, or continue as a guest.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <input type="email" required placeholder="Email address" className={input}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="tel" placeholder="Phone (optional)" className={input}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" className={`${input} sm:col-span-2`}
                value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input required placeholder="Address line 1" className={`${input} sm:col-span-2`}
                value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <input placeholder="Address line 2 (optional)" className={`${input} sm:col-span-2`}
                value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              <input required placeholder="City" className={input}
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input placeholder="State / region" className={input}
                value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              <input required placeholder="Postcode" className={input}
                value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
              <input required placeholder="Country" className={input}
                value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">Payment</h2>
            <div className="flex flex-col gap-2">
              {methods.map((m) => (
                <label key={m.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="w-4 h-4" style={{ accentColor: '#ff5c00' }} />
                  <span className="text-[13.5px] text-gray-700">{m.label}</span>
                </label>
              ))}
            </div>
            {paymentMethod === 'stripe' && (
              <p className="text-[12px] text-gray-500 mt-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> You'll be redirected to Stripe to pay securely.
              </p>
            )}
            {paymentMethod === 'bank' && (
              <p className="text-[12px] text-gray-500 mt-3">Transfer instructions will be emailed after you place the order.</p>
            )}
          </section>

          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">Order note</h2>
            <textarea rows={3} placeholder="Anything we should know?" value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#ff5c00] resize-y" />
          </section>
        </div>

        <aside className="border border-gray-200 rounded-xl p-5 lg:sticky lg:top-4">
          <h2 className="font-bold text-gray-900 mb-4">Order summary</h2>
          <div className="flex flex-col gap-3 mb-4 max-h-[280px] overflow-y-auto">
            {lines.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 border border-gray-100 rounded-lg p-1 shrink-0">
                  {l.image && <img src={l.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] text-gray-900 line-clamp-2 leading-snug">{l.title}</div>
                  <div className="text-[11px] text-gray-500">
                    {[l.options?.color, l.options?.size].filter(Boolean).join(' · ')} × {l.quantity}
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-gray-900 shrink-0">{formatPrice(l.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5 text-[13px]">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span><span>{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
            </div>
            {tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(tax)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-[16px] border-t border-gray-200 pt-2 mt-1">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={busy}
            className="w-full h-12 mt-5 bg-[#ff5c00] hover:brightness-95 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {paymentMethod === 'stripe' ? 'Continue to payment' : 'Place order'}
          </button>
        </aside>
      </form>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Order confirmation / detail                                         */
/* ------------------------------------------------------------------ */

export function OrderPage() {
  const { number } = useParams();
  const { formatPrice } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<{ order: any }>(`/orders/${number}`)
      .then((d) => setOrder(d.order))
      .catch((err) => setError(err?.message ?? 'Order not found.'));
  }, [number]);

  if (error) {
    return (
      <main className="max-w-[700px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{error}</h1>
        <Link to="/" className="text-[#0058a3] hover:underline font-medium">Return home</Link>
      </main>
    );
  }
  if (!order) return <main className="max-w-[700px] mx-auto px-4 py-20 text-center text-gray-500">Loading…</main>;

  const addr = order.shippingAddress || {};

  return (
    <main className="max-w-[760px] mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <CheckCircle2 className="w-12 h-12 text-[#00a651] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Thank you for your order</h1>
        <p className="text-gray-500 text-[14px]">
          Order <span className="font-semibold text-gray-900">{order.number}</span> · a confirmation was sent to {order.email}
        </p>
        <div className="mt-3"><StatusBadge status={order.status} /></div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-5">
        <h2 className="font-bold text-gray-900 mb-3">Items</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((it: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 border border-gray-100 rounded-lg p-1 shrink-0">
                {it.image && <img src={it.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-gray-900 line-clamp-2">{it.title}</div>
                <div className="text-[11.5px] text-gray-500">
                  {Object.values(it.options || {}).filter(Boolean).join(' · ')} × {it.quantity}
                </div>
              </div>
              <span className="text-[13px] font-semibold shrink-0">{formatPrice(it.unitPrice * it.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-4 pt-3 flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping > 0 ? formatPrice(order.shipping) : 'Free'}</span></div>
          {order.tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
          <div className="flex justify-between font-bold text-gray-900 text-[16px] border-t border-gray-200 pt-2 mt-1">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-2">Shipping to</h2>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {addr.fullName}<br />{addr.line1}{addr.line2 ? <><br />{addr.line2}</> : null}<br />
            {addr.city}{addr.region ? `, ${addr.region}` : ''} {addr.postcode}<br />{addr.country}
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-2">Payment</h2>
          <p className="text-[13px] text-gray-600 capitalize">
            {order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod === 'bank' ? 'Bank transfer' : 'Card'}
            {' · '}<span className="capitalize">{order.paymentStatus}</span>
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/" className="text-[#0058a3] hover:underline font-medium text-[14px]">Continue shopping</Link>
      </div>
    </main>
  );
}
