import { DEFAULT_MODEL_OPTION } from './shared.js';
import type { RuntimeAgentDef } from '../types.js';

export const swarmAgentDef = {
  id: 'swarm',
  name: 'Multi-Agent Swarm (Designer + Coder + Critic)',
  bin: 'od',
  versionArgs: ['--version'],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: 'swarm-orchestrated', label: 'Full 3-Phase Swarm (Designer -> Coder -> Critic)' },
  ],
  buildArgs: (prompt, _imagePaths, _extra, _options = {}) => {
    return [
      'run',
      '--skill',
      'multi-agent-swarm',
      '--message',
      prompt,
    ];
  },
  maxPromptArgBytes: 80_000,
  streamFormat: 'plain',
} satisfies RuntimeAgentDef;
