
import { callClaudeApi } from './claudeApiClient.ts';
import { parseClaudeResponse } from './responseParser.ts';
import { AnnotationData } from '../types.ts';

// ✅ ENHANCED: Robust model selection with 401 error resilience
const CLAUDE_MODELS = [
  'claude-3-5-haiku-20241022',    // 🚀 PRIMARY: Most stable and fastest
  'claude-3-5-sonnet-20241022',   // 🚀 SECONDARY: Proven reliability
  'claude-3-opus-20240229',       // 🚀 TERTIARY: Established model
  'claude-sonnet-4-20250514',     // ⚠️ FALLBACK: Newer model (may have auth issues)
  'claude-opus-4-20250514'        // ⚠️ FALLBACK: Newest model (may have auth issues)
];

// ✅ ENHANCED: Prioritize stable models for auth reliability
const FALLBACK_ORDER = [
  'claude-3-5-haiku-20241022',    // 🚀 PREFERRED: Most stable for auth
  'claude-3-5-sonnet-20241022',   // 🚀 SECONDARY: Proven auth reliability
  'claude-3-opus-20240229',       // 🚀 TERTIARY: Established auth
  'claude-sonnet-4-20250514',     // ⚠️ NEWER: May have auth issues
  'claude-opus-4-20250514'        // ⚠️ NEWEST: May have auth issues
];

export async function analyzeWithClaudeModels(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  requestedModel?: string
): Promise<AnnotationData[]> {
  console.log('=== Claude Models Analysis ===');
  console.log('Requested model:', requestedModel);
  
  let modelsToTry: string[];
  
  if (requestedModel && CLAUDE_MODELS.includes(requestedModel)) {
    // Try requested model first, then fallbacks
    modelsToTry = [requestedModel, ...FALLBACK_ORDER.filter(m => m !== requestedModel)];
    console.log('Using requested model with fallbacks:', modelsToTry);
  } else {
    // Use default order with newest models first
    modelsToTry = CLAUDE_MODELS;
    console.log('Using default model priority:', modelsToTry);
  }
  
  let lastError;
  
  for (const model of modelsToTry) {
    try {
      console.log(`Attempting analysis with Claude model: ${model}`);
      const aiResponse = await callClaudeApi(base64Image, mimeType, systemPrompt, apiKey, model);
      const result = parseClaudeResponse(aiResponse);
      console.log(`Analysis successful with Claude model: ${model}`);
      return result;
    } catch (error) {
      console.error(`Claude model ${model} failed:`, error.message);
      lastError = error;
      
      // If it's an auth error, don't try other models
      if (error.message.includes('authentication') || 
          error.message.includes('Invalid bearer token') ||
          error.message.includes('401')) {
        throw error;
      }
      
      // If it's a model-specific error, continue to next model
      if (error.message.includes('model_not_found') ||
          error.message.includes('invalid_model') ||
          error.message.includes('model not available')) {
        console.log(`Model ${model} not available, trying next...`);
        continue;
      }
      
      // For other errors, continue to next model
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Claude models failed');
}
