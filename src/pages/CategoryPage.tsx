import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, Filter, Grid, List as ListIcon, LayoutGrid } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';

const CATEGORY_ITEMS = [
  { name: 'Computers, laptops, tablets', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80' },
  { name: 'Car electronics', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=300&q=80' },
  { name: 'TVs and multimedia', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cellphones', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80' },
  { name: 'MP3 Players', image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Photo & Video cameras, accessories', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80' },
  { name: 'Gaming Consoles', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=300&q=80' },
  { name: 'Clothes and Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
  { name: 'Office tools', image: 'https://images.unsplash.com/photo-1524749292158-7540c2494485?auto=format&fit=crop&w=300&q=80' },
  { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=300&q=80' },
];

const SIDEBAR_CATEGORIES = [
  { name: 'Computers', count: 30 },
  { name: 'Car Electronics', count: 27 },
  { name: 'TV & Video', count: 16 },
  { name: 'Cell Phones', count: 28 },
  { name: 'MP3 Players', count: 23 },
  { name: 'Cameras & Photo', count: 17 },
  { name: 'Game consoles', count: 9 },
];

export function CategoryPage() {
  const { id } = useParams();
  const title = id ? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ') : 'Categories';
  
  const { products } = useAdmin();
  const { localizeCategory } = useLang();

  return (
    <main className="w-full bg-white font-sans">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
          <Link to="/" className="hover:text-[#00a651] transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">{title}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

        {/* Subcategories Horizontal List */}
        <div className="flex overflow-x-auto pb-6 mb-8 gap-4 sm:gap-8 scrollbar-hide border-b border-gray-200">
          {CATEGORY_ITEMS.map((item, idx) => (
            <Link to={`/category/${item.name.toLowerCase().replace(/\s+/g, '-')}`} key={idx} className="flex flex-col items-center min-w-[100px] max-w-[120px] text-center cursor-pointer group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center p-2 mb-3">
                <img src={item.image || undefined} alt={item.name} className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-110 object-center mix-blend-multiply" />
              </div>
              <span className="text-sm text-gray-700 font-medium group-hover:text-[#00a651] transition-colors leading-tight">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Filters Top Bar */}
        <div className="flex flex-wrap items-center justify-between py-4 border-b border-t border-gray-900 mb-8 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-[14px] font-medium hover:border-gray-400 transition-colors cursor-pointer bg-white">
              <Filter className="w-4 h-4" /> Filters <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 placeholder:text-gray-400 transition-colors cursor-pointer">
              Price <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
              Brand <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer hidden sm:flex">
              Color <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer hidden md:flex">
              Display <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer hidden lg:flex">
              Storage Capacity <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer hidden xl:flex">
              Operating System <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded text-[14px] text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer hidden 2xl:flex">
              Size <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-[14px] font-medium hover:border-gray-400 transition-colors cursor-pointer bg-white">
            <LayoutGrid className="w-4 h-4" /> Categories <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] flex-shrink-0">
            <div className="border border-gray-200 rounded-xl p-5 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Categories</h3>
              
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-3 border-l-[3px] border-[#ef4444] pl-3 py-0.5">
                <span>{title}</span>
                <span className="text-gray-500 font-medium">152</span>
              </div>
              
              <ul className="space-y-0 text-sm">
                {SIDEBAR_CATEGORIES.map((cat, idx) => (
                  <li key={idx}>
                    <Link to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#00a651] transition-colors group">
                      <span className="font-medium group-hover:pl-1 transition-all">{cat.name}</span>
                      <span className="text-gray-400 bg-gray-50 group-hover:bg-white text-[11px] font-bold px-2 py-0.5 rounded-full">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sorting & Views */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                  Sort by: <span className="text-[#3b82f6] font-medium flex items-center">Newest Items First <ChevronRight className="w-3.5 h-3.5 rotate-90 ml-1" /></span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                  Show: <span className="text-[#3b82f6] font-medium flex items-center">29 <ChevronRight className="w-3.5 h-3.5 rotate-90 ml-1" /></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-[#3b82f6] cursor-pointer"><Grid className="w-5 h-5 fill-current" /></button>
                <button className="text-gray-400 hover:text-gray-700 cursor-pointer"><ListIcon className="w-5 h-5" /></button>
                <button className="text-gray-400 hover:text-gray-700 cursor-pointer hidden sm:block"><LayoutGrid className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...products].reverse().map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
