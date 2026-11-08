export interface PromoBanner {
  id: string;
  brand: { en: string; ar: string };
  title: { en: string; ar: string };
  titleSub: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  bg: string;
  accent: string;
  link: string;
  buttonText: { en: string; ar: string };
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: { en: string; ar: string };
  text: { en: string; ar: string };
}

export interface CategoryGrid {
  columnsMobile: number;
  columnsTablet: number;
  columnsDesktop: number;
  gap: number;
  cardShape: 'landscape' | 'square' | 'portrait' | 'fixed';
  cardHeight: number;
  cardBg: string;
  cardHoverBg: string;
  textColor: string;
  cardRadius: number;
  cardPadding: number;
  showBorder: boolean;
  imageFit: 'contain' | 'cover';
  imageScale: number;
  blendImage: boolean;
  hoverEffect: 'zoom' | 'lift' | 'none';
  labelPosition: 'below' | 'overlay';
  labelSize: number;
  showCount: boolean;
  showHeading: boolean;
  headingAccent: { en: string; ar: string };
  heading: { en: string; ar: string };
  source: 'all' | 'selected';
  limit: number;
  categoryIds: string[];
}

export const FEATURE_ICONS = [
  'Truck',
  'ShieldCheck',
  'RotateCcw',
  'CreditCard',
  'Headphones',
  'Clock',
  'Award',
  'Sparkles',
  'Package',
  'Heart',
];

export const defaultFeatures: FeatureItem[] = [
  {
    id: 'f_1',
    icon: 'Truck',
    title: { en: 'Free Delivery', ar: 'توصيل مجاني' },
    text: { en: 'On orders over $50 across the country', ar: 'للطلبات التي تزيد عن 50 دولار' },
  },
  {
    id: 'f_2',
    icon: 'ShieldCheck',
    title: { en: 'Official Warranty', ar: 'ضمان رسمي' },
    text: { en: '100% genuine products with manufacturer warranty', ar: 'منتجات أصلية 100% مع ضمان الشركة' },
  },
  {
    id: 'f_3',
    icon: 'RotateCcw',
    title: { en: '14-Day Returns', ar: 'إرجاع خلال 14 يوماً' },
    text: { en: 'Hassle-free exchange and return policy', ar: 'سياسة استبدال وإرجاع سهلة ومرنة' },
  },
  {
    id: 'f_4',
    icon: 'CreditCard',
    title: { en: 'Secure Payments', ar: 'دفع آمن' },
    text: { en: 'Cash on delivery, cards and bank transfer', ar: 'الدفع عند الاستلام، بطاقات، وتحويل بنكي' },
  },
];

export const defaultPromoBanners = {
  headingAccent: { en: 'Seasonal', ar: 'عروض' },
  heading: { en: 'Offers & Top Deals', ar: 'الموسم وأفضل الصفقات' },
  linkText: { en: 'View all deals', ar: 'عرض جميع الصفقات' },
  linkUrl: '/search',
  spotlightIds: [] as string[],
  leftListIds: [] as string[],
  rightListIds: [] as string[],
  topBanners: [
    {
      id: 'pb_top_1',
      brand: { en: 'Sony', ar: 'سوني' },
      title: { en: 'PlayStation 5 Console', ar: 'جهاز بلايستيشن 5' },
      titleSub: { en: 'Next Gen Gaming', ar: 'الجيل الجديد من الألعاب' },
      description: { en: 'Experience lightning-fast loading and deeper immersion.', ar: 'استمتع بسرعة تحميل فائقة وتجربة لعب غامرة.' },
      image: 'https://images.unsplash.com/photo-1606813904106-0249e762cb56?auto=format&fit=crop&w=600&q=80',
      bg: '#f3f4f6',
      accent: '#00a651',
      link: '/category/1',
      buttonText: { en: 'Shop now', ar: 'تسوق الآن' },
    },
  ],
  bottomBanners: [
    {
      id: 'pb_bottom_1',
      brand: { en: 'Apple', ar: 'آبل' },
      title: { en: 'Watch Series 9', ar: 'ساعة آبل الجيل 9' },
      titleSub: { en: 'Smarter. Brighter. Mightier.', ar: 'أكثر ذكاءً وأقوى أداءً.' },
      description: { en: 'Powerful sensors for health and fitness insights.', ar: 'مستشعرات متطورة لصحتك ولياقتك.' },
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
      bg: '#f3f4f6',
      accent: '#00a651',
      link: '/category/1',
      buttonText: { en: 'Discover', ar: 'اكتشف المزيد' },
    },
  ],
};

export const defaultCategoryGrid: CategoryGrid = {
  columnsMobile: 2,
  columnsTablet: 3,
  columnsDesktop: 4,
  gap: 16,
  cardShape: 'square',
  cardHeight: 200,
  cardBg: '#ffffff',
  cardHoverBg: '#f9fafb',
  textColor: '#111827',
  cardRadius: 16,
  cardPadding: 16,
  showBorder: true,
  imageFit: 'contain',
  imageScale: 85,
  blendImage: true,
  hoverEffect: 'zoom',
  labelPosition: 'below',
  labelSize: 14,
  showCount: true,
  showHeading: false,
  headingAccent: { en: '', ar: '' },
  heading: { en: '', ar: '' },
  source: 'all',
  limit: 8,
  categoryIds: [],
};
