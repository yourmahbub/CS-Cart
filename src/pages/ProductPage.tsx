import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { ProductCard } from '../components/ProductCard';
import { ShoppingBag, Star, PlayCircle, Heart, BarChart2, ShieldCheck, Truck, RotateCcw, CheckCircle2, Plus, Minus, ChevronUp, ChevronDown, Check, ChevronRight, Copy, Clock, Filter, ThumbsUp, ThumbsDown, Share, ExternalLink, X, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice, t, toggleWishlist, isInWishlist, addToCompare } = useCart();
  const { products, productTemplate, updateProduct, siteSettings } = useAdmin();
  const product = products.find((p: any) => p.id === Number(id)) || products[0];
  
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<{rating: number; author: string; text: string; media: string[]}>({ rating: 5, author: '', text: '', media: [] });
  const [selectedReviewMedia, setSelectedReviewMedia] = useState<string | null>(null);
  const [isReviewLightboxOpen, setIsReviewLightboxOpen] = useState(false);
  const [simulatedPurchaseComplete, setSimulatedPurchaseComplete] = useState(false);
  
  const mediaList = useMemo<{type: 'image'|'video', url: string}[]>(() => {
    if(!product) return [];
    const list: {type: 'image'|'video', url: string}[] = [];
    if (product.videoUrl) list.push({ type: 'video', url: product.videoUrl });
    const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    images.forEach((img: string) => list.push({ type: 'image', url: img }));
    return list;
  }, [product]);

  const [selectedMedia, setSelectedMedia] = useState<{type: 'image'|'video', url: string}>(mediaList[0] || { type: 'image', url: product?.image });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const variants = useMemo(() => {
    if (!product?.hasOptions) return [];

    const builtVariants = [];
    
    if (product.colors && product.colors.length > 0) {
      builtVariants.push({
        id: 'color',
        name: 'Color',
        options: product.colors.map((c: string) => {
          const customOpt = (product.colorOptions || []).find((co: any) => co.name?.toLowerCase() === c.trim().toLowerCase());
          return {
            label: c,
            value: c.toLowerCase().replace(/\s+/g, '_'),
            image: customOpt?.image || product.colorImages?.[c] || product.image,
            priceModifier: customOpt?.priceModifier || product.variantPricing?.[c] || 0
          };
        })
      });
    }

    if (product.sizes && product.sizes.length > 0) {
      builtVariants.push({
        id: 'size',
        name: 'Size',
        options: product.sizes.map((s: string) => {
          const customOpt = (product.sizeOptions || []).find((so: any) => so.name?.toLowerCase() === s.trim().toLowerCase());
          return {
            label: s,
            value: s.toLowerCase().replace(/\s+/g, '_'),
            priceModifier: customOpt?.priceModifier || product.variantPricing?.[s] || 0
          };
        })
      });
    }

    // Remove static fallback completely as requested
    return builtVariants;
  }, [product]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variants.forEach(v => {
      initial[v.id] = v.options[0].value;
    });
    return initial;
  });

  // Calculate dynamic price based on options
  const currentPriceOptionModifiers = variants.reduce((acc, variant) => {
    const selectedVal = selectedOptions[variant.id];
    const opt = variant.options.find(o => o.value === selectedVal);
    return acc + (opt?.priceModifier || 0);
  }, 0);

  const displayPrice = product ? product.price + currentPriceOptionModifiers : 0;
  const displayOldPrice = product?.oldPrice ? product.oldPrice + currentPriceOptionModifiers : undefined;

  // Handle setting initial image and options when product changes
  useEffect(() => {
    if (product) setSelectedMedia(mediaList[0] || { type: 'image', url: product.image });
    setAdded(false);
    
    // Reset options
    const initial: Record<string, string> = {};
    variants.forEach(v => {
      initial[v.id] = v.options[0].value;
    });
    setSelectedOptions(initial);
  }, [product?.id]); // Safely depend on product.id

  const [showStickyCart, setShowStickyCart] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setShowStickyCart(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // setTimeout to ensure DOM is ready and rect calculate is correct
    setTimeout(handleScroll, 100); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOptionSelect = (variantId: string, optionValue: string, optionImage?: string) => {
    setSelectedOptions(prev => ({ ...prev, [variantId]: optionValue }));
    if (optionImage) {
      setSelectedMedia({ type: 'image', url: optionImage });
    }
  };

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/" className="text-[#00a651] hover:underline">Return to Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...product, price: displayPrice, oldPrice: displayOldPrice, selectedOptions }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, price: displayPrice, oldPrice: displayOldPrice, selectedOptions }, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author.trim() || !reviewForm.text.trim()) return;
    
    if (siteSettings.requirePurchaseToReview && !simulatedPurchaseComplete) {
      alert("You must have purchased this product and the order must be complete to leave a review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      author: reviewForm.author,
      rating: reviewForm.rating,
      text: reviewForm.text,
      media: reviewForm.media,
      date: new Date().toLocaleDateString(),
      status: siteSettings.autoApproveReviews ? 'approved' : 'pending'
    };
    
    // Add some demo reviews if none exist, so the user sees something populated
    const currentReviews = product.reviewList || [
       { id: 1, author: 'Alex Johnson', rating: 5, text: 'Great product! Exactly as described.', media: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'], date: '2023-11-15', status: 'approved' },
       { id: 2, author: 'Sarah Smith', rating: 4, text: 'Good quality, but shipping took a bit long.', date: '2023-10-02', status: 'approved' }
    ].slice(0, product.reviews || 0); // show demo reviews only if original reviews count > 0

    const newReviewList = [newReview, ...currentReviews];
    const approvedReviews = newReviewList.filter(r => r.status === 'approved');
    const newReviewCount = approvedReviews.length;
    const newRating = newReviewCount > 0 ? (approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / newReviewCount) : 0;

    updateProduct(product.id, {
      ...product,
      reviewList: newReviewList,
      reviews: newReviewCount,
      rating: newRating
    });
    
    setIsReviewModalOpen(false);
    setReviewForm({ rating: 5, author: '', text: '', media: [] });
    if (!siteSettings.autoApproveReviews) {
      alert("Your review has been submitted and is pending approval.");
    }
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReviewForm(prev => ({
            ...prev,
            media: [...prev.media, event.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const template = product.pageTemplateOverride || productTemplate;

  const renderBlock = (block: any) => {
    if (!block.enabled) return null;
    if (block.settings?.visibilityRule === 'low_stock' && product.stock >= 10) return null;
    if (block.settings?.visibilityRule === 'has_discount' && !product.discount) return null;
    
    switch(block.type) {
      case 'gallery':
        return (
          <div key={block.id} className="flex flex-col relative w-full mb-6">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
               {product.discount && (
                 <span className="bg-[#eb5a1b] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm select-none pointer-events-none">
                   -{product.discount}%
                 </span>
               )}
            </div>
            <div className="w-full flex-1 flex items-center justify-center relative pb-8 mb-4 bg-white min-h-[300px] cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 flex items-center justify-center pointer-events-none rounded-2xl">
                <div className="bg-white/90 backdrop-blur scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all text-gray-900 rounded-full px-4 py-2 font-medium text-sm shadow-sm flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 hidden group-hover:block" /> Click to enlarge
                </div>
              </div>
              <AnimatePresence mode="wait">
                {selectedMedia.type === 'video' ? (
                   <motion.video
                     key={selectedMedia.url}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.05 }}
                     transition={{ duration: 0.2 }}
                     src={selectedMedia.url}
                     autoPlay muted loop playsInline
                     className="w-full h-full max-h-[400px] object-contain relative z-0"
                   />
                ) : (
                  <motion.img 
                    key={selectedMedia.url}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    src={selectedMedia.url || undefined} 
                    alt={product.title} 
                    className="w-full h-full max-h-[400px] object-contain mix-blend-multiply relative z-0" 
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-3 justify-center pb-2 flex-wrap px-4">
              {mediaList.map((media, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedMedia(media)}
                  className={`w-[60px] h-[60px] flex-shrink-0 border rounded-[8px] p-1.5 cursor-pointer transition-colors relative ${selectedMedia.url === media.url ? 'border-gray-500 ring-1 ring-gray-300' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {media.type === 'video' ? (
                    <>
                      <video src={media.url} className="w-full h-full object-cover rounded-[6px]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[8px]"><PlayCircle className="w-6 h-6 text-white bg-black/50 rounded-full" /></div>
                    </>
                  ) : <img src={media.url || undefined} className="w-full h-full object-contain mix-blend-multiply" />}
                </div>
              ))}
            </div>
          </div>
        );
      case 'title_price':
        return (
          <div key={block.id} className="mb-6">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-gray-900 leading-[1.25] mb-3">{product.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
               <div className="flex items-center gap-1.5">
                 <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-[14px] h-[14px] ${i <= Math.floor(product.rating || 0) ? 'fill-[#ff5c00] text-[#ff5c00]' : 'fill-[#ff5c00]/20 text-[#ff5c00]/20'} ${i === 5 ? 'w-[7px] overflow-hidden' : ''}`} />)}
                 </div>
                 <span className="text-[14px] font-bold text-gray-900 ml-1">{product.rating ? ((product.rating % 1 === 0) ? product.rating.toFixed(1) : product.rating) : '0.0'}</span>
               </div>
               <span className="text-[14px] text-[#0058a3] hover:underline cursor-pointer">Reviews: {product.reviews || 0}</span>
               <div className="text-[13px] text-gray-500 ml-auto flex items-center gap-1.5">CODE: <Copy className="w-4 h-4 text-gray-400"/> <span className="font-mono text-gray-900 ml-0.5">{product.code || 'N/A'}</span></div>
            </div>
          </div>
        );
      case 'short_description':
        return product.shortNote ? (
          <div key={block.id} className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#00a651] rounded-full text-[13px] font-bold border border-green-100 w-fit">
             <Star className="w-3.5 h-3.5 fill-current" /> {product.shortNote}
          </div>
        ) : null;
      case 'warranty':
        return product.hasWarranty !== false ? (
          <div key={block.id} className="bg-[#f2f4f8] rounded-[10px] p-4 mb-6">
             <div className="flex items-center font-bold text-[13px] text-gray-900 mb-2 gap-2"><Clock className="w-[18px] h-[18px]" /> {product.warranty ? "WARRANTY INFORMATION" : "14-DAY RETURN PERIOD"}</div>
             <p className="text-[12px] text-gray-600 mb-1 leading-relaxed pl-[26px]">{product.warranty || "All items with carrier network plans have a 14-day return period."}<br/><span className="text-[#0058a3] hover:underline cursor-pointer inline-flex mt-1">Learn more &gt;</span></p>
          </div>
        ) : null;
      case 'variants':
        return variants.length > 0 ? (
          <div key={block.id} className="flex flex-col mb-4">
            {variants.map(variant => (
              <div key={variant.id} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 mb-2 w-full pr-1">
                  <span className="font-bold text-[13px] text-gray-900">{variant.name}:</span>
                  <span className="text-[13px] text-gray-700">{selectedOptions[variant.id]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(opt => {
                    const isSelected = selectedOptions[variant.id] === opt.value;
                    if (variant.id === 'color') {
                      return (
                        <div key={opt.value} onClick={() => handleOptionSelect(variant.id, opt.value, opt.image)} className={`w-[60px] cursor-pointer flex flex-col items-center gap-1 group relative`}>
                           <div className={`w-[56px] h-[56px] border rounded-[8px] p-1 flex items-center justify-center transition-all ${isSelected ? 'border-[#00a651] ring-1 ring-[#00a651]' : 'border-gray-200 group-hover:border-gray-400 group-hover:shadow-sm'}`}>
                              <img src={opt.image || undefined} className="w-full h-full object-contain mix-blend-multiply" />
                           </div>
                           {isSelected && <div className="absolute top-[-4px] right-[0px] bg-white rounded-full shadow-sm"><CheckCircle2 className="w-[18px] h-[18px] text-[#00a651] fill-white" strokeWidth={2} /></div>}
                        </div>
                      );
                    } else {
                      return (
                        <div key={opt.value} onClick={() => handleOptionSelect(variant.id, opt.value)} className={`relative cursor-pointer transition-all border rounded-[8px] px-4 py-2 flex items-center justify-center min-w-[70px] ${isSelected ? 'border-[#00a651] border-2 bg-green-50/30' : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'}`}>
                           <span className={`text-[13px] font-semibold ${isSelected ? 'text-[#00a651]' : 'text-gray-700'}`}>{opt.label}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null;
      case 'add_to_cart':
        return (
          <div key={block.id} className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-sm relative pt-7 mb-6">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[32px] font-bold text-gray-900 leading-none">${displayPrice}</span>
                      {displayOldPrice && <span className="text-[14px] text-gray-500 line-through leading-none">${displayOldPrice}</span>}
                      {product.discount && <span className="border border-gray-300 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-white ml-1 align-middle">-{product.discount}%</span>}
                   </div>
                </div>
             </div>
             <div className="text-[#00a651] text-[13px] font-medium mb-3">In stock</div>
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 h-[44px]">
                  <div className="flex items-center justify-between border border-gray-200 rounded-full h-full w-[110px] px-1 bg-gray-50/50 flex-shrink-0">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"><Minus className="w-4 h-4"/></button>
                     <span className="font-bold text-[14px] text-gray-900">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4"/></button>
                  </div>
                  <div ref={addToCartRef} className="flex-1 flex items-stretch h-full">
                     <button onClick={handleAddToCart} className={`w-full text-white rounded-full font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all outline-none ${added ? 'bg-[#008c44]' : 'bg-[#00a651] hover:bg-[#008c44]'}`}>
                        {added ? <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2.5}/> : <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.5}/>}
                        {added ? t('Added') : t('Add to cart')}
                     </button>
                  </div>
               </div>
               <button onClick={handleBuyNow} className="w-full h-[44px] bg-[#ff5c00] hover:bg-[#e65300] text-white rounded-full font-bold text-[14px] flex items-center justify-center transition-all outline-none shadow-sm shadow-[#ff5c00]/20 cursor-pointer">
                  Buy Now
               </button>
               <div className="flex items-center gap-2 mt-2">
                  <button 
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`flex-1 h-[40px] rounded-full text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isInWishlist(product.id)
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-600 text-red-600' : ''}`} />
                    {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => addToCompare(product)}
                    className="flex-1 h-[40px] rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    Compare
                  </button>
               </div>
             </div>
          </div>
        );
      case 'shipping_info':
        return (
          <div key={block.id} className="border border-gray-200 rounded-[12px] py-2 bg-white shadow-sm flex flex-col mb-6">
             <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between font-bold text-[14px] text-gray-900 mb-3">Delivery <ChevronUp className="w-[18px] h-[18px] text-gray-400"/></div>
                <div className="text-[12px] text-gray-500">Fast delivery nationwide</div>
             </div>
          </div>
        );
      case 'features':
        return product.features?.length > 0 ? (
          <div key={block.id} className="mt-8 mb-8 px-1 w-full">
            <h3 className="font-bold text-[18px] text-gray-900 mb-4">Features</h3>
            <div className="flex flex-col gap-3">
               {product.features.map((feature: any, index: number) => (
                  <div key={index} className="flex items-center">
                     <span className="text-[13px] text-gray-500">{feature.name}</span>
                     <div className="flex-1 border-b border-dotted border-gray-300 mx-2"></div>
                     <span className="text-[13px] text-gray-900">{feature.value}</span>
                  </div>
               ))}
            </div>
          </div>
        ) : null;
      case 'full_description':
        return product.description ? (
          <div key={block.id} className="mb-12 px-1 w-full">
            <h2 className="text-[24px] font-extrabold text-gray-900 mb-6 font-sans">Description</h2>
            <div className="prose max-w-none text-gray-600 text-[13px] leading-[1.8] whitespace-pre-line">{product.description}</div>
          </div>
        ) : null;
      case 'custom_html':
        return (
          <div key={block.id} className="w-full my-6" dangerouslySetInnerHTML={{ __html: block.settings?.html || '' }} />
        );
      case 'countdown':
        return (
          <div key={block.id} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
            <h4 className="text-red-600 font-bold mb-2 flex items-center gap-2"><Clock className="w-5 h-5"/> {block.settings?.text || 'Limited time offer!'}</h4>
            <div className="flex gap-3 mt-1">
              <div className="bg-white rounded shadow-sm px-3 py-1 font-mono font-bold text-lg border border-red-100">12<span className="text-xs font-sans text-gray-500 ml-1">h</span></div>
              <div className="bg-white rounded shadow-sm px-3 py-1 font-mono font-bold text-lg border border-red-100">45<span className="text-xs font-sans text-gray-500 ml-1">m</span></div>
              <div className="bg-white rounded shadow-sm px-3 py-1 font-mono font-bold text-lg border border-red-100">30<span className="text-xs font-sans text-gray-500 ml-1">s</span></div>
            </div>
            <div className="mt-3 text-xs text-red-500/80">Prices may increase after countdown ends</div>
          </div>
        );
      case 'stock_indicator':
        return (
          <div key={block.id} className="mb-6 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Only 5 items left in stock</span>
          </div>
        );
      case 'faq':
        return (
          <div key={block.id} className="mb-12 w-full">
            <h2 className="text-[24px] font-extrabold text-gray-900 mb-6 font-sans">Frequently Asked Questions</h2>
            {block.settings?.faqs?.map((faq: any, i: number) => (
              <div key={i} className="mb-4 border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        );
      case 'reviews': {
        const displayReviews = (product.reviewList || (product.reviews > 0 ? [
          { id: 1, author: 'Alex Johnson', rating: 5, text: 'Great product! Exactly as described.', media: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'], date: '2023-11-15', status: 'approved' },
          { id: 2, author: 'Sarah Smith', rating: 4, text: 'Good quality, but shipping took a bit long.', date: '2023-10-02', status: 'approved' }
        ].slice(0, product.reviews) : [])).filter((r: any) => r.status === 'approved' || !r.status);
        
        return (
          <div key={block.id} className="mb-12 w-full">
             <h2 className="text-[28px] font-extrabold text-gray-900 mb-6 font-sans">Reviews</h2>
             <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
               <div className="flex items-start gap-6">
                 <div className="flex flex-col text-center">
                   <span className="text-[48px] font-bold text-gray-900 leading-[1] mb-1">{product.rating ? ((product.rating % 1 === 0) ? product.rating.toFixed(1) : product.rating) : '0.0'}</span>
                   <span className="text-[12px] text-gray-500">Reviews: {product.reviews || 0}</span>
                 </div>
               </div>
               <div className="flex flex-col">
                  <h3 className="text-[18px] font-bold text-gray-900 mb-1.5 leading-tight">Review this product</h3>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="border-2 border-[#00a651] text-[#00a651] rounded-full px-5 py-1.5 text-[14px] font-bold w-fit hover:bg-green-50"
                  >
                    Write a review
                  </button>
               </div>
             </div>
             
             {displayReviews.length > 0 ? (
               <div className="flex flex-col gap-6">
                 {displayReviews.map((review: any) => (
                   <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="font-bold text-[14px] text-gray-900">{review.author}</span>
                       <span className="text-[12px] text-gray-400">&bull; {review.date}</span>
                     </div>
                     <div className="flex items-center gap-0.5 mb-2">
                       {[1, 2, 3, 4, 5].map((i) => (
                         <Star key={i} className={`w-[14px] h-[14px] ${i <= review.rating ? 'fill-[#ff5c00] text-[#ff5c00]' : 'fill-[#ff5c00]/20 text-[#ff5c00]/20'}`} />
                       ))}
                     </div>
                     <p className="text-[14px] text-gray-700 leading-relaxed mb-3">{review.text}</p>
                     
                     {review.media && review.media.length > 0 && (
                       <div className="flex gap-2 flex-wrap">
                         {review.media.map((url: string, i: number) => (
                           <div key={i} className="w-20 h-20 rounded border border-gray-200 overflow-hidden cursor-pointer" onClick={() => {
                             setSelectedReviewMedia(url);
                             setIsReviewLightboxOpen(true);
                           }}>
                             <img src={url} className="w-full h-full object-cover" alt="Review attached" />
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-gray-500 text-[14px]">No reviews yet. Be the first to review this product!</p>
             )}
          </div>
        );
      }
      case 'related_products':
        return (
          <div key={block.id} className="mb-12 w-full">
            <h2 className="text-[24px] font-bold text-gray-900 mb-6 px-1">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products
                .filter((p: any) => p.id !== product.id)
                .slice(0, 5)
                .map((relatedProduct: any) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-[12px] text-gray-500 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3 w-full">
        <span>Home / Products / {product.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start relative px-1">
        <div className="flex-1 flex flex-col w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 xl:gap-10 items-start relative">
            <div className="flex flex-col lg:col-span-5 relative">
              {template.leftColumn.map(renderBlock)}
            </div>
            <div className="flex flex-col lg:col-span-4 relative">
              {template.middleColumn.map(renderBlock)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-full lg:w-[320px] xl:w-[340px] shrink-0 gap-6 sticky top-[84px] self-start z-10">
           {template.rightSidebar.map(renderBlock)}
        </div>
      </div>

      <div className="w-full mt-12 flex flex-col">
         {template.bottomContent.map(renderBlock)}
      </div>

      {/* Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showStickyCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-full w-full overflow-hidden"
          >
            <div className="flex items-center w-full max-w-[1440px] mx-auto justify-between gap-4">
              <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center p-1 shrink-0">
                  {selectedMedia.type === 'video' ? (
                    <video src={selectedMedia.url} className="w-full h-full object-cover rounded-[6px]" />
                  ) : (
                    <img src={selectedMedia.url || product.image || undefined} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-[14px] font-bold text-gray-900 truncate">{product.title}</span>
                  <span className="text-[12px] text-gray-500 truncate">{Object.values(selectedOptions).join(' · ')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto overflow-hidden">
                <div className="flex flex-col shrink-0">
                   <span className="text-[20px] sm:text-[24px] font-extrabold text-gray-900 leading-none tracking-tight">{formatPrice(displayPrice)}</span>
                   {displayOldPrice && <span className="text-[12px] sm:text-[13px] text-gray-500 line-through leading-none mt-1">{formatPrice(displayOldPrice)}</span>}
                </div>
                
                <div className="flex items-stretch gap-2 sm:gap-3 h-[44px]">
                   <div className="hidden sm:flex items-center border border-gray-200 rounded-full w-[90px] justify-between px-1 bg-gray-50 shrink-0">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"><Minus className="w-3.5 h-3.5"/></button>
                      <span className="font-bold text-[14px] text-gray-900">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"><Plus className="w-3.5 h-3.5"/></button>
                   </div>
                   <button 
                     onClick={handleAddToCart}
                     className={`px-6 sm:px-8 min-w-[130px] sm:min-w-[150px] text-white rounded-full font-bold text-[14px] flex items-center justify-center gap-2 transition-all outline-none shadow-sm ${added ? 'bg-[#008c44] scale-95' : 'bg-[#00a651] hover:bg-[#008c44] hover:-translate-y-0.5 hover:shadow-md'}`}
                   >
                      {added ? <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2.5}/> : <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.5}/>}
                      {added ? t('Added') : t('Add to cart')}
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
               <div className="flex-1 min-w-0 pr-4">
                 <h2 className="text-white text-[15px] sm:text-lg font-bold truncate">{product.title}</h2>
                 <p className="text-white/70 text-xs sm:text-sm truncate mt-0.5">
                   {Object.values(selectedOptions).join(' · ')}
                 </p>
               </div>
               <button onClick={() => setIsLightboxOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 sm:p-2.5 rounded-full backdrop-blur-md shrink-0">
                 <X className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 flex items-center justify-center p-0 min-h-0 relative select-none" onClick={() => setIsLightboxOpen(false)}>
               <div className="relative w-full h-full max-w-[1440px] max-h-[85vh] p-4 sm:p-12 flex items-center justify-center mt-16 mb-32" onClick={(e) => e.stopPropagation()}>
                 {selectedMedia.type === 'video' ? (
                   <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-full object-contain" />
                 ) : (
                   <img src={selectedMedia.url} alt={product.title} className="max-w-full max-h-full object-contain shadow-2xl" />
                 )}
                 
                 <button 
                   className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105"
                   onClick={(e) => {
                     e.stopPropagation();
                     const curIdx = mediaList.findIndex(m => m.url === selectedMedia.url);
                     const prevIdx = curIdx > 0 ? curIdx - 1 : mediaList.length - 1;
                     setSelectedMedia(mediaList[prevIdx]);
                   }}
                 >
                   <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 rotate-180" />
                 </button>

                 <button 
                   className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105"
                   onClick={(e) => {
                     e.stopPropagation();
                     const curIdx = mediaList.findIndex(m => m.url === selectedMedia.url);
                     const nextIdx = curIdx < mediaList.length - 1 ? curIdx + 1 : 0;
                     setSelectedMedia(mediaList[nextIdx]);
                   }}
                 >
                   <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
                 </button>
               </div>
            </div>

            {/* Thumbnails Row */}
            {mediaList.length > 1 && (
            <div className="absolute bottom-[80px] sm:bottom-[100px] left-0 right-0 z-10 flex justify-center pb-4 pt-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto px-4 snap-x snap-mandatory pointer-events-auto max-w-full" style={{scrollbarWidth: 'none'}}>
                  {mediaList.map((media, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedMedia(media)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-[8px] sm:rounded-[12px] cursor-pointer transition-all snap-center relative overflow-hidden bg-white/5 border border-white/10 ${selectedMedia.url === media.url ? 'ring-2 ring-white scale-110 opacity-100 z-10' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                    >
                      {media.type === 'video' ? (
                        <>
                          <video src={media.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <PlayCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white bg-black/50 rounded-full" />
                          </div>
                        </>
                      ) : (
                        <img src={media.url || undefined} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
            </div>
            )}

            {/* Bottom Bar */}
            <div className="p-4 sm:p-6 bg-black flex flex-wrap items-center justify-center gap-4 sm:gap-6 absolute bottom-0 left-0 right-0 z-20 border-t border-white/10">
              <div className="text-white text-xl sm:text-3xl font-extrabold">{formatPrice(displayPrice)}</div>
              
              <div className="hidden sm:flex items-center border border-gray-700 rounded-full h-[48px] w-[110px] justify-between px-1 bg-gray-800/50">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Minus className="w-4 h-4"/></button>
                 <span className="font-bold text-[16px] text-white">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Plus className="w-4 h-4"/></button>
              </div>

              <button 
                onClick={handleAddToCart}
                className={`w-full sm:w-auto min-w-[200px] px-8 py-3 sm:py-4 h-[48px] text-gray-900 rounded-full font-bold text-[15px] sm:text-[17px] flex items-center justify-center gap-2 transition-transform shadow-lg ${added ? 'bg-green-400 scale-95' : 'bg-white hover:scale-105'}`}
              >
                {added ? <CheckCircle2 className="w-[20px] h-[20px]" strokeWidth={2.5}/> : <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={2.5}/>}
                {added ? t('Added to Box') : t('Add to Box')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h3>
              
              {siteSettings.requirePurchaseToReview && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      checked={simulatedPurchaseComplete}
                      onChange={(e) => setSimulatedPurchaseComplete(e.target.checked)}
                    />
                    <div className="text-sm text-blue-800">
                      <span className="font-semibold block placeholder-simulation">Simulate user login & completed purchase</span>
                      Check this to bypass the "require purchase" setting for testing purposes.
                    </div>
                  </label>
                </div>
              )}
              
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-colors ${star <= reviewForm.rating ? 'fill-[#ff5c00] text-[#ff5c00]' : 'text-gray-300'}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Your Review</label>
                    <textarea 
                      required
                      rows={4}
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all resize-none"
                      placeholder="What did you like or dislike about this product?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Attach Photos (Optional)</label>
                    
                    {reviewForm.media.length > 0 && (
                      <div className="flex gap-3 flex-wrap mb-3">
                        {reviewForm.media.map((url, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={url} className="w-full h-full object-cover" alt="Review upload" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={() => setReviewForm(prev => ({ ...prev, media: prev.media.filter((_, idx) => idx !== i) }))}
                                className="bg-white text-gray-900 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label 
                      htmlFor="review-image-upload" 
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-[10px] hover:border-[#00a651] hover:bg-green-50/30 cursor-pointer transition-colors group"
                    >
                      <input 
                        type="file" 
                        id="review-image-upload" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleReviewImageUpload} 
                      />
                      <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-[#00a651] mb-2 transition-colors" />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-[#00a651] transition-colors">Click to upload photos</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 text-white bg-[#00a651] hover:bg-[#008c44] rounded-full font-bold text-sm transition-colors shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isReviewLightboxOpen && selectedReviewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex flex-col backdrop-blur-sm items-center justify-center"
          >
            <button 
              onClick={() => setIsReviewLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedReviewMedia} 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              alt="Review attachment"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
