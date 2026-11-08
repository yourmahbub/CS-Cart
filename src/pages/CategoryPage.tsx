import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, Filter, Grid, List as ListIcon, LayoutGrid, Star } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function CategoryPage() {
  const { id } = useParams();
  const title = id ? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ') : 'Categories';
  
  const { products, categories } = useAdmin();

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Extract unique brands, colors, sizes from mock data
  const availableBrands = useMemo(() => {
    const brands = products.map((p: any) => p.specs?.Brand || p.title.split(' ')[0]);
    return Array.from(new Set(brands)).filter(Boolean) as string[];
  }, [products]);

  const availableColors = useMemo(() => {
    return ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Silver', 'Gold'];
  }, []);

  const availableSizes = useMemo(() => {
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }, []);

  const categoryProducts = useMemo(() => {
    let baseProducts = id ? products.filter(p => p.categories?.includes(title) || p.categories?.includes(id.replace(/-/g, ' '))) : products;

    let filtered = baseProducts.filter(p => {
      // Brand Filter
      const productBrand = p.specs?.Brand || p.title.split(' ')[0];
      if (selectedBrands.length > 0 && !selectedBrands.includes(productBrand)) return false;

      // Price Filter
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;

      // Rating Filter
      if (minRating && (p.rating || 0) < minRating) return false;

      // Colors Filter
      if (selectedColors.length > 0) {
        const pColors = p.specs?.Color ? [p.specs.Color] : [];
        const hasColor = selectedColors.some(c => pColors.includes(c) || p.title.toLowerCase().includes(c.toLowerCase()));
        if (!hasColor) return false;
      }

      // Size Filter
      if (selectedSizes.length > 0) {
        const pSizes = p.specs?.Size ? [p.specs.Size] : [];
        const hasSize = selectedSizes.some(s => pSizes.includes(s) || p.title.includes(s));
        if (!hasSize && (p.specs?.Size || p.title.includes('Size'))) return false; 
      }

      // Availability Filter
      if (inStockOnly && p.stock <= 0) return false;

      return true;
    });

    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }

    return filtered;
  }, [id, title, products, selectedBrands, minPrice, maxPrice, minRating, selectedColors, selectedSizes, inStockOnly, sortBy]);

  const sidebarCategories = categories.map((cat: any) => {
    return {
      ...cat,
      count: products.filter((p: any) => p.categories?.includes(cat.name)).length
    };
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };
  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  return (
    <main className="w-full bg-white font-sans">
      <div className="max-w-[1440px] mx-auto px-4 py-4">
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
          {categories.slice(0, 10).map((item: any) => (
            <Link to={`/category/${item.name.toLowerCase().replace(/\s+/g, '-')}`} key={item.id || item.name} className="flex flex-col items-center min-w-[100px] max-w-[120px] text-center cursor-pointer group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center p-2 mb-3 border border-gray-100 shadow-sm">
                <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 object-center mix-blend-multiply" />
              </div>
              <span className="text-sm text-gray-700 font-medium group-hover:text-[#00a651] transition-colors leading-tight">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] flex-shrink-0">
            <div className="border border-gray-200 rounded-xl p-5 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Categories</h3>
              
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-3 border-l-[3px] border-[#ef4444] pl-3 py-0.5">
                <span>{title}</span>
                <span className="text-gray-500 font-medium">{categoryProducts.length}</span>
              </div>
              
              <ul className="space-y-0 text-sm">
                {sidebarCategories.map((cat: any) => (
                  <li key={cat.id || cat.name}>
                    <Link to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#00a651] transition-colors group">
                      <span className="font-medium group-hover:pl-1 transition-all">{cat.name}</span>
                      <span className="text-gray-400 bg-gray-50 group-hover:bg-white text-[11px] font-bold px-2 py-0.5 rounded-full">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters */}
            <div className="mt-6 border border-gray-200 rounded-xl p-5 bg-white space-y-8">
               <div className="flex items-center gap-2 font-bold text-lg pb-4 border-b border-gray-100">
                 <Filter className="w-5 h-5" /> Filters
               </div>

               {/* Price Filter */}
               <div>
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
               <div>
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
                         name="category_rating"
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

               {/* Availability Filter */}
               <div>
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Availability</h4>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input 
                     type="checkbox"
                     className="hidden"
                     checked={inStockOnly}
                     onChange={(e) => setInStockOnly(e.target.checked)}
                   />
                   <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${inStockOnly ? 'bg-[#00a651] border-[#00a651]' : 'border-gray-300 group-hover:border-[#00a651]'}`}>
                      {inStockOnly && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                   </div>
                   <span className="text-sm text-gray-700">In Stock Only</span>
                 </label>
               </div>

               {/* Size Filter */}
               <div>
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Size</h4>
                 <div className="flex flex-wrap gap-2">
                   {availableSizes.map(size => (
                     <button
                       key={size}
                       onClick={() => toggleSize(size)}
                       className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors ${selectedSizes.includes(size) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'}`}
                     >
                       {size}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Color Filter */}
               <div>
                 <h4 className="font-bold text-[15px] mb-3 text-gray-900">Color</h4>
                 <div className="flex flex-wrap gap-2">
                   {availableColors.map(color => (
                     <button
                       key={color}
                       onClick={() => toggleColor(color)}
                       title={color}
                       className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColors.includes(color) ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'border-gray-200 hover:scale-110'}`}
                       style={{ backgroundColor: color.toLowerCase() }}
                     />
                   ))}
                 </div>
               </div>

               {/* Clear all */}
               {(minPrice || maxPrice || selectedBrands.length > 0 || minRating || selectedColors.length > 0 || selectedSizes.length > 0 || inStockOnly) && (
                 <div className="pt-4 border-t border-gray-100">
                   <button 
                     onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedBrands([]); setMinRating(null); setSelectedColors([]); setSelectedSizes([]); setInStockOnly(false); }}
                     className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                   >
                     Clear filters
                   </button>
                 </div>
               )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sorting & Views */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 hover:text-gray-900 transition-colors relative group">
                  Sort by: 
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[#3b82f6] font-medium bg-transparent outline-none cursor-pointer appearance-none pr-5 relative z-10"
                  >
                    <option value="newest" className="text-black">Newest Items First</option>
                    <option value="price_asc" className="text-black">Price: Low to High</option>
                    <option value="price_desc" className="text-black">Price: High to Low</option>
                    <option value="rating" className="text-black">Rating</option>
                    <option value="popularity" className="text-black">Popularity</option>
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 absolute right-0 top-1/2 -translate-y-1/2 text-[#3b82f6] pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                  Show: <span className="text-[#3b82f6] font-medium flex items-center">{categoryProducts.length}</span>
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
              {categoryProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
