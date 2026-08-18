/**
 * Currency definitions shared by the storefront, the admin and the server.
 *
 * Prices are stored in the store's own currency — there is no conversion.
 * (The previous code multiplied the displayed price by a hardcoded exchange
 * rate while checkout charged the unconverted number, so the customer saw one
 * price and paid another.)
 */

export interface Currency {
  code: string;
  /** Shown in Latin-script contexts. */
  symbol: string;
  /** Shown when the storefront is in Arabic. */
  symbolAr: string;
  name: string;
  /** Kuwait, Bahrain, Jordan, Oman and Tunisia all use three. */
  decimals: number;
  /** Where the symbol sits in left-to-right text. */
  position: 'before' | 'after';
}

export const CURRENCIES: Record<string, Currency> = {
  KWD: { code: 'KWD', symbol: 'KWD', symbolAr: 'د.ك', name: 'Kuwaiti Dinar',        decimals: 3, position: 'before' },
  BHD: { code: 'BHD', symbol: 'BD',  symbolAr: 'د.ب', name: 'Bahraini Dinar',       decimals: 3, position: 'before' },
  OMR: { code: 'OMR', symbol: 'OMR', symbolAr: 'ر.ع', name: 'Omani Rial',           decimals: 3, position: 'before' },
  SAR: { code: 'SAR', symbol: 'SR',  symbolAr: 'ر.س', name: 'Saudi Riyal',          decimals: 2, position: 'before' },
  AED: { code: 'AED', symbol: 'AED', symbolAr: 'د.إ', name: 'UAE Dirham',           decimals: 2, position: 'before' },
  QAR: { code: 'QAR', symbol: 'QR',  symbolAr: 'ر.ق', name: 'Qatari Riyal',         decimals: 2, position: 'before' },
  USD: { code: 'USD', symbol: '$',   symbolAr: '$',   name: 'US Dollar',            decimals: 2, position: 'before' },
  EUR: { code: 'EUR', symbol: '€',   symbolAr: '€',   name: 'Euro',                 decimals: 2, position: 'before' },
  GBP: { code: 'GBP', symbol: '£',   symbolAr: '£',   name: 'Pound Sterling',       decimals: 2, position: 'before' },
};

export const DEFAULT_CURRENCY = 'KWD';

/** Legacy settings stored a bare symbol; map those onto a currency code. */
const LEGACY_SYMBOLS: Record<string, string> = { $: 'USD', '€': 'EUR', '£': 'GBP' };

export function resolveCurrency(value: unknown): Currency {
  const raw = String(value ?? '').trim();
  const code = CURRENCIES[raw.toUpperCase()] ? raw.toUpperCase() : LEGACY_SYMBOLS[raw];
  return CURRENCIES[code] ?? CURRENCIES[DEFAULT_CURRENCY];
}

/**
 * Formats an amount in the store currency.
 * KWD renders three decimals — 12.5 is "KD 12.500", not "KD 12.50".
 */
export function formatMoney(amount: unknown, currency: unknown, lang: 'en' | 'ar' = 'en'): string {
  const c = resolveCurrency(currency);
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  const digits = c.decimals;
  const body = Math.abs(safe).toLocaleString(lang === 'ar' ? 'ar-KW' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  const symbol = lang === 'ar' ? c.symbolAr : c.symbol;
  const sign = safe < 0 ? '-' : '';

  // Arabic reads right-to-left, so the symbol trails the number.
  return lang === 'ar' || c.position === 'after'
    ? `${sign}${body} ${symbol}`
    : `${sign}${symbol} ${body}`;
}

/**
 * Converts to the smallest unit for payment processors (fils for KWD).
 *
 * Stripe requires three-decimal currencies to end in a zero, because the
 * underlying card networks only settle two decimals.
 */
export function toMinorUnits(amount: unknown, currency: unknown): number {
  const c = resolveCurrency(currency);
  const value = Number(amount) || 0;
  const minor = Math.round(value * 10 ** c.decimals);
  return c.decimals === 3 ? Math.round(minor / 10) * 10 : minor;
}

/** Rounds a price to the precision the currency actually supports. */
export function roundToCurrency(amount: unknown, currency: unknown): number {
  const c = resolveCurrency(currency);
  const factor = 10 ** c.decimals;
  return Math.round((Number(amount) || 0) * factor) / factor;
}
