import React, { useState, useMemo } from 'react';
import { Hero } from '../components/Hero';
import { PromoBanners } from '../components/home/PromoBanners';
import { FeaturesStrip } from '../components/home/FeaturesStrip';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { ProductCard } from '../components/ProductCard';
import { useAdmin } from '../context/AdminContext';

type Tab = 'new_arrivals' | 'most_popular' | 'bestsellers' | 'on_sale';


export function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('new_arrivals');
  const [visibleCount, setVisibleCount] = useState(6);


  const { products, homeLayout, loading, loadError } = useAdmin();


  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeTab === 'new_arrivals') {
      list = list.sort((a: any, b: any) => b.id - a.id);
    } else if (activeTab === 'most_popular') {
      // The API always sends an explicit boolean, so `!== false` would let
      // every product through. Match on the flag itself.
      list = list.filter((p: any) => p.isPopular).sort((a: any, b: any) => {
        const diff = (b.reviews || 0) - (a.reviews || 0);
        return diff !== 0 ? diff : b.id - a.id;
      });
    } else if (activeTab === 'bestsellers') {
      list = list.filter((p: any) => p.isBestseller).sort((a: any, b: any) => {
        const diff = (b.rating || 0) - (a.rating || 0);
        return diff !== 0 ? diff : b.id - a.id;
      });
    } else if (activeTab === 'on_sale') {
      list = list.filter((p: any) => p.onSale || p.discount).sort((a: any, b: any) => {
        const diff = (b.discount || 0) - (a.discount || 0);
        return diff !== 0 ? diff : b.id - a.id;
      });
    }
    return list;
  }, [activeTab, products]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setVisibleCount(6);
  };

  const renderSection = (section: any) => {
    if (!section.visible) return null;
    
    switch (section.type) {
      case 'hero_slider':
        return <Hero key={section.id} />;
      case 'categories':
        return <CategoriesGrid key={section.id} />;
      case 'featured_products':
        return (
          <section key={section.id} className="max-w-[1600px] mx-auto px-4 mb-14">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <h2 className="text-[19px] sm:text-[26px] font-bold text-gray-900 flex flex-wrap items-center justify-center gap-x-2 px-2 text-center">
                  Possibly you may be <span className="text-[#00a651]">interested</span>
                </h2>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>
              
              {/* Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2 text-[13px] sm:text-[14px]">
                <button 
                  onClick={() => handleTabChange('new_arrivals')}
                  className={`font-semibold rounded-full px-3.5 sm:px-5 py-1.5 whitespace-nowrap transition-colors ${activeTab === 'new_arrivals' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  New Arrivals
                </button>
                <button 
                  onClick={() => handleTabChange('most_popular')}
                  className={`font-semibold rounded-full px-3.5 sm:px-5 py-1.5 whitespace-nowrap transition-colors ${activeTab === 'most_popular' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  Most Popular
                </button>
                <button 
                  onClick={() => handleTabChange('bestsellers')}
                  className={`font-semibold rounded-full px-3.5 sm:px-5 py-1.5 whitespace-nowrap transition-colors ${activeTab === 'bestsellers' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  Bestsellers
                </button>
                <button 
                  onClick={() => handleTabChange('on_sale')}
                  className={`font-semibold rounded-full px-3.5 sm:px-5 py-1.5 whitespace-nowrap transition-colors ${activeTab === 'on_sale' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  On Sale
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {displayedProducts.map((product: any) => (
                 <ProductCard key={product.id} product={product} />
              ))}
              {/* Skeletons occupy the same footprint as real cards, so the page
                  does not grow and jolt when the catalogue arrives. */}
              {displayedProducts.length === 0 && loading &&
                Array.from({ length: visibleCount }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse" aria-hidden>
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-11/12 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}

              {displayedProducts.length === 0 && !loading && (
                <div className="col-span-full py-10 text-center text-gray-500 text-sm">
                  {loadError
                    ? 'Products could not be loaded — see the message above.'
                    : products.length === 0
                    ? 'No products have been published yet.'
                    : 'No products match this filter.'}
                </div>
              )}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="border-2 border-[#00a651] text-gray-900 font-medium rounded-full px-8 py-2 hover:bg-gray-50 transition-colors"
                 >
                  Show more
                </button>
              </div>
            )}
          </section>
        );
      case 'promo_banners':
        return <PromoBanners key={section.id} />;
      case 'features':
        return <FeaturesStrip key={section.id} />;
      case 'popular_products':
        return (
          <section key={section.id} className="max-w-[1600px] mx-auto px-4 mb-14">
            <div className="text-center mb-6">
              <h2 className="text-[22px] font-bold text-gray-900 flex items-center justify-center gap-2">
                <span className="text-[#00a651]">In demand</span> this week
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...products].sort((a: any, b: any) => (b.reviews || 0) - (a.reviews || 0) || b.id - a.id).slice(0, 12).map((product: any) => (
                 <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="pb-20">
        {homeLayout.map((section: any) => renderSection(section))}
      </div>
    </>
  );
}
