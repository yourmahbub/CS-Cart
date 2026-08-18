import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { LayoutBlock, BlockType, PageTemplate, BLOCK_LIBRARY } from '../../types/template';
import { GripVertical, Eye, EyeOff, Settings, Plus, X, ArrowUp, ArrowDown, Globe, RotateCcw, ExternalLink } from 'lucide-react';

const REGIONS: { key: keyof PageTemplate; title: string; hint: string }[] = [
  { key: 'leftColumn', title: 'Left Column — Media', hint: 'Gallery and anything beside it' },
  { key: 'middleColumn', title: 'Middle Column — Details', hint: 'Title, options, services' },
  { key: 'rightSidebar', title: 'Right Sidebar — Buy Box', hint: 'Sticky. Price, cart, delivery' },
  { key: 'mainContent', title: 'Main Content — under gallery, beside sidebar', hint: 'Specs, description, reviews' },
  { key: 'bottomContent', title: 'Bottom — full page width', hint: 'Related products, banners' },
];

export function AdminPageBuilder() {
  const { productTemplate, setProductTemplate, resetProductTemplate, products, updateProduct } = useAdmin();
  const [editingBlock, setEditingBlock] = useState<{ region: keyof PageTemplate; index: number; block: LayoutBlock } | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | 'global'>('global');
  const [dragInfo, setDragInfo] = useState<{ region: keyof PageTemplate; index: number } | null>(null);

  const currentProduct = selectedProductId === 'global' ? null : products.find((p: any) => p.id === selectedProductId);
  const currentTemplate: PageTemplate = currentProduct?.pageTemplateOverride || productTemplate;

  const handleSetTemplate = (newTemplate: PageTemplate) => {
    if (selectedProductId === 'global') {
      setProductTemplate(newTemplate);
    } else if (currentProduct) {
      updateProduct(selectedProductId as number, { ...currentProduct, pageTemplateOverride: newTemplate });
    }
  };

  const listOf = (key: keyof PageTemplate): LayoutBlock[] => (currentTemplate as any)[key] || [];

  const mutate = (key: keyof PageTemplate, fn: (list: LayoutBlock[]) => LayoutBlock[]) => {
    handleSetTemplate({ ...currentTemplate, [key]: fn([...listOf(key)]) } as PageTemplate);
  };

  const moveBlock = (key: keyof PageTemplate, index: number, dir: 'up' | 'down') =>
    mutate(key, (list) => {
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return list;
      [list[target], list[index]] = [list[index], list[target]];
      return list;
    });

  const toggleVisibility = (key: keyof PageTemplate, index: number) =>
    mutate(key, (list) => {
      list[index] = { ...list[index], enabled: !list[index].enabled };
      return list;
    });

  const removeBlock = (key: keyof PageTemplate, index: number) =>
    mutate(key, (list) => { list.splice(index, 1); return list; });

  const addBlock = (key: keyof PageTemplate, type: BlockType) =>
    mutate(key, (list) => [
      ...list,
      {
        id: `${type}_${Date.now()}`,
        type,
        enabled: true,
        settings:
          type === 'custom_html' ? { html: '<div>Custom content</div>' }
          : type === 'faq' ? { faqs: [] }
          : {},
      },
    ]);

  const handleDrop = (e: React.DragEvent, targetRegion: keyof PageTemplate, targetIndex: number) => {
    e.preventDefault();
    if (!dragInfo) return;
    const { region: src, index: srcIdx } = dragInfo;
    if (src === targetRegion && srcIdx === targetIndex) return;

    const next: any = { ...currentTemplate };
    const srcList = [...listOf(src)];
    const [moved] = srcList.splice(srcIdx, 1);
    if (src === targetRegion) {
      srcList.splice(targetIndex > srcIdx ? targetIndex - 1 : targetIndex, 0, moved);
      next[src] = srcList;
    } else {
      const tgtList = [...listOf(targetRegion)];
      tgtList.splice(targetIndex, 0, moved);
      next[src] = srcList;
      next[targetRegion] = tgtList;
    }
    handleSetTemplate(next);
    setDragInfo(null);
  };

  const saveSettings = () => {
    if (!editingBlock) return;
    const { region, index, block } = editingBlock;
    mutate(region, (list) => { list[index] = block; return list; });
    setEditingBlock(null);
  };

  const patchSettings = (patch: any) =>
    setEditingBlock((prev) =>
      prev ? { ...prev, block: { ...prev.block, settings: { ...prev.block.settings, ...patch } } } : prev,
    );

  const RegionBuilder = ({ title, hint, regionKey }: { title: string; hint: string; regionKey: keyof PageTemplate }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col">
      <div className="mb-3">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        <p className="text-[11px] text-gray-500">{hint}</p>
      </div>
      <div
        className="flex-1 flex flex-col gap-2 min-h-[80px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, regionKey, listOf(regionKey).length)}
      >
        {listOf(regionKey).map((block, index) => {
          const info = BLOCK_LIBRARY.find((b) => b.type === block.type);
          return (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDragInfo({ region: regionKey, index })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); handleDrop(e, regionKey, index); }}
              className={`bg-white border rounded-lg p-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow border-gray-200 ${
                !block.enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="text-gray-300 w-4 h-4 shrink-0" />
                <span className="font-medium text-[13px] text-gray-800 truncate">{info?.name || block.type}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => toggleVisibility(regionKey, index)} className="p-1 text-gray-400 hover:text-gray-900" title="Show / hide">
                  {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingBlock({ region: regionKey, index, block: JSON.parse(JSON.stringify(block)) })}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Block settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => moveBlock(regionKey, index, 'up')} className="p-1 text-gray-400 hover:text-gray-900"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveBlock(regionKey, index, 'down')} className="p-1 text-gray-400 hover:text-gray-900"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => removeBlock(regionKey, index)} className="p-1 text-red-400 hover:text-red-600" title="Remove"><X className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {listOf(regionKey).length === 0 && (
          <div className="text-center text-gray-400 text-[12px] py-4 border-2 border-dashed border-gray-200 rounded-lg">
            Drop blocks here
          </div>
        )}
      </div>
      <select
        className="mt-3 w-full text-[13px] border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
        onChange={(e) => { if (e.target.value) { addBlock(regionKey, e.target.value as BlockType); e.target.value = ''; } }}
        defaultValue=""
      >
        <option value="" disabled>+ Add block…</option>
        {BLOCK_LIBRARY.map((b) => <option key={b.type} value={b.type}>{b.name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      {/* Block settings modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">
                {BLOCK_LIBRARY.find((b) => b.type === editingBlock.block.type)?.name || 'Block'} settings
              </h2>
              <button onClick={() => setEditingBlock(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">
              {BLOCK_LIBRARY.find((b) => b.type === editingBlock.block.type)?.description}
            </p>

            <div className="flex-1 overflow-y-auto min-h-[80px] pr-1">
              {editingBlock.block.type === 'custom_html' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">HTML content</span>
                  <textarea
                    className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm font-mono"
                    value={editingBlock.block.settings?.html || ''}
                    onChange={(e) => patchSettings({ html: e.target.value })}
                  />
                </label>
              )}

              {editingBlock.block.type === 'countdown' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Offer text</span>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={editingBlock.block.settings?.text || ''}
                    onChange={(e) => patchSettings({ text: e.target.value })}
                  />
                </label>
              )}

              {editingBlock.block.type === 'stock_indicator' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Text (leave empty to use live stock)</span>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={editingBlock.block.settings?.text || ''}
                    onChange={(e) => patchSettings({ text: e.target.value })}
                  />
                </label>
              )}

              {editingBlock.block.type === 'shipping_info' && (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">Title</span>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editingBlock.block.settings?.title || ''}
                      onChange={(e) => patchSettings({ title: e.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">Text</span>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editingBlock.block.settings?.text || ''}
                      onChange={(e) => patchSettings({ text: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {editingBlock.block.type === 'faq' && (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">Section title</span>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editingBlock.block.settings?.title || ''}
                      placeholder="Frequently asked questions"
                      onChange={(e) => patchSettings({ title: e.target.value })}
                    />
                  </label>
                  {(editingBlock.block.settings?.faqs || []).map((faq: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 relative">
                      <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium pr-8"
                        value={faq.q}
                        placeholder="Question"
                        onChange={(e) => {
                          const faqs = [...editingBlock.block.settings.faqs];
                          faqs[i] = { ...faqs[i], q: e.target.value };
                          patchSettings({ faqs });
                        }}
                      />
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        rows={2}
                        value={faq.a}
                        placeholder="Answer"
                        onChange={(e) => {
                          const faqs = [...editingBlock.block.settings.faqs];
                          faqs[i] = { ...faqs[i], a: e.target.value };
                          patchSettings({ faqs });
                        }}
                      />
                      <button
                        onClick={() => {
                          const faqs = [...editingBlock.block.settings.faqs];
                          faqs.splice(i, 1);
                          patchSettings({ faqs });
                        }}
                        className="absolute right-2 top-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => patchSettings({ faqs: [...(editingBlock.block.settings?.faqs || []), { q: 'New question', a: 'Answer…' }] })}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add FAQ
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-1.5 mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Visibility condition</span>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={editingBlock.block.settings?.visibilityRule || ''}
                  onChange={(e) => patchSettings({ visibilityRule: e.target.value })}
                >
                  <option value="">Always show</option>
                  <option value="low_stock">Only when stock is low (&lt; 10)</option>
                  <option value="has_discount">Only when the product is discounted</option>
                  <option value="in_stock">Only when in stock</option>
                  <option value="out_of_stock">Only when out of stock</option>
                </select>
                <p className="text-[11px] text-gray-500">Hide this block dynamically based on the product.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => setEditingBlock(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveSettings} className="px-4 py-2 text-sm font-medium text-white bg-[#00a651] rounded-lg hover:bg-[#008c44]">
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Page Builder</h1>
          <p className="text-gray-500 text-sm">
            Arrange, hide and configure every block of the product page. Content for those blocks lives in{' '}
            <span className="font-medium">Product Page Settings</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1.5">
            <button
              onClick={() => setSelectedProductId('global')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${
                selectedProductId === 'global' ? 'bg-[#00a651] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4" /> Global
            </button>
            <select
              className={`text-sm border-0 rounded-md font-medium cursor-pointer outline-none max-w-[220px] ${
                selectedProductId !== 'global' ? 'text-[#00a651]' : 'text-gray-600'
              }`}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value === 'global' ? 'global' : Number(e.target.value))}
            >
              <option value="global">Override a product…</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          {selectedProductId !== 'global' ? (
            <button
              onClick={() => {
                updateProduct(selectedProductId as number, { ...currentProduct, pageTemplateOverride: undefined });
                setSelectedProductId('global');
              }}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Remove override
            </button>
          ) : (
            <button
              onClick={() => { if (confirm('Reset the global layout to the default template?')) resetProductTemplate(); }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset layout
            </button>
          )}

          <a
            href={`/product/${selectedProductId === 'global' ? products[0]?.id : selectedProductId}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#0058a3] hover:underline flex items-center gap-1.5"
          >
            Preview <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start mb-5">
        {REGIONS.slice(0, 3).map((r) => <RegionBuilder key={r.key} title={r.title} hint={r.hint} regionKey={r.key} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {REGIONS.slice(3).map((r) => <RegionBuilder key={r.key} title={r.title} hint={r.hint} regionKey={r.key} />)}
      </div>
    </div>
  );
}
