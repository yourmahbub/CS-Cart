import { LOGO_APPLE } from './brandLogos';

const WATCH_PINK = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80';
const WATCH_BLACK = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
const WATCH_BLUE = 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80';
const WATCH_SIDE = 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=600&q=80';
const WATCH_BOX = 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=600&q=80';

const REVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80',
];

const baseProducts: any[] = [
  {
    id: 1,
    title: 'GoPro HERO12 Black Edition Camera',
    code: 'B00F3F0GLU',
    brand: 'GoPro',
    brandLogo: '',
    categoryId: '4',
    image: 'https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    ],
    price: 319,
    oldPrice: 399,
    discount: 20,
    isNew: true,
    isPopular: false,
    rating: 0.0,
    reviews: 0,
    inStock: false,
    stock: 0,
    hasOptions: false,
    hasVideo: true,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    isComingSoon: true,
    description: 'Capture stunning 5.3K video and 27MP photos with HyperSmooth 6.0 stabilisation.',
  },
  {
    id: 2,
    title: 'Sony - DualShock 4 Wireless Controller for Sony PlayStati...',
    code: '3003235',
    brand: 'Sony',
    categoryId: '3',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    ],
    price: 56,
    oldPrice: 65,
    discount: 14,
    isPopular: true,
    rating: 4.1,
    reviews: 11,
    inStock: true,
    stock: 42,
    hasOptions: true,
    colors: ['Black', 'White'],
  },

  /* ------------------------------------------------------------------ *
   * Reference product — mirrors the UniTheme2 demo product page 1:1     *
   * ------------------------------------------------------------------ */
  {
    id: 3,
    title: 'Apple Watch Series 6 (GPS, 40mm, Gold Aluminum, Pink Sand Sport Band)',
    code: 'W6456477_763A',
    brand: 'Apple',
    brandLogo: LOGO_APPLE,
    categoryId: '1',
    categoryName: 'Electronics',
    image: WATCH_PINK,
    images: [WATCH_PINK, WATCH_BLACK, WATCH_BLUE, WATCH_SIDE, WATCH_BOX],
    price: 33864,
    oldPrice: 42330,
    discount: 20,
    rating: 4.3,
    reviews: 25,
    inStock: true,
    stock: 18,
    hasOptions: true,

    colors: [
      { name: 'Black', hex: '#1d1d1f', image: WATCH_BLACK },
      { name: 'Midnight Blue', hex: '#1f3a5f', image: WATCH_BLUE },
      { name: 'Pink Sand', hex: '#e8c4bc', image: WATCH_PINK },
    ],
    defaultColor: 'Pink Sand',
    sizes: ['40mm', '44mm', '50mm'],
    defaultSize: '50mm',
    sizeLabel: 'Watch Size',

    description:
      'Apple Watch Series 6 lets you measure your blood oxygen level with a revolutionary new sensor and app. ' +
      'Take an ECG from your wrist. See your fitness metrics on the enhanced Always-On Retina display, now 2.5x brighter outdoors when your wrist is down. ' +
      'Set a bedtime routine and track your sleep. And with cellular service, you can go without your phone. ' +
      "It's the ultimate device for a healthier, more active, more connected life.",

    keyFeatures: [
      'Blood Oxygen app measures your blood oxygen level in 15 seconds',
      'ECG app can generate an ECG similar to a single-lead electrocardiogram',
      'Always-On Retina display is 2.5x brighter outdoors when your wrist is down',
      'S6 SiP is up to 20% faster than Series 5',
      'Built-in GPS and up to 18 hours of battery life',
      'Water resistant to 50 metres',
      'Sleep tracking, high and low heart rate notifications, irregular rhythm notifications',
    ],

    specGroups: [
      {
        id: 'g_general',
        title: '',
        items: [
          { name: 'Color', value: 'Pink Sand' },
          { name: 'Brand', value: 'Apple' },
        ],
      },
      {
        id: 'g_electronics',
        title: 'Electronics',
        items: [
          { name: 'Watch Size', value: '50 mm' },
          { name: 'Operating System', value: 'watchOS 6' },
          { name: 'Storage Capacity', value: '32GB' },
        ],
      },
    ],

    // Arabic translations. English stays in the fields above; only what is
    // filled in here is swapped when the shopper switches language.
    i18n: {
      ar: {
        title: 'ساعة أبل الإصدار 6 (GPS، 40 مم، ألمنيوم ذهبي، سوار رياضي وردي)',
        description:
          'تتيح لك ساعة أبل الإصدار السادس قياس مستوى الأكسجين في الدم عبر مستشعر جديد كلياً. ' +
          'سجّل تخطيط القلب من معصمك، وتابع مؤشرات لياقتك على شاشة Retina الدائمة العمل، ' +
          'الأسطع بمقدار 2.5 مرة في الخارج عندما يكون معصمك منخفضاً. ' +
          'اضبط روتين نومك وتابع جودته، ومع خدمة الاتصال الخلوي يمكنك الخروج دون هاتفك.',
        keyFeatures: [
          'تطبيق الأكسجين في الدم يقيس مستوى الأكسجين خلال 15 ثانية',
          'تطبيق تخطيط القلب ينشئ رسماً مشابهاً لتخطيط أحادي القطب',
          'شاشة Retina دائمة العمل أسطع بـ 2.5 مرة في الخارج',
          'معالج S6 أسرع بنسبة تصل إلى 20% من الإصدار الخامس',
          'نظام تحديد المواقع المدمج وبطارية تدوم حتى 18 ساعة',
          'مقاومة للماء حتى عمق 50 متراً',
          'تتبع النوم وتنبيهات معدل ضربات القلب المرتفع والمنخفض',
        ],
        specGroups: [
          { title: '', items: [{ name: 'اللون', value: 'وردي رملي' }, { name: 'العلامة التجارية', value: 'أبل' }] },
          {
            title: 'إلكترونيات',
            items: [
              { name: 'حجم الساعة', value: '50 مم' },
              { name: 'نظام التشغيل', value: 'watchOS 6' },
              { name: 'سعة التخزين', value: '32 جيجابايت' },
            ],
          },
        ],
        colors: [{ name: 'أسود' }, { name: 'أزرق داكن' }, { name: 'وردي رملي' }],
      },
    },

    reviewList: [
      {
        id: 101,
        author: 'Amanda',
        avatar: '',
        flag: '🇺🇸',
        verified: true,
        usageDuration: 'More than 1 month in use',
        rating: 4,
        date: '08/26/2025',
        dateISO: '2025-08-26',
        modelColor: 'Black',
        modelSize: '44 mm',
        modelName: 'Apple Watch Series 6 (GPS, 44mm, Space Gray Aluminum, Black Sport Band)',
        modelLink: '/product/5',
        text:
          'Мне часами очень нравится! Доволен покупкой, заряд держит почти два дня. Может изменить и мало габариты. Удобно ходить в магазин, можно даже телефон не брать, чтобы рассчитаться. Можно ответить на звонок, стоя на стремянке ваши шумы. Рекомендую!!!',
        pros: 'Отличные часы',
        cons: 'Пока не выявила',
        media: REVIEW_PHOTOS.slice(0, 4),
        helpfulYes: 4,
        helpfulNo: 0,
        status: 'approved',
        onlyBuyer: true,
      },
      {
        id: 102,
        author: 'By J. Stephen',
        avatar: '',
        verified: true,
        usageDuration: '',
        rating: 1,
        date: '02/06/2025',
        dateISO: '2025-02-06',
        modelColor: 'Midnight blue',
        modelSize: '40 mm',
        modelName: 'Apple Watch Series 6 GPS 40mm Blue Aluminium Case with Deep Navy Sport Band',
        modelLink: '/product/3',
        text:
          "I haven't received my watch yet. The store in Savannah Georgia couldn't figure out where the order was and stated that I would need to contact .com over the phone for further information. After contacting them they did not know where the watch was and stated they would mail another watch to Savannah Georgia location. They stated I would receive confirmation on email three days later I called back and this was never done and they will mail another watch and this time I got confirmation. Unfortunately the watch never came and as of right now I'm still waiting on my wife's Christmas gift. Originally we paid extra so it would be at our home on December 22, 2020. This is the fourth time if I ever get it.",
        pros: '',
        cons: "I'm still waiting on my wife's Christmas gift",
        media: [],
        helpfulYes: 10,
        helpfulNo: 4,
        status: 'approved',
        onlyBuyer: true,
        highlightCritical: true,
      },
      {
        id: 103,
        author: 'Вадим Демидович',
        avatar: '',
        flag: '🇷🇺',
        verified: true,
        usageDuration: 'More than 2 months in use',
        rating: 5,
        date: '06/08/2024',
        dateISO: '2024-06-08',
        modelColor: 'Midnight blue',
        modelSize: '40 mm',
        modelName: 'Apple Watch Series 6 GPS 40mm Blue Aluminium Case with Deep Navy Sport Band',
        modelLink: '/product/3',
        text:
          'Со всеми задачами справляются. Доставили быстро, всё ОК. Если будете стать в часах — нужно заряжать перед сном, благо занимает это не много времени. Но в целом батарейка довольно слабая, к сожалению, есть уже 100500 обзоров, повторяться нет смысла :)',
        pros: 'В рекомендации не нуждаются, отличные часы!',
        cons: 'Слабая батарея, других сложностей ИМХО нет.',
        media: REVIEW_PHOTOS.slice(0, 6),
        helpfulYes: 17,
        helpfulNo: 2,
        status: 'approved',
        onlyBuyer: true,
        highlightPositive: true,
      },
      {
        id: 104,
        author: 'J. Doe',
        avatar: '',
        verified: false,
        usageDuration: '',
        rating: 2,
        date: '02/08/2024',
        dateISO: '2024-02-08',
        text: 'The other reviews I confess have not impressed me. But the color was great.',
        pros: '',
        cons: '',
        media: [],
        helpfulYes: 1,
        helpfulNo: 1,
        status: 'approved',
        onlyBuyer: false,
      },
      {
        id: 105,
        author: 'Светлана',
        avatar: '',
        flag: '🇷🇺',
        verified: true,
        usageDuration: '',
        rating: 4,
        date: '06/08/2023',
        dateISO: '2023-06-08',
        modelColor: 'Pink Sand',
        modelSize: '40 mm',
        modelName: 'Apple Watch Series 6 (GPS, 40mm, Gold Aluminum, Pink Sand Sport Band)',
        modelLink: '/product/3',
        text:
          'Часы просто шикарные, обладателям айфонов будет прекрасным дополнением. Все функции работают. С поставленными задачами справляются. Всём буду ещё только 6 серию.',
        pros: '',
        cons: 'Цена дороже чем у всех продавцов!',
        media: REVIEW_PHOTOS.slice(2, 5),
        helpfulYes: 1,
        helpfulNo: 0,
        status: 'approved',
        onlyBuyer: true,
        adminReply: 'Здравствуйте, благодарим за отзыв! В ближайшее время обновим цену товара))',
      },
    ],
  },

  {
    id: 4,
    title: 'AB: Google Pixel 6 Pro 12/128GB Stormy Black',
    code: 'GLUOG4363563',
    brand: 'Google',
    categoryId: '5',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    ],
    price: 942,
    oldPrice: 1177,
    discount: 20,
    rating: 0.0,
    reviews: 0,
    inStock: true,
    stock: 12,
    hasVideo: true,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    hasOptions: false,
  },
  {
    id: 5,
    title: 'AB: Apple Watch Series 6 (GPS, 44mm, Space Gray Aluminum, Black Sport Band)',
    code: 'B6456477_7E3F',
    brand: 'Apple',
    brandLogo: LOGO_APPLE,
    categoryId: '1',
    image: WATCH_SIDE,
    images: [WATCH_SIDE, WATCH_PINK],
    price: 36990,
    rating: 4.3,
    reviews: 25,
    inStock: true,
    stock: 7,
    hasOptions: true,
    colors: [
      { name: 'Space Gray', hex: '#4a4a4c', image: WATCH_SIDE },
      { name: 'Pink Sand', hex: '#e8c4bc', image: WATCH_PINK },
    ],
    sizes: ['40mm', '44mm'],
  },
  {
    id: 6,
    title: 'Trefoil Hoodie',
    code: 'A0007DQ1TL2',
    brand: 'Adidas',
    categoryId: '7',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    ],
    price: 2200,
    isPopular: true,
    rating: 3.9,
    reviews: 8,
    inStock: true,
    stock: 55,
    hasVideo: true,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    hasOptions: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 7,
    title: 'AB: Samsung Galaxy S22 8/128GB Phantom Black',
    code: 'SM-S901BZKDSEK',
    brand: 'Samsung',
    categoryId: '5',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    ],
    price: 710,
    oldPrice: 888,
    discount: 20,
    isPopular: true,
    isBestseller: true,
    rating: 4.8,
    reviews: 142,
    inStock: true,
    stock: 30,
    hasOptions: true,
  },
  {
    id: 8,
    title: 'AB: Dell XPS 17 9710 (XPS9710-7265SLV-PUS) Platinum Silver',
    code: 'XPS9710-7265SLV-PUS',
    brand: 'Dell',
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    ],
    price: 2811,
    oldPrice: 3514,
    discount: 20,
    rating: 5.0,
    reviews: 3,
    inStock: true,
    stock: 4,
    hasOptions: true,
    isBestseller: true,
  },
  {
    id: 9,
    title: 'AB: Apple iPhone 14 Pro 128GB Deep Purple (MQ0G3RX/A)',
    code: 'MQ0G3RX/A',
    brand: 'Apple',
    brandLogo: LOGO_APPLE,
    categoryId: '5',
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=600&q=80'],
    price: 1191,
    oldPrice: 1489,
    discount: 20,
    rating: 5.0,
    reviews: 12,
    inStock: true,
    stock: 22,
    onSale: true,
    isPopular: true,
  },
  {
    id: 10,
    title: 'AB: Apple MacBook Air 13.6" M2 256GB 2022 (MLXW3UA/A) Space Grey',
    code: 'MLXW3UA/A',
    brand: 'Apple',
    brandLogo: LOGO_APPLE,
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    price: 1671,
    oldPrice: 2088,
    discount: 20,
    isPopular: true,
    rating: 5.0,
    reviews: 8,
    inStock: true,
    stock: 15,
    onSale: true,
  },
  {
    id: 11,
    title: 'Apple AirPods Pro with Wireless Charging Case',
    code: 'MP3452348R',
    brand: 'Apple',
    brandLogo: LOGO_APPLE,
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'],
    price: 18420,
    oldPrice: 19700,
    discount: 6,
    rating: 4.2,
    reviews: 19,
    inStock: true,
    stock: 60,
    isNew: true,
    isPopular: true,
  },
  {
    id: 12,
    title: 'Bose QuietComfort 45',
    code: 'BQC45-BLK',
    brand: 'Bose',
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=600&q=80',
    ],
    price: 329,
    oldPrice: 349,
    discount: 5,
    isPopular: false,
    rating: 4.7,
    reviews: 215,
    inStock: true,
    stock: 25,
    onSale: true,
  },
];

/**
 * Long-form content per product. Kept separate so the catalogue above stays
 * readable. A product's own fields always win over anything defined here.
 */
const PRODUCT_CONTENT: Record<number, any> = {
  1: {
    keyFeatures: [
      '5.3K60 and 4K120 video with 27MP stills',
      'HyperSmooth 6.0 stabilisation with 360° Horizon Lock',
      'Waterproof to 10m without a housing',
      'Up to 70% longer runtime with the Enduro battery',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Black' }, { name: 'Brand', value: 'GoPro' }] },
      { id: 'g2', title: 'Camera', items: [{ name: 'Max Video', value: '5.3K60' }, { name: 'Photo', value: '27 MP' }, { name: 'Waterproof', value: '10 m' }] },
    ],
  },
  2: {
    description:
      'The DualShock 4 wireless controller adds intuitive new ways to play, with a highly sensitive six-axis sensor, ' +
      'a built-in speaker and a clickable touch pad. The refined analogue sticks and triggers give you precise control over every game.',
    keyFeatures: [
      'Highly sensitive six-axis motion sensor',
      'Clickable touch pad and built-in speaker',
      'Share button for instant capture and streaming',
      'Rechargeable battery with USB charging',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Black' }, { name: 'Brand', value: 'Sony' }] },
      { id: 'g2', title: 'Connectivity', items: [{ name: 'Interface', value: 'Bluetooth / USB' }, { name: 'Platform', value: 'PlayStation 4, PC' }] },
    ],
  },
  4: {
    description:
      'Google Pixel 6 Pro is fast and secure, with an advanced Google Tensor chip, a pro-level camera system and ' +
      'the Titan M2 security chip. The 6.7" LTPO display refreshes at up to 120Hz for exceptionally smooth scrolling.',
    keyFeatures: [
      'Google Tensor processor with Titan M2 security',
      '6.7" QHD+ LTPO display at up to 120Hz',
      '50MP wide, 12MP ultrawide and 48MP 4x telephoto cameras',
      'Adaptive Battery lasts over 24 hours',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Stormy Black' }, { name: 'Brand', value: 'Google' }] },
      { id: 'g2', title: 'Electronics', items: [{ name: 'Display', value: '6.7" LTPO' }, { name: 'Memory', value: '12 GB' }, { name: 'Storage Capacity', value: '128 GB' }] },
    ],
  },
  5: {
    description:
      'Apple Watch Series 6 in a 44mm Space Gray aluminium case with a Black Sport Band. Measure your blood oxygen, ' +
      'take an ECG, and keep an eye on your fitness with the Always-On Retina display.',
    keyFeatures: [
      'Blood Oxygen and ECG apps',
      'Always-On Retina display',
      'Up to 18 hours of battery life',
      'Water resistant to 50 metres',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Space Gray' }, { name: 'Brand', value: 'Apple' }] },
      { id: 'g2', title: 'Electronics', items: [{ name: 'Watch Size', value: '44 mm' }, { name: 'Operating System', value: 'watchOS 7' }, { name: 'Storage Capacity', value: '32GB' }] },
    ],
  },
  6: {
    description:
      'A soft fleece hoodie with the iconic Trefoil logo across the chest. Ribbed cuffs and hem keep the warmth in, ' +
      'and the roomy kangaroo pocket keeps your hands free.',
    keyFeatures: ['Soft cotton-blend fleece', 'Adjustable drawcord hood', 'Kangaroo pocket', 'Ribbed cuffs and hem'],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Grey' }, { name: 'Brand', value: 'Adidas' }] },
      { id: 'g2', title: 'Apparel', items: [{ name: 'Material', value: 'Cotton blend' }, { name: 'Fit', value: 'Regular' }, { name: 'Care', value: 'Machine washable' }] },
    ],
  },
  7: {
    description:
      'Galaxy S22 puts a pro-grade camera in your pocket. Nightography captures bright, steady shots after dark, ' +
      'and the adaptive 120Hz display stays readable in direct sunlight.',
    keyFeatures: [
      'Nightography low-light camera system',
      '6.1" Dynamic AMOLED 2X, adaptive 120Hz',
      'Armor Aluminium frame with Gorilla Glass Victus+',
      'Fast charging and wireless PowerShare',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Phantom Black' }, { name: 'Brand', value: 'Samsung' }] },
      { id: 'g2', title: 'Electronics', items: [{ name: 'Display', value: '6.1" AMOLED' }, { name: 'Memory', value: '8 GB' }, { name: 'Storage Capacity', value: '128 GB' }] },
    ],
  },
  8: {
    description:
      'The Dell XPS 17 pairs a 17" InfinityEdge display with serious performance in a chassis barely bigger than most 15" laptops. ' +
      'CNC-machined aluminium, carbon fibre and Gorilla Glass make it as durable as it is thin.',
    keyFeatures: [
      '17" UHD+ InfinityEdge display',
      'CNC-machined aluminium chassis',
      'Quad-speaker design tuned by Waves NX',
      'Thunderbolt 4 connectivity',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Platinum Silver' }, { name: 'Brand', value: 'Dell' }] },
      { id: 'g2', title: 'Computers', items: [{ name: 'Display', value: '17" UHD+' }, { name: 'Memory', value: '16 GB' }, { name: 'Storage Capacity', value: '1 TB SSD' }] },
    ],
  },
  9: {
    description:
      'iPhone 14 Pro introduces the Dynamic Island, an all-new way to interact with your phone. The 48MP main camera ' +
      'captures far more detail, and the Always-On display keeps what matters in view.',
    keyFeatures: [
      'Dynamic Island bubbles up alerts and activities',
      '48MP main camera with a quad-pixel sensor',
      'Always-On Super Retina XDR display',
      'A16 Bionic, the fastest chip in a smartphone',
      'Crash Detection and Emergency SOS via satellite',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Deep Purple' }, { name: 'Brand', value: 'Apple' }] },
      { id: 'g2', title: 'Electronics', items: [{ name: 'Display', value: '6.1" XDR' }, { name: 'Chip', value: 'A16 Bionic' }, { name: 'Storage Capacity', value: '128 GB' }] },
    ],
  },
  10: {
    description:
      'MacBook Air with the M2 chip is strikingly thin and brings up to 18 hours of battery life. The 13.6" Liquid Retina ' +
      'display supports one billion colours, and the whole machine runs silently without a fan.',
    keyFeatures: [
      'Apple M2 chip with an 8-core CPU',
      '13.6" Liquid Retina display, 500 nits',
      'Up to 18 hours of battery life',
      'Silent, fanless design',
      'MagSafe charging and two Thunderbolt ports',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Space Grey' }, { name: 'Brand', value: 'Apple' }] },
      { id: 'g2', title: 'Computers', items: [{ name: 'Display', value: '13.6" Liquid Retina' }, { name: 'Chip', value: 'Apple M2' }, { name: 'Storage Capacity', value: '256 GB' }] },
    ],
  },
  11: {
    description:
      'AirPods Pro deliver Active Noise Cancellation for immersive sound, Transparency mode so you can hear the world ' +
      'around you, and a customisable fit for all-day comfort.',
    keyFeatures: [
      'Active Noise Cancellation',
      'Transparency mode',
      'Adaptive EQ tunes music to your ear',
      'Sweat and water resistant',
      'Wireless charging case',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'White' }, { name: 'Brand', value: 'Apple' }] },
      { id: 'g2', title: 'Audio', items: [{ name: 'Type', value: 'In-ear' }, { name: 'Battery', value: 'Up to 24 h with case' }, { name: 'Charging', value: 'Wireless / Lightning' }] },
    ],
  },
  12: {
    description:
      'QuietComfort 45 headphones combine legendary Bose noise cancellation with high-fidelity audio and a lightweight ' +
      'design you can wear all day. Up to 24 hours of battery life keeps the quiet going.',
    keyFeatures: [
      'World-class noise cancellation',
      'Up to 24 hours of battery life',
      'Aware Mode for full transparency',
      'Adjustable EQ in the Bose Music app',
    ],
    specGroups: [
      { id: 'g1', title: '', items: [{ name: 'Color', value: 'Black' }, { name: 'Brand', value: 'Bose' }] },
      { id: 'g2', title: 'Audio', items: [{ name: 'Type', value: 'Over-ear' }, { name: 'Battery', value: 'Up to 24 h' }, { name: 'Connectivity', value: 'Bluetooth 5.1' }] },
    ],
  },
};

export const mockProducts: any[] = baseProducts.map((p) => ({ ...PRODUCT_CONTENT[p.id], ...p }));

export const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'TVs / Video', slug: 'tvs-video', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Video games', slug: 'video-games', image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=200&q=80' },
  { id: '4', name: 'Cameras & Photo', slug: 'cameras-photo', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80' },
  { id: '5', name: 'Cell Phones', slug: 'cell-phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80' },
  { id: '6', name: 'Sports & Outdoors', slug: 'sports-outdoors', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=200&q=80' },
  { id: '7', name: 'Apparel', slug: 'apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80' },
  { id: '8', name: 'Car Electronics', slug: 'car-electronics', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=200&q=80' },
];
