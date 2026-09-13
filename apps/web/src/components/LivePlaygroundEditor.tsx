import { useState, useCallback } from 'react';
import { RemixIcon } from './RemixIcon';

interface Props {
  initialCode: string;
  onCodeChange: (updatedCode: string) => void;
  language?: 'html' | 'tsx' | 'css';
  onClose?: () => void;
}

export function LivePlaygroundEditor({
  initialCode,
  onCodeChange,
  language = 'html',
  onClose,
}: Props) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  const handleApply = useCallback(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    onCodeChange(initialCode);
  }, [initialCode, onCodeChange]);

  return (
    <div className="live-playground-editor" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-panel, #1e1e1e)',
      color: 'var(--text, #d4d4d4)',
      borderLeft: '1px solid var(--border, #333333)',
      fontFamily: 'monospace',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--bg-app, #252526)',
        borderBottom: '1px solid var(--border, #333333)',
        fontSize: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RemixIcon name="code-s-slash-line" size={16} />
          <strong>Canlı Kod Editörü ({language.toUpperCase()})</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid var(--border, #444)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Sıfırla
          </button>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid var(--border, #444)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              background: 'var(--accent, #3b82f6)',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Canlı Güncelle
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <RemixIcon name="close-line" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Code Textarea */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '12px',
            background: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '13px',
            lineHeight: 1.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
