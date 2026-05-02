import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, GripVertical, Check, X, Save } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';

export default function AdminCategories() {
  const { categories, setCategories } = useAdmin();
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleEdit = (category: any) => {
    setIsEditing(category.id);
    setFormData({ ...category });
  };

  const handleAdd = () => {
    setIsEditing(0);
    setFormData({
      id: `new-${Date.now()}`,
      name: 'New Category',
      slug: 'new-category'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((c: any) => c.id !== id));
    }
  };

  const handleSave = () => {
    if (isEditing === 0) {
      setCategories([...categories, formData]);
    } else {
      setCategories(categories.map((c: any) => c.id === formData.id ? formData : c));
    }
    setIsEditing(null);
    setFormData(null);
  };

  if (isEditing !== null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-w-2xl mx-auto">
         <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">{isEditing === 0 ? 'Add Category' : 'Edit Category'}</h2>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
               </button>
               <button onClick={handleSave} className="flex items-center gap-2 bg-[#00a651] text-white px-5 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium shadow-sm">
                  <Save size={18} /> Save
               </button>
            </div>
         </div>
         <div className="p-8">
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                 <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.name} onChange={e => {
                   const newName = e.target.value;
                   setFormData({
                     ...formData, 
                     name: newName,
                     slug: newName.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')
                   });
                 }} />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug URL</label>
                 <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] outline-none transition-all" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                 <p className="text-xs text-gray-500 mt-2">Example: /category/{formData.slug}</p>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
       <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-500">Manage product categories</p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm">
             <Plus size={16} /> Add Category
          </button>
       </div>
       <div className="p-0">
          <div className="px-8 py-3 bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center">
             <div className="w-5"></div>
             <div>Category Name</div>
             <div>Slug URL</div>
             <div className="w-20 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-gray-100">
             {categories.map((category: any, index: number) => (
                <li key={category.id || `cat-${index}`} className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-8 py-4 hover:bg-gray-50/50 group transition-colors">
                   <div className="cursor-grab text-gray-400 group-hover:text-gray-600">
                      <GripVertical size={20} />
                   </div>
                   <div className="font-semibold text-gray-900 text-sm">
                      {category.name}
                   </div>
                   <div className="font-mono text-sm text-gray-500">
                      /category/{category.slug}
                   </div>
                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Tooltip content="Edit Category" position="top">
                         <button onClick={() => handleEdit(category)} className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={16} /></button>
                       </Tooltip>
                       <Tooltip content="Delete Category" position="top">
                         <button onClick={() => handleDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                       </Tooltip>
                   </div>
                </li>
             ))}
          </ul>
       </div>
    </div>
  )
}
