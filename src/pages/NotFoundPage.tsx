import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found';
  }, []);

  return (
    <main className="min-h-[55vh] flex flex-col items-center justify-center px-4 text-center py-16">
      <SearchX className="w-12 h-12 text-gray-300 mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 text-[15px] mb-7 max-w-[420px]">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="px-6 h-11 bg-[#ff5c00] text-white font-bold rounded-xl hover:brightness-95 flex items-center">
          Go home
        </Link>
        <Link to="/search" className="px-6 h-11 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center">
          Search products
        </Link>
      </div>
    </main>
  );
}
