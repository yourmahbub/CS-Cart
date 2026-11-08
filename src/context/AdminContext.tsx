import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts, mockCategories } from '../data/mockData';
import { megaMenuData } from '../data/megaMenuData';

import { defaultProductTemplate, PageTemplate } from '../types/template';
import { defaultProductPageConfig } from '../data/productPageDefaults';
import { defaultPromoBanners, defaultFeatures, defaultCategoryGrid } from '../data/homeSections';

export const AdminContext = createContext<any>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('admin_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved products", e);
      }
    }
    return mockProducts;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_products', JSON.stringify(products));
    } catch (error) {
      console.warn("Storage quota exceeded or error saving to localStorage:", error);
    }
  }, [products]);

  const [categories, setCategories] = useState(mockCategories);

  const initialSeedOrders = [
    {
      id: 'ORD-7355',
      date: 'Nov 8, 2026',
      customer: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '+1 (555) 234-5678',
      shippingAddress: '124 Market Street, Suite 400, San Francisco, CA 94105',
      paymentMethod: 'Credit Card (Mastercard •••• 8821)',
      total: 375.00,
      status: 'processing',
      items: [
        {
          id: 1,
          title: 'GoPro HERO12 Black Edition Camera',
          price: 319.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 2,
          title: 'Sony DualShock 4 Wireless Controller',
          price: 56.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    {
      id: 'ORD-7354',
      date: 'Nov 8, 2026',
      customer: 'Michael Brown',
      email: 'm.brown@example.com',
      phone: '+1 (555) 456-7890',
      shippingAddress: '450 North Michigan Ave, Chicago, IL 60611',
      paymentMethod: 'PayPal Express (m.brown@example.com)',
      total: 942.00,
      status: 'shipped',
      items: [
        {
          id: 4,
          title: 'Google Pixel 6 Pro 12/128GB Stormy Black',
          price: 942.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    {
      id: 'ORD-7353',
      date: 'Nov 7, 2026',
      customer: 'Sarah Williams',
      email: 'sarah.w@example.com',
      phone: '+1 (555) 987-6543',
      shippingAddress: '880 Broadway, Apt 4B, New York, NY 10003',
      paymentMethod: 'Apple Pay (Sarah)',
      total: 349.50,
      status: 'processing',
      items: [
        {
          id: 3,
          title: 'Apple Watch Series 6 GPS 40mm Gold',
          price: 349.50,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    {
      id: 'ORD-7352',
      date: 'Nov 6, 2026',
      customer: 'Alex Johnson',
      email: 'alex.j@example.com',
      phone: '+1 (555) 123-4567',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
      paymentMethod: 'Credit Card (Visa •••• 4242)',
      total: 1299.00,
      status: 'delivered',
      items: [
        {
          id: 7,
          title: 'Samsung Galaxy S22 Ultra Phantom Black',
          price: 1243.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 2,
          title: 'Sony DualShock 4 Controller',
          price: 56.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    {
      id: 'ORD-7351',
      date: 'Nov 5, 2026',
      customer: 'David Miller',
      email: 'd.miller@example.com',
      phone: '+1 (555) 765-4321',
      shippingAddress: '150 Ocean Drive, Miami Beach, FL 33139',
      paymentMethod: 'Credit Card (Visa •••• 1928)',
      total: 2200.00,
      status: 'delivered',
      items: [
        {
          id: 6,
          title: 'Trefoil Premium Winter Hoodie',
          price: 2200.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    {
      id: 'ORD-7350',
      date: 'Nov 4, 2026',
      customer: 'Jessica Lee',
      email: 'j.lee@example.com',
      phone: '+1 (555) 321-9876',
      shippingAddress: '210 Pine Street, Seattle, WA 98101',
      paymentMethod: 'Cash on Delivery',
      total: 112.00,
      status: 'delivered',
      items: [
        {
          id: 2,
          title: 'Sony DualShock 4 Controller',
          price: 56.00,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80'
        }
      ]
    }
  ];

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('admin_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].items && parsed[0].items.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved orders", e);
      }
    }
    return initialSeedOrders;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'notif-1', title: 'New Order #ORD-7355', message: 'Emily Davis placed an order for $375.00', time: '12m ago', type: 'order', read: false },
      { id: 'notif-2', title: 'Inventory Alert', message: 'GoPro HERO12 Black Edition is out of stock', time: '1h ago', type: 'stock', read: false },
      { id: 'notif-3', title: '5-Star Review Received', message: 'Sarah Smith reviewed Sony DualShock 4', time: '3h ago', type: 'review', read: false },
      { id: 'notif-4', title: 'Order #ORD-7354 Shipped', message: 'Tracking ID generated for Michael Brown', time: '5h ago', type: 'order', read: true }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map((n: any) => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addOrder = (order: any) => {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      ...order,
      id: newId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      status: order.status || 'processing'
    };
    setOrders([newOrder, ...orders]);
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: `New Order #${newId}`,
        message: `${newOrder.customer || 'Customer'} placed an order for $${(newOrder.total || 0).toFixed ? newOrder.total.toFixed(2) : newOrder.total}`,
        time: 'Just now',
        type: 'order',
        read: false
      },
      ...notifications
    ]);
  };

  const updateOrderStatus = (id: string, status: string) => {
    setOrders(orders.map((o: any) => o.id === id ? { ...o, status } : o));
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Order Status Updated`,
        message: `Order #${id} marked as ${status.toUpperCase()}`,
        time: 'Just now',
        type: 'order',
        read: false
      },
      ...prev
    ]);
  };

  const restockProduct = (productId: number, amount: number = 20) => {
    setProducts(products.map((p: any) => {
      if (p.id === productId) {
        const currentStock = p.stockQuantity ?? (p.inStock ? 5 : 0);
        const newStock = currentStock + amount;
        return {
          ...p,
          inStock: true,
          stockQuantity: newStock
        };
      }
      return p;
    }));
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Product Restocked`,
        message: `Restocked ${amount} units for product #${productId}`,
        time: 'Just now',
        type: 'stock',
        read: false
      },
      ...prev
    ]);
  };

  const simulateNewOrder = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)] || {
      id: 2,
      title: 'Sony DualShock 4 Controller',
      price: 56.00,
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80'
    };
    const sampleCustomers = [
      { name: 'Robert Chen', email: 'r.chen@example.com', address: '55 Wall St, New York, NY 10005', phone: '+1 (555) 321-4321' },
      { name: 'Emma Watson', email: 'emma.w@example.com', address: '120 Sunset Blvd, Los Angeles, CA 90028', phone: '+1 (555) 789-0123' },
      { name: 'Liam Murphy', email: 'liam.m@example.com', address: '44 Austin Way, Austin, TX 78701', phone: '+1 (555) 654-3210' }
    ];
    const cust = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const total = (randomProduct.price || 99) * qty;

    addOrder({
      customer: cust.name,
      email: cust.email,
      phone: cust.phone,
      shippingAddress: cust.address,
      paymentMethod: 'Credit Card (Visa •••• 9012)',
      total: total,
      status: 'processing',
      items: [
        {
          id: randomProduct.id,
          title: randomProduct.title,
          price: randomProduct.price,
          quantity: qty,
          image: randomProduct.image
        }
      ]
    });
  };

  const initialCoupons = [
    { code: 'MEGA20', discount: 20, type: 'percentage', uses: 84, minSpend: 100, active: true },
    { code: 'WELCOME10', discount: 10, type: 'percentage', uses: 142, minSpend: 50, active: true },
    { code: 'FREESHIP', discount: 15, type: 'fixed', uses: 67, minSpend: 75, active: true },
    { code: 'FLASH50', discount: 50, type: 'fixed', uses: 29, minSpend: 300, active: false }
  ];

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('admin_coupons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialCoupons;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_coupons', JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  const addCoupon = (coupon: any) => {
    setCoupons([coupon, ...coupons]);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Coupon Created`,
        message: `Promo code ${coupon.code} (${coupon.discount}${coupon.type === 'percentage' ? '%' : '$'} OFF) is now live!`,
        time: 'Just now',
        type: 'order',
        read: false
      },
      ...prev
    ]);
  };

  const toggleCoupon = (code: string) => {
    setCoupons(coupons.map((c: any) => c.code === code ? { ...c, active: !c.active } : c));
  };

  const fulfillOrder = (id: string, carrier: string = 'FedEx Express', customTracking?: string) => {
    const track = customTracking || `FX-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setOrders(orders.map((o: any) => o.id === id ? { ...o, status: 'shipped', carrier, trackingNumber: track } : o));
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Order #${id} Dispatched`,
        message: `Fulfillment confirmed via ${carrier} (Tracking: ${track})`,
        time: 'Just now',
        type: 'order',
        read: false
      },
      ...prev
    ]);
  };
  
  // App Settings / Mega Menu / Menu
  const [menuItems, setMenuItems] = useState([
    { id: '1', title: 'Home', link: '/' },
    { id: '2', title: 'Catalog', link: '/category/1', hasMegaMenu: true },
    { id: '3', title: 'Delivery', link: '/delivery' },
    { id: '4', title: 'Payment', link: '/payment' },
    { id: '5', title: 'Contacts', link: '/contacts' }
  ]);

  const [megaMenuCategories, setMegaMenuCategories] = useState(megaMenuData);

  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('admin_siteSettings');
    if (saved) return JSON.parse(saved);
    return {
      logoText: 'MegaStore',
      phone: '+1(917)722-7425',
      currency: '$',
      autoApproveReviews: true,
      requirePurchaseToReview: true
    };
  });

  useEffect(() => {
    localStorage.setItem('admin_siteSettings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  const [homeLayout, setHomeLayout] = useState([
    { id: '1', type: 'hero_slider', visible: true, title: 'Hero Slider' },
    { id: '2', type: 'categories', visible: true, title: 'Browse by Category' },
    { id: '3', type: 'featured_products', visible: true, title: 'Big Savers (Featured)' },
    { id: '4', type: 'promo_banners', visible: true, title: 'Promo Banners Grid' },
    { id: '5', type: 'popular_products', visible: true, title: 'Best Sellers' },
    { id: '6', type: 'features', visible: true, title: 'Store Features / Benefits' }
  ]);

  const [productTemplate, setProductTemplate] = useState<PageTemplate>(() => {
    const saved = localStorage.getItem('admin_product_template');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved product template", e);
      }
    }
    return defaultProductTemplate;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_product_template', JSON.stringify(productTemplate));
    } catch (error) {
      console.warn("Storage quota exceeded or error saving to localStorage:", error);
    }
  }, [productTemplate]);

  const [sliders, setSliders] = useState([
    { id: '1', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', title: 'Play Has No Limits', subtitle: 'Experience the new generation of gaming', buttonText: 'Buy Now', link: '/product/1', align: 'left', overlayOpacity: 60 },
    { id: '2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', title: 'Level Up Your Style', subtitle: 'New arrivals in sports and outdoors', buttonText: 'Discover', link: '/category/2', align: 'center', overlayOpacity: 40 }
  ]);

  const [pages, setPages] = useState([
    { id: '1', title: 'About Us', slug: 'about-us', content: 'Welcome to our store...' },
    { id: '2', title: 'Delivery Info', slug: 'delivery', content: 'Delivery takes 2-3 business days...' },
    { id: '3', title: 'Terms of Service', slug: 'terms', content: 'These are the terms...' }
  ]);

  const updateProduct = (id: number, data: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const addProduct = (data: any) => {
    setProducts([...products, { ...data, id: Date.now() }]);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  const [productPageConfig, setProductPageConfig] = useState(() => {
    const saved = localStorage.getItem('admin_product_page_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved product page config", e);
      }
    }
    return defaultProductPageConfig;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_product_page_config', JSON.stringify(productPageConfig));
    } catch (error) {
      console.warn("Storage quota exceeded or error saving productPageConfig:", error);
    }
  }, [productPageConfig]);

  const resetProductPageConfig = () => {
    setProductPageConfig(defaultProductPageConfig);
  };

  const [promoBanners, setPromoBanners] = useState(() => {
    const saved = localStorage.getItem('admin_promo_banners');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved promo banners", e);
      }
    }
    return defaultPromoBanners;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_promo_banners', JSON.stringify(promoBanners));
    } catch (e) {}
  }, [promoBanners]);

  const [features, setFeatures] = useState(() => {
    const saved = localStorage.getItem('admin_features');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved features", e);
      }
    }
    return defaultFeatures;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_features', JSON.stringify(features));
    } catch (e) {}
  }, [features]);

  const [categoryGrid, setCategoryGrid] = useState(() => {
    const saved = localStorage.getItem('admin_category_grid');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved category grid", e);
      }
    }
    return defaultCategoryGrid;
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_category_grid', JSON.stringify(categoryGrid));
    } catch (e) {}
  }, [categoryGrid]);

  const value = {
    products, setProducts, updateProduct, addProduct, deleteProduct,
    categories, setCategories,
    orders, setOrders, addOrder, updateOrderStatus,
    menuItems, setMenuItems,
    megaMenuCategories, setMegaMenuCategories,
    sliders, setSliders,
    siteSettings, setSiteSettings,
    pages, setPages,
    homeLayout, setHomeLayout,
    productTemplate, setProductTemplate,
    productPageConfig, setProductPageConfig, resetProductPageConfig,
    promoBanners, setPromoBanners,
    features, setFeatures,
    categoryGrid, setCategoryGrid,
    notifications, setNotifications,
    markAllNotificationsAsRead, markNotificationAsRead, clearNotifications,
    restockProduct, simulateNewOrder,
    coupons, setCoupons, addCoupon, toggleCoupon, fulfillOrder
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);
