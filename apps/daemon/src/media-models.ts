// Daemon-side mirror of src/media/models.ts. The two files are kept in sync by hand — any model added to
// src/media/models.ts must be added here too. Drift is enforced by
// `node scripts/verify-media-models.mjs` (also exposed as
// `npm run verify:media-models`); CI should call it before publish so
// the moment one side adds a model and the other doesn't, the build
// fails with a precise diff.

export type MediaSurface = 'image' | 'video' | 'audio';
export type AudioKind = 'music' | 'speech' | 'sfx';

export type MediaProvider = {
  id: string;
  label: string;
  hint: string;
  integrated: boolean;
  defaultBaseUrl?: string;
  credentialsRequired?: boolean;
  settingsVisible?: boolean;
  supportsCustomModel?: boolean;
};

export type MediaModel = {
  id: string;
  label: string;
  hint: string;
  provider: string;
  caps: string[];
  default?: boolean;
};

export const MEDIA_PROVIDERS: MediaProvider[] = [
  { id: 'openai', label: 'OpenAI', hint: 'gpt-image-2 / dall-e-3', integrated: true, defaultBaseUrl: 'https://api.openai.com/v1' },
  { id: 'volcengine', label: 'Volcengine Ark (Doubao)', hint: 'Seedance 2.0 / Seedream', integrated: true, defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3' },
  { id: 'grok', label: 'xAI Grok Imagine', hint: 'grok-imagine — image + video with native audio', integrated: true, defaultBaseUrl: 'https://api.x.ai/v1' },
  { id: 'hyperframes', label: 'HyperFrames', hint: 'Local HTML -> MP4 renderer', integrated: true, credentialsRequired: false, settingsVisible: false },
  { id: 'nanobanana', label: 'Nano Banana', hint: 'Google official by default; custom gateway configurable', integrated: true, defaultBaseUrl: 'https://generativelanguage.googleapis.com', supportsCustomModel: true },
  { id: 'bfl', label: 'Black Forest Labs', hint: 'FLUX 1.1 Pro / FLUX Pro / Dev', integrated: false, defaultBaseUrl: 'https://api.bfl.ai' },
  { id: 'fal', label: 'Fal.ai', hint: 'Sora / Seedance / Veo / FLUX', integrated: false, defaultBaseUrl: 'https://fal.run' },
  { id: 'replicate', label: 'Replicate', hint: 'FLUX / SDXL / Ideogram', integrated: false, defaultBaseUrl: 'https://api.replicate.com/v1' },
  { id: 'google', label: 'Google AI / Vertex', hint: 'Imagen 4 / Veo 3 / Lyria', integrated: false },
  { id: 'kling', label: 'Kuaishou Kling', hint: 'Kling 1.6 / 2.0 video', integrated: false },
  { id: 'midjourney', label: 'Midjourney (proxy)', hint: 'midjourney-v7', integrated: false },
  { id: 'minimax', label: 'MiniMax', hint: 'TTS / video-01', integrated: true, defaultBaseUrl: 'https://api.minimaxi.chat/v1' },
  { id: 'suno', label: 'Suno', hint: 'Music generation', integrated: false },
  { id: 'udio', label: 'Udio', hint: 'Music generation', integrated: false },
  { id: 'elevenlabs', label: 'ElevenLabs', hint: 'Voice / SFX', integrated: false },
  { id: 'fishaudio', label: 'FishAudio', hint: 'Speech / voice clone', integrated: true, defaultBaseUrl: 'https://api.fish.audio' },
  { id: 'tavily', label: 'Tavily Search', hint: 'Agent-callable web research', integrated: true, defaultBaseUrl: 'https://api.tavily.com' },
  { id: 'zhipu', label: 'Zhipu GLM', hint: 'GLM-5.2 chat · CogView-4 image · CogVideoX video', integrated: false, defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4', supportsCustomModel: true },
  { id: 'qwen', label: 'Alibaba Qwen (DashScope)', hint: 'Qwen3-Max / Qwen-Image / Wan2.5 video', integrated: false, defaultBaseUrl: 'https://dashscope.aliyuncs.com/api/v1', supportsCustomModel: true },
  { id: 'wan', label: 'Alibaba Wan', hint: 'Wan2.5-T2V / Wan2.5-I2V — text + image to video', integrated: false, defaultBaseUrl: 'https://dashscope.aliyuncs.com/api/v1' },
  { id: 'sensetime', label: 'SenseTime SenseChat', hint: 'SenseChat-5 / SenseChat-Vision / SenseTime image', integrated: false, defaultBaseUrl: 'https://api.sensenova.cn/compatible-mode/v1' },
  { id: 'openrouter', label: 'OpenRouter', hint: 'Any model via openrouter.ai (Claude, GPT, Gemini, GLM, Qwen…)', integrated: false, defaultBaseUrl: 'https://openrouter.ai/api/v1', supportsCustomModel: true },
  { id: 'stub', label: 'Stub (placeholder)', hint: 'Deterministic local placeholder bytes', integrated: true },
];

export const IMAGE_MODELS: MediaModel[] = [
  { id: 'gpt-image-2', label: 'gpt-image-2', hint: 'OpenAI · 4K, native multimodal', provider: 'openai', caps: ['t2i', 'i2i', 'inpaint'], default: true },
  { id: 'gpt-image-1.5', label: 'gpt-image-1.5', hint: 'OpenAI · 4× faster than gpt-image-1', provider: 'openai', caps: ['t2i', 'i2i', 'inpaint'] },
  { id: 'gpt-image-1', label: 'gpt-image-1', hint: 'OpenAI · ChatGPT native', provider: 'openai', caps: ['t2i', 'i2i', 'inpaint'] },
  { id: 'gpt-image-1-mini', label: 'gpt-image-1-mini', hint: 'OpenAI · low-cost variant', provider: 'openai', caps: ['t2i', 'i2i'] },
  { id: 'dall-e-3', label: 'dall-e-3', hint: 'OpenAI · classic', provider: 'openai', caps: ['t2i'] },
  { id: 'dall-e-2', label: 'dall-e-2', hint: 'OpenAI · legacy', provider: 'openai', caps: ['t2i'] },

  { id: 'doubao-seedream-3-0-t2i-250415', label: 'seedream-3.0', hint: 'ByteDance · Doubao image', provider: 'volcengine', caps: ['t2i'] },
  { id: 'doubao-seededit-3-0-i2i-250628', label: 'seededit-3.0', hint: 'ByteDance · image edit', provider: 'volcengine', caps: ['i2i'] },

  { id: 'grok-imagine-image', label: 'grok-imagine-image', hint: 'xAI · 2K text-to-image', provider: 'grok', caps: ['t2i'] },

  { id: 'gemini-3.1-flash-image-preview', label: 'nano-banana-2', hint: 'Nano Banana · text-to-image', provider: 'nanobanana', caps: ['t2i'] },

  { id: 'flux-1.1-pro', label: 'flux-1.1-pro', hint: 'BFL · flagship', provider: 'bfl', caps: ['t2i', 'i2i'] },
  { id: 'flux-pro', label: 'flux-pro', hint: 'BFL', provider: 'bfl', caps: ['t2i'] },
  { id: 'flux-dev', label: 'flux-dev', hint: 'BFL · open weights', provider: 'bfl', caps: ['t2i'] },
  { id: 'flux-schnell', label: 'flux-schnell', hint: 'BFL · fast', provider: 'bfl', caps: ['t2i'] },
  { id: 'flux-kontext-pro', label: 'flux-kontext-pro', hint: 'BFL · in-context edits', provider: 'bfl', caps: ['t2i', 'i2i'] },

  { id: 'imagen-4', label: 'imagen-4', hint: 'Google · latest', provider: 'google', caps: ['t2i'] },
  { id: 'imagen-3', label: 'imagen-3', hint: 'Google', provider: 'google', caps: ['t2i'] },
  { id: 'gemini-3-pro-image-preview', label: 'gemini-3-pro-image', hint: 'Google · Nano Banana Pro', provider: 'google', caps: ['t2i', 'i2i'] },

  { id: 'ideogram-v2', label: 'ideogram-v2', hint: 'Replicate · typography', provider: 'replicate', caps: ['t2i'] },
  { id: 'sdxl', label: 'stable-diffusion-xl', hint: 'Replicate · SDXL', provider: 'replicate', caps: ['t2i'] },
  { id: 'sd-3.5', label: 'stable-diffusion-3.5', hint: 'Fal · SD 3.5', provider: 'fal', caps: ['t2i'] },

  { id: 'midjourney-v7', label: 'midjourney-v7', hint: 'Midjourney · via proxy', provider: 'midjourney', caps: ['t2i'] },

  { id: 'cogview-4', label: 'cogview-4', hint: 'Zhipu · 4K text-to-image', provider: 'zhipu', caps: ['t2i'] },
  { id: 'cogview-3-plus', label: 'cogview-3-plus', hint: 'Zhipu · flagship', provider: 'zhipu', caps: ['t2i', 'i2i'] },
  { id: 'glm-image', label: 'glm-image', hint: 'Zhipu · GLM-Image (multimodal gen)', provider: 'zhipu', caps: ['t2i', 'i2i'] },

  { id: 'qwen-image-plus', label: 'qwen-image-plus', hint: 'Alibaba · Qwen-Image flagship', provider: 'qwen', caps: ['t2i', 'i2i'] },
  { id: 'qwen-image', label: 'qwen-image', hint: 'Alibaba · Qwen-Image', provider: 'qwen', caps: ['t2i', 'i2i'] },
  { id: 'wan2.5-t2i', label: 'wan2.5-t2i', hint: 'Alibaba · Wan2.5 text-to-image', provider: 'wan', caps: ['t2i'] },

  { id: 'sensemirage-v6', label: 'sensemirage-v6', hint: 'SenseTime · flagship', provider: 'sensetime', caps: ['t2i'] },
  { id: 'sensechat-vision', label: 'sensechat-vision', hint: 'SenseTime · multimodal vision', provider: 'sensetime', caps: ['i2i'] },
];

export const VIDEO_MODELS: MediaModel[] = [
  { id: 'doubao-seedance-2-0-260128', label: 'seedance-2.0', hint: 'ByteDance · t2v + i2v + audio', provider: 'volcengine', caps: ['t2v', 'i2v', 'audio'], default: true },
  { id: 'doubao-seedance-2-0-fast-260128', label: 'seedance-2.0-fast', hint: 'ByteDance · faster, cheaper', provider: 'volcengine', caps: ['t2v', 'i2v', 'audio'] },
  { id: 'doubao-seedance-1-0-pro-250528', label: 'seedance-1.0-pro', hint: 'ByteDance · 1.0', provider: 'volcengine', caps: ['t2v', 'i2v'] },
  { id: 'doubao-seedance-1-0-lite-i2v-250428', label: 'seedance-1.0-lite-i2v', hint: 'ByteDance · image-to-video', provider: 'volcengine', caps: ['i2v'] },
  { id: 'doubao-seedance-1-0-lite-t2v-250428', label: 'seedance-1.0-lite-t2v', hint: 'ByteDance · text-to-video', provider: 'volcengine', caps: ['t2v'] },

  { id: 'grok-imagine-video', label: 'grok-imagine-video', hint: 'xAI · 720p t2v + i2v + native audio', provider: 'grok', caps: ['t2v', 'i2v', 'audio'] },

  { id: 'kling-2.0', label: 'kling-2.0', hint: 'Kuaishou · latest', provider: 'kling', caps: ['t2v', 'i2v'] },
  { id: 'kling-1.6', label: 'kling-1.6', hint: 'Kuaishou', provider: 'kling', caps: ['t2v', 'i2v'] },
  { id: 'kling-1.5', label: 'kling-1.5', hint: 'Kuaishou', provider: 'kling', caps: ['t2v', 'i2v'] },

  { id: 'veo-3', label: 'veo-3', hint: 'Google · sound-on', provider: 'google', caps: ['t2v', 'audio'] },
  { id: 'veo-2', label: 'veo-2', hint: 'Google', provider: 'google', caps: ['t2v'] },

  { id: 'sora-2', label: 'sora-2', hint: 'OpenAI · via Fal', provider: 'fal', caps: ['t2v'] },
  { id: 'sora-2-pro', label: 'sora-2-pro', hint: 'OpenAI · via Fal', provider: 'fal', caps: ['t2v'] },

  { id: 'wan2.5-t2v', label: 'wan2.5-t2v', hint: 'Alibaba · Wan 2.5 text-to-video', provider: 'wan', caps: ['t2v', 'audio'], default: true },
  { id: 'wan2.5-i2v', label: 'wan2.5-i2v', hint: 'Alibaba · Wan 2.5 image-to-video', provider: 'wan', caps: ['i2v', 'audio'] },
  { id: 'wan2.2-t2v', label: 'wan2.2-t2v', hint: 'Alibaba · Wan 2.2 text-to-video', provider: 'wan', caps: ['t2v'] },
  { id: 'wan2.2-i2v', label: 'wan2.2-i2v', hint: 'Alibaba · Wan 2.2 image-to-video', provider: 'wan', caps: ['i2v'] },

  { id: 'cogvideox-5b', label: 'cogvideox-5b', hint: 'Zhipu · CogVideoX 5B', provider: 'zhipu', caps: ['t2v', 'i2v'] },
  { id: 'cogvideox-3', label: 'cogvideox-3', hint: 'Zhipu · CogVideoX 3', provider: 'zhipu', caps: ['t2v', 'i2v'] },

  { id: 'fal-kling-2.5', label: 'kling-2.5', hint: 'Fal · Kling 2.5 Turbo', provider: 'fal', caps: ['t2v', 'i2v'] },
  { id: 'fal-veo-3.5', label: 'veo-3.5', hint: 'Fal · Veo 3.5', provider: 'fal', caps: ['t2v', 'i2v', 'audio'] },
  { id: 'fal-hailuo-02', label: 'hailuo-02', hint: 'Fal · MiniMax Hailuo-02', provider: 'fal', caps: ['t2v'] },
  { id: 'fal-wan-25', label: 'wan-2.5', hint: 'Fal · Wan 2.5 (open-source)', provider: 'fal', caps: ['t2v'] },

  { id: 'minimax-video-01', label: 'video-01', hint: 'MiniMax · Hailuo', provider: 'minimax', caps: ['t2v', 'i2v'] },
  { id: 'hyperframes-html', label: 'hyperframes-html', hint: 'HyperFrames · local HTML renderer', provider: 'hyperframes', caps: ['t2v'] },
];

export const AUDIO_MODELS_BY_KIND: Record<AudioKind, MediaModel[]> = {
  music: [
    { id: 'suno-v5', label: 'suno-v5', hint: 'Suno · default', provider: 'suno', caps: ['music'], default: true },
    { id: 'suno-v4-5', label: 'suno-v4.5', hint: 'Suno', provider: 'suno', caps: ['music'] },
    { id: 'udio-v2', label: 'udio-v2', hint: 'Udio', provider: 'udio', caps: ['music'] },
    { id: 'lyria-2', label: 'lyria-2', hint: 'Google', provider: 'google', caps: ['music'] },
  ],
  speech: [
    { id: 'gpt-4o-mini-tts', label: 'gpt-4o-mini-tts', hint: 'OpenAI · expressive TTS', provider: 'openai', caps: ['tts'] },
    { id: 'minimax-tts', label: 'minimax-tts', hint: 'MiniMax · default', provider: 'minimax', caps: ['tts'], default: true },
    { id: 'fish-speech-2', label: 'fish-speech-2', hint: 'FishAudio', provider: 'fishaudio', caps: ['tts', 'voice-clone'] },
    { id: 'elevenlabs-v3', label: 'elevenlabs-v3', hint: 'ElevenLabs', provider: 'elevenlabs', caps: ['tts', 'voice-clone'] },
    { id: 'doubao-tts', label: 'doubao-tts', hint: 'Volcengine · TTS', provider: 'volcengine', caps: ['tts'] },
  ],
  sfx: [
    { id: 'elevenlabs-sfx', label: 'elevenlabs-sfx', hint: 'ElevenLabs SFX', provider: 'elevenlabs', caps: ['sfx'], default: true },
    { id: 'audiocraft', label: 'audiocraft', hint: 'Meta · open', provider: 'replicate', caps: ['sfx', 'music'] },
  ],
};

export const MEDIA_ASPECTS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
export const VIDEO_LENGTHS_SEC = [3, 5, 8, 10, 15, 30];
export const AUDIO_DURATIONS_SEC = [5, 10, 15, 30, 60, 120];

export function findMediaModel(id: string): MediaModel | null {
  const all = [
    ...IMAGE_MODELS,
    ...VIDEO_MODELS,
    ...AUDIO_MODELS_BY_KIND.music,
    ...AUDIO_MODELS_BY_KIND.speech,
    ...AUDIO_MODELS_BY_KIND.sfx,
  ];
  return all.find((m) => m.id === id) || null;
}

export function findProvider(id: string): MediaProvider | null {
  return MEDIA_PROVIDERS.find((p) => p.id === id) || null;
}

export function modelsForSurface(surface: MediaSurface, audioKind?: AudioKind): MediaModel[] {
  if (surface === 'image') return IMAGE_MODELS;
  if (surface === 'video') return VIDEO_MODELS;
  if (surface === 'audio') {
    const k = audioKind || 'music';
    return AUDIO_MODELS_BY_KIND[k] || AUDIO_MODELS_BY_KIND.music;
  }
  return [];
}
