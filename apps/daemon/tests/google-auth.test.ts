import { describe, it, expect, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import {
  beginGoogleAuth,
  clearGoogleSession,
  completeGoogleAuth,
  deriveCodeChallenge,
  generateCodeVerifier,
  generateState,
  googlePendingAuth,
  loadGoogleSession,
  saveGoogleSession,
  type GoogleUserProfile,
} from '../src/auth/google-oauth.js';

describe('Google OAuth 2.0 PKCE and Security Controls', () => {
  describe('PKCE Primitives', () => {
    it('generates a URL-safe base64 code verifier with proper length', () => {
      const verifier = generateCodeVerifier();
      expect(typeof verifier).toBe('string');
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('derives consistent SHA-256 code challenge from verifier', () => {
      const verifier = 'test_verifier_string_1234567890_abcdefghijklmnopqrstuvwxyz';
      const challenge1 = deriveCodeChallenge(verifier);
      const challenge2 = deriveCodeChallenge(verifier);
      expect(challenge1).toBe(challenge2);
      expect(challenge1).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates cryptographically random state parameter', () => {
      const state1 = generateState();
      const state2 = generateState();
      expect(state1).not.toBe(state2);
      expect(state1.length).toBeGreaterThan(20);
    });
  });

  describe('Pending Auth State Cache (CSRF & Replay Protection)', () => {
    it('stores and retrieves state exactly once (one-time consumption)', () => {
      const state = 'test_state_' + Date.now();
      googlePendingAuth.put(state, {
        state,
        codeVerifier: 'verifier123',
        redirectUri: 'http://127.0.0.1:7456/api/auth/google/callback',
        createdAt: Date.now(),
      });

      const retrieved1 = googlePendingAuth.take(state);
      expect(retrieved1).not.toBeNull();
      expect(retrieved1?.codeVerifier).toBe('verifier123');

      // Second retrieval must fail (replay attack prevented)
      const retrieved2 = googlePendingAuth.take(state);
      expect(retrieved2).toBeNull();
    });

    it('rejects nonexistent state', () => {
      const missing = googlePendingAuth.take('nonexistent_state');
      expect(missing).toBeNull();
    });
  });

  describe('Authorization Flow Initialization (beginGoogleAuth)', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    it('returns configured=false when credentials are not present', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;

      const mockReq = {
        get: () => '127.0.0.1:7456',
        secure: false,
      } as any;

      const res = beginGoogleAuth(mockReq);
      expect(res.configured).toBe(false);
      expect(res.authorizeUrl).toBeUndefined();
    });

    it('returns valid Google authorize URL with PKCE parameters when configured', () => {
      process.env.GOOGLE_CLIENT_ID = 'mock_client_id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'mock_client_secret';

      const mockReq = {
        get: (header: string) => (header === 'host' ? '127.0.0.1:7456' : undefined),
        secure: false,
      } as any;

      const res = beginGoogleAuth(mockReq);
      expect(res.configured).toBe(true);
      expect(res.authorizeUrl).toBeDefined();

      const url = new URL(res.authorizeUrl!);
      expect(url.hostname).toBe('accounts.google.com');
      expect(url.searchParams.get('client_id')).toBe('mock_client_id.apps.googleusercontent.com');
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
      expect(url.searchParams.get('code_challenge')).toBeDefined();
      expect(url.searchParams.get('state')).toBe(res.state);
      expect(url.searchParams.get('scope')).toContain('openid');
      expect(url.searchParams.get('scope')).toContain('email');
    });
  });

  describe('Authorization Completion Validation (completeGoogleAuth)', () => {
    it('rejects missing code or state parameters', async () => {
      const res1 = await completeGoogleAuth({ code: '', state: 'state123' });
      expect(res1.ok).toBe(false);
      expect(res1.error).toContain('Invalid or missing');

      const res2 = await completeGoogleAuth({ code: 'code123', state: '' });
      expect(res2.ok).toBe(false);
    });

    it('rejects invalid or expired state token (CSRF protection)', async () => {
      const res = await completeGoogleAuth({ code: 'valid_code', state: 'invalid_or_expired_state' });
      expect(res.ok).toBe(false);
      expect(res.error).toContain('CSRF protection');
    });
  });

  describe('Session Storage Isolation (loadGoogleSession / saveGoogleSession / clearGoogleSession)', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await mkdtemp(path.join(os.tmpdir(), 'od-google-auth-test-'));
    });

    it('returns null when no session exists', async () => {
      const session = await loadGoogleSession(tmpDir);
      expect(session).toBeNull();
    });

    it('persists session securely and reloads user profile', async () => {
      const mockUser: GoogleUserProfile = {
        id: '123456789',
        email: 'developer@example.com',
        name: 'OpenDesign Developer',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
        provider: 'google',
        loggedInAt: Date.now(),
      };

      await saveGoogleSession(tmpDir, mockUser);
      const loaded = await loadGoogleSession(tmpDir);

      expect(loaded).not.toBeNull();
      expect(loaded?.email).toBe('developer@example.com');
      expect(loaded?.name).toBe('OpenDesign Developer');
      expect(loaded?.provider).toBe('google');

      // Clear session
      await clearGoogleSession(tmpDir);
      const afterClear = await loadGoogleSession(tmpDir);
      expect(afterClear).toBeNull();

      // Cleanup
      await rm(tmpDir, { recursive: true, force: true });
    });
  });
});
