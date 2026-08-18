import { formatMoney } from './currency';

/**
 * Margin maths, shared by the product editor and the product list so the two
 * can never disagree.
 */

export interface Margin {
  /** True when no cost has been recorded — profit is unknowable, not zero. */
  unknown: boolean;
  cost: number;
  price: number;
  /** Selling price minus cost. Negative when selling below cost. */
  profit: number;
  /** Profit as a percentage of the selling price. */
  margin: number;
  /** Profit as a percentage of the cost. */
  markup: number;
  loss: boolean;
}

const round = (n: number) => Math.round(n * 100) / 100;
const pct = (n: number) => Math.round(n * 10) / 10;

export function computeMargin(price: unknown, cost: unknown): Margin {
  const p = Number(price) || 0;
  const c = Number(cost) || 0;

  if (c <= 0) {
    return { unknown: true, cost: 0, price: p, profit: 0, margin: 0, markup: 0, loss: false };
  }

  const profit = round(p - c);
  return {
    unknown: false,
    cost: c,
    price: p,
    profit,
    margin: p > 0 ? pct((profit / p) * 100) : 0,
    markup: pct((profit / c) * 100),
    loss: profit < 0,
  };
}

/** Admin-only cost and profit figures, in the store currency. */
export function money(amount: number, currency?: unknown): string {
  return formatMoney(amount, currency);
}
