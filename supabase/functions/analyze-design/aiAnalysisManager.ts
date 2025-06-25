import { analyzeWithAIProvider, determineOptimalProvider, AIProvider, AIProviderConfig } from './aiProviderRouter.ts';
import { AnnotationData } from './types.ts';

// RAG function for retrieving research context
async function getRAGContext(userPrompt: string) {
  try {
    console.log('🔍 Building RAG context for:', userPrompt.substring(0, 100));
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Missing Supabase credentials for RAG');
      return null;
    }
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple keyword extraction for UX terms
    const uxKeywords = ['button', 'form', 'mobile', 'accessibility', 'contrast', 'layout', 'navigation', 'conversion', 'checkout', 'signup', 'ux', 'usability'];
    const foundKeywords = uxKeywords.filter(keyword => 
      userPrompt.toLowerCase().includes(keyword)
    );
    
    console.log('🎯 Found keywords:', foundKeywords);
    
    // Simple database query - get relevant knowledge
    const { data: knowledge, error } = await supabase
      .from('knowledge_entries')
      .select('title, content, category')
      .in('category', ['ux-patterns', 'accessibility', 'conversion'])
      .limit(3);
    
    if (error) {
      console.log('⚠️ Knowledge retrieval error:', error);
      return null;
    }
    
    if (!knowledge || knowledge.length === 0) {
      console.log('⚠️ No knowledge entries found');
      return null;
    }
    
    console.log('✅ Retrieved', knowledge.length, 'knowledge entries');
    
    // Build research context
    const context = knowledge.map(k => 
      `${k.title}: ${k.content.substring(0, 150)}...`
    ).join('\n\n');
    
    return {
      context,
      knowledgeCount: knowledge.length,
      categories: [...new Set(knowledge.map(k => k.category))]
    };
    
  } catch (error) {
    console.log('⚠️ RAG context failed:', error);
    return null;
  }
}

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
  
  // *** RAG ENHANCEMENT ***
  console.log('🔍 Starting RAG enhancement...');
  const ragContext = await getRAGContext(enhancedPrompt);
  
  // Enhance prompt with RAG context if available
  let finalPrompt = enhancedPrompt;
  if (ragContext) {
    finalPrompt = `${enhancedPrompt}

Research Context:
${ragContext.context}

Use this research to inform your analysis. Include relevant citations and research-backed recommendations. Return the same JSON format as requested.`;
    
    console.log('✅ RAG enhanced prompt with', ragContext.knowledgeCount, 'knowledge sources');
    console.log('📚 Categories included:', ragContext.categories);
  } else {
    console.log('⚪ Using basic prompt (no RAG context available)');
  }
  // *** END RAG ENHANCEMENT ***
  
  // Determine AI provider configuration
  let providerConfig: AIProviderConfig;
  if (requestedProvider && (requestedProvider === 'openai' || requestedProvider === 'claude')) {
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
      finalPrompt,  // *** CHANGED: Use finalPrompt instead of enhancedPrompt ***
      providerConfig
    );
    
    const annotations = await Promise.race([aiPromise, aiTimeoutPromise]);
    
    console.log('AI analysis completed:', {
      annotationCount: annotations.length,
      hasAnnotations: annotations.length > 0,
      usedProvider: providerConfig.provider,
      usedModel: providerConfig.model || 'default',
      ragEnhanced: !!ragContext  // *** NEW: Track if RAG was used ***
    });

    return annotations;
  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    throw new Error(`AI analysis failed: ${aiError.message}`);
  }
}