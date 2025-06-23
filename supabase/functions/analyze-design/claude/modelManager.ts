
import { callClaudeApi } from './claudeApiClient.ts';
import { parseClaudeResponse } from './responseParser.ts';
import { AnnotationData } from '../types.ts';

const CLAUDE_MODELS = [
  'claude-3-haiku-20240307',     // Most basic model, should work with all keys
  'claude-3-sonnet-20240229',    // Fallback basic model
  'claude-3-5-haiku-20241022'    // Newer model as last resort
];

export async function analyzeWithClaudeModels(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string
): Promise<AnnotationData[]> {
  console.log('=== Claude Models Analysis ===');
  
  let lastError;
  
  for (const model of CLAUDE_MODELS) {
    try {
      console.log(`Attempting analysis with model: ${model}`);
      const aiResponse = await callClaudeApi(base64Image, mimeType, systemPrompt, apiKey, model);
      const result = parseClaudeResponse(aiResponse);
      console.log(`Analysis successful with model: ${model}`);
      return result;
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      lastError = error;
      
      // If it's an auth error, don't try other models
      if (error.message.includes('authentication') || 
          error.message.includes('Invalid bearer token') ||
          error.message.includes('401')) {
        throw error;
      }
      
      // Continue to next model for other errors
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Claude models failed');
}
