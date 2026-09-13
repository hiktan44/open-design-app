import { useState, useEffect } from 'react';
import { RemixIcon } from './RemixIcon';
import { triggerDeployWebhook, getProjectExportUrl, type DeploymentResult } from '../lib/deployment';

interface Props {
  projectId: string;
  projectName?: string;
  onClose: () => void;
}

const COOLIFY_STORAGE_KEY = 'opendesign:deploy:coolify_webhook';
const NETLIFY_STORAGE_KEY = 'opendesign:deploy:netlify_webhook';

export function DeployExportModal({ projectId, projectName = 'Proje', onClose }: Props) {
  const [coolifyUrl, setCoolifyUrl] = useState('');
  const [netlifyUrl, setNetlifyUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState<DeploymentResult | null>(null);

  useEffect(() => {
    try {
      setCoolifyUrl(localStorage.getItem(COOLIFY_STORAGE_KEY) || '');
      setNetlifyUrl(localStorage.getItem(NETLIFY_STORAGE_KEY) || '');
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveCoolify = (val: string) => {
    setCoolifyUrl(val);
    try {
      localStorage.setItem(COOLIFY_STORAGE_KEY, val);
    } catch {
      /* ignore */
    }
  };

  const handleSaveNetlify = (val: string) => {
    setNetlifyUrl(val);
    try {
      localStorage.setItem(NETLIFY_STORAGE_KEY, val);
    } catch {
      /* ignore */
    }
  };

  const handleDeploy = async (target: 'coolify' | 'netlify') => {
    const url = target === 'coolify' ? coolifyUrl : netlifyUrl;
    if (!url.trim()) {
      alert('Lütfen geçerli bir webhook adresi girin.');
      return;
    }

    setIsDeploying(true);
    setResult(null);
    try {
      const res = await triggerDeployWebhook(url);
      setResult(res);
    } finally {
      setIsDeploying(false);
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
        maxWidth: '520px',
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
            <RemixIcon name="rocket-line" size={20} />
            <strong style={{ fontSize: '15px' }}>Dağıtım ve Dışa Aktarma ({projectName})</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <RemixIcon name="close-line" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Coolify Webhook */}
          <div style={{ border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <RemixIcon name="server-line" size={16} />
              <strong style={{ fontSize: '13px' }}>Coolify Webhook Dağıtımı</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #6b7280)', margin: '0 0 10px' }}>
              Coolify panelinizdeki uygulamanızın <em>Deploy Webhook URL</em> adresini girin:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                placeholder="https://coolify.example.com/api/v1/deploy?uuid=..."
                value={coolifyUrl}
                onChange={(e) => handleSaveCoolify(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border, #d1d5db)',
                  background: 'var(--bg-input, #ffffff)',
                  color: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => handleDeploy('coolify')}
                disabled={isDeploying || !coolifyUrl.trim()}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--accent, #3b82f6)',
                  color: '#ffffff',
                  cursor: isDeploying ? 'not-allowed' : 'pointer',
                  opacity: isDeploying || !coolifyUrl.trim() ? 0.6 : 1,
                }}
              >
                {isDeploying ? 'İletiliyor...' : 'Deploy Et'}
              </button>
            </div>
          </div>

          {/* Netlify Build Hook */}
          <div style={{ border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <RemixIcon name="cloud-line" size={16} />
              <strong style={{ fontSize: '13px' }}>Netlify Build Hook</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #6b7280)', margin: '0 0 10px' }}>
              Netlify <em>Build & deploy &gt; Continuous deployment &gt; Build hooks</em> URL adresi:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                placeholder="https://api.netlify.com/build_hooks/..."
                value={netlifyUrl}
                onChange={(e) => handleSaveNetlify(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border, #d1d5db)',
                  background: 'var(--bg-input, #ffffff)',
                  color: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => handleDeploy('netlify')}
                disabled={isDeploying || !netlifyUrl.trim()}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: '#00ad9f',
                  color: '#ffffff',
                  cursor: isDeploying ? 'not-allowed' : 'pointer',
                  opacity: isDeploying || !netlifyUrl.trim() ? 0.6 : 1,
                }}
              >
                {isDeploying ? 'İletiliyor...' : 'Deploy Et'}
              </button>
            </div>
          </div>

          {/* Download Zip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: '8px',
            padding: '14px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RemixIcon name="file-zip-line" size={16} />
                <strong style={{ fontSize: '13px' }}>Kaynak Kodları İndir (ZIP)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #6b7280)', margin: '4px 0 0' }}>
                Tüm HTML, CSS, React ve tasarım varlıklarını temiz bir arşiv olarak indirin.
              </p>
            </div>
            <a
              href={getProjectExportUrl(projectId)}
              download={`${projectName || 'project'}.zip`}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--border, #d1d5db)',
                background: 'var(--bg-subtle, #f3f4f6)',
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RemixIcon name="download-line" size={14} />
              İndir
            </a>
          </div>

          {/* Result Alert */}
          {result && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              background: result.ok ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: result.ok ? '#16a34a' : '#dc2626',
              border: `1px solid ${result.ok ? '#86efac' : '#fca5a5'}`,
            }}>
              <strong>{result.ok ? '✅ Başarılı' : '❌ Hata'}:</strong> {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
