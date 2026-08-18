import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Package, LogOut, KeyRound, Loader2, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

function Panel({ title, subtitle, children }: any) {
  return (
    <div className="max-w-[460px] mx-auto px-4 py-14">
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-[13px] mb-4">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

const inputClass =
  'w-full h-11 bg-white border border-gray-300 rounded-xl px-4 outline-none focus:border-[#ff5c00] text-[14px]';

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = new URLSearchParams(location.search).get('next') || '/account';

  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Sign in" subtitle="Access your orders and saved details.">
      <ErrorNote>{error}</ErrorNote>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="email" required autoComplete="email" placeholder="Email address" className={inputClass}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required autoComplete="current-password" placeholder="Password" className={inputClass}
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" disabled={busy}
          className="h-11 bg-[#ff5c00] hover:brightness-95 disabled:opacity-60 text-white font-bold rounded-xl mt-1 flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
        </button>
      </form>
      <p className="text-[13px] text-gray-500 mt-5 text-center">
        No account? <Link to="/register" className="text-[#0058a3] hover:underline font-medium">Create one</Link>
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Register                                                            */
/* ------------------------------------------------------------------ */

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate('/account', { replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/account', { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Create an account" subtitle="Checkout faster and track your orders.">
      <ErrorNote>{error}</ErrorNote>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="text" required autoComplete="name" placeholder="Full name" className={inputClass}
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" required autoComplete="email" placeholder="Email address" className={inputClass}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required autoComplete="new-password" placeholder="Password" className={inputClass}
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="text-[12px] text-gray-500 -mt-1">At least 10 characters, including a letter and a number.</p>
        <button type="submit" disabled={busy}
          className="h-11 bg-[#ff5c00] hover:brightness-95 disabled:opacity-60 text-white font-bold rounded-xl mt-1 flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create account
        </button>
      </form>
      <p className="text-[13px] text-gray-500 mt-5 text-center">
        Already registered? <Link to="/login" className="text-[#0058a3] hover:underline font-medium">Sign in</Link>
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Account + order history                                             */
/* ------------------------------------------------------------------ */

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLE[status] || STATUS_STYLE.pending}`}>
      {status}
    </span>
  );
}

export function AccountPage() {
  const { user, loading, logout, changePassword } = useAuth();
  const { formatPrice } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMsg, setPwMsg] = useState({ error: '', ok: '' });

  useEffect(() => {
    if (!loading && !user) navigate('/login?next=/account', { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get<{ orders: any[] }>('/orders').then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  }, [user]);

  if (loading || !user) {
    return <div className="max-w-[900px] mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>;
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ error: '', ok: '' });
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      setPwMsg({ error: '', ok: 'Password updated. Other devices have been signed out.' });
    } catch (err: any) {
      setPwMsg({ error: err?.message ?? 'Could not change password.', ok: '' });
    }
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-[13px] text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link to="/admin" className="text-[13px] font-semibold text-[#0058a3] hover:underline">Admin panel</Link>
          )}
          <button onClick={async () => { await logout(); navigate('/'); }}
            className="text-[13px] font-semibold text-gray-600 hover:text-red-600 flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" /> Your orders
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-[14px] border border-gray-200 rounded-xl p-6 text-center">
            No orders yet. <Link to="/" className="text-[#0058a3] hover:underline">Start shopping</Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o) => (
              <Link key={o.number} to={`/order/${o.number}`}
                className="border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-[14px]">Order {o.number}</div>
                  <div className="text-[12px] text-gray-500">
                    {new Date(o.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString()} · {o.items.length} item(s)
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={o.status} />
                  <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-[420px]">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4" /> Change password
        </h2>
        <ErrorNote>{pwMsg.error}</ErrorNote>
        {pwMsg.ok && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2.5 text-[13px] mb-4">{pwMsg.ok}</div>
        )}
        <form onSubmit={submitPassword} className="flex flex-col gap-3">
          <input type="password" required autoComplete="current-password" placeholder="Current password" className={inputClass}
            value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input type="password" required autoComplete="new-password" placeholder="New password" className={inputClass}
            value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <button type="submit" className="h-11 bg-gray-900 hover:bg-black text-white font-bold rounded-xl">Update password</button>
        </form>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Wishlist (kept client-side)                                         */
/* ------------------------------------------------------------------ */

export function WishlistPage() {
  return (
    <main className="max-w-[900px] mx-auto px-4 py-20 text-center">
      <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wish list</h1>
      <p className="text-gray-500 mb-6">Items you save will appear here.</p>
      <Link to="/" className="text-[#0058a3] hover:underline font-medium">Browse products</Link>
    </main>
  );
}
