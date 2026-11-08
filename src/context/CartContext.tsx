import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  product: any;
  quantity: number;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

export interface Coupon {
  code: string;
  discountPercent: number;
  label: string;
  minSpend?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  avatar?: string;
  createdAt?: string;
}

const translations: Record<string, Record<string, string>> = {
  English: {
    'Search products': 'Search products',
    'Categories': 'Categories',
    'Delivery and payment': 'Delivery and payment',
    'Returns': 'Returns',
    'Store locator': 'Store locator',
    'Contacts': 'Contacts',
    'Information': 'Information',
    'In stock': 'In stock',
    'Add to Cart': 'Add to Cart',
    'Added to Cart': 'Added to Cart',
    'Add to Wishlist': 'Add to Wishlist',
    'Shopping Cart': 'Shopping Cart',
    'Checkout': 'Checkout',
    'Product Attributes': 'Product Attributes',
    'Product not found': 'Product not found',
    'In demand this week': 'In demand this week',
    'Promotional offers': 'Promotional offers',
    'Reviews': 'Reviews',
  },
  Spanish: {
    'Search products': 'Buscar productos',
    'Categories': 'Categorías',
    'Delivery and payment': 'Envío y pago',
    'Returns': 'Devoluciones',
    'Store locator': 'Ubicación de tiendas',
    'Contacts': 'Contactos',
    'Information': 'Información',
    'In stock': 'En stock',
    'Add to Cart': 'Añadir al carrito',
    'Added to Cart': 'Añadido al carrito',
    'Add to Wishlist': 'Añadir a deseos',
    'Shopping Cart': 'Carrito de compras',
    'Checkout': 'Pagar',
    'Product Attributes': 'Atributos del producto',
    'Product not found': 'Producto no encontrado',
    'In demand this week': 'En demanda esta semana',
    'Promotional offers': 'Ofertas promocionales',
    'Reviews': 'Reseñas',
  },
  French: {
    'Search products': 'Rechercher des produits',
    'Categories': 'Catégories',
    'Delivery and payment': 'Livraison et paiement',
    'Returns': 'Retours',
    'Store locator': 'Localisateur',
    'Contacts': 'Contacts',
    'Information': 'Information',
    'In stock': 'En stock',
    'Add to Cart': 'Ajouter au panier',
    'Added to Cart': 'Ajouté au panier',
    'Add to Wishlist': 'Ajouter aux favoris',
    'Shopping Cart': 'Panier',
    'Checkout': 'Payer',
    'Product Attributes': 'Attributs du produit',
    'Product not found': 'Produit introuvable',
    'In demand this week': 'En demande cette semaine',
    'Promotional offers': 'Offres promotionnelles',
    'Reviews': 'Avis',
  }
};

const currencyRates: Record<string, { symbol: string, rate: number }> = {
  '$': { symbol: '$', rate: 1 },
  '€': { symbol: '€', rate: 0.92 },
  '£': { symbol: '£', rate: 0.79 },
  '৳': { symbol: '৳', rate: 118 },
};

const AVAILABLE_COUPONS: Record<string, Coupon> = {
  'WELCOME10': { code: 'WELCOME10', discountPercent: 10, label: '10% New Customer Discount' },
  'SAVE20': { code: 'SAVE20', discountPercent: 20, label: '20% Super Sale Discount', minSpend: 50 },
  'FREESHIP': { code: 'FREESHIP', discountPercent: 5, label: 'Free Shipping Voucher' },
  'UNITHEME': { code: 'UNITHEME', discountPercent: 15, label: '15% UniTheme2 VIP Promo' },
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  
  // Wishlist State
  wishlistItems: any[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;

  // Compare State
  compareItems: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: number) => void;

  // Coupon State
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Toast Notifications
  toasts: ToastItem[];
  showToast: (title: string, type?: 'success' | 'info' | 'error', description?: string) => void;
  dismissToast: (id: string) => void;

  // User Auth & Profile
  currentUser: UserProfile | null;
  login: (email: string, name?: string, phone?: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;

  currency: string;
  setCurrency: (c: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // 1. Cart Items with localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('unitheme_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unitheme_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // 2. Wishlist with localStorage
  const [wishlistItems, setWishlistItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('unitheme_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unitheme_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlistItems]);

  // 3. User with localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('unitheme_user');
      if (saved) return JSON.parse(saved);
      // Demo guest user default
      return {
        id: 'usr_101',
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        phone: '+1 (917) 722-7425',
        address: '1234 Broadway Ave, Apt 4B',
        city: 'New York',
        zip: '10001',
        createdAt: '2024-01-15',
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('unitheme_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('unitheme_user');
      }
    } catch {}
  }, [currentUser]);

  // 4. Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (title: string, type: 'success' | 'info' | 'error' = 'success', description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, type, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 5. Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState('$');
  const [language, setLanguage] = useState('English');

  // Compare handlers
  const addToCompare = (product: any) => {
    setCompareItems((current) => {
      if (current.some((item) => item.id === product.id)) {
        showToast('Already in comparison', 'info', product.title);
        return current;
      }
      showToast('Added to comparison', 'success', product.title);
      return [...current, product];
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems((current) => current.filter((item) => item.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  // Cart handlers
  const addToCart = (product: any, quantity: number = 1) => {
    setItems((current) => {
      const existing = current.find(
        (item) =>
          item.product.id === product.id &&
          item.product.selectedColor === product.selectedColor &&
          item.product.selectedSize === product.selectedSize
      );
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { product, quantity }];
    });
    showToast('Added to Cart', 'success', `${product.title} (x${quantity})`);
  };

  const removeFromCart = (productId: number) => {
    const removedItem = items.find((i) => i.product.id === productId);
    setItems((current) => current.filter((item) => item.product.id !== productId));
    if (removedItem) {
      showToast('Removed from Cart', 'info', removedItem.product.title);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Wishlist handlers
  const addToWishlist = (product: any) => {
    if (!wishlistItems.some((item) => item.id === product.id)) {
      setWishlistItems((prev) => [...prev, product]);
      showToast('Added to Wishlist', 'success', product.title);
    }
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from Wishlist', 'info');
  };

  const toggleWishlist = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    showToast('Wishlist cleared', 'info');
  };

  // Coupon handlers
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[trimmed];
    if (!coupon) {
      showToast('Invalid coupon code', 'error', 'Try WELCOME10 or SAVE20');
      return { success: false, message: 'Invalid coupon code. Try WELCOME10 or SAVE20' };
    }
    if (coupon.minSpend && cartTotal < coupon.minSpend) {
      const msg = `Minimum spend of $${coupon.minSpend} required for this coupon`;
      showToast('Minimum spend not met', 'error', msg);
      return { success: false, message: msg };
    }
    setAppliedCoupon(coupon);
    showToast('Coupon Applied!', 'success', `${coupon.label} (-${coupon.discountPercent}%)`);
    return { success: true, message: `${coupon.label} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // User auth handlers
  const login = (email: string, name: string = 'Alex Johnson', phone?: string) => {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: phone || '+1 (917) 722-7425',
      address: '1234 Broadway Ave, Apt 4B',
      city: 'New York',
      zip: '10001',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCurrentUser(profile);
    showToast(`Welcome back, ${profile.name}!`, 'success', 'Signed in successfully');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out', 'info', 'You have been signed out');
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...profileUpdates });
      showToast('Profile updated', 'success', 'Your details have been saved');
    }
  };

  // Totals calculations
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const couponDiscount = appliedCoupon
    ? Math.round((cartTotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const formatPrice = (price: number) => {
    const rateData = currencyRates[currency] || currencyRates['$'];
    const converted = price * rateData.rate;
    if (Number.isInteger(converted)) {
      return `${rateData.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `${rateData.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
        compareItems,
        addToCompare,
        removeFromCompare,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        toasts,
        showToast,
        dismissToast,
        currentUser,
        login,
        logout,
        updateProfile,
        currency,
        setCurrency,
        language,
        setLanguage,
        formatPrice,
        t,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
