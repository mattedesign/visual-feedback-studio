
export type AIProvider = 'openai' | 'claude' | 'google';

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
export type ClaudeModel = 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229';
export type GoogleModel = 'gemini-1.5-pro' | 'gemini-1.5-flash';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'excellent' | 'very-high' | 'high';
  recommended?: boolean;
}

export const OPENAI_MODELS: Record<OpenAIModel, ModelInfo> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable model for complex analysis',
    capabilities: ['Vision', 'Detailed Analysis', 'Code Generation'],
    speed: 'medium',
    quality: 'excellent',
    recommended: true
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and efficient for most analysis tasks',
    capabilities: ['Vision', 'Quick Analysis'],
    speed: 'fast',
    quality: 'very-high'
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Enhanced version with improved performance',
    capabilities: ['Vision', 'Analysis', 'Long Context'],
    speed: 'medium',
    quality: 'very-high'
  }
};

export const CLAUDE_MODELS: Record<ClaudeModel, ModelInfo> = {
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Best balance of intelligence and speed',
    capabilities: ['Vision', 'Reasoning', 'Analysis'],
    speed: 'medium',
    quality: 'excellent',
    recommended: true
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient for quick analysis',
    capabilities: ['Vision', 'Quick Analysis'],
    speed: 'fast',
    quality: 'high'
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Most powerful model for complex tasks',
    capabilities: ['Vision', 'Deep Analysis', 'Complex Reasoning'],
    speed: 'slow',
    quality: 'excellent'
  }
};

export const GOOGLE_MODELS: Record<GoogleModel, ModelInfo> = {
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced multimodal model with excellent vision capabilities',
    capabilities: ['Vision', 'Multimodal', 'Long Context', 'Detailed Analysis'],
    speed: 'medium',
    quality: 'excellent',
    recommended: true
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient multimodal model',
    capabilities: ['Vision', 'Quick Analysis', 'Multimodal'],
    speed: 'fast',
    quality: 'very-high'
  }
};
