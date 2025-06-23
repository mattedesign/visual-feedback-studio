
import { analyzeWithAIProvider, determineOptimalProvider, AIProvider, AIProviderConfig } from './aiProviderRouter.ts';
import { AnnotationData } from './types.ts';

export async function performAIAnalysis(
  base64Image: string,
  mimeType: string,
  enhancedPrompt: string,
  requestedProvider?: 'openai' | 'claude'
): Promise<AnnotationData[]> {
  console.log('=== AI Provider Analysis Phase ===');
  
  // Determine AI provider configuration
  let providerConfig: AIProviderConfig;
  if (requestedProvider && (requestedProvider === 'openai' || requestedProvider === 'claude')) {
    // Use explicitly requested provider
    providerConfig = { provider: requestedProvider as AIProvider };
    console.log(`Using explicitly requested provider: ${requestedProvider}`);
  } else {
    // Auto-determine optimal provider
    providerConfig = determineOptimalProvider();
    console.log(`Auto-determined provider config:`, providerConfig);
  }

  try {
    const aiTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI request timeout (120s)')), 120000);
    });
    
    const aiPromise = analyzeWithAIProvider(
      base64Image, 
      mimeType, 
      enhancedPrompt, 
      providerConfig
    );
    
    const annotations = await Promise.race([aiPromise, aiTimeoutPromise]);
    
    console.log('AI analysis completed:', {
      annotationCount: annotations.length,
      hasAnnotations: annotations.length > 0,
      usedProvider: providerConfig.provider
    });

    return annotations;
  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    throw new Error(`AI analysis failed: ${aiError.message}`);
  }
}
