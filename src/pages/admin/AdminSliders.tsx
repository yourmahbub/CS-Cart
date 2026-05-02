import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, GripVertical, Check, X, Upload, Save, MoveLeft, MoveRight, Layers, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';

export default function AdminSliders() {
  const { sliders, setSliders } = useAdmin();
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleEdit = (slider: any) => {
    setIsEditing(slider.id);
    setFormData({ ...slider });
  };

  const handleAdd = () => {
    setIsEditing(0);
    setFormData({
      id: `new-${Date.now()}`,
      image: '',
      title: 'New Slide Title',
      subtitle: 'Add a catching subtitle here',
      buttonText: 'Shop Now',
      link: '/',
      align: 'left',
      overlayOpacity: 50
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      setSliders(sliders.filter((s: any) => s.id !== id));
    }
  };

  const handleSave = () => {
    if (isEditing === 0) {
      setSliders([...sliders, formData]);
    } else {
      setSliders(sliders.map((s: any) => s.id === formData.id ? formData : s));
    }
    setIsEditing(null);
    setFormData(null);
  };

  const moveSlide = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;
    
    const newSliders = [...sliders];
    const temp = newSliders[index];
    newSliders[index] = newSliders[newIndex];
    newSliders[newIndex] = temp;
    
    setSliders(newSliders);
  };

  if (isEditing !== null) {
    return (
      <div className="bg-gray-50/50 flex flex-col -m-8 min-h-[calc(100vh-64px)]">
         <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
               <Tooltip content="Back to Sliders" position="bottom">
                 <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <X size={20} />
                 </button>
               </Tooltip>
               <div>
                 <h2 className="text-xl font-bold text-gray-900 leading-tight">{isEditing === 0 ? 'Create New Slide' : 'Edit Slide'}</h2>
                 <p className="text-sm text-gray-500">{isEditing === 0 ? 'Design your new hero slider' : 'Update your existing slider content'}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsEditing(null)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
               </button>
               <button onClick={handleSave} className="flex items-center gap-2 bg-[#00a651] text-white px-6 py-2.5 rounded-xl hover:bg-[#008c44] transition-colors font-medium shadow-sm shadow-[#00a651]/20">
                  <Save size={18} /> {isEditing === 0 ? 'Create Slide' : 'Save Changes'}
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto flex gap-8">
               
               {/* Left Column - Form Controls */}
               <div className="w-[450px] shrink-0 flex flex-col gap-6">
                 
                 {/* Image Settings */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-3">
                     <ImageIcon size={18} className="text-[#00a651]" /> Slide Image
                   </div>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL</label>
                       <div className="flex gap-2">
                         <input type="text" placeholder="https://..." className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                       </div>
                     </div>
                     {!formData.image && (
                       <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group">
                           <Upload size={28} className="text-gray-400 mb-2 group-hover:text-[#00a651] transition-colors" />
                           <p className="text-sm font-medium text-gray-900">Click to upload or drag & drop</p>
                           <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 1920x1080px)</p>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Content Settings */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-3">
                     <Type size={18} className="text-[#00a651]" /> Text Content
                   </div>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slide Title</label>
                       <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle / Description</label>
                       <textarea rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all resize-none" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                     </div>
                   </div>
                 </div>

                 {/* Action Settings */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-3">
                     <LinkIcon size={18} className="text-[#00a651]" /> Action Button
                   </div>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Label</label>
                       <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Link Destination</label>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">/</span>
                         <input type="text" className="w-full border border-gray-300 rounded-xl pl-6 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all font-mono" value={formData.link.replace(/^\//,'')} onChange={e => setFormData({...formData, link: '/' + e.target.value})} />
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Design Settings */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-3">
                     <Layers size={18} className="text-[#00a651]" /> Design & Layout
                   </div>
                   <div className="space-y-6">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-3">Text Alignment</label>
                       <div className="flex gap-3">
                         {['left', 'center', 'right'].map((alignOpt) => (
                            <button 
                               key={alignOpt}
                               onClick={() => setFormData({...formData, align: alignOpt})}
                               className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                                 formData.align === alignOpt || (!formData.align && alignOpt === 'left')
                                 ? 'bg-[#00a651]/10 border-[#00a651] text-[#00a651]' 
                                 : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                               }`}
                            >
                               {alignOpt.charAt(0).toUpperCase() + alignOpt.slice(1)}
                            </button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                          Overlay Opacity
                          <span className="text-[#00a651]">{formData.overlayOpacity ?? 50}%</span>
                       </label>
                       <input 
                         type="range" 
                         min="0" 
                         max="100" 
                         value={formData.overlayOpacity ?? 50} 
                         onChange={e => setFormData({...formData, overlayOpacity: Number(e.target.value)})}
                         className="w-full accent-[#00a651]"
                       />
                     </div>
                   </div>
                 </div>

               </div>

               {/* Right Column - Live Preview */}
               <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                     <Layers size={18} className="text-[#00a651]" /> Live Canvas Preview
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex-1 flex flex-col overflow-hidden items-center justify-center min-h-[500px]">
                     {/* Scale down slightly to fit within the editor view */}
                     <div className="w-[1200px] h-[540px] origin-top-left " style={{ transform: 'scale(Math.min((window.innerWidth - 600) / 1200, 1))', zoom: 0.7 }}>
                        {/* THE HERO COMPONENT REPLICA */}
                        <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                          {formData.image ? (
                             <img src={formData.image || undefined} alt={formData.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                          ) : (
                             <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">No Image Provided</div>
                          )}
                          <div 
                             className="absolute inset-0 bg-black transition-opacity duration-300 z-10" 
                             style={{ opacity: (formData.overlayOpacity ?? 50) / 100 }} 
                          />
                          
                          <div className={`relative z-20 h-full flex items-center px-16 lg:px-24 w-full ${
                             formData.align === 'center' ? 'justify-center text-center' : 
                             formData.align === 'right' ? 'justify-end text-right' : 
                             'justify-start text-left'
                          }`}>
                            <div className={`flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[800px] ${
                               formData.align === 'center' ? 'items-center' : 
                               formData.align === 'right' ? 'items-end' : 
                               'items-start'
                            }`}>
                              {formData.title && (
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-md">
                                  {formData.title.split('\n').map((line: string, i: number) => (
                                    <React.Fragment key={i}>
                                      {line}
                                      <br />
                                    </React.Fragment>
                                  ))}
                                </h1>
                              )}
                              {formData.subtitle && (
                                <p className="text-lg md:text-xl text-gray-200 font-medium max-w-[500px] leading-relaxed drop-shadow">
                                  {formData.subtitle}
                                </p>
                              )}
                              {(formData.buttonText || formData.link) && (
                                <div className="mt-4 px-8 py-4 bg-[#00a651] text-white rounded-full font-bold text-lg hover:bg-[#008c44] transition-all transform hover:scale-105 shadow-[0_4px_14px_0_rgba(0,166,81,0.39)] cursor-pointer">
                                  {formData.buttonText || 'Shop Now'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
       <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hero Slider Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the main hero banner images and text at the top of your homepage.</p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-[#00a651] text-white px-5 py-2.5 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm shadow-[#00a651]/20">
             <Plus size={18} /> Add Slide
          </button>
       </div>
       <div className="p-8 bg-gray-50/50 flex-1">
          {sliders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                 <ImageIcon size={48} className="text-gray-300 mb-4" />
                 <h3 className="text-lg font-bold text-gray-900 mb-2">No sliders found</h3>
                 <p className="text-gray-500 max-w-sm mb-6">Create your first hero banner slide to engage your customers.</p>
                 <button onClick={handleAdd} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm">
                    <Plus size={16} /> Add First Slide
                 </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {sliders.map((slider: any, index: number) => (
                <div key={slider.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-md transition-all hover:border-[#00a651]/50 flex">
                    {/* Left side preview */}
                    <div className="relative w-64 h-full min-h-[180px] bg-gray-100 border-r border-gray-100 shrink-0">
                      {slider.image ? (
                        <img src={slider.image || undefined} alt={slider.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                           <ImageIcon size={32} className="opacity-50 mb-2" />
                           <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 text-xs rounded-lg font-bold shadow-sm border border-black/5">Slide {index + 1}</div>
                      
                      {/* Left/Right Reordering Controls overlaid on preview image */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-black/10">
                        <Tooltip content="Move Left" position="top">
                          <button 
                            onClick={() => moveSlide(index, 'left')} 
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                          ><MoveLeft size={16}/></button>
                        </Tooltip>
                        <Tooltip content="Move Right" position="top">
                          <button 
                            onClick={() => moveSlide(index, 'right')} 
                            disabled={index === sliders.length - 1}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                          ><MoveRight size={16}/></button>
                        </Tooltip>
                      </div>
                    </div>
                    
                    {/* Right side editing quick info */}
                    <div className="p-5 flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg truncate flex-1">{slider.title || 'Untitled Slide'}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Tooltip content="Edit Slide">
                            <button onClick={() => handleEdit(slider)} className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={16} /></button>
                          </Tooltip>
                          <Tooltip content="Delete Slide">
                            <button onClick={() => handleDelete(slider.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </Tooltip>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{slider.subtitle}</p>
                      
                      <div className="mt-auto grid grid-cols-2 gap-3">
                          <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 px-3 py-2.5">
                              <span className="font-semibold text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Button Text</span>
                              <span className="text-gray-900 font-medium text-sm truncate">{slider.buttonText || '-'}</span>
                          </div>
                          <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 px-3 py-2.5">
                              <span className="font-semibold text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Link Destination</span>
                              <span className="text-[#00a651] font-medium text-sm truncate font-mono">{slider.link || '-'}</span>
                          </div>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          )}
       </div>
    </div>
  )
}

