import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Store, Phone, DollarSign, Palette, CheckCircle2 } from 'lucide-react';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { DEFAULT_LOGO_HEIGHT, headerTheme } from '../../components/Header';
import { CURRENCIES, resolveCurrency } from '../../lib/currency';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings, loading } = useAdmin();
  const [formData, setFormData] = useState(siteSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Settings arrive from the API after this screen mounts. Without this, the
  // form would keep the pre-load defaults and saving would overwrite the real
  // values with them. Untouched edits only — never clobber typing in progress.
  useEffect(() => {
    if (!loading && !dirty) setFormData(siteSettings);
  }, [loading, siteSettings, dirty]);

  /** Applies a patch and marks the form dirty so the sync effect backs off. */
  const update = (patch: Record<string, unknown>) => {
    setDirty(true);
    setFormData((prev: any) => ({ ...prev, ...patch }));
  };

  // Falls back to the defaults for any colour not yet chosen.
  const theme = headerTheme(formData);

  const handleSave = () => {
    setSiteSettings(formData);
    setDirty(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 -m-8 p-8">
       <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global configuration for your storefront.</p>
       </div>

       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
         <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">Store Defaults</h2>
         </div>
         <div className="p-8 space-y-10">
            
            <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#00a651]/10 text-[#00a651] flex items-center justify-center shrink-0">
                     <Store size={18} />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg">General Information</h3>
                     <p className="text-xs text-gray-500">Manage basic information about your store</p>
                  </div>
               </div>
               {/* Logo ------------------------------------------------ */}
               <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50">
                  <h4 className="font-bold text-gray-900 mb-1">Storefront logo</h4>
                  <p className="text-xs text-gray-500 mb-5">
                     Shown in the site header. Upload an image, or leave it empty to show the store name as text.
                  </p>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                     <ImageUpload
                        label="Logo image"
                        value={formData.logoImage || ''}
                        onChange={(url) => update({ logoImage: url })}
                        previewClass="bg-[#1f1f1f]"
                        hint="Shown on the dark header — a white or light logo works best. PNG or WEBP with a transparent background, up to 2 MB."
                        height={72}
                     />

                     <div className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1.5">
                           <span className="text-sm font-semibold text-gray-700">Logo height on the storefront</span>
                           <div className="flex items-center gap-3">
                              <input
                                 type="range" min={20} max={64} step={2}
                                 value={formData.logoHeight ?? DEFAULT_LOGO_HEIGHT}
                                 onChange={(e) => update({ logoHeight: Number(e.target.value) })}
                                 className="flex-1 accent-[#00a651]"
                              />
                              <span className="text-sm font-mono text-gray-600 w-14 text-right">
                                 {formData.logoHeight ?? DEFAULT_LOGO_HEIGHT}px
                              </span>
                           </div>
                        </label>

                        <label className="flex flex-col gap-1.5">
                           <span className="text-sm font-semibold text-gray-700">Alt text</span>
                           <input
                              type="text"
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#00a651]"
                              value={formData.logoAlt || ''}
                              onChange={(e) => update({ logoAlt: e.target.value })}
                              placeholder={formData.logoText || 'Store name'}
                           />
                           <span className="text-[11px] text-gray-400">
                              Read aloud by screen readers and shown if the image fails to load.
                           </span>
                        </label>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name</label>
                     <input
                        type="text"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all"
                        value={formData.logoText}
                        onChange={e => update({ logoText: e.target.value })}
                        placeholder="e.g. My Awesome Store"
                     />
                     <p className="text-[11px] text-gray-400 mt-1.5">
                        Used as the text logo when no image is uploaded, and in the admin sidebar and footer.
                     </p>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Support Phone</label>
                     <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                           type="text" 
                           className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" 
                           value={formData.phone}
                           onChange={e => update({ phone: e.target.value })}
                           placeholder="e.g. 1-800-555-1234"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store currency</label>
                     <select
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#00a651]"
                        value={resolveCurrency(formData.currency).code}
                        onChange={(e) => update({ currency: e.target.value })}
                     >
                        {Object.values(CURRENCIES).map((c) => (
                           <option key={c.code} value={c.code}>
                              {c.code} — {c.name}{c.symbol !== c.code ? ` (${c.symbol})` : ''}
                           </option>
                        ))}
                     </select>
                     <p className="text-[11px] text-gray-400 mt-1.5">
                        All prices are entered, displayed and charged in this currency — nothing is converted.
                        {resolveCurrency(formData.currency).decimals === 3 &&
                           ' This currency uses three decimals, so 12.5 shows as 12.500.'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="space-y-6 pt-4">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 size={18} />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg">Product Reviews</h3>
                     <p className="text-xs text-gray-500">Configure how reviews are handled in the store</p>
                  </div>
               </div>
               <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-[#00a651] focus:ring-[#00a651]"
                      checked={formData.autoApproveReviews}
                      onChange={e => update({ autoApproveReviews: e.target.checked })}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Auto-Approve Reviews</div>
                      <div className="text-xs text-gray-500 mt-0.5">Reviews will be immediately visible on the store front without admin approval.</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-[#00a651] focus:ring-[#00a651]"
                      checked={formData.requirePurchaseToReview}
                      onChange={e => update({ requirePurchaseToReview: e.target.checked })}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Require Purchase (Complete Order)</div>
                      <div className="text-xs text-gray-500 mt-0.5">Only allow reviews from customers who have purchased the product and the order status is "Complete".</div>
                    </div>
                  </label>
               </div>
            </div>

            <div className="space-y-6 pt-4">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                     <Palette size={18} />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg">Header appearance</h3>
                     <p className="text-xs text-gray-500">Colours used across the storefront header</p>
                  </div>
               </div>

               {/* Live preview — mirrors the real header layout */}
               <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div
                     className="px-4 h-9 flex items-center justify-between text-[11px]"
                     style={{ background: theme.topBarBg, color: theme.topBarText }}
                  >
                     <span>Delivery · Returns · Contacts</span>
                     <span>$ · English</span>
                  </div>
                  <div
                     className="px-4 h-[68px] flex items-center gap-4"
                     style={{ background: theme.headerBg, color: theme.headerText }}
                  >
                     {formData.logoImage ? (
                        <img src={formData.logoImage} alt="" style={{ height: 34 }} className="object-contain" />
                     ) : (
                        <span className="font-bold text-[20px]">{formData.logoText || 'Store'}</span>
                     )}
                     <span
                        className="px-4 h-9 rounded-xl text-white text-[13px] font-semibold flex items-center"
                        style={{ background: theme.accent }}
                     >
                        Categories
                     </span>
                     <span className="flex-1 bg-white rounded-full h-9" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {([
                     ['headerBg', 'Header background', 'The main bar holding the logo and search'],
                     ['headerText', 'Header text', 'Icons and labels on the main bar'],
                     ['topBarBg', 'Top bar background', 'The thin strip above the header'],
                     ['topBarText', 'Top bar text', 'Links in the thin strip'],
                     ['accent', 'Accent colour', 'Buttons, active links and highlights'],
                  ] as [keyof typeof theme, string, string][]).map(([key, label, hint]) => (
                     <label key={key} className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <div className="flex items-center gap-2">
                           <input
                              type="color"
                              value={theme[key]}
                              onChange={(e) => update({ [key]: e.target.value })}
                              className="w-11 h-10 border border-gray-300 rounded-lg cursor-pointer p-0.5 shrink-0"
                           />
                           <input
                              type="text"
                              value={theme[key]}
                              onChange={(e) => update({ [key]: e.target.value })}
                              className="flex-1 min-w-0 border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#00a651]"
                           />
                        </div>
                        <span className="text-[11px] text-gray-400">{hint}</span>
                     </label>
                  ))}
               </div>

               <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-sm font-semibold text-gray-700 me-1">Presets:</span>
                  {[
                     { name: 'Dark', headerBg: '#1a1a1a', headerText: '#ffffff', topBarBg: '#2a2a2a', topBarText: '#b3b3b3', accent: '#00a651' },
                     { name: 'Midnight', headerBg: '#0f172a', headerText: '#ffffff', topBarBg: '#1e293b', topBarText: '#94a3b8', accent: '#3b82f6' },
                     { name: 'Light', headerBg: '#ffffff', headerText: '#111827', topBarBg: '#f3f4f6', topBarText: '#4b5563', accent: '#ff5c00' },
                     { name: 'Deep blue', headerBg: '#12305c', headerText: '#ffffff', topBarBg: '#0d2445', topBarText: '#a8c0de', accent: '#ffb400' },
                     { name: 'Espresso', headerBg: '#2b2118', headerText: '#f5efe7', topBarBg: '#3a2d21', topBarText: '#c3b3a1', accent: '#c8873f' },
                  ].map((preset) => {
                     const { name, ...colors } = preset;
                     return (
                        <button
                           key={name}
                           type="button"
                           onClick={() => update(colors)}
                           className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-400 transition-colors"
                        >
                           <span className="flex rounded overflow-hidden border border-gray-200">
                              {[colors.headerBg, colors.topBarBg, colors.accent].map((c) => (
                                 <span key={c} className="w-4 h-4" style={{ background: c }} />
                              ))}
                           </span>
                           <span className="text-[13px] font-medium text-gray-700">{name}</span>
                        </button>
                     );
                  })}
               </div>

               <p className="text-[12px] text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  If you pick a light header background, set the header text to a dark colour — the logo and icons
                  are drawn on top of it and will otherwise disappear.
               </p>
            </div>

         </div>
         <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 items-center rounded-b-2xl">
            {isSaved && (
               <div className="text-[#00a651] text-sm font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={16} /> Settings saved!
               </div>
            )}
            <button onClick={handleSave} className="bg-[#00a651] text-white px-8 py-2.5 rounded-xl hover:bg-[#008c44] font-semibold transition-colors shadow-sm shadow-[#00a651]/20">
               Save Settings
            </button>
         </div>
       </div>
    </div>
  )
}
