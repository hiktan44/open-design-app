import type { GoogleUserProfile } from '../auth/google-oauth.js';

export interface GoogleOAuthResultPageOptions {
  ok: boolean;
  user?: GoogleUserProfile | null;
  message?: string | null;
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderGoogleOAuthResultPage(opts: GoogleOAuthResultPageOptions): string {
  const ok = Boolean(opts.ok);
  const title = ok ? 'Giriş Başarılı' : 'Giriş Başarısız';
  const heading = ok ? '✅ Google ile Giriş Yapıldı' : '⚠️ Giriş Başarısız';
  const body = ok
    ? `Hoş geldiniz, <strong>${escapeHtml(opts.user?.name || opts.user?.email || 'Kullanıcı')}</strong>! Bu pencereyi kapatıp OpenDesign'a dönebilirsiniz.`
    : escapeHtml(opts.message ?? 'Google ile kimlik doğrulama tamamlanamadı.');
  const accent = ok ? '#1a7f37' : '#cf222e';
  const payload = ok
    ? { type: 'google-oauth', ok: true, user: opts.user ?? null }
    : { type: 'google-oauth', ok: false, message: opts.message ?? null };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} — OpenDesign</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  html, body { height: 100%; margin: 0; }
  body {
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif;
    background: #f6f7f9; color: #1f2328; padding: 24px;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0d1117; color: #e6edf3; }
    .card { background: #161b22; border-color: #30363d; }
  }
  .card {
    max-width: 420px; width: 100%; padding: 28px 28px 22px; border-radius: 12px;
    background: white; border: 1px solid #d0d7de; box-shadow: 0 8px 24px rgba(0,0,0,.06);
    text-align: center;
  }
  h1 { margin: 0 0 12px; font-size: 18px; color: ${accent}; }
  p  { margin: 0 0 20px; font-size: 14px; line-height: 1.55; }
  .user-avatar { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px; display: block; border: 2px solid #e1e4e8; }
  button {
    appearance: none; border: 1px solid #d0d7de; background: white;
    border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 500; cursor: pointer;
  }
  button:hover { background: #f6f8fa; }
  @media (prefers-color-scheme: dark) {
    button { background: #21262d; border-color: #30363d; color: #e6edf3; }
    button:hover { background: #30363d; }
  }
</style>
</head>
<body>
  <div class="card">
    ${opts.user?.picture ? `<img class="user-avatar" src="${escapeHtml(opts.user.picture)}" alt="Avatar" />` : ''}
    <h1>${escapeHtml(heading)}</h1>
    <p>${body}</p>
    <button type="button" onclick="window.close()">Pencereyi Kapat</button>
  </div>
  <script>
    try {
      var payload = ${JSON.stringify(payload)};
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, '*');
      }
      if (window.BroadcastChannel) {
        var bc = new BroadcastChannel('open-design-google-oauth');
        bc.postMessage(payload);
        bc.close();
      }
      setTimeout(function() {
        window.close();
      }, 1500);
    } catch (e) { /* ignore postMessage failures */ }
  </script>
</body>
</html>`;
}
