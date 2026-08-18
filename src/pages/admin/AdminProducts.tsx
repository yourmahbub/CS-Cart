import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, X, Upload, Search, Filter, CheckCircle2, ChevronRight, BarChart3, Package as PackageIcon, Info, ImageIcon, PlayCircle, ArrowRight, Globe, Layers, ListTree } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';
import { BilingualField, BilingualList } from '../../components/admin/BilingualField';
import { useLang } from '../../context/LanguageContext';
import { computeMargin, money } from '../../lib/pricing';
import { resolveCurrency } from '../../lib/currency';

export default function AdminProducts() {
  const { products, adminProducts, loadAdminProducts, deleteProduct, addProduct, updateProduct, categories, siteSettings } = useAdmin();
  const { tAdmin } = useLang();
  const currency = resolveCurrency(siteSettings?.currency);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // The public list has no cost price, so the editor works off the admin copy.
  useEffect(() => { loadAdminProducts().catch(() => {}); }, [loadAdminProducts]);
  const catalogue = adminProducts.length ? adminProducts : products;

  const steps = [
    { id: 1, name: 'Basic Info', icon: Info },
    { id: 2, name: 'Media', icon: ImageIcon },
    { id: 3, name: 'Inventory & Pricing', icon: BarChart3 },
    { id: 4, name: 'SEO', icon: Globe },
    { id: 5, name: 'Product Options', icon: Layers },
    { id: 6, name: 'Specifications', icon: ListTree }
  ];

  /** Colours may be stored as strings (legacy) or {name, hex, image} objects. */
  const normalizeColors = (colors: any): any[] => {
    if (!colors) return [];
    const arr = Array.isArray(colors) ? colors : String(colors).split(',');
    return arr
      .map((c: any) => (typeof c === 'string' ? { name: c.trim(), hex: '', image: '' } : c))
      .filter((c: any) => c && c.name !== '');
  };

  /** Arabic translations live under `i18n.ar`; English stays in the main fields. */
  const ar = formData.i18n?.ar ?? {};
  const setAr = (patch: any) =>
    setFormData((prev: any) => ({ ...prev, i18n: { ...(prev.i18n || {}), ar: { ...(prev.i18n?.ar || {}), ...patch } } }));

  const handleEdit = (product: any) => {
    setIsEditing(product.id);
    setFormData(product);
    setActiveStep(1);
  };

  const handleCreate = () => {
    setIsEditing(0); // 0 means new
    setFormData({
      title: '', description: '', price: 0, oldPrice: 0, code: '', image: '', inStock: true, discount: 0
    });
    setActiveStep(1);
  };

  const handleSave = () => {
    try {
      const dataToSave = { ...formData };
      
      // Auto-populate SEO fields if not explicitly set
      if (dataToSave.metaTitle === undefined) {
        dataToSave.metaTitle = dataToSave.title || '';
      }
      if (dataToSave.metaDescription === undefined) {
        dataToSave.metaDescription = dataToSave.description || '';
      }
      if (dataToSave.slug === undefined) {
        dataToSave.slug = dataToSave.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      }

      dataToSave.colors = normalizeColors(dataToSave.colors);
      if (typeof dataToSave.sizes === 'string') {
        dataToSave.sizes = dataToSave.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      if (isEditing === 0) {
        addProduct(dataToSave);
      } else if (isEditing) {
        updateProduct(isEditing, dataToSave);
      }
      setIsEditing(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch(err) {
      alert("An error occurred while saving the product.");
    }
  };

  const filteredProducts = catalogue.filter((p: any) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isEditing !== null) {
    return (
      <div className="bg-white flex flex-col -m-10 min-h-[calc(100vh-88px)]">
         <div className="px-10 py-5 border-b border-gray-200 flex justify-between items-center bg-white backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-6">
               <Tooltip content="Close editor" position="bottom">
                 <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 shadow-sm">
                    <X size={20} />
                 </button>
               </Tooltip>
               <div>
                 <h2 className="text-xl font-bold text-gray-900">{tAdmin(isEditing === 0 ? 'Create New Product' : 'Edit Product')}</h2>
                 <p className="text-sm text-gray-500">{formData.title || 'Untitled Product'}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsEditing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-semibold transition-colors shadow-sm">{tAdmin('Discard Changes')}</button>
               <button onClick={handleSave} className="px-5 py-2.5 bg-[#00a651] text-white rounded-xl hover:bg-[#008c44] font-semibold transition-colors shadow-sm shadow-[#00a651]/20 flex items-center gap-2">
                  <CheckCircle2 size={18} /> {tAdmin('Save Product')}
               </button>
            </div>
         </div>

         {/* Tabs Navigation */}
         <div className="bg-white backdrop-blur-md border-b border-gray-200 sticky top-[89px] z-30 shadow-sm">
            <div className="flex items-center gap-8 px-8">
               {steps.map((step) => {
                 const isActive = activeStep === step.id;
                 const StepIcon = step.icon;
                 return (
                   <button 
                     key={step.id}
                     onClick={() => setActiveStep(step.id)}
                     className={`flex items-center gap-2 py-4 border-b-2 font-semibold transition-colors ${
                       isActive ? 'border-[#00a651] text-[#00a651]' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                     }`}
                   >
                      <StepIcon size={18} />
                      {tAdmin(step.name)}
                   </button>
                 )
               })}
            </div>
         </div>

         {/* Full width — the paired English / Arabic inputs need the room. */}
         <div className="p-8 w-full flex-1">
            {activeStep === 1 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                    <p className="text-sm text-gray-500">Provide the primary details about your product.</p>
                  </div>
                  <BilingualField
                    label="Product title"
                    required
                    value={{ en: formData.title || '', ar: ar.title || '' }}
                    onChange={(v) => { setFormData({ ...formData, title: v.en }); setAr({ title: v.ar }); }}
                    placeholderEn="e.g. Short sleeve t-shirt"
                    placeholderAr="مثال: تي شيرت بأكمام قصيرة"
                  />

                  <BilingualField
                    label="Description"
                    multiline
                    rows={6}
                    value={{ en: formData.description || '', ar: ar.description || '' }}
                    onChange={(v) => { setFormData({ ...formData, description: v.en }); setAr({ description: v.ar }); }}
                    placeholderEn="Detailed product description…"
                    placeholderAr="وصف تفصيلي للمنتج…"
                  />

                  <BilingualField
                    label="Short note / badge"
                    value={{ en: formData.shortNote || '', ar: ar.shortNote || '' }}
                    onChange={(v) => { setFormData({ ...formData, shortNote: v.en }); setAr({ shortNote: v.ar }); }}
                    placeholderEn="e.g. Limited edition"
                    placeholderAr="مثال: إصدار محدود"
                    hint="Highlighted line shown under the product title."
                  />

                  <div className="grid grid-cols-2 gap-6 pt-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                       <select 
                         className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-medium text-gray-900"
                         value={formData.inStock ? "active" : "draft"}
                         onChange={(e) => setFormData({...formData, inStock: e.target.value === 'active'})}
                       >
                          <option value="active">Active (Published)</option>
                          <option value="draft">Draft (Hidden)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                       <select 
                         className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all"
                         value={formData.categoryId || ''}
                         onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                       >
                          <option value="">Select category...</option>
                          {categories.map((c: any) => (
                             <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                       </select>
                     </div>
                  </div>
               </div>
            )}

            {activeStep === 2 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Media Gallery</h3>
                    <p className="text-sm text-gray-500">Upload product images and videos. The first item will be your main media. Videos automatically play first in the storefront.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {/* Unified Multi-upload Dropzone */}
                    <div className="border-2 border-dashed border-gray-300 w-full rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-[#00a651]/50 transition-colors text-gray-400 group cursor-pointer overflow-hidden p-10 text-center relative">
                       <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#00a651]">
                          <Upload size={28} />
                       </div>
                       <span className="text-base font-bold text-gray-900 leading-tight">Drag and drop media here</span>
                       <span className="text-sm text-gray-500 mt-2">Upload images or videos (Click to browse)</span>
                       <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" onChange={async (e) => {
                           const files = e.target.files;
                           if (!files || files.length === 0) return;
                           
                           let newImages = formData.images ? [...formData.images] : (formData.image ? [formData.image] : []);
                           let newVideoUrl = formData.videoUrl || '';
                           
                           let processedCount = 0;
                           
                           const resizeImage = (file: File): Promise<string> => {
                             return new Promise((resolve) => {
                               const reader = new FileReader();
                               reader.onload = (e) => {
                                 const img = new Image();
                                 img.onload = () => {
                                   const canvas = document.createElement('canvas');
                                   const MAX_WIDTH = 800;
                                   const MAX_HEIGHT = 800;
                                   let width = img.width;
                                   let height = img.height;
                                   
                                   if (width > height) {
                                     if (width > MAX_WIDTH) {
                                       height *= MAX_WIDTH / width;
                                       width = MAX_WIDTH;
                                     }
                                   } else {
                                     if (height > MAX_HEIGHT) {
                                       width *= MAX_HEIGHT / height;
                                       height = MAX_HEIGHT;
                                     }
                                   }
                                   
                                   canvas.width = width;
                                   canvas.height = height;
                                   const ctx = canvas.getContext('2d');
                                   ctx?.drawImage(img, 0, 0, width, height);
                                   resolve(canvas.toDataURL('image/jpeg', 0.8));
                                 };
                                 img.src = e.target?.result as string;
                               };
                               reader.readAsDataURL(file);
                             });
                           };

                           for (let i = 0; i < files.length; i++) {
                               const file = files[i];
                               if (file.type.startsWith('video/')) {
                                   const reader = new FileReader();
                                   reader.onloadend = () => {
                                       newVideoUrl = reader.result as string;
                                       processedCount++;
                                       if (processedCount === files.length) {
                                           setFormData({...formData, images: newImages, image: newImages[0] || '', videoUrl: newVideoUrl});
                                       }
                                   };
                                   reader.readAsDataURL(file);
                               } else if (file.type.startsWith('image/')) {
                                   const resizedDataUrl = await resizeImage(file);
                                   newImages.push(resizedDataUrl);
                                   processedCount++;
                                   if (processedCount === files.length) {
                                       setFormData({...formData, images: newImages, image: newImages[0] || '', videoUrl: newVideoUrl});
                                   }
                               }
                           }
                       }} />
                    </div>

                    {/* Unified Media Grid */}
                    {(() => {
                        const images = formData.images?.length > 0 ? formData.images : (formData.image ? [formData.image] : []);
                        const mediaItems = formData.videoUrl 
                          ? [{ type: 'video', url: formData.videoUrl }, ...images.map((url: string) => ({ type: 'image', url }))]
                          : images.map((url: string) => ({ type: 'image', url }));

                        if (mediaItems.length === 0) return null;

                        return (
                          <div className="mt-4 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">Uploaded Media ({mediaItems.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {mediaItems.map((item: any, idx: number) => (
                                <div key={idx} className={`border ${idx === 0 ? 'border-[#00a651] ring-2 ring-[#00a651]/20' : 'border-gray-200'} rounded-2xl aspect-square overflow-hidden relative group bg-gray-50 flex items-center justify-center p-3`}>
                                   {idx === 0 && (
                                     <div className="absolute top-2 left-2 bg-[#00a651] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">MAIN</div>
                                   )}
                                   {item.type === 'video' && idx !== 0 && (
                                     <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">VIDEO</div>
                                   )}
                                   
                                   {item.type === 'video' ? (
                                      <video src={item.url || undefined} className="max-w-full max-h-full object-cover mix-blend-multiply rounded-lg" muted playsInline />
                                   ) : (
                                      <img src={item.url || undefined} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                   )}
                                   
                                   {item.type === 'video' && (
                                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-sm text-purple-600 backdrop-blur-sm">
                                          <PlayCircle size={20} className="ml-0.5" />
                                        </div>
                                     </div>
                                   )}

                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm rounded-2xl">
                                     {item.type === 'image' && idx !== (formData.videoUrl ? 1 : 0) && (
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const newImages = [...images];
                                            const imgIdx = newImages.indexOf(item.url);
                                            if (imgIdx > -1) {
                                                newImages.splice(imgIdx, 1);
                                                newImages.unshift(item.url);
                                                setFormData({...formData, images: newImages, image: newImages[0]});
                                            }
                                        }} className="bg-white/90 text-gray-900 text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-white transition-all transform hover:scale-105 active:scale-95">
                                           Set as Main Image
                                        </button>
                                     )}
                                     <button onClick={(e) => {
                                        e.preventDefault();
                                        if (item.type === 'video') {
                                            setFormData({...formData, videoUrl: ''});
                                        } else {
                                            const newImages = [...images];
                                            const imgIdx = newImages.indexOf(item.url);
                                            if (imgIdx > -1) {
                                                newImages.splice(imgIdx, 1);
                                                setFormData({...formData, images: newImages.length > 0 ? newImages : undefined, image: newImages[0] || ''});
                                            }
                                        }
                                     }} className="bg-white text-red-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all">
                                        <Trash2 size={18} />
                                     </button>
                                   </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                    })()}
                  </div>
               </div>
            )}

            {activeStep === 3 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                     <div className="mb-2">
                       <h3 className="text-lg font-bold text-gray-900">Pricing</h3>
                       <p className="text-sm text-gray-500">Set the price customers will pay for this item.</p>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selling Price</label>
                         <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-[13px]">{currency.symbol}</span>
                           <input type="number" className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-medium" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                         </div>
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            Cost price
                            <Tooltip content="What this item costs you. Never shown to customers — used only for profit reporting.">
                              <Info size={14} className="text-gray-400" />
                            </Tooltip>
                         </label>
                         <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-[13px]">{currency.symbol}</span>
                           <input
                             type="number" min={0} step="0.01" placeholder="0.00"
                             className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-medium"
                             value={formData.costPrice ?? ''}
                             onChange={(e) => setFormData({ ...formData, costPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                           />
                         </div>
                         <p className="text-[11px] text-gray-400 mt-1.5">Private — admin only.</p>
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            Compare at price
                            <Tooltip content="To show a reduced price, move the product's original price into Compare at price. Enter a lower value into Price."><Info size={14} className="text-gray-400" /></Tooltip>
                         </label>
                         <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-[13px]">{currency.symbol}</span>
                           <input type="number" className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-medium text-gray-400" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})} placeholder="0.00" />
                         </div>
                       </div>
                     </div>

                     {/* Live margin — recalculates as either price is edited */}
                     {(() => {
                       const m = computeMargin(formData.price, formData.costPrice);
                       if (m.unknown) {
                         return (
                           <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-500">
                             <Info size={15} className="shrink-0 mt-0.5 text-gray-400" />
                             Enter a cost price to see the profit and margin for this product.
                           </div>
                         );
                       }
                       return (
                         <div
                           className={`grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl px-5 py-4 border ${
                             m.loss ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                           }`}
                         >
                           {[
                             { label: 'Cost', value: money(m.cost, currency.code), plain: true },
                             { label: m.loss ? 'Loss per unit' : 'Profit per unit', value: money(m.profit, currency.code) },
                             { label: 'Margin', value: `${m.margin.toFixed(1)}%` },
                             { label: 'Markup', value: `${m.markup.toFixed(1)}%` },
                           ].map((cell) => (
                             <div key={cell.label}>
                               <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{cell.label}</div>
                               <div className={`text-[17px] font-bold ${
                                 cell.plain ? 'text-gray-900' : m.loss ? 'text-red-600' : 'text-green-700'
                               }`}>
                                 {cell.value}
                               </div>
                             </div>
                           ))}
                           {m.loss && (
                             <p className="col-span-2 sm:col-span-4 text-[12px] text-red-700 font-medium">
                               You are selling below cost — every sale loses {money(Math.abs(m.profit), currency.code)}.
                             </p>
                           )}
                         </div>
                       );
                     })()}
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                     <div className="mb-2">
                       <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
                       <p className="text-sm text-gray-500">Track and manage your stock levels.</p>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU (Stock Keeping Unit)</label>
                         <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-mono text-sm" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. T-SHIRT-M-BLK" />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barcode (ISBN, UPC, GTIN, etc.)</label>
                         <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-mono text-sm" placeholder="Scanning allowed" />
                       </div>
                     </div>
                  </div>
               </div>
            )}

            {activeStep === 4 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                     <div className="mb-2">
                       <h3 className="text-lg font-bold text-gray-900">Search Engine Optimization</h3>
                       <p className="text-sm text-gray-500">Improve how this product appears in search engine results.</p>
                     </div>
                     <div className="space-y-6">
                       {(() => {
                         const enTitle = formData.metaTitle ?? formData.title ?? '';
                         const arTitle = ar.metaTitle ?? ar.title ?? '';
                         const enDesc = formData.metaDescription ?? formData.description ?? '';
                         const arDesc = ar.metaDescription ?? ar.description ?? '';
                         const counter = (v: string, max: number) => (
                           <span className={`text-xs font-normal ${v.length > max ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                             {v.length} / {max}
                           </span>
                         );
                         return (
                           <>
                             <div>
                               <div className="flex items-center justify-between mb-1.5">
                                 <span className="text-sm font-semibold text-gray-700">Page title</span>
                                 <span className="flex items-center gap-3">EN {counter(enTitle, 70)} · AR {counter(arTitle, 70)}</span>
                               </div>
                               <BilingualField
                                 label=""
                                 value={{ en: enTitle, ar: arTitle }}
                                 placeholderEn={formData.title || 'Product name shown in Google'}
                                 placeholderAr={ar.title || 'اسم المنتج كما يظهر في جوجل'}
                                 onChange={(v) => { setFormData({ ...formData, metaTitle: v.en }); setAr({ metaTitle: v.ar }); }}
                               />
                             </div>

                             <div>
                               <div className="flex items-center justify-between mb-1.5">
                                 <span className="text-sm font-semibold text-gray-700">Meta description</span>
                                 <span className="flex items-center gap-3">EN {counter(enDesc, 320)} · AR {counter(arDesc, 320)}</span>
                               </div>
                               <BilingualField
                                 label=""
                                 multiline
                                 rows={3}
                                 value={{ en: enDesc, ar: arDesc }}
                                 placeholderEn="Write a compelling description to attract customers from search engines…"
                                 placeholderAr="اكتب وصفاً جذاباً يجلب العملاء من محركات البحث…"
                                 onChange={(v) => { setFormData({ ...formData, metaDescription: v.en }); setAr({ metaDescription: v.ar }); }}
                               />
                             </div>
                           </>
                         );
                       })()}

                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Handle</label>
                         <div className="relative flex">
                           <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                             mystore.com/product/
                           </span>
                           <input type="text" className="flex-1 w-full border border-gray-200 rounded-none rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all text-sm" value={formData.slug ?? (formData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '')} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} placeholder={formData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''} />
                         </div>
                         <p className="text-[11px] text-gray-400 mt-1.5">
                           One URL serves both languages — the page content switches with the visitor's language,
                           so the address stays in Latin characters.
                         </p>
                       </div>
                     </div>
                     <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Search engine preview</h4>
                        {(() => {
                          const url = `mystore.com/product/${
                            (formData.slug ?? formData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) || 'product-slug'
                          }`;
                          const previews = [
                            {
                              key: 'en', label: 'English result', dir: 'ltr' as const,
                              title: (formData.metaTitle ?? formData.title) || 'Product Title',
                              desc: (formData.metaDescription ?? formData.description)
                                || 'Add a meta description to control what Google shows here.',
                            },
                            {
                              key: 'ar', label: 'نتيجة البحث بالعربية · Arabic result', dir: 'rtl' as const,
                              title: (ar.metaTitle ?? ar.title) || '',
                              desc: (ar.metaDescription ?? ar.description) || '',
                            },
                          ];
                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                              {previews.map((p) => (
                                <div key={p.key}>
                                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{p.label}</div>
                                  {p.title ? (
                                    <div dir={p.dir} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                                      <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
                                        {p.title} | Your Store
                                      </div>
                                      <div dir="ltr" className={`text-[#006621] text-sm truncate mt-1 ${p.dir === 'rtl' ? 'text-right' : ''}`}>
                                        {url}
                                      </div>
                                      <div className="text-[#4d5156] text-sm mt-1.5 line-clamp-2">{p.desc}</div>
                                    </div>
                                  ) : (
                                    <div className="p-5 border border-dashed border-gray-200 rounded-xl text-[13px] text-gray-400 h-full flex items-center">
                                      No Arabic title yet — Arabic searchers would see the English result.
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                     </div>
                  </div>
               </div>
            )}
            
            {activeStep === 5 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                     <div className="flex items-center justify-between mb-2">
                       <div>
                         <h3 className="text-lg font-bold text-gray-900">Advanced Options</h3>
                         <p className="text-sm text-gray-500">Configure variants, warranty, and special offers.</p>
                       </div>
                       <label className="flex items-center gap-3 cursor-pointer">
                          <span className="font-semibold text-gray-700">Enable Variants</span>
                          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.hasOptions ? 'bg-[#00a651]' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.hasOptions ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.hasOptions || false} onChange={e => setFormData({...formData, hasOptions: e.target.checked})} />
                       </label>
                     </div>
                     <div className="grid gap-6">
                       {formData.hasOptions && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Colors</label>
                             <p className="text-xs text-gray-500 mb-2 text-left">Each colour becomes a swatch. Give it an image to show the product in that colour.</p>
                             <div className="flex flex-col gap-2">
                               {normalizeColors(formData.colors).map((c: any, index: number) => (
                                 <div key={index} className="flex items-center gap-2 border border-gray-200 rounded-xl p-2 bg-white">
                                   <span className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center" style={{ background: c.image ? '#fff' : (c.hex || '#e5e7eb') }}>
                                     {c.image && <img src={c.image} alt="" className="w-full h-full object-contain" />}
                                   </span>
                                   <input
                                     type="text"
                                     value={c.name}
                                     placeholder="Name"
                                     onChange={(e) => {
                                       const list = normalizeColors(formData.colors);
                                       list[index] = { ...c, name: e.target.value };
                                       setFormData({ ...formData, colors: list });
                                     }}
                                     className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm shrink-0 outline-none focus:border-[#00a651]"
                                   />
                                   <input
                                     type="color"
                                     value={c.hex || '#cccccc'}
                                     onChange={(e) => {
                                       const list = normalizeColors(formData.colors);
                                       list[index] = { ...c, hex: e.target.value };
                                       setFormData({ ...formData, colors: list });
                                     }}
                                     className="w-9 h-9 border border-gray-200 rounded-lg p-0.5 cursor-pointer shrink-0"
                                     title="Swatch colour (used when no image is set)"
                                   />
                                   <input
                                     type="text"
                                     value={c.image || ''}
                                     placeholder="Image URL (optional)"
                                     onChange={(e) => {
                                       const list = normalizeColors(formData.colors);
                                       list[index] = { ...c, image: e.target.value };
                                       setFormData({ ...formData, colors: list });
                                     }}
                                     className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#00a651]"
                                   />
                                   <button
                                     type="button"
                                     onClick={() => setFormData({ ...formData, colors: normalizeColors(formData.colors).filter((_: any, i: number) => i !== index) })}
                                     className="p-1.5 text-red-400 hover:text-red-600 shrink-0"
                                   >
                                     <X size={16} />
                                   </button>
                                 </div>
                               ))}
                               <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, colors: [...normalizeColors(formData.colors), { name: 'New colour', hex: '#cccccc', image: '' }] })}
                                 className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                               >
                                 <Plus size={16} /> Add colour
                               </button>
                             </div>
                             <div className="mt-3">
                               <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Default colour</label>
                               <select
                                 value={formData.defaultColor || ''}
                                 onChange={(e) => setFormData({ ...formData, defaultColor: e.target.value })}
                                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00a651]"
                               >
                                 <option value="">First in the list</option>
                                 {normalizeColors(formData.colors).map((c: any, i: number) => <option key={i} value={c.name}>{c.name}</option>)}
                               </select>
                             </div>
                           </div>
                           <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Sizes (Type and press Enter)</label>
                             <div className="flex flex-wrap items-center gap-2 p-2 w-full border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#00a651]/20 focus-within:border-[#00a651] bg-white transition-all text-sm">
                               {(Array.isArray(formData.sizes) ? formData.sizes : (formData.sizes ? formData.sizes.split(',') : [])).map((tag: string, index: number) => {
                                 const t = tag.trim();
                                 if(!t) return null;
                                 return (
                                   <span key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800 font-medium pb-1">
                                     {t}
                                     <button type="button" onClick={() => {
                                       const newSizes = (Array.isArray(formData.sizes) ? formData.sizes : formData.sizes.split(',')).map((s: string) => s.trim()).filter((s: string) => s !== t);
                                       setFormData({...formData, sizes: newSizes});
                                     }} className="hover:text-red-500 opacity-60 hover:opacity-100 focus:outline-none mt-0.5 ml-1">
                                       <X size={14} strokeWidth={3} />
                                     </button>
                                   </span>
                                 )
                               })}
                               <input 
                                 type="text" 
                                 className="flex-1 outline-none min-w-[120px] bg-transparent py-1 px-2" 
                                 placeholder="e.g. S, M, L" 
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ',') {
                                     e.preventDefault();
                                     const val = e.currentTarget.value.trim();
                                     if (val) {
                                       const current = Array.isArray(formData.sizes) ? formData.sizes : (formData.sizes ? formData.sizes.split(',') : []);
                                       if(!current.includes(val)) {
                                          setFormData({...formData, sizes: [...current, val]});
                                       }
                                       e.currentTarget.value = '';
                                     }
                                   }
                                 }}
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-3 mt-3">
                               <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Size label</label>
                                 <input
                                   type="text"
                                   value={formData.sizeLabel || ''}
                                   placeholder="e.g. Watch Size"
                                   onChange={(e) => setFormData({ ...formData, sizeLabel: e.target.value })}
                                   className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00a651]"
                                 />
                               </div>
                               <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Default size</label>
                                 <select
                                   value={formData.defaultSize || ''}
                                   onChange={(e) => setFormData({ ...formData, defaultSize: e.target.value })}
                                   className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00a651]"
                                 >
                                   <option value="">First in the list</option>
                                   {(Array.isArray(formData.sizes) ? formData.sizes : []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                                 </select>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}
                       
                       <div className="pt-6 border-t border-gray-100">
                           <h4 className="text-sm font-semibold text-gray-900 mb-4 text-left">Short Info / Badges</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                               <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Short Note</label>
                               <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.shortNote || ''} onChange={e => setFormData({...formData, shortNote: e.target.value})} placeholder="e.g. Limited Edition, Free Shipping" />
                             </div>
                             <div>
                               <div className="flex items-center justify-between mb-1.5">
                                 <label className="text-sm font-semibold text-gray-700 text-left">Warranty Information</label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                   <span className="text-xs text-gray-500 font-medium">{formData.hasWarranty !== false ? 'Enabled' : 'Disabled'}</span>
                                   <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${formData.hasWarranty !== false ? 'bg-[#00a651]' : 'bg-gray-200'}`}>
                                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.hasWarranty !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </div>
                                   <input type="checkbox" className="hidden" checked={formData.hasWarranty !== false} onChange={e => setFormData({...formData, hasWarranty: e.target.checked})} />
                                 </label>
                               </div>
                               {formData.hasWarranty !== false && (
                                 <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all mt-1" value={formData.warranty || ''} onChange={e => setFormData({...formData, warranty: e.target.value})} placeholder="e.g. 1 Year Official Warranty" />
                               )}
                             </div>
                           </div>
                       </div>

                       <div className="pt-6 border-t border-gray-100">
                           <h4 className="text-sm font-semibold text-gray-900 mb-4 text-left">Promotions & Upsells</h4>
                           <div className="space-y-5">
                             <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <input type="checkbox" className="mt-1 w-5 h-5 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]" checked={formData.isPopular || false} onChange={e => setFormData({...formData, isPopular: e.target.checked})} />
                                <div>
                                  <div className="font-semibold text-gray-900 text-left">Mark as Popular Product</div>
                                  <div className="text-sm text-gray-500 text-left">This product will be highlighted in the "Popular" sections.</div>
                                </div>
                             </label>

                             <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <input type="checkbox" className="mt-1 w-5 h-5 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]" checked={formData.cheapBuyTogether || false} onChange={e => setFormData({...formData, cheapBuyTogether: e.target.checked})} />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-left">Enable "Frequently Bought Together" bundle</div>
                                  <div className="text-sm text-gray-500 text-left">Shows discounted bundle recommendations on the product page.</div>
                                  {formData.cheapBuyTogether && (
                                    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Select Accessory Product</label>
                                      <select 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all text-sm"
                                        value={formData.accessoryProductId || ''}
                                        onChange={(e) => setFormData({...formData, accessoryProductId: Number(e.target.value) || null})}
                                      >
                                        <option value="">Select a product...</option>
                                        {catalogue.filter((p: any) => p.id !== isEditing).map((p: any) => (
                                          <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                             </label>
                           </div>
                       </div>
                     </div>
                  </div>
               </div>
            )}
            
            {activeStep === 6 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Brand */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="mb-5">
                       <h3 className="text-lg font-bold text-gray-900">Brand</h3>
                       <p className="text-sm text-gray-500">Shown at the top of the product page sidebar.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Brand name</label>
                         <input type="text" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#00a651]" placeholder="e.g. Apple" />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Brand logo URL</label>
                         <div className="flex items-center gap-3">
                           <input type="text" value={formData.brandLogo || ''} onChange={e => setFormData({...formData, brandLogo: e.target.value})} className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#00a651]" placeholder="https://…" />
                           {formData.brandLogo && <img src={formData.brandLogo} alt="" className="h-10 w-10 object-contain shrink-0" />}
                         </div>
                       </div>
                     </div>
                  </div>

                  {/* Specification groups */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="mb-5">
                       <h3 className="text-lg font-bold text-gray-900">Specification groups</h3>
                       <p className="text-sm text-gray-500">
                         Rendered as the "Features" table. Each row takes an English and an Arabic value.
                         Leave a group title empty for the ungrouped first column.
                       </p>
                     </div>
                     <div className="flex flex-col gap-4">
                       {(formData.specGroups || []).map((g: any, gi: number) => {
                         // The Arabic table mirrors the English one position for position.
                         const arGroups: any[] = ar.specGroups || [];
                         const arG = arGroups[gi] || { title: '', items: [] };

                         const patchGroup = (p: any) => {
                           const groups = [...(formData.specGroups || [])];
                           groups[gi] = { ...g, ...p };
                           setFormData({ ...formData, specGroups: groups });
                         };
                         const patchArGroup = (p: any) => {
                           const groups = [...arGroups];
                           groups[gi] = { ...arG, ...p };
                           setAr({ specGroups: groups });
                         };
                         const removeGroup = () => {
                           setFormData({ ...formData, specGroups: formData.specGroups.filter((_: any, i: number) => i !== gi) });
                           setAr({ specGroups: arGroups.filter((_: any, i: number) => i !== gi) });
                         };
                         const addRow = () => {
                           patchGroup({ items: [...(g.items || []), { name: '', value: '' }] });
                           patchArGroup({ items: [...(arG.items || []), { name: '', value: '' }] });
                         };
                         const removeRow = (ii: number) => {
                           patchGroup({ items: g.items.filter((_: any, i: number) => i !== ii) });
                           patchArGroup({ items: (arG.items || []).filter((_: any, i: number) => i !== ii) });
                         };

                         return (
                           <div key={g.id || gi} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                             <div className="flex items-start gap-3 mb-3">
                               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <div className="flex flex-col gap-1">
                                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Group title · English</span>
                                   <input
                                     type="text" dir="ltr" value={g.title || ''} placeholder="e.g. Electronics"
                                     onChange={(e) => patchGroup({ title: e.target.value })}
                                     className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-[#00a651]"
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">العربية · Arabic</span>
                                   <input
                                     type="text" dir="rtl" value={arG.title || ''} placeholder="مثال: إلكترونيات"
                                     onChange={(e) => patchArGroup({ title: e.target.value })}
                                     className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-right outline-none focus:border-[#00a651]"
                                   />
                                 </div>
                               </div>
                               <button type="button" onClick={removeGroup} className="p-1.5 text-red-400 hover:text-red-600 mt-5 shrink-0">
                                 <X size={16} />
                               </button>
                             </div>

                             <div className="flex flex-col gap-2">
                               {(g.items || []).map((it: any, ii: number) => {
                                 const arIt = (arG.items || [])[ii] || { name: '', value: '' };
                                 const setEn = (patch: any) => {
                                   const items = [...g.items];
                                   items[ii] = { ...it, ...patch };
                                   patchGroup({ items });
                                 };
                                 const setArIt = (patch: any) => {
                                   const items = [...(arG.items || [])];
                                   items[ii] = { ...arIt, ...patch };
                                   patchArGroup({ items });
                                 };
                                 return (
                                   <div key={ii} className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-2">
                                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                       <div className="flex gap-2">
                                         <input type="text" dir="ltr" value={it.name} placeholder="Attribute (EN)"
                                           onChange={(e) => setEn({ name: e.target.value })}
                                           className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[#00a651]" />
                                         <input type="text" dir="ltr" value={it.value} placeholder="Value (EN)"
                                           onChange={(e) => setEn({ value: e.target.value })}
                                           className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[#00a651]" />
                                       </div>
                                       <div className="flex gap-2">
                                         <input type="text" dir="rtl" value={arIt.name} placeholder="الخاصية"
                                           onChange={(e) => setArIt({ name: e.target.value })}
                                           className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right outline-none focus:border-[#00a651]" />
                                         <input type="text" dir="rtl" value={arIt.value} placeholder="القيمة"
                                           onChange={(e) => setArIt({ value: e.target.value })}
                                           className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right outline-none focus:border-[#00a651]" />
                                       </div>
                                     </div>
                                     <button type="button" onClick={() => removeRow(ii)} className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
                                       <X size={16} />
                                     </button>
                                   </div>
                                 );
                               })}
                               <button type="button" onClick={addRow}
                                 className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-white flex items-center justify-center gap-2">
                                 <Plus size={16} /> Add attribute
                               </button>
                             </div>
                           </div>
                         );
                       })}
                       <button
                         type="button"
                         onClick={() => setFormData({ ...formData, specGroups: [...(formData.specGroups || []), { id: `g_${Date.now()}`, title: '', items: [{ name: '', value: '' }] }] })}
                         className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                       >
                         <Plus size={16} /> Add specification group
                       </button>
                     </div>
                  </div>

                  {/* Key features */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="mb-5">
                       <h3 className="text-lg font-bold text-gray-900">Key features</h3>
                       <p className="text-sm text-gray-500">One bullet per line, in both languages. Keep the lines in the same order so they match up.</p>
                     </div>
                     <BilingualList
                       label="Feature list"
                       rows={7}
                       en={formData.keyFeatures || []}
                       ar={ar.keyFeatures || []}
                       onChange={(v) => { setFormData({ ...formData, keyFeatures: v.en }); setAr({ keyFeatures: v.ar }); }}
                     />
                  </div>

                  {/* Rating breakdown */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="mb-5">
                       <h3 className="text-lg font-bold text-gray-900">Rating breakdown</h3>
                       <p className="text-sm text-gray-500">Percentage bars in the review summary. Leave blank to calculate from the real reviews.</p>
                     </div>
                     <div className="grid grid-cols-5 gap-3">
                       {[5, 4, 3, 2, 1].map((star) => (
                         <div key={star}>
                           <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">{star} stars %</label>
                           <input
                             type="number"
                             min={0}
                             max={100}
                             value={formData.ratingBreakdown?.[star] ?? ''}
                             onChange={(e) => setFormData({
                               ...formData,
                               ratingBreakdown: { ...(formData.ratingBreakdown || {}), [star]: Number(e.target.value) },
                             })}
                             className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00a651]"
                           />
                         </div>
                       ))}
                     </div>
                     <button
                       type="button"
                       onClick={() => { const { ratingBreakdown, ...rest } = formData; setFormData(rest); }}
                       className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                     >
                       Clear and calculate automatically
                     </button>
                  </div>
               </div>
            )}

            {/* Form Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                 <div>
                    {activeStep > 1 && (
                      <button 
                         onClick={() => setActiveStep(activeStep - 1)}
                         className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors shadow-sm flex items-center gap-2 text-md"
                      >
                         Previous
                      </button>
                    )}
                 </div>
                 <div>
                   {activeStep < 6 ? (
                     <button 
                       onClick={() => setActiveStep(activeStep + 1)}
                       className="px-8 py-3 bg-[#00a651] text-white rounded-xl hover:bg-[#008c44] font-bold transition-colors shadow-md shadow-[#00a651]/20 flex items-center gap-2 text-lg transform hover:-translate-y-0.5"
                     >
                        Next <ArrowRight size={20} />
                     </button>
                   ) : (
                     <button 
                       onClick={handleSave}
                       className="px-8 py-3 bg-[#00a651] text-white rounded-xl hover:bg-[#008c44] font-bold transition-colors shadow-md shadow-[#00a651]/20 flex items-center gap-2 text-lg transform hover:-translate-y-0.5"
                     >
                        <CheckCircle2 size={20} /> Save Product
                     </button>
                   )}
                 </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden relative">
       {showSuccess && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#00a651] text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
           <CheckCircle2 size={20} /> Product saved successfully!
         </div>
       )}
       <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] w-full sm:w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                <Filter size={16} /> Filter
             </button>
             <button onClick={handleCreate} className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm shadow-[#00a651]/20">
                <Plus size={16} /> Add Product
             </button>
          </div>
       </div>
       <div className="overflow-x-auto flex-1 p-0">
          <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                   <th className="px-6 py-4 font-semibold">Product</th>
                   <th className="px-6 py-4 font-semibold">Status</th>
                   <th className="px-6 py-4 font-semibold">Inventory</th>
                   <th className="px-6 py-4 font-semibold">Cost</th>
                   <th className="px-6 py-4 font-semibold">Price</th>
                   <th className="px-6 py-4 font-semibold">Profit</th>
                   <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p: any) => (
                   <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center shrink-0">
                               <img src={p.image || undefined} className="max-w-full max-h-full object-contain p-1" alt={p.title} />
                            </div>
                            <div>
                               <div className="font-semibold text-gray-900 text-sm line-clamp-1">{p.title}</div>
                               <div className="text-xs text-gray-500 mt-0.5">{p.code}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         {p.inStock ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                             <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Draft
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                         {p.inStock ? (
                           <span className={Number(p.stock) > 0 && Number(p.stock) <= 5 ? 'text-amber-600' : 'text-gray-700'}>
                             {Number(p.stock) || 0} in stock
                           </span>
                         ) : (
                           <span className="text-gray-400">Out of stock</span>
                         )}
                      </td>

                      {/* Cost + profit are admin-only figures; the storefront never receives them. */}
                      <td className="px-6 py-4">
                         {Number(p.costPrice) > 0 ? (
                           <span className="text-sm font-medium text-gray-700">{money(Number(p.costPrice), currency.code)}</span>
                         ) : (
                           <Tooltip content="No cost price set — this product's sales count as pure profit" position="top">
                             <span className="text-sm text-amber-600 cursor-help">Not set</span>
                           </Tooltip>
                         )}
                      </td>

                      <td className="px-6 py-4">
                         <div className="font-bold text-gray-900 text-sm">${p.price}</div>
                         {p.oldPrice > p.price && <div className="text-xs text-gray-400 line-through">${p.oldPrice}</div>}
                      </td>

                      <td className="px-6 py-4">
                         {(() => {
                           const m = computeMargin(p.price, p.costPrice);
                           if (m.unknown) return <span className="text-sm text-gray-300">—</span>;
                           return (
                             <>
                               <div className={`text-sm font-bold ${m.loss ? 'text-red-600' : 'text-green-700'}`}>
                                 {money(m.profit, currency.code)}
                               </div>
                               <div className={`text-xs ${m.loss ? 'text-red-500' : 'text-gray-400'}`}>
                                 {m.margin.toFixed(1)}% margin
                               </div>
                             </>
                           );
                         })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip content="Edit Product" position="top">
                              <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={18} /></button>
                            </Tooltip>
                            <Tooltip content="Delete Product" position="top">
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </Tooltip>
                         </div>
                      </td>
                   </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  )
}
