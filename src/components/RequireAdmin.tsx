import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Client-side gate for /admin. This is a convenience, not the security boundary —
 * every admin API route independently enforces the admin role on the server.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Checking your session…
      </div>
    );
  }

  if (user && user.role === 'admin') return <>{children}</>;

  if (user && user.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
        <h1 className="text-xl font-bold text-gray-900 mb-1">Administrator access required</h1>
        <p className="text-gray-500 text-sm mb-5">
          You are signed in as {user.email}, which is not an administrator account.
        </p>
        <Navigate to="/" replace state={{ from: location }} />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err?.message ?? 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[380px]">
        <div className="w-11 h-11 rounded-xl bg-[#00a651] flex items-center justify-center mb-4">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Administrator sign in</h1>
        <p className="text-gray-500 text-[13px] mb-5">This area is restricted to store staff.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-[13px] mb-4">{error}</div>
        )}

        <div className="flex flex-col gap-3">
          <input type="email" required autoComplete="email" placeholder="Email address"
            className="w-full h-11 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#00a651] text-[14px]"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" required autoComplete="current-password" placeholder="Password"
            className="w-full h-11 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#00a651] text-[14px]"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={busy}
            className="h-11 bg-[#00a651] hover:bg-[#008c44] disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
