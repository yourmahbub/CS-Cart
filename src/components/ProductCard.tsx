import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Copy, Star, PlayCircle, BarChart2, ShoppingBag, Settings, CalendarDays, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Tooltip } from './Tooltip';

export const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { items, addToCart, updateQuantity, formatPrice, t, compareItems, addToCompare, removeFromCompare, toggleWishlist, isInWishlist } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const [isHoveringCart, setIsHoveringCart] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const availableColors = useMemo(() => {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors;
    }
    return ['#111827', '#DC2626', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#DB2777'];
  }, [product.colors]);

  const availableSizes = useMemo(() => {
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  }, [product.sizes]);

  const [selectedColor, setSelectedColor] = useState(() => availableColors[0] || '#111827');
  const [selectedSize, setSelectedSize] = useState(() => availableSizes[0] || 'M');
  const [localQty, setLocalQty] = useState(1);

  const cartItem = items.find(i => i.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  
  const isCompared = compareItems.some(i => i.id === product.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const images = (product.images?.length > 0 ? product.images : [product.image]).filter(Boolean);
  const mediaItems = product.videoUrl 
    ? [{ type: 'video', url: product.videoUrl }, ...images.map((url: string) => ({ type: 'image', url }))]
    : images.map((url: string) => ({ type: 'image', url }));

  // Handle body scroll locking
  useEffect(() => {
    if (showOptions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showOptions]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasOptions) {
      setShowOptions((prev) => !prev);
      return;
    }
    
    if (!cartItem) {
      addToCart(product, localQty);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };
  
  const handleConfirmOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, selectedColor, selectedSize }, localQty);
    setShowOptions(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleQuantityChange = (e: React.MouseEvent, change: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, Math.max(0, quantity + change));
    } else {
      setLocalQty(prev => Math.max(1, prev + change));
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="relative flex flex-col bg-white rounded-[16px] border border-gray-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 group overflow-hidden h-full">
      {/* Badges */}
      <div className="absolute top-[22px] left-[22px] z-10 flex flex-col gap-1.5 items-start">
        {product.discount && (
          <span className="bg-[#ff6600] text-white text-[12px] font-bold px-2 py-0.5 rounded shadow-sm leading-none flex items-center h-[22px]">
            -{product.discount}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-[#00a651] text-white text-[12px] font-bold px-2 py-0.5 rounded shadow-sm leading-none flex items-center h-[22px]">
            New
          </span>
        )}
        {product.isPopular && (
          <span className="bg-[#8a4baf] text-white text-[12px] font-bold px-2 py-0.5 rounded shadow-sm leading-none flex items-center h-[22px]">
            Most popular
          </span>
        )}
      </div>

      {/* Top Right Icons */}
      <div className="absolute top-[22px] right-[22px] flex flex-col gap-2 z-10">
        <Tooltip content={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"} position="left">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full shadow-sm cursor-pointer ${
              isWishlisted
                ? "text-red-500 bg-red-50 hover:bg-red-100 scale-105"
                : "text-gray-400 bg-white/80 hover:text-red-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-[18px] h-[18px] ${isWishlisted ? "fill-red-500" : ""}`} strokeWidth={2} />
          </button>
        </Tooltip>
        <Tooltip content={isCompared ? "Remove from Compare" : "Add to Compare"} position="left">
          <button 
            onClick={handleCompareClick}
            className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 ${isCompared ? "bg-blue-500 text-white hover:bg-blue-600 opacity-100" : "text-gray-400 bg-white/80 hover:text-blue-500 hover:bg-white opacity-0 group-hover:opacity-100"}`}
          >
            <BarChart2 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </Tooltip>
      </div>

      {/* Image */}
      <div className="w-full p-4 pb-2 relative group/slider">
        <div 
          className="w-full aspect-[4/3] sm:aspect-square relative flex items-center justify-center rounded-xl overflow-hidden bg-gray-50 border border-black/5"
        >
          <div 
            className="flex w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {mediaItems.map((item: any, idx: number) => (
              item.type === "video" ? (
                <video 
                  key={idx}
                  src={item.url || undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full flex-shrink-0 object-cover mix-blend-multiply pointer-events-none"
                />
              ) : (
                <img 
                  key={idx}
                  src={item.url || undefined} 
                  alt={`${product.title} - ${idx + 1}`}
                  className="w-full h-full flex-shrink-0 object-cover mix-blend-multiply pointer-events-none" 
                />
              )
            ))}
          </div>
          
          {mediaItems.length > 1 && (
            <>
              {/* Left Arrow */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 hover:bg-white text-gray-700 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-[18px] h-[18px] mr-0.5" strokeWidth={2.5} />
              </button>

              {/* Right Arrow */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 hover:bg-white text-gray-700 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-[18px] h-[18px] ml-0.5" strokeWidth={2.5} />
              </button>

              {/* Tabs / Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-[5px] opacity-100 sm:opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 py-1.5 px-2.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white/40">
                {mediaItems.map((item: any, idx: number) => {
                  const isActive = idx === currentImageIndex;
                  return (
                    <button 
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      title={item.type === "video" ? "Video" : `Image ${idx + 1}`}
                      className={`transition-all rounded-full flex items-center justify-center ${isActive ? "bg-[#00a651] w-[20px] h-[6px]" : "bg-gray-400 w-[6px] h-[6px] hover:bg-gray-600"} ${item.type === "video" ? "h-[10px] w-[18px] !bg-transparent !p-0 gap-1" : ""}`}
                    >
                       {item.type === "video" ? (
                          <div className={`flex items-center justify-center rounded-full transition-all ${isActive ? "bg-[#00a651] text-white p-[2px]" : "bg-gray-400 text-white hover:bg-gray-600 p-[2px]"}`}>
                            <PlayCircle className="w-[8px] h-[8px]" strokeWidth={3} />
                          </div>
                       ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {product.isComingSoon && (
          <div className="absolute bottom-0 left-[22px] z-10 flex flex-col items-center justify-center bg-[#00a8e1] text-white rounded-full w-[46px] h-[46px] shadow-sm">
             <CalendarDays className="w-[18px] h-[18px] mb-[1px]" strokeWidth={2.5} />
             <span className="text-[7px] font-bold leading-[1.1] tracking-tight text-center">COMING<br/>SOON</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 pt-3">
        <h3 className="text-[14px] leading-snug font-medium text-gray-900 hover:text-[#00a651] cursor-pointer line-clamp-2 h-[42px] mb-1">
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mb-1 text-gray-500">
          <span className="text-[11px] uppercase tracking-wider">code:</span>
          <Tooltip content="Copy Code" position="top">
            <Copy 
              className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(product.code);
              }}
            />
          </Tooltip>
          <span className="text-[12px] text-gray-500">{product.code}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-[3px]">
          <Star className={`w-3.5 h-3.5 ${product.rating > 0 ? "fill-[#ff6600] text-[#ff6600]" : "fill-gray-300 text-gray-300"}`} />
          <span className="text-[13px] text-gray-600 font-medium">{product.rating > 0 ? product.rating : "0.0"}</span>
          {product.reviews > 0 && <span className="text-[13px] text-gray-400 font-normal">(Reviews: {product.reviews})</span>}
          {product.hasVideo && (
            <div className="flex items-center gap-1 ml-0.5">
               <PlayCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
               <div className="border border-[#ff6600] rounded-[3px] p-[2px] flex items-center justify-center cursor-pointer hover:bg-[#ff6600]/10">
                  <Star className="w-2.5 h-2.5 text-[#ff6600] fill-[#ff6600]" />
               </div>
            </div>
          )}
        </div>

        <div className="text-[13px] font-medium text-[#00a651] mb-5">
          {product.inStock ? t("In stock") : "On backorder"}
        </div>

        <div className="mt-auto flex flex-row items-end justify-between relative h-[44px]">
          <div className="flex flex-col">
            <div className="text-[20px] font-bold text-gray-900 leading-none">
              {formatPrice(product.price)}
            </div>
            {product.oldPrice && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[12px] text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="px-[6px] py-[1px] text-[11px] font-medium border border-gray-300 text-gray-500 rounded-full leading-none">
                  -{product.discount}%
                </span>
              </div>
            )}
          </div>

          <div 
            className="flex items-center justify-end relative h-[44px] z-10"
            onMouseEnter={() => setIsHoveringCart(true)}
            onMouseLeave={() => setIsHoveringCart(false)}
          >
            <div className="relative flex items-center justify-end h-10 w-10">
              <div 
                className={`absolute right-4 flex items-center h-10 text-white transition-all duration-300 overflow-hidden ease-out rounded-l-[20px] ${(isAdded || cartItem) ? "bg-gray-900 shadow-md" : "bg-[#00a651] shadow-md"} ${isHoveringCart && !product.hasOptions ? "w-[110px] opacity-100 pr-7 pl-1" : "w-0 opacity-0 px-0"}`}
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
              >
                <button 
                  onClick={(e) => handleQuantityChange(e, -1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors flex-shrink-0"
                >
                  -
                </button>
                <span className="font-semibold text-[14px] flex-shrink-0 w-6 text-center">{(isAdded || cartItem) ? quantity : localQty}</span>
                <button 
                  onClick={(e) => handleQuantityChange(e, 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors flex-shrink-0"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className={`h-10 w-10 rounded-[20px] flex items-center justify-center text-white relative z-10 flex-shrink-0 transition-colors duration-300 shadow-md cursor-pointer ${(isAdded || cartItem) ? "bg-gray-900" : "bg-[#00a651] hover:bg-[#008c44]"}`}
              >
                {(isAdded || cartItem) ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                )}
                {!(isAdded || cartItem) && product.hasOptions && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full flex items-center justify-center h-[18px] w-[18px] shadow-sm border border-gray-100">
                    <Settings className="w-3 h-3 text-gray-800" strokeWidth={2.5} />
                  </div>
                )}
  
                {isAdded && (
                  <div className="absolute bottom-full right-0 mb-2 w-max bg-gray-900 text-white text-[12px] font-medium px-3 py-1.5 rounded-[8px] shadow-lg">
                    Added to cart
                    <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Options Popup Overlay Portal */}
            {showOptions && product.hasOptions && typeof document !== 'undefined' && createPortal(
              <div 
                className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-default"
                style={{ zIndex: 999999 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptions(false);
                }}
              >
               <div 
                 className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 flex flex-col gap-6 transform transition-all animate-in fade-in zoom-in-95 relative"
                 style={{ zIndex: 1000000 }}
                 onClick={e => { e.preventDefault(); e.stopPropagation(); }}
               >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                     <div className="flex items-center gap-3.5 pr-2">
                       <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                         <img src={product.image} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                         <p className="text-base font-bold text-[#00a651] mt-0.5">{formatPrice(product.price)}</p>
                       </div>
                     </div>
                     <button 
                       type="button"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         setShowOptions(false);
                       }}
                       className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer flex-shrink-0"
                       aria-label="Close"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Colors - Rendered if clothing / standard  */}
                  {(!product.title.toLowerCase().includes('laptop') && !product.title.toLowerCase().includes('phone')) && (
                    <div className="space-y-3">
                       <div className="text-sm font-medium text-gray-900 flex justify-between items-center">
                         <span>Color</span>
                         <span className="text-gray-500 font-normal text-xs uppercase">{selectedColor}</span>
                       </div>
                       <div className="flex flex-wrap gap-2.5">
                          {availableColors.map((color: string) => {
                            const isHex = color.startsWith('#');
                            const bgStyle = isHex ? color : color.toLowerCase();
                            const isWhite = ['white', '#fff', '#ffffff'].includes(bgStyle);
                            const isSelected = selectedColor === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                title={color}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(color); }}
                                className={`w-9 h-9 rounded-full cursor-pointer ring-2 ring-offset-2 transition-all flex items-center justify-center ${isSelected ? 'ring-gray-900 scale-110 drop-shadow-md' : 'ring-gray-200 hover:ring-gray-400 hover:scale-105'} ${isWhite ? 'border border-gray-300' : ''}`}
                                style={{ backgroundColor: bgStyle }}
                              >
                                {isSelected && (
                                  <Check className={`w-4 h-4 ${isWhite ? 'text-gray-900' : 'text-white'}`} strokeWidth={3} />
                                )}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {(!product.title.toLowerCase().includes('laptop') && !product.title.toLowerCase().includes('phone')) && (
                    <div className="space-y-3">
                       <div className="text-sm font-medium text-gray-900 flex justify-between items-center">
                         <span>Size</span>
                         <span className="text-blue-600 font-normal cursor-pointer text-xs">Size Guide</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size: string) => (
                            <button 
                              key={size}
                              type="button" 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(size); }}
                              className={`h-11 min-w-[48px] px-3 rounded-xl text-sm font-semibold flex items-center justify-center border cursor-pointer transition-all ${selectedSize === size ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-200 hover:border-gray-900 text-gray-700 hover:bg-gray-50'}`}
                            >
                               {size}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Memory (for Tech) */}
                  {(product.title.toLowerCase().includes('laptop') || product.title.toLowerCase().includes('phone')) && (
                    <div className="space-y-3">
                       <div className="text-sm font-medium text-gray-900 flex justify-between">
                         <span>Memory</span>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          {['8GB Unified Memory', '16GB Unified Memory', '32GB Unified Memory', '64GB Unified Memory'].map(size => (
                            <button 
                              key={size}
                              type="button" 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(size); }}
                              className={`h-14 px-4 rounded-xl text-xs font-semibold flex items-center justify-center border cursor-pointer transition-all text-center ${selectedSize === size ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-200 hover:border-gray-900 text-gray-700 hover:bg-gray-50'}`}
                            >
                               {size}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Storage (for Tech) */}
                  {(product.title.toLowerCase().includes('laptop') || product.title.toLowerCase().includes('phone')) && (
                    <div className="space-y-3">
                       <div className="text-sm font-medium text-gray-900 flex justify-between">
                         <span>Storage</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          {['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD', '8TB SSD'].map(storage => (
                            <button 
                              key={storage} 
                              type="button"
                              // we reuse color for storage to save state changes
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(storage); }}
                              className={`h-12 px-2 rounded-xl text-xs font-semibold flex items-center justify-center border cursor-pointer transition-all text-center ${selectedColor === storage ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold border-2' : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50/30'}`}
                            >
                               {storage}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-900">Quantity</div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                          <button 
                            type="button"
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={(e) => handleQuantityChange(e, -1)}
                          >
                             -
                          </button>
                          <span className="w-12 text-center font-bold text-lg text-gray-900">
                             {localQty}
                          </span>
                          <button 
                            type="button"
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={(e) => handleQuantityChange(e, 1)}
                          >
                             +
                          </button>
                       </div>
                       <button 
                         type="button"
                         onClick={handleConfirmOptions}
                         className="flex-1 bg-[#00a651] text-white rounded-full h-12 text-[15px] font-bold hover:bg-[#008c44] shadow-[0_4px_14px_rgba(0,166,81,0.3)] hover:shadow-[0_6px_20px_rgba(0,166,81,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                       >
                          <ShoppingBag className="w-5 h-5" />
                          Complete Add to Cart
                       </button>
                    </div>
                  </div>
               </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* Specs snippet */}
        {product.specs && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 hidden group-hover:block transition-all">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-end text-[11px]">
                <span className="text-gray-500 relative flex-1 overflow-hidden">
                   <span className="pr-1 bg-white relative z-10">{key}</span>
                   <span className="absolute bottom-[4px] w-full border-b border-dotted border-gray-300"></span>
                </span>
                <span className="text-gray-900 pl-1 relative z-10 bg-white font-medium">{value as React.ReactNode}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

