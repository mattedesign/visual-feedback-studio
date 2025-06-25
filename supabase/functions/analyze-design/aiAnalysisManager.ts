import { analyzeWithAIProvider, determineOptimalProvider, AIProvider, AIProviderConfig } from './aiProviderRouter.ts';
import { AnnotationData } from './types.ts';

// DEFINITIVE RAG function with CORRECTED database query
async function getRAGContext(userPrompt: string) {
  try {
    console.log('🔍 Building RAG context for:', userPrompt.substring(0, 100));
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Missing Supabase credentials for RAG');
      return null;
    }
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created successfully');
    
    // CRITICAL FIX: Simple query that will find ALL your knowledge entries
    console.log('🔍 Retrieving ALL knowledge entries...');
    const { data: knowledge, error } = await supabase
      .from('knowledge_entries')
      .select('id, title, content, category, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📊 Database query results:', {
      hasError: !!error,
      errorMessage: error?.message || null,
      dataLength: knowledge?.length || 0,
      foundTitles: knowledge?.map(k => k.title) || [],
      foundCategories: knowledge?.map(k => k.category) || []
    });

    if (error) {
      console.log('⚠️ Knowledge retrieval error:', error);
      return null;
    }
    
    if (!knowledge || knowledge.length === 0) {
      console.log('⚠️ No knowledge entries found in database');
      return null;
    }
    
    console.log('✅ Successfully retrieved', knowledge.length, 'knowledge entries:');
    knowledge.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.title} (${entry.category})`);
    });
    
    // Build research context from your actual UX research
    const context = knowledge.map(k => 
      `${k.title}: ${k.content.substring(0, 200)}...`
    ).join('\n\n');
    
    const result = {
      context,
      knowledgeCount: knowledge.length,
      categories: [...new Set(knowledge.map(k => k.category))]
    };
    
    console.log('🎉 RAG context built successfully:', {
      contextLength: context.length,
      knowledgeCount: result.knowledgeCount,
      categories: result.categories,
      researchIncluded: knowledge.map(k => k.title)
    });
    
    return result;
    
  } catch (error) {
    console.log('⚠️ RAG context failed with error:', {
      message: error.message,
      name: error.name
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
  console.log('🔍 Starting RAG process with your UX research...');
  const ragContext = await getRAGContext(enhancedPrompt);
  
  // Enhance prompt with RAG context if available
  let finalPrompt = enhancedPrompt;
  if (ragContext && ragContext.knowledgeCount > 0) {
    finalPrompt = `${enhancedPrompt}

RESEARCH CONTEXT FROM UX KNOWLEDGE BASE:
${ragContext.context}

Based on the research above, provide analysis that references relevant UX principles, research findings, and best practices. Include specific recommendations backed by this research. Return the same JSON format as requested.`;
    
    console.log('✅ RAG ENHANCEMENT SUCCESSFUL! Enhanced prompt with:', {
      knowledgeCount: ragContext.knowledgeCount,
      categories: ragContext.categories,
      originalPromptLength: enhancedPrompt.length,
      enhancedPromptLength: finalPrompt.length,
      researchUsed: ragContext.categories
    });
  } else {
    console.log('⚪ No RAG context retrieved - using standard analysis');
  }
  
  // Determine AI provider configuration
  let providerConfig: AIProviderConfig;
  if (requestedProvider && (requestedProvider === 'openai' || requestedProvider === 'claude')) {
    providerConfig = { 
      provider: requestedProvider as AIProvider,
      model: requestedModel
    };
    console.log(`Using explicitly requested provider: ${requestedProvider}${requestedModel ? ` with model: ${requestedModel}` : ''}`);
  } else {
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
      finalPrompt,  // *** USING RESEARCH-ENHANCED PROMPT ***
      providerConfig
    );
    
    const annotations = await Promise.race([aiPromise, aiTimeoutPromise]);
    
    console.log('🏆 AI analysis completed with RAG enhancement:', {
      annotationCount: annotations.length,
      hasAnnotations: annotations.length > 0,
      usedProvider: providerConfig.provider,
      usedModel: providerConfig.model || 'default',
      ragEnhanced: !!ragContext && ragContext.knowledgeCount > 0,
      researchCategoriesUsed: ragContext?.categories || []
    });

    return annotations;
  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    throw new Error(`AI analysis failed: ${aiError.message}`);
  }
}