import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  product: any;
  quantity: number;
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
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  
  // Compare State
  compareItems: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: number) => void;

  currency: string;
  setCurrency: (c: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState('$');
  const [language, setLanguage] = useState('English');

  const addToCompare = (product: any) => {
    setCompareItems((current) => {
      // Don't add if already in compare list
      if (current.some(item => item.id === product.id)) {
        return current;
      }
      return [...current, product];
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems(current => current.filter(item => item.id !== productId));
  };

  const addToCart = (product: any, quantity: number = 1) => {
    setItems((current) => {
      // Find existing item by id, and also compare selectedColor and selectedSize if present
      const existing = current.find(item => 
        item.product.id === product.id && 
        item.product.selectedColor === product.selectedColor &&
        item.product.selectedSize === product.selectedSize
      );
      if (existing) {
        return current.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const formatPrice = (price: number) => {
    const rateData = currencyRates[currency] || currencyRates['$'];
    const converted = price * rateData.rate;
    // Format integers consistently
    if (Number.isInteger(converted)) {
       return `${rateData.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `${rateData.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal,
      compareItems, addToCompare, removeFromCompare,
      currency, setCurrency, language, setLanguage, formatPrice, t
    }}>
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
