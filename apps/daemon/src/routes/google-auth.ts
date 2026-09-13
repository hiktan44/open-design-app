import type { Express, Request, Response } from 'express';
import {
  beginGoogleAuth,
  clearGoogleSession,
  completeGoogleAuth,
  loadGoogleSession,
  resolveGoogleCredentials,
  saveGoogleSession,
} from '../auth/google-oauth.js';
import { renderGoogleOAuthResultPage } from '../http/google-oauth-result-page.js';

export interface RegisterGoogleAuthRoutesDeps {
  dataDir: string;
}

export function registerGoogleAuthRoutes(app: Express, deps: RegisterGoogleAuthRoutesDeps) {
  const { dataDir } = deps;

  // GET /api/auth/google/status
  // Checks if Google OAuth is configured via environment variables
  app.get('/api/auth/google/status', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const { clientId, clientSecret } = resolveGoogleCredentials();
    const configured = Boolean(clientId && clientSecret);
    const maskedClientId = clientId
      ? clientId.length > 12
        ? `${clientId.slice(0, 8)}...${clientId.slice(-6)}`
        : clientId
      : null;

    res.json({
      configured,
      clientId: maskedClientId,
    });
  });

  // GET /api/auth/google/url
  // Initiates Google OAuth flow with PKCE & CSRF state
  app.get('/api/auth/google/url', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const result = beginGoogleAuth(req);
      if (!result.configured) {
        return res.status(200).json({
          ok: false,
          configured: false,
          message: result.message ?? 'Google OAuth kimlik bilgileri yapılandırılmamış.',
        });
      }

      return res.json({
        ok: true,
        configured: true,
        authorizeUrl: result.authorizeUrl,
        state: result.state,
        redirectUri: result.redirectUri,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({
        ok: false,
        error: 'Google OAuth yetkilendirme URL oluşturulamadı',
        details: process.env.NODE_ENV === 'development' ? msg : undefined,
      });
    }
  });

  // GET /api/auth/google/callback
  // Handles Google's redirect back with authorization code and state
  app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const error = typeof req.query.error === 'string' ? req.query.error.trim() : '';

    if (error) {
      const html = renderGoogleOAuthResultPage({
        ok: false,
        message: `Google yetkilendirme hatası: ${error}`,
      });
      return res.status(400).send(html);
    }

    if (!code || !state) {
      const html = renderGoogleOAuthResultPage({
        ok: false,
        message: 'Eksik veya geçersiz OAuth kodu ve durum (state) parametresi.',
      });
      return res.status(400).send(html);
    }

    try {
      const outcome = await completeGoogleAuth({ code, state });
      if (!outcome.ok || !outcome.user) {
        const html = renderGoogleOAuthResultPage({
          ok: false,
          message: outcome.error || 'Kimlik doğrulama tamamlanamadı.',
        });
        return res.status(400).send(html);
      }

      await saveGoogleSession(dataDir, outcome.user);
      const html = renderGoogleOAuthResultPage({
        ok: true,
        user: outcome.user,
      });
      return res.status(200).send(html);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const html = renderGoogleOAuthResultPage({
        ok: false,
        message: `Yetkilendirme sırasında sunucu hatası oluştu: ${msg}`,
      });
      return res.status(500).send(html);
    }
  });

  // GET /api/auth/google/session
  // Returns the active Google user session
  app.get('/api/auth/google/session', async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const user = await loadGoogleSession(dataDir);
      return res.json({
        authenticated: Boolean(user),
        user: user ?? null,
      });
    } catch {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
  });

  // POST /api/auth/google/logout
  // Logs out and clears the Google session
  app.post('/api/auth/google/logout', async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      await clearGoogleSession(dataDir);
      return res.json({ ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ ok: false, error: msg });
    }
  });
}
