import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { api } from '../lib/api';
import { formatMoney, resolveCurrency } from '../lib/currency';
import { useLang } from './LanguageContext';
import { useAdmin } from './AdminContext';

export interface CartLine {
  productId: number;
  title: string;
  code: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  color?: string;
  size?: string;
  guarantee?: string;
  servicePlan?: string;
  options?: Record<string, string | undefined>;
}

interface CartTotals {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}


interface CartContextType extends CartTotals {
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (index: number) => Promise<void>;
  updateQuantity: (index: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  items: { product: any; quantity: number }[];
  busy: boolean;
  error: string | null;

  compareItems: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: number) => void;

  currency: string;
  formatPrice: (price: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY: CartTotals = { lines: [], subtotal: 0, shipping: 0, tax: 0, total: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const { siteSettings } = useAdmin();
  const [cart, setCart] = useState<CartTotals>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The store's currency comes from admin settings; shoppers cannot change it,
  // because the amount charged at checkout is always in this currency.
  const currency = resolveCurrency(siteSettings?.currency).code;
  const [compareItems, setCompareItems] = useState<any[]>([]);

  // Guards against overlapping writes clobbering each other.
  const inFlight = useRef<Promise<void> | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.get<CartTotals>('/cart');
      setCart(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load your cart.');
    }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  /** Push the desired line-up to the server, which re-prices authoritatively. */
  const commit = useCallback(async (lines: CartLine[]) => {
    const run = async () => {
      setBusy(true);
      try {
        const data = await api.put<CartTotals>('/cart', {
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            color: l.color ?? l.options?.color,
            size: l.size ?? l.options?.size,
            guarantee: l.guarantee ?? l.options?.guarantee,
            servicePlan: l.servicePlan,
          })),
        });
        setCart(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Could not update your cart.');
        await refreshCart();
      } finally {
        setBusy(false);
      }
    };
    const chained = (inFlight.current ?? Promise.resolve()).then(run, run);
    inFlight.current = chained;
    return chained;
  }, [refreshCart]);

  const sameLine = (l: CartLine, p: any) =>
    l.productId === p.id &&
    (l.color ?? l.options?.color ?? '') === (p.selectedColor ?? '') &&
    (l.size ?? l.options?.size ?? '') === (p.selectedSize ?? '') &&
    (l.servicePlan ?? '') === (p.servicePlanId ?? '');

  const addToCart = async (product: any, quantity = 1) => {
    const lines = [...cart.lines];
    const existing = lines.findIndex((l) => sameLine(l, product));
    if (existing >= 0) {
      lines[existing] = { ...lines[existing], quantity: lines[existing].quantity + quantity };
    } else {
      lines.push({
        productId: product.id,
        title: product.title,
        code: product.code ?? '',
        image: product.image ?? '',
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
        inStock: product.inStock !== false,
        color: product.selectedColor,
        size: product.selectedSize,
        guarantee: product.guarantee,
        servicePlan: product.servicePlanId,
      });
    }
    await commit(lines);
  };

  const removeFromCart = async (index: number) => {
    await commit(cart.lines.filter((_, i) => i !== index));
  };

  const updateQuantity = async (index: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(index);
    await commit(cart.lines.map((l, i) => (i === index ? { ...l, quantity } : l)));
  };

  const clearCart = async () => { await commit([]); };

  const addToCompare = (product: any) =>
    setCompareItems((cur) => (cur.some((i) => i.id === product.id) ? cur : [...cur, product]));

  const removeFromCompare = (productId: number) =>
    setCompareItems((cur) => cur.filter((i) => i.id !== productId));

  // Prices are stored in the store's currency; nothing is converted here.
  const formatPrice = (price: number) => formatMoney(price, currency, lang);

  const cartCount = cart.lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...cart,
        items: cart.lines.map((l) => ({ product: { ...l, id: l.productId, price: l.unitPrice }, quantity: l.quantity })),
        addToCart, removeFromCart, updateQuantity, clearCart, refreshCart,
        cartCount, cartTotal: cart.subtotal, busy, error,
        compareItems, addToCompare, removeFromCompare,
        currency, formatPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}
