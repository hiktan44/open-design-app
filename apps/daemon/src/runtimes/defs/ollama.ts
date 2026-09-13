import { DEFAULT_MODEL_OPTION } from './shared.js';
import type { RuntimeAgentDef } from '../types.js';

export const ollamaAgentDef = {
  id: 'ollama',
  name: 'Ollama (Local LLM)',
  bin: 'ollama',
  versionArgs: ['--version'],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: 'qwen2.5-coder:latest', label: 'Qwen 2.5 Coder (Recommended for UI)' },
    { id: 'deepseek-r1:latest', label: 'DeepSeek R1 (Local Reasoning)' },
    { id: 'llama3.3:latest', label: 'Llama 3.3 (Meta Flagship)' },
    { id: 'codellama:latest', label: 'CodeLlama' },
    { id: 'mistral:latest', label: 'Mistral 7B' },
  ],
  buildArgs: (prompt, _imagePaths, _extra, options = {}) => {
    const model = options.model && options.model !== 'default' ? options.model : 'qwen2.5-coder:latest';
    return ['run', model, prompt];
  },
  maxPromptArgBytes: 60_000,
  streamFormat: 'plain',
} satisfies RuntimeAgentDef;
