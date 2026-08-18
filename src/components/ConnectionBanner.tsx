import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

/**
 * The storefront is useless without the API, and an empty catalogue looks
 * identical to a catalogue that failed to load. This says which it is.
 */
export function ConnectionBanner() {
  const { loadError, reload, loading } = useAdmin();
  const [retrying, setRetrying] = useState(false);

  if (loading || !loadError) return null;

  const retry = async () => {
    setRetrying(true);
    try { await reload(); } finally { setRetrying(false); }
  };

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <AlertTriangle className="w-[18px] h-[18px] text-red-600 shrink-0 mt-0.5" />
          <div className="text-[13px] text-red-800">
            <span className="font-semibold">The store could not be loaded.</span>{' '}
            <span className="text-red-700">{loadError}</span>
            {import.meta.env.DEV && (
              <div className="text-[12px] text-red-700/80 mt-1">
                In development the API runs as a separate process — start both with{' '}
                <code className="bg-red-100 px-1 rounded font-mono">npm run dev</code>.
              </div>
            )}
          </div>
        </div>
        <button
          onClick={retry}
          disabled={retrying}
          className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-800 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 disabled:opacity-60"
        >
          {retrying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Try again
        </button>
      </div>
    </div>
  );
}
