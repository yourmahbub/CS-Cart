export type BlockType = 
  | 'gallery' 
  | 'title_price' 
  | 'short_description'
  | 'full_description'
  | 'features'
  | 'faq'
  | 'reviews'
  | 'countdown'
  | 'stock_indicator'
  | 'shipping_info'
  | 'custom_html'
  | 'add_to_cart'
  | 'variants'
  | 'warranty'
  | 'related_products';

export interface LayoutBlock {
  id: string; // Unique ID for the block instance
  type: BlockType;
  enabled: boolean;
  settings?: any;
}

export interface PageTemplate {
  leftColumn: LayoutBlock[];
  middleColumn: LayoutBlock[];
  rightSidebar: LayoutBlock[];
  bottomContent: LayoutBlock[];
}

export const defaultProductTemplate: PageTemplate = {
  leftColumn: [
    { id: 'b1', type: 'gallery', enabled: true }
  ],
  middleColumn: [
    { id: 'b_title', type: 'title_price', enabled: true },
    { id: 'b_short', type: 'short_description', enabled: true },
    { id: 'b_war', type: 'warranty', enabled: true },
    { id: 'b_var', type: 'variants', enabled: true }
  ],
  rightSidebar: [
    { id: 'bc', type: 'countdown', enabled: false, settings: { text: 'Sale ends soon!', hours: 24 } },
    { id: 'b_price_box', type: 'add_to_cart', enabled: true },
    { id: 'b_ship', type: 'shipping_info', enabled: true }
  ],
  bottomContent: [
    { id: 'b6', type: 'full_description', enabled: true },
    { id: 'b7', type: 'features', enabled: true },
    { id: 'b_faq', type: 'faq', enabled: true, settings: { faqs: [] } },
    { id: 'b8', type: 'reviews', enabled: true },
    { id: 'b9', type: 'custom_html', enabled: false, settings: { html: '<div class="p-8 bg-gray-100 rounded-2xl text-center"><h3 class="text-xl font-bold">Custom Banner</h3></div>' } },
    { id: 'b_rel', type: 'related_products', enabled: true },
  ]
};
