import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Filter, Star } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);

  const { products } = useAdmin();

  // Extract unique brands from mock data
  const availableBrands = useMemo(() => {
    const brands = products.map((p: any) => String(p.brand || p.specs?.Brand || p.title.split(' ')[0]));
    return Array.from(new Set<string>(brands)).filter(Boolean);
  }, [products]);

  const results = useMemo(() => {
    const filtered = products.filter((p: any) => {
      // 1. Search Query Match
      if (query && !p.title.toLowerCase().includes(query.toLowerCase()) && !p.code?.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // 2. Brand Filter
      const productBrand = p.specs?.Brand || p.title.split(' ')[0];
      if (selectedBrands.length > 0 && !selectedBrands.includes(productBrand)) {
        return false;
      }

      // 3. Price Filter
      const finalPrice = p.discount ? p.price * (1 - p.discount/100) : p.price; // or just p.price if it's already discounted
      // Wait, in mockData, price is the final discounted price usually, but let's use p.price
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;

      // 4. Rating Filter
      if (minRating && (p.rating || 0) < minRating) return false;

      return true;
    });
    return filtered.reverse();
  }, [query, selectedBrands, minPrice, maxPrice, minRating, products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <main className="max-w-[1600px] mx-auto px-4 py-8">
       <div className="flex items-center gap-2 mb-8">
         <h1 className="text-2xl font-bold text-gray-900">
           {query ? `Search results for "${query}"` : category ? `Browsing Category: ${category}` : "All Products"}
         </h1>
         <span className="text-gray-500 text-sm mt-1">({results.length} results)</span>
       </div>

       <div className="flex flex-col lg:flex-row gap-8">
         {/* Filters Sidebar */}
         <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
               <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-gray-100">
                 <Filter className="w-5 h-5" /> Filters
               </div>

               {/* Price Filter */}
               <div className="mb-8">
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Price</h4>
                 <div className="flex items-center gap-2">
                   <div className="flex-1 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                     <input 
                       type="number" 
                       value={minPrice}
                       onChange={(e) => setMinPrice(e.target.value)}
                       placeholder="Min" 
                       className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a651]"
                     />
                   </div>
                   <span className="text-gray-400">-</span>
                   <div className="flex-1 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                     <input 
                       type="number" 
                       value={maxPrice}
                       onChange={(e) => setMaxPrice(e.target.value)}
                       placeholder="Max" 
                       className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#00a651]"
                     />
                   </div>
                 </div>
               </div>

               {/* Brand Filter */}
               <div className="mb-8">
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Brand</h4>
                 <div className="space-y-2">
                   {availableBrands.map(brand => (
                     <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="checkbox"
                         className="hidden"
                         checked={selectedBrands.includes(brand)}
                         onChange={() => toggleBrand(brand)}
                       />
                       <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedBrands.includes(brand) ? 'bg-[#00a651] border-[#00a651]' : 'border-gray-300 group-hover:border-[#00a651]'}`}>
                          {selectedBrands.includes(brand) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                       </div>
                       <span className="text-sm text-gray-700">{brand}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* Rating Filter */}
               <div>
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Rating</h4>
                 <div className="space-y-2">
                   {[4, 3, 2, 1].map(rating => (
                     <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio"
                         name="rating"
                         checked={minRating === rating}
                         onChange={() => setMinRating(rating)}
                         className="hidden"
                       />
                       <div className={`w-4 h-4 rounded-full border transition-colors ${minRating === rating ? 'border-[4px] border-[#00a651]' : 'border-gray-300 group-hover:border-[#00a651]'}`} />
                       <div className="flex items-center">
                         {Array(5).fill(0).map((_, i) => (
                           <Star 
                             key={i} 
                             className={`w-4 h-4 ${i < rating ? 'text-[#ffb200] fill-[#ffb200]' : 'text-gray-200 fill-gray-200'}`} 
                           />
                         ))}
                         <span className="text-sm text-gray-600 ml-2">& up</span>
                       </div>
                     </label>
                   ))}
                   {minRating !== null && (
                     <button 
                       onClick={() => setMinRating(null)}
                       className="text-sm text-blue-500 hover:underline mt-2 inline-block cursor-pointer"
                     >
                       Clear rating filter
                     </button>
                   )}
                 </div>
               </div>

            </div>
         </aside>

         {/* Results Grid */}
         <div className="flex-1">
           {results.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
               {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
             </div>
           ) : (
             <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">No products match your filters</h2>
                <p className="text-gray-500 mb-4">Try adjusting your price range or removing some filters.</p>
                <button 
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedBrands([]); setMinRating(null); }}
                  className="bg-[#00a651] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#008c44] transition-colors"
                >
                  Clear all filters
                </button>
             </div>
           )}
         </div>
       </div>
    </main>
  );
}
