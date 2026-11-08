import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { LayoutBlock, BlockType, PageTemplate } from '../../types/template';
import { GripVertical, Eye, EyeOff, Settings, Plus, X, ArrowUp, ArrowDown, Globe } from 'lucide-react';

const availableBlocks: { type: BlockType; name: string }[] = [
  { type: 'gallery', name: 'Product Gallery' },
  { type: 'title_price', name: 'Title & Price' },
  { type: 'short_description', name: 'Short Description' },
  { type: 'full_description', name: 'Full Description' },
  { type: 'features', name: 'Features List' },
  { type: 'faq', name: 'FAQ Section' },
  { type: 'reviews', name: 'Reviews' },
  { type: 'countdown', name: 'Countdown Timer' },
  { type: 'stock_indicator', name: 'Stock Indicator' },
  { type: 'shipping_info', name: 'Shipping Info' },
  { type: 'warranty', name: 'Warranty Option' },
  { type: 'add_to_cart', name: 'Add to Cart / Actions' },
  { type: 'variants', name: 'Product Variants' },
  { type: 'custom_html', name: 'Custom HTML Block' },
  { type: 'related_products', name: 'Related Products' },
];

export function AdminPageBuilder() {
  const { productTemplate, setProductTemplate, products, updateProduct } = useAdmin();
  const [editingBlock, setEditingBlock] = useState<{ region: keyof PageTemplate, index: number, block: LayoutBlock } | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | 'global'>('global');

  const currentProduct = selectedProductId === 'global' ? null : products.find((p: any) => p.id === selectedProductId);
  const currentTemplate = currentProduct?.pageTemplateOverride || productTemplate;

  const handleSetTemplate = (newTemplate: PageTemplate) => {
    if (selectedProductId === 'global') {
      setProductTemplate(newTemplate);
    } else if (currentProduct) {
      updateProduct(selectedProductId, { ...currentProduct, pageTemplateOverride: newTemplate });
    }
  };

  const moveBlock = (regionKey: keyof PageTemplate, index: number, direction: 'up' | 'down') => {
    const newTemplate = { ...currentTemplate };
    const list = [...newTemplate[regionKey]];
    if (direction === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index + 1], list[index]] = [list[index], list[index + 1]];
    }
    newTemplate[regionKey] = list;
    handleSetTemplate(newTemplate);
  };

  const toggleVisibility = (regionKey: keyof PageTemplate, index: number) => {
    const newTemplate = { ...currentTemplate };
    const list = [...newTemplate[regionKey]];
    list[index].enabled = !list[index].enabled;
    newTemplate[regionKey] = list;
    handleSetTemplate(newTemplate);
  };

  const removeBlock = (regionKey: keyof PageTemplate, index: number) => {
    const newTemplate = { ...currentTemplate };
    const list = [...newTemplate[regionKey]];
    list.splice(index, 1);
    newTemplate[regionKey] = list;
    handleSetTemplate(newTemplate);
  };

  const addBlock = (regionKey: keyof PageTemplate, type: BlockType) => {
    const newTemplate = { ...currentTemplate };
    const list = [...newTemplate[regionKey]];
    list.push({
      id: type + '_' + Date.now(),
      type,
      enabled: true,
      settings: type === 'custom_html' ? { html: '<div>Custom content</div>' } : {}
    });
    newTemplate[regionKey] = list;
    handleSetTemplate(newTemplate);
  };

  // Drag and drop state
  const [dragInfo, setDragInfo] = useState<{ region: keyof PageTemplate, index: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, region: keyof PageTemplate, index: number) => {
    setDragInfo({ region, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetRegion: keyof PageTemplate, targetIndex: number) => {
    e.preventDefault();
    if (!dragInfo) return;

    const { region: sourceRegion, index: sourceIndex } = dragInfo;
    
    if (sourceRegion === targetRegion && sourceIndex === targetIndex) return;

    const newTemplate = { ...currentTemplate };
    const sourceList = [...newTemplate[sourceRegion]];
    const targetList = sourceRegion === targetRegion ? sourceList : [...newTemplate[targetRegion]];

    const [movedItem] = sourceList.splice(sourceIndex, 1);

    if (sourceRegion === targetRegion) {
      targetList.splice(targetIndex, 0, movedItem);
      newTemplate[sourceRegion] = targetList;
    } else {
      targetList.splice(targetIndex, 0, movedItem);
      newTemplate[sourceRegion] = sourceList;
      newTemplate[targetRegion] = targetList;
    }

    handleSetTemplate(newTemplate);
    setDragInfo(null);
  };

  const RegionBuilder = ({ title, regionKey }: { title: string, regionKey: keyof PageTemplate }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col h-full">
      <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
      <div 
        className="flex-1 flex flex-col gap-2 min-h-[150px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, regionKey, currentTemplate[regionKey].length)}
      >
        {currentTemplate[regionKey].map((block: any, index: number) => {
          const bInfo = availableBlocks.find(b => b.type === block.type) || { name: block.type };
          return (
            <div 
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, regionKey, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(e, regionKey, index);
              }}
              className={`bg-white border rounded-lg p-3 flex items-center justify-between cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${!block.enabled ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="text-gray-400 w-5 h-5" />
                <span className="font-medium text-sm text-gray-800">{bInfo.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleVisibility(regionKey, index)} className="p-1 text-gray-500 hover:text-gray-900" title="Toggle visibility">
                  {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditingBlock({ region: regionKey, index, block: JSON.parse(JSON.stringify(block)) })} className="p-1 text-blue-500 hover:text-blue-700" title="Edit block settings">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button onClick={() => moveBlock(regionKey, index, 'up')} className="p-1 text-gray-500 hover:text-gray-900"><ArrowUp className="w-4 h-4"/></button>
                <button onClick={() => moveBlock(regionKey, index, 'down')} className="p-1 text-gray-500 hover:text-gray-900"><ArrowDown className="w-4 h-4"/></button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button onClick={() => removeBlock(regionKey, index)} className="p-1 text-red-500 hover:text-red-700" title="Remove block">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {currentTemplate[regionKey].length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg">
            Drag items here
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <select 
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={(e) => {
            if (e.target.value) {
              addBlock(regionKey, e.target.value as BlockType);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>+ Add Section...</option>
          {availableBlocks.map(b => (
            <option key={b.type} value={b.type}>{b.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const handleSaveSettings = () => {
    if (!editingBlock) return;
    const { region, index, block } = editingBlock;
    const newTemplate = { ...currentTemplate };
    const list = [...newTemplate[region]];
    list[index] = block;
    newTemplate[region] = list;
    handleSetTemplate(newTemplate);
    setEditingBlock(null);
  };

  return (
    <div className="p-6">
      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Settings</h2>
              <button onClick={() => setEditingBlock(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[100px]">
              {editingBlock.block.type === 'custom_html' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">HTML Content</label>
                  <textarea 
                    className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-green-500 focus:border-green-500"
                    value={editingBlock.block.settings?.html || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, html: e.target.value } } })}
                    placeholder="<div>Your HTML here</div>"
                  />
                </div>
              )}
              {editingBlock.block.type === 'countdown' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Offer Text</label>
                  <input
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={editingBlock.block.settings?.text || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, text: e.target.value } } })}
                    placeholder="Limited time offer!"
                  />
                </div>
              )}
              {editingBlock.block.type === 'faq' && (
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-medium text-gray-700">FAQ Items</label>
                  {(editingBlock.block.settings?.faqs || []).map((faq: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 relative">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium"
                        value={faq.q}
                        onChange={(e) => {
                          const newFaqs = [...(editingBlock.block.settings?.faqs || [])];
                          newFaqs[i].q = e.target.value;
                          setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, faqs: newFaqs } } });
                        }}
                        placeholder="Question"
                      />
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        value={faq.a}
                        onChange={(e) => {
                          const newFaqs = [...(editingBlock.block.settings?.faqs || [])];
                          newFaqs[i].a = e.target.value;
                          setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, faqs: newFaqs } } });
                        }}
                        placeholder="Answer"
                        rows={2}
                      />
                      <button 
                        onClick={() => {
                          const newFaqs = [...(editingBlock.block.settings?.faqs || [])];
                          newFaqs.splice(i, 1);
                          setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, faqs: newFaqs } } });
                        }}
                        className="absolute right-2 top-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFaqs = [...(editingBlock.block.settings?.faqs || []), { q: 'New Question', a: 'Answer...' }];
                      setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, faqs: newFaqs } } });
                    }}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add FAQ
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700">Visibility Condition</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  value={editingBlock.block.settings?.visibilityRule || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, block: { ...editingBlock.block, settings: { ...editingBlock.block.settings, visibilityRule: e.target.value } } })}
                >
                  <option value="">Always show</option>
                  <option value="low_stock">Show only if stock is low (&lt; 10)</option>
                  <option value="has_discount">Show only if product has a discount</option>
                </select>
                <p className="text-[12px] text-gray-500 mt-1">Hide this block dynamically based on product attributes.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Page Builder</h1>
          <p className="text-gray-500 text-sm">Design the layout structure using modular blocks.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
             <button 
               onClick={() => setSelectedProductId('global')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${selectedProductId === 'global' ? 'bg-[#00a651] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <Globe className="w-4 h-4" /> Global Template
             </button>
             <div className="w-px h-5 bg-gray-200"></div>
             <select
               className={`text-sm border-0 rounded-md font-medium cursor-pointer outline-none focus:ring-0 ${selectedProductId !== 'global' ? 'text-[#00a651]' : 'text-gray-600'}`}
               value={selectedProductId}
               onChange={(e) => setSelectedProductId(e.target.value === 'global' ? 'global' : Number(e.target.value))}
             >
               <option value="global" disabled>Override for product...</option>
               {products.map((p: any) => (
                 <option key={p.id} value={p.id}>{p.title}</option>
               ))}
             </select>
          </div>
          {selectedProductId !== 'global' && (
            <button 
              onClick={() => {
                 updateProduct(selectedProductId, { ...currentProduct, pageTemplateOverride: undefined });
                 setSelectedProductId('global');
              }}
              className="text-sm font-medium text-red-600 hover:text-red-700 underline px-2"
            >
              Reset to Global
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <RegionBuilder title="Left Column (Media)" regionKey="leftColumn" />
          <RegionBuilder title="Middle Column (Details)" regionKey="middleColumn" />
          <RegionBuilder title="Right Sidebar (Checkout)" regionKey="rightSidebar" />
        </div>
        <div className="grid grid-cols-1 gap-6 items-start">
          <RegionBuilder title="Bottom Content (Full width details)" regionKey="bottomContent" />
        </div>
      </div>
    </div>
  );
}
