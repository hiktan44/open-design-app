import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Open Design',
  description:
    'Local-first AI design product — coding agents, design skills, and design systems streaming design artifacts.',
  applicationName: 'Open Design',
  appleWebApp: {
    capable: true,
    title: 'Open Design',
    statusBarStyle: 'default',
    startupImage: [
      // iOS splash screens — square so they cover all device sizes.
      { url: '/icon-512.png' },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/icon-192.png', sizes: '192x192' }],
    // Safari pinned-tab mask icon — Next.js's Metadata API doesn't have a
    // dedicated `mask` field, so we surface it via the generic `other`
    // bucket which renders as a raw <link rel="mask-icon" ...>.
    other: [{ rel: 'mask-icon', url: '/app-icon.svg', color: '#363636' }],
  },
  manifest: '/manifest.webmanifest',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Open Design',
    'msapplication-TileImage': '/icon-512.png',
    'msapplication-TileColor': '#c96442',
    'theme-color': '#c96442',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1916' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

/**
 * Inline script that runs before React hydrates to apply the saved theme
 * preference without a flash of unstyled content. It reads the same
 * localStorage key used by `state/config.ts` and sets `data-theme` on
 * `<html>` immediately — before any CSS or React paint.
 * Keep the accent variable mix ratios in sync with `accentVars()` in
 * `src/state/appearance.ts`; this script cannot import application modules.
 */
const themeInitScript = `(function(){try{var c=JSON.parse(localStorage.getItem('open-design:config')||'{}');var t=c.theme;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);var a=typeof c.accentColor==='string'&&/^#[0-9a-fA-F]{6}$/.test(c.accentColor.trim())?c.accentColor.trim().toLowerCase():'';if(a){var s=document.documentElement.style;s.setProperty('--accent',a);s.setProperty('--accent-strong','color-mix(in srgb, '+a+' 86%, var(--text-strong))');s.setProperty('--accent-soft','color-mix(in srgb, '+a+' 22%, var(--bg-panel))');s.setProperty('--accent-tint','color-mix(in srgb, '+a+' 12%, var(--bg-panel))');s.setProperty('--accent-hover','color-mix(in srgb, '+a+' 90%, var(--text-strong))');}}catch(e){}})();`;

// Register the PWA service worker as soon as the page is interactive so
// install prompts and offline shell are available on the second visit
// without waiting for the full React hydration. Keep the registration
// deferred to idle time so first paint isn't blocked.
const swRegisterScript = `(function(){if(!('serviceWorker'in navigator))return;window.addEventListener('load',function(){if('requestIdleCallback'in window){requestIdleCallback(function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}else{setTimeout(function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});},0);}});})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme-init inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: service-worker registration runs only on load, no inline data */}
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
