
export type AIProvider = 'openai' | 'claude';

export interface AIProviderConfig {
  provider: AIProvider;
  fallbackProvider?: AIProvider;
}

export interface ProviderCapabilities {
  vision: boolean;
  multiImage: boolean;
  maxTokens: number;
  supportedFormats: string[];
}

export const PROVIDER_CAPABILITIES: Record<AIProvider, ProviderCapabilities> = {
  openai: {
    vision: true,
    multiImage: true,
    maxTokens: 4000,
    supportedFormats: ['jpeg', 'png', 'gif', 'webp']
  },
  claude: {
    vision: true,
    multiImage: true,
    maxTokens: 3000,
    supportedFormats: ['jpeg', 'png', 'gif', 'webp']
  }
};
