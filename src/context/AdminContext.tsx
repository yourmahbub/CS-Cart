import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts, mockCategories } from '../data/mockData';
import { megaMenuData } from '../data/megaMenuData';

import { defaultProductTemplate, PageTemplate } from '../types/template';

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
  
  const value = {
    products, setProducts, updateProduct, addProduct, deleteProduct,
    categories, setCategories,
    menuItems, setMenuItems,
    megaMenuCategories, setMegaMenuCategories,
    sliders, setSliders,
    siteSettings, setSiteSettings,
    pages, setPages,
    homeLayout, setHomeLayout,
    productTemplate, setProductTemplate
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);
