// Google OAuth 2.0 + PKCE authentication engine.
//
// Follows RFC 7636 (PKCE) and RFC 6749 (OAuth 2.0) guidelines with
// state-based CSRF protection, secure random verifiers, and isolated
// token/session storage adhering to security-and-hardening rules.

import { chmod, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import type { Request } from 'express';

export const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';
export const GOOGLE_DEFAULT_SCOPES = ['openid', 'email', 'profile'];

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string | undefined;
  email_verified?: boolean | undefined;
  provider: 'google';
  loggedInAt: number;
}

export interface GoogleStoredSession {
  user: GoogleUserProfile;
  expiresAt?: number | undefined;
  savedAt: number;
}

export interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
}

export interface GoogleUserInfoResponse {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

interface PendingGoogleAuth {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
}

const VERIFIER_LEN = 64;
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function base64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function generateCodeVerifier(): string {
  return base64url(randomBytes(VERIFIER_LEN));
}

export function deriveCodeChallenge(verifier: string): string {
  return base64url(createHash('sha256').update(verifier).digest());
}

export function generateState(): string {
  return base64url(randomBytes(32));
}

/**
 * In-memory pending auth cache to validate state & exchange code.
 */
class GooglePendingAuthCache {
  private cache = new Map<string, PendingGoogleAuth>();

  put(state: string, entry: PendingGoogleAuth): void {
    this.cleanup();
    this.cache.set(state, entry);
  }

  take(state: string): PendingGoogleAuth | null {
    this.cleanup();
    const entry = this.cache.get(state);
    if (!entry) return null;
    this.cache.delete(state); // One-time use to prevent replay attacks
    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [state, entry] of this.cache.entries()) {
      if (now - entry.createdAt > STATE_TTL_MS) {
        this.cache.delete(state);
      }
    }
  }
}

export const googlePendingAuth = new GooglePendingAuthCache();

export function resolveGoogleCredentials(env = process.env): {
  clientId: string | null;
  clientSecret: string | null;
  redirectUriOverride: string | null;
} {
  const clientId = (env.GOOGLE_CLIENT_ID || '').trim() || null;
  const clientSecret = (env.GOOGLE_CLIENT_SECRET || '').trim() || null;
  const redirectUriOverride = (env.GOOGLE_REDIRECT_URI || '').trim() || null;
  return { clientId, clientSecret, redirectUriOverride };
}

export function buildGoogleRedirectUri(req: Request, redirectUriOverride?: string | null): string {
  if (redirectUriOverride) return redirectUriOverride;

  // Derive from request or OD_PUBLIC_BASE_URL
  const publicBase = (process.env.OD_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
  if (publicBase) {
    return `${publicBase}/api/auth/google/callback`;
  }

  const host = req.get('x-forwarded-host') || req.get('host') || '127.0.0.1';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}/api/auth/google/callback`;
}

export interface BeginGoogleAuthResult {
  configured: boolean;
  authorizeUrl?: string;
  state?: string;
  redirectUri?: string;
  message?: string;
}

export function beginGoogleAuth(req: Request): BeginGoogleAuthResult {
  const { clientId, clientSecret, redirectUriOverride } = resolveGoogleCredentials();
  if (!clientId || !clientSecret) {
    return {
      configured: false,
      message: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in .env',
    };
  }

  const redirectUri = buildGoogleRedirectUri(req, redirectUriOverride);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = deriveCodeChallenge(codeVerifier);
  const state = generateState();

  googlePendingAuth.put(state, {
    state,
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_DEFAULT_SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return {
    configured: true,
    authorizeUrl: `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`,
    state,
    redirectUri,
  };
}

export interface CompleteGoogleAuthInput {
  code: string;
  state: string;
  fetchImpl?: typeof fetch;
}

export interface CompleteGoogleAuthResult {
  ok: boolean;
  user?: GoogleUserProfile;
  error?: string;
}

export async function completeGoogleAuth(
  input: CompleteGoogleAuthInput,
): Promise<CompleteGoogleAuthResult> {
  const { code, state, fetchImpl = fetch } = input;

  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    return { ok: false, error: 'Invalid or missing authorization code or state' };
  }

  const pending = googlePendingAuth.take(state);
  if (!pending) {
    return { ok: false, error: 'OAuth state is invalid or has expired (CSRF protection)' };
  }

  const { clientId, clientSecret } = resolveGoogleCredentials();
  if (!clientId || !clientSecret) {
    return { ok: false, error: 'Server Google OAuth credentials not configured' };
  }

  // 1. Exchange code for access token via back-channel POST
  const tokenParams = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: pending.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: pending.codeVerifier,
  });

  let tokenRes: Response;
  try {
    tokenRes = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenParams.toString(),
    });
  } catch (err) {
    return { ok: false, error: `Failed to connect to Google token endpoint: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return { ok: false, error: `Google token exchange failed (${tokenRes.status}): ${text}` };
  }

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return { ok: false, error: 'Token response did not contain access_token' };
  }

  // 2. Fetch User Profile
  let userinfoRes: Response;
  try {
    userinfoRes = await fetchImpl(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    return { ok: false, error: `Failed to fetch Google userinfo: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!userinfoRes.ok) {
    return { ok: false, error: `Google userinfo request failed with status ${userinfoRes.status}` };
  }

  const userInfo = (await userinfoRes.json()) as GoogleUserInfoResponse;
  const user: GoogleUserProfile = {
    id: String(userInfo.sub || userInfo.id || ''),
    email: String(userInfo.email || ''),
    name: String(userInfo.name || userInfo.email || 'Google User'),
    picture: userInfo.picture ? String(userInfo.picture) : undefined,
    email_verified: Boolean(userInfo.email_verified),
    provider: 'google',
    loggedInAt: Date.now(),
  };

  if (!user.email) {
    return { ok: false, error: 'Google account did not return an email address' };
  }

  return { ok: true, user };
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Storage (Daemon data directory contract compliant)
// ─────────────────────────────────────────────────────────────────────────────

function sessionFilePath(dataDir: string): string {
  return path.join(dataDir, 'google-session.json');
}

export async function loadGoogleSession(dataDir: string): Promise<GoogleUserProfile | null> {
  try {
    const raw = await readFile(sessionFilePath(dataDir), 'utf-8');
    const parsed: GoogleStoredSession = JSON.parse(raw);
    if (parsed && parsed.user && typeof parsed.user.email === 'string') {
      return parsed.user;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'ENOENT') return null;
    return null;
  }
}

export async function saveGoogleSession(dataDir: string, user: GoogleUserProfile): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  const file = sessionFilePath(dataDir);
  const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`;
  const session: GoogleStoredSession = {
    user,
    savedAt: Date.now(),
  };

  await writeFile(tmp, JSON.stringify(session, null, 2), 'utf-8');
  try {
    await chmod(tmp, 0o600);
  } catch {
    // Best effort chmod on POSIX
  }
  await rename(tmp, file);
}

export async function clearGoogleSession(dataDir: string): Promise<void> {
  try {
    await unlink(sessionFilePath(dataDir));
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      throw err;
    }
  }
}
