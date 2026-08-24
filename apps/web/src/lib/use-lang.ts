'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '../i18n/types';

export type Lang = 'tr' | 'en';

const LS_KEY = 'ui_lang';
const COOKIE_KEY = 'ui_lang';
const CHANGE_EVENT = 'ui_lang_change';
const IP_CACHE_KEY = 'ip_country_cache';
const IP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * IP-based country detection with fallbacks.
 * Uses ipwho.is as primary (faster, more reliable) and ipapi.co as backup.
 * Results are cached in sessionStorage for 24 hours to avoid repeated calls.
 */
async function detectCountry(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown';

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
 * Detect initial language preference for TR/EN system:
 * 1. localStorage manual selection (highest priority)
 * 2. IP-based detection (TR for Turkey, EN for others)
 * 3. navigator.language fallback
 * 4. Default to 'tr'
 */
async function getInitialLang(): Promise<Lang> {
  if (typeof window === 'undefined') return 'tr';

  // 1. Check localStorage for manual selection
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'tr' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore localStorage errors
  }

  // 2. IP-based detection
  try {
    const country = await detectCountry();
    if (country === 'TR') {
      return 'tr';
    }
  } catch {
    // Fall through to next method
  }

  // 3. navigator.language fallback
  try {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('tr')) {
      return 'tr';
    }
  } catch {
    // Fall through to default
  }

  // 4. Default to Turkish
  return 'tr';
}

/**
 * Convert Lang to Locale for compatibility with existing i18n system.
 */
export function langToLocale(lang: Lang): Locale {
  return lang === 'tr' ? 'tr' : 'en';
}

/**
 * Set language preference and persist it.
 * Updates localStorage, cookie, and dispatches change event.
 */
export function setLang(lang: Lang): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LS_KEY, lang);
  } catch {
    // Ignore localStorage errors
  }

  try {
    // Set cookie for 1 year
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${COOKIE_KEY}=${lang}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors
  }

  // Dispatch change event for other components/tabs
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: lang }));
  } catch {
    // Ignore event errors
  }
}

/**
 * React hook for language detection and state management.
 * Returns current language and function to update it.
 */
export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    let mounted = true;

    getInitialLang().then(initialLang => {
      if (mounted) {
        setLangState(initialLang);
      }
    });

    // Listen for language changes from other components/tabs
    const handleLangChange = (e: Event | CustomEvent) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail === 'tr' || customEvent.detail === 'en')) {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener(CHANGE_EVENT, handleLangChange as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener(CHANGE_EVENT, handleLangChange as EventListener);
    };
  }, []);

  const updateLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setLang(newLang);
  }, []);

  return [lang, updateLang];
}

/**
 * Helper to pick a value based on current language.
 * Useful for simple cases where you don't need the full translation system.
 */
export function pickByLang<T>(lang: Lang, trValue: T, enValue: T): T {
  return lang === 'tr' ? trValue : enValue;
}