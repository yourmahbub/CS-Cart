import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, ImageOff } from 'lucide-react';
import { Stars } from './Stars';
import { useCart } from '../../context/CartContext';

interface Props {
  product: any;
  products: any[];
  recentlyViewed: number[];
  config: any;
  theme: any;
}

function MiniCard({ p, theme }: { p: any; theme: any }) {
  const { addToCart, formatPrice } = useCart();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const badges: { text: string; bg: string }[] = [];
  if (p.isNew) badges.push({ text: 'New', bg: '#00a651' });
  if (p.isPopular) badges.push({ text: 'Most popular', bg: '#f0a500' });

  return (
    <div className="flex flex-col h-full relative bg-white group">
      {/* Fixed-height media box keeps every card in the row aligned */}
      <div className="relative mb-2 h-[150px]">
        {p.discount ? (
          <span
            className="absolute top-0 left-0 z-10 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-[3px]"
            style={{ background: theme.danger }}
          >
            -{p.discount}%
          </span>
        ) : null}
        <div className="absolute top-0 right-0 z-10 flex flex-col gap-1 items-end">
          {badges.map((b, i) => (
            <span key={i} className="text-white text-[9px] font-bold px-1.5 py-[2px] rounded-[3px]" style={{ background: b.bg }}>
              {b.text}
            </span>
          ))}
        </div>
        <Link to={`/product/${p.id}`} className="w-full h-full flex items-center justify-center p-3 overflow-hidden">
          {p.image && !imgFailed ? (
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.04] transition-transform duration-300"
            />
          ) : (
            <span className="w-full h-full rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
              <ImageOff className="w-6 h-6" />
            </span>
          )}
        </Link>
      </div>

      <Link
        to={`/product/${p.id}`}
        className="text-[11.5px] text-gray-800 leading-[1.45] line-clamp-2 hover:text-[#0058a3] mb-1 h-[33px] overflow-hidden"
      >
        {p.title}
      </Link>

      <div className="text-[10px] text-gray-400 mb-1 h-[13px] truncate">{p.code ? `CODE: ${p.code}` : ''}</div>

      <div className="flex items-center gap-1 mb-1 h-[14px]">
        <Stars value={p.rating || 0} size={11} color={theme.star} />
        <span className="text-[10px] text-gray-400">{p.reviews || 0}</span>
      </div>

      <div className="text-[10.5px] font-medium mb-2 h-[14px]" style={{ color: p.inStock === false ? '#9ca3af' : '#00a651' }}>
        {p.inStock === false ? 'Out of stock' : 'In stock'}
      </div>

      {/* mt-auto pins this row to the bottom so prices line up across the row */}
      <div className="flex items-end justify-between gap-2 mt-auto">
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-bold text-gray-900 leading-none">{formatPrice(p.price)}</span>
          {/* Reserve the old-price line even when absent, so buttons stay level */}
          <span className="flex items-center gap-1 mt-1 h-[13px]">
            {p.oldPrice ? (
              <>
                <span className="text-[10.5px] text-gray-400 line-through">{formatPrice(p.oldPrice)}</span>
                {p.discount ? (
                  <span className="text-[9px] text-gray-500 border border-gray-300 rounded-full px-1 leading-[13px]">
                    -{p.discount}%
                  </span>
                ) : null}
              </>
            ) : null}
          </span>
        </div>

        <button
          onClick={() => {
            addToCart(p);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          disabled={p.inStock === false}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: theme.primary }}
          aria-label="Add to cart"
        >
          {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function RelatedProducts({ product, products, recentlyViewed, config, theme }: Props) {
  const tabs = (config.tabs || []).filter((t: any) => t.enabled);
  const [active, setActive] = useState(tabs[0]?.key || 'similar');
  const [visible, setVisible] = useState(config.initialCount || 6);

  const list = useMemo(() => {
    const others = products.filter((p: any) => p.id !== product.id);
    switch (active) {
      case 'popular':
        return [...others].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case 'sale':
        return others.filter((p: any) => p.discount || p.onSale);
      case 'recent':
        return recentlyViewed
          .map((id) => products.find((p: any) => p.id === id))
          .filter((p: any) => p && p.id !== product.id);
      default:
        return others.filter(
          (p: any) => !product.categoryId || p.categoryId === product.categoryId || p.brand === product.brand,
        ).concat(others).filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);
    }
  }, [active, products, product, recentlyViewed]);

  if (tabs.length === 0) return null;

  const cols = config.columns || 6;
  const gridClass =
    cols >= 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
    : cols === 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
    : cols === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    : 'grid-cols-2 sm:grid-cols-3';

  return (
    <div className="w-full mb-12">
      <h2 className="text-[22px] font-bold text-gray-900 mb-4">{config.title}</h2>

      <div
        className="flex items-center gap-5 border-b border-gray-200 mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((t: any) => (
          <button
            key={t.key}
            onClick={() => { setActive(t.key); setVisible(config.initialCount || 6); }}
            className={`pb-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active === t.key ? 'text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
            style={active === t.key ? { borderColor: theme.primary } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-[13px] text-gray-500 py-6">Nothing to show here yet.</p>
      ) : (
        <>
          <div className={`grid ${gridClass} gap-x-4 gap-y-7`}>
            {list.slice(0, visible).map((p: any) => (
              <MiniCard key={p.id} p={p} theme={theme} />
            ))}
          </div>

          {list.length > visible && (
            <div className="flex justify-center mt-7">
              <button
                onClick={() => setVisible(visible + (config.initialCount || 6))}
                className="border-2 rounded-full px-7 py-2 text-[13px] font-bold transition-colors hover:bg-orange-50"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                {config.showMoreLabel}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
