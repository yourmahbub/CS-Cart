import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, ShoppingBag, Star, PlayCircle, Award, Copy, MoveLeft, MoveRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

type Tab = 'new_arrivals' | 'most_popular' | 'bestsellers' | 'on_sale';

const COL1_SLIDES = [
  {
    brand: "Apple",
    title: "Watch",
    titleSub: "Ultra 2",
    description: "Elegance woven\ninto every band.",
    image: "https://images.unsplash.com/photo-1698779512398-a3eaae2d7083?auto=format&fit=crop&w=400&q=80",
    bgClass: "bg-[#fef4ed]",
    accentClass: "bg-[#ff4a11]"
  },
  {
    brand: "Apple",
    title: "Watch",
    titleSub: "Series 9",
    description: "Smarter. Brighter.\nMightier.",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6cb3bf?auto=format&fit=crop&w=400&q=80",
    bgClass: "bg-[#f4f7fe]",
    accentClass: "bg-[#3b82f6]"
  }
];

const COL2_SLIDES = [
  {
    title: "AB: Google Pixel 6 Pro 12/128GB Stormy Black",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80",
    price: "$942",
    oldPrice: "$1,177",
    discount: "-20%",
    rating: "0.0"
  },
  {
    title: "AB: Apple iPhone 15 Pro 256GB Natural Titanium",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
    price: "$1,099",
    oldPrice: "$1,199",
    discount: "-8%",
    rating: "4.9"
  },
  {
    title: "AB: Samsung Galaxy S24 Ultra 512GB Titanium Black",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    price: "$1,299",
    oldPrice: "$1,499",
    discount: "-13%",
    rating: "4.8"
  }
];

const COL3_SLIDES = [
  {
    brand: "Google",
    title: "Pixel 8",
    titleSub: "Pro",
    description: "The best of Google.\nShop now.",
    image: "https://images.unsplash.com/photo-1696446702283-bc12b84d4bf5?auto=format&fit=crop&w=400&q=80",
    bgClass: "bg-[#e4eedd]",
    btnClass: "bg-[#4a634e] hover:bg-[#3d5542]",
    borderClass: "border-transparent"
  },
  {
    brand: "Sony",
    title: "WH-1000",
    titleSub: "XM5",
    description: "Industry leading\nnoise cancellation.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
    bgClass: "bg-[#f3f4f6]",
    btnClass: "bg-[#1f2937] hover:bg-[#111827]",
    borderClass: "border-transparent"
  },
  {
    brand: "Bose",
    title: "Quiet",
    titleSub: "Comfort",
    description: "Legendary noise\ncancellation.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    bgClass: "bg-[#fefce8]",
    btnClass: "bg-[#ca8a04] hover:bg-[#a16207]",
    borderClass: "border-transparent"
  }
];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('new_arrivals');
  const [visibleCount, setVisibleCount] = useState(6);

  const [col1Index, setCol1Index] = useState(0);
  const [col2Index, setCol2Index] = useState(0);
  const [col3Index, setCol3Index] = useState(0);

  const { products, homeLayout } = useAdmin();

  const prevCol2 = () => setCol2Index(i => (i - 1 + COL2_SLIDES.length) % COL2_SLIDES.length);
  const nextCol2 = () => setCol2Index(i => (i + 1) % COL2_SLIDES.length);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeTab === 'new_arrivals') {
      list = list.sort((a: any, b: any) => b.id - a.id);
    } else if (activeTab === 'most_popular') {
      list = list.filter((p: any) => p.isPopular !== false).sort((a: any, b: any) => {
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
          <section key={section.id} className="max-w-[1440px] mx-auto px-4 mb-14">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-5">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <h2 className="text-[20px] sm:text-[26px] font-bold text-gray-900 flex items-center justify-center gap-1.5 sm:gap-2 px-2 text-center flex-wrap">
                  Possibly you may be <span className="text-[#00a651]">interested</span>
                </h2>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>
              
              {/* Tabs */}
              <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 text-[13px] sm:text-[14px] overflow-x-auto max-w-full pb-2 scrollbar-hide px-1">
                <button 
                  onClick={() => handleTabChange('new_arrivals')}
                  className={`font-semibold rounded-full px-4 sm:px-5 py-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'new_arrivals' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  New Arrivals
                </button>
                <button 
                  onClick={() => handleTabChange('most_popular')}
                  className={`font-semibold rounded-full px-4 sm:px-5 py-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'most_popular' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  Most Popular
                </button>
                <button 
                  onClick={() => handleTabChange('bestsellers')}
                  className={`font-semibold rounded-full px-4 sm:px-5 py-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'bestsellers' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  Bestsellers
                </button>
                <button 
                  onClick={() => handleTabChange('on_sale')}
                  className={`font-semibold rounded-full px-4 sm:px-5 py-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'on_sale' ? 'text-gray-900 border border-gray-300 shadow-sm bg-white' : 'text-gray-600 hover:text-gray-900 border border-transparent'}`}
                >
                  On Sale
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {displayedProducts.map((product: any) => (
                 <ProductCard key={product.id} product={product} />
              ))}
              {displayedProducts.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500">
                  No products found for this category.
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
        return (
          <section key={section.id} className="mb-14 overflow-hidden">
            <div className="flex flex-col items-center mb-8 mt-12 w-full max-w-full">
               <div className="relative flex items-center justify-center w-full max-w-[1440px] mx-auto px-3 sm:px-4">
                  <div className="absolute w-full h-[1.5px] border-t-[1.5px] border-gray-200 z-0"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-white px-3 sm:px-6 max-w-full text-center">
                     <h2 className="text-[20px] sm:text-[38px] font-black text-[#111827] tracking-tight px-2 text-center">
                        <span className="text-[#00a651]">Seasonal offers</span> best choice
                     </h2>
                     <Link to="/search" className="text-[13px] sm:text-[14px] text-gray-900 font-medium flex items-center gap-1 hover:bg-gray-50 border border-[#2d3748] transition-colors rounded-full px-4 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
                        Show all products <ChevronRight className="w-4 h-4 ml-1" />
                     </Link>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1440px] mx-auto px-4 xl:px-0">
                {/* Column 1 */}
                <div className="flex flex-col gap-6">
                    {/* Apple Watch Ultra Banner */}
                    <div className={`${COL1_SLIDES[col1Index].bgClass} rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-center min-h-[260px] cursor-pointer`} onClick={() => setCol1Index(i => (i + 1) % COL1_SLIDES.length)}>
                       <div className="z-10 max-w-[55%] relative">
                          <div className="text-gray-600 text-[15px] mb-1 font-medium">{COL1_SLIDES[col1Index].brand}</div>
                          <h3 className="text-[34px] font-black text-[#111827] leading-[1] mb-2 tracking-tight">
                              {COL1_SLIDES[col1Index].title}<br/>
                              {COL1_SLIDES[col1Index].titleSub && <span className="font-extrabold text-[30px]">{COL1_SLIDES[col1Index].titleSub}</span>}
                          </h3>
                          <p className="text-[#555] text-[13px] leading-snug mb-5 whitespace-pre-line">{COL1_SLIDES[col1Index].description}</p>
                          <button className="text-[15px] font-bold text-gray-900 flex items-center gap-1 hover:text-[#00a651] transition-colors">
                             Show more <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                       <div className={`absolute top-1/2 right-[-15%] -translate-y-1/2 w-[340px] h-[340px] rounded-full ${COL1_SLIDES[col1Index].accentClass} z-0`}></div>
                       <img src={COL1_SLIDES[col1Index].image} alt={COL1_SLIDES[col1Index].title} className="absolute right-0 top-1/2 -translate-y-1/2 w-[240px] h-[240px] object-contain z-10 drop-shadow-2xl mix-blend-normal transition-opacity duration-300" key={COL1_SLIDES[col1Index].image} />
                       {/* Paginator dots for ultra */}
                       <div className="absolute bottom-5 left-6 flex justify-start gap-[5px] z-20">
                          {COL1_SLIDES.map((_, i) => (
                             <button key={i} onClick={(e) => { e.stopPropagation(); setCol1Index(i); }} className={`w-[6.5px] h-[6.5px] rounded-full transition-colors ${i === col1Index ? 'bg-[#00a651]' : 'bg-[#00a651] opacity-40'}`}></button>
                          ))}
                       </div>
                    </div>

                    {/* Two smaller watches card */}
                    <div className="bg-[#f8f9fa] rounded-[24px] flex flex-col py-1 border border-gray-100">
                        {/* Product 1 */}
                        <div className="flex items-start gap-5 p-5 border-b border-gray-200/70 relative">
                            <div className="w-[80px] h-[80px] flex-shrink-0 bg-transparent flex items-center justify-center mix-blend-multiply pt-1">
                               <img src="https://images.unsplash.com/photo-1434493789847-2f02dc6cb3bf?auto=format&fit=crop&w=200&q=80" className="object-contain w-full max-h-full" alt="Watch 6 Pink" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[13px] text-[#111827] font-medium leading-[1.3] mb-1.5 pr-4">Apple Watch Series 6 (GPS, 40mm, Gold Aluminum, Pink Sand Sport Band)</h4>
                                <p className="text-[11px] text-gray-500 mb-2 font-mono tracking-wider flex items-center gap-1 uppercase">CODE: <span className="text-gray-500 flex items-center gap-0.5"><Copy className="w-3 h-3"/> W6456477_763A</span></p>
                                <div className="flex items-center gap-1.5 mb-2">
                                   <Star className="w-3.5 h-3.5 text-[#ff6100] fill-[#ff6100]" />
                                   <span className="text-gray-500 text-[12px]">4.3 (Reviews: 25)</span>
                                   <Award className="w-3.5 h-3.5 text-[#ff6100]" />
                                </div>
                                <div className="text-[#00a651] text-[13px] mb-2 font-medium">In stock</div>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-[18px] font-bold text-[#111827]">$33,864</span>
                                   <span className="text-[13px] text-gray-400 line-through tracking-tight block ml-[-4px]">$42,330</span>
                                   <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">-20%</span>
                                </div>
                            </div>
                        </div>
                        {/* Product 2 */}
                        <div className="flex items-start gap-5 p-5 relative">
                            <div className="w-[80px] h-[80px] flex-shrink-0 bg-transparent flex items-center justify-center mix-blend-multiply pt-1">
                               <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80" className="object-contain w-full max-h-full" alt="Watch 6 Black" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[13px] text-[#111827] font-medium leading-[1.3] mb-1.5 pr-4">Apple Watch Series 6 (GPS, 44mm, Space Gray Aluminum, Black Sport Band)</h4>
                                <p className="text-[11px] text-gray-500 mb-2 font-mono tracking-wider flex items-center gap-1 uppercase">CODE: <span className="text-gray-500 flex items-center gap-0.5"><Copy className="w-3 h-3"/> B6456477_8624</span></p>
                                <div className="flex items-center gap-1.5 mb-2">
                                   <Star className="w-3.5 h-3.5 text-[#ff6100] fill-[#ff6100]" />
                                   <span className="text-gray-500 text-[12px]">4.3 (Reviews: 25)</span>
                                   <Award className="w-3.5 h-3.5 text-[#ff6100]" />
                                </div>
                                <div className="text-[#00a651] text-[13px] mb-2 font-medium">In stock</div>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-[18px] font-bold text-[#111827]">$33,864</span>
                                   <span className="text-[13px] text-gray-400 line-through tracking-tight block ml-[-4px]">$42,330</span>
                                   <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">-20%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="bg-[#f8f9fa] rounded-[24px] relative overflow-hidden flex flex-col justify-end items-center h-full group pb-8 border border-gray-100">
                    {/* Fake carousel top nav */}
                    <div className="absolute top-6 right-6 flex gap-2 z-20">
                        <button onClick={prevCol2} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors border border-gray-100/60"><MoveLeft className="w-5 h-5" /></button>
                        <button onClick={nextCol2} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors border border-gray-100/60"><MoveRight className="w-5 h-5" /></button>
                    </div>
                    
                    {/* Top-left partial element showing AirPods crop */}
                    <div className="absolute top-1/4 -left-20 z-0">
                        <img src="https://images.unsplash.com/photo-1606220588913-b3aecb4d27bf?auto=format&fit=crop&w=300&q=80" className="w-[180px] opacity-40 object-contain drop-shadow-xl" alt="Airpods" />
                    </div>
                    <div className="absolute bottom-[22%] left-6 text-[13px] text-gray-400 z-0 hidden lg:block">arging... <span className="text-transparent">AirPods?</span></div>

                    <div className="absolute top-[32%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-20">
                        <span className="bg-[#ff6100] text-white text-[12px] font-bold px-2.5 py-1 rounded-full leading-none shadow-sm">{COL2_SLIDES[col2Index].discount}</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative w-full pt-[80px] pb-[30px] z-10">
                      <img key={COL2_SLIDES[col2Index].image} src={COL2_SLIDES[col2Index].image} alt={COL2_SLIDES[col2Index].title} className="h-[340px] md:h-[390px] w-full max-w-[260px] object-contain drop-shadow-2xl mb-8 group-hover:scale-[1.02] transition-all duration-500 rounded-[32px] mix-blend-multiply ms-4 md:ms-12" />
                    </div>
                    
                    <div className="text-center w-full z-20 px-8">
                        <h4 className="text-[14px] text-[#111827] font-medium leading-[1.3] mb-2 min-h-[46px] flex items-center justify-center">{COL2_SLIDES[col2Index].title}</h4>
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <Star className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />
                            <span className="text-gray-500 text-[12px]">{COL2_SLIDES[col2Index].rating}</span>
                            <Award className="w-3.5 h-3.5 text-[#ff6100]" />
                        </div>
                        <div className="text-[#00a651] text-[14px] font-medium mb-1">In stock</div>
                        <div className="flex items-baseline justify-center gap-2 mb-6">
                            <span className="text-[24px] font-bold text-[#111827]">{COL2_SLIDES[col2Index].price}</span>
                            <span className="text-[15px] text-gray-400 line-through tracking-tight block ml-[-4px]">{COL2_SLIDES[col2Index].oldPrice}</span>
                            <span className="text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 py-[1px]">{COL2_SLIDES[col2Index].discount}</span>
                        </div>
                        <button className="bg-[#00a651] text-white py-2.5 px-8 rounded-full text-[15px] font-bold hover:bg-[#008c44] transition-colors w-[150px] mx-auto shadow-[0_2px_10px_rgba(0,166,81,0.3)]">
                            Add to cart
                        </button>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-6">
                    {/* Two laptops card */}
                    <div className="bg-[#f8f9fa] rounded-[24px] flex flex-col py-1 border border-gray-100">
                        {/* Laptop 1 */}
                        <div className="flex items-start gap-4 p-5 border-b border-gray-200/70 relative">
                            <div className="w-[96px] h-[96px] flex-shrink-0 bg-transparent flex items-center justify-center mix-blend-multiply pt-1">
                               <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" className="object-contain w-full max-h-full" alt="MacBook Air" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[13px] text-[#111827] font-medium leading-[1.3] mb-1.5 pr-8">AB: Apple MacBook Air 13.6" M2 256GB 2022 (MLXW3UA/A) Space Gray</h4>
                                <p className="text-[11px] text-gray-500 mb-2 font-mono tracking-wider flex items-center gap-1 uppercase">CODE: <span className="text-gray-500 flex items-center gap-0.5"><Copy className="w-3 h-3"/> MLXW3UA/A</span></p>
                                <div className="flex items-center gap-1.5 mb-2">
                                   <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                   <span className="text-gray-500 text-[12px]">0.0</span>
                                   <PlayCircle className="w-3.5 h-3.5 text-gray-400 fill-none" />
                                   <Award className="w-3.5 h-3.5 text-[#ff6100]" />
                                </div>
                                <div className="text-[#00a651] text-[13px] mb-2 font-medium">In stock</div>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-[18px] font-bold text-[#111827]">$1,671</span>
                                   <span className="text-[13px] text-gray-400 line-through tracking-tight block ml-[-4px]">$2,089</span>
                                   <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">-20%</span>
                                </div>
                                <button className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#00A651] flex items-center justify-center text-white hover:bg-[#008c44] shadow-sm transition-colors group">
                                  <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {/* Laptop 2 */}
                        <div className="flex items-start gap-4 p-5 relative">
                            <div className="w-[96px] h-[96px] flex-shrink-0 bg-transparent flex items-center justify-center mix-blend-multiply pt-1">
                               <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=200&q=80" className="object-contain w-full max-h-full" alt="Dell XPS" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[13px] text-[#111827] font-medium leading-[1.3] mb-1.5 pr-8">AB: Dell XPS 17 9710 (XPS9710-7265SLV-PUS) Platinum Silver</h4>
                                <p className="text-[11px] text-gray-500 mb-2 font-mono tracking-wider flex items-center gap-1 uppercase">CODE: <span className="text-gray-500 flex items-center gap-0.5"><Copy className="w-3 h-3"/> XPS9710-7265SLV-PUS</span></p>
                                <div className="flex items-center gap-1.5 mb-2">
                                   <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                   <span className="text-gray-500 text-[12px]">0.0</span>
                                   <PlayCircle className="w-3.5 h-3.5 text-gray-400 fill-none" />
                                   <Award className="w-3.5 h-3.5 text-[#ff6100]" />
                                </div>
                                <div className="text-[#00a651] text-[13px] mb-2 font-medium">In stock</div>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-[18px] font-bold text-[#111827]">$2,811</span>
                                   <span className="text-[13px] text-gray-400 line-through tracking-tight block ml-[-4px]">$3,514</span>
                                   <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">-20%</span>
                                </div>
                                <button className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-[#00A651] flex items-center justify-center text-white hover:bg-[#008c44] shadow-sm transition-colors group">
                                  <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pixel 8 Pro Banner */}
                    <div className={`${COL3_SLIDES[col3Index].bgClass} rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-center min-h-[260px] border ${COL3_SLIDES[col3Index].borderClass} cursor-pointer`} onClick={() => setCol3Index(i => (i + 1) % COL3_SLIDES.length)}>
                       <div className="z-10 max-w-[55%] relative">
                          <div className="text-[14px] text-[#4a634e] mb-1 font-medium">{COL3_SLIDES[col3Index].brand}</div>
                          <h3 className="text-[34px] font-black text-[#111827] leading-[1.05] tracking-tight mb-2">{COL3_SLIDES[col3Index].title} {COL3_SLIDES[col3Index].titleSub && <span className="font-normal text-[30px]">{COL3_SLIDES[col3Index].titleSub}</span>}</h3>
                          <p className="text-[#3b4c3e] text-[15px] leading-snug mb-5 font-medium whitespace-pre-line">{COL3_SLIDES[col3Index].description}</p>
                          <button className={`${COL3_SLIDES[col3Index].btnClass} text-white py-2 px-6 rounded-full text-[14px] font-semibold transition-colors w-max shadow-sm`}>
                             Shop now
                          </button>
                       </div>
                       
                       <div className="absolute right-[-24px] top-[10%] bottom-[10%] w-[65%] flex items-center justify-end z-0">
                          <img key={COL3_SLIDES[col3Index].image} src={COL3_SLIDES[col3Index].image} alt={COL3_SLIDES[col3Index].title} className="h-full w-auto object-contain mix-blend-multiply drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] transition-opacity duration-300" />
                       </div>
                       {/* Paginator dots */}
                       <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-[5px] z-20">
                          {COL3_SLIDES.map((_, i) => (
                             <button key={i} onClick={(e) => { e.stopPropagation(); setCol3Index(i); }} className={`w-[6px] h-[6px] rounded-full transition-colors ${i === col3Index ? 'bg-[#00a651] border-transparent' : 'bg-transparent border-[1.5px] border-[#00a651] opacity-60'}`}></button>
                          ))}
                       </div>
                    </div>
                </div>
            </div>
          </section>
        );
      case 'popular_products':
        return (
          <section key={section.id} className="max-w-[1440px] mx-auto px-4 mb-14">
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
