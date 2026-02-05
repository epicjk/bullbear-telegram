'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, translations, t as translateFn } from './translations';

// ============================================================
// Types
// ============================================================
interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: <K extends keyof typeof translations, S extends keyof typeof translations[K]>(
    section: K,
    key: S
  ) => string;
}

// ============================================================
// Context
// ============================================================
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================
interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: Language;
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    // 1. Check for initial lang from middleware (passed via props)
    if (initialLang) return initialLang;
    
    // 2. Check localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitbattle_lang');
      if (saved === 'ko' || saved === 'en') return saved;
      
      // 3. Check cookie (set by middleware)
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'bitbattle_lang' && (value === 'ko' || value === 'en')) {
          return value;
        }
      }
    }
    
    // 4. Default to English
    return 'en';
  });

  // Persist language preference
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem('bitbattle_lang', newLang);
      
      // Update cookie (for middleware consistency)
      document.cookie = `bitbattle_lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
  }, []);

  // Toggle between Korean and English
  const toggleLang = useCallback(() => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  }, [lang, setLang]);

  // Translation helper bound to current language
  const t = useCallback(<K extends keyof typeof translations, S extends keyof typeof translations[K]>(
    section: K,
    key: S
  ): string => {
    return translateFn(lang, section, key);
  }, [lang]);

  // Sync with localStorage on mount (for SSR hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitbattle_lang');
      if (saved === 'ko' || saved === 'en') {
        if (saved !== lang) {
          setLangState(saved);
        }
      }
    }
  }, []);

  const value: LanguageContextType = {
    lang,
    setLang,
    toggleLang,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// ============================================================
// Language Toggle Button Component
// ============================================================
interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageToggle({ className = '', size = 'md' }: LanguageToggleProps) {
  const { lang, toggleLang } = useLanguage();

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
  };

  return (
    <button
      onClick={toggleLang}
      className={`${sizeClasses[size]} rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#a855f7] transition-all duration-200 ${className}`}
      title={lang === 'ko' ? 'Switch to English' : '한국어로 변경'}
    >
      {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
    </button>
  );
}

// ============================================================
// HOC for pages that need language support
// ============================================================
export function withLanguage<P extends object>(
  Component: React.ComponentType<P>,
  initialLang?: Language
) {
  return function WrappedComponent(props: P) {
    return (
      <LanguageProvider initialLang={initialLang}>
        <Component {...props} />
      </LanguageProvider>
    );
  };
}
