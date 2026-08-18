export type BlockType =
  // Media
  | 'gallery'
  // Main details
  | 'title_price'
  | 'short_description'
  | 'variants'
  | 'guarantee_select'
  | 'service_plan'
  // Sidebar
  | 'brand_logo'
  | 'price_box'
  | 'promo_deal'
  | 'add_to_cart'
  | 'delivery_options'
  | 'payment_options'
  | 'warranty_returns'
  // Bottom / full width
  | 'features'
  | 'full_description'
  | 'key_features'
  | 'reviews'
  | 'related_products'
  | 'promo_banners'
  // Extras (legacy / optional)
  | 'faq'
  | 'countdown'
  | 'stock_indicator'
  | 'shipping_info'
  | 'warranty'
  | 'custom_html';

export interface LayoutBlock {
  id: string; // Unique ID for the block instance
  type: BlockType;
  enabled: boolean;
  settings?: any;
}

export interface PageTemplate {
  /** Media column (left of the details). */
  leftColumn: LayoutBlock[];
  /** Details column (right of the gallery, left of the sidebar). */
  middleColumn: LayoutBlock[];
  /** Sticky buy-box column. */
  rightSidebar: LayoutBlock[];
  /** Continues under the gallery + details, still beside the sidebar. */
  mainContent: LayoutBlock[];
  /** Full page width, below everything. */
  bottomContent: LayoutBlock[];
}

/** Registry used by the page builder to list & label every block. */
export const BLOCK_LIBRARY: { type: BlockType; name: string; region: string; description: string }[] = [
  { type: 'gallery', name: 'Product Gallery', region: 'Left', description: 'Main image, video, thumbnails, discount badge, lightbox' },
  { type: 'title_price', name: 'Title, Rating & Code', region: 'Middle', description: 'Product name, stars, review count, write-a-review link, SKU' },
  { type: 'short_description', name: 'Short Note', region: 'Middle', description: 'Single highlighted line under the title' },
  { type: 'variants', name: 'Options (Color / Size)', region: 'Middle', description: 'Swatch and button selectors built from product options' },
  { type: 'guarantee_select', name: 'Guarantee Dropdown', region: 'Middle', description: 'Selectable guarantee period' },
  { type: 'service_plan', name: 'Extended Service Plan', region: 'Middle', description: 'Radio list of paid protection plans' },
  { type: 'brand_logo', name: 'Brand Logo', region: 'Sidebar', description: 'Manufacturer logo shown above the price' },
  { type: 'price_box', name: 'Price & Stock', region: 'Sidebar', description: 'Price, old price, discount badge, stock status' },
  { type: 'promo_deal', name: 'Promotion Box + Countdown', region: 'Sidebar', description: 'Highlighted campaign banner with a live timer' },
  { type: 'add_to_cart', name: 'Buy Buttons', region: 'Sidebar', description: 'Quantity, add to cart, 1-click buy, wishlist, compare' },
  { type: 'delivery_options', name: 'Delivery Methods', region: 'Sidebar', description: 'Collapsible list of shipping options and prices' },
  { type: 'payment_options', name: 'Payment Methods', region: 'Sidebar', description: 'Accepted payment icons and note' },
  { type: 'warranty_returns', name: 'Warranty & Returns', region: 'Sidebar', description: 'Return window and manufacturer warranty' },
  { type: 'features', name: 'Specifications', region: 'Bottom', description: 'Grouped attribute table plus "Find similar"' },
  { type: 'full_description', name: 'Description', region: 'Bottom', description: 'Long product description' },
  { type: 'key_features', name: 'Key Features', region: 'Bottom', description: 'Expandable bullet list' },
  { type: 'reviews', name: 'Reviews', region: 'Bottom', description: 'Ratings breakdown, photos, filters, replies' },
  { type: 'related_products', name: 'You May Be Interested', region: 'Bottom', description: 'Tabbed product carousels' },
  { type: 'promo_banners', name: 'Promo Banners', region: 'Bottom', description: 'Grid of marketing banners' },
  { type: 'faq', name: 'FAQ', region: 'Bottom', description: 'Question and answer accordion' },
  { type: 'countdown', name: 'Countdown Timer', region: 'Any', description: 'Standalone urgency timer' },
  { type: 'stock_indicator', name: 'Stock Indicator', region: 'Any', description: 'Low-stock urgency line' },
  { type: 'shipping_info', name: 'Shipping Note', region: 'Any', description: 'Simple delivery summary' },
  { type: 'warranty', name: 'Return Period Note', region: 'Any', description: 'Grey info panel about returns' },
  { type: 'custom_html', name: 'Custom HTML', region: 'Any', description: 'Free-form HTML you provide' },
];

export const defaultProductTemplate: PageTemplate = {
  leftColumn: [
    { id: 'b_gallery', type: 'gallery', enabled: true },
  ],
  middleColumn: [
    { id: 'b_title', type: 'title_price', enabled: true },
    { id: 'b_short', type: 'short_description', enabled: true },
    { id: 'b_var', type: 'variants', enabled: true },
    { id: 'b_guarantee', type: 'guarantee_select', enabled: true },
    { id: 'b_service', type: 'service_plan', enabled: true },
  ],
  rightSidebar: [
    { id: 'b_brand', type: 'brand_logo', enabled: true },
    { id: 'b_price', type: 'price_box', enabled: true },
    { id: 'b_promo', type: 'promo_deal', enabled: true },
    { id: 'b_cart', type: 'add_to_cart', enabled: true },
    { id: 'b_delivery', type: 'delivery_options', enabled: true },
    { id: 'b_payment', type: 'payment_options', enabled: true },
    { id: 'b_warranty', type: 'warranty_returns', enabled: true },
  ],
  mainContent: [
    { id: 'b_features', type: 'features', enabled: true },
    { id: 'b_desc', type: 'full_description', enabled: true },
    { id: 'b_key', type: 'key_features', enabled: true },
    { id: 'b_reviews', type: 'reviews', enabled: true },
    { id: 'b_faq', type: 'faq', enabled: false, settings: { faqs: [] } },
  ],
  bottomContent: [
    { id: 'b_related', type: 'related_products', enabled: true },
    { id: 'b_banners', type: 'promo_banners', enabled: true },
    { id: 'b_html', type: 'custom_html', enabled: false, settings: { html: '<div class="p-8 bg-gray-100 rounded-2xl text-center"><h3 class="text-xl font-bold">Custom Banner</h3></div>' } },
  ],
};
