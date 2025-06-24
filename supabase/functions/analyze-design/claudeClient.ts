
import { AnnotationData } from './types.ts';
import { validateAndTestApiKey } from './claude/apiKeyValidator.ts';
import { analyzeWithClaudeModels } from './claude/modelManager.ts';

export async function analyzeWithClaude(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  anthropicApiKey: string,
  requestedModel?: string
): Promise<AnnotationData[]> {
  console.log('=== Starting Enhanced Claude API Analysis ===');
  console.log('Requested Claude model:', requestedModel);
  console.log('API key exists:', !!anthropicApiKey);
  console.log('API key length:', anthropicApiKey?.length || 0);
  
  // Simplified API key validation
  let cleanApiKey: string;
  try {
    cleanApiKey = await validateAndTestApiKey(anthropicApiKey);
    console.log('API key validation successful');
  } catch (error) {
    console.error('API key validation failed:', error.message);
    throw new Error(`API key validation failed: ${error.message}`);
  }

  // Validate base64 image data
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Invalid image data: base64 string is empty');
  }

  console.log('Proceeding with Claude analysis...');
  
  // Analyze with Claude models (with model selection support)
  try {
    return await analyzeWithClaudeModels(base64Image, mimeType, systemPrompt, cleanApiKey, requestedModel);
  } catch (error) {
    console.error('Claude analysis error:', error);
    throw new Error(`Claude analysis failed: ${error.message}`);
  }
}
