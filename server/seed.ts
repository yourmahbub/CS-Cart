import { randomBytes } from 'node:crypto';
import { db, setSetting, getSetting, productToRow, recalcProductRating } from './db';
import { hashPassword } from './auth';
import { mockProducts, mockCategories } from '../src/data/mockData';
import { megaMenuData } from '../src/data/megaMenuData';
import { defaultProductTemplate } from '../src/types/template';
import { defaultProductPageConfig } from '../src/data/productPageDefaults';
import { defaultPromoBanners, defaultFeatures, defaultCategoryGrid } from '../src/data/homeSections';

/**
 * First-run bootstrap. Everything here is idempotent: it only fills gaps, so a
 * live database is never overwritten by a restart or a redeploy.
 */
export function seed() {
  seedAdmin();
  seedSettings();
  seedCatalogue();
  seedPages();
}

function seedPages() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM pages').get() as any;
  if (count.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO pages (slug, title, title_ar, content, content_ar, sort) VALUES (?,?,?,?,?,?)',
  );
  ([
    ['about-us', 'About Us', 'من نحن', 'Tell your customers who you are.', 'عرّف عملاءك بمتجرك.', 0],
    ['delivery', 'Delivery Information', 'معلومات التوصيل', 'Describe your shipping options and timings.', 'اشرح خيارات الشحن ومواعيده.', 1],
    ['returns', 'Returns Policy', 'سياسة الإرجاع', 'Explain how returns and refunds work.', 'اشرح آلية الإرجاع واسترداد المبلغ.', 2],
    ['terms', 'Terms & Conditions', 'الشروط والأحكام', 'Your terms of sale.', 'شروط البيع الخاصة بك.', 3],
    ['privacy', 'Privacy Policy', 'سياسة الخصوصية', 'How you handle customer data.', 'كيف تتعامل مع بيانات العملاء.', 4],
  ] as [string, string, string, string, string, number][]).forEach((r) => insert.run(...r));
}

function seedAdmin() {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get() as any;
  if (existing.n > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')").run(
      email,
      hashPassword(password),
      process.env.ADMIN_NAME || 'Store Owner',
    );
    console.log(`[seed] Administrator created for ${email}`);
    return;
  }

  // No credentials supplied — mint a random one rather than ship a known default.
  const generated = randomBytes(12).toString('base64url');
  const fallbackEmail = 'admin@localhost';
  db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')").run(
    fallbackEmail,
    hashPassword(generated),
    'Store Owner',
  );
  console.log(
    '\n' +
      '  ┌──────────────────────────────────────────────────────────────┐\n' +
      '  │  ADMINISTRATOR ACCOUNT CREATED                               │\n' +
      '  ├──────────────────────────────────────────────────────────────┤\n' +
      `  │  Email     ${fallbackEmail.padEnd(50)}│\n` +
      `  │  Password  ${generated.padEnd(50)}│\n` +
      '  ├──────────────────────────────────────────────────────────────┤\n' +
      '  │  Shown once. Change it after signing in, or set              │\n' +
      '  │  ADMIN_EMAIL / ADMIN_PASSWORD before first start.            │\n' +
      '  └──────────────────────────────────────────────────────────────┘\n',
  );
}

function seedSettings() {
  if (!getSetting('product_template', null)) setSetting('product_template', defaultProductTemplate);
  if (!getSetting('product_page_config', null)) setSetting('product_page_config', defaultProductPageConfig);
  if (!getSetting('promo_banners', null)) setSetting('promo_banners', defaultPromoBanners);
  if (!getSetting('features', null)) setSetting('features', defaultFeatures);
  if (!getSetting('category_grid', null)) setSetting('category_grid', defaultCategoryGrid);

  // Site structure — all editable in the admin, all persisted here.
  if (!getSetting('menu', null)) {
    setSetting('menu', [
      { id: 'm1', title: { en: 'Home', ar: 'الرئيسية' }, link: '/', hasMegaMenu: false },
      { id: 'm2', title: { en: 'Catalog', ar: 'المتجر' }, link: '/category/1', hasMegaMenu: true },
      { id: 'm3', title: { en: 'Delivery', ar: 'التوصيل' }, link: '/delivery', hasMegaMenu: false },
      { id: 'm4', title: { en: 'Payment', ar: 'الدفع' }, link: '/payment', hasMegaMenu: false },
      { id: 'm5', title: { en: 'Contacts', ar: 'اتصل بنا' }, link: '/contacts', hasMegaMenu: false },
    ]);
  }
  if (!getSetting('mega_menu', null)) setSetting('mega_menu', megaMenuData);
  if (!getSetting('home_layout', null)) {
    setSetting('home_layout', [
      { id: '1', type: 'hero_slider', visible: true, title: 'Hero Slider' },
      { id: '2', type: 'categories', visible: true, title: 'Browse by Category' },
      { id: '3', type: 'featured_products', visible: true, title: 'Big Savers (Featured)' },
      { id: '4', type: 'promo_banners', visible: true, title: 'Promo Banners Grid' },
      { id: '5', type: 'popular_products', visible: true, title: 'Best Sellers' },
      { id: '6', type: 'features', visible: true, title: 'Store Features / Benefits' },
    ]);
  }
  if (!getSetting('sliders', null)) {
    setSetting('sliders', [
      {
        id: 's1', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        title: 'Play Has No Limits', subtitle: 'Experience the new generation of gaming',
        buttonText: 'Buy Now', link: '/product/1', align: 'left', overlayOpacity: 60,
      },
      {
        id: 's2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        title: 'Level Up Your Style', subtitle: 'New arrivals in sports and outdoors',
        buttonText: 'Discover', link: '/category/2', align: 'center', overlayOpacity: 40,
      },
    ]);
  }

  if (!getSetting('site', null)) {
    setSetting('site', {
      logoText: 'Unitheme',
      logoImage: '',   // uploaded via Settings → Storefront logo
      logoAlt: '',
      logoHeight: 32,
      phone: '+1(917)722-7425',
      currency: 'KWD',
      email: 'support@example.com',
      address: '',
      taxRate: 0,
      freeShippingOver: 0,
      flatShipping: 0,
    });
  }
}

function seedCatalogue() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get() as any;
  if (count.n > 0) return;

  console.log('[seed] Importing the demo catalogue…');

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, name_ar, slug, image, sort) VALUES (?,?,?,?,?,?)');
  const CATEGORY_AR: Record<string, string> = {
    '1': 'إلكترونيات', '2': 'تلفزيونات وفيديو', '3': 'ألعاب فيديو', '4': 'كاميرات وتصوير',
    '5': 'هواتف محمولة', '6': 'رياضة وأنشطة خارجية', '7': 'ملابس', '8': 'إلكترونيات السيارات',
  };
  mockCategories.forEach((c, i) => insertCategory.run(c.id, c.name, CATEGORY_AR[c.id] || '', c.slug, c.image, i));

  const insertProduct = db.prepare(`
    INSERT INTO products (id, title, slug, code, brand, category_id, price, old_price, discount,
                          in_stock, stock, rating, reviews_count, is_new, is_popular, is_bestseller,
                          on_sale, published, extra, cost_price)
    VALUES (@id, @title, @slug, @code, @brand, @category_id, @price, @old_price, @discount,
            @in_stock, @stock, @rating, @reviews_count, @is_new, @is_popular, @is_bestseller,
            @on_sale, @published, @extra, @cost_price)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, author, flag, rating, text, pros, cons, media, verified,
                         usage_duration, model_color, model_size, model_name, model_link,
                         helpful_yes, helpful_no, admin_reply, status, highlight, created_at)
    VALUES (@product_id, @author, @flag, @rating, @text, @pros, @cons, @media, @verified,
            @usage_duration, @model_color, @model_size, @model_name, @model_link,
            @helpful_yes, @helpful_no, @admin_reply, 'approved', @highlight, @created_at)
  `);

  for (const p of mockProducts) {
    const { reviewList, ...rest } = p as any;
    const row = productToRow(rest);
    insertProduct.run({
      id: p.id,
      ...row,
      slug: row.slug || String(p.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120),
    });

    for (const r of reviewList || []) {
      insertReview.run({
        product_id: p.id,
        author: r.author || 'Anonymous',
        flag: r.flag || '',
        rating: Number(r.rating) || 5,
        text: r.text || '',
        pros: r.pros || '',
        cons: r.cons || '',
        media: JSON.stringify(r.media || []),
        verified: r.verified ? 1 : 0,
        usage_duration: r.usageDuration || '',
        model_color: r.modelColor || '',
        model_size: r.modelSize || '',
        model_name: r.modelName || '',
        model_link: r.modelLink || '',
        helpful_yes: Number(r.helpfulYes) || 0,
        helpful_no: Number(r.helpfulNo) || 0,
        admin_reply: r.adminReply || '',
        highlight: r.highlightPositive ? 'positive' : r.highlightCritical ? 'critical' : '',
        created_at: (r.dateISO || new Date().toISOString()).slice(0, 19).replace('T', ' '),
      });
    }
  }

  // Ratings are always derived from real review rows. Seeding an aggregate that
  // no review backs up produces a storefront that contradicts itself ("4.9 from
  // 412 reviews" above an empty list), so every product is recalculated.
  for (const p of mockProducts) recalcProductRating(p.id);

  console.log(`[seed] ${mockProducts.length} products imported.`);
}
