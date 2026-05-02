import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Store, Phone, DollarSign, Palette, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings } = useAdmin();
  const [formData, setFormData] = useState(siteSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setSiteSettings(formData);
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name</label>
                     <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" 
                        value={formData.logoText}
                        onChange={e => setFormData({...formData, logoText: e.target.value})}
                        placeholder="e.g. My Awesome Store"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Support Phone</label>
                     <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                           type="text" 
                           className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" 
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           placeholder="e.g. 1-800-555-1234"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency Symbol</label>
                     <div className="relative">
                        <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                           type="text" 
                           className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-mono" 
                           value={formData.currency}
                           onChange={e => setFormData({...formData, currency: e.target.value})}
                           placeholder="$"
                        />
                     </div>
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
                      onChange={e => setFormData({...formData, autoApproveReviews: e.target.checked})}
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
                      onChange={e => setFormData({...formData, requirePurchaseToReview: e.target.checked})}
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
                     <h3 className="font-bold text-gray-900 text-lg">Theme Integration</h3>
                     <p className="text-xs text-gray-500">Appearance and branding</p>
                  </div>
               </div>
               <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  Currently using Tailwind utility classes directly in the components. Change primary colors within your components directly for deep brand customization.
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
