'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { de } from './locales/de';
import { en } from './locales/en';
import { id } from './locales/id';
import { esES } from './locales/es-ES';
import { fa } from './locales/fa';
import { ar } from './locales/ar';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { ptBR } from './locales/pt-BR';
import { ru } from './locales/ru';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';
import { pl } from './locales/pl';
import { hu } from './locales/hu';
import { fr } from './locales/fr';
import { uk } from './locales/uk';
import { tr } from './locales/tr';
import { LOCALES, type Dict, type Locale } from './types';

export { LOCALES, LOCALE_LABEL } from './types';
export type { Locale } from './types';

type DictKey = keyof Dict;

const DICTS: Record<Locale, Dict> = {
  'en': en,
  'id': id,
  'de': de,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'pt-BR': ptBR,
  'es-ES': esES,
  'ru': ru,
  'fa': fa,
  'ar': ar,
  'ja': ja,
  'ko': ko,
  'pl': pl,
  'hu': hu,
  'fr': fr,
  'uk': uk,
  'tr': tr,
};

const LS_KEY = 'open-design:locale';

/**
 * IP-based country detection with fallbacks.
 * Uses ipwho.is as primary (faster, more reliable) and ipapi.co as backup.
 * Results are cached in sessionStorage for 24 hours to avoid repeated calls.
 */
async function detectCountry(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown';

  const IP_CACHE_KEY = 'ip_country_cache';
  const IP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Check cache first
  try {
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) {
      const { country, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < IP_CACHE_DURATION) {
        return country;
      }
    }
  } catch {
    // Ignore cache errors
  }

  // Try ipwho.is first (2.5s timeout)
  let country = 'unknown';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      country = data.country_code || 'unknown';
    }
  } catch {
    // Fallback to ipapi.co if ipwho.is fails
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        country = data.country_code || 'unknown';
      }
    } catch {
      // Both failed, return unknown
    }
  }

  // Cache the result
  if (country !== 'unknown') {
    try {
      sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify({
        country,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore cache errors
    }
  }

  return country;
}

/**
 * Enhanced initial locale detection with IP-based TR/EN detection.
 * 1. Check ui_lang for IP-based system preference (highest priority)
 * 2. Check open-design:locale for legacy system
 * 3. IP-based detection (TR for Turkey, EN for others)
 * 4. Default to 'en'
 */
async function detectInitialLocale(): Promise<Locale> {
  if (typeof window === 'undefined') return 'en';

  // 1. Check ui_lang for IP-based TR/EN system
  try {
    const ipLang = window.localStorage.getItem('ui_lang');
    if (ipLang === 'tr' || ipLang === 'en') {
      return ipLang as Locale;
    }
  } catch {
    /* ignore */
  }

  // 2. Check legacy system preference
  try {
    const stored = window.localStorage.getItem(LS_KEY);
    if (stored && (LOCALES as string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
  }

  // 3. IP-based detection (TR for Turkey, EN for others)
  try {
    const country = await detectCountry();
    if (country === 'TR') {
      return 'tr';
    }
  } catch {
    // Fall through to default
  }

  // 4. Default to English
  return 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface ProviderProps {
  initial?: Locale;
  children: ReactNode;
}

const RTL_LOCALES: Locale[] = ['ar', 'fa'];

export function I18nProvider({ initial, children }: ProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [initialized, setInitialized] = useState(false);

  // Initialize locale with IP-based detection
  useEffect(() => {
    let mounted = true;

    if (initial) {
      setLocaleState(initial);
      setInitialized(true);
    } else {
      detectInitialLocale().then(detectedLocale => {
        if (mounted) {
          setLocaleState(detectedLocale);
          setInitialized(true);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [initial]);

  // Keep <html lang="…" dir="…"> in sync so screen readers and CSS hooks
  // pick the right language token and direction without each component
  // having to set it itself.
  useEffect(() => {
    if (!initialized) return; // Don't update until locale is initialized

    if (typeof document !== 'undefined') {
      const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', dir);
    }
  }, [locale, initialized]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LS_KEY, next);
      // Also update ui_lang for IP-based system compatibility
      if (next === 'tr' || next === 'en') {
        window.localStorage.setItem('ui_lang', next);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>): string => {
      const dict = DICTS[locale] ?? en;
      const raw = dict[key] ?? en[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, name: string) => {
        const v = vars[name];
        return v == null ? `{${name}}` : String(v);
      });
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fall back to a stand-alone English translator when no provider is
    // mounted (e.g. an isolated test). This keeps the API safe to call
    // without requiring every callsite to wrap in a provider.
    return {
      locale: 'en',
      setLocale: () => { },
      t: (key, vars) => {
        const raw = en[key] ?? key;
        if (!vars) return raw;
        return raw.replace(/\{(\w+)\}/g, (_, n: string) => {
          const v = vars[n];
          return v == null ? `{${n}}` : String(v);
        });
      },
    };
  }
  return ctx;
}

// Convenience for components that only need the translator function.
export function useT(): I18nContextValue['t'] {
  return useI18n().t;
}
