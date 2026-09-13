import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import { AnalyticsProvider } from '../src/analytics/provider';
import '@excalidraw/excalidraw/index.css';
import '../src/index.css';
import '../src/styles/home/index.css';

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
 * Inline script that runs before React hydrates so the first paint already
 * carries the app's appearance — no flash of unstyled content.
 *
 * `data-theme` is pinned to `light` unconditionally, and deliberately OUTSIDE
 * the try/catch: OpenDesign ships light-only (product removed the theme
 * setting), and a stored `dark` / `system` from the old picker must never reach
 * the document. Every dark CSS rule is gated on the attribute being absent, so
 * a storage read that throws must still leave the attribute stamped.
 * Keep the accent variable mix ratios in sync with `accentVars()` in
 * `src/state/appearance.ts`; this script cannot import application modules.
 */
const themeInitScript = `(function(){document.documentElement.setAttribute('data-theme','light');try{var c=JSON.parse(localStorage.getItem('open-design:config')||'{}');var a=typeof c.accentColor==='string'&&/^#[0-9a-fA-F]{6}$/.test(c.accentColor.trim())?c.accentColor.trim().toLowerCase():'#353535';if(c.configMigrationVersion!==3&&(a==='#87ea5c'||a==='#c96442'))a='#353535';var s=document.documentElement.style;s.setProperty('--accent',a);s.setProperty('--accent-strong','color-mix(in srgb, '+a+' 82%, var(--text-strong))');s.setProperty('--accent-soft','color-mix(in srgb, '+a+' 12%, var(--bg-subtle))');s.setProperty('--accent-tint','color-mix(in srgb, '+a+' 6%, var(--bg-panel))');s.setProperty('--accent-hover','color-mix(in srgb, '+a+' 86%, var(--text-strong))');}catch(e){}})();`;

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
        <I18nProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
