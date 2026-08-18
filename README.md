# Unitheme Store

A full-stack e-commerce store: React storefront, Express + SQLite API, customer
accounts, cart, checkout, orders and an admin panel.

---

## Quick start

```bash
npm install
cp .env.example .env      # then edit it
npm run dev               # API on :4000, storefront on :3000
```

Open http://localhost:3000. On first start the API creates an administrator and
prints the credentials to the console — set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
`.env` first if you'd rather choose them yourself.

Sign in to the admin panel at http://localhost:3000/admin.

| Script | What it does |
| --- | --- |
| `npm run dev` | API and storefront together, both watching for changes |
| `npm run dev:api` | API only |
| `npm run dev:web` | Storefront only |
| `npm run build` | Builds the storefront into `dist/` |
| `npm start` | Production: one process serving `dist/` **and** the API |
| `npm run typecheck` | TypeScript check across client and server |

---

## How it fits together

```
server/          Express API — the only place secrets and business rules live
  db.ts          SQLite schema, migrations, row mapping
  auth.ts        scrypt password hashing, revocable sessions, rate limiting
  routes.ts      All API endpoints
  payments.ts    Stripe Checkout + webhook verification
  seed.ts        First-run bootstrap (idempotent)
src/             React storefront and admin panel
data/store.db    Your database. THIS FILE IS YOUR STORE — back it up.
```

Prices, stock, totals and permissions are decided **server-side only**. The
browser can ask for anything; the API re-prices every cart line against the
database before an order is written.

---

## Going live

### 1. Environment

Set these on your host (see `.env.example` for the full list):

```
NODE_ENV=production
ALLOWED_ORIGINS=https://yourstore.com     # required — CSRF protection
DATABASE_PATH=/var/lib/store/store.db     # on a persistent volume
TRUST_PROXY_HOPS=1                        # if behind nginx/Cloudflare/Fly
ADMIN_EMAIL=you@yourstore.com
ADMIN_PASSWORD=<something long>
```

### 2. HTTPS is mandatory

In production, session and cart cookies are issued with the `Secure` flag, so
**they will not work over plain HTTP**. Terminate TLS at your proxy or host.

### 3. Build and run

```bash
npm ci
npm run build
npm start
```

`npm start` serves the built site and the API from a single process on `$PORT`
(default 4000). Put it behind nginx, Caddy, Fly.io, Railway or similar.

### 4. Card payments (optional)

The store ships with cash-on-delivery and bank transfer. To accept cards:

1. Set `STRIPE_SECRET_KEY` from https://dashboard.stripe.com/apikeys
2. Add a webhook endpoint pointing at `https://yourstore.com/api/webhooks/stripe`,
   subscribed to `checkout.session.completed`
3. Set `STRIPE_WEBHOOK_SECRET` to the signing secret Stripe gives you

The card option appears at checkout automatically once the key is present. Orders
are only marked paid by the verified webhook — never by the browser redirect.

### 5. Back up the database

`data/store.db` holds every product, customer, order and review. WAL mode means
three files (`.db`, `.db-shm`, `.db-wal`). The safest snapshot:

```bash
sqlite3 data/store.db ".backup '/backups/store-$(date +%F).db'"
```

Automate it. Nothing else in this repo is irreplaceable; that file is.

---

## Security

Implemented:

- Passwords hashed with scrypt (per-user salt), never logged or returned
- Sessions are random 256-bit tokens; only their SHA-256 hash is stored, so a
  database leak cannot be replayed as a login
- httpOnly + SameSite cookies, `Secure` in production
- Every `/api/admin/*` route independently checks the admin role — the client
  route guard is convenience, not the boundary
- Same-origin enforcement on all mutating requests (CSRF)
- Rate limiting on login, registration, password change, checkout and reviews
- CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, restrictive `Permissions-Policy`
- Server-side re-pricing; the client cannot influence what anything costs
- Customers can only read their own orders
- Stripe webhooks verified by HMAC signature with replay protection

Worth knowing:

- `node:sqlite` is marked experimental by Node. It is real SQLite and stable in
  practice, but pin your Node version and test before upgrading. Swapping to
  `better-sqlite3` is a small change confined to `server/db.ts`.
- SQLite suits a single server well. If you need multiple app instances, move to
  Postgres — the SQL is standard and the queries are all in `server/`.
- There is no email delivery yet. Order confirmations are shown on screen but not
  emailed; wire up a provider in `server/routes.ts` at the checkout handler.

---

## Before you take real orders

- [ ] Replace the demo catalogue with your own products
- [ ] Replace demo product photos — the seed hotlinks Unsplash images that you do
      not have commercial rights to redistribute
- [ ] Remove third-party brand names, logos and product titles you do not own
- [ ] Write real Terms, Privacy, Returns and Shipping pages (`/admin/pages`)
- [ ] Set your tax rate and shipping rates in `/admin/settings`
- [ ] Configure a payment provider and test a live transaction
- [ ] Set up email for order confirmations
- [ ] Point a domain, enable HTTPS, verify `ALLOWED_ORIGINS`
- [ ] Set up database backups
- [ ] Add error monitoring (the hook is in `src/components/ErrorBoundary.tsx`)
