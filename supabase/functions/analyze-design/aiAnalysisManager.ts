import { analyzeWithAIProvider, determineOptimalProvider, AIProvider, AIProviderConfig } from './aiProviderRouter.ts';
import { AnnotationData } from './types.ts';

// Enhanced RAG function with comprehensive logging
async function getRAGContext(userPrompt: string) {
  try {
    console.log('🔍 Building RAG context for:', userPrompt.substring(0, 100));
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Missing Supabase credentials for RAG');
      return null;
    }
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created successfully');
    
    // Simple keyword extraction for UX terms
    const uxKeywords = ['button', 'form', 'mobile', 'accessibility', 'contrast', 'layout', 'navigation', 'conversion', 'checkout', 'signup', 'ux', 'usability'];
    const foundKeywords = uxKeywords.filter(keyword => 
      userPrompt.toLowerCase().includes(keyword)
    );
    
    console.log('🎯 Keyword analysis:', {
      totalKeywords: uxKeywords.length,
      foundKeywords: foundKeywords,
      foundCount: foundKeywords.length
    });
    
    // Simple database query - get relevant knowledge
    console.log('🔍 Attempting database query...');
    const { data: knowledge, error } = await supabase
      .from('knowledge_entries')
      .select('title, content, category')
      .in('category', ['ux-patterns', 'accessibility', 'conversion'])
      .limit(3);

    console.log('📊 Database query results:', {
      hasError: !!error,
      errorMessage: error?.message || null,
      errorDetails: error?.details || null,
      dataLength: knowledge?.length || 0,
      data: knowledge?.map(k => ({ 
        title: k.title?.substring(0, 50) + '...', 
        category: k.category,
        contentLength: k.content?.length || 0
      })) || []
    });

    if (error) {
      console.log('⚠️ Knowledge retrieval error:', error);
      return null;
    }
    
    if (!knowledge || knowledge.length === 0) {
      console.log('⚠️ No knowledge entries found - checking table directly');
      
      // Try a simpler query to test table access
      const { data: testData, error: testError } = await supabase
        .from('knowledge_entries')
        .select('id, title')
        .limit(1);
        
      console.log('🔍 Table access test:', {
        testError: testError?.message || null,
        testDataLength: testData?.length || 0
      });
      
      return null;
    }
    
    console.log('✅ Retrieved', knowledge.length, 'knowledge entries successfully');
    
    // Build research context
    const context = knowledge.map(k => 
      `${k.title}: ${k.content.substring(0, 150)}...`
    ).join('\n\n');
    
    const result = {
      context,
      knowledgeCount: knowledge.length,
      categories: [...new Set(knowledge.map(k => k.category))]
    };
    
    console.log('🎉 RAG context built successfully:', {
      contextLength: context.length,
      knowledgeCount: result.knowledgeCount,
      categories: result.categories
    });
    
    return result;
    
  } catch (error) {
    console.log('⚠️ RAG context failed with error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 200)
    });
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
  
  // *** ENHANCED RAG INTEGRATION ***
  console.log('🔍 Starting enhanced RAG process...');
  const ragContext = await getRAGContext(enhancedPrompt);
  
  // Enhance prompt with RAG context if available
  let finalPrompt = enhancedPrompt;
  if (ragContext) {
    finalPrompt = `${enhancedPrompt}

Research Context:
${ragContext.context}

Use this research to inform your analysis. Include relevant citations and research-backed recommendations. Return the same JSON format as requested.`;
    
    console.log('✅ RAG enhancement successful:', {
      knowledgeCount: ragContext.knowledgeCount,
      categories: ragContext.categories,
      originalPromptLength: enhancedPrompt.length,
      enhancedPromptLength: finalPrompt.length
    });
  } else {
    console.log('⚪ No RAG context available - using standard analysis');
  }
  // *** END RAG INTEGRATION ***
  
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
      finalPrompt,  // *** USING ENHANCED PROMPT ***
      providerConfig
    );
    
    const annotations = await Promise.race([aiPromise, aiTimeoutPromise]);
    
    console.log('AI analysis completed:', {
      annotationCount: annotations.length,
      hasAnnotations: annotations.length > 0,
      usedProvider: providerConfig.provider,
      usedModel: providerConfig.model || 'default',
      ragEnhanced: !!ragContext,  // *** TRACKING RAG USAGE ***
      promptUsed: ragContext ? 'enhanced' : 'standard'
    });

    return annotations;
  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    throw new Error(`AI analysis failed: ${aiError.message}`);
  }
}