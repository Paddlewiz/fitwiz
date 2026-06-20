'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Language type
type Language = 'zh-CN' | 'en';

// Translation type (nested object)
type Translation = Record<string, any>;

// Context type
interface I18nContextType {
  language: Language;
  locale: Language; // alias for language, used by components
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'fitwiz-language';

// Default language is Chinese
const DEFAULT_LANGUAGE: Language = 'zh-CN';

// Import translations
import zhCN from '@/locales/zh-CN.json';
import en from '@/locales/en.json';

const translations: Record<Language, Translation> = {
  'zh-CN': zhCN,
  'en': en,
};

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && (savedLanguage === 'zh-CN' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage as Language);
    }
    setMounted(true);
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language, mounted]);

  // Translation function
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        let fallback: any = translations['en'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in any language
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  // Set language
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Toggle language between zh-CN and en
  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'zh-CN' ? 'en' : 'zh-CN');
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, locale: language, t, setLanguage, toggleLanguage }}>
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
  return {
    t: context.t,
    locale: context.language,
    language: context.language,
    setLanguage: context.setLanguage,
    toggleLanguage: context.toggleLanguage,
  };
}

// Export language type for use in other components
export type { Language };