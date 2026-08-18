import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Plus, FileText, Search, X, Save, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { BilingualField } from '../../components/admin/BilingualField';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AdminPages() {
  const { pages, addPage, updatePage, deletePage } = useAdmin();
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pages.filter((p: any) => !q || p.title.toLowerCase().includes(q) || p.slug.includes(q));
  }, [pages, search]);

  const startNew = () =>
    setEditing({ id: null, title: '', titleAr: '', slug: '', content: '', contentAr: '', published: true, sort: pages.length });

  const save = async () => {
    if (!editing.title.trim()) { setError('A page title is required.'); return; }
    setBusy(true);
    setError('');
    try {
      const payload = { ...editing, slug: editing.slug.trim() || slugify(editing.title) };
      if (editing.id == null) await addPage(payload);
      else await updatePage(editing.id, payload);
      setEditing(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not save the page.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (page: any) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      await deletePage(page.id);
    } catch (err: any) {
      alert(err?.message ?? 'Could not delete the page.');
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
        <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{editing.id == null ? 'New page' : 'Edit page'}</h2>
          <button onClick={() => setEditing(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-[13px]">{error}</div>
          )}

          <BilingualField
            label="Page title"
            required
            value={{ en: editing.title || '', ar: editing.titleAr || '' }}
            placeholderEn="About Us"
            placeholderAr="من نحن"
            onChange={(v) => setEditing({ ...editing, title: v.en, titleAr: v.ar })}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">URL</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-mono shrink-0">/page/</span>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                onBlur={(e) => setEditing((p: any) => ({ ...p, slug: slugify(e.target.value || p.title) }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:border-[#00a651]"
                placeholder="about-us"
              />
            </div>
            <span className="text-[11px] text-gray-400">Left blank, this is generated from the title.</span>
          </label>

          <BilingualField
            label="Content"
            multiline
            rows={14}
            value={{ en: editing.content || '', ar: editing.contentAr || '' }}
            placeholderEn="Write the page content. Line breaks are preserved."
            placeholderAr="اكتب محتوى الصفحة. يتم الحفاظ على فواصل الأسطر."
            onChange={(v) => setEditing({ ...editing, content: v.en, contentAr: v.ar })}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              className="w-4 h-4 accent-[#00a651]"
            />
            <span className="text-sm text-gray-700">
              Published <span className="text-gray-400">— visible on the storefront and in the Information menu</span>
            </span>
          </label>
        </div>

        <div className="px-8 py-5 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="px-5 py-2.5 bg-[#00a651] text-white rounded-xl hover:bg-[#008c44] font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} /> {busy ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
      <div className="px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pages</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Published pages appear in the header's Information menu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages…"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00a651] w-full sm:w-56"
            />
          </div>
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] font-medium text-sm"
          >
            <Plus size={16} /> Add page
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-500 text-sm">
          {pages.length === 0 ? 'No pages yet. Create your first one.' : 'No pages match that search.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-8 py-4 w-1/4">Title</th>
                <th className="px-8 py-4 w-1/4">URL</th>
                <th className="px-8 py-4">Content</th>
                <th className="px-8 py-4 w-28">Status</th>
                <th className="px-8 py-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((page: any) => (
                <tr key={page.id} className="hover:bg-gray-50/50 group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#00a651]/10 text-[#00a651] flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </span>
                      <span className="font-semibold text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-mono text-sm text-gray-500">
                    <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="hover:text-[#00a651] inline-flex items-center gap-1">
                      /page/{page.slug} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 truncate max-w-[280px]">{page.content || '—'}</td>
                  <td className="px-8 py-4">
                    {page.published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-1">
                        <Eye size={11} /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2 py-1">
                        <EyeOff size={11} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing({ ...page })} className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => remove(page)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
