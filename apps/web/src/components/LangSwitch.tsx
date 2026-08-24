'use client';

import { useT } from '../i18n';
import type { Locale } from '../i18n/types';
import { setLang as setIPBasedLang } from '../lib/use-lang';

/**
 * Language switcher component for toggling between TR and EN.
 * Displays current language and allows switching to the other available language.
 */
export function LangSwitch() {
  const t = useT();

  const toggleLanguage = () => {
    // Get current language from localStorage or default to 'tr'
    let currentLang: Locale = 'tr';
    try {
      const stored = localStorage.getItem('ui_lang');
      if (stored === 'tr' || stored === 'en') {
        currentLang = stored as Locale;
      }
    } catch {
      // Ignore localStorage errors
    }

    // Toggle to the other language
    const newLang: Locale = currentLang === 'tr' ? 'en' : 'tr';

    // Use the IP-based language setter
    setIPBasedLang(newLang);

    // Force reload to apply the new language
    window.location.reload();
  };

  // Get current language for display
  let currentLang: Locale = 'tr';
  try {
    const stored = localStorage.getItem('ui_lang');
    if (stored === 'tr' || stored === 'en') {
      currentLang = stored as Locale;
    }
  } catch {
    // Ignore localStorage errors
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="lang-switch"
      title={currentLang === 'tr' ? 'English\'e geç' : 'Türkçe\'ye geç'}
      aria-label={currentLang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <span className="lang-current">{currentLang === 'tr' ? 'TR' : 'EN'}</span>
      <span className="lang-icon">⇄</span>
    </button>
  );
}