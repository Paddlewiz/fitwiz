'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';

// Language type
type Language = 'zh-CN' | 'en';

// Translation type (nested object)
type Translation = Record<string, any>;

// Context type - simplified for single language mode
interface I18nContextType {
  language: Language;
  locale: Language; // alias for language, used by components
  t: (key: string, params?: Record<string, unknown>) => string;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import translations
import zhCN from '@/locales/zh-CN.json';
import en from '@/locales/en.json';

const translations: Record<Language, Translation> = {
  'zh-CN': zhCN,
  'en': en,
};

// Get language from environment variable, default to zh-CN
function getSiteLanguage(): Language {
  const siteLang = process.env.NEXT_PUBLIC_SITE_LANG || 'zh';
  return siteLang === 'en' ? 'en' : 'zh-CN';
}

// Fixed language for the site
const SITE_LANGUAGE = getSiteLanguage();

// Provider component - simplified for single language mode
export function I18nProvider({ children }: { children: ReactNode }) {
  // Translation function - uses fixed language from environment variable
  const t = useCallback((key: string, params?: Record<string, unknown>): string => {
    const keys = key.split('.');
    let value: any = translations[SITE_LANGUAGE];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to zh-CN if key not found in current language
        let fallback: any = translations['zh-CN'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in any language
          }
        }
        value = typeof fallback === 'string' ? fallback : key;
        break;
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace parameters like {{param}} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
      });
    }
    
    return result;
  }, []);

  return (
    <I18nContext.Provider value={{ language: SITE_LANGUAGE, locale: SITE_LANGUAGE, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook to use translations (returns t function and locale)
export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return { t: context.t, locale: context.locale };
}