
export type AIProvider = 'openai' | 'claude';

export type OpenAIModel = 
  | 'gpt-4.1-2025-04-14'
  | 'o3-2025-04-16'
  | 'o4-mini-2025-04-16'
  | 'gpt-4.1-mini-2025-04-14';

export type ClaudeModel = 
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229';

export interface AIProviderConfig {
  provider: AIProvider;
  model?: OpenAIModel | ClaudeModel;
  fallbackProvider?: AIProvider;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  recommended?: boolean;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'very-high' | 'excellent';
}

export interface ProviderCapabilities {
  vision: boolean;
  multiImage: boolean;
  maxTokens: number;
  supportedFormats: string[];
  models: Record<string, ModelInfo>;
}

export const OPENAI_MODELS: Record<OpenAIModel, ModelInfo> = {
  'gpt-4.1-2025-04-14': {
    id: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1 (2025)',
    description: 'Flagship model with exceptional reasoning and vision capabilities',
    capabilities: ['Vision', 'Reasoning', 'Code Analysis'],
    recommended: true,
    speed: 'medium',
    quality: 'excellent'
  },
  'o3-2025-04-16': {
    id: 'o3-2025-04-16',
    name: 'O3 Reasoning',
    description: 'Advanced reasoning model for complex multi-step analysis',
    capabilities: ['Advanced Reasoning', 'Complex Analysis', 'Vision'],
    speed: 'slow',
    quality: 'excellent'
  },
  'o4-mini-2025-04-16': {
    id: 'o4-mini-2025-04-16',
    name: 'O4 Mini',
    description: 'Fast reasoning model optimized for coding and visual tasks',
    capabilities: ['Fast Reasoning', 'Vision', 'Code Analysis'],
    speed: 'fast',
    quality: 'high'
  },
  'gpt-4.1-mini-2025-04-14': {
    id: 'gpt-4.1-mini-2025-04-14',
    name: 'GPT-4.1 Mini',
    description: 'Efficient model with vision capabilities',
    capabilities: ['Vision', 'General Analysis'],
    speed: 'fast',
    quality: 'high'
  }
};

export const CLAUDE_MODELS: Record<ClaudeModel, ModelInfo> = {
  'claude-opus-4-20250514': {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    description: 'Most capable model with superior reasoning and analysis',
    capabilities: ['Superior Reasoning', 'Vision', 'Complex Analysis'],
    recommended: true,
    speed: 'slow',
    quality: 'excellent'
  },
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'High-performance model with exceptional reasoning and efficiency',
    capabilities: ['Advanced Reasoning', 'Vision', 'Efficient Processing'],
    recommended: true,
    speed: 'medium',
    quality: 'excellent'
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fastest model for quick responses and analysis',
    capabilities: ['Fast Processing', 'Vision', 'Quick Analysis'],
    speed: 'fast',
    quality: 'high'
  },
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Previous generation intelligent model',
    capabilities: ['Vision', 'Analysis', 'General Purpose'],
    speed: 'medium',
    quality: 'very-high'
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Powerful older model for comprehensive analysis',
    capabilities: ['Vision', 'Analysis', 'Comprehensive Review'],
    speed: 'slow',
    quality: 'very-high'
  }
};

export const PROVIDER_CAPABILITIES: Record<AIProvider, ProviderCapabilities> = {
  openai: {
    vision: true,
    multiImage: true,
    maxTokens: 4000,
    supportedFormats: ['jpeg', 'png', 'gif', 'webp'],
    models: OPENAI_MODELS as Record<string, ModelInfo>
  },
  claude: {
    vision: true,
    multiImage: true,
    maxTokens: 3000,
    supportedFormats: ['jpeg', 'png', 'gif', 'webp'],
    models: CLAUDE_MODELS as Record<string, ModelInfo>
  }
};
