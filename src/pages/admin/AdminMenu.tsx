import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, GripVertical, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';

export default function AdminMenu() {
  const { menuItems, setMenuItems, megaMenuCategories, setMegaMenuCategories } = useAdmin();
  const [activeTab, setActiveTab] = useState<'header' | 'mega'>('header');
  
  // Basic implementation. True drag-and-drop requires dnd-kit or react-beautiful-dnd, leaving simple for now.

  const addMegaCategory = () => {
     setMegaMenuCategories([...megaMenuCategories, {
        id: `new-${Date.now()}`,
        title: 'New Category',
        subtitle: 'Add subtitle',
        icon: 'LayoutTemplate',
        subcategories: []
     }]);
  };

  const deleteMegaCategory = (id: string) => {
     setMegaMenuCategories(megaMenuCategories.filter((cat: any) => cat.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 -m-8 p-8">
       <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
             <button
               onClick={() => setActiveTab('header')}
               className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'header' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Header Links
             </button>
             <button
               onClick={() => setActiveTab('mega')}
               className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'mega' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Mega Menu
             </button>
          </div>
       </div>

       {activeTab === 'header' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
             <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Header Menu</h2>
                <button className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm shadow-[#00a651]/20">
                   <Plus size={16} /> Add Link
                </button>
             </div>
             <div className="p-0">
                <div className="px-8 py-3 bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold grid flex-1 grid-cols-[auto_1fr_auto_auto] gap-4 items-center">
                   <div className="w-5"></div>
                   <div>Link Details</div>
                   <div className="w-24 text-center">Features</div>
                   <div className="w-20 text-right">Actions</div>
                </div>
                <ul className="divide-y divide-gray-100">
                   {menuItems.map((item: any) => (
                      <li key={item.id} className="flex items-center px-8 py-4 hover:bg-gray-50/50 group transition-colors">
                         <div className="cursor-grab text-gray-400 mr-4 group-hover:text-gray-600">
                            <GripVertical size={20} />
                         </div>
                         <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">{item.link}</div>
                         </div>
                         <div className="w-24 flex items-center justify-center shrink-0">
                            {item.hasMegaMenu && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">Mega Menu</span>}
                         </div>
                         <div className="flex items-center justify-end gap-1 w-20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip content="Edit Link" position="top">
                               <button className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={16} /></button>
                             </Tooltip>
                             <Tooltip content="Delete Link" position="top">
                               <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                             </Tooltip>
                         </div>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
       )}

       {activeTab === 'mega' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
             <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-2xl">
                <div>
                   <h2 className="text-xl font-bold text-gray-900 mb-1">Mega Menu Categories</h2>
                   <p className="text-sm text-gray-500">Manage the complex category structure inside the mega dropdown.</p>
                </div>
                <button onClick={addMegaCategory} className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm shadow-[#00a651]/20">
                   <Plus size={16} /> Add Category
                </button>
             </div>
             <div className="p-0">
                <div className="px-8 py-3 bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold flex gap-4 items-center">
                   <div className="w-5"></div>
                   <div className="flex-1">Category & Details</div>
                   <div className="w-24 text-center">Sub-categories</div>
                   <div className="w-20 text-right">Actions</div>
                </div>
                <ul className="divide-y divide-gray-100">
                   {megaMenuCategories.map((cat: any) => (
                      <li key={cat.id} className="flex items-center px-8 py-4 hover:bg-gray-50/50 group transition-colors">
                         <div className="cursor-grab text-gray-400 mr-4 group-hover:text-gray-600">
                            <GripVertical size={20} />
                         </div>
                         <div className="flex-1 flex flex-col gap-1">
                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                               {cat.title}
                               {cat.badge && <span className="bg-[#ff6200] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">{cat.badge}</span>}
                            </div>
                            <div className="text-xs text-gray-500">{cat.subtitle}</div>
                            <div className="text-xs text-gray-400 mt-1 font-mono">Icon: {cat.icon}</div>
                         </div>
                         <div className="w-24 flex items-center justify-center shrink-0">
                             <span className="font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs">
                                {cat.subcategories?.length || 0}
                             </span>
                         </div>
                         <div className="flex items-center justify-end gap-1 w-20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip content="Edit Category" position="top">
                               <button className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={16} /></button>
                             </Tooltip>
                             <Tooltip content="Delete Category" position="top">
                               <button onClick={() => deleteMegaCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                             </Tooltip>
                         </div>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
       )}
    </div>
  )
}
