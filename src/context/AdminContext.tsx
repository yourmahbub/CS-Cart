import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { defaultProductTemplate, PageTemplate } from '../types/template';
import { defaultProductPageConfig, ProductPageConfig } from '../data/productPageDefaults';
import { defaultPromoBanners, defaultFeatures, PromoBanners, FeaturesSection } from '../data/homeSections';

export const AdminContext = createContext<any>(null);

/** Deep-merge stored config over defaults so new options appear after an upgrade. */
function mergeConfig<T>(base: T, saved: any): T {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(base) || Array.isArray(saved)) return saved as T;
  if (typeof base !== 'object' || typeof saved !== 'object') return saved as T;
  const out: any = { ...base };
  Object.keys(saved).forEach((key) => { out[key] = mergeConfig((base as any)[key], saved[key]); });
  return out;
}

type Updater<T> = T | ((prev: T) => T);
const resolve = <T,>(value: Updater<T>, prev: T): T =>
  typeof value === 'function' ? (value as (p: T) => T)(prev) : value;


/**
 * Layout-shaping data (menus, categories, pages, sliders) is cached so a reload
 * paints the finished chrome on the first frame. Without it the header and grids
 * start empty and jump once the API answers.
 */
const BOOT_CACHE = 'storefront_boot_cache';

function readBootCache(): Record<string, any> {
  try {
    const raw = localStorage.getItem(BOOT_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeBootCache(patch: Record<string, any>) {
  try {
    localStorage.setItem(BOOT_CACHE, JSON.stringify({ ...readBootCache(), ...patch }));
  } catch {
    /* storage unavailable — the app still works, it just repaints */
  }
}

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  // Read once on mount; the initialisers below are the only consumers.
  const [boot] = useState(readBootCache);
  const [categories, setCategories] = useState<any[]>(() => boot.categories ?? []);
  /**
   * Site settings are cached in the browser so a reload paints the real logo
   * and colours immediately. Without this the header rendered a placeholder
   * store name for one frame before the API responded — a visible flash.
   */
  const SETTINGS_CACHE = 'site_settings_cache';

  const [siteSettings, setSiteSettingsState] = useState<any>(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_CACHE);
      if (cached) return JSON.parse(cached);
    } catch { /* private mode or corrupt cache */ }
    // No cache yet: stay neutral rather than inventing a store name.
    return { logoText: '', phone: '', currency: '$' };
  });

  /** Keeps the cache in step with whatever the app is currently showing. */
  const cacheSettings = (next: any) => {
    try { localStorage.setItem(SETTINGS_CACHE, JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  };

  const [productTemplate, setTemplateState] = useState<PageTemplate>(defaultProductTemplate);
  const [productPageConfig, setConfigState] = useState<ProductPageConfig>(defaultProductPageConfig);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ---------------- initial load ---------------- */

  const loadAll = useCallback(async () => {
    try {
      const [{ products }, { categories }, settings, { pages }] = await Promise.all([
        api.get<{ products: any[] }>('/products'),
        api.get<{ categories: any[] }>('/categories'),
        api.get<any>('/settings'),
        api.get<{ pages: any[] }>('/pages'),
      ]);
      setProducts(products);
      setCategories(categories);
      setPagesState(pages);
      setSiteSettingsState((prev: any) => cacheSettings({ ...prev, ...settings.site }));
      setTemplateState(mergeConfig(defaultProductTemplate, settings.productTemplate));
      setConfigState(mergeConfig(defaultProductPageConfig, settings.productPageConfig));
      // Apply whenever the server sent an array — including an empty one, so
      // deleting every menu entry actually persists instead of falling back.
      if (Array.isArray(settings.menu)) setMenuState(settings.menu);
      if (Array.isArray(settings.megaMenu)) setMegaMenuState(settings.megaMenu);
      if (Array.isArray(settings.homeLayout)) setHomeLayoutState(settings.homeLayout);
      if (Array.isArray(settings.sliders)) setSlidersState(settings.sliders);
      setPromoBannersState(mergeConfig(defaultPromoBanners, settings.promoBanners));
      setFeaturesState(mergeConfig(defaultFeatures, settings.features));
      writeBootCache({
        categories,
        pages,
        menu: settings.menu,
        megaMenu: settings.megaMenu,
        homeLayout: settings.homeLayout,
        sliders: settings.sliders,
        promoBanners: settings.promoBanners,
        features: settings.features,
      });
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load the store.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ---------------- settings (optimistic + debounced save) ---------------- */

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Record<string, unknown>>({});

  const queueSave = useCallback((patch: Record<string, unknown>) => {
    Object.assign(pending.current, patch);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const payload = pending.current;
      pending.current = {};
      try {
        await api.put('/admin/settings', payload);
      } catch (err: any) {
        console.error('Failed to save settings:', err);
        alert(`Settings were not saved: ${err?.message ?? 'unknown error'}`);
      }
    }, 600);
  }, []);

  const setProductPageConfig = useCallback((value: Updater<ProductPageConfig>) => {
    setConfigState((prev) => {
      const next = resolve(value, prev);
      queueSave({ productPageConfig: next });
      return next;
    });
  }, [queueSave]);

  const setProductTemplate = useCallback((value: Updater<PageTemplate>) => {
    setTemplateState((prev) => {
      const next = resolve(value, prev);
      queueSave({ productTemplate: next });
      return next;
    });
  }, [queueSave]);

  const setSiteSettings = useCallback((value: Updater<any>) => {
    setSiteSettingsState((prev: any) => {
      const next = resolve(value, prev);
      queueSave({ site: next });
      // Cache immediately so the next reload paints the new branding.
      return cacheSettings(next);
    });
  }, [queueSave]);

  const resetProductPageConfig = () => setProductPageConfig(defaultProductPageConfig);
  const resetProductTemplate = () => setProductTemplate(defaultProductTemplate);

  /* ---------------- products ---------------- */

  const getProduct = useCallback(async (id: number) => {
    const { product } = await api.get<{ product: any }>(`/products/${id}`);
    return product;
  }, []);

  /**
   * Admin copy of the catalogue. The public list omits cost price, so the
   * editor and any profit reporting must read from the admin endpoint.
   */
  const [adminProducts, setAdminProducts] = useState<any[]>([]);

  const loadAdminProducts = useCallback(async () => {
    const { products } = await api.get<{ products: any[] }>('/admin/products');
    setAdminProducts(products);
    return products;
  }, []);

  /** Strip cost price before it reaches the storefront-facing list. */
  const publicView = ({ costPrice, ...rest }: any) => rest;

  const addProduct = async (data: any) => {
    const { product } = await api.post<{ product: any }>('/admin/products', { product: data });
    setProducts((prev) => [...prev, publicView(product)]);
    setAdminProducts((prev) => [...prev, product]);
    return product;
  };

  const updateProduct = async (id: number, data: any) => {
    const { product } = await api.put<{ product: any }>(`/admin/products/${id}`, { product: data });
    setProducts((prev) => prev.map((p) => (p.id === id ? publicView(product) : p)));
    setAdminProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
    return product;
  };

  const deleteProduct = async (id: number) => {
    await api.del(`/admin/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setAdminProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------------- reviews ---------------- */

  const loadAdminReviews = useCallback(async () => {
    const { reviews } = await api.get<{ reviews: any[] }>('/admin/reviews');
    setAdminReviews(reviews);
    return reviews;
  }, []);

  const submitReview = async (productId: number, review: any) => {
    const result = await api.post<{ review: any; pending: boolean }>(`/products/${productId}/reviews`, review);
    return result;
  };

  const voteReview = async (reviewId: number, direction: 'up' | 'down') =>
    api.post<{ review: any }>(`/reviews/${reviewId}/vote`, { direction });

  const updateReview = async (reviewId: number, data: any) => {
    const { review } = await api.put<{ review: any }>(`/admin/reviews/${reviewId}`, { review: data });
    setAdminReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...review } : r)));
    return review;
  };

  const deleteReview = async (reviewId: number) => {
    await api.del(`/admin/reviews/${reviewId}`);
    setAdminReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  /* ---------------- recently viewed (per browser, not account data) ---------------- */

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('recently_viewed') || '[]'); } catch { return []; }
  });

  const trackRecentlyViewed = useCallback((id: number) => {
    setRecentlyViewed((prev) => {
      const next = [id, ...prev.filter((p) => p !== id)].slice(0, 12);
      try { localStorage.setItem('recently_viewed', JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);

  /* ---------------- site structure (persisted through /admin/settings) -------- */

  const [menuItems, setMenuState] = useState<any[]>(() => boot.menu ?? []);
  const [megaMenuCategories, setMegaMenuState] = useState<any[]>(() => boot.megaMenu ?? []);
  const [homeLayout, setHomeLayoutState] = useState<any[]>(() => boot.homeLayout ?? []);
  const [sliders, setSlidersState] = useState<any[]>(() => boot.sliders ?? []);
  const [promoBanners, setPromoBannersState] = useState<PromoBanners>(() => mergeConfig(defaultPromoBanners, boot.promoBanners));
  const [features, setFeaturesState] = useState<FeaturesSection>(() => mergeConfig(defaultFeatures, boot.features));

  const setMenuItems = useCallback((value: Updater<any[]>) => {
    setMenuState((prev) => { const next = resolve(value, prev); queueSave({ menu: next }); return next; });
  }, [queueSave]);

  const setMegaMenuCategories = useCallback((value: Updater<any[]>) => {
    setMegaMenuState((prev) => { const next = resolve(value, prev); queueSave({ megaMenu: next }); return next; });
  }, [queueSave]);

  const setHomeLayout = useCallback((value: Updater<any[]>) => {
    setHomeLayoutState((prev) => { const next = resolve(value, prev); queueSave({ homeLayout: next }); return next; });
  }, [queueSave]);

  const setSliders = useCallback((value: Updater<any[]>) => {
    setSlidersState((prev) => { const next = resolve(value, prev); queueSave({ sliders: next }); return next; });
  }, [queueSave]);

  const setPromoBanners = useCallback((value: Updater<PromoBanners>) => {
    setPromoBannersState((prev) => { const next = resolve(value, prev); queueSave({ promoBanners: next }); return next; });
  }, [queueSave]);

  const setFeatures = useCallback((value: Updater<FeaturesSection>) => {
    setFeaturesState((prev) => { const next = resolve(value, prev); queueSave({ features: next }); return next; });
  }, [queueSave]);

  /* ---------------- categories (own table, own endpoints) ---------------- */

  const addCategory = async (data: any) => {
    const { category } = await api.post<{ category: any }>('/admin/categories', { category: data });
    setCategories((prev) => [...prev, category]);
    return category;
  };

  const updateCategory = async (id: string, data: any) => {
    const { category } = await api.put<{ category: any }>(`/admin/categories/${id}`, { category: data });
    setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
    return category;
  };

  const deleteCategory = async (id: string) => {
    await api.del(`/admin/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  /* ---------------- CMS pages ---------------- */

  const [pages, setPagesState] = useState<any[]>(() => boot.pages ?? []);

  const addPage = async (data: any) => {
    const { page } = await api.post<{ page: any }>('/admin/pages', { page: data });
    setPagesState((prev) => [...prev, page]);
    return page;
  };

  const updatePage = async (id: number, data: any) => {
    const { page } = await api.put<{ page: any }>(`/admin/pages/${id}`, { page: data });
    setPagesState((prev) => prev.map((p) => (p.id === id ? page : p)));
    return page;
  };

  const deletePage = async (id: number) => {
    await api.del(`/admin/pages/${id}`);
    setPagesState((prev) => prev.filter((p) => p.id !== id));
  };

  const value = {
    loading, loadError, reload: loadAll,
    products, setProducts, getProduct, addProduct, updateProduct, deleteProduct,
    adminProducts, loadAdminProducts,
    adminReviews, loadAdminReviews, submitReview, voteReview, updateReview, deleteReview,
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    menuItems, setMenuItems,
    megaMenuCategories, setMegaMenuCategories,
    sliders, setSliders,
    siteSettings, setSiteSettings,
    pages, setPages: setPagesState, addPage, updatePage, deletePage,
    homeLayout, setHomeLayout,
    promoBanners, setPromoBanners,
    features, setFeatures,
    productTemplate, setProductTemplate, resetProductTemplate,
    productPageConfig, setProductPageConfig, resetProductPageConfig,
    recentlyViewed, trackRecentlyViewed,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);
