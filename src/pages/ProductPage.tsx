import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';
import { Stars } from '../components/product/Stars';
import { ProductGallery, MediaItem } from '../components/product/ProductGallery';
import { ReviewsSection } from '../components/product/ReviewsSection';
import { RelatedProducts } from '../components/product/RelatedProducts';
import {
  ShoppingCart, Heart, Repeat2, Copy, Check, ChevronDown, ChevronUp, Info,
  Search as SearchIcon, Clock, Minus, Plus, CheckCircle2, Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: diff <= 0,
  };
}

/** Collapsible sidebar panel used by Delivery / Payment / Warranty. */
function Panel({ title, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full font-bold text-[13px] text-gray-900 mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Attribute row with the dotted leader used by the specifications table. */
function SpecRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-baseline text-[12px] py-[5px]">
      <span className="text-gray-500 shrink-0">{name}</span>
      <span className="flex-1 border-b border-dotted border-gray-300 mx-2 translate-y-[-3px]" />
      <span className="text-gray-900 text-right shrink-0">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ProductPage() {
  const { id } = useParams();
  const { addToCart, formatPrice, addToCompare } = useCart();
  const {
    products, productTemplate, productPageConfig: cfg,
    getProduct, submitReview, voteReview, categories, recentlyViewed, trackRecentlyViewed, siteSettings,
  } = useAdmin();

  const theme = cfg.theme;

  // The list endpoint omits reviews, so the detail record is fetched on its own.
  const { localizeProduct, tr, isRTL, lang } = useLang();
  const [rawProduct, setProduct] = useState<any>(null);
  const product = useMemo(() => localizeProduct(rawProduct), [rawProduct, localizeProduct]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    getProduct(String(id))
      .then((p: any) => { if (!cancelled) setProduct(p); })
      .catch(() => { if (!cancelled) { setProduct(null); setNotFound(true); } });
    return () => { cancelled = true; };
  }, [id, getProduct]);

  /**
   * Apply the product's SEO fields for the current language.
   * Note: this runs in the browser, so it helps the tab title and crawlers that
   * execute JavaScript. Social preview scrapers generally do not — server-side
   * rendering would be needed for those.
   */
  useEffect(() => {
    if (!product) return;
    // Fallback order: language-specific meta → language-specific content →
    // English meta → English content. An Arabic visitor with no Arabic copy
    // still gets the SEO-tuned English title rather than the raw record title.
    const arMeta = rawProduct?.i18n?.ar ?? {};
    const chain = lang === 'ar'
      ? [arMeta.metaTitle, arMeta.title, rawProduct?.metaTitle, rawProduct?.title]
      : [rawProduct?.metaTitle, rawProduct?.title];
    const descChain = lang === 'ar'
      ? [arMeta.metaDescription, arMeta.description, rawProduct?.metaDescription, rawProduct?.description]
      : [rawProduct?.metaDescription, rawProduct?.description];

    const firstFilled = (values: any[]) =>
      values.find((v) => typeof v === 'string' && v.trim()) || '';
    const metaTitle = firstFilled(chain);
    const metaDescription = firstFilled(descChain);

    const previousTitle = document.title;
    document.title = `${metaTitle} | ${siteSettings?.logoText || 'Store'}`;

    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', String(metaDescription).slice(0, 320));

    return () => { document.title = previousTitle; };
  }, [product, rawProduct, lang, siteSettings?.logoText]);

  /* ---------------- state ---------------- */
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [compared, setCompared] = useState(false);
  const [showKeyFeatures, setShowKeyFeatures] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  /* ---------------- media ---------------- */
  const mediaList = useMemo<MediaItem[]>(() => {
    if (!product) return [];
    const list: MediaItem[] = [];
    if (product.videoUrl) list.push({ type: 'video', url: product.videoUrl });
    const imgs = product.images?.length ? product.images : product.image ? [product.image] : [];
    imgs.forEach((url: string) => list.push({ type: 'image', url }));
    return list;
  }, [product]);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | undefined>(mediaList[0]);

  /* ---------------- options ---------------- */
  // Colours may be stored as plain strings or as {name, hex, image} objects.
  const colors = useMemo(() => {
    const raw = product?.colors || [];
    return raw.map((c: any) =>
      typeof c === 'string' ? { name: c, hex: '', image: product.image } : { image: product.image, ...c },
    );
  }, [product]);

  const sizes: string[] = product?.sizes || [];

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [guarantee, setGuarantee] = useState<string>(cfg.guarantee.defaultValue);
  const [servicePlan, setServicePlan] = useState<string>(cfg.servicePlan.options[0]?.id || 'none');

  // Reset all selections whenever the product changes.
  useEffect(() => {
    if (!product) return;
    setSelectedMedia(mediaList[0]);
    setSelectedColor(product.defaultColor || colors[0]?.name || '');
    setSelectedSize(product.defaultSize || sizes[0] || '');
    setGuarantee(cfg.guarantee.defaultValue);
    setServicePlan(cfg.servicePlan.options[0]?.id || 'none');
    setQty(1);
    setAdded(false);
    trackRecentlyViewed(product.id);
    window.scrollTo({ top: 0, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  /* ---------------- sticky buy bar ---------------- */
  useEffect(() => {
    if (!cfg.buyBox.stickyBarEnabled) return;
    const onScroll = () => {
      if (buyBoxRef.current) setShowStickyBar(buyBoxRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [cfg.buyBox.stickyBarEnabled]);

  const countdown = useCountdown(cfg.promo.endDate);

  if (!product) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20 text-center">
        {notFound ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/" className="hover:underline" style={{ color: theme.primary }}>Return to home</Link>
          </>
        ) : (
          <p className="text-gray-500">Loading…</p>
        )}
      </div>
    );
  }

  /* ---------------- pricing ---------------- */
  const planPrice = cfg.servicePlan.enabled
    ? cfg.servicePlan.options.find((o: any) => o.id === servicePlan)?.price || 0
    : 0;
  const unitPrice = product.price + planPrice;
  const displayPrice = unitPrice;
  const displayOldPrice = product.oldPrice ? product.oldPrice + planPrice : undefined;
  const inStock = product.inStock !== false;

  const category = categories.find((c: any) => c.id === product.categoryId);

  /* ---------------- actions ---------------- */
  const handleAddToCart = async () => {
    await addToCart(
      {
        ...product,
        price: unitPrice,
        oldPrice: displayOldPrice,
        selectedColor,
        selectedSize,
        guarantee,
        servicePlanId: servicePlan,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(product.code || '').catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  const handleVote = async (reviewId: number, dir: 'up' | 'down') => {
    try {
      const { review } = await voteReview(reviewId, dir);
      setProduct((prev: any) => ({
        ...prev,
        reviewList: (prev.reviewList || []).map((r: any) => (r.id === reviewId ? { ...r, ...review } : r)),
      }));
    } catch (err: any) {
      alert(err?.message ?? 'Could not record your vote.');
    }
  };

  const handleAddReview = async (review: any) => {
    const result = await submitReview(product.id, review);
    if (result.pending) {
      alert('Thank you! Your review was submitted and is awaiting approval.');
    } else {
      // Re-fetch so the aggregate rating and breakdown stay in step with the server.
      setProduct(await getProduct(product.id));
    }
  };

  /* ------------------------------------------------------------------ */
  /* Block renderer                                                      */
  /* ------------------------------------------------------------------ */

  const renderBlock = (block: any) => {
    if (!block.enabled) return null;
    const s = block.settings || {};
    if (s.visibilityRule === 'low_stock' && (product.stock ?? 99) >= 10) return null;
    if (s.visibilityRule === 'has_discount' && !product.discount) return null;
    if (s.visibilityRule === 'in_stock' && !inStock) return null;
    if (s.visibilityRule === 'out_of_stock' && inStock) return null;

    switch (block.type) {
      /* ---------------- media ---------------- */
      case 'gallery':
        return (
          <div key={block.id} className="mb-6">
            <ProductGallery
              product={product}
              media={mediaList}
              selected={selectedMedia}
              onSelect={setSelectedMedia}
              config={cfg}
            />
          </div>
        );

      /* ---------------- title ---------------- */
      case 'title_price':
        return (
          <div key={block.id} className="mb-5">
            <h1 className="text-[19px] sm:text-[21px] font-bold text-gray-900 leading-[1.35] mb-2.5">
              {product.title}
            </h1>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mb-2">
              {cfg.titleBlock.showRating && (
                <span className="flex items-center gap-1.5">
                  <Stars value={product.rating || 0} size={13} color={theme.star} />
                  <span className="text-[12px] font-bold text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                </span>
              )}
              {cfg.titleBlock.showReviewCount && (
                <a href="#reviews" className="text-[12px] hover:underline" style={{ color: theme.link }}>
                  Reviews: {product.reviews || 0}
                </a>
              )}
              {cfg.titleBlock.showWriteReview && (
                <a href="#reviews" className="text-[12px] hover:underline" style={{ color: theme.link }}>
                  {cfg.titleBlock.writeReviewLabel}
                </a>
              )}
            </div>
            {cfg.titleBlock.showCode && product.code && (
              <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
                {cfg.titleBlock.codeLabel}
                {cfg.titleBlock.showCopyCode && (
                  <button onClick={handleCopyCode} className="text-gray-400 hover:text-gray-700" title="Copy code">
                    {codeCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <span className="text-gray-900">{product.code}</span>
              </div>
            )}
          </div>
        );

      case 'short_description':
        return product.shortNote ? (
          <div
            key={block.id}
            className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold w-fit"
            style={{ background: `${theme.primary}14`, color: theme.primary }}
          >
            {product.shortNote}
          </div>
        ) : null;

      /* ---------------- options ---------------- */
      case 'variants': {
        if (!cfg.variants.enabled) return null;
        if (colors.length === 0 && sizes.length === 0) return null;
        return (
          <div key={block.id} className="flex flex-col mb-5">
            {colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="font-bold text-[12.5px] text-gray-900">{cfg.variants.colorLabel}:</span>
                  {cfg.variants.showSelectedName && (
                    <span className="text-[12.5px] text-gray-600">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c: any) => {
                    const active = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedColor(c.name);
                          if (c.image) setSelectedMedia({ type: 'image', url: c.image });
                        }}
                        className="flex flex-col items-center gap-1 w-[62px] group relative"
                        title={c.name}
                      >
                        <span
                          className={`w-[54px] h-[54px] rounded-[8px] border p-1 flex items-center justify-center bg-white transition-all ${
                            active ? 'border-2' : 'border-gray-200 group-hover:border-gray-400'
                          }`}
                          style={active ? { borderColor: theme.primary } : undefined}
                        >
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <span className="w-full h-full rounded-[5px]" style={{ background: c.hex || '#e5e7eb' }} />
                          )}
                        </span>
                        <span className={`text-[10px] leading-tight text-center ${active ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                          {c.name}
                        </span>
                        {active && (
                          <CheckCircle2
                            className="absolute -top-1 -right-0.5 w-[16px] h-[16px] bg-white rounded-full"
                            style={{ color: theme.primary }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <div className="font-bold text-[12.5px] text-gray-900 mb-2">
                  {product.sizeLabel || cfg.variants.sizeLabel}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-1.5 rounded-[6px] text-[12.5px] font-medium transition-all border ${
                          active ? 'border-2 text-gray-900 font-bold' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                        style={active ? { borderColor: theme.primary } : undefined}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'guarantee_select':
        if (!cfg.guarantee.enabled || cfg.guarantee.options.length === 0) return null;
        return (
          <div key={block.id} className="mb-5">
            <div className="font-bold text-[12.5px] text-gray-900 mb-2">{cfg.guarantee.label}</div>
            <div className="relative">
              <select
                value={guarantee}
                onChange={(e) => setGuarantee(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[12.5px] text-gray-800 bg-white outline-none focus:border-gray-400 cursor-pointer"
              >
                {cfg.guarantee.options.map((o: string) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        );

      case 'service_plan': {
        if (!cfg.servicePlan.enabled || cfg.servicePlan.options.length === 0) return null;
        return (
          <div key={block.id} className="mb-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="font-bold text-[12.5px] text-gray-900">{cfg.servicePlan.title}</span>
              {cfg.servicePlan.tooltip && (
                <span className="group relative">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-900 text-white text-[11px] rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 leading-relaxed">
                    {cfg.servicePlan.tooltip}
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 mb-2.5">
              {cfg.servicePlan.options.map((o: any) => (
                <label key={o.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="service-plan"
                    checked={servicePlan === o.id}
                    onChange={() => setServicePlan(o.id)}
                    className="w-4 h-4 border-gray-300"
                    style={{ accentColor: theme.primary }}
                  />
                  <span className="text-[12.5px] text-gray-700 group-hover:text-gray-900">
                    {o.label}
                    {o.price > 0 && <span className="text-gray-500"> (+{formatPrice(o.price)})</span>}
                  </span>
                </label>
              ))}
            </div>
            {cfg.servicePlan.note && (
              <p className="text-[11px] text-gray-400 leading-relaxed">{cfg.servicePlan.note}</p>
            )}
          </div>
        );
      }

      /* ---------------- sidebar ---------------- */
      case 'brand_logo':
        if (!cfg.brand.enabled || !cfg.brand.showLogo) return null;
        if (!product.brandLogo && !product.brand) return null;
        return (
          <div key={block.id} className="flex justify-end mb-3">
            {product.brandLogo ? (
              <img src={product.brandLogo} alt={product.brand} className="h-8 object-contain opacity-90" />
            ) : (
              <span className="text-[13px] font-semibold text-gray-500">{product.brand}</span>
            )}
          </div>
        );

      case 'price_box':
        return (
          <div key={block.id} className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[27px] font-bold text-gray-900 leading-none">{formatPrice(displayPrice)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {cfg.priceBox.showOldPrice && displayOldPrice && (
                <span className="text-[13px] text-gray-400 line-through">{formatPrice(displayOldPrice)}</span>
              )}
              {cfg.priceBox.showDiscountBadge && product.discount ? (
                <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">
                  -{product.discount}%
                </span>
              ) : null}
            </div>
            {cfg.priceBox.showStockStatus && (
              <div
                className="text-[12.5px] font-medium mt-2"
                style={{ color: inStock ? '#00a651' : '#9ca3af' }}
              >
                {inStock ? cfg.priceBox.inStockLabel : cfg.priceBox.outOfStockLabel}
              </div>
            )}
          </div>
        );

      case 'promo_deal': {
        if (!cfg.promo.enabled) return null;
        if (cfg.promo.showCountdown && countdown.expired) return null;
        return (
          <div
            key={block.id}
            className="rounded-[10px] p-3.5 mb-4"
            style={{
              background: `linear-gradient(135deg, ${cfg.promo.gradientFrom}, ${cfg.promo.gradientTo})`,
              color: cfg.promo.textColor,
            }}
          >
            <div className="flex items-start gap-2 mb-2.5">
              <Gift className="w-4 h-4 shrink-0 mt-[1px]" />
              <span className="text-[12px] font-bold leading-snug">{cfg.promo.title}</span>
            </div>

            {cfg.promo.showCountdown && (
              <>
                {cfg.promo.subtitle && <div className="text-[10.5px] opacity-90 mb-1.5">{cfg.promo.subtitle}</div>}
                <div className="flex gap-1.5 mb-2.5">
                  {[
                    { v: countdown.days, l: 'days' },
                    { v: countdown.hours, l: 'hours' },
                    { v: countdown.minutes, l: 'minutes' },
                    { v: countdown.seconds, l: 'seconds' },
                  ].map((u) => (
                    <div key={u.l} className="flex flex-col items-center bg-white/20 rounded-[6px] px-2 py-1 min-w-[42px]">
                      <span className="text-[15px] font-bold leading-none">{String(u.v).padStart(2, '0')}</span>
                      <span className="text-[8.5px] opacity-80 mt-0.5">{u.l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {cfg.promo.linkText && (
              <a href={cfg.promo.linkUrl} className="text-[11px] underline opacity-90 hover:opacity-100 inline-flex items-center gap-1">
                {cfg.promo.linkText}
                <ChevronDown className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      }

      case 'add_to_cart':
        return (
          <div key={block.id} ref={buyBoxRef} className="mb-4">
            <div className="flex items-stretch gap-2 mb-2.5 h-[42px]">
              {cfg.buyBox.showQuantity && (
                <div className="flex items-center border border-gray-200 rounded-[8px] w-[92px] justify-between px-1 shrink-0">
                  <button
                    onClick={() => setQty(Math.max(cfg.buyBox.minQty, qty - 1))}
                    className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    value={qty}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n)) setQty(Math.min(cfg.buyBox.maxQty, Math.max(cfg.buyBox.minQty, n)));
                    }}
                    className="w-8 text-center font-bold text-[13px] text-gray-900 outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setQty(Math.min(cfg.buyBox.maxQty, qty + 1))}
                    className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 text-white rounded-[8px] font-bold text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:brightness-95"
                style={{ background: added ? '#00a651' : theme.primary }}
              >
                {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" />}
                {added ? cfg.buyBox.addedLabel : cfg.buyBox.addToCartLabel}
              </button>
            </div>

            {cfg.buyBox.showOneClick && (
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full h-[40px] rounded-[8px] border-2 font-bold text-[13px] transition-colors hover:bg-orange-50 disabled:opacity-40 mb-3"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                {cfg.buyBox.oneClickLabel}
              </button>
            )}

            <div className="flex items-center gap-4">
              {cfg.buyBox.showWishlist && (
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {cfg.buyBox.wishlistLabel}
                </button>
              )}
              {cfg.buyBox.showCompare && (
                <button
                  onClick={() => { addToCompare(product); setCompared(true); }}
                  className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Repeat2 className={`w-4 h-4 ${compared ? 'text-[#0058a3]' : ''}`} />
                  {cfg.buyBox.compareLabel}
                </button>
              )}
            </div>
          </div>
        );

      case 'delivery_options': {
        if (!cfg.delivery.enabled) return null;
        const methods = cfg.delivery.methods.filter((m: any) => m.enabled);
        if (methods.length === 0) return null;
        return (
          <Panel key={block.id} title={cfg.delivery.title} defaultOpen={!cfg.delivery.collapsedByDefault}>
            <div className="flex flex-col gap-3.5">
              {methods.map((m: any) => (
                <div key={m.id} className="flex items-start gap-2.5">
                  <span
                    className="w-8 h-8 rounded-[6px] shrink-0 flex items-center justify-center overflow-hidden text-[15px]"
                    style={{ background: m.iconBg }}
                  >
                    {m.icon?.startsWith('http') ? (
                      <img src={m.icon} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      m.icon
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] text-gray-900">
                        <span className="font-semibold">{m.name}</span>
                        {m.tag && <span className="text-gray-500"> - {m.tag}</span>}
                      </span>
                      <span
                        className="text-[11.5px] shrink-0 flex items-center gap-1"
                        style={{ color: m.priceIsFree ? '#00a651' : '#6b7280' }}
                      >
                        {m.price}
                        {!m.priceIsFree && <Info className="w-3 h-3 text-gray-300" />}
                      </span>
                    </div>
                    {m.lines?.map((l: string, i: number) => (
                      <div key={i} className="text-[11px] text-gray-500 mt-0.5">{l}</div>
                    ))}
                    {m.linkText && (
                      <Link to={m.linkUrl || '#'} className="text-[11px] hover:underline mt-0.5 inline-block" style={{ color: theme.link }}>
                        {m.linkText}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {cfg.delivery.detailsText && (
              <Link
                to={cfg.delivery.detailsUrl}
                className="text-[11.5px] hover:underline mt-3 inline-flex items-center gap-1"
                style={{ color: theme.link }}
              >
                {cfg.delivery.detailsText}
                <ChevronDown className="w-3 h-3" />
              </Link>
            )}
          </Panel>
        );
      }

      case 'payment_options': {
        if (!cfg.payment.enabled) return null;
        const methods = cfg.payment.methods.filter((m: any) => m.enabled);
        return (
          <Panel key={block.id} title={cfg.payment.title}>
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {methods.map((m: any) => (
                  <span
                    key={m.id}
                    className="h-[22px] w-[38px] border border-gray-200 rounded-[4px] flex items-center justify-center bg-white shrink-0 overflow-hidden"
                    title={m.label}
                  >
                    {m.image ? (
                      <img src={m.image} alt={m.label} className="max-h-[12px] max-w-[32px] object-contain" />
                    ) : (
                      <span className="text-[7px] font-bold text-gray-500 truncate px-0.5">{m.label}</span>
                    )}
                  </span>
                ))}
              </div>
              {cfg.payment.detailsText && (
                <Link to={cfg.payment.detailsUrl} className="text-[11.5px] hover:underline shrink-0 flex items-center gap-1 whitespace-nowrap" style={{ color: theme.link }}>
                  {cfg.payment.detailsText}
                  <ChevronDown className="w-3 h-3" />
                </Link>
              )}
            </div>
            {cfg.payment.note && <p className="text-[11px] text-gray-500 leading-relaxed">{cfg.payment.note}</p>}
          </Panel>
        );
      }

      case 'warranty_returns': {
        if (!cfg.warrantyReturns.enabled) return null;
        const items = cfg.warrantyReturns.items.filter((i: any) => i.enabled);
        if (items.length === 0) return null;
        return (
          <Panel key={block.id} title={cfg.warrantyReturns.title}>
            <div className="flex flex-col gap-2.5">
              {items.map((it: any) => (
                <div key={it.id} className="flex items-start justify-between gap-2">
                  <p className="text-[11.5px] text-gray-500 leading-relaxed">
                    {it.text} {it.highlight && <span className="font-bold text-gray-900">{it.highlight}</span>}
                  </p>
                  {it.linkText && (
                    <Link to={it.linkUrl || '#'} className="text-[11.5px] hover:underline shrink-0 flex items-center gap-1" style={{ color: theme.link }}>
                      {it.linkText}
                      <ChevronDown className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        );
      }

      /* ---------------- main content ---------------- */
      case 'features': {
        if (!cfg.features.enabled) return null;
        // Prefer grouped spec data; fall back to the flat `features` array.
        const groups =
          product.specGroups?.length
            ? product.specGroups
            : product.features?.length
            ? [{ id: 'flat', title: '', items: product.features }]
            : [];
        if (groups.length === 0) return null;

        return (
          <div key={block.id} className="mb-10">
            <h2 className="text-[17px] font-bold text-gray-900 mb-4">{cfg.features.title}</h2>
            <div className={`grid gap-x-12 gap-y-4 ${cfg.features.columns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {groups.map((g: any) => (
                <div key={g.id || g.title}>
                  {g.title && <h3 className="text-[12.5px] font-bold text-gray-900 mb-1.5">{g.title}</h3>}
                  {g.items.map((it: any, i: number) => (
                    <SpecRow key={i} name={it.name} value={it.value} />
                  ))}
                </div>
              ))}
            </div>
            {cfg.features.showFindSimilar && (
              <Link
                to={`/search?q=${encodeURIComponent(product.brand || product.title.split(' ')[0])}`}
                className="mt-5 inline-flex items-center gap-1.5 border border-gray-300 rounded-full px-3.5 py-1.5 text-[12px] text-gray-700 hover:border-gray-500 transition-colors"
              >
                <SearchIcon className="w-3.5 h-3.5" />
                {cfg.features.findSimilarLabel}
              </Link>
            )}
          </div>
        );
      }

      case 'full_description':
        if (!cfg.description.enabled || !product.description) return null;
        return (
          <div key={block.id} className="mb-10">
            <h2 className="text-[17px] font-bold text-gray-900 mb-3">{cfg.description.title}</h2>
            <div className="text-[12.5px] text-gray-600 leading-[1.85] whitespace-pre-line">{product.description}</div>
          </div>
        );

      case 'key_features': {
        if (!cfg.keyFeatures.enabled) return null;
        const list: string[] = product.keyFeatures || [];
        if (list.length === 0) return null;
        const collapsed = cfg.keyFeatures.collapsedCount || 0;
        const shown = showKeyFeatures ? list : list.slice(0, collapsed);
        return (
          <div key={block.id} className="mb-10">
            <h2 className="text-[17px] font-bold text-gray-900 mb-3">{cfg.keyFeatures.title}</h2>
            {shown.length > 0 && (
              <ul className="flex flex-col gap-1.5 mb-2">
                {shown.map((f, i) => (
                  <li key={i} className="text-[12.5px] text-gray-600 leading-relaxed flex gap-2">
                    <span className="text-gray-400 mt-[7px] w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {list.length > collapsed && (
              <button
                onClick={() => setShowKeyFeatures(!showKeyFeatures)}
                className="text-[12px] text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
              >
                {showKeyFeatures ? cfg.keyFeatures.lessLabel : cfg.keyFeatures.moreLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showKeyFeatures ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        );
      }

      case 'reviews':
        if (!cfg.reviews.enabled) return null;
        return (
          <div key={block.id} id="reviews">
            <ReviewsSection
              product={product}
              config={cfg.reviews}
              onAddReview={handleAddReview}
              onVote={handleVote}
            />
          </div>
        );

      case 'related_products':
        if (!cfg.related.enabled) return null;
        return (
          <RelatedProducts
            key={block.id}
            product={product}
            products={products}
            recentlyViewed={recentlyViewed}
            config={cfg.related}
            theme={theme}
          />
        );

      case 'promo_banners': {
        if (!cfg.promoBanners.enabled) return null;
        const banners = cfg.promoBanners.banners.filter((b: any) => b.enabled);
        if (banners.length === 0) return null;
        return (
          <div key={block.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {banners.map((b: any) => (
              <Link
                key={b.id}
                to={b.link}
                className="rounded-[10px] p-5 flex flex-col relative overflow-hidden group min-h-[170px]"
                style={{ background: b.bg }}
              >
                <span className="text-[11px] text-gray-500 mb-0.5">{b.brand}</span>
                <span className="text-[16px] font-bold text-gray-900 leading-tight mb-1">{b.title}</span>
                <span className="text-[11px] text-gray-500 leading-snug max-w-[60%]">{b.subtitle}</span>
                <span className="mt-auto text-[11.5px] font-semibold text-gray-900 underline decoration-1 underline-offset-2 w-fit">
                  {b.buttonText}
                </span>
                {b.image && (
                  <img
                    src={b.image}
                    alt=""
                    className="absolute right-0 bottom-0 w-[45%] h-[75%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform origin-bottom-right"
                  />
                )}
              </Link>
            ))}
          </div>
        );
      }

      /* ---------------- optional extras ---------------- */
      case 'faq':
        return (
          <div key={block.id} className="mb-10">
            <h2 className="text-[17px] font-bold text-gray-900 mb-4">{s.title || 'Frequently asked questions'}</h2>
            <div className="flex flex-col gap-2">
              {(s.faqs || []).map((f: any, i: number) => (
                <details key={i} className="border border-gray-200 rounded-[10px] px-4 py-3 group">
                  <summary className="font-semibold text-[13px] text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {f.q}
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-[12.5px] text-gray-600 mt-2 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div key={block.id} className="mb-4 p-3.5 rounded-[10px] bg-red-50 border border-red-100 text-center">
            <div className="text-red-600 font-bold text-[12.5px] mb-2 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" /> {s.text || 'Limited time offer!'}
            </div>
            <div className="flex gap-2 justify-center">
              {[
                { v: countdown.hours, l: 'h' },
                { v: countdown.minutes, l: 'm' },
                { v: countdown.seconds, l: 's' },
              ].map((u) => (
                <span key={u.l} className="bg-white rounded px-2.5 py-1 font-mono font-bold text-[15px] border border-red-100">
                  {String(u.v).padStart(2, '0')}
                  <span className="text-[10px] font-sans text-gray-500 ml-0.5">{u.l}</span>
                </span>
              ))}
            </div>
          </div>
        );

      case 'stock_indicator':
        return (
          <div key={block.id} className="mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[12.5px] font-medium text-gray-700">
              {s.text || `Only ${product.stock ?? 5} items left in stock`}
            </span>
          </div>
        );

      case 'shipping_info':
        return (
          <div key={block.id} className="border border-gray-200 rounded-[10px] p-4 mb-4">
            <div className="font-bold text-[13px] text-gray-900 mb-1">{s.title || 'Delivery'}</div>
            <div className="text-[11.5px] text-gray-500">{s.text || 'Fast delivery nationwide'}</div>
          </div>
        );

      case 'warranty':
        return (
          <div key={block.id} className="bg-[#f2f4f8] rounded-[10px] p-4 mb-4">
            <div className="flex items-center font-bold text-[12.5px] text-gray-900 mb-1.5 gap-2">
              <Clock className="w-4 h-4" /> {product.warranty ? 'WARRANTY INFORMATION' : '14-DAY RETURN PERIOD'}
            </div>
            <p className="text-[11.5px] text-gray-600 leading-relaxed pl-6">
              {product.warranty || 'All items with carrier network plans have a 14-day return period.'}
            </p>
          </div>
        );

      case 'custom_html':
        return <div key={block.id} className="w-full my-5" dangerouslySetInnerHTML={{ __html: s.html || '' }} />;

      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------ */

  const tpl = product.pageTemplateOverride || productTemplate;
  const region = (key: string) => (tpl as any)[key] || [];

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
      {cfg.breadcrumbs.enabled && (
        <nav className="text-[11.5px] text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          {cfg.breadcrumbs.showHome && (
            <>
              <Link to="/" className="hover:text-gray-700">{cfg.breadcrumbs.homeLabel}</Link>
              <span>/</span>
            </>
          )}
          {(category || product.categoryName) && (
            <>
              <Link to={`/category/${product.categoryId}`} className="hover:text-gray-700">
                {category?.name || product.categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600">{product.title}</span>
        </nav>
      )}

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 items-start">
        {/* Main column: gallery + details, then long-form content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-10 items-start mb-8">
            <div className="flex flex-col">{region('leftColumn').map(renderBlock)}</div>
            <div className="flex flex-col">{region('middleColumn').map(renderBlock)}</div>
          </div>
          <div className="flex flex-col">{region('mainContent').map(renderBlock)}</div>
        </div>

        {/* Sticky buy box */}
        <aside className="w-full lg:w-[300px] xl:w-[330px] shrink-0 lg:sticky lg:top-4 self-start">
          <div className="border border-gray-200 rounded-[12px] p-4">
            {region('rightSidebar').map(renderBlock)}
          </div>
        </aside>
      </div>

      {/* Full-width sections */}
      <div className="w-full mt-4">{region('bottomContent').map(renderBlock)}</div>

      {/* Sticky add-to-cart bar */}
      <AnimatePresence>
        {cfg.buyBox.stickyBarEnabled && showStickyBar && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-4 py-3"
          >
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 border border-gray-100 rounded-lg p-1 shrink-0">
                  <img
                    src={selectedMedia?.url || product.image}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-gray-900 truncate">{product.title}</span>
                  <span className="text-[11px] text-gray-500 truncate">
                    {[selectedColor, selectedSize].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col">
                  <span className="text-[19px] font-bold text-gray-900 leading-none">{formatPrice(displayPrice)}</span>
                  {displayOldPrice && (
                    <span className="text-[11px] text-gray-400 line-through mt-0.5">{formatPrice(displayOldPrice)}</span>
                  )}
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-[42px] px-7 text-white rounded-[8px] font-bold text-[13px] flex items-center gap-2 disabled:opacity-40 hover:brightness-95 transition-all"
                  style={{ background: added ? '#00a651' : theme.primary }}
                >
                  {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" />}
                  {added ? cfg.buyBox.addedLabel : cfg.buyBox.addToCartLabel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
