import React, { useEffect, useState, useCallback } from 'react';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  provider: 'google';
  loggedInAt: number;
}

interface GoogleSignInButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'icon-only';
  onAuthChange?: (user: GoogleUser | null) => void;
}

export function GoogleSignInButton({
  className = '',
  variant = 'full',
  onAuthChange,
}: GoogleSignInButtonProps) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        onAuthChange?.(data.user || null);
      }
    } catch {
      // Ignored: daemon might be offline during dev
    } finally {
      setLoading(false);
    }
  }, [onAuthChange]);

  const checkConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/status');
      if (res.ok) {
        const data = await res.json();
        setConfigured(Boolean(data.configured));
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchSession();
    checkConfig();

    // Listen for broadcast message from OAuth popup
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('open-design-google-oauth');
      bc.onmessage = (event) => {
        if (event.data?.type === 'google-oauth' && event.data.ok) {
          fetchSession();
        }
      };
    }

    // Also listen to postMessage fallback
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-oauth' && event.data.ok) {
        fetchSession();
      }
    };
    window.addEventListener('message', handlePostMessage);

    return () => {
      bc?.close();
      window.removeEventListener('message', handlePostMessage);
    };
  }, [fetchSession, checkConfig]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (!data.configured || !data.authorizeUrl) {
        setShowConfigModal(true);
        setLoading(false);
        return;
      }

      // Open centered popup window
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.authorizeUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`,
      );

      if (!popup) {
        // Popup blocked fallback
        window.location.href = data.authorizeUrl;
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/google/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      onAuthChange?.(null);
    } catch (err) {
      console.error('Google Sign Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className={`google-auth-btn-loading ${className}`} style={{ opacity: 0.6, fontSize: '13px' }}>
        <span>Kontrol ediliyor...</span>
      </div>
    );
  }

  // Authenticated State
  if (user) {
    return (
      <div className={`google-auth-user-container ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-subtle, rgba(255,255,255,0.06))',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '999px',
            padding: '4px 10px 4px 4px',
            cursor: 'pointer',
            color: 'inherit',
            fontSize: '13px',
            transition: 'all 0.15s ease',
          }}
          title={user.email}
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#4285F4',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {variant !== 'icon-only' && (
            <span style={{ fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name.split(' ')[0]}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: '220px',
              background: 'var(--bg-surface, #1e2128)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              padding: '12px',
              zIndex: 1000,
              color: 'var(--text-primary, #f0f0f0)',
            }}
          >
            <div style={{ marginBottom: '10px', borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', paddingBottom: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{user.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34A853', marginTop: '4px' }}>
                <span>●</span> Google ile Bağlandı
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated State
  return (
    <>
      <button
        type="button"
        onClick={handleSignIn}
        className={`google-sign-in-btn ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface, #ffffff)',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '6px',
          padding: variant === 'compact' ? '6px 12px' : '8px 16px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          transition: 'all 0.15s ease',
        }}
        title="Google ile Giriş Yap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        {variant !== 'icon-only' && <span>Google ile Giriş Yap</span>}
      </button>

      {/* Configuration modal when Google OAuth is not configured */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface, #1e2128)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '460px',
              width: '90%',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              color: 'var(--text-primary, #f0f0f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Google OAuth Yapılandırması Gerekli
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', opacity: 0.85, margin: '0 0 16px' }}>
              Google ile oturum açabilmek için projenin <code>.env</code> dosyasına Google Client ID ve Secret bilgilerini eklemeniz gerekmektedir.
            </p>
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                overflowX: 'auto',
              }}
            >
              <div>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
              <div>GOOGLE_CLIENT_SECRET=your_client_secret</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{
                  background: 'var(--accent-color, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
