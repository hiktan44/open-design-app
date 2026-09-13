import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from 'react';
import { RemixIcon } from './RemixIcon';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  onClose?: () => void;
}

export function VisualDiffSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Öncesi (Before)',
  afterLabel = 'Sonrası (After)',
  onClose,
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [mode, setMode] = useState<'slider' | 'side-by-side' | 'difference'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      updatePosition(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  return (
    <div className="visual-diff-modal" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'var(--bg-panel, #ffffff)',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'hidden',
        border: '1px solid var(--border, #e5e7eb)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          background: 'var(--bg-app, #f9fafb)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RemixIcon name="git-commit-line" size={18} />
            <strong style={{ fontSize: '14px' }}>Görsel Karşılaştırma & Versiyon Farkı</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setMode('slider')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border, #e5e7eb)',
                background: mode === 'slider' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: mode === 'slider' ? '#ffffff' : 'inherit',
                cursor: 'pointer',
              }}
            >
              Slider
            </button>
            <button
              type="button"
              onClick={() => setMode('side-by-side')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border, #e5e7eb)',
                background: mode === 'side-by-side' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: mode === 'side-by-side' ? '#ffffff' : 'inherit',
                cursor: 'pointer',
              }}
            >
              Yan Yana
            </button>
            <button
              type="button"
              onClick={() => setMode('difference')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border, #e5e7eb)',
                background: mode === 'difference' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: mode === 'difference' ? '#ffffff' : 'inherit',
                cursor: 'pointer',
              }}
            >
              Fark Vurgusu
            </button>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginLeft: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                aria-label="Kapat"
              >
                <RemixIcon name="close-line" size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '16px', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
          {mode === 'slider' && (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              style={{
                position: 'relative',
                userSelect: 'none',
                cursor: 'ew-resize',
                overflow: 'hidden',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                maxWidth: '100%',
              }}
            >
              {/* After Image (Background) */}
              <img
                src={afterImage}
                alt={afterLabel}
                style={{ display: 'block', maxWidth: '100%', height: 'auto', pointerEvents: 'none' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {afterLabel}
              </div>

              {/* Before Image (Clipped Overlay) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPosition}%`,
                  overflow: 'hidden',
                  borderRight: '2px solid var(--accent, #3b82f6)',
                }}
              >
                <img
                  src={beforeImage}
                  alt={beforeLabel}
                  style={{
                    display: 'block',
                    width: containerRef.current?.offsetWidth || 'auto',
                    maxWidth: 'none',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}>
                  {beforeLabel}
                </div>
              </div>

              {/* Divider Handle */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderPosition}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--accent, #3b82f6)',
                  color: 'var(--accent, #3b82f6)',
                  pointerEvents: 'none',
                }}
              >
                <RemixIcon name="arrow-left-right-line" size={16} />
              </div>
            </div>
          )}

          {mode === 'side-by-side' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{beforeLabel}</div>
                <img src={beforeImage} alt={beforeLabel} style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{afterLabel}</div>
                <img src={afterImage} alt={afterLabel} style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
            </div>
          )}

          {mode === 'difference' && (
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={afterImage} alt={afterLabel} style={{ display: 'block', maxWidth: '100%' }} />
              <img
                src={beforeImage}
                alt={beforeLabel}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  mixBlendMode: 'difference',
                  opacity: 0.85,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
