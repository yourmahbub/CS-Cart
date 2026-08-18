import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Sparkles, X, LayoutGrid } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useLang } from '../../context/LanguageContext';
import { BilingualField } from '../../components/admin/BilingualField';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { FEATURE_ICONS, PromoBanner, FeatureItem } from '../../data/homeSections';
import { CategoryGridEditor } from './CategoryGridEditor';

/**
 * Content editor for the two home-page sections that are not driven by the
 * catalogue: the "Seasonal offers" promo grid and the benefits strip.
 *
 * Reached from Home Layout → Edit Content, which passes ?tab=promo|features.
 */
export default function AdminHomeSections() {
  const {
    promoBanners, setPromoBanners, features, setFeatures,
    categoryGrid, setCategoryGrid, products, categories,
  } = useAdmin();
  const { tr } = useLang();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab = requested === 'features' || requested === 'categories' ? requested : 'promo';

  const setTab = (next: 'promo' | 'features' | 'categories') => setParams({ tab: next }, { replace: true });

  return (
    <div className="max-w-5xl mx-auto my-6 flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Home Section Content</h2>
          <p className="text-sm text-gray-500 mt-1">
            Edit the promo banners, the category grid and the store benefits strip. Everything saves automatically.
          </p>
        </div>
        <div className="flex gap-2 px-6 sm:px-8 py-4 flex-wrap">
          {([
            ['promo', 'Promo Banners Grid', ImageIcon],
            ['categories', 'Category Grid', LayoutGrid],
            ['features', 'Store Features', Sparkles],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                tab === key
                  ? 'bg-[#00a651] text-white border-[#00a651]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'promo' && <PromoEditor value={promoBanners} onChange={setPromoBanners} products={products} tr={tr} />}
      {tab === 'categories' && (
        <CategoryGridEditor value={categoryGrid} onChange={setCategoryGrid} categories={categories ?? []} tr={tr} />
      )}
      {tab === 'features' && <FeaturesEditor value={features} onChange={setFeatures} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

function Card({ title, subtitle, children, actions }: {
  title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="px-6 sm:px-8 py-6 flex flex-col gap-6">{children}</div>
    </div>
  );
}

const AddButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-semibold"
  >
    <Plus className="w-4 h-4" /> {children}
  </button>
);

/** Up / down / delete controls shared by both list editors. */
function RowControls({ index, total, onMove, onRemove }: {
  index: number; total: number; onMove: (from: number, to: number) => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-7 h-7 rounded-md bg-[#00a651] text-white text-[12px] font-bold flex items-center justify-center me-1">
        {index + 1}
      </span>
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0}
        aria-label="Move up"
        className="p-1.5 text-gray-400 hover:text-[#00a651] disabled:opacity-30 rounded">
        <ArrowUp className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === total - 1}
        aria-label="Move down"
        className="p-1.5 text-gray-400 hover:text-[#00a651] disabled:opacity-30 rounded">
        <ArrowDown className="w-4 h-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label="Delete"
        className="p-1.5 text-gray-400 hover:text-red-600 rounded">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const newId = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

/* ------------------------------------------------------------------ */
/* Promo banners                                                       */
/* ------------------------------------------------------------------ */

function PromoEditor({ value, onChange, products, tr }: {
  value: any; onChange: (fn: (prev: any) => any) => void; products: any[]; tr: (v: any) => string;
}) {
  const set = (patch: any) => onChange((prev: any) => ({ ...prev, ...patch }));

  const editBanners = (key: 'topBanners' | 'bottomBanners', fn: (list: PromoBanner[]) => PromoBanner[]) =>
    onChange((prev: any) => ({ ...prev, [key]: fn(prev[key] ?? []) }));

  const blank = (): PromoBanner => ({
    id: newId('pb'), brand: { en: '', ar: '' }, title: { en: 'New banner', ar: '' },
    titleSub: { en: '', ar: '' }, description: { en: '', ar: '' }, image: '',
    bg: '#f8f9fa', accent: '#00a651', link: '/search',
    buttonText: { en: 'Shop now', ar: 'تسوق الآن' },
  });

  return (
    <>
      <Card title="Section heading" subtitle="The divider headline above the grid.">
        <div className="grid md:grid-cols-2 gap-5">
          <BilingualField label="Highlighted words (green)" value={value?.headingAccent} onChange={(v) => set({ headingAccent: v })} />
          <BilingualField label="Rest of the heading" value={value?.heading} onChange={(v) => set({ heading: v })} />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <BilingualField label="Link text" value={value?.linkText} onChange={(v) => set({ linkText: v })} hint="Leave both sides empty to hide the link." />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Link URL</span>
            <input
              value={value?.linkUrl ?? ''}
              onChange={(e) => set({ linkUrl: e.target.value })}
              placeholder="/search"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651]"
            />
          </label>
        </div>
      </Card>

      <BannerList
        title="Left column banner" subtitle="Rotates through these slides. Shown top-left in the grid."
        list={value?.topBanners ?? []} variant="top"
        onAdd={() => editBanners('topBanners', (l) => [...l, blank()])}
        onMove={(f, t) => editBanners('topBanners', (l) => move(l, f, t))}
        onRemove={(i) => editBanners('topBanners', (l) => l.filter((_, x) => x !== i))}
        onPatch={(i, patch) => editBanners('topBanners', (l) => l.map((b, x) => (x === i ? { ...b, ...patch } : b)))}
      />

      <BannerList
        title="Right column banner" subtitle="Rotates through these slides. Shown bottom-right in the grid."
        list={value?.bottomBanners ?? []} variant="bottom"
        onAdd={() => editBanners('bottomBanners', (l) => [...l, blank()])}
        onMove={(f, t) => editBanners('bottomBanners', (l) => move(l, f, t))}
        onRemove={(i) => editBanners('bottomBanners', (l) => l.filter((_, x) => x !== i))}
        onPatch={(i, patch) => editBanners('bottomBanners', (l) => l.map((b, x) => (x === i ? { ...b, ...patch } : b)))}
      />

      <Card title="Products shown in the grid" subtitle="Pick from your catalogue. Prices, stock and discounts always come from the product itself — leave a list empty to fill it automatically.">
        <ProductPicker label="Centre spotlight carousel" max={6} products={products} tr={tr}
          ids={value?.spotlightIds ?? []} onChange={(ids) => set({ spotlightIds: ids })} />
        <ProductPicker label="Left column list" max={2} products={products} tr={tr}
          ids={value?.leftListIds ?? []} onChange={(ids) => set({ leftListIds: ids })} />
        <ProductPicker label="Right column list" max={2} products={products} tr={tr}
          ids={value?.rightListIds ?? []} onChange={(ids) => set({ rightListIds: ids })} />
      </Card>
    </>
  );
}

function BannerList({ title, subtitle, list, variant, onAdd, onMove, onRemove, onPatch }: {
  title: string; subtitle: string; list: PromoBanner[]; variant: 'top' | 'bottom';
  onAdd: () => void; onMove: (f: number, t: number) => void;
  onRemove: (i: number) => void; onPatch: (i: number, patch: Partial<PromoBanner>) => void;
}) {
  return (
    <Card title={title} subtitle={subtitle} actions={<AddButton onClick={onAdd}>Add slide</AddButton>}>
      {list.length === 0 && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center">
          No slides yet — this banner will be hidden on the storefront.
        </p>
      )}

      {list.map((banner, i) => (
        <div key={banner.id ?? i} className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">Slide {i + 1} of {list.length}</span>
            <RowControls index={i} total={list.length} onMove={onMove} onRemove={() => onRemove(i)} />
          </div>

          <ImageUpload
            label="Product image"
            value={banner.image}
            onChange={(url) => onPatch(i, { image: url })}
            hint="A transparent PNG sits best on the coloured card."
          />

          <div className="grid md:grid-cols-2 gap-5">
            <BilingualField label="Brand / eyebrow" value={banner.brand} onChange={(v) => onPatch(i, { brand: v })} />
            <BilingualField label="Title" value={banner.title} onChange={(v) => onPatch(i, { title: v })} />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <BilingualField label="Title second line" value={banner.titleSub} onChange={(v) => onPatch(i, { titleSub: v })} />
            <BilingualField label="Button text" value={banner.buttonText} onChange={(v) => onPatch(i, { buttonText: v })} />
          </div>
          <BilingualField
            label="Description" multiline rows={3}
            value={banner.description}
            onChange={(v) => onPatch(i, { description: v })}
            hint="Line breaks are preserved."
          />

          <div className="grid sm:grid-cols-3 gap-5">
            <ColorField label="Card background" value={banner.bg} onChange={(v) => onPatch(i, { bg: v })} />
            <ColorField
              label={variant === 'top' ? 'Accent circle' : 'Button colour'}
              value={banner.accent}
              onChange={(v) => onPatch(i, { accent: v })}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-700">Links to</span>
              <input
                value={banner.link ?? ''}
                onChange={(e) => onPatch(i, { link: e.target.value })}
                placeholder="/category/1"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651]"
              />
            </label>
          </div>
        </div>
      ))}
    </Card>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const safe = /^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#f8f9fa';
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color" value={safe} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0 bg-white"
        />
        <input
          value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#00a651]"
        />
      </div>
    </label>
  );
}

function ProductPicker({ label, ids, onChange, products, max, tr }: {
  label: string; ids: string[]; onChange: (ids: string[]) => void;
  products: any[]; max: number; tr: (v: any) => string;
}) {
  const [query, setQuery] = useState('');
  const chosen = ids.map((id) => products.find((p: any) => String(p.id) === String(id))).filter(Boolean);

  const matches = query.trim()
    ? products
        .filter((p: any) => !ids.some((id) => String(id) === String(p.id)))
        .filter((p: any) => `${tr(p.title)} ${p.code ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-[12px] text-gray-400">{chosen.length} of {max} chosen</span>
      </div>

      {chosen.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chosen.map((p: any, i: number) => (
            <span key={p.id} className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl ps-2 pe-1 py-1 text-[13px] max-w-full">
              <span className="w-5 h-5 rounded bg-[#00a651] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="truncate max-w-[220px]">{tr(p.title)}</span>
              <button type="button" onClick={() => onChange(ids.filter((id) => String(id) !== String(p.id)))}
                aria-label="Remove" className="p-1 text-gray-400 hover:text-red-600 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {chosen.length < max ? (
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your catalogue to add a product…"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651]"
          />
          {matches.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {matches.map((p: any) => (
                <button
                  key={p.id} type="button"
                  onClick={() => { onChange([...ids, String(p.id)]); setQuery(''); }}
                  className="w-full text-start px-3.5 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  {p.image && <img src={p.image} alt="" className="w-8 h-8 object-contain shrink-0" />}
                  <span className="truncate">{tr(p.title)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-[12px] text-gray-400">Remove one to add another.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Features strip                                                      */
/* ------------------------------------------------------------------ */

function FeaturesEditor({ value, onChange }: { value: any; onChange: (fn: (prev: any) => any) => void }) {
  const items: FeatureItem[] = value?.items ?? [];
  const edit = (fn: (list: FeatureItem[]) => FeatureItem[]) =>
    onChange((prev: any) => ({ ...prev, items: fn(prev.items ?? []) }));

  return (
    <Card
      title="Store features"
      subtitle="The benefits strip on the home page. Shown four across on desktop."
      actions={
        <AddButton onClick={() => edit((l) => [...l, {
          id: newId('f'), icon: 'Sparkles',
          title: { en: 'New benefit', ar: '' }, text: { en: '', ar: '' },
        }])}>Add feature</AddButton>
      }
    >
      {items.length === 0 && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center">
          No features yet — this section will be hidden on the storefront.
        </p>
      )}

      {items.map((item, i) => {
        const Icon = (Icons as any)[item.icon] ?? Icons.Sparkles;
        return (
          <div key={item.id ?? i} className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#00a651]">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-semibold text-gray-800 text-sm">Feature {i + 1}</span>
              </div>
              <RowControls
                index={i} total={items.length}
                onMove={(f, t) => edit((l) => move(l, f, t))}
                onRemove={() => edit((l) => l.filter((_, x) => x !== i))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Icon</span>
              <div className="flex flex-wrap gap-2">
                {FEATURE_ICONS.map((name) => {
                  const Option = (Icons as any)[name];
                  return (
                    <button
                      key={name} type="button"
                      onClick={() => edit((l) => l.map((f, x) => (x === i ? { ...f, icon: name } : f)))}
                      title={name}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                        item.icon === name
                          ? 'border-[#00a651] bg-[#00a651]/10 text-[#00a651]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <Option className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <BilingualField label="Title" value={item.title}
              onChange={(v) => edit((l) => l.map((f, x) => (x === i ? { ...f, title: v } : f)))} />
            <BilingualField label="Description" multiline rows={2} value={item.text}
              onChange={(v) => edit((l) => l.map((f, x) => (x === i ? { ...f, text: v } : f)))} />
          </div>
        );
      })}
    </Card>
  );
}
