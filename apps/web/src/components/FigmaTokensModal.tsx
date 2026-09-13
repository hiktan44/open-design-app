import { useState } from 'react';
import { RemixIcon } from './RemixIcon';
import { exportToFigmaTokens, importFromFigmaTokens } from '../lib/figmaTokens';

interface Props {
  currentTokens?: Record<string, string>;
  onApplyTokens?: (newTokens: Record<string, string>) => void;
  onClose: () => void;
}

export function FigmaTokensModal({ currentTokens = {}, onApplyTokens, onClose }: Props) {
  const [jsonInput, setJsonInput] = useState(() => {
    const exported = exportToFigmaTokens(currentTokens);
    return JSON.stringify(exported, null, 2);
  });
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setStatusMessage('Figma JSON tokenları panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      const imported = importFromFigmaTokens(jsonInput);
      if (onApplyTokens) {
        onApplyTokens(imported);
      }
      setStatusMessage(`Başarılı! ${Object.keys(imported).length} token içe aktarıldı.`);
    } catch {
      setStatusMessage('Hata: Geçersiz JSON formatı. Lütfen Figma Tokens Studio JSON formatını kontrol edin.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-panel, #ffffff)',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        border: '1px solid var(--border, #e5e7eb)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          background: 'var(--bg-app, #f9fafb)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RemixIcon name="shapes-line" size={20} />
            <strong style={{ fontSize: '15px' }}>Figma & Penpot Token Köprüsü</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <RemixIcon name="close-line" size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #6b7280)', margin: 0 }}>
            Open Design tasarım tokenlarını (renkler, tipografi, radius) Figma'daki <em>Tokens Studio</em> eklentisine aktarabilir veya Figma'dan kopyaladığınız JSON token setini buraya yapıştırarak uygulayabilirsiniz.
          </p>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{
              width: '100%',
              height: '240px',
              padding: '12px',
              fontSize: '12px',
              fontFamily: 'monospace',
              borderRadius: '8px',
              border: '1px solid var(--border, #d1d5db)',
              background: 'var(--bg-input, #f9fafb)',
              color: 'inherit',
              resize: 'vertical',
            }}
          />

          {statusMessage && (
            <div style={{
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'var(--bg-subtle, #f3f4f6)',
              border: '1px solid var(--border, #e5e7eb)',
            }}>
              {statusMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--border, #d1d5db)',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Kopyalandı!' : 'Figma JSON Kopyala'}
            </button>

            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                background: 'var(--accent, #3b82f6)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Tasarım Sistemine Uygula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
