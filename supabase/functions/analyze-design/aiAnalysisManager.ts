
import { analyzeWithAIProvider, determineOptimalProvider, AIProvider, AIProviderConfig } from './aiProviderRouter.ts';
import { AnnotationData } from './types.ts';

export async function performAIAnalysis(
  base64Image: string,
  mimeType: string,
  enhancedPrompt: string,
  requestedProvider?: 'openai' | 'claude',
  requestedModel?: string
): Promise<AnnotationData[]> {
  console.log('=== AI Provider Analysis Phase ===');
  console.log('Requested provider:', requestedProvider);
  console.log('Requested model:', requestedModel);
  
  // Determine AI provider configuration
  let providerConfig: AIProviderConfig;
  if (requestedProvider && (requeste

dProvider === 'openai' || requestedProvider === 'claude')) {
    // Use explicitly requested provider
    providerConfig = { 
      provider: requestedProvider as AIProvider,
      model: requestedModel
    };
    console.log(`Using explicitly requested provider: ${requestedProvider}${requestedModel ? ` with model: ${requestedModel}` : ''}`);
  } else {
    // Auto-determine optimal provider
    providerConfig = determineOptimalProvider();
    if (requestedModel) {
      providerConfig.model = requestedModel;
    }
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
      usedProvider: providerConfig.provider,
      usedModel: providerConfig.model || 'default'
    });

    return annotations;
  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    throw new Error(`AI analysis failed: ${aiError.message}`);
  }
}
