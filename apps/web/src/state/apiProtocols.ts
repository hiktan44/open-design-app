// Shared metadata for the four API protocols the BYOK pickers offer.
//
// Originally these tables lived inline in `SettingsDialog.tsx`. The
// memory-extraction picker needs the exact same lists (so it can mirror
// the chat picker's protocol tabs / suggested-model dropdown / API key
// placeholders) — extracting them here keeps the two pickers from
// drifting apart whenever someone adds a new fast-pass model or a new
// quick-fill provider.
//
// The lists are intentionally hand-curated rather than auto-discovered:
// every option exposes `provider/model` strings the daemon already
// understands, so a new entry here implies a deliberate decision about
// support on the request side too.

import type { ApiProtocol } from '../types';

// Suggested fast-pass / common models per protocol — what the BYOK
// model dropdown lists by default. The first OpenAI-compatible block is
// duplicated under both `openai` and `azure` because azure's chat-
// completions endpoint speaks the same JSON shape; the deployment name
// the user types in the model field is what's variable, not the API.
export const SUGGESTED_MODELS_BY_PROTOCOL: Record<ApiProtocol, readonly string[]> = {
  anthropic: [
    'claude-opus-5',
    'claude-fable-5.1',
    'claude-fable-5',
    'claude-sonnet-5',
    'claude-haiku-5',
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-4-5',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-latest',
    'deepseek-v4.1-flash',
    'deepseek-v4-flash',
    'deepseek-v4-pro',
    'deepseek-r1',
    'deepseek-chat',
    'deepseek-reasoner',
    'minimax-m3',
    'MiniMax-M2.7-highspeed',
    'MiniMax-M2.7',
    'mimo-v2.5-pro',
  ],
  openai: [
    'gpt-5.6-sol',
    'gpt-5.6',
    'gpt-6-astra',
    'astra-6',
    'gpt-5.5',
    'gpt-5.4',
    'gpt-4.5-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'chatgpt-4o-latest',
    'o3',
    'o4-mini',
    'o3-mini',
    'o1',
    'deepseek-v4.1-flash',
    'deepseek-v4-flash',
    'deepseek-v4-pro',
    'deepseek-r1',
    'minimax-m3',
    'MiniMax-M2.7-highspeed',
    'mimo-v2.5-pro',
  ],
  azure: [
    'gpt-5.6-sol',
    'gpt-5.6',
    'gpt-6-astra',
    'astra-6',
    'gpt-5.5',
    'gpt-4.5-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'o3',
    'o1',
  ],
  google: [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ],
  senseaudio: [
    'senseaudio-s2',
    'senseaudio-s2-flash',
    'deepseek-v4.1-flash',
    'deepseek-v4-flash',
    'deepseek-v4-pro',
    'glm-5.3-flash',
    'glm-5.1',
    'minimax-m3',
    'MiniMax-M2.7-highspeed',
    'MiniMax-M2.7',
    'kimi-k2.6',
  ],
  aihubmix: [
    'gpt-5.6-sol',
    'gpt-6-astra',
    'gpt-5.5',
    'gpt-4.5-preview',
    'gpt-4o',
    'claude-opus-5',
    'claude-fable-5.1',
    'claude-sonnet-5',
    'claude-3-7-sonnet',
    'claude-sonnet-4-5',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-2.0-flash',
    'deepseek-v4.1-flash',
    'glm-5.3-flash',
    'minimax-m3',
    'deepseek-r1',
    'deepseek-chat',
  ],
  bedrock: [
    'anthropic.claude-opus-5',
    'anthropic.claude-fable-5.1',
    'anthropic.claude-3-7-sonnet-20250219-v1:0',
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
    'anthropic.claude-3-5-haiku-20241022-v1:0',
    'amazon.nova-pro-v1:0',
    'amazon.nova-lite-v1:0',
    'deepseek.r1-v1:0',
  ],
  ollama: [
    'deepseek-v4.1-flash',
    'glm-5.3-flash',
    'minimax-m3',
    'qwen3-coder:480b',
    'deepseek-v4-flash',
    'deepseek-v4-pro',
    'deepseek-v3.2',
    'deepseek-v3.1:671b',
    'glm-5.2',
    'glm-5.1',
    'glm-5',
    'kimi-k2.7-code',
    'kimi-k2.6',
    'kimi-k2.5',
    'minimax-m2.7',
    'qwen2.5-coder:32b',
    'deepseek-r1:70b',
    'llama3.3:70b',
    'devstral-2:123b',
    'gemini-3-flash-preview',
    'gemma4:31b',
    'gemma3:27b',
    'gemma3:4b',
    'gpt-oss:120b',
    'mistral-large-3:675b',
    'nemotron-3-ultra',
  ],
};

// "Fast / cheap" model recommendation for each protocol. Used by the
// memory extractor's auto-mode pill ("we'll quietly run gpt-4o-mini on
// your OpenAI key") and by anyone else who needs a one-pick default
// that prioritises latency + cost over reasoning depth.
export const FAST_MODEL_BY_PROTOCOL: Record<ApiProtocol, string> = {
  anthropic: 'claude-haiku-5',
  openai: 'gpt-4o-mini',
  azure: 'gpt-4o-mini',
  google: 'gemini-3.8-flash',
  ollama: 'gemma3:4b',
  senseaudio: 'senseaudio-s2-flash',
  aihubmix: 'gpt-4o-mini',
  bedrock: 'amazon.nova-lite-v1:0',
};

export const API_PROTOCOL_TABS: ReadonlyArray<{
  id: ApiProtocol;
  title: string;
}> = [
  { id: 'anthropic', title: 'Anthropic' },
  { id: 'openai', title: 'OpenAI' },
  { id: 'azure', title: 'Azure OpenAI' },
  { id: 'google', title: 'Google Gemini' },
  { id: 'ollama', title: 'Ollama Cloud' },
  { id: 'senseaudio', title: 'SenseAudio' },
  { id: 'aihubmix', title: 'AIHubMix' },
];

export const API_PROTOCOL_LABELS: Record<ApiProtocol, string> = {
  anthropic: 'Anthropic API',
  openai: 'OpenAI API',
  azure: 'Azure OpenAI',
  google: 'Google Gemini',
  ollama: 'Ollama Cloud API',
  senseaudio: 'SenseAudio API',
  aihubmix: 'AIHubMix API',
  bedrock: 'AWS Bedrock',
};

export const API_KEY_PLACEHOLDERS: Record<ApiProtocol, string> = {
  anthropic: 'sk-ant-...',
  openai: 'sk-...',
  azure: 'azure key',
  google: 'AIza... or AQ....',
  ollama: 'Ollama API key',
  senseaudio: 'SenseAudio API key',
  aihubmix: 'sk-...',
  bedrock: 'AWS credentials',
};

// Default base URL the daemon assumes when the user leaves the field
// blank. Kept here so the BYOK form can render it as a placeholder
// hint and keep the two surfaces (form vs. daemon) in sync.
export const DEFAULT_BASE_URL_BY_PROTOCOL: Record<ApiProtocol, string> = {
  anthropic: 'https://api.anthropic.com/v1',
  openai: 'https://api.openai.com/v1',
  azure: '',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  ollama: 'https://ollama.com',
  senseaudio: 'https://api.senseaudio.cn',
  aihubmix: 'https://aihubmix.com/v1',
  bedrock: 'https://bedrock-runtime.us-east-1.amazonaws.com',
};

// Fixed-origin gateways: managed single-endpoint providers where the user only
// supplies an API key — the Base URL is implied, so the Settings form hides the
// field. Centralised here (not in a component) so config loading, the Settings
// form, and the top-bar switcher all resolve the same origin. Add a protocol
// here when it's such a gateway.
export const FIXED_ORIGIN_GATEWAYS: ReadonlySet<ApiProtocol> = new Set<ApiProtocol>([
  'aihubmix',
]);

export function isFixedOriginGateway(protocol: ApiProtocol): boolean {
  return FIXED_ORIGIN_GATEWAYS.has(protocol);
}

// Resolve the effective base URL. Fixed-origin gateways always use their
// canonical origin: the field is hidden, so an empty stored value must not leak
// through and break URL-gated logic such as the live model-list fetch (which
// requires a valid base URL and otherwise silently shows only the static list).
// Idempotent for non-gateway protocols — returns their value unchanged.
export function resolveFixedOriginBaseUrl(
  protocol: ApiProtocol,
  baseUrl: string,
): string {
  return isFixedOriginGateway(protocol) ? DEFAULT_BASE_URL_BY_PROTOCOL[protocol] : baseUrl;
}
