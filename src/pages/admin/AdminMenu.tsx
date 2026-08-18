import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Edit, Trash2, Plus, GripVertical, X, Save, ArrowUp, ArrowDown, ExternalLink,
} from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';
import { BilingualField } from '../../components/admin/BilingualField';
import { tr, toLocalized } from '../../lib/i18n';

const ICONS = ['LayoutTemplate', 'Gem', 'Mic', 'Shirt', 'Dumbbell', 'PenTool', 'Gamepad2', 'List'];

const field =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651]';

/** Small labelled input used across both editors. */
const Field = ({ label, hint, children }: any) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
  </label>
);

function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">{children}</div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#00a651] text-white rounded-xl hover:bg-[#008c44] font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const { menuItems, setMenuItems, megaMenuCategories, setMegaMenuCategories } = useAdmin();
  const [activeTab, setActiveTab] = useState<'header' | 'mega'>('header');
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editingCat, setEditingCat] = useState<any>(null);

  /* ---------------- header links ---------------- */

  const move = (list: any[], setter: (v: any[]) => void, index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[target], next[index]] = [next[index], next[target]];
    setter(next);
  };

  const saveLink = () => {
    if (!toLocalized(editingLink.title).en.trim()) return alert('Enter an English label for the link.');
    const isNew = !menuItems.some((m: any) => m.id === editingLink.id);
    setMenuItems(
      isNew ? [...menuItems, editingLink] : menuItems.map((m: any) => (m.id === editingLink.id ? editingLink : m)),
    );
    setEditingLink(null);
  };

  const deleteLink = (item: any) => {
    if (confirm(`Remove "${tr(item.title, 'en')}" from the header?`)) {
      setMenuItems(menuItems.filter((m: any) => m.id !== item.id));
    }
  };

  /* ---------------- mega menu ---------------- */

  const saveCat = () => {
    if (!toLocalized(editingCat.title).en.trim()) return alert('Enter an English title for the category.');
    const isNew = !megaMenuCategories.some((c: any) => c.id === editingCat.id);
    setMegaMenuCategories(
      isNew
        ? [...megaMenuCategories, editingCat]
        : megaMenuCategories.map((c: any) => (c.id === editingCat.id ? editingCat : c)),
    );
    setEditingCat(null);
  };

  const deleteCat = (cat: any) => {
    if (confirm(`Delete "${tr(cat.title, 'en')}" and its ${cat.subcategories?.length || 0} column(s)?`)) {
      setMegaMenuCategories(megaMenuCategories.filter((c: any) => c.id !== cat.id));
    }
  };

  const patchSub = (index: number, patch: any) => {
    const subs = [...(editingCat.subcategories || [])];
    subs[index] = { ...subs[index], ...patch };
    setEditingCat({ ...editingCat, subcategories: subs });
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Changes save automatically and appear on the storefront.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
          {(['header', 'mega'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'header' ? 'Header Links' : 'Mega Menu'}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Header links ---------------- */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-4xl w-full">
          <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Header menu</h2>
              <p className="text-sm text-gray-500">Links shown in the top bar of every page.</p>
            </div>
            <button
              onClick={() => setEditingLink({ id: `m_${Date.now()}`, title: { en: '', ar: '' }, link: '/', hasMegaMenu: false })}
              className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] font-medium text-sm"
            >
              <Plus size={16} /> Add link
            </button>
          </div>

          {menuItems.length === 0 ? (
            <p className="py-14 text-center text-gray-500 text-sm">No links yet. Add your first one.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {menuItems.map((item: any, index: number) => (
                <li key={item.id} className="flex items-center px-8 py-4 hover:bg-gray-50/50 group">
                  <GripVertical size={18} className="text-gray-300 mr-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{tr(item.title, 'en')}<span className="text-gray-400 font-normal"> · {tr(item.title, 'ar') || '—'}</span></div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono truncate">{item.link}</div>
                  </div>
                  <div className="w-28 flex items-center justify-center shrink-0">
                    {item.hasMegaMenu && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Mega menu
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 shrink-0">
                    <button onClick={() => move(menuItems, setMenuItems, index, -1)} disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-25"><ArrowUp size={15} /></button>
                    <button onClick={() => move(menuItems, setMenuItems, index, 1)} disabled={index === menuItems.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-25"><ArrowDown size={15} /></button>
                    <Tooltip content="Edit link" position="top">
                      <button onClick={() => setEditingLink({ ...item })}
                        className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg"><Edit size={16} /></button>
                    </Tooltip>
                    <Tooltip content="Delete link" position="top">
                      <button onClick={() => deleteLink(item)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------------- Mega menu ---------------- */}
      {activeTab === 'mega' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-4xl w-full">
          <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mega menu categories</h2>
              <p className="text-sm text-gray-500">The department list inside the Categories dropdown.</p>
            </div>
            <button
              onClick={() =>
                setEditingCat({
                  id: `mm_${Date.now()}`, title: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, icon: 'LayoutTemplate',
                  badge: '', badgeColor: 'bg-[#ff6200]', subcategories: [],
                })
              }
              className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl hover:bg-[#008c44] font-medium text-sm"
            >
              <Plus size={16} /> Add category
            </button>
          </div>

          {megaMenuCategories.length === 0 ? (
            <p className="py-14 text-center text-gray-500 text-sm">No categories yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {megaMenuCategories.map((cat: any, index: number) => (
                <li key={cat.id} className="flex items-center px-8 py-4 hover:bg-gray-50/50 group">
                  <GripVertical size={18} className="text-gray-300 mr-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {tr(cat.title, 'en')}<span className="text-gray-400 font-normal"> · {tr(cat.title, 'ar') || '—'}</span>
                      {cat.badge && (
                        <span className="bg-[#ff6200] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">{cat.badge}</span>
                      )}
                    </div>
                    {tr(cat.subtitle, 'en') && <div className="text-xs text-gray-500 mt-0.5 truncate">{tr(cat.subtitle, 'en')}</div>}
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">Icon: {cat.icon}</div>
                  </div>
                  <div className="w-28 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs">
                      {cat.subcategories?.length || 0} column(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-0.5 shrink-0">
                    <button onClick={() => move(megaMenuCategories, setMegaMenuCategories, index, -1)} disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-25"><ArrowUp size={15} /></button>
                    <button onClick={() => move(megaMenuCategories, setMegaMenuCategories, index, 1)} disabled={index === megaMenuCategories.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-25"><ArrowDown size={15} /></button>
                    <Tooltip content="Edit category" position="top">
                      <button onClick={() => setEditingCat(JSON.parse(JSON.stringify(cat)))}
                        className="p-2 text-gray-400 hover:text-[#00a651] hover:bg-[#00a651]/10 rounded-lg"><Edit size={16} /></button>
                    </Tooltip>
                    <Tooltip content="Delete category" position="top">
                      <button onClick={() => deleteCat(cat)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------------- Link editor ---------------- */}
      {editingLink && (
        <Modal
          title={menuItems.some((m: any) => m.id === editingLink.id) ? 'Edit link' : 'Add link'}
          onClose={() => setEditingLink(null)}
          onSave={saveLink}
        >
          <BilingualField
            label="Label"
            required
            value={editingLink.title}
            placeholderEn="Delivery and payment"
            placeholderAr="التوصيل والدفع"
            onChange={(v) => setEditingLink({ ...editingLink, title: v })}
          />
          <Field label="URL" hint="Internal paths like /delivery, /category/1 or /page/about-us.">
            <input className={`${field} font-mono`} value={editingLink.link} placeholder="/delivery"
              onChange={(e) => setEditingLink({ ...editingLink, link: e.target.value })} />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!editingLink.hasMegaMenu} className="w-4 h-4 accent-[#00a651]"
              onChange={(e) => setEditingLink({ ...editingLink, hasMegaMenu: e.target.checked })} />
            <span className="text-sm text-gray-700">
              Opens the mega menu <span className="text-gray-400">— marks this link as the catalogue entry point</span>
            </span>
          </label>
          {editingLink.link && (
            <a href={editingLink.link} target="_blank" rel="noreferrer"
              className="text-[13px] text-[#0058a3] hover:underline inline-flex items-center gap-1.5 w-fit">
              Preview this link <ExternalLink size={13} />
            </a>
          )}
        </Modal>
      )}

      {/* ---------------- Category editor ---------------- */}
      {editingCat && (
        <Modal
          title={megaMenuCategories.some((c: any) => c.id === editingCat.id) ? 'Edit category' : 'Add category'}
          onClose={() => setEditingCat(null)}
          onSave={saveCat}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <BilingualField
                label="Title" required
                value={editingCat.title}
                placeholderEn="Electronics" placeholderAr="إلكترونيات"
                onChange={(v) => setEditingCat({ ...editingCat, title: v })}
              />
            </div>
            <Field label="Icon">
              <select className={field} value={editingCat.icon}
                onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <BilingualField
                label="Subtitle"
                value={editingCat.subtitle}
                placeholderEn="Optional description" placeholderAr="وصف اختياري"
                onChange={(v) => setEditingCat({ ...editingCat, subtitle: v })}
              />
            </div>
            <Field label="Badge" hint="Leave empty for none.">
              <input className={field} value={editingCat.badge || ''} placeholder="NEW"
                onChange={(e) => setEditingCat({ ...editingCat, badge: e.target.value })} />
            </Field>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Columns</h4>
                <p className="text-[11px] text-gray-400">Each column becomes a heading with links beneath it.</p>
              </div>
              <button
                onClick={() =>
                  setEditingCat({
                    ...editingCat,
                    subcategories: [...(editingCat.subcategories || []), { title: 'New column', links: [] }],
                  })
                }
                className="text-sm font-semibold text-[#00a651] hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add column
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {(editingCat.subcategories || []).map((sub: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-[#00a651]"
                      value={sub.title}
                      placeholder="Column heading"
                      onChange={(e) => patchSub(i, { title: e.target.value })}
                    />
                    <button
                      onClick={() =>
                        setEditingCat({
                          ...editingCat,
                          subcategories: editingCat.subcategories.filter((_: any, x: number) => x !== i),
                        })
                      }
                      className="p-2 text-red-400 hover:text-red-600 shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a651] resize-y bg-white"
                    placeholder={'One link per line\nSmartphones\nLaptops'}
                    value={(sub.links || []).map((l: any) => (typeof l === 'string' ? l : l.label)).join('\n')}
                    onChange={(e) =>
                      patchSub(i, {
                        links: e.target.value.split('\n').filter((l) => l.trim()).map((label) => ({ label: label.trim() })),
                      })
                    }
                  />
                </div>
              ))}
              {(editingCat.subcategories || []).length === 0 && (
                <p className="text-[13px] text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                  No columns yet.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
