
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
  
  // Validate and test API key
  const cleanApiKey = await validateAndTestApiKey(anthropicApiKey);

  // Validate base64 image data
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Invalid image data: base64 string is empty');
  }

  // Analyze with Claude models (with model selection support)
  return await analyzeWithClaudeModels(base64Image, mimeType, systemPrompt, cleanApiKey, requestedModel);
}
