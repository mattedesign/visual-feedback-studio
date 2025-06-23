
import { analyzeWithOpenAI } from './openaiClient.ts';
import { analyzeWithClaude } from './claudeClient.ts';
import { AnnotationData } from './types.ts';

export type AIProvider = 'openai' | 'claude';

export interface AIProviderConfig {
  provider: AIProvider;
  model?: string;
  fallbackProvider?: AIProvider;
}

export async function analyzeWithAIProvider(
  base64Image: string,
  mimeType: string,
  prompt: string,
  config: AIProviderConfig
): Promise<AnnotationData[]> {
  console.log('=== AI Provider Router Started ===');
  console.log('Primary provider:', config.provider);
  console.log('Requested model:', config.model);
  console.log('Fallback provider:', config.fallbackProvider || 'none');

  try {
    // Try primary provider with requested model
    const result = await callProvider(config.provider, base64Image, mimeType, prompt, config.model);
    console.log(`Primary provider ${config.provider} succeeded${config.model ? ` with model ${config.model}` : ''}`);
    return result;
  } catch (primaryError) {
    console.error(`Primary provider ${config.provider} failed:`, primaryError.message);
    
    // Try fallback provider if available
    if (config.fallbackProvider && config.fallbackProvider !== config.provider) {
      console.log(`Attempting fallback to ${config.fallbackProvider}...`);
      try {
        const fallbackResult = await callProvider(config.fallbackProvider, base64Image, mimeType, prompt);
        console.log(`Fallback provider ${config.fallbackProvider} succeeded`);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`Fallback provider ${config.fallbackProvider} failed:`, fallbackError.message);
        throw new Error(`Both providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
      }
    }
    
    // No fallback available, throw original error
    throw primaryError;
  }
}

async function callProvider(
  provider: AIProvider,
  base64Image: string,
  mimeType: string,
  prompt: string,
  model?: string
): Promise<AnnotationData[]> {
  switch (provider) {
    case 'openai':
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      return await analyzeWithOpenAI(base64Image, mimeType, prompt, openaiApiKey, model);
      
    case 'claude':
      const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!claudeApiKey) {
        throw new Error('Claude API key not configured');
      }
      return await analyzeWithClaude(base64Image, mimeType, prompt, claudeApiKey, model);
      
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export function determineOptimalProvider(): AIProviderConfig {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  console.log('Available providers:', {
    openai: !!openaiKey,
    claude: !!claudeKey
  });
  
  // Default to OpenAI with Claude fallback if both are available
  if (openaiKey && claudeKey) {
    return {
      provider: 'openai',
      fallbackProvider: 'claude'
    };
  }
  
  // Use whichever is available
  if (openaiKey) {
    return { provider: 'openai' };
  }
  
  if (claudeKey) {
    return { provider: 'claude' };
  }
  
  throw new Error('No AI provider API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
}
