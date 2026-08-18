import React from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import { BilingualField } from '../../components/admin/BilingualField';
import { defaultCategoryGrid, CategoryGrid } from '../../data/homeSections';

/**
 * Everything about the home page's category grid: how many columns at each
 * size, the card shape and colours, how the picture sits inside it, what the
 * caption says, and which categories appear in which order.
 */
export function CategoryGridEditor({ value, onChange, categories, tr }: {
  value: CategoryGrid;
  onChange: (fn: (prev: CategoryGrid) => CategoryGrid) => void;
  categories: any[];
  tr: (v: any) => string;
}) {
  const cfg = { ...defaultCategoryGrid, ...(value ?? {}) };
  const set = (patch: Partial<CategoryGrid>) => onChange((prev) => ({ ...prev, ...patch }));

  const chosen = cfg.source === 'selected'
    ? cfg.categoryIds.map((id) => categories.find((c) => String(c.id) === String(id))).filter(Boolean)
    : categories;
  const unchosen = categories.filter((c) => !cfg.categoryIds.some((id) => String(id) === String(c.id)));

  const moveCategory = (from: number, to: number) => {
    if (to < 0 || to >= cfg.categoryIds.length) return;
    const next = [...cfg.categoryIds];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    set({ categoryIds: next });
  };

  return (
    <>
      <Card title="Layout" subtitle="How many cards sit side by side, and how much space is between them.">
        <div className="grid sm:grid-cols-3 gap-5">
          <NumberField label="Columns on phones" value={cfg.columnsMobile} min={1} max={4} onChange={(v) => set({ columnsMobile: v })} />
          <NumberField label="Columns on tablets" value={cfg.columnsTablet} min={1} max={6} onChange={(v) => set({ columnsTablet: v })} />
          <NumberField label="Columns on desktop" value={cfg.columnsDesktop} min={2} max={8} onChange={(v) => set({ columnsDesktop: v })} />
        </div>
        <SliderField label="Gap between cards" value={cfg.gap} min={0} max={48} suffix="px" onChange={(v) => set({ gap: v })} />
      </Card>

      <Card title="Card shape and colour">
        <Choice
          label="Card shape"
          value={cfg.cardShape}
          options={[
            ['landscape', 'Landscape 4:3'], ['square', 'Square'],
            ['portrait', 'Portrait 3:4'], ['fixed', 'Fixed height'],
          ]}
          onChange={(v) => set({ cardShape: v as CategoryGrid['cardShape'] })}
        />
        {cfg.cardShape === 'fixed' && (
          <SliderField label="Card height" value={cfg.cardHeight} min={140} max={420} suffix="px" onChange={(v) => set({ cardHeight: v })} />
        )}
        <div className="grid sm:grid-cols-3 gap-5">
          <ColorField label="Card background" value={cfg.cardBg} onChange={(v) => set({ cardBg: v })} />
          <ColorField label="Background on hover" value={cfg.cardHoverBg} onChange={(v) => set({ cardHoverBg: v })} />
          <ColorField label="Caption colour" value={cfg.textColor} onChange={(v) => set({ textColor: v })} />
        </div>
        <SliderField label="Corner rounding" value={cfg.cardRadius} min={0} max={40} suffix="px" onChange={(v) => set({ cardRadius: v })} />
        <Toggle label="Show a card border" checked={cfg.showBorder} onChange={(v) => set({ showBorder: v })} />
      </Card>

      <Card title="Picture">
        <Choice
          label="How the picture fills the card"
          value={cfg.imageFit}
          options={[['contain', 'Show the whole picture'], ['cover', 'Fill the card edge to edge']]}
          onChange={(v) => set({ imageFit: v as CategoryGrid['imageFit'] })}
        />
        {cfg.imageFit === 'contain' && (
          <>
            <SliderField label="Picture size" value={cfg.imageScale} min={30} max={100} suffix="%" onChange={(v) => set({ imageScale: v })} />
            <Toggle
              label="Blend white backgrounds into the card"
              hint="Suits cut-out product shots on a white background. Turn it off for photos."
              checked={cfg.blendImage}
              onChange={(v) => set({ blendImage: v })}
            />
          </>
        )}
        <Choice
          label="Hover effect"
          value={cfg.hoverEffect}
          options={[['zoom', 'Zoom the picture'], ['lift', 'Lift the card'], ['none', 'None']]}
          onChange={(v) => set({ hoverEffect: v as CategoryGrid['hoverEffect'] })}
        />
      </Card>

      <Card title="Caption">
        <Choice
          label="Caption position"
          value={cfg.labelPosition}
          options={[['below', 'Below the picture'], ['overlay', 'Over the picture']]}
          onChange={(v) => set({ labelPosition: v as CategoryGrid['labelPosition'] })}
        />
        <SliderField label="Caption size" value={cfg.labelSize} min={11} max={28} suffix="px" onChange={(v) => set({ labelSize: v })} />
        <Toggle label="Show the number of products" checked={cfg.showCount} onChange={(v) => set({ showCount: v })} />
      </Card>

      <Card title="Section heading" subtitle="Off by default — the grid usually reads fine without one.">
        <Toggle label="Show a heading above the grid" checked={cfg.showHeading} onChange={(v) => set({ showHeading: v })} />
        {cfg.showHeading && (
          <div className="grid md:grid-cols-2 gap-5">
            <BilingualField label="Highlighted words (green)" value={cfg.headingAccent} onChange={(v) => set({ headingAccent: v })} />
            <BilingualField label="Rest of the heading" value={cfg.heading} onChange={(v) => set({ heading: v })} />
          </div>
        )}
      </Card>

      <Card
        title="Which categories to show"
        subtitle="Categories themselves are added and named under Catalog → Categories."
      >
        <Choice
          label="Source"
          value={cfg.source}
          options={[['all', 'Every category'], ['selected', 'Only the ones I pick']]}
          onChange={(v) => set({ source: v as CategoryGrid['source'] })}
        />

        {cfg.source === 'all' ? (
          <>
            <NumberField
              label="Maximum to show (0 for no limit)"
              value={cfg.limit} min={0} max={40}
              onChange={(v) => set({ limit: v })}
            />
            <p className="text-[12px] text-gray-500">
              Showing {cfg.limit > 0 ? Math.min(cfg.limit, categories.length) : categories.length} of {categories.length} categories,
              in the order set under Catalog → Categories.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {chosen.length === 0 && (
              <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-4 py-5 text-center">
                Nothing picked yet — the grid will be hidden on the storefront.
              </p>
            )}
            {chosen.map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="w-6 h-6 rounded bg-[#00a651] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {c.image && <img src={c.image} alt="" className="w-8 h-8 object-contain shrink-0" />}
                <span className="flex-1 min-w-0 truncate text-sm">{tr({ en: c.name, ar: c.nameAr })}</span>
                <button type="button" onClick={() => moveCategory(i, i - 1)} disabled={i === 0}
                  className="px-2 text-gray-400 hover:text-[#00a651] disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" onClick={() => moveCategory(i, i + 1)} disabled={i === chosen.length - 1}
                  className="px-2 text-gray-400 hover:text-[#00a651] disabled:opacity-30" aria-label="Move down">↓</button>
                <button
                  type="button"
                  onClick={() => set({ categoryIds: cfg.categoryIds.filter((id) => String(id) !== String(c.id)) })}
                  className="p-1 text-gray-400 hover:text-red-600" aria-label="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {unchosen.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {unchosen.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set({ categoryIds: [...cfg.categoryIds, String(c.id)] })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-[13px] text-gray-600 hover:border-[#00a651] hover:text-[#00a651]"
                  >
                    <Plus className="w-3.5 h-3.5" /> {tr({ en: c.name, ar: c.nameAr })}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="Preview" subtitle="Roughly how the grid will look. Colours, shape and caption are live.">
        <div
          className="grid"
          style={{ gap: Math.round(cfg.gap * 0.6), gridTemplateColumns: `repeat(${cfg.columnsDesktop}, minmax(0, 1fr))` }}
        >
          {(chosen.length ? chosen : categories).slice(0, cfg.columnsDesktop * 2).map((c: any) => (
            <div
              key={c.id}
              className="relative flex flex-col overflow-hidden"
              style={{
                aspectRatio: cfg.cardShape === 'square' ? '1 / 1'
                  : cfg.cardShape === 'portrait' ? '3 / 4'
                  : cfg.cardShape === 'fixed' ? undefined : '4 / 3',
                height: cfg.cardShape === 'fixed' ? Math.round(cfg.cardHeight * 0.6) : undefined,
                borderRadius: Math.round(cfg.cardRadius * 0.75),
                backgroundColor: cfg.cardBg,
                border: cfg.showBorder ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
              }}
            >
              <div
                className={`min-h-0 flex items-center justify-center ${cfg.labelPosition === 'overlay' ? 'absolute inset-0' : 'flex-1'}`}
                style={cfg.labelPosition === 'overlay' ? undefined : { padding: cfg.imageFit === 'cover' ? 0 : '8%' }}
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt=""
                    className={cfg.blendImage && cfg.imageFit === 'contain' ? 'mix-blend-multiply' : ''}
                    style={cfg.imageFit === 'cover'
                      ? { width: '100%', height: '100%', objectFit: 'cover' }
                      : { maxWidth: `${cfg.imageScale}%`, maxHeight: `${cfg.imageScale}%`, objectFit: 'contain' }}
                  />
                )}
              </div>
              {cfg.labelPosition === 'overlay' ? (
                <div className="relative mt-auto w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="block text-white font-semibold leading-tight truncate" style={{ fontSize: Math.max(10, cfg.labelSize * 0.7) }}>
                    {tr({ en: c.name, ar: c.nameAr })}
                  </span>
                </div>
              ) : (
                <div className="shrink-0 px-2 pb-2 text-center">
                  <span className="block font-medium leading-tight truncate" style={{ fontSize: Math.max(10, cfg.labelSize * 0.7), color: cfg.textColor }}>
                    {tr({ en: c.name, ar: c.nameAr })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 sm:px-8 py-6 flex flex-col gap-6">{children}</div>
    </div>
  );
}

const inputClass = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651]';

function NumberField({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className={inputClass}
      />
    </label>
  );
}

function SliderField({ label, value, min, max, suffix, onChange }: {
  label: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700 flex justify-between">
        {label} <span className="text-[#00a651]">{value}{suffix}</span>
      </span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#00a651]"
      />
    </label>
  );
}

function Choice({ label, value, options, onChange }: {
  label: string; value: string; options: [string, string][]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              value === key
                ? 'bg-[#00a651] text-white border-[#00a651]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#00a651] shrink-0"
      />
      <span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {hint && <span className="block text-[12px] text-gray-500 mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const safe = /^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#f4f5f6';
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={safe} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0 bg-white" />
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#00a651]" />
      </div>
    </label>
  );
}
