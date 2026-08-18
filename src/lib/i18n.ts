/**
 * Two-language support: English and Arabic.
 *
 * Translatable content is stored as a `Localized` value — `{ en, ar }`. Plain
 * strings are accepted everywhere too, so older records keep working and are
 * treated as English.
 */

export type Lang = 'en' | 'ar';

export const LANGS: { code: Lang; label: string; native: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' },
];

export type Localized = string | { en?: string; ar?: string } | null | undefined;

export const dirOf = (lang: Lang): 'ltr' | 'rtl' => (lang === 'ar' ? 'rtl' : 'ltr');

/**
 * Resolve a translatable value for a language.
 * Falls back to the other language rather than rendering an empty string —
 * a half-translated catalogue should still be readable.
 */
export function tr(value: Localized, lang: Lang): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const wanted = value[lang];
  if (wanted && wanted.trim()) return wanted;
  const other: Lang = lang === 'en' ? 'ar' : 'en';
  return value[other]?.trim() || '';
}

/** Normalise any value into `{ en, ar }` so admin inputs always have both sides. */
export function toLocalized(value: Localized): { en: string; ar: string } {
  if (value == null) return { en: '', ar: '' };
  if (typeof value === 'string') return { en: value, ar: '' };
  return { en: value.en ?? '', ar: value.ar ?? '' };
}

/** True when a value has content in both languages. */
export function isFullyTranslated(value: Localized): boolean {
  const v = toLocalized(value);
  return !!v.en.trim() && !!v.ar.trim();
}

/* ------------------------------------------------------------------ */
/* Storefront interface strings                                        */
/* ------------------------------------------------------------------ */

type Dict = Record<string, { en: string; ar: string }>;

export const UI: Dict = {
  // Header
  'Search products': { en: 'Search products', ar: 'ابحث عن المنتجات' },
  Categories: { en: 'Categories', ar: 'الفئات' },
  Information: { en: 'Information', ar: 'معلومات' },
  'Sign in': { en: 'Sign in', ar: 'تسجيل الدخول' },
  Register: { en: 'Register', ar: 'إنشاء حساب' },
  'Sign out': { en: 'Sign out', ar: 'تسجيل الخروج' },
  Account: { en: 'Account', ar: 'حسابي' },
  Wishlist: { en: 'Wish list', ar: 'قائمة الرغبات' },
  Compare: { en: 'Compare', ar: 'مقارنة' },
  Cart: { en: 'Cart', ar: 'السلة' },

  // Product page
  'In stock': { en: 'In stock', ar: 'متوفر' },
  'Out of stock': { en: 'Out of stock', ar: 'غير متوفر' },
  'Add to cart': { en: 'Add to cart', ar: 'أضف إلى السلة' },
  Added: { en: 'Added', ar: 'تمت الإضافة' },
  'Buy now with 1-click': { en: 'Buy now with 1-click', ar: 'اشترِ الآن بنقرة واحدة' },
  'Add to wish list': { en: 'Add to wish list', ar: 'أضف إلى قائمة الرغبات' },
  Reviews: { en: 'Reviews', ar: 'التقييمات' },
  'Write a review': { en: 'Write a review', ar: 'اكتب تقييماً' },
  Description: { en: 'Description', ar: 'الوصف' },
  Features: { en: 'Features', ar: 'المواصفات' },
  'Key features': { en: 'Key features', ar: 'أبرز المزايا' },
  Delivery: { en: 'Delivery', ar: 'التوصيل' },
  'Payment options': { en: 'Payment options', ar: 'طرق الدفع' },
  'Warranty and returns': { en: 'Warranty and returns', ar: 'الضمان والإرجاع' },
  Home: { en: 'Home', ar: 'الرئيسية' },
  Free: { en: 'Free', ar: 'مجاناً' },
  More: { en: 'More', ar: 'المزيد' },
  Less: { en: 'Less', ar: 'أقل' },
  'Show more': { en: 'Show more', ar: 'عرض المزيد' },

  // Cart & checkout
  'Shopping cart': { en: 'Shopping cart', ar: 'سلة التسوق' },
  'Your cart is empty': { en: 'Your cart is empty', ar: 'سلتك فارغة' },
  'Continue shopping': { en: 'Continue shopping', ar: 'متابعة التسوق' },
  'Proceed to checkout': { en: 'Proceed to checkout', ar: 'إتمام الطلب' },
  Checkout: { en: 'Checkout', ar: 'إتمام الشراء' },
  'Order summary': { en: 'Order summary', ar: 'ملخص الطلب' },
  Subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  Shipping: { en: 'Shipping', ar: 'الشحن' },
  Tax: { en: 'Tax', ar: 'الضريبة' },
  Total: { en: 'Total', ar: 'الإجمالي' },
  'Place order': { en: 'Place order', ar: 'تأكيد الطلب' },
  Contact: { en: 'Contact', ar: 'بيانات التواصل' },
  'Shipping address': { en: 'Shipping address', ar: 'عنوان الشحن' },
  Payment: { en: 'Payment', ar: 'الدفع' },

  // Generic
  Loading: { en: 'Loading…', ar: 'جارٍ التحميل…' },
  Save: { en: 'Save', ar: 'حفظ' },
  Cancel: { en: 'Cancel', ar: 'إلغاء' },
  Search: { en: 'Search', ar: 'بحث' },
};

/* ------------------------------------------------------------------ */
/* Admin panel strings — a separate dictionary from the storefront      */
/* ------------------------------------------------------------------ */

export const ADMIN_UI: Dict = {
  // Navigation groups
  Overview_group: { en: 'Overview', ar: 'نظرة عامة' },
  Catalog: { en: 'Catalog', ar: 'الكتالوج' },
  Sales: { en: 'Sales', ar: 'المبيعات' },
  Storefront: { en: 'Storefront', ar: 'واجهة المتجر' },
  Configuration: { en: 'Configuration', ar: 'الإعدادات' },

  // Navigation
  Dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  Inventory: { en: 'Inventory', ar: 'المخزون' },
  Appearance: { en: 'Appearance', ar: 'المظهر' },
  'Jump to…': { en: 'Jump to…', ar: 'انتقل إلى…' },
  'No matches': { en: 'No matches', ar: 'لا توجد نتائج' },
  Collapse: { en: 'Collapse sidebar', ar: 'طي القائمة' },
  Expand: { en: 'Expand sidebar', ar: 'توسيع القائمة' },
  Products: { en: 'Products', ar: 'المنتجات' },
  'Product Layout': { en: 'Product Layout', ar: 'تخطيط صفحة المنتج' },
  'Product Page Settings': { en: 'Product Page Settings', ar: 'إعدادات صفحة المنتج' },
  Categories: { en: 'Categories', ar: 'الفئات' },
  Orders: { en: 'Orders', ar: 'الطلبات' },
  Reviews: { en: 'Reviews', ar: 'التقييمات' },
  Customers: { en: 'Customers', ar: 'العملاء' },
  'Home Layout': { en: 'Home Layout', ar: 'تخطيط الصفحة الرئيسية' },
  Menu: { en: 'Menu', ar: 'القوائم' },
  Pages: { en: 'Pages', ar: 'الصفحات' },
  Sliders: { en: 'Sliders', ar: 'الشرائح' },
  Settings: { en: 'Settings', ar: 'الإعدادات' },
  'Exit to Store': { en: 'Exit to Store', ar: 'العودة إلى المتجر' },

  // Header
  'Search everywhere...': { en: 'Search everywhere…', ar: 'ابحث في كل مكان…' },
  'Store Owner': { en: 'Store Owner', ar: 'مالك المتجر' },
  Overview: { en: 'Overview', ar: 'نظرة عامة' },
  'Admin language': { en: 'Admin language', ar: 'لغة لوحة التحكم' },

  // Common actions
  Save: { en: 'Save', ar: 'حفظ' },
  Cancel: { en: 'Cancel', ar: 'إلغاء' },
  Delete: { en: 'Delete', ar: 'حذف' },
  Edit: { en: 'Edit', ar: 'تعديل' },
  Add: { en: 'Add', ar: 'إضافة' },
  Search: { en: 'Search', ar: 'بحث' },
  Next: { en: 'Next', ar: 'التالي' },
  Previous: { en: 'Previous', ar: 'السابق' },
  Loading: { en: 'Loading…', ar: 'جارٍ التحميل…' },

  // Product editor
  'Edit Product': { en: 'Edit Product', ar: 'تعديل المنتج' },
  'Create New Product': { en: 'Create New Product', ar: 'إنشاء منتج جديد' },
  'Save Product': { en: 'Save Product', ar: 'حفظ المنتج' },
  'Discard Changes': { en: 'Discard Changes', ar: 'تجاهل التغييرات' },
  'Basic Info': { en: 'Basic Info', ar: 'المعلومات الأساسية' },
  Media: { en: 'Media', ar: 'الوسائط' },
  'Inventory & Pricing': { en: 'Inventory & Pricing', ar: 'المخزون والتسعير' },
  SEO: { en: 'SEO', ar: 'تحسين محركات البحث' },
  'Product Options': { en: 'Product Options', ar: 'خيارات المنتج' },
  Specifications: { en: 'Specifications', ar: 'المواصفات' },

  // Dashboard
  Revenue: { en: 'Revenue', ar: 'الإيرادات' },
  Profit: { en: 'Profit', ar: 'الربح' },
  'Recent orders': { en: 'Recent orders', ar: 'أحدث الطلبات' },
  'View all': { en: 'View all', ar: 'عرض الكل' },
};

/** Translate an interface string. Unknown keys fall through unchanged. */
export function t(key: string, lang: Lang, dict: Dict = UI): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

/** Translate an admin panel string. */
export const tAdmin = (key: string, lang: Lang) => t(key, lang, ADMIN_UI);

/* ------------------------------------------------------------------ */
/* Product localisation                                                */
/* ------------------------------------------------------------------ */

/**
 * Apply a product's Arabic overrides. English lives in the main fields;
 * `i18n.ar` holds the translated copies. Anything untranslated stays English.
 */
export function localizeProduct(product: any, lang: Lang): any {
  if (!product) return product;
  if (lang === 'en') return product;

  const ar = product.i18n?.ar;
  if (!ar) return product;

  const pick = (translated: any, fallback: any) =>
    translated != null && (typeof translated !== 'string' || translated.trim()) ? translated : fallback;

  return {
    ...product,
    title: pick(ar.title, product.title),
    description: pick(ar.description, product.description),
    shortNote: pick(ar.shortNote, product.shortNote),
    sizeLabel: pick(ar.sizeLabel, product.sizeLabel),
    keyFeatures: ar.keyFeatures?.length ? ar.keyFeatures : product.keyFeatures,
    specGroups: ar.specGroups?.length ? ar.specGroups : product.specGroups,
    colors: product.colors?.map((c: any, i: number) =>
      ar.colors?.[i]?.name ? { ...c, name: ar.colors[i].name } : c,
    ),
  };
}

/** Localise a category record. */
export function localizeCategory(category: any, lang: Lang): any {
  if (!category) return category;
  return { ...category, name: tr({ en: category.name, ar: category.nameAr }, lang) || category.name };
}

/** Localise a CMS page record. */
export function localizePage(page: any, lang: Lang): any {
  if (!page) return page;
  return {
    ...page,
    title: tr({ en: page.title, ar: page.titleAr }, lang) || page.title,
    content: tr({ en: page.content, ar: page.contentAr }, lang) || page.content,
  };
}
