
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
      // EXPLICIT OPENAI API KEY DEBUGGING
      console.log('🔍 EXPLICIT OPENAI API KEY DEBUGGING:');
      console.log('=====================================');
      
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      
      console.log(`1. Does OPENAI_API_KEY exist? ${openaiApiKey !== undefined ? 'YES' : 'NO'}`);
      console.log(`2. Is it null? ${openaiApiKey === null ? 'YES' : 'NO'}`);
      console.log(`3. Is it undefined? ${openaiApiKey === undefined ? 'YES' : 'NO'}`);
      console.log(`4. Is it empty string? ${openaiApiKey === '' ? 'YES' : 'NO'}`);
      console.log(`5. Type of value: ${typeof openaiApiKey}`);
      
      if (openaiApiKey) {
        console.log(`6. Length: ${openaiApiKey.length} characters`);
        console.log(`7. First 10 characters: "${openaiApiKey.substring(0, 10)}"`);
        console.log(`8. Last 10 characters: "...${openaiApiKey.substring(openaiApiKey.length - 10)}"`);
        console.log(`9. Contains whitespace? ${/\s/.test(openaiApiKey) ? 'YES' : 'NO'}`);
        console.log(`10. Starts with 'sk-'? ${openaiApiKey.startsWith('sk-') ? 'YES' : 'NO'}`);
        console.log(`11. JSON representation: ${JSON.stringify(openaiApiKey.substring(0, 20))}`);
      } else {
        console.log('6-11. Cannot analyze - key does not exist');
      }
      
      console.log('OpenAI environment check summary:', {
        keyExists: !!openaiApiKey,
        keyLength: openaiApiKey?.length || 0,
        keyPreview: openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : 'N/A',
        keyType: typeof openaiApiKey,
        isNull: openaiApiKey === null,
        isUndefined: openaiApiKey === undefined,
        isEmpty: openaiApiKey === ''
      });
      
      if (!openaiApiKey) {
        console.error('❌ OpenAI API key not configured - throwing error');
        throw new Error('OpenAI API key not configured in environment variables');
      }
      
      console.log('✅ OpenAI API key validated, calling analyzeWithOpenAI...');
      return await analyzeWithOpenAI(base64Image, mimeType, prompt, openaiApiKey, model);
      
    case 'claude':
      const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      console.log('Claude environment check:', {
        keyExists: !!claudeApiKey,
        keyLength: claudeApiKey?.length || 0,
        keyPreview: claudeApiKey ? `${claudeApiKey.substring(0, 15)}...` : 'N/A'
      });
      
      if (!claudeApiKey) {
        throw new Error('Claude API key not configured in environment variables');
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
    claude: !!claudeKey,
    openaiKeyLength: openaiKey?.length || 0,
    claudeKeyLength: claudeKey?.length || 0
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
