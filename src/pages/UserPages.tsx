import React from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, BarChart2, MessageSquare, Package } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <User className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
        <p className="text-gray-500 mb-8">This is a mock template. Authentication is not currently implemented.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Email address" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
          <input type="password" placeholder="Password" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
          <button className="w-full h-12 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl transition-colors mt-2">Sign In</button>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <User className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-500 mb-8">This is a mock template. Authentication is not currently implemented.</p>
        <div className="space-y-4">
          <input type="text" placeholder="Full name" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
          <input type="email" placeholder="Email address" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
          <input type="password" placeholder="Password" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
          <button className="w-full h-12 bg-[#00a651] hover:bg-[#008c44] text-white font-bold rounded-xl transition-colors mt-2">Register</button>
        </div>
      </div>
    </div>
  );
}

export function WishlistPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-rose-300" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist</h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">Keep track of the products you love. Add items to your wishlist using the heart icon on any product.</p>
      <Link to="/" className="inline-flex bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3 rounded-full font-bold transition-colors">
        Start Browsing
      </Link>
    </div>
  );
}


