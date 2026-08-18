import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';
import { defaultCategoryGrid } from '../data/homeSections';

const COLS_MOBILE: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
};
const COLS_TABLET: Record<number, string> = {
  1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6',
};
const COLS_DESKTOP: Record<number, string> = {
  2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8',
};

const SHAPE_RATIO: Record<string, string> = {
  square: '1 / 1',
  portrait: '3 / 4',
  landscape: '4 / 3',
};

/**
 * The category grid. Every proportion, colour and behaviour comes from the
 * `categoryGrid` setting — see Home Sections → Category Grid in the admin.
 *
 * Categories themselves are managed in /admin/categories and are never
 * hard-coded here.
 */
export function CategoriesGrid() {
  const { categories, products, categoryGrid } = useAdmin();
  const { tr } = useLang();
  const cfg = { ...defaultCategoryGrid, ...(categoryGrid ?? {}) };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    if (!cfg.showCount) return map;
    (products ?? []).forEach((p: any) => {
      const key = String(p.categoryId ?? p.category_id ?? '');
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [products, cfg.showCount]);

  const shown = useMemo(() => {
    let list = categories ?? [];
    if (cfg.source === 'selected' && cfg.categoryIds?.length) {
      // Chosen order is the display order.
      list = cfg.categoryIds
        .map((id) => list.find((c: any) => String(c.id) === String(id)))
        .filter(Boolean) as any[];
    }
    return cfg.limit > 0 ? list.slice(0, cfg.limit) : list;
  }, [categories, cfg.source, cfg.categoryIds, cfg.limit]);

  if (!shown.length) return null;

  const overlay = cfg.labelPosition === 'overlay';

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 py-8">
      {cfg.showHeading && (tr(cfg.headingAccent) || tr(cfg.heading)) && (
        <h2 className="text-[22px] sm:text-[30px] font-black tracking-tight text-center mb-6" style={{ color: cfg.textColor }}>
          <span className="text-[#00a651]">{tr(cfg.headingAccent)}</span> {tr(cfg.heading)}
        </h2>
      )}

      <div
        className={`grid ${COLS_MOBILE[cfg.columnsMobile] ?? 'grid-cols-2'} ${
          COLS_TABLET[cfg.columnsTablet] ?? 'sm:grid-cols-3'} ${
          COLS_DESKTOP[cfg.columnsDesktop] ?? 'lg:grid-cols-4'}`}
        style={{ gap: cfg.gap }}
      >
        {shown.map((category: any) => (
          <CategoryCard
            key={category.id}
            category={category}
            cfg={cfg}
            overlay={overlay}
            label={tr({ en: category.name, ar: category.nameAr })}
            count={cfg.showCount ? counts.get(String(category.id)) ?? 0 : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category, cfg, overlay, label, count }: {
  category: any; cfg: any; overlay: boolean; label: string; count?: number;
}) {
  const [hover, setHover] = useState(false);

  const shape = cfg.cardShape === 'fixed'
    ? { height: cfg.cardHeight }
    : { aspectRatio: SHAPE_RATIO[cfg.cardShape] ?? SHAPE_RATIO.landscape };

  return (
    <Link
      to={`/category/${category.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative flex flex-col overflow-hidden transition-all duration-300 group ${
        cfg.hoverEffect === 'lift' ? 'hover:-translate-y-1 hover:shadow-lg' : ''
      }`}
      style={{
        ...shape,
        borderRadius: cfg.cardRadius,
        backgroundColor: hover ? cfg.cardHoverBg : cfg.cardBg,
        border: cfg.showBorder ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
      }}
    >
      {/*
        min-h-0 is what keeps the caption inside the card: without it a flex
        item refuses to shrink below its content, so a tall picture pushed the
        label out of the bottom of the card and it was clipped away.
      */}
      <div
        className={`min-h-0 flex items-center justify-center ${overlay ? 'absolute inset-0' : 'flex-1'}`}
        style={overlay ? undefined : { padding: cfg.imageFit === 'cover' ? 0 : '8%' }}
      >
        {category.image ? (
          <img
            src={category.image}
            alt={label}
            loading="lazy"
            className={`transition-transform duration-300 ${cfg.hoverEffect === 'zoom' ? 'group-hover:scale-105' : ''} ${
              cfg.blendImage && cfg.imageFit === 'contain' ? 'mix-blend-multiply' : ''
            }`}
            style={
              cfg.imageFit === 'cover'
                ? { width: '100%', height: '100%', objectFit: 'cover' }
                : { maxWidth: `${cfg.imageScale}%`, maxHeight: `${cfg.imageScale}%`, objectFit: 'contain' }
            }
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {overlay ? (
        <div className="relative mt-auto w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
          <span className="block font-semibold leading-tight text-white" style={{ fontSize: cfg.labelSize }}>
            {label}
          </span>
          {cfg.showCount && count != null && (
            <span className="block text-[12px] text-white/75 mt-0.5">{count} products</span>
          )}
        </div>
      ) : (
        <div className="shrink-0 px-3 pb-4 pt-1 text-center">
          <span
            className="block font-medium leading-tight line-clamp-2"
            style={{ fontSize: cfg.labelSize, color: cfg.textColor }}
          >
            {label}
          </span>
          {cfg.showCount && count != null && (
            <span className="block text-[12px] text-gray-500 mt-1">{count} products</span>
          )}
        </div>
      )}
    </Link>
  );
}
