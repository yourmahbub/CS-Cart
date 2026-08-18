import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { toMinorUnits } from '../src/lib/currency';

/**
 * Stripe Checkout via the REST API — no SDK dependency.
 * Card payment stays hidden in the UI until STRIPE_SECRET_KEY is set, so the
 * store works out of the box with cash-on-delivery and bank transfer.
 */

const API = 'https://api.stripe.com/v1';

export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;

/** Stripe expects application/x-www-form-urlencoded with bracketed nesting. */
function encodeForm(obj: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object') parts.push(encodeForm(value as any, name));
    else parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
  }
  return parts.filter(Boolean).join('&');
}

async function stripeRequest(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeForm(body),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe request failed (${res.status})`);
  return json;
}

export async function createStripeCheckout(opts: {
  orderId: number;
  number: string;
  email: string;
  currency: string;
  lines: any[];
  shipping: number;
  tax: number;
  origin: string;
}) {
  const items: Record<string, unknown> = {};
  opts.lines.forEach((l, i) => {
    items[i] = {
      quantity: l.quantity,
      price_data: {
        currency: opts.currency,
        unit_amount: toMinorUnits(l.unitPrice, opts.currency),
        product_data: { name: l.title.slice(0, 250) },
      },
    };
  });

  let next = opts.lines.length;
  if (opts.shipping > 0) {
    items[next++] = {
      quantity: 1,
      price_data: {
        currency: opts.currency,
        unit_amount: toMinorUnits(opts.shipping, opts.currency),
        product_data: { name: 'Shipping' },
      },
    };
  }
  if (opts.tax > 0) {
    items[next++] = {
      quantity: 1,
      price_data: {
        currency: opts.currency,
        unit_amount: toMinorUnits(opts.tax, opts.currency),
        product_data: { name: 'Tax' },
      },
    };
  }

  return stripeRequest('/checkout/sessions', {
    mode: 'payment',
    customer_email: opts.email,
    client_reference_id: opts.number,
    line_items: items,
    metadata: { order_id: opts.orderId, order_number: opts.number },
    success_url: `${opts.origin}/order/${opts.number}?paid=1`,
    cancel_url: `${opts.origin}/checkout?cancelled=1`,
  });
}

/**
 * Verifies a Stripe webhook signature (scheme v1, HMAC-SHA256 over
 * "timestamp.payload") and marks the matching order paid.
 */
export function handleStripeWebhook(rawBody: Buffer, signature: string | undefined): { ok: boolean; message: string } {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return { ok: false, message: 'Webhook secret is not configured.' };
  if (!signature) return { ok: false, message: 'Missing signature.' };

  const parts = Object.fromEntries(signature.split(',').map((p) => p.split('=') as [string, string]));
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return { ok: false, message: 'Malformed signature.' };

  // Reject replays of old, previously valid payloads.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return { ok: false, message: 'Signature timestamp outside tolerance.' };
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, message: 'Signature mismatch.' };

  let event: any;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return { ok: false, message: 'Invalid JSON payload.' };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object ?? {};
    const number = session.client_reference_id || session.metadata?.order_number;
    if (number) {
      db.prepare(
        `UPDATE orders SET payment_status = 'paid', status = 'paid', payment_ref = ?, updated_at = datetime('now')
          WHERE number = ? AND payment_status != 'paid'`,
      ).run(String(session.payment_intent || session.id), String(number));
    }
  }

  return { ok: true, message: 'ok' };
}
