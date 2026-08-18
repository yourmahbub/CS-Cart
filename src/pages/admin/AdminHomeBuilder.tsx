import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { GripVertical, Eye, EyeOff, Edit, MoveUp, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHomeBuilder() {
  const { homeLayout, setHomeLayout } = useAdmin();

  const toggleVisibility = (id: string) => {
    setHomeLayout(homeLayout.map((item: any) => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === homeLayout.length - 1)) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newLayout = [...homeLayout];
    
    const temp = newLayout[index];
    newLayout[index] = newLayout[newIndex];
    newLayout[newIndex] = temp;
    
    setHomeLayout(newLayout);
  };

  // Each section points at whatever actually owns its content. Sections whose
  // content is not catalogue-driven get the dedicated content editor.
  const getEditLink = (type: string) => {
    switch (type) {
      case 'hero_slider': return '/admin/sliders';
      case 'categories': return '/admin/home-sections?tab=categories';
      case 'featured_products': return '/admin/products';
      case 'popular_products': return '/admin/products';
      case 'promo_banners': return '/admin/home-sections?tab=promo';
      case 'features': return '/admin/home-sections?tab=features';
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-w-4xl mx-auto my-6">
       <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Home Page Builder</h2>
            <p className="text-sm text-gray-500 mt-1">Reorder and toggle sections displayed on the storefront home page.</p>
          </div>
       </div>
       <div className="p-8">
          <div className="space-y-4">
             {homeLayout.map((section: any, index: number) => {
                const editLink = getEditLink(section.type);
                
                return (
                  <div 
                    key={section.id} 
                    className={`flex items-center p-5 rounded-2xl border transition-all ${
                      section.visible 
                        ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300' 
                        : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                     <div className="flex flex-col gap-1 mr-4">
                        <button 
                          onClick={() => moveItem(index, 'up')} 
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-[#00a651] disabled:opacity-30 disabled:hover:text-gray-400 rounded transition-colors"
                        >
                          <MoveUp size={18} />
                        </button>
                        <button 
                          onClick={() => moveItem(index, 'down')} 
                          disabled={index === homeLayout.length - 1}
                          className="p-1 text-gray-400 hover:text-[#00a651] disabled:opacity-30 disabled:hover:text-gray-400 rounded transition-colors"
                        >
                          <MoveDown size={18} />
                        </button>
                     </div>
                     <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg flex items-center gap-3">
                          {section.title}
                          {!section.visible && <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-md font-medium">Hidden</span>}
                        </div>
                        <div className="text-sm text-gray-500 font-mono mt-1">Type: {section.type}</div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        {editLink && (
                          <Link to={editLink} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium text-sm transition-colors border border-gray-200">
                            <Edit size={16} /> Edit Content
                          </Link>
                        )}
                        <button 
                          onClick={() => toggleVisibility(section.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors border ${
                            section.visible 
                              ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50' 
                              : 'bg-[#00a651]/10 text-[#00a651] border-[#00a651]/20 hover:bg-[#00a651]/20'
                          }`}
                        >
                          {section.visible ? <><EyeOff size={16} /> Hide Section</> : <><Eye size={16} /> Show Section</>}
                        </button>
                     </div>
                  </div>
                )
             })}
          </div>
       </div>
    </div>
  )
}
