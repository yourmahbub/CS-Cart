import { Router, type Request, type Response } from 'express';
import { randomBytes } from 'node:crypto';
import {
  db, transaction, getSetting, setSetting, rowToProduct, productToRow, rowToReview, recalcProductRating,
} from './db';
import {
  hashPassword, verifyPassword, validatePassword, validateEmail,
  createSession, destroySession, loadUser, requireAuth, requireAdmin, rateLimit, readCookie,
} from './auth';
import { createStripeCheckout, stripeEnabled } from './payments';
import { saveDataUrl, deleteUpload, UploadError } from './uploads';
import { resolveCurrency, roundToCurrency } from '../src/lib/currency';

export const api = Router();
api.use(loadUser);

const str = (v: unknown, max = 500) => String(v ?? '').trim().slice(0, max);
const int = (v: unknown, def = 0) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : def);

/* ================================================================== */
/* Auth                                                                */
/* ================================================================== */

const publicUser = (u: any) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

api.post('/auth/register', rateLimit(10, 15 * 60_000), (req, res) => {
  const email = str(req.body?.email, 254).toLowerCase();
  const name = str(req.body?.name, 120);
  const password = String(req.body?.password ?? '');

  if (!validateEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });
  if (!name) return res.status(400).json({ error: 'Enter your name.' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'An account with that email already exists.' });

  const info = db
    .prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'customer')")
    .run(email, hashPassword(password), name);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid)) as any;
  createSession(res, user.id);
  adoptGuestCart(req, user.id);
  res.status(201).json({ user: publicUser(user) });
});

api.post('/auth/login', rateLimit(10, 15 * 60_000), (req, res) => {
  const email = str(req.body?.email, 254).toLowerCase();
  const password = String(req.body?.password ?? '');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  // Same response either way so the endpoint can't be used to enumerate accounts.
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  createSession(res, user.id);
  adoptGuestCart(req, user.id);
  res.json({ user: publicUser(user) });
});

api.post('/auth/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

api.get('/auth/me', (req, res) => {
  res.json({ user: (req as any).user ?? null });
});

api.post('/auth/password', requireAuth, rateLimit(10, 15 * 60_000), (req, res) => {
  const me = (req as any).user;
  const current = String(req.body?.currentPassword ?? '');
  const next = String(req.body?.newPassword ?? '');

  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(me.id) as any;
  if (!verifyPassword(current, row.password_hash)) {
    return res.status(401).json({ error: 'Your current password is incorrect.' });
  }
  const pwError = validatePassword(next);
  if (pwError) return res.status(400).json({ error: pwError });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), me.id);
  // Force other devices to sign in again.
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(me.id);
  createSession(res, me.id);
  res.json({ ok: true });
});

/* ================================================================== */
/* Catalogue (public reads)                                            */
/* ================================================================== */

api.get('/products', (req, res) => {
  // NOTE: must be an arrow, not a bare reference — `.map(rowToProduct)` would
  // pass the array index as `includeCost` and leak cost price for every item
  // after the first.
  const all = db
    .prepare('SELECT * FROM products WHERE published = 1 ORDER BY id')
    .all()
    .map((row) => rowToProduct(row));
  res.json({ products: all });
});

api.get('/products/:id', (req, res) => {
  // Accepts either the numeric id or the slug, so the pretty URL the admin
  // advertises in its search-engine preview actually resolves.
  const key = String(req.params.id ?? '');
  const row = (/^[0-9]+$/.test(key)
    ? db.prepare('SELECT * FROM products WHERE id = ?').get(Number(key))
    : db.prepare('SELECT * FROM products WHERE slug = ?').get(key)) as any;
  if (!row || !row.published) return res.status(404).json({ error: 'Product not found.' });

  const reviews = db
    .prepare("SELECT * FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC")
    .all(row.id)
    .map(rowToReview);

  res.json({ product: { ...rowToProduct(row), reviewList: reviews } });
});

const rowToCategory = (c: any) => ({
  id: c.id, name: c.name, nameAr: c.name_ar || '', slug: c.slug, image: c.image, sort: c.sort,
});

api.get('/categories', (_req, res) => {
  res.json({ categories: db.prepare('SELECT * FROM categories ORDER BY sort, name').all().map(rowToCategory) });
});

/* ================================================================== */
/* Catalogue (admin writes)                                            */
/* ================================================================== */

api.get('/admin/products', requireAdmin, (_req, res) => {
  res.json({
    products: db.prepare('SELECT * FROM products ORDER BY id').all().map((r: any) => rowToProduct(r, true)),
  });
});

api.post('/admin/products', requireAdmin, (req, res) => {
  const p = req.body?.product;
  if (!p || !str(p.title)) return res.status(400).json({ error: 'A product title is required.' });
  const row = productToRow(p);
  const info = db
    .prepare(`INSERT INTO products (title, slug, code, brand, category_id, price, old_price, discount,
              in_stock, stock, rating, reviews_count, is_new, is_popular, is_bestseller, on_sale, published, extra, cost_price)
              VALUES (@title,@slug,@code,@brand,@category_id,@price,@old_price,@discount,@in_stock,@stock,
                      @rating,@reviews_count,@is_new,@is_popular,@is_bestseller,@on_sale,@published,@extra,@cost_price)`)
    .run(row);
  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json({ product: rowToProduct(created, true) });
});

api.put('/admin/products/:id', requireAdmin, (req, res) => {
  const id = int(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  const row = productToRow({ ...rowToProduct(existing, true), ...req.body?.product });
  db.prepare(`UPDATE products SET title=@title, slug=@slug, code=@code, brand=@brand, category_id=@category_id,
              price=@price, old_price=@old_price, discount=@discount, in_stock=@in_stock, stock=@stock,
              rating=@rating, reviews_count=@reviews_count, is_new=@is_new, is_popular=@is_popular,
              is_bestseller=@is_bestseller, on_sale=@on_sale, published=@published, extra=@extra,
              cost_price=@cost_price, updated_at=datetime('now') WHERE id=@id`)
    .run({ ...row, id });

  res.json({ product: rowToProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id), true) });
});

api.delete('/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(int(req.params.id));
  res.json({ ok: true });
});

/* ================================================================== */
/* Reviews                                                             */
/* ================================================================== */

api.post('/products/:id/reviews', rateLimit(8, 60 * 60_000), (req, res) => {
  const productId = int(req.params.id);
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const cfg = getSetting<any>('product_page_config', {});
  const rules = cfg?.reviews ?? {};
  const me = (req as any).user;

  if (rules.requirePurchase) {
    if (!me) return res.status(401).json({ error: 'Sign in to review this product.' });
    const bought = db
      .prepare(`SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
                 WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('paid','shipped','completed') LIMIT 1`)
      .get(me.id, productId);
    if (!bought) return res.status(403).json({ error: 'Only verified buyers can review this product.' });
  }

  const rating = Math.max(1, Math.min(5, int(req.body?.rating, 5)));
  const text = str(req.body?.text, 5000);
  const author = str(req.body?.author, 120) || me?.name || 'Anonymous';
  if (!text) return res.status(400).json({ error: 'Please write your review.' });

  // Data-URI uploads are capped so a review cannot blow up the database.
  const media = (Array.isArray(req.body?.media) ? req.body.media : [])
    .filter((m: unknown) => typeof m === 'string' && m.length < 2_000_000)
    .slice(0, 6);

  const verified = me
    ? !!db.prepare(`SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
                     WHERE o.user_id = ? AND oi.product_id = ? LIMIT 1`).get(me.id, productId)
    : false;

  const info = db
    .prepare(`INSERT INTO reviews (product_id, user_id, author, rating, text, pros, cons, media, verified, status)
              VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(
      productId, me?.id ?? null, author, rating, text,
      str(req.body?.pros, 1000), str(req.body?.cons, 1000),
      JSON.stringify(media), verified ? 1 : 0,
      rules.autoApprove ? 'approved' : 'pending',
    );

  recalcProductRating(productId);
  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json({ review: rowToReview(created), pending: !rules.autoApprove });
});

api.post('/reviews/:id/vote', rateLimit(60, 60_000), (req, res) => {
  const id = int(req.params.id);
  const direction = req.body?.direction === 'down' ? 'down' : 'up';
  const me = (req as any).user;
  // One vote per signed-in user, or per guest cart token.
  const voter = me ? `u${me.id}` : `g${readCookie(req, 'cart') ?? req.ip}`;

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  if (!review) return res.status(404).json({ error: 'Review not found.' });

  const already = db.prepare('SELECT direction FROM review_votes WHERE review_id = ? AND voter = ?').get(id, voter) as any;
  if (already) return res.status(409).json({ error: 'You have already voted on this review.' });

  db.prepare('INSERT INTO review_votes (review_id, voter, direction) VALUES (?,?,?)').run(id, voter, direction);
  db.prepare(`UPDATE reviews SET helpful_yes = helpful_yes + ?, helpful_no = helpful_no + ? WHERE id = ?`)
    .run(direction === 'up' ? 1 : 0, direction === 'down' ? 1 : 0, id);

  const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
  res.json({ review: rowToReview(updated) });
});

api.get('/admin/reviews', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(`SELECT r.*, p.title AS product_title FROM reviews r
              JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC`)
    .all() as any[];
  res.json({ reviews: rows.map((r) => ({ ...rowToReview(r), productId: r.product_id, productTitle: r.product_title })) });
});

api.put('/admin/reviews/:id', requireAdmin, (req, res) => {
  const id = int(req.params.id);
  const r = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  if (!r) return res.status(404).json({ error: 'Review not found.' });

  const b = req.body?.review ?? {};
  const highlight = b.highlightPositive ? 'positive' : b.highlightCritical ? 'critical' : r.highlight;
  db.prepare(`UPDATE reviews SET author=?, flag=?, rating=?, text=?, pros=?, cons=?, verified=?,
              usage_duration=?, model_color=?, model_size=?, model_name=?, model_link=?,
              helpful_yes=?, helpful_no=?, admin_reply=?, status=?, highlight=?, media=? WHERE id=?`)
    .run(
      str(b.author ?? r.author, 120), str(b.flag ?? r.flag, 16),
      Math.max(1, Math.min(5, int(b.rating ?? r.rating, r.rating))),
      str(b.text ?? r.text, 5000), str(b.pros ?? r.pros, 1000), str(b.cons ?? r.cons, 1000),
      (b.verified ?? !!r.verified) ? 1 : 0,
      str(b.usageDuration ?? r.usage_duration, 120), str(b.modelColor ?? r.model_color, 80),
      str(b.modelSize ?? r.model_size, 80), str(b.modelName ?? r.model_name, 300),
      str(b.modelLink ?? r.model_link, 300),
      int(b.helpfulYes ?? r.helpful_yes), int(b.helpfulNo ?? r.helpful_no),
      str(b.adminReply ?? r.admin_reply, 3000),
      ['approved', 'pending', 'rejected'].includes(b.status) ? b.status : r.status,
      highlight,
      JSON.stringify(Array.isArray(b.media) ? b.media.slice(0, 6) : JSON.parse(r.media || '[]')),
      id,
    );

  recalcProductRating(r.product_id);
  res.json({ review: rowToReview(db.prepare('SELECT * FROM reviews WHERE id = ?').get(id)) });
});

api.delete('/admin/reviews/:id', requireAdmin, (req, res) => {
  const r = db.prepare('SELECT product_id FROM reviews WHERE id = ?').get(int(req.params.id)) as any;
  db.prepare('DELETE FROM reviews WHERE id = ?').run(int(req.params.id));
  if (r) recalcProductRating(r.product_id);
  res.json({ ok: true });
});

/* ================================================================== */
/* Cart — survives refresh, follows the customer across devices        */
/* ================================================================== */

function cartToken(req: Request, res: Response): string {
  let token = readCookie(req, 'cart');
  if (!token) {
    token = randomBytes(24).toString('base64url');
    res.cookie('cart', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 90 * 864e5),
      path: '/',
    });
  }
  return token;
}

/** Merge whatever a guest collected into their account cart on sign-in. */
function adoptGuestCart(req: Request, userId: number) {
  const token = readCookie(req, 'cart');
  if (!token) return;
  const guest = db.prepare('SELECT items FROM carts WHERE token = ?').get(token) as any;
  if (!guest) return;
  db.prepare('UPDATE carts SET user_id = ? WHERE token = ?').run(userId, token);
}

function loadCart(token: string) {
  const row = db.prepare('SELECT items FROM carts WHERE token = ?').get(token) as any;
  try { return row ? JSON.parse(row.items) : []; } catch { return []; }
}

function saveCart(token: string, userId: number | null, items: any[]) {
  db.prepare(`INSERT INTO carts (token, user_id, items, updated_at) VALUES (?,?,?,datetime('now'))
              ON CONFLICT(token) DO UPDATE SET items = excluded.items, user_id = COALESCE(excluded.user_id, carts.user_id),
              updated_at = datetime('now')`)
    .run(token, userId, JSON.stringify(items));
}

/** Re-prices every line against the database — the client price is never trusted. */
function priceCart(items: any[]) {
  const cfg = getSetting<any>('product_page_config', {});
  const site = getSetting<any>('site', {});
  const plans: any[] = cfg?.servicePlan?.options ?? [];

  const lines = items
    .map((item) => {
      const p = db.prepare('SELECT * FROM products WHERE id = ? AND published = 1').get(int(item.productId)) as any;
      if (!p) return null;
      const quantity = Math.max(1, Math.min(99, int(item.quantity, 1)));
      const plan = plans.find((o) => o.id === item.servicePlan);
      const unitPrice = Number(p.price) + (plan ? Number(plan.price) || 0 : 0);
      const product = rowToProduct(p);
      return {
        productId: p.id,
        title: p.title,
        code: p.code,
        image: product.image || (product.images?.[0] ?? ''),
        unitPrice,
        unitCost: Number(p.cost_price) || 0,
        quantity,
        lineTotal: unitPrice * quantity,
        inStock: !!p.in_stock,
        stock: p.stock,
        options: {
          color: str(item.color, 80) || undefined,
          size: str(item.size, 80) || undefined,
          guarantee: str(item.guarantee, 80) || undefined,
          servicePlan: plan?.label,
        },
        servicePlan: plan?.id,
        color: str(item.color, 80),
        size: str(item.size, 80),
        guarantee: str(item.guarantee, 80),
      };
    })
    .filter(Boolean) as any[];

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const freeOver = Number(site.freeShippingOver) || 0;
  const flat = Number(site.flatShipping) || 0;
  const shipping = lines.length === 0 || (freeOver > 0 && subtotal >= freeOver) ? 0 : flat;
  const tax = Math.round(subtotal * ((Number(site.taxRate) || 0) / 100) * 100) / 100;

  return { lines, subtotal, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}

api.get('/cart', (req, res) => {
  const token = cartToken(req, res);
  res.json(priceCart(loadCart(token)));
});

api.put('/cart', (req, res) => {
  const token = cartToken(req, res);
  const me = (req as any).user;
  const incoming = Array.isArray(req.body?.items) ? req.body.items.slice(0, 50) : [];
  const items = incoming.map((i: any) => ({
    productId: int(i.productId),
    quantity: Math.max(1, Math.min(99, int(i.quantity, 1))),
    color: str(i.color, 80),
    size: str(i.size, 80),
    guarantee: str(i.guarantee, 80),
    servicePlan: str(i.servicePlan, 80),
  }));
  saveCart(token, me?.id ?? null, items);
  res.json(priceCart(items));
});

/* ================================================================== */
/* Checkout & orders                                                   */
/* ================================================================== */

api.get('/checkout/options', (_req, res) => {
  const cfg = getSetting<any>('product_page_config', {});
  const methods = [
    { id: 'cod', label: 'Cash on delivery', enabled: true },
    { id: 'bank', label: 'Bank transfer', enabled: true },
    { id: 'stripe', label: 'Card payment', enabled: stripeEnabled() },
  ].filter((m) => m.enabled);
  res.json({ paymentMethods: methods, deliveryMethods: cfg?.delivery?.methods?.filter((m: any) => m.enabled) ?? [] });
});

api.post('/checkout', rateLimit(20, 15 * 60_000), async (req, res) => {
  const token = cartToken(req, res);
  const me = (req as any).user;
  const priced = priceCart(loadCart(token));

  if (priced.lines.length === 0) return res.status(400).json({ error: 'Your cart is empty.' });

  const outOfStock = priced.lines.find((l) => !l.inStock);
  if (outOfStock) return res.status(409).json({ error: `"${outOfStock.title}" is out of stock.` });

  const email = str(req.body?.email, 254).toLowerCase() || me?.email;
  if (!validateEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const addr = req.body?.address ?? {};
  const required = ['fullName', 'line1', 'city', 'postcode', 'country'];
  for (const field of required) {
    if (!str(addr[field])) return res.status(400).json({ error: `Shipping address: ${field} is required.` });
  }

  const method = ['cod', 'bank', 'stripe'].includes(req.body?.paymentMethod) ? req.body.paymentMethod : 'cod';
  if (method === 'stripe' && !stripeEnabled()) {
    return res.status(400).json({ error: 'Card payment is not configured.' });
  }

  const number = `${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

  const orderId = transaction(() => {
    const info = db
      .prepare(`INSERT INTO orders (number, user_id, email, phone, status, payment_method, payment_status,
                currency, subtotal, shipping, tax, total, shipping_addr, shipping_method, note)
                VALUES (?,?,?,?,'pending',?,'unpaid',?,?,?,?,?,?,?,?)`)
      .run(
        number, me?.id ?? null, email, str(req.body?.phone, 40), method,
        resolveCurrency(getSetting<any>('site', {}).currency).code,
        priced.subtotal, priced.shipping, priced.tax, priced.total,
        JSON.stringify({
          fullName: str(addr.fullName, 160), line1: str(addr.line1, 200), line2: str(addr.line2, 200),
          city: str(addr.city, 120), region: str(addr.region, 120),
          postcode: str(addr.postcode, 32), country: str(addr.country, 80),
        }),
        str(req.body?.shippingMethod, 80),
        str(req.body?.note, 1000),
      );

    const id = Number(info.lastInsertRowid);
    const addItem = db.prepare(`INSERT INTO order_items (order_id, product_id, title, code, image, unit_price, unit_cost, quantity, options)
                                VALUES (?,?,?,?,?,?,?,?,?)`);
    for (const l of priced.lines) {
      addItem.run(id, l.productId, l.title, l.code, l.image, l.unitPrice, l.unitCost || 0, l.quantity, JSON.stringify(l.options));
      // Decrement tracked stock and flag the product when it runs out.
      db.prepare(`UPDATE products SET stock = MAX(0, stock - ?),
                  in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE in_stock END WHERE id = ?`)
        .run(l.quantity, l.quantity, l.productId);
    }
    return id;
  });

  saveCart(token, me?.id ?? null, []);

  if (method === 'stripe') {
    try {
      const session = await createStripeCheckout({
        orderId, number, email,
        currency: String(getSetting<any>('site', {}).currency || 'KWD').toLowerCase(),
        lines: priced.lines,
        shipping: priced.shipping, tax: priced.tax,
        origin: `${req.protocol}://${req.get('host')}`,
      });
      db.prepare('UPDATE orders SET payment_ref = ? WHERE id = ?').run(session.id, orderId);
      return res.status(201).json({ orderNumber: number, redirectUrl: session.url });
    } catch (err: any) {
      db.prepare("UPDATE orders SET status = 'failed', note = ? WHERE id = ?").run(String(err.message).slice(0, 500), orderId);
      return res.status(502).json({ error: 'Payment could not be started. Please try another method.' });
    }
  }

  res.status(201).json({ orderNumber: number });
});

api.get('/orders', requireAuth, (req, res) => {
  const me = (req as any).user;
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(me.id) as any[];
  res.json({ orders: orders.map(withItems) });
});

api.get('/orders/:number', (req, res) => {
  const me = (req as any).user;
  const order = db.prepare('SELECT * FROM orders WHERE number = ?').get(str(req.params.number, 40)) as any;
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  // A guest may view their own order straight after checkout; otherwise it must be theirs.
  if (order.user_id && (!me || (me.id !== order.user_id && me.role !== 'admin'))) {
    return res.status(403).json({ error: 'You do not have access to this order.' });
  }
  res.json({ order: withItems(order) });
});

function withItems(o: any) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as any[];
  return {
    id: o.id, number: o.number, email: o.email, phone: o.phone, status: o.status,
    paymentMethod: o.payment_method, paymentStatus: o.payment_status,
    currency: o.currency, subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total,
    shippingAddress: (() => { try { return JSON.parse(o.shipping_addr); } catch { return {}; } })(),
    shippingMethod: o.shipping_method, note: o.note, createdAt: o.created_at,
    items: items.map((i) => ({
      productId: i.product_id, title: i.title, code: i.code, image: i.image,
      unitPrice: i.unit_price, quantity: i.quantity,
      options: (() => { try { return JSON.parse(i.options); } catch { return {}; } })(),
    })),
  };
}

/** Admin view of orders — adds cost and profit, which customers never see. */
api.get('/admin/orders', requireAdmin, (_req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all() as any[];
  const costOf = db.prepare(
    'SELECT COALESCE(SUM(unit_cost * quantity), 0) AS c FROM order_items WHERE order_id = ?',
  );
  res.json({
    orders: orders.map((o) => {
      const cost = (costOf.get(o.id) as any).c as number;
      return {
        ...withItems(o),
        cost,
        profit: Math.round((o.subtotal - cost) * 100) / 100,
      };
    }),
  });
});

/** A single order, by numeric id or by the order number shown to the customer. */
api.get('/admin/orders/:id', requireAdmin, (req, res) => {
  const key = String(req.params.id ?? '');
  const order = (/^[0-9]+$/.test(key)
    ? db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(key))
    : db.prepare('SELECT * FROM orders WHERE number = ?').get(key)) as any;
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const cost = (db
    .prepare('SELECT COALESCE(SUM(unit_cost * quantity), 0) AS c FROM order_items WHERE order_id = ?')
    .get(order.id) as any).c as number;

  res.json({ order: { ...withItems(order), cost, profit: Math.round((order.subtotal - cost) * 100) / 100 } });
});

api.put('/admin/orders/:id', requireAdmin, (req, res) => {
  // Accepts the numeric id or the order number, matching the GET above.
  const key = String(req.params.id ?? '');
  const found = (/^[0-9]+$/.test(key)
    ? db.prepare('SELECT id FROM orders WHERE id = ?').get(Number(key))
    : db.prepare('SELECT id FROM orders WHERE number = ?').get(key)) as any;
  if (!found) return res.status(404).json({ error: 'Order not found.' });
  const id = found.id as number;
  const status = str(req.body?.status, 32);
  const paymentStatus = str(req.body?.paymentStatus, 32);
  const allowed = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded', 'failed'];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Unknown order status.' });

  if (status) db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
  if (paymentStatus) db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(paymentStatus, id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order: withItems(order) });
});

api.get('/admin/customers', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(`SELECT u.id, u.email, u.name, u.role, u.created_at,
                     COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent
                FROM users u LEFT JOIN orders o ON o.user_id = u.id
               GROUP BY u.id ORDER BY u.created_at DESC`)
    .all();
  res.json({ customers: rows });
});

/**
 * Dashboard analytics.
 *
 * Everything is aggregated in SQL rather than shipped to the browser, and the
 * same figures are computed for the window immediately before the one asked
 * for, so the dashboard can show movement rather than a bare number.
 *
 * Cancelled and failed orders are excluded from money; they are still counted
 * in the status breakdown so the shop can see them.
 */
api.get('/admin/stats', requireAdmin, (req, res) => {
  const one = (sql: string, ...args: any[]) => (db.prepare(sql).get(...args) as any) ?? {};
  const all = (sql: string, ...args: any[]) => db.prepare(sql).all(...args) as any[];

  // 0 means "everything so far".
  const days = Math.min(Math.max(int(req.query.days, 30), 0), 3650);
  const LIVE = "o.status NOT IN ('cancelled','failed')";

  // The previous window is the same length immediately before, so a 30-day
  // view compares against the 30 days before it.
  const since = days ? "datetime('now', '-" + days + " days')" : "datetime('1970-01-01')";
  const prevSince = days ? "datetime('now', '-" + days * 2 + " days')" : "datetime('1970-01-01')";
  const now = "datetime('now', '+1 day')";

  const money = (from: string, to: string) => {
    const row = one(
      'SELECT COALESCE(SUM(o.total),0) AS revenue, COALESCE(SUM(o.subtotal),0) AS goods, COUNT(*) AS orders' +
      '  FROM orders o WHERE ' + LIVE + ' AND o.created_at >= ' + from + ' AND o.created_at < ' + to,
    );
    const cost = one(
      'SELECT COALESCE(SUM(oi.unit_cost * oi.quantity),0) AS n' +
      '  FROM order_items oi JOIN orders o ON o.id = oi.order_id' +
      ' WHERE ' + LIVE + ' AND o.created_at >= ' + from + ' AND o.created_at < ' + to,
    ).n as number;
    const goods = row.goods as number;
    const revenue = row.revenue as number;
    const orders = row.orders as number;
    const profit = Math.round((goods - cost) * 1000) / 1000;
    return {
      revenue: Math.round(revenue * 1000) / 1000,
      orders,
      goods,
      cost: Math.round(cost * 1000) / 1000,
      profit,
      margin: goods > 0 ? Math.round((profit / goods) * 1000) / 10 : 0,
      aov: orders ? Math.round((revenue / orders) * 1000) / 1000 : 0,
    };
  };

  const current = money(since, now);
  const previous = money(prevSince, since);

  // Daily series for the chart. Days with no orders still need a point, so the
  // gaps are filled here rather than leaving the line to jump across them.
  const rows = all(
    'SELECT date(o.created_at) AS day, COALESCE(SUM(o.total),0) AS revenue, COUNT(*) AS orders' +
    '  FROM orders o WHERE ' + LIVE + ' AND o.created_at >= ' + since +
    ' GROUP BY day ORDER BY day',
  );
  const byDay = new Map(rows.map((r) => [r.day as string, r]));
  const span = days || 30;
  const series: any[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const r = byDay.get(day);
    series.push({
      day,
      revenue: r ? Math.round(r.revenue * 1000) / 1000 : 0,
      orders: r ? r.orders : 0,
    });
  }

  const statusBreakdown = all(
    'SELECT status, COUNT(*) AS n, COALESCE(SUM(total),0) AS total FROM orders' +
    ' WHERE created_at >= ' + since + ' GROUP BY status ORDER BY n DESC',
  );

  const topProducts = all(
    'SELECT oi.product_id AS id, oi.title, oi.image, SUM(oi.quantity) AS units,' +
    '       ROUND(SUM(oi.unit_price * oi.quantity), 3) AS revenue,' +
    '       ROUND(SUM((oi.unit_price - oi.unit_cost) * oi.quantity), 3) AS profit' +
    '  FROM order_items oi JOIN orders o ON o.id = oi.order_id' +
    ' WHERE ' + LIVE + ' AND o.created_at >= ' + since +
    ' GROUP BY oi.product_id, oi.title ORDER BY revenue DESC LIMIT 8',
  );

  const lowStock = all(
    'SELECT id, title, stock, price FROM products WHERE published = 1 AND stock <= 5' +
    ' ORDER BY stock ASC, title LIMIT 8',
  );

  const recentOrders = all(
    'SELECT number, email, status, payment_status, total, created_at FROM orders' +
    ' ORDER BY created_at DESC LIMIT 6',
  ).map((o) => ({
    number: o.number,
    email: o.email,
    status: o.status,
    paymentStatus: o.payment_status,
    total: o.total,
    createdAt: o.created_at,
  }));

  // Things the shop can act on; each maps to a link in the dashboard.
  const tasks = {
    pendingOrders: one("SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','paid','processing')").n,
    pendingReviews: one("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'").n,
    outOfStock: one('SELECT COUNT(*) AS n FROM products WHERE published = 1 AND stock <= 0').n,
    withoutCost: one('SELECT COUNT(*) AS n FROM products WHERE cost_price <= 0').n,
    // unit_cost is snapshotted when the order is placed, so orders taken
    // before a cost price existed report as pure profit. Surfaced so the
    // dashboard can say the margin is understated rather than imply it is exact.
    linesWithoutCost: one(
      'SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id' +
      ' WHERE ' + LIVE + ' AND o.created_at >= ' + since + ' AND oi.unit_cost <= 0',
    ).n,
    unpublished: one('SELECT COUNT(*) AS n FROM products WHERE published = 0').n,
    // A bilingual storefront quietly falls back to English when Arabic is
    // missing, so an untranslated catalogue is easy to ship without noticing.
    withoutArabic: one(
      "SELECT COUNT(*) AS n FROM products WHERE COALESCE(json_extract(extra, '$.i18n.ar.title'), '') = ''",
    ).n,
    categoriesWithoutArabic: one("SELECT COUNT(*) AS n FROM categories WHERE COALESCE(name_ar,'') = ''").n,
  };

  const totals = {
    orders: one('SELECT COUNT(*) AS n FROM orders').n,
    customers: one("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'").n,
    products: one('SELECT COUNT(*) AS n FROM products').n,
    categories: one('SELECT COUNT(*) AS n FROM categories').n,
  };

  res.json({
    days, current, previous, series, statusBreakdown,
    topProducts, lowStock, recentOrders, tasks, totals,
  });
});

/* ================================================================== */
/* Uploads                                                             */
/* ================================================================== */

api.post('/admin/upload', requireAdmin, rateLimit(60, 60 * 60_000), (req, res) => {
  try {
    res.status(201).json(saveDataUrl(req.body?.file));
  } catch (err: any) {
    if (err instanceof UploadError) return res.status(400).json({ error: err.message });
    console.error('[upload] failed:', err);
    res.status(500).json({ error: 'The image could not be saved.' });
  }
});

api.delete('/admin/upload', requireAdmin, (req, res) => {
  res.json({ deleted: deleteUpload(req.body?.url) });
});

/* ================================================================== */
/* Store settings                                                      */
/* ================================================================== */

const allSettings = () => ({
  site: getSetting('site', {}),
  productTemplate: getSetting('product_template', {}),
  productPageConfig: getSetting('product_page_config', {}),
  menu: getSetting('menu', []),
  megaMenu: getSetting('mega_menu', []),
  homeLayout: getSetting('home_layout', []),
  sliders: getSetting('sliders', []),
  promoBanners: getSetting('promo_banners', {}),
  features: getSetting('features', {}),
  categoryGrid: getSetting('category_grid', {}),
});

api.get('/settings', (_req, res) => res.json(allSettings()));

api.put('/admin/settings', requireAdmin, (req, res) => {
  const b = req.body ?? {};
  if (b.site) setSetting('site', b.site);
  if (b.productTemplate) setSetting('product_template', b.productTemplate);
  if (b.productPageConfig) setSetting('product_page_config', b.productPageConfig);
  if (Array.isArray(b.menu)) setSetting('menu', b.menu.slice(0, 40));
  if (Array.isArray(b.megaMenu)) setSetting('mega_menu', b.megaMenu.slice(0, 60));
  if (Array.isArray(b.homeLayout)) setSetting('home_layout', b.homeLayout.slice(0, 40));
  if (Array.isArray(b.sliders)) setSetting('sliders', b.sliders.slice(0, 30));
  if (b.promoBanners && typeof b.promoBanners === 'object') setSetting('promo_banners', b.promoBanners);
  if (b.features && typeof b.features === 'object') setSetting('features', b.features);
  if (b.categoryGrid && typeof b.categoryGrid === 'object') setSetting('category_grid', b.categoryGrid);
  res.json(allSettings());
});

/* ================================================================== */
/* Categories                                                          */
/* ================================================================== */

api.post('/admin/categories', requireAdmin, (req, res) => {
  const c = req.body?.category ?? {};
  const name = str(c.name, 160);
  if (!name) return res.status(400).json({ error: 'A category name is required.' });

  const id = str(c.id, 60) || `c_${Date.now()}`;
  const slug = str(c.slug, 160) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const next = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM categories').get() as any;

  try {
    db.prepare('INSERT INTO categories (id, name, name_ar, slug, image, sort) VALUES (?,?,?,?,?,?)')
      .run(id, name, str(c.nameAr, 160), slug, str(c.image, 1000), int(c.sort, next.n));
  } catch {
    return res.status(409).json({ error: 'A category with that id already exists.' });
  }
  res.status(201).json({ category: rowToCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(id)) });
});

api.put('/admin/categories/:id', requireAdmin, (req, res) => {
  const id = str(req.params.id, 60);
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Category not found.' });

  const c = req.body?.category ?? {};
  db.prepare('UPDATE categories SET name = ?, name_ar = ?, slug = ?, image = ?, sort = ? WHERE id = ?').run(
    str(c.name ?? existing.name, 160),
    str(c.nameAr ?? existing.name_ar, 160),
    str(c.slug ?? existing.slug, 160),
    str(c.image ?? existing.image, 1000),
    int(c.sort ?? existing.sort),
    id,
  );
  res.json({ category: rowToCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(id)) });
});

api.delete('/admin/categories/:id', requireAdmin, (req, res) => {
  const id = str(req.params.id, 60);
  const inUse = db.prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?').get(id) as any;
  if (inUse.n > 0) {
    return res.status(409).json({ error: `${inUse.n} product(s) still use this category. Move them first.` });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

/* ================================================================== */
/* CMS pages                                                           */
/* ================================================================== */

const rowToPage = (p: any) => ({
  id: p.id, slug: p.slug,
  title: p.title, titleAr: p.title_ar || '',
  content: p.content, contentAr: p.content_ar || '',
  published: !!p.published, sort: p.sort,
});

api.get('/pages', (_req, res) => {
  res.json({
    pages: db.prepare('SELECT * FROM pages WHERE published = 1 ORDER BY sort, title').all().map(rowToPage),
  });
});

api.get('/pages/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(str(req.params.slug, 160)) as any;
  if (!page || !page.published) return res.status(404).json({ error: 'Page not found.' });
  res.json({ page: rowToPage(page) });
});

api.get('/admin/pages', requireAdmin, (_req, res) => {
  res.json({ pages: db.prepare('SELECT * FROM pages ORDER BY sort, title').all().map(rowToPage) });
});

api.post('/admin/pages', requireAdmin, (req, res) => {
  const p = req.body?.page ?? {};
  const title = str(p.title, 200);
  if (!title) return res.status(400).json({ error: 'A page title is required.' });
  const slug = (str(p.slug, 160) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

  try {
    const info = db.prepare('INSERT INTO pages (slug, title, title_ar, content, content_ar, published, sort) VALUES (?,?,?,?,?,?,?)')
      .run(slug, title, str(p.titleAr, 200), str(p.content, 200_000), str(p.contentAr, 200_000),
           p.published === false ? 0 : 1, int(p.sort));
    res.status(201).json({ page: rowToPage(db.prepare('SELECT * FROM pages WHERE id = ?').get(Number(info.lastInsertRowid))) });
  } catch {
    res.status(409).json({ error: 'A page with that URL already exists.' });
  }
});

api.put('/admin/pages/:id', requireAdmin, (req, res) => {
  const id = int(req.params.id);
  const existing = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Page not found.' });

  const p = req.body?.page ?? {};
  try {
    db.prepare(`UPDATE pages SET slug=?, title=?, title_ar=?, content=?, content_ar=?, published=?, sort=?,
                updated_at=datetime('now') WHERE id=?`)
      .run(
        str(p.slug ?? existing.slug, 160),
        str(p.title ?? existing.title, 200),
        str(p.titleAr ?? existing.title_ar, 200),
        str(p.content ?? existing.content, 200_000),
        str(p.contentAr ?? existing.content_ar, 200_000),
        (p.published ?? !!existing.published) ? 1 : 0,
        int(p.sort ?? existing.sort),
        id,
      );
  } catch {
    return res.status(409).json({ error: 'Another page already uses that URL.' });
  }
  res.json({ page: rowToPage(db.prepare('SELECT * FROM pages WHERE id = ?').get(id)) });
});

api.delete('/admin/pages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM pages WHERE id = ?').run(int(req.params.id));
  res.json({ ok: true });
});
