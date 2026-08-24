/**
 * This module provides IP-based language detection integrated with the existing i18n system.
 * It enhances the existing multi-language system with automatic TR/EN detection based on user location.
 */

import { useCallback } from 'react';
import { useLang as useIPBasedLang, langToLocale } from './use-lang';
import type { Locale } from '../i18n/types';

/**
 * Enhanced I18n hook that combines IP-based detection with existing translation system.
 * Returns the locale (tr/en) and setter function compatible with existing i18n.
 */
export function useI18nLocale(): [Locale, (locale: Locale) => void] {
  const [lang, setLang] = useIPBasedLang();

  const setLocale = useCallback((locale: Locale) => {
    // Convert Locale back to Lang for the setter
    const newLang = locale === 'tr' ? 'tr' : 'en';
    setLang(newLang);
  }, [setLang]);

  return [langToLocale(lang), setLocale];
}

/**
 * Convenience hook that returns only the translation function.
 * Re-exports from the existing i18n system.
 */
export { useT, useI18n } from '../i18n';