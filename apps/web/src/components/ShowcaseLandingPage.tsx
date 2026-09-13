import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from './ShowcaseLandingPage.module.css';
import { GoogleSignInButton } from './GoogleSignInButton';
import { navigate } from '../router';

interface ShowcaseLandingPageProps {
  onEnterStudio?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Interactive Canvas Hero (Glowing particles, physics & mouse pull)
// ─────────────────────────────────────────────────────────────
function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particleCount = Math.min(80, Math.floor((width * height) / 14000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#60a5fa', '#a78bfa', '#f472b6', '#38bdf8', '#818cf8'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#60a5fa',
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle background radial gradient from mouse
      if (mouse.x > 0 && mouse.y > 0) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          350,
        );
        glow.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
        glow.addColorStop(1, 'rgba(8, 9, 13, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Mouse interaction (repel/attract spring)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2) continue;
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist2 / 120) * 0.18;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvasBackground} />;
}

// ─────────────────────────────────────────────────────────────
// Three Interactive Demo Web Apps (Rendered live in mockup browser)
// ─────────────────────────────────────────────────────────────
function DemoCyberPulse() {
  const [metricValue, setMetricValue] = useState(84.6);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ padding: '32px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }} />
          <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '15px' }}>CYBERPULSE // AI CORE</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['overview', 'neural-nodes', 'metrics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                border: activeTab === tab ? '1px solid #00f2fe' : '1px solid transparent',
                color: activeTab === tab ? '#00f2fe' : 'rgba(255,255,255,0.6)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>İşlem Kapasitesi</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00f2fe', marginTop: '6px' }}>{metricValue}%</div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${metricValue}%`, height: '100%', background: 'linear-gradient(90deg, #00f2fe, #4facfe)' }} />
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Gecikme (Latency)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38ef7d', marginTop: '6px' }}>12.4 ms</div>
          <div style={{ fontSize: '11px', color: '#38ef7d', marginTop: '8px' }}>▲ %42 daha hızlı</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Aktif Ajan Sayısı</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f355da', marginTop: '6px' }}>6 Swarm</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Tam senkronize</div>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '12px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Yapay Zeka Destekli Otonom Arayüz Motoru</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '440px', margin: '0 0 16px', lineHeight: 1.5 }}>
          Bu arayüz, OpenDesign'ın Cyberpunk & Glassmorphism tasarım kiti kullanılarak Claude 3.7 Sonnet tarafından tek prompt ile üretilmiştir.
        </p>
        <button
          onClick={() => setMetricValue(Number((Math.random() * 20 + 80).toFixed(1)))}
          style={{
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            color: '#080a0f',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 18px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Canlı Veriyi Simüle Et ⚡
        </button>
      </div>
    </div>
  );
}

function DemoAuraStudio() {
  const [selectedWork, setSelectedWork] = useState(0);
  const works = [
    { title: 'Villa Solstice', category: 'Nordic Architecture', year: '2026', color: '#e2d9cc' },
    { title: 'Komorebi Pavilion', category: 'Biophilic Design', year: '2025', color: '#cbd5e1' },
    { title: 'Atelier Monochrome', category: 'Interior Spaces', year: '2026', color: '#fed7aa' },
  ];

  const currentWork = works[selectedWork] ?? works[0]!;

  return (
    <div style={{ padding: '36px', color: '#1e293b', background: '#faf9f6', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 400, letterSpacing: '-0.03em', margin: 0, color: '#0f172a' }}>AURA / STUDIO</h2>
        <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b' }}>Arch & Space 2026</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center', margin: '24px 0' }}>
        <div style={{ height: '260px', background: currentWork.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>Seçili Proje</div>
            <div style={{ fontSize: '30px', fontWeight: 400, color: '#0f172a' }}>{currentWork.title}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>{currentWork.category} — {currentWork.year}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Portfolyo Seçin</div>
          {works.map((w, idx) => (
            <div
              key={w.title}
              onClick={() => setSelectedWork(idx)}
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                background: selectedWork === idx ? '#f1f5f9' : 'transparent',
                borderLeft: selectedWork === idx ? '3px solid #0f172a' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{w.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>{w.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '12px' }}>
        <span>Minimalist & Lüks Tipografi Tasarım Kiti</span>
        <span>OpenDesign AI ile 12 saniyede üretildi</span>
      </div>
    </div>
  );
}

function DemoStratosSaaS() {
  const [seats, setSeats] = useState(15);
  const price = useMemo(() => seats * 12, [seats]);

  return (
    <div style={{ padding: '32px', color: '#f8fafc', background: '#090d16', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>S</div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Stratos Cloud</span>
        </div>
        <div style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>
          v2.4 Canlı Yayında
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Modern Takımlar İçin Yeni Nesil Altyapı
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Kullanıcı sayınıza göre esnek fiyatlandırma hesaplayıcısını canlı deneyin.
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Ekip Üye Sayısı: <strong>{seats} Kişi</strong></span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#a855f7' }}>${price}<span style={{ fontSize: '13px', color: '#64748b' }}>/ay</span></span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          <span>1 Üye</span>
          <span>50 Üye</span>
          <span>100+ Kurumsal</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
        <span>✓ 14 Gün Ücretsiz Deneme</span>
        <span>✓ Kredi Kartı Gerekmez</span>
        <span>✓ Tek Tıkla Coolify Dağıtımı</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Showcase Landing Page Component
// ─────────────────────────────────────────────────────────────
export function ShowcaseLandingPage({ onEnterStudio }: ShowcaseLandingPageProps) {
  const [activeDemo, setActiveDemo] = useState<'cyber' | 'aura' | 'stratos'>('cyber');
  const [simPrompt, setSimPrompt] = useState('SaaS Analiz ve Raporlama Paneli');
  const [simGenerating, setSimGenerating] = useState(false);
  const [simStep, setSimStep] = useState(100);

  const heroWebTemplates = [
    {
      id: 'landing',
      title: 'Next-Gen SaaS & Cloud Landing Page',
      badge: '🚀 SaaS & Startup',
      image: '/community-templates/open-design-landing.webp',
      url: 'https://opendesign.studio/preview/cyber-saas',
      meta: 'Dark Glassmorphism · Parallax Hero · React 18',
    },
    {
      id: 'dashboard',
      title: 'AI Analytics & Real-Time Metrics Cockpit',
      badge: '📊 AI Dashboard',
      image: '/community-templates/dashboard.webp',
      url: 'https://opendesign.studio/preview/ai-analytics',
      meta: 'Canlı Metrikler · NPU Grafikleri · Responsive Grid',
    },
    {
      id: 'pitch',
      title: 'Artisan Architecture & Minimalist Design Portfolio',
      badge: '🏛️ Lüks Portfolyo',
      image: '/community-templates/pitch-deck.webp',
      url: 'https://opendesign.studio/preview/studio-aura',
      meta: 'Zarif Serif · Galeri Grid · Monokrom Tipografi',
    },
    {
      id: 'kanban',
      title: 'Interactive Agile Project & Task Application',
      badge: '📋 Modern Web App',
      image: '/community-templates/kanban-board.webp',
      url: 'https://opendesign.studio/preview/team-kanban',
      meta: 'Sürükle-Bırak · Canlı Senkronizasyon · Durum Kartları',
    },
    {
      id: 'blog',
      title: 'Editorial High-Contrast Tech Magazine & Journal',
      badge: '📰 Editoryal Blog',
      image: '/community-templates/blog-post.webp',
      url: 'https://opendesign.studio/preview/tech-journal',
      meta: 'Okuma Modu · Yüksek Tipografi Kontrastı · SEO Optimize',
    },
  ];

  const [selectedHeroTemplate, setSelectedHeroTemplate] = useState(0);
  const currentHeroTemplate = heroWebTemplates[selectedHeroTemplate] ?? heroWebTemplates[0]!;

  const presets = [
    {
      title: 'SaaS Analiz ve Raporlama Paneli',
      prompt: 'Koyu tema glassmorphism dashboard, canlı CPU & gecikme grafikleri, 3 adet metrik kartı ve fütüristik kontrol butonları.',
      demo: 'cyber' as const,
    },
    {
      title: 'Artizan Mimarlık & Tasarım Stüdyosu',
      prompt: 'İskandinav minimalizmi, krem tonları, lüks serif başlıklar, interaktif portfolyo sergisi ve zarif düzen.',
      demo: 'aura' as const,
    },
    {
      title: 'Yüksek Dönüşümlü Bulut SaaS Tanıtımı',
      prompt: 'Linear/Stripe tarzı koyu arayüz, interaktif üye sayısı fiyat hesaplama sürgüsü ve modern özellik kartları.',
      demo: 'stratos' as const,
    },
  ];

  const handleRunSim = (preset: typeof presets[0]) => {
    setSimPrompt(preset.title);
    setSimGenerating(true);
    setSimStep(0);

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimGenerating(false);
          setActiveDemo(preset.demo);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleStartStudio = () => {
    if (onEnterStudio) {
      onEnterStudio();
    } else {
      navigate({ kind: 'home', view: 'home' });
    }
  };

  return (
    <div className={styles.landingRoot}>
      {/* ─────────────────────────────────────────────────────────────
          Navbar
          ───────────────────────────────────────────────────────────── */}
      <header className={styles.navHeader}>
        <div className={styles.navInner}>
          <div className={styles.brandLogo} onClick={handleStartStudio}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3b82f6" />
              <path d="M8 16L16 8L24 16L16 24L8 16Z" fill="#ffffff" />
            </svg>
            <span>OpenDesign</span>
            <span className={styles.brandBadge}>AI Web Studio</span>
          </div>

          <nav className={styles.navLinks}>
            <a href="#showcase" className={styles.navLink}>Canlı Vitrin</a>
            <a href="#simulator" className={styles.navLink}>Nasıl Çalışır?</a>
            <a href="#llms" className={styles.navLink}>LLM Modelleri</a>
            <a href="#features" className={styles.navLink}>Özellikler</a>
          </nav>

          <div className={styles.navActions}>
            <GoogleSignInButton variant="compact" />
            <button type="button" onClick={handleStartStudio} className={styles.btnCtaPrimary}>
              <span>Stüdyoya Gir</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          Hero Section with Cosmic Interactive Canvas
          ───────────────────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <CosmicCanvas />

        <div className={styles.heroContent}>
          <div className={styles.pillTag}>
            <span>✨</span>
            <span>Opus 5 & GPT-5.6 Sol & Gemini 3.8 Flash Destekli</span>
          </div>

          <h1 className={styles.heroTitle}>
            Tek Bir Cümleyle <br />
            <span className={styles.gradientText}>Dünyayı Hayran Bırakan</span> <br />
            Web Siteleri Üretin.
          </h1>

          <p className={styles.heroSubtitle}>
            Haftalar süren tasarım ve kodlama süreçlerini unutun. OpenDesign; yapay zeka ajanları,
            modern CSS sistemleri ve tek tıkla canlıya alma yeteneğiyle hayalinizdeki web sitesini
            saniyeler içinde gerçeğe dönüştürür.
          </p>

          <div className={styles.heroCtaGroup}>
            <button type="button" onClick={handleStartStudio} className={styles.btnLargeHero}>
              <span>⚡ Hemen Ücretsiz Tasarla</span>
            </button>
            <a href="#showcase" className={styles.btnCtaSecondary} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <span>Canlı Örnekleri İncele ↓</span>
            </a>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              Interactive Web Showcase Visuals in Hero
              ───────────────────────────────────────────────────────────── */}
          <div className={styles.heroVisualWrapper}>
            {/* Template Selector Pills */}
            <div className={styles.heroTemplateSelector}>
              {heroWebTemplates.map((tmpl, idx) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedHeroTemplate(idx)}
                  className={`${styles.templatePill} ${selectedHeroTemplate === idx ? styles.templatePillActive : ''}`}
                >
                  <span>{tmpl.badge}</span>
                </button>
              ))}
            </div>

            {/* Browser Frame Mockup with Real Webpage Screenshot */}
            <div className={styles.heroBrowserFrame}>
              {/* Floating Badge Top-Left */}
              <div className={styles.floatingPillLeft}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  ⚡
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>AI Sentez Tamamlandı</div>
                  <div style={{ fontSize: '11px', color: '#a5b4fc' }}>1.2 sn · Sıfır CSS Çakışması</div>
                </div>
              </div>

              {/* Floating Badge Bottom-Right */}
              <div className={styles.floatingPillRight}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#60a5fa' }}>
                  <span>🎯 Lighthouse Skoru</span>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>100 / 100</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Tailwind + React 18 + W3C Uyumlu
                </div>
              </div>

              {/* Floating Mobile Phone Mockup */}
              <div className={styles.floatingMobileMockup} title="Mobil Uyumlu Görünüm">
                <img
                  src="/community-templates/mobile-flow.webp"
                  alt="Mobil Web Tasarımı"
                  loading="lazy"
                />
              </div>

              {/* Browser Window Header */}
              <div className={styles.browserTopBar}>
                <div className={styles.browserDots}>
                  <div className={`${styles.browserDot} ${styles.dotRed}`} />
                  <div className={`${styles.browserDot} ${styles.dotYellow}`} />
                  <div className={`${styles.browserDot} ${styles.dotGreen}`} />
                </div>

                <div className={styles.browserAddressBar}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>{currentHeroTemplate.url}</span>
                </div>

                <div className={styles.browserLiveBadge}>
                  <span className={styles.livePulseDot} />
                  <span>Canlı Önizleme</span>
                </div>
              </div>

              {/* Web Page Image Container */}
              <div className={styles.heroImageContainer}>
                <img
                  key={currentHeroTemplate.id}
                  src={currentHeroTemplate.image}
                  alt={currentHeroTemplate.title}
                  className={styles.heroWebImage}
                />
                <div className={styles.heroImageOverlay} />

                <div className={styles.heroImageCaption}>
                  <div className={styles.captionTitle}>
                    {currentHeroTemplate.title}
                  </div>
                  <div className={styles.captionMeta}>
                    {currentHeroTemplate.meta}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroStatsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>150+</div>
              <div className={styles.statLabel}>Hazır Tasarım Sistemi & Kit</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>&lt; 30 sn</div>
              <div className={styles.statLabel}>Tam Sayfa Üretim Süresi</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>%100</div>
              <div className={styles.statLabel}>Kaynak Kod Sahipliği & Export</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>6+ LLM</div>
              <div className={styles.statLabel}>Bulut & Yerel Model Seçeneği</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Interactive Live Showcase Section (3 Gorgeous Mini-Sites)
          ───────────────────────────────────────────────────────────── */}
      <section id="showcase" className={styles.showcaseSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>CANLI ETKİLEŞİMLİ VİTRİN</div>
          <h2 className={styles.sectionTitle}>Yapay Zekanın Neler Yapabildiğini Canlı Görün</h2>
          <p className={styles.sectionDesc}>
            Aşağıdaki sekmelere tıklayarak OpenDesign ile üretilmiş farklı sektör ve tarzdaki
            web uygulamalarını tarayıcınızda canlı olarak test edin.
          </p>
        </div>

        <div className={styles.demoSwitcherTabs}>
          <button
            type="button"
            className={`${styles.demoTabBtn} ${activeDemo === 'cyber' ? styles.demoTabBtnActive : ''}`}
            onClick={() => setActiveDemo('cyber')}
          >
            <span>🌌</span> CyberPulse AI (Dark Cyberpunk)
          </button>
          <button
            type="button"
            className={`${styles.demoTabBtn} ${activeDemo === 'aura' ? styles.demoTabBtnActive : ''}`}
            onClick={() => setActiveDemo('aura')}
          >
            <span>🏛️</span> Aura Luxury (Minimalist Mimarlık)
          </button>
          <button
            type="button"
            className={`${styles.demoTabBtn} ${activeDemo === 'stratos' ? styles.demoTabBtnActive : ''}`}
            onClick={() => setActiveDemo('stratos')}
          >
            <span>⚡</span> Stratos Cloud (Modern SaaS)
          </button>
        </div>

        <div className={styles.mockupBrowserContainer}>
          <div className={styles.mockupBrowserHeader}>
            <div className={styles.trafficLights}>
              <div className={styles.trafficDot} style={{ background: '#ef4444' }} />
              <div className={styles.trafficDot} style={{ background: '#f59e0b' }} />
              <div className={styles.trafficDot} style={{ background: '#10b981' }} />
            </div>
            <div className={styles.mockupUrlBar}>
              https://preview.opendesign.ai/{activeDemo}-masterpiece.html
            </div>
            <div className={styles.mockupControls}>
              <span>⟳</span>
              <span>⤢</span>
            </div>
          </div>
          <div className={styles.mockupContentBody}>
            {activeDemo === 'cyber' && <DemoCyberPulse />}
            {activeDemo === 'aura' && <DemoAuraStudio />}
            {activeDemo === 'stratos' && <DemoStratosSaaS />}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Prompt Simulator Section
          ───────────────────────────────────────────────────────────── */}
      <section id="simulator" className={styles.simulatorSection}>
        <div className={styles.simulatorCard}>
          <div className={styles.sectionHeader} style={{ marginBottom: '32px' }}>
            <div className={styles.sectionBadge}>NASIL ÇALIŞIR?</div>
            <h2 className={styles.sectionTitle} style={{ fontSize: '32px' }}>
              Komuttan Canlı Web Sitesine: 3 Adımda Akış
            </h2>
            <p className={styles.sectionDesc}>
              Bir hazır prompt şablonuna tıklayın, yapay zekanın tasarım kararlarını ve kod çıktısını nasıl inşa ettiğini izleyin.
            </p>
          </div>

          <div className={styles.simGrid}>
            <div className={styles.simPromptSide}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#93c5fd' }}>
                1. ÖRNEK BİR İSTEK SEÇİN VEYA ÇALIŞTIRIN:
              </div>
              <div className={styles.simPresetList}>
                {presets.map((p) => (
                  <div
                    key={p.title}
                    className={`${styles.simPresetBtn} ${simPrompt === p.title ? styles.simPresetBtnActive : ''}`}
                    onClick={() => handleRunSim(p)}
                  >
                    <div className={styles.simPresetTitle}>
                      <span>{p.title}</span>
                      <span style={{ fontSize: '11px', color: '#60a5fa' }}>Dene →</span>
                    </div>
                    <div className={styles.simPresetPrompt}>{p.prompt}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStartStudio}
                className={styles.btnCtaPrimary}
                style={{ justifyContent: 'center', padding: '12px', marginTop: '10px' }}
              >
                Bu Tasarımı Stüdyoda Düzenle →
              </button>
            </div>

            <div className={styles.simCodeOutputCard}>
              <div className={styles.simCodeHeader}>
                <span>🤖 AI AGENT EXECUTION LOG</span>
                <span>{simGenerating ? '⚙️ KOD DERLENİYOR...' : '✅ HAZIR'}</span>
              </div>
              <div style={{ color: '#38bdf8', marginBottom: '8px' }}>
                &gt; Claude 3.7 Sonnet oturumu başlatıldı.
              </div>
              <div style={{ color: '#a78bfa', marginBottom: '8px' }}>
                &gt; Görev: "{simPrompt}"
              </div>
              <div style={{ color: '#34d399', marginBottom: '8px' }}>
                &gt; Tasarım Sistemi: Glassmorphic Dark Kit yüklendi (tokens.css).
              </div>
              <div style={{ color: '#e2e8f0', opacity: 0.8, fontSize: '12px' }}>
                {simStep >= 25 && <div>[1/4] Renk paleti ve font hiyerarşisi oluşturuluyor...</div>}
                {simStep >= 50 && <div>[2/4] Responsive layout ve interaktif React state'leri bağlandı.</div>}
                {simStep >= 75 && <div>[3/4] Mikro animasyonlar ve CSS GPU geçişleri optimize edildi.</div>}
                {simStep >= 100 && <div style={{ color: '#34d399', fontWeight: 'bold' }}>[4/4] Sayfa başarıyla derlendi! Canlı önizleme vitrine aktarıldı.</div>}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'rgba(255,255,255,0.4)' }}>
                <span>Çıktı Formatı: React + Tailwind + TypeScript</span>
                <span>Export: HTML / ZIP / Coolify</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          LLM Research Showcase (Comparing best models for web design)
          ───────────────────────────────────────────────────────────── */}
      <section id="llms" className={styles.llmSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>YAPAY ZEKA MODEL ARAŞTIRMASI</div>
          <h2 className={styles.sectionTitle}>Web Tasarımı İçin Hangi LLM En İyisi?</h2>
          <p className={styles.sectionDesc}>
            OpenDesign, web ve arayüz geliştirmede dünyanın en yetkin modellerini destekler.
            İhtiyacınıza göre en uygun modeli seçebilirsiniz:
          </p>
        </div>

        <div className={styles.llmGrid}>
          {/* Anthropic Opus 5 & Fable 5.1 */}
          <div className={`${styles.llmCard} ${styles.llmCardLeader}`}>
            <div className={styles.llmHeader}>
              <div className={styles.llmLogoWrap}>
                <div className={styles.llmIcon} style={{ background: '#d97706' }}>🟣</div>
                <div>
                  <div className={styles.llmName}>Claude Opus 5 & Fable 5.1</div>
                  <div className={styles.llmProvider}>Anthropic (Yeni Nesil Akıl Yürütme)</div>
                </div>
              </div>
              <span className={styles.llmBadge} style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', borderColor: '#d97706' }}>
                🏆 Sektörün Zirvesi
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,243,248,0.7)', lineHeight: 1.5 }}>
              Fable 5.1 ve Opus 5'in devrimsel çok boyutlu akıl yürütmesi, modern Tailwind, karmaşık mikro etkileşimler ve sıfır hatalı UI hiyerarşisi üretir.
            </p>
            <ul className={styles.llmProsList}>
              <li><span className={styles.llmProsCheck}>✓</span> Fable 5.1 ile derin estetik ve üstün tipografi</li>
              <li><span className={styles.llmProsCheck}>✓</span> Opus 5 ile karmaşık tasarım mimarisini tek adımda çözme</li>
              <li><span className={styles.llmProsCheck}>✓</span> Hatasız animasyon ve CSS 3D kompozisyonları</li>
            </ul>
          </div>

          {/* OpenAI GPT-5.6 Sol & Astra 6 */}
          <div className={styles.llmCard}>
            <div className={styles.llmHeader}>
              <div className={styles.llmLogoWrap}>
                <div className={styles.llmIcon} style={{ background: '#10a37f' }}>🟢</div>
                <div>
                  <div className={styles.llmName}>GPT-5.6 Sol & Astra 6</div>
                  <div className={styles.llmProvider}>OpenAI (Otonom Tasarım Ajanı)</div>
                </div>
              </div>
              <span className={styles.llmBadge}>⚡ Otonom Üretim</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,243,248,0.7)', lineHeight: 1.5 }}>
              Astra 6 ve 5.6 Sol motoru; el çizimi wireframe'lerden tam teşekküllü web uygulamalarına, canlı state yönetimi ve API entegrasyonu kurar.
            </p>
            <ul className={styles.llmProsList}>
              <li><span className={styles.llmProsCheck}>✓</span> GPT-5.6 Sol ile ultra hızlı frontend sentezi</li>
              <li><span className={styles.llmProsCheck}>✓</span> Astra 6 ile çok sayfalı dinamik web uygulamaları</li>
              <li><span className={styles.llmProsCheck}>✓</span> Görsel eskizleri doğrudan çalışan React koduna dönüştürme</li>
            </ul>
          </div>

          {/* Gemini 3.8 Flash */}
          <div className={styles.llmCard}>
            <div className={styles.llmHeader}>
              <div className={styles.llmLogoWrap}>
                <div className={styles.llmIcon} style={{ background: '#3b82f6' }}>🔵</div>
                <div>
                  <div className={styles.llmName}>Gemini 3.8 Flash</div>
                  <div className={styles.llmProvider}>Google DeepMind</div>
                </div>
              </div>
              <span className={styles.llmBadge}>⚡ Işık Hızında</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,243,248,0.7)', lineHeight: 1.5 }}>
              Gemini 3.8 Flash'ın anlık milisaniyelik yanıt süresi ve devasa bağlam penceresi ile tasarım değişiklikleri kodda gerçek zamanlı yansır.
            </p>
            <ul className={styles.llmProsList}>
              <li><span className={styles.llmProsCheck}>✓</span> Canlı 60 FPS kod ve CSS önizleme akışı</li>
              <li><span className={styles.llmProsCheck}>✓</span> 2M+ devasa bağlam ile tüm projeyi tek seferde analiz</li>
              <li><span className={styles.llmProsCheck}>✓</span> Düşük gecikme ile interaktif tasarım düzenlemeleri</li>
            </ul>
          </div>

          {/* DeepSeek 4.1 Flash & GLM 5.3 Flash */}
          <div className={styles.llmCard}>
            <div className={styles.llmHeader}>
              <div className={styles.llmLogoWrap}>
                <div className={styles.llmIcon} style={{ background: '#4f46e5' }}>🟣</div>
                <div>
                  <div className={styles.llmName}>DeepSeek 4.1 & GLM 5.3</div>
                  <div className={styles.llmProvider}>DeepSeek / Zhipu AI</div>
                </div>
              </div>
              <span className={styles.llmBadge}>Fiyat / Performans</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,243,248,0.7)', lineHeight: 1.5 }}>
              DeepSeek 4.1 Flash ve GLM 5.3 Flash; gelişmiş matematiksel CSS Grid yerleşimlerini, esnek layoutları en uygun maliyetle üretir.
            </p>
            <ul className={styles.llmProsList}>
              <li><span className={styles.llmProsCheck}>✓</span> DeepSeek 4.1 Flash ile bütçe dostu sınırsız deneme</li>
              <li><span className={styles.llmProsCheck}>✓</span> GLM 5.3 Flash ile hızlı ve tutarlı bileşen üretimi</li>
              <li><span className={styles.llmProsCheck}>✓</span> Karmaşık matematiksel layout ve responsive hesaplamaları</li>
            </ul>
          </div>

          {/* MiniMax 3 & Ollama */}
          <div className={styles.llmCard}>
            <div className={styles.llmHeader}>
              <div className={styles.llmLogoWrap}>
                <div className={styles.llmIcon} style={{ background: '#0284c7' }}>🦙</div>
                <div>
                  <div className={styles.llmName}>MiniMax 3 & Ollama</div>
                  <div className={styles.llmProvider}>Yerel & Yüksek Hızlı Mimari</div>
                </div>
              </div>
              <span className={styles.llmBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: '#10b981' }}>
                🔒 %100 Gizlilik & Güç
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,243,248,0.7)', lineHeight: 1.5 }}>
              MiniMax 3'ün yüksek hız kapasitesi ve Ollama yerel çalışma gücüyle, şirket içi projeleri internete çıkmadan tamamen yerelde üretin.
            </p>
            <ul className={styles.llmProsList}>
              <li><span className={styles.llmProsCheck}>✓</span> MiniMax 3 ile ultra hızlı token üretimi</li>
              <li><span className={styles.llmProsCheck}>✓</span> Yerel Ollama ile veriler cihazınızda kalır, sıfır API ücreti</li>
              <li><span className={styles.llmProsCheck}>✓</span> Gizlilik odaklı kurumsal çözümler için ideal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Features Highlights Grid
          ───────────────────────────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>GÜÇLÜ ARAÇLAR</div>
          <h2 className={styles.sectionTitle}>Neden OpenDesign Tercih Ediliyor?</h2>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎚️</div>
            <div className={styles.featureTitle}>Görsel Versiyonlama (Diff Slider)</div>
            <div className={styles.featureDesc}>
              Eski ve yeni tasarım versiyonlarını yan yana veya kayar çizgiyle anlık karşılaştırın; değişiklikleri güvenle yönetin.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎙️</div>
            <div className={styles.featureTitle}>Sesli Komutla Tasarım</div>
            <div className={styles.featureDesc}>
              Klavyeye dokunmadan aklınızdaki tasarımı konuşarak tarif edin; Web Speech API sesinizi saniyeler içinde koda döksün.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <div className={styles.featureTitle}>Tek Tıkla Canlıya Alma (Coolify / Netlify)</div>
            <div className={styles.featureDesc}>
              Tasarladığınız sayfayı tek tıkla webhook üzerinden Coolify sunucunuza deploy edin veya anında ZIP paketi olarak indirin.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <div className={styles.featureTitle}>Figma & Penpot Token Köprüsü</div>
            <div className={styles.featureDesc}>
              Figma ve Penpot tasarım tokenlarını JSON olarak içe ve dışa aktarın; tasarım sisteminizin tutarlılığını koruyun.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🐝</div>
            <div className={styles.featureTitle}>Çoklu Ajan Takımı (Multi-Agent Swarm)</div>
            <div className={styles.featureDesc}>
              Mimar, UI Tasarımcısı, Frontend Uzmanı ve Kalite Kontrol ajanları eşzamanlı çalışarak sitenizi kusursuz tamamlasın.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔑</div>
            <div className={styles.featureTitle}>Google OAuth 2.0 PKCE Güvenliği</div>
            <div className={styles.featureDesc}>
              Güvenli Google girişi ile projelerinizi kaydedin, oturumunuzu tüm cihazlarda senkronize tutun.
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CTA Banner
          ───────────────────────────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px', color: '#fff' }}>
          Kendi Web Sitenizi Tasarlamaya Hazır Mısınız?
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(240,243,248,0.7)', maxWidth: '560px', margin: '0 auto 32px' }}>
          OpenDesign ile hemen ücretsiz bir proje başlatın, fikrinizi saniyeler içinde çalışan bir web sayfasına dönüştürün.
        </p>
        <button
          type="button"
          onClick={handleStartStudio}
          className={styles.btnLargeHero}
          style={{ margin: '0 auto' }}
        >
          <span>✨ Şimdi Ücretsiz Başlayın</span>
          <span>→</span>
        </button>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Footer
          ───────────────────────────────────────────────────────────── */}
      <footer className={styles.footerSection}>
        <div>
          <strong>OpenDesign</strong> — Açık Kaynaklı Yapay Zeka Tasarım Stüdyosu
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }} onClick={handleStartStudio}>Tasarım Stüdyosu</span>
          <a href="https://github.com/nexu-io/open-design" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}
