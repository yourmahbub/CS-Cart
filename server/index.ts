import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { api } from './routes';
import { seed } from './seed';
import { purgeExpiredSessions } from './auth';
import { handleStripeWebhook } from './payments';
import { UPLOAD_DIR } from './uploads';

const PORT = Number(process.env.PORT) || 4000;
const isProd = process.env.NODE_ENV === 'production';
const app = express();

app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 0);
app.disable('x-powered-by');

/* ---------------- security headers ---------------- */

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        // Vite emits hashed assets; inline styles come from Tailwind utilities at runtime.
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "media-src 'self' https:",
        "font-src 'self' data:",
        // Nothing calls out to a third party any more; the storefront only
        // talks to its own API.
        "connect-src 'self'",
      ].join('; '),
    );
  }
  next();
});

/* ---------------- Stripe webhook (needs the raw body) ---------------- */

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
  const result = handleStripeWebhook(req.body as Buffer, req.headers['stripe-signature'] as string | undefined);
  if (!result.ok) {
    console.warn('[stripe] rejected webhook:', result.message);
    return res.status(400).json({ error: result.message });
  }
  res.json({ received: true });
});

/* ---------------- body parsing ---------------- */

// Generous because review photos arrive as data URIs; the route caps them again.
app.use(express.json({ limit: '12mb' }));

/* ---------------- CSRF defence ---------------- */

/**
 * Session cookies are SameSite=Lax, which already blocks cross-site POSTs from
 * forms. This adds a same-origin check so a mutating request must come from us.
 */
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  if (!origin) return next(); // non-browser client (curl, mobile app)

  const allowed = new Set<string>([`${req.protocol}://${req.get('host')}`]);
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => allowed.add(o));
  if (!isProd) {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }

  if (!allowed.has(origin)) {
    return res.status(403).json({ error: 'Cross-origin request blocked.' });
  }
  next();
});

/* ---------------- API ---------------- */

app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown endpoint.' }));

/* ---------------- uploaded images ---------------- */

// Filenames are generated server-side and content is verified by magic bytes,
// so these are safe to cache hard. nosniff is already set globally.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'deny',
    maxAge: '365d',
    immutable: true,
    setHeaders(res) {
      res.setHeader('Content-Disposition', 'inline');
    },
  }),
);

/* ---------------- static site (production) ---------------- */

const dist = resolve(process.cwd(), 'dist');
if (existsSync(dist)) {
  app.use(
    express.static(dist, {
      index: false,
      setHeaders(res, path) {
        // Hashed asset filenames are safe to cache forever; index.html is not.
        if (path.includes(`${'assets'}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }),
  );
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(resolve(dist, 'index.html'));
  });
} else if (isProd) {
  console.warn('[server] dist/ is missing — run "npm run build" before starting in production.');
}

/* ---------------- error handling ---------------- */

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Upload is too large.' });
  }
  console.error('[server] unhandled error:', err);
  // Never leak internals to the client.
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

/* ---------------- boot ---------------- */

function requiredProdEnv() {
  const missing: string[] = [];
  if (isProd && !process.env.ALLOWED_ORIGINS) missing.push('ALLOWED_ORIGINS');
  if (missing.length) {
    console.error(`[server] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

requiredProdEnv();
seed();
purgeExpiredSessions();
setInterval(purgeExpiredSessions, 6 * 60 * 60_000).unref();

const server = app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}  (${isProd ? 'production' : 'development'})`);
  if (existsSync(dist)) console.log('[server] Serving the built site from dist/');
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`\n[server] ${signal} received, shutting down…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
