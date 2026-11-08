import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, FileText, Search } from 'lucide-react';

export default function AdminPages() {
  const { pages } = useAdmin();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-w-5xl mx-auto my-6">
       <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Static Pages</h2>
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search pages..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] w-full sm:w-64"
                />
             </div>
             <button className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] transition-colors font-medium text-sm shadow-sm shadow-[#00a651]/20">
                <Plus size={16} /> Add Page
             </button>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                   <th className="px-8 py-4 font-semibold w-1/4">Page Title</th>
                   <th className="px-8 py-4 font-semibold w-1/4">URL Path</th>
                   <th className="px-8 py-4 font-semibold">Content Snippet</th>
                   <th className="px-8 py-4 text-right font-semibold w-24">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {pages.map((page: any) => (
                   <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-[#00a651]/10 text-[#00a651] flex items-center justify-center shrink-0">
                              <FileText size={16} />
                           </div>
                           <span className="font-semibold text-gray-900">{page.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 font-mono text-sm text-gray-500 hover:text-[#00a651] cursor-pointer transition-colors">/{page.slug}</td>
                      <td className="px-8 py-4 text-sm text-gray-500 truncate max-w-[300px]">{page.content}</td>
                      <td className="px-8 py-4 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  )
}
