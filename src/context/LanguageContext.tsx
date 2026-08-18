import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Lang, dirOf, t as translate, tAdmin, tr as resolve, Localized,
  localizeProduct, localizeCategory, localizePage,
} from '../lib/i18n';

/**
 * The storefront and the admin panel keep independent languages.
 * A shop owner can run the admin in Arabic while previewing the English
 * storefront, or the reverse — switching one never affects the other.
 */
interface LanguageValue {
  /** The language of whichever area you are currently in. */
  lang: Lang;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  /** Sets the language of the current area. */
  setLang: (l: Lang) => void;

  storefrontLang: Lang;
  setStorefrontLang: (l: Lang) => void;
  adminLang: Lang;
  setAdminLang: (l: Lang) => void;
  isAdminArea: boolean;

  /** Storefront interface string. */
  t: (key: string) => string;
  /** Admin panel interface string — always uses the admin language. */
  tAdmin: (key: string) => string;
  /** Resolve a `{ en, ar }` content value in the current area's language. */
  tr: (value: Localized) => string;

  localizeProduct: (p: any) => any;
  localizeCategory: (c: any) => any;
  localizePage: (p: any) => any;
}

const LanguageContext = createContext<LanguageValue | undefined>(undefined);

function read(key: string, fallbackToBrowser: boolean): Lang {
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'ar' || saved === 'en') return saved;
    if (fallbackToBrowser && typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar')) {
      return 'ar';
    }
  } catch { /* private mode */ }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith('/admin');

  // Shoppers get their browser language; the admin defaults to English until
  // the owner chooses otherwise, so the panel never surprises them.
  const [storefrontLang, setStorefrontState] = useState<Lang>(() => read('lang', true));
  const [adminLang, setAdminState] = useState<Lang>(() => read('admin_lang', false));

  const lang = isAdminArea ? adminLang : storefrontLang;
  const dir = dirOf(lang);

  // Whichever area is on screen drives the document direction.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
  }, [lang, dir]);

  const persist = (key: string, value: Lang) => {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
  };

  const setStorefrontLang = useCallback((next: Lang) => {
    setStorefrontState(next);
    persist('lang', next);
  }, []);

  const setAdminLang = useCallback((next: Lang) => {
    setAdminState(next);
    persist('admin_lang', next);
  }, []);

  const setLang = useCallback(
    (next: Lang) => (isAdminArea ? setAdminLang(next) : setStorefrontLang(next)),
    [isAdminArea, setAdminLang, setStorefrontLang],
  );

  const value: LanguageValue = {
    lang,
    dir,
    isRTL: dir === 'rtl',
    setLang,
    storefrontLang,
    setStorefrontLang,
    adminLang,
    setAdminLang,
    isAdminArea,
    t: (key) => translate(key, lang),
    tAdmin: (key) => tAdmin(key, adminLang),
    tr: (v) => resolve(v, lang),
    localizeProduct: (p) => localizeProduct(p, lang),
    localizeCategory: (c) => localizeCategory(c, lang),
    localizePage: (p) => localizePage(p, lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider');
  return ctx;
}
