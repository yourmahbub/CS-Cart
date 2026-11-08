import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Star, Award, Copy, MoveLeft, MoveRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import type { PromoBanner } from '../../data/homeSections';

/**
 * The "Seasonal offers" grid.
 *
 * Everything here is admin-editable: the two rotating banners come from the
 * `promoBanners` setting, and the three product areas hold product IDs that
 * are resolved against the live catalogue — so prices, stock and discounts are
 * always the real ones, in the store currency.
 */
export function PromoBanners() {
  const { products, promoBanners: pb } = useAdmin();
  const { formatPrice, addToCart } = useCart();
  const { tr, t, localizeProduct } = useLang();

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [spotIndex, setSpotIndex] = useState(0);

  const byId = useMemo(() => {
    const map = new Map<string, any>();
    products.forEach((p: any) => map.set(String(p.id), p));
    return map;
  }, [products]);

  /**
   * Resolve configured IDs to products. When the shop has not picked any yet,
   * fall back to the catalogue so a fresh install still looks complete rather
   * than showing an empty column.
   */
  const pick = (ids: string[] | undefined, count: number, offset: number) => {
    const chosen = (ids ?? []).map((id) => byId.get(String(id))).filter(Boolean);
    if (chosen.length) return chosen.slice(0, count).map(localizeProduct);
    return products.slice(offset, offset + count).map(localizeProduct);
  };

  const spotlight = pick(pb?.spotlightIds, 6, 0);
  const leftList = pick(pb?.leftListIds, 2, 6);
  const rightList = pick(pb?.rightListIds, 2, 8);

  const topBanners: PromoBanner[] = pb?.topBanners?.length ? pb.topBanners : [];
  const bottomBanners: PromoBanner[] = pb?.bottomBanners?.length ? pb.bottomBanners : [];

  const top = topBanners[topIndex % Math.max(topBanners.length, 1)];
  const bottom = bottomBanners[bottomIndex % Math.max(bottomBanners.length, 1)];
  const spot = spotlight[spotIndex % Math.max(spotlight.length, 1)];

  const step = (dir: 1 | -1) =>
    setSpotIndex((i) => (i + dir + spotlight.length) % Math.max(spotlight.length, 1));

  /* A compact product row, used in both side columns. */
  const MiniProduct = ({ product, imageSize, withCart }: { product: any; imageSize: string; withCart?: boolean; key?: React.Key }) => (
    <div className="flex items-start gap-4 p-5 relative border-b border-gray-200/70 last:border-b-0">
      <Link to={`/product/${product.slug || product.id}`} className={`${imageSize} flex-shrink-0 flex items-center justify-center mix-blend-multiply pt-1`}>
        <img src={product.image || product.images?.[0]} alt={tr(product.title)} className="object-contain w-full max-h-full" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.slug || product.id}`}>
          <h4 className="text-[13px] text-[#111827] font-medium leading-[1.3] mb-1.5 pe-8 line-clamp-2 hover:text-[#00a651] transition-colors">
            {tr(product.title)}
          </h4>
        </Link>
        {product.code && (
          <p className="text-[11px] text-gray-500 mb-2 font-mono tracking-wider flex items-center gap-1 uppercase">
            CODE: <span className="text-gray-500 flex items-center gap-0.5 truncate"><Copy className="w-3 h-3 shrink-0" /> {product.code}</span>
          </p>
        )}
        <div className="flex items-center gap-1.5 mb-2">
          <Star className={`w-3.5 h-3.5 ${product.rating ? 'text-[#ff6100] fill-[#ff6100]' : 'text-gray-400 fill-gray-400'}`} />
          <span className="text-gray-500 text-[12px]">
            {Number(product.rating || 0).toFixed(1)}{product.reviews ? ` (${product.reviews})` : ''}
          </span>
          <Award className="w-3.5 h-3.5 text-[#ff6100]" />
        </div>
        <div className={`text-[13px] mb-2 font-medium ${product.inStock ? 'text-[#00a651]' : 'text-gray-400'}`}>
          {product.inStock ? t('In stock') : t('Out of stock')}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[18px] font-bold text-[#111827]">{formatPrice(product.price)}</span>
          {product.oldPrice > 0 && (
            <span className="text-[13px] text-gray-400 line-through tracking-tight">{formatPrice(product.oldPrice)}</span>
          )}
          {product.discount > 0 && (
            <span className="text-[10px] text-gray-500 border border-gray-300 rounded-full px-1.5 py-[1px]">-{product.discount}%</span>
          )}
        </div>
        {withCart && (
          <button
            onClick={() => addToCart(product, 1)}
            aria-label={t('Add to cart')}
            className="absolute bottom-6 end-6 w-9 h-9 rounded-full bg-[#00A651] flex items-center justify-center text-white hover:bg-[#008c44] shadow-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  /* A rotating marketing banner. `variant` mirrors the two original designs. */
  const Banner = ({ banner, list, index, setIndex, variant }: {
    banner: PromoBanner; list: PromoBanner[]; index: number;
    setIndex: (i: number) => void; variant: 'top' | 'bottom';
  }) => (
    <div
      className="rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-center min-h-[260px]"
      style={{ backgroundColor: banner.bg || '#f8f9fa' }}
    >
      <div className="z-10 max-w-[55%] relative">
        <div className="text-[15px] mb-1 font-medium text-gray-600">{tr(banner.brand)}</div>
        <h3 className="text-[28px] sm:text-[34px] font-black text-[#111827] leading-[1.05] tracking-tight mb-2">
          {tr(banner.title)}
          {variant === 'top' ? <br /> : ' '}
          {tr(banner.titleSub) && (
            <span className={variant === 'top' ? 'font-extrabold text-[26px] sm:text-[30px]' : 'font-normal text-[26px] sm:text-[30px]'}>
              {tr(banner.titleSub)}
            </span>
          )}
        </h3>
        <p className="text-[#555] text-[13px] sm:text-[15px] leading-snug mb-5 whitespace-pre-line">{tr(banner.description)}</p>
        {variant === 'top' ? (
          <Link to={banner.link || '/search'} className="text-[15px] font-bold text-gray-900 flex items-center gap-1 hover:text-[#00a651] transition-colors w-fit">
            {tr(banner.buttonText) || t('Show more')} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        ) : (
          <Link
            to={banner.link || '/search'}
            className="text-white py-2 px-6 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90 w-max shadow-sm inline-block"
            style={{ backgroundColor: banner.accent || '#111827' }}
          >
            {tr(banner.buttonText) || t('Show more')}
          </Link>
        )}
      </div>

      {variant === 'top' ? (
        <>
          <div
            className="absolute top-1/2 -end-[15%] -translate-y-1/2 w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-full z-0"
            style={{ backgroundColor: banner.accent || '#ff4a11' }}
          />
          <img
            key={banner.image} src={banner.image} alt={tr(banner.title)}
            className="absolute end-0 top-1/2 -translate-y-1/2 w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] object-contain z-10 drop-shadow-2xl"
          />
        </>
      ) : (
        <div className="absolute -end-[24px] top-[10%] bottom-[10%] w-[65%] flex items-center justify-end z-0">
          <img
            key={banner.image} src={banner.image} alt={tr(banner.title)}
            className="h-full w-auto object-contain mix-blend-multiply drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]"
          />
        </div>
      )}

      {list.length > 1 && (
        <div className={`absolute bottom-5 z-20 flex gap-[5px] ${variant === 'top' ? 'start-6' : 'start-0 end-0 justify-center'}`}>
          {list.map((b, i) => (
            <button
              key={b.id ?? i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-[7px] h-[7px] rounded-full transition-colors ${i === index ? 'bg-[#00a651]' : 'bg-[#00a651] opacity-40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Nothing configured and nothing in the catalogue — render nothing rather
  // than an empty skeleton.
  if (!top && !bottom && !spotlight.length) return null;

  return (
    <section className="mb-14 overflow-hidden">
      <div className="flex flex-col items-center mb-8 mt-12 w-full max-w-full">
        <div className="relative flex items-center justify-center w-full max-w-[1600px] mx-auto px-4">
          <div className="absolute w-full h-[1.5px] border-t-[1.5px] border-gray-200 z-0" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white px-2 sm:px-6">
            <h2 className="text-[22px] sm:text-[38px] font-black text-[#111827] tracking-tight px-2 text-center min-w-0">
              <span className="text-[#00a651]">{tr(pb?.headingAccent)}</span> {tr(pb?.heading)}
            </h2>
            {tr(pb?.linkText) && (
              <Link
                to={pb?.linkUrl || '/search'}
                className="text-[14px] text-gray-900 font-medium flex items-center gap-1 hover:bg-gray-50 border border-[#2d3748]/20 rounded-full px-4 py-2 transition-colors whitespace-nowrap"
              >
                {tr(pb.linkText)} <ChevronRight className="w-4 h-4 ms-1 rtl:rotate-180" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto px-4 xl:px-0">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {top && <Banner banner={top} list={topBanners} index={topIndex} setIndex={setTopIndex} variant="top" />}
          {leftList.length > 0 && (
            <div className="bg-[#f8f9fa] rounded-[24px] flex flex-col py-1 border border-gray-100">
              {leftList.map((p: any) => <MiniProduct key={p.id} product={p} imageSize="w-[80px] h-[80px]" />)}
            </div>
          )}
        </div>

        {/* Centre spotlight */}
        {spot && (
          <div className="bg-[#f8f9fa] rounded-[24px] relative overflow-hidden flex flex-col justify-end items-center h-full group pb-8 border border-gray-100">
            {spotlight.length > 1 && (
              <div className="absolute top-6 end-6 flex gap-2 z-20">
                <button onClick={() => step(-1)} aria-label={t('Previous') || 'Previous'} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors border border-gray-100/60">
                  <MoveLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button onClick={() => step(1)} aria-label={t('Next') || 'Next'} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors border border-gray-100/60">
                  <MoveRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </div>
            )}

            {spot.discount > 0 && (
              <div className="absolute top-[10%] start-[10%] z-20">
                <span className="bg-[#ff6100] text-white text-[12px] font-bold px-2.5 py-1 rounded-full leading-none shadow-sm">-{spot.discount}%</span>
              </div>
            )}

            <Link to={`/product/${spot.slug || spot.id}`} className="flex-1 flex items-center justify-center relative w-full pt-[80px] pb-[30px] z-10">
              <img
                key={spot.id} src={spot.image || spot.images?.[0]} alt={tr(spot.title)}
                className="h-[300px] md:h-[390px] w-full max-w-[260px] object-contain drop-shadow-2xl mb-8 group-hover:scale-[1.02] transition-transform duration-500 mix-blend-multiply"
              />
            </Link>

            <div className="text-center w-full z-20 px-6 sm:px-8">
              <Link to={`/product/${spot.slug || spot.id}`}>
                <h4 className="text-[14px] text-[#111827] font-medium leading-[1.3] mb-2 min-h-[46px] flex items-center justify-center line-clamp-2 hover:text-[#00a651] transition-colors">
                  {tr(spot.title)}
                </h4>
              </Link>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Star className={`w-3.5 h-3.5 ${spot.rating ? 'text-[#ff6100] fill-[#ff6100]' : 'text-gray-400 fill-gray-400'}`} />
                <span className="text-gray-500 text-[12px]">{Number(spot.rating || 0).toFixed(1)}</span>
                <Award className="w-3.5 h-3.5 text-[#ff6100]" />
              </div>
              <div className={`text-[14px] font-medium mb-1 ${spot.inStock ? 'text-[#00a651]' : 'text-gray-400'}`}>
                {spot.inStock ? t('In stock') : t('Out of stock')}
              </div>
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 mb-6">
                <span className="text-[22px] sm:text-[24px] font-bold text-[#111827]">{formatPrice(spot.price)}</span>
                {spot.oldPrice > 0 && <span className="text-[15px] text-gray-400 line-through tracking-tight">{formatPrice(spot.oldPrice)}</span>}
                {spot.discount > 0 && <span className="text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 py-[1px]">-{spot.discount}%</span>}
              </div>
              <button
                onClick={() => addToCart(spot, 1)}
                disabled={!spot.inStock}
                className="bg-[#00a651] text-white py-2.5 px-8 rounded-full text-[15px] font-bold hover:bg-[#008c44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[150px] mx-auto shadow-[0_2px_10px_rgba(0,166,81,0.3)]"
              >
                {t('Add to cart')}
              </button>
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {rightList.length > 0 && (
            <div className="bg-[#f8f9fa] rounded-[24px] flex flex-col py-1 border border-gray-100">
              {rightList.map((p: any) => <MiniProduct key={p.id} product={p} imageSize="w-[96px] h-[96px]" withCart />)}
            </div>
          )}
          {bottom && <Banner banner={bottom} list={bottomBanners} index={bottomIndex} setIndex={setBottomIndex} variant="bottom" />}
        </div>
      </div>
    </section>
  );
}
