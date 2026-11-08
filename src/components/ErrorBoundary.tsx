import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so a single broken component cannot leave the customer
 * staring at a blank white page.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Wire this to your error reporting service (Sentry, etc.) when you have one.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-[14px] mb-6 max-w-[420px]">
          The page failed to load. Refreshing usually fixes it — if it keeps happening, please let us know.
        </p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()}
            className="px-5 h-11 bg-[#ff5c00] text-white font-bold rounded-xl hover:brightness-95">
            Reload the page
          </button>
          <a href="/" className="px-5 h-11 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center">
            Go home
          </a>
        </div>
        {import.meta.env.DEV && (
          <pre className="mt-8 text-left text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 max-w-[720px] overflow-auto">
            {this.state.error.stack || this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
