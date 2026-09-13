/**
 * Deployment & Export utilities for Coolify, Netlify, and Local Zip download.
 */

export interface DeploymentResult {
  ok: boolean;
  message: string;
  timestamp: string;
}

/**
 * Triggers a deployment webhook for Coolify, Netlify, or custom CI/CD pipelines.
 */
export async function triggerDeployWebhook(webhookUrl: string): Promise<DeploymentResult> {
  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('Geçersiz webhook URL formatı (http:// veya https:// ile başlamalı)');
  }

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenDesign-Deployment/1.0',
      },
      body: JSON.stringify({
        event: 'opendesign_deploy_trigger',
        source: 'OpenDesign App',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Dağıtım isteği başarısız oldu (HTTP ${response.status}: ${response.statusText})`);
    }

    return {
      ok: true,
      message: 'Dağıtım tetiklendi! Sunucunuz derleme sürecini başlattı.',
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Dağıtım hatası: ${message}`,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

/**
 * Initiates zip export of project source files via daemon API.
 */
export function getProjectExportUrl(projectId: string): string {
  return `/api/projects/${encodeURIComponent(projectId)}/export`;
}
