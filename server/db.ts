import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || resolve(process.cwd(), 'data', 'store.db');
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'customer',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS categories (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  sort  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  slug          TEXT    NOT NULL DEFAULT '',
  code          TEXT    NOT NULL DEFAULT '',
  brand         TEXT    NOT NULL DEFAULT '',
  category_id   TEXT,
  price         REAL    NOT NULL DEFAULT 0,
  old_price     REAL,
  discount      INTEGER NOT NULL DEFAULT 0,
  in_stock      INTEGER NOT NULL DEFAULT 1,
  stock         INTEGER NOT NULL DEFAULT 0,
  rating        REAL    NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_new        INTEGER NOT NULL DEFAULT 0,
  is_popular    INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  on_sale       INTEGER NOT NULL DEFAULT 0,
  published     INTEGER NOT NULL DEFAULT 1,
  extra         TEXT    NOT NULL DEFAULT '{}',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);

CREATE TABLE IF NOT EXISTS reviews (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author         TEXT    NOT NULL,
  flag           TEXT    NOT NULL DEFAULT '',
  rating         INTEGER NOT NULL,
  text           TEXT    NOT NULL DEFAULT '',
  pros           TEXT    NOT NULL DEFAULT '',
  cons           TEXT    NOT NULL DEFAULT '',
  media          TEXT    NOT NULL DEFAULT '[]',
  verified       INTEGER NOT NULL DEFAULT 0,
  usage_duration TEXT    NOT NULL DEFAULT '',
  model_color    TEXT    NOT NULL DEFAULT '',
  model_size     TEXT    NOT NULL DEFAULT '',
  model_name     TEXT    NOT NULL DEFAULT '',
  model_link     TEXT    NOT NULL DEFAULT '',
  helpful_yes    INTEGER NOT NULL DEFAULT 0,
  helpful_no     INTEGER NOT NULL DEFAULT 0,
  admin_reply    TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'pending',
  highlight      TEXT    NOT NULL DEFAULT '',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, status);

CREATE TABLE IF NOT EXISTS review_votes (
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter     TEXT    NOT NULL,
  direction TEXT    NOT NULL,
  PRIMARY KEY (review_id, voter)
);

CREATE TABLE IF NOT EXISTS carts (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  items      TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  number         TEXT    NOT NULL UNIQUE,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email          TEXT    NOT NULL,
  phone          TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'pending',
  payment_method TEXT    NOT NULL DEFAULT 'cod',
  payment_status TEXT    NOT NULL DEFAULT 'unpaid',
  payment_ref    TEXT    NOT NULL DEFAULT '',
  currency       TEXT    NOT NULL DEFAULT 'USD',
  subtotal       REAL    NOT NULL DEFAULT 0,
  shipping       REAL    NOT NULL DEFAULT 0,
  tax            REAL    NOT NULL DEFAULT 0,
  total          REAL    NOT NULL DEFAULT 0,
  shipping_addr  TEXT    NOT NULL DEFAULT '{}',
  shipping_method TEXT   NOT NULL DEFAULT '',
  note           TEXT    NOT NULL DEFAULT '',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  title      TEXT    NOT NULL,
  code       TEXT    NOT NULL DEFAULT '',
  image      TEXT    NOT NULL DEFAULT '',
  unit_price REAL    NOT NULL,
  quantity   INTEGER NOT NULL,
  options    TEXT    NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL UNIQUE,
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL DEFAULT '',
  published  INTEGER NOT NULL DEFAULT 1,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
`);

/* ------------------------------------------------------------------ */
/* Migrations                                                          */
/* ------------------------------------------------------------------ */

/** Adds a column only when it is missing, so restarts and upgrades are safe. */
function addColumn(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  if (cols.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`[db] migrated: ${table}.${column}`);
}

// Arabic translations for content that is not stored as JSON.
addColumn('categories', 'name_ar', "TEXT NOT NULL DEFAULT ''");
addColumn('pages', 'title_ar', "TEXT NOT NULL DEFAULT ''");
addColumn('pages', 'content_ar', "TEXT NOT NULL DEFAULT ''");

// What the item costs you. Never sent to the storefront — see rowToProduct.
addColumn('products', 'cost_price', 'REAL NOT NULL DEFAULT 0');
// Cost captured at the moment of sale, so historical profit stays accurate
// even after the supplier price changes.
addColumn('order_items', 'unit_cost', 'REAL NOT NULL DEFAULT 0');

/**
 * Runs `fn` inside a transaction. node:sqlite has no `db.transaction()` helper,
 * so the statements are issued directly and rolled back on any throw.
 */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* already unwound */ }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Settings helpers                                                    */
/* ------------------------------------------------------------------ */

export function getSetting<T>(key: string, fallback: T): T {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function setSetting(key: string, value: unknown) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, JSON.stringify(value));
}

/* ------------------------------------------------------------------ */
/* Product row <-> API object                                          */
/* ------------------------------------------------------------------ */

const COLUMN_FIELDS = new Set([
  'id', 'title', 'slug', 'code', 'brand', 'categoryId', 'price', 'oldPrice', 'discount',
  'inStock', 'stock', 'rating', 'reviews', 'isNew', 'isPopular', 'isBestseller', 'onSale', 'published',
  'costPrice',
]);

/**
 * @param includeCost  Only ever true on admin routes. Cost price is internal
 *                     business data and must not reach the storefront.
 */
export function rowToProduct(row: any, includeCost = false) {
  const extra = (() => {
    try { return JSON.parse(row.extra || '{}'); } catch { return {}; }
  })();
  return {
    ...(includeCost ? { costPrice: row.cost_price ?? 0 } : {}),
    ...extra,
    id: row.id,
    title: row.title,
    slug: row.slug,
    code: row.code,
    brand: row.brand,
    categoryId: row.category_id,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    discount: row.discount || undefined,
    inStock: !!row.in_stock,
    stock: row.stock,
    rating: row.rating,
    reviews: row.reviews_count,
    isNew: !!row.is_new,
    isPopular: !!row.is_popular,
    isBestseller: !!row.is_bestseller,
    onSale: !!row.on_sale,
    published: !!row.published,
  };
}

/** Split an incoming product object into indexed columns + a JSON remainder. */
export function productToRow(p: any) {
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (!COLUMN_FIELDS.has(k)) extra[k] = v;
  }
  return {
    title: String(p.title ?? '').slice(0, 500),
    slug: String(p.slug ?? '').slice(0, 300),
    code: String(p.code ?? '').slice(0, 120),
    brand: String(p.brand ?? '').slice(0, 120),
    category_id: p.categoryId ?? null,
    price: Number(p.price) || 0,
    cost_price: Math.max(0, Number(p.costPrice) || 0),
    old_price: p.oldPrice == null || p.oldPrice === '' ? null : Number(p.oldPrice),
    discount: Math.max(0, Math.min(99, Number(p.discount) || 0)),
    in_stock: p.inStock === false ? 0 : 1,
    stock: Number(p.stock) || 0,
    rating: Number(p.rating) || 0,
    reviews_count: Number(p.reviews) || 0,
    is_new: p.isNew ? 1 : 0,
    is_popular: p.isPopular ? 1 : 0,
    is_bestseller: p.isBestseller ? 1 : 0,
    on_sale: p.onSale ? 1 : 0,
    published: p.published === false ? 0 : 1,
    extra: JSON.stringify(extra),
  };
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function rowToReview(r: any) {
  return {
    id: r.id,
    productId: r.product_id,
    author: r.author,
    flag: r.flag,
    rating: r.rating,
    text: r.text,
    pros: r.pros,
    cons: r.cons,
    media: (() => { try { return JSON.parse(r.media || '[]'); } catch { return []; } })(),
    verified: !!r.verified,
    onlyBuyer: !!r.verified,
    usageDuration: r.usage_duration,
    modelColor: r.model_color,
    modelSize: r.model_size,
    modelName: r.model_name,
    modelLink: r.model_link,
    helpfulYes: r.helpful_yes,
    helpfulNo: r.helpful_no,
    adminReply: r.admin_reply,
    status: r.status,
    highlightPositive: r.highlight === 'positive',
    highlightCritical: r.highlight === 'critical',
    dateISO: r.created_at,
    date: new Date(r.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('en-US'),
  };
}

/** Recompute a product's cached rating + review count from approved reviews. */
export function recalcProductRating(productId: number) {
  const agg = db
    .prepare(
      `SELECT COUNT(*) AS n, COALESCE(AVG(rating), 0) AS avg
         FROM reviews WHERE product_id = ? AND status = 'approved'`,
    )
    .get(productId) as any;
  db.prepare('UPDATE products SET rating = ?, reviews_count = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
    Math.round(Number(agg.avg) * 10) / 10,
    Number(agg.n),
    productId,
  );
}
