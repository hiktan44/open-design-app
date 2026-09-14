'use client';

import React from 'react';
import styles from './DesignShowcaseMarquee.module.css';

export interface DesignShowcaseItem {
  id: string;
  title: string;
  category: string;
  url: string;
  image: string;
  prompt: string;
}

export const WEB_DESIGNS: DesignShowcaseItem[] = [
  {
    id: 'studio-arch',
    title: 'Nordic Villa & Mimarlık Web Sayfası',
    category: 'Mimarlık & Portfolyo',
    url: 'studio.opendesign.app/villa-solstice',
    image: '/showcase/turkish-studio-showcase.jpg',
    prompt: 'İskandinav minimalizmi, krem ve taş tonları, lüks serif başlıklar ve fotoğraf odaklı mimari portfolyo web sayfası tasarımı.',
  },
  {
    id: 'turkish-ecommerce',
    title: 'Aura Home Lüks E-Ticaret Web Sayfası',
    category: 'E-Ticaret & Vitrin Tasarımı',
    url: 'aurahome.com.tr/koleksiyon',
    image: '/showcase/turkish-ecommerce-showcase.jpg',
    prompt: 'Lüks minimalist Türk mobilya ve dekorasyon e-ticaret vitrini, bej ve antrasit renk paleti, zarif tipografi, ürün kartları ve sepet navigasyonu.',
  },
  {
    id: 'saas-dashboard',
    title: 'Modern SaaS Analitik Dashboard UI',
    category: 'SaaS & Panel Tasarımı',
    url: 'cloud.opendesign.app/dashboard',
    image: '/showcase/turkish-saas-showcase.jpg',
    prompt: 'Koyu tema glassmorphism SaaS kontrol paneli, metrik kartları, canlı performans grafikleri ve modern navigasyon arayüzü.',
  },
  {
    id: 'turkish-fintech',
    title: 'Astra BIST & Küresel Finans Portalı',
    category: 'Fintech & Borsa Web UI',
    url: 'astra.com.tr/dashboard',
    image: '/showcase/turkish-fintech-showcase.jpg',
    prompt: 'Koyu tema finans ve borsa yatırım takip arayüzü, canlı mum grafikleri, portföy dağılımı, emir kartı ve hisse takip listesi tasarımı.',
  },
  {
    id: 'kanban-ui',
    title: 'Çevik Görev & Kanban Tahtası Arayüzü',
    category: 'Web App Arayüz Tasarımı',
    url: 'tasks.opendesign.app/board',
    image: '/community-templates/kanban-board.webp',
    prompt: 'Linear ve Notion tarzı modern çevik proje takip paneli, sürükle-bırak görev kartları ve durum kolonları.',
  },
  {
    id: 'landing-dark',
    title: 'Yeni Nesil Web Açılış Sayfası',
    category: 'Landing Page Tasarımı',
    url: 'product.opendesign.app/preview',
    image: '/community-templates/open-design-landing.webp',
    prompt: 'Yüksek dönüşümlü koyu tema ürün açılış sayfası, hero vitrini, interaktif özellik kartları ve estetik gradientler.',
  },
  {
    id: 'live-artifact',
    title: 'Kreatif Ajans & Portfolyo Tasarımı',
    category: 'Ajans & Portfolyo',
    url: 'creatives.opendesign.app/showcase',
    image: '/community-templates/live-artifact.webp',
    prompt: 'Kreatif tasarım ajansı için tipografik web sayfası, etkileşimli vaka çalışmaları galerisi ve modern koyu arayüz.',
  },
  {
    id: 'data-dashboard',
    title: 'Veri & Telemetri İzleme Paneli',
    category: 'Dashboard & UI',
    url: 'metrics.opendesign.app/live',
    image: '/community-templates/dashboard.webp',
    prompt: 'Kapsamlı sistem monitörü ve analitik gösterge paneli, grafik gridleri ve fütüristik metrik bileşenleri.',
  },
];

const TICKER_TEXTS = [
  '✦ Modern Web Sayfası Tasarımları',
  '✦ Responsive & Mobil Uyumlu UI',
  '✦ Cam & Glassmorphism Arayüzler',
  '✦ Tailwind CSS & Modern Web Standartları',
  '✦ Lüks Tipografi & Düzen Tasarımı',
  '✦ SaaS Dashboard & Panel Tasarımları',
  '✦ E-Ticaret & Portfolyo Şablonları',
  '✦ Canlı Frontend Kod Önizleme',
  '✦ Yüksek Performanslı Arayüz Mimarisi',
  '✦ Piksel Hassasiyetinde Sayfa Düzeni',
];

interface DesignShowcaseMarqueeProps {
  onSelectDesign?: (prompt: string) => void;
}

export function DesignShowcaseMarquee({ onSelectDesign }: DesignShowcaseMarqueeProps) {
  // Sonsuz kesintisiz döngü için listeyi 2 kez çoğaltıyoruz
  const duplicatedDesigns = [...WEB_DESIGNS, ...WEB_DESIGNS];
  const duplicatedTickers = [...TICKER_TEXTS, ...TICKER_TEXTS];

  return (
    <div className={styles.showcaseWrapper}>
      {/* ─────────────────────────────────────────────────────────────
          1. Kayan Yazı Sistemi (Marquee Ticker)
          ───────────────────────────────────────────────────────────── */}
      <div className={styles.tickerTrack} aria-hidden="true">
        <div className={styles.tickerInner}>
          {duplicatedTickers.map((text, idx) => (
            <div key={idx} className={styles.tickerBadge}>
              <span className={styles.tickerDot} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Kayan Web Sayfası Tasarımları Şeridi
          ───────────────────────────────────────────────────────────── */}
      <div className={styles.designsCarousel}>
        <div className={styles.designsTrack}>
          {duplicatedDesigns.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className={styles.designCard}
              onClick={() => onSelectDesign?.(item.prompt)}
              title={`${item.title} — Bu tasarımı stüdyoda aç`}
            >
              {/* Tarayıcı Barı */}
              <div className={styles.cardBrowserBar}>
                <div className={styles.cardDots}>
                  <span className={styles.cardDot} />
                  <span className={styles.cardDot} />
                  <span className={styles.cardDot} />
                </div>
                <span className={styles.cardUrl}>{item.url}</span>
              </div>

              {/* Tasarım Görseli */}
              <div className={styles.cardImageWrap}>
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.cardGradientOverlay} />

                {/* Kart Bilgileri */}
                <div className={styles.cardMeta}>
                  <div>
                    <h4 className={styles.cardTitle}>{item.title}</h4>
                    <div className={styles.cardCategory}>{item.category}</div>
                  </div>
                  <span className={styles.cardActionBadge}>Tasarla ⚡</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
