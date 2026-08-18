import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Palette, Image as ImageIcon, Type, Layers, ShoppingCart, Truck, CreditCard,
  ShieldCheck, FileText, MessageSquare, Grid3x3, Plus, X, RotateCcw, ExternalLink, GripVertical,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Small form primitives                                               */
/* ------------------------------------------------------------------ */

const Field = ({ label, hint, children }: any) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[13px] font-semibold text-gray-700">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
  </label>
);

const Text = ({ value, onChange, ...rest }: any) => (
  <input
    type="text"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a651]"
    {...rest}
  />
);

const Num = ({ value, onChange, ...rest }: any) => (
  <input
    type="number"
    value={value ?? 0}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a651]"
    {...rest}
  />
);

const Area = ({ value, onChange, rows = 3 }: any) => (
  <textarea
    rows={rows}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a651] resize-y"
  />
);

const Color = ({ value, onChange }: any) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-9 border border-gray-300 rounded cursor-pointer p-0.5"
    />
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
    />
  </div>
);

const Toggle = ({ label, checked, onChange, hint }: any) => (
  <label className="flex items-start gap-3 cursor-pointer py-1.5 group">
    <span className="relative inline-flex shrink-0 mt-0.5">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <span className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-[#00a651] transition-colors" />
      <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
    </span>
    <span className="min-w-0">
      <span className="text-[13px] font-medium text-gray-800 group-hover:text-gray-900 block">{label}</span>
      {hint && <span className="text-[11px] text-gray-400 block">{hint}</span>}
    </span>
  </label>
);

const Card = ({ title, description, children, cols = 2 }: any) => (
  <section className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
    <div className="mb-4">
      <h3 className="font-bold text-gray-900">{title}</h3>
      {description && <p className="text-[12px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <div className={`grid gap-4 ${cols === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>{children}</div>
  </section>
);

/** Editable string list (chips + add field). */
const StringList = ({ items, onChange, placeholder }: any) => {
  const [draft, setDraft] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {(items || []).map((it: string, i: number) => (
          <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full pl-3 pr-1.5 py-1 text-[12px] text-gray-700">
            {it}
            <button
              onClick={() => onChange(items.filter((_: any, x: number) => x !== i))}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {(items || []).length === 0 && <span className="text-[12px] text-gray-400">No entries yet.</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              onChange([...(items || []), draft.trim()]);
              setDraft('');
            }
          }}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#00a651]"
        />
        <button
          onClick={() => { if (draft.trim()) { onChange([...(items || []), draft.trim()]); setDraft(''); } }}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'theme', name: 'Theme', icon: Palette },
  { id: 'gallery', name: 'Gallery', icon: ImageIcon },
  { id: 'title', name: 'Title & Code', icon: Type },
  { id: 'options', name: 'Options', icon: Layers },
  { id: 'buybox', name: 'Buy Box', icon: ShoppingCart },
  { id: 'delivery', name: 'Delivery', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'warranty', name: 'Warranty', icon: ShieldCheck },
  { id: 'content', name: 'Content', icon: FileText },
  { id: 'reviews', name: 'Reviews', icon: MessageSquare },
  { id: 'related', name: 'Related & Banners', icon: Grid3x3 },
];

export default function AdminProductPageSettings() {
  const { productPageConfig: cfg, setProductPageConfig, resetProductPageConfig, products } = useAdmin();
  const [tab, setTab] = useState('theme');

  /** Patch one top-level section of the config. */
  const set = (section: string, patch: any) =>
    setProductPageConfig((prev: any) => ({ ...prev, [section]: { ...prev[section], ...patch } }));

  const previewId = products[0]?.id;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Page Settings</h1>
          <p className="text-gray-500 text-sm">
            Every label, toggle, colour and list shown on the storefront product page.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/product/${previewId}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#0058a3] hover:underline flex items-center gap-1.5"
          >
            Preview <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => { if (confirm('Reset ALL product page settings to defaults?')) resetProductPageConfig(); }}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-[#00a651] text-[#00a651]' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.name}
            </button>
          );
        })}
      </div>

      {/* ---------------- Theme ---------------- */}
      {tab === 'theme' && (
        <>
          <Card title="Colours" description="Used across buttons, badges, links and stars.">
            <Field label="Primary (buttons, active states)"><Color value={cfg.theme.primary} onChange={(v: string) => set('theme', { primary: v })} /></Field>
            <Field label="Primary hover"><Color value={cfg.theme.primaryHover} onChange={(v: string) => set('theme', { primaryHover: v })} /></Field>
            <Field label="Discount badge"><Color value={cfg.theme.danger} onChange={(v: string) => set('theme', { danger: v })} /></Field>
            <Field label="Links"><Color value={cfg.theme.link} onChange={(v: string) => set('theme', { link: v })} /></Field>
            <Field label="Rating stars"><Color value={cfg.theme.star} onChange={(v: string) => set('theme', { star: v })} /></Field>
          </Card>

          <Card title="Breadcrumbs" cols={1}>
            <Toggle label="Show breadcrumbs" checked={cfg.breadcrumbs.enabled} onChange={(v: boolean) => set('breadcrumbs', { enabled: v })} />
            <Toggle label="Include the Home link" checked={cfg.breadcrumbs.showHome} onChange={(v: boolean) => set('breadcrumbs', { showHome: v })} />
            <Field label="Home label"><Text value={cfg.breadcrumbs.homeLabel} onChange={(v: string) => set('breadcrumbs', { homeLabel: v })} /></Field>
          </Card>
        </>
      )}

      {/* ---------------- Gallery ---------------- */}
      {tab === 'gallery' && (
        <Card title="Product gallery" cols={1}>
          <Toggle label="Show discount badge" hint="The -20% flag over the main image" checked={cfg.gallery.showDiscountBadge} onChange={(v: boolean) => set('gallery', { showDiscountBadge: v })} />
          <Toggle label="Show status labels" hint="New / Bestseller / Most popular" checked={cfg.gallery.showLabels} onChange={(v: boolean) => set('gallery', { showLabels: v })} />
          <Toggle label="Enable full-screen lightbox" checked={cfg.gallery.enableLightbox} onChange={(v: boolean) => set('gallery', { enableLightbox: v })} />
          <div className="max-w-[220px]">
            <Field label="Thumbnails shown" hint="Extra images stay reachable in the lightbox.">
              <Num value={cfg.gallery.thumbCount} min={1} max={12} onChange={(v: number) => set('gallery', { thumbCount: v })} />
            </Field>
          </div>
        </Card>
      )}

      {/* ---------------- Title ---------------- */}
      {tab === 'title' && (
        <Card title="Title, rating & product code" cols={1}>
          <div className="grid md:grid-cols-2 gap-x-8">
            <div>
              <Toggle label="Show star rating" checked={cfg.titleBlock.showRating} onChange={(v: boolean) => set('titleBlock', { showRating: v })} />
              <Toggle label="Show review count link" checked={cfg.titleBlock.showReviewCount} onChange={(v: boolean) => set('titleBlock', { showReviewCount: v })} />
              <Toggle label="Show “write a review” link" checked={cfg.titleBlock.showWriteReview} onChange={(v: boolean) => set('titleBlock', { showWriteReview: v })} />
            </div>
            <div>
              <Toggle label="Show product code" checked={cfg.titleBlock.showCode} onChange={(v: boolean) => set('titleBlock', { showCode: v })} />
              <Toggle label="Show copy-to-clipboard button" checked={cfg.titleBlock.showCopyCode} onChange={(v: boolean) => set('titleBlock', { showCopyCode: v })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <Field label="Write-a-review link text"><Text value={cfg.titleBlock.writeReviewLabel} onChange={(v: string) => set('titleBlock', { writeReviewLabel: v })} /></Field>
            <Field label="Code label"><Text value={cfg.titleBlock.codeLabel} onChange={(v: string) => set('titleBlock', { codeLabel: v })} /></Field>
          </div>
        </Card>
      )}

      {/* ---------------- Options ---------------- */}
      {tab === 'options' && (
        <>
          <Card title="Variant selectors" description="Colour swatches and size buttons. Values come from each product.">
            <div className="md:col-span-2">
              <Toggle label="Enable variant selectors" checked={cfg.variants.enabled} onChange={(v: boolean) => set('variants', { enabled: v })} />
              <Toggle label="Show the selected option name next to the label" checked={cfg.variants.showSelectedName} onChange={(v: boolean) => set('variants', { showSelectedName: v })} />
            </div>
            <Field label="Colour label"><Text value={cfg.variants.colorLabel} onChange={(v: string) => set('variants', { colorLabel: v })} /></Field>
            <Field label="Size label" hint="A product can override this with its own sizeLabel."><Text value={cfg.variants.sizeLabel} onChange={(v: string) => set('variants', { sizeLabel: v })} /></Field>
          </Card>

          <Card title="Guarantee dropdown" cols={1}>
            <Toggle label="Show the guarantee selector" checked={cfg.guarantee.enabled} onChange={(v: boolean) => set('guarantee', { enabled: v })} />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Label"><Text value={cfg.guarantee.label} onChange={(v: string) => set('guarantee', { label: v })} /></Field>
              <Field label="Default selection">
                <select
                  value={cfg.guarantee.defaultValue}
                  onChange={(e) => set('guarantee', { defaultValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {cfg.guarantee.options.map((o: string) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Available periods">
              <StringList items={cfg.guarantee.options} onChange={(v: string[]) => set('guarantee', { options: v })} placeholder="e.g. 12 months" />
            </Field>
          </Card>

          <Card title="Extended service plan" description="The paid protection plan radio list. Prices are added to the product price." cols={1}>
            <Toggle label="Show the service plan block" checked={cfg.servicePlan.enabled} onChange={(v: boolean) => set('servicePlan', { enabled: v })} />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Block title"><Text value={cfg.servicePlan.title} onChange={(v: string) => set('servicePlan', { title: v })} /></Field>
              <Field label="Tooltip text" hint="Shown on the ⓘ icon."><Text value={cfg.servicePlan.tooltip} onChange={(v: string) => set('servicePlan', { tooltip: v })} /></Field>
            </div>
            <Field label="Footnote"><Area value={cfg.servicePlan.note} onChange={(v: string) => set('servicePlan', { note: v })} rows={2} /></Field>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-gray-700">Plan options</span>
              {cfg.servicePlan.options.map((o: any, i: number) => (
                <div key={o.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <input
                    value={o.label}
                    onChange={(e) => {
                      const options = [...cfg.servicePlan.options];
                      options[i] = { ...o, label: e.target.value };
                      set('servicePlan', { options });
                    }}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                    placeholder="Label"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[12px] text-gray-500">+</span>
                    <input
                      type="number"
                      value={o.price}
                      onChange={(e) => {
                        const options = [...cfg.servicePlan.options];
                        options[i] = { ...o, price: Number(e.target.value) };
                        set('servicePlan', { options });
                      }}
                      className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => set('servicePlan', { options: cfg.servicePlan.options.filter((_: any, x: number) => x !== i) })}
                    className="p-1 text-red-400 hover:text-red-600 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => set('servicePlan', { options: [...cfg.servicePlan.options, { id: `opt_${Date.now()}`, label: 'New plan', price: 0 }] })}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add plan option
              </button>
            </div>
          </Card>
        </>
      )}

      {/* ---------------- Buy box ---------------- */}
      {tab === 'buybox' && (
        <>
          <Card title="Brand & price" cols={1}>
            <Toggle label="Show the brand logo in the sidebar" checked={cfg.brand.showLogo} onChange={(v: boolean) => set('brand', { showLogo: v, enabled: v }) } />
            <div className="grid md:grid-cols-2 gap-x-8">
              <div>
                <Toggle label="Show old (crossed-out) price" checked={cfg.priceBox.showOldPrice} onChange={(v: boolean) => set('priceBox', { showOldPrice: v })} />
                <Toggle label="Show discount percentage badge" checked={cfg.priceBox.showDiscountBadge} onChange={(v: boolean) => set('priceBox', { showDiscountBadge: v })} />
              </div>
              <div>
                <Toggle label="Show stock status" checked={cfg.priceBox.showStockStatus} onChange={(v: boolean) => set('priceBox', { showStockStatus: v })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <Field label="In-stock text"><Text value={cfg.priceBox.inStockLabel} onChange={(v: string) => set('priceBox', { inStockLabel: v })} /></Field>
              <Field label="Out-of-stock text"><Text value={cfg.priceBox.outOfStockLabel} onChange={(v: string) => set('priceBox', { outOfStockLabel: v })} /></Field>
            </div>
          </Card>

          <Card title="Promotion box & countdown" description="The highlighted campaign banner above the buy buttons." cols={1}>
            <Toggle label="Show the promotion box" checked={cfg.promo.enabled} onChange={(v: boolean) => set('promo', { enabled: v })} />
            <Toggle label="Show the countdown" hint="The box hides itself automatically once the timer expires." checked={cfg.promo.showCountdown} onChange={(v: boolean) => set('promo', { showCountdown: v })} />
            <Field label="Headline"><Area value={cfg.promo.title} onChange={(v: string) => set('promo', { title: v })} rows={2} /></Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Countdown caption"><Text value={cfg.promo.subtitle} onChange={(v: string) => set('promo', { subtitle: v })} /></Field>
              <Field label="Ends at" hint="Local time.">
                <input
                  type="datetime-local"
                  value={(cfg.promo.endDate || '').slice(0, 16)}
                  onChange={(e) => set('promo', { endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Link text"><Text value={cfg.promo.linkText} onChange={(v: string) => set('promo', { linkText: v })} /></Field>
              <Field label="Link URL"><Text value={cfg.promo.linkUrl} onChange={(v: string) => set('promo', { linkUrl: v })} /></Field>
              <Field label="Gradient start"><Color value={cfg.promo.gradientFrom} onChange={(v: string) => set('promo', { gradientFrom: v })} /></Field>
              <Field label="Gradient end"><Color value={cfg.promo.gradientTo} onChange={(v: string) => set('promo', { gradientTo: v })} /></Field>
              <Field label="Text colour"><Color value={cfg.promo.textColor} onChange={(v: string) => set('promo', { textColor: v })} /></Field>
            </div>
          </Card>

          <Card title="Buy buttons" cols={1}>
            <div className="grid md:grid-cols-2 gap-x-8">
              <div>
                <Toggle label="Show quantity selector" checked={cfg.buyBox.showQuantity} onChange={(v: boolean) => set('buyBox', { showQuantity: v })} />
                <Toggle label="Show “buy in 1 click” button" checked={cfg.buyBox.showOneClick} onChange={(v: boolean) => set('buyBox', { showOneClick: v })} />
                <Toggle label="Show sticky bar on scroll" checked={cfg.buyBox.stickyBarEnabled} onChange={(v: boolean) => set('buyBox', { stickyBarEnabled: v })} />
              </div>
              <div>
                <Toggle label="Show wish list button" checked={cfg.buyBox.showWishlist} onChange={(v: boolean) => set('buyBox', { showWishlist: v })} />
                <Toggle label="Show compare button" checked={cfg.buyBox.showCompare} onChange={(v: boolean) => set('buyBox', { showCompare: v })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <Field label="Add-to-cart text"><Text value={cfg.buyBox.addToCartLabel} onChange={(v: string) => set('buyBox', { addToCartLabel: v })} /></Field>
              <Field label="Added confirmation text"><Text value={cfg.buyBox.addedLabel} onChange={(v: string) => set('buyBox', { addedLabel: v })} /></Field>
              <Field label="1-click button text"><Text value={cfg.buyBox.oneClickLabel} onChange={(v: string) => set('buyBox', { oneClickLabel: v })} /></Field>
              <Field label="Wish list text"><Text value={cfg.buyBox.wishlistLabel} onChange={(v: string) => set('buyBox', { wishlistLabel: v })} /></Field>
              <Field label="Compare text"><Text value={cfg.buyBox.compareLabel} onChange={(v: string) => set('buyBox', { compareLabel: v })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Min quantity"><Num value={cfg.buyBox.minQty} min={1} onChange={(v: number) => set('buyBox', { minQty: v })} /></Field>
                <Field label="Max quantity"><Num value={cfg.buyBox.maxQty} min={1} onChange={(v: number) => set('buyBox', { maxQty: v })} /></Field>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ---------------- Delivery ---------------- */}
      {tab === 'delivery' && (
        <Card title="Delivery methods" description="Shown in the sidebar. Drag order follows the list below." cols={1}>
          <Toggle label="Show the delivery block" checked={cfg.delivery.enabled} onChange={(v: boolean) => set('delivery', { enabled: v })} />
          <Toggle label="Start collapsed" checked={cfg.delivery.collapsedByDefault} onChange={(v: boolean) => set('delivery', { collapsedByDefault: v })} />
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Block title"><Text value={cfg.delivery.title} onChange={(v: string) => set('delivery', { title: v })} /></Field>
            <Field label="Footer link text"><Text value={cfg.delivery.detailsText} onChange={(v: string) => set('delivery', { detailsText: v })} /></Field>
            <Field label="Footer link URL"><Text value={cfg.delivery.detailsUrl} onChange={(v: string) => set('delivery', { detailsUrl: v })} /></Field>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {cfg.delivery.methods.map((m: any, i: number) => {
              const patch = (p: any) => {
                const methods = [...cfg.delivery.methods];
                methods[i] = { ...m, ...p };
                set('delivery', { methods });
              };
              return (
                <div key={m.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <Toggle label={m.name || 'Delivery method'} checked={m.enabled} onChange={(v: boolean) => patch({ enabled: v })} />
                    <button
                      onClick={() => set('delivery', { methods: cfg.delivery.methods.filter((_: any, x: number) => x !== i) })}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Name"><Text value={m.name} onChange={(v: string) => patch({ name: v })} /></Field>
                    <Field label="Tag" hint="Appended after a dash, e.g. “- Fast”"><Text value={m.tag} onChange={(v: string) => patch({ tag: v })} /></Field>
                    <Field label="Icon" hint="Emoji or an image URL"><Text value={m.icon} onChange={(v: string) => patch({ icon: v })} /></Field>
                    <Field label="Icon background"><Color value={m.iconBg} onChange={(v: string) => patch({ iconBg: v })} /></Field>
                    <Field label="Detail lines" hint="One line per row">
                      <Area value={(m.lines || []).join('\n')} onChange={(v: string) => patch({ lines: v.split('\n').filter(Boolean) })} rows={2} />
                    </Field>
                    <div className="flex flex-col gap-3">
                      <Field label="Price text"><Text value={m.price} onChange={(v: string) => patch({ price: v })} /></Field>
                      <Toggle label="Style as free (green)" checked={m.priceIsFree} onChange={(v: boolean) => patch({ priceIsFree: v })} />
                    </div>
                    <Field label="Extra link text"><Text value={m.linkText} onChange={(v: string) => patch({ linkText: v })} /></Field>
                    <Field label="Extra link URL"><Text value={m.linkUrl} onChange={(v: string) => patch({ linkUrl: v })} /></Field>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() =>
                set('delivery', {
                  methods: [...cfg.delivery.methods, {
                    id: `d_${Date.now()}`, enabled: true, icon: '📦', iconBg: '#eef2f7',
                    name: 'New method', tag: '', lines: ['Delivery details'], price: 'Free', priceIsFree: true,
                  }],
                })
              }
              className="w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add delivery method
            </button>
          </div>
        </Card>
      )}

      {/* ---------------- Payment ---------------- */}
      {tab === 'payment' && (
        <Card title="Payment options" cols={1}>
          <Toggle label="Show the payment block" checked={cfg.payment.enabled} onChange={(v: boolean) => set('payment', { enabled: v })} />
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Block title"><Text value={cfg.payment.title} onChange={(v: string) => set('payment', { title: v })} /></Field>
            <Field label="Link text"><Text value={cfg.payment.detailsText} onChange={(v: string) => set('payment', { detailsText: v })} /></Field>
            <Field label="Link URL"><Text value={cfg.payment.detailsUrl} onChange={(v: string) => set('payment', { detailsUrl: v })} /></Field>
          </div>
          <Field label="Note under the icons"><Area value={cfg.payment.note} onChange={(v: string) => set('payment', { note: v })} rows={2} /></Field>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[13px] font-semibold text-gray-700">Accepted methods</span>
            {cfg.payment.methods.map((m: any, i: number) => {
              const patch = (p: any) => {
                const methods = [...cfg.payment.methods];
                methods[i] = { ...m, ...p };
                set('payment', { methods });
              };
              return (
                <div key={m.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <input type="checkbox" checked={m.enabled} onChange={(e) => patch({ enabled: e.target.checked })} className="w-4 h-4 accent-[#00a651] shrink-0" />
                  <span className="w-12 h-7 bg-white border border-gray-200 rounded flex items-center justify-center shrink-0 p-1">
                    {m.image && <img src={m.image} alt="" className="max-h-full max-w-full object-contain" />}
                  </span>
                  <input value={m.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Label" className="w-36 border border-gray-300 rounded px-2 py-1.5 text-sm shrink-0" />
                  <input value={m.image} onChange={(e) => patch({ image: e.target.value })} placeholder="Logo URL" className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm min-w-0" />
                  <button onClick={() => set('payment', { methods: cfg.payment.methods.filter((_: any, x: number) => x !== i) })} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => set('payment', { methods: [...cfg.payment.methods, { id: `p_${Date.now()}`, enabled: true, label: 'New method', image: '' }] })}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add payment method
            </button>
          </div>
        </Card>
      )}

      {/* ---------------- Warranty ---------------- */}
      {tab === 'warranty' && (
        <Card title="Warranty and returns" cols={1}>
          <Toggle label="Show the warranty block" checked={cfg.warrantyReturns.enabled} onChange={(v: boolean) => set('warrantyReturns', { enabled: v })} />
          <Field label="Block title"><Text value={cfg.warrantyReturns.title} onChange={(v: string) => set('warrantyReturns', { title: v })} /></Field>

          <div className="flex flex-col gap-3 mt-2">
            {cfg.warrantyReturns.items.map((it: any, i: number) => {
              const patch = (p: any) => {
                const items = [...cfg.warrantyReturns.items];
                items[i] = { ...it, ...p };
                set('warrantyReturns', { items });
              };
              return (
                <div key={it.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <Toggle label={`Row ${i + 1}`} checked={it.enabled} onChange={(v: boolean) => patch({ enabled: v })} />
                    <button onClick={() => set('warrantyReturns', { items: cfg.warrantyReturns.items.filter((_: any, x: number) => x !== i) })} className="p-1 text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Text"><Area value={it.text} onChange={(v: string) => patch({ text: v })} rows={2} /></Field>
                    <div className="flex flex-col gap-3">
                      <Field label="Bold fragment" hint="Appended in bold, e.g. “14 days”"><Text value={it.highlight} onChange={(v: string) => patch({ highlight: v })} /></Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Link text"><Text value={it.linkText} onChange={(v: string) => patch({ linkText: v })} /></Field>
                        <Field label="Link URL"><Text value={it.linkUrl} onChange={(v: string) => patch({ linkUrl: v })} /></Field>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => set('warrantyReturns', { items: [...cfg.warrantyReturns.items, { id: `w_${Date.now()}`, enabled: true, text: 'New warranty row', highlight: '', linkText: '', linkUrl: '' }] })}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add row
            </button>
          </div>
        </Card>
      )}

      {/* ---------------- Content ---------------- */}
      {tab === 'content' && (
        <>
          <Card title="Specifications" cols={1}>
            <Toggle label="Show the specifications table" checked={cfg.features.enabled} onChange={(v: boolean) => set('features', { enabled: v })} />
            <Toggle label="Show the “find similar” button" checked={cfg.features.showFindSimilar} onChange={(v: boolean) => set('features', { showFindSimilar: v })} />
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Section title"><Text value={cfg.features.title} onChange={(v: string) => set('features', { title: v })} /></Field>
              <Field label="Find-similar button text"><Text value={cfg.features.findSimilarLabel} onChange={(v: string) => set('features', { findSimilarLabel: v })} /></Field>
              <Field label="Columns">
                <select value={cfg.features.columns} onChange={(e) => set('features', { columns: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value={1}>1 column</option>
                  <option value={2}>2 columns</option>
                </select>
              </Field>
            </div>
            <p className="text-[12px] text-gray-500">
              Attribute values themselves are edited per product under <span className="font-medium">Products → Specifications</span>.
            </p>
          </Card>

          <Card title="Description" cols={1}>
            <Toggle label="Show the description" checked={cfg.description.enabled} onChange={(v: boolean) => set('description', { enabled: v })} />
            <Field label="Section title"><Text value={cfg.description.title} onChange={(v: string) => set('description', { title: v })} /></Field>
          </Card>

          <Card title="Key features" cols={1}>
            <Toggle label="Show key features" checked={cfg.keyFeatures.enabled} onChange={(v: boolean) => set('keyFeatures', { enabled: v })} />
            <div className="grid md:grid-cols-4 gap-4">
              <Field label="Section title"><Text value={cfg.keyFeatures.title} onChange={(v: string) => set('keyFeatures', { title: v })} /></Field>
              <Field label="Rows shown collapsed"><Num value={cfg.keyFeatures.collapsedCount} min={0} onChange={(v: number) => set('keyFeatures', { collapsedCount: v })} /></Field>
              <Field label="Expand text"><Text value={cfg.keyFeatures.moreLabel} onChange={(v: string) => set('keyFeatures', { moreLabel: v })} /></Field>
              <Field label="Collapse text"><Text value={cfg.keyFeatures.lessLabel} onChange={(v: string) => set('keyFeatures', { lessLabel: v })} /></Field>
            </div>
          </Card>
        </>
      )}

      {/* ---------------- Reviews ---------------- */}
      {tab === 'reviews' && (
        <>
          <Card title="Review section" cols={1}>
            <div className="grid md:grid-cols-2 gap-x-8">
              <div>
                <Toggle label="Show the review section" checked={cfg.reviews.enabled} onChange={(v: boolean) => set('reviews', { enabled: v })} />
                <Toggle label="Show rating summary" checked={cfg.reviews.showSummary} onChange={(v: boolean) => set('reviews', { showSummary: v })} />
                <Toggle label="Show star breakdown bars" checked={cfg.reviews.showBreakdown} onChange={(v: boolean) => set('reviews', { showBreakdown: v })} />
                <Toggle label="Show the write-a-review panel" checked={cfg.reviews.showWriteReview} onChange={(v: boolean) => set('reviews', { showWriteReview: v })} />
                <Toggle label="Show period tabs" checked={cfg.reviews.showPeriodTabs} onChange={(v: boolean) => set('reviews', { showPeriodTabs: v })} />
                <Toggle label="Show the customer photos strip" checked={cfg.reviews.showCustomerPhotos} onChange={(v: boolean) => set('reviews', { showCustomerPhotos: v })} />
                <Toggle label="Show most helpful positive / critical" checked={cfg.reviews.showMostHelpful} onChange={(v: boolean) => set('reviews', { showMostHelpful: v })} />
              </div>
              <div>
                <Toggle label="Show the sort & filter bar" checked={cfg.reviews.showSortBar} onChange={(v: boolean) => set('reviews', { showSortBar: v })} />
                <Toggle label="Show the “only buyers” filter" checked={cfg.reviews.showOnlyBuyersFilter} onChange={(v: boolean) => set('reviews', { showOnlyBuyersFilter: v })} />
                <Toggle label="Show the “with photo” filter" checked={cfg.reviews.showWithPhotoFilter} onChange={(v: boolean) => set('reviews', { showWithPhotoFilter: v })} />
                <Toggle label="Show verified-purchase badge" checked={cfg.reviews.showVerifiedBadge} onChange={(v: boolean) => set('reviews', { showVerifiedBadge: v })} />
                <Toggle label="Show usage duration" checked={cfg.reviews.showUsageDuration} onChange={(v: boolean) => set('reviews', { showUsageDuration: v })} />
                <Toggle label="Show the reviewed-model line" checked={cfg.reviews.showModelLine} onChange={(v: boolean) => set('reviews', { showModelLine: v })} />
                <Toggle label="Show advantages / disadvantages" checked={cfg.reviews.showProsCons} onChange={(v: boolean) => set('reviews', { showProsCons: v })} />
                <Toggle label="Show helpful votes" checked={cfg.reviews.showHelpfulVotes} onChange={(v: boolean) => set('reviews', { showHelpfulVotes: v })} />
                <Toggle label="Show the share button" checked={cfg.reviews.showShare} onChange={(v: boolean) => set('reviews', { showShare: v })} />
                <Toggle label="Show administrator replies" checked={cfg.reviews.showAdminReplies} onChange={(v: boolean) => set('reviews', { showAdminReplies: v })} />
              </div>
            </div>
          </Card>

          <Card title="Submission rules" cols={1}>
            <Toggle label="Publish new reviews immediately" hint="Off means reviews wait for approval in the Reviews screen." checked={cfg.reviews.autoApprove} onChange={(v: boolean) => set('reviews', { autoApprove: v })} />
            <Toggle label="Require a confirmed purchase" checked={cfg.reviews.requirePurchase} onChange={(v: boolean) => set('reviews', { requirePurchase: v })} />
            <Toggle label="Allow customers to attach photos" checked={cfg.reviews.allowPhotoUpload} onChange={(v: boolean) => set('reviews', { allowPhotoUpload: v })} />
            <div className="max-w-[220px]">
              <Field label="Reviews per page"><Num value={cfg.reviews.perPage} min={1} onChange={(v: number) => set('reviews', { perPage: v })} /></Field>
            </div>
          </Card>

          <Card title="Labels">
            <Field label="Section title"><Text value={cfg.reviews.title} onChange={(v: string) => set('reviews', { title: v })} /></Field>
            <Field label="Write-a-review heading"><Text value={cfg.reviews.writeReviewTitle} onChange={(v: string) => set('reviews', { writeReviewTitle: v })} /></Field>
            <Field label="Write-a-review subtitle"><Text value={cfg.reviews.writeReviewSubtitle} onChange={(v: string) => set('reviews', { writeReviewSubtitle: v })} /></Field>
            <Field label="Write-a-review button"><Text value={cfg.reviews.writeReviewLabel} onChange={(v: string) => set('reviews', { writeReviewLabel: v })} /></Field>
            <Field label="Verified badge text"><Text value={cfg.reviews.verifiedLabel} onChange={(v: string) => set('reviews', { verifiedLabel: v })} /></Field>
            <Field label="Customer photos heading"><Text value={cfg.reviews.customerPhotosTitle} onChange={(v: string) => set('reviews', { customerPhotosTitle: v })} /></Field>
            <Field label="All-photos link"><Text value={cfg.reviews.allPhotosLabel} onChange={(v: string) => set('reviews', { allPhotosLabel: v })} /></Field>
            <Field label="Positive highlight title"><Text value={cfg.reviews.positiveTitle} onChange={(v: string) => set('reviews', { positiveTitle: v })} /></Field>
            <Field label="Critical highlight title"><Text value={cfg.reviews.criticalTitle} onChange={(v: string) => set('reviews', { criticalTitle: v })} /></Field>
            <Field label="Advantages label"><Text value={cfg.reviews.prosLabel} onChange={(v: string) => set('reviews', { prosLabel: v })} /></Field>
            <Field label="Disadvantages label"><Text value={cfg.reviews.consLabel} onChange={(v: string) => set('reviews', { consLabel: v })} /></Field>
            <Field label="Helpful prompt"><Text value={cfg.reviews.helpfulLabel} onChange={(v: string) => set('reviews', { helpfulLabel: v })} /></Field>
            <Field label="Admin reply label"><Text value={cfg.reviews.adminReplyLabel} onChange={(v: string) => set('reviews', { adminReplyLabel: v })} /></Field>
            <Field label="Result count" hint="{n} is replaced by the number of reviews."><Text value={cfg.reviews.countLabel} onChange={(v: string) => set('reviews', { countLabel: v })} /></Field>
            <Field label="Show-more button" hint="{n} is replaced by how many load next."><Text value={cfg.reviews.showMoreLabel} onChange={(v: string) => set('reviews', { showMoreLabel: v })} /></Field>
          </Card>

          <Card title="Filter choices">
            <Field label="Period tabs"><StringList items={cfg.reviews.periodTabs} onChange={(v: string[]) => set('reviews', { periodTabs: v })} /></Field>
            <Field label="Sort options" hint="Recognised: Newest / Oldest Items First, Highest / Lowest Rating, Most Helpful.">
              <StringList items={cfg.reviews.sortOptions} onChange={(v: string[]) => set('reviews', { sortOptions: v })} />
            </Field>
            <Field label="Rating filter options"><StringList items={cfg.reviews.ratingFilterOptions} onChange={(v: string[]) => set('reviews', { ratingFilterOptions: v })} /></Field>
          </Card>
        </>
      )}

      {/* ---------------- Related & banners ---------------- */}
      {tab === 'related' && (
        <>
          <Card title="You may be interested" cols={1}>
            <Toggle label="Show the related products block" checked={cfg.related.enabled} onChange={(v: boolean) => set('related', { enabled: v })} />
            <div className="grid md:grid-cols-4 gap-4">
              <Field label="Section title"><Text value={cfg.related.title} onChange={(v: string) => set('related', { title: v })} /></Field>
              <Field label="Products per row">
                <select value={cfg.related.columns} onChange={(e) => set('related', { columns: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Products shown initially"><Num value={cfg.related.initialCount} min={1} onChange={(v: number) => set('related', { initialCount: v })} /></Field>
              <Field label="Show-more button text"><Text value={cfg.related.showMoreLabel} onChange={(v: string) => set('related', { showMoreLabel: v })} /></Field>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[13px] font-semibold text-gray-700">Tabs</span>
              {cfg.related.tabs.map((t: any, i: number) => (
                <div key={t.key} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => {
                      const tabs = [...cfg.related.tabs];
                      tabs[i] = { ...t, enabled: e.target.checked };
                      set('related', { tabs });
                    }}
                    className="w-4 h-4 accent-[#00a651] shrink-0"
                  />
                  <input
                    value={t.label}
                    onChange={(e) => {
                      const tabs = [...cfg.related.tabs];
                      tabs[i] = { ...t, label: e.target.value };
                      set('related', { tabs });
                    }}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                  <span className="text-[11px] text-gray-400 font-mono w-20 shrink-0">{t.key}</span>
                </div>
              ))}
              <p className="text-[11px] text-gray-400">
                Tab behaviour: <b>similar</b> matches category or brand · <b>popular</b> sorts by review count · <b>sale</b> filters discounted items · <b>recent</b> uses the visitor's browsing history.
              </p>
            </div>
          </Card>

          <Card title="Promo banners" description="The four marketing tiles under the related products." cols={1}>
            <Toggle label="Show promo banners" checked={cfg.promoBanners.enabled} onChange={(v: boolean) => set('promoBanners', { enabled: v })} />
            <div className="flex flex-col gap-3">
              {cfg.promoBanners.banners.map((b: any, i: number) => {
                const patch = (p: any) => {
                  const banners = [...cfg.promoBanners.banners];
                  banners[i] = { ...b, ...p };
                  set('promoBanners', { banners });
                };
                return (
                  <div key={b.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <Toggle label={b.title || 'Banner'} checked={b.enabled} onChange={(v: boolean) => patch({ enabled: v })} />
                      <button onClick={() => set('promoBanners', { banners: cfg.promoBanners.banners.filter((_: any, x: number) => x !== i) })} className="p-1 text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Field label="Brand"><Text value={b.brand} onChange={(v: string) => patch({ brand: v })} /></Field>
                      <Field label="Title"><Text value={b.title} onChange={(v: string) => patch({ title: v })} /></Field>
                      <Field label="Subtitle"><Text value={b.subtitle} onChange={(v: string) => patch({ subtitle: v })} /></Field>
                      <Field label="Button text"><Text value={b.buttonText} onChange={(v: string) => patch({ buttonText: v })} /></Field>
                      <Field label="Link"><Text value={b.link} onChange={(v: string) => patch({ link: v })} /></Field>
                      <Field label="Background"><Color value={b.bg} onChange={(v: string) => patch({ bg: v })} /></Field>
                      <div className="md:col-span-3">
                        <Field label="Image URL"><Text value={b.image} onChange={(v: string) => patch({ image: v })} /></Field>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() =>
                  set('promoBanners', {
                    banners: [...cfg.promoBanners.banners, {
                      id: `pb_${Date.now()}`, enabled: true, brand: 'Brand', title: 'New banner',
                      subtitle: 'Subtitle', buttonText: 'Shop now', link: '/', image: '', bg: '#eef2f7',
                    }],
                  })
                }
                className="w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add banner
              </button>
            </div>
          </Card>
        </>
      )}

      <p className="text-[12px] text-gray-400 mt-2">Changes save automatically and apply to the storefront right away.</p>
    </div>
  );
}
