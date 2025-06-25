
import { corsHeaders, corsHandler } from './corsHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { analyzeWithAIProvider, determineOptimalProvider } from './aiProviderRouter.ts';
import { databaseManager } from './databaseManager.ts';
import { responseFormatter } from './responseFormatter.ts';
import { errorHandler } from './errorHandler.ts';
import { environmentValidator, validateEnvironment } from './environmentValidator.ts';
import { buildAnalysisPrompt } from './promptBuilder.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

console.log('🚀 Design Analysis Function Starting');

// Enhanced RAG helper function with comprehensive logging and error handling
async function addKnowledgeContext(prompt: string, supabase: any, enableRAG = false): Promise<{
  enhancedPrompt: string;
  researchEnhanced: boolean;
  knowledgeSourcesUsed: number;
  researchCitations: string[];
}> {
  console.log('🔍 === RAG CONTEXT BUILDING START ===');
  console.log(`📋 RAG Configuration:`, {
    enableRAG,
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 100) + '...',
    timestamp: new Date().toISOString()
  });

  if (!enableRAG) {
    console.log('⚠️ RAG disabled by configuration, using standard prompt');
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }

  try {
    console.log('🧠 Starting embedding generation process...');
    
    // Check OpenAI API key availability
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('❌ CRITICAL: No OpenAI API key found for embedding generation');
      console.log('🔧 RAG requires OpenAI API key for semantic search');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log('✅ OpenAI API key available for embedding generation');
    console.log(`🔑 API key preview: ${openaiApiKey.substring(0, 10)}...`);
    
    // Generate embedding with detailed logging
    console.log('📡 Calling OpenAI Embeddings API...');
    const embeddingStartTime = Date.now();
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: prompt,
        encoding_format: 'float'
      }),
    });
    
    const embeddingDuration = Date.now() - embeddingStartTime;
    console.log(`⏱️ Embedding API call completed in ${embeddingDuration}ms`);
    console.log(`📊 Embedding API response status: ${embeddingResponse.status}`);
    
    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.log('❌ EMBEDDING API ERROR:', {
        status: embeddingResponse.status,
        statusText: embeddingResponse.statusText,
        error: errorText.substring(0, 200),
        apiKeyPreview: openaiApiKey.substring(0, 10) + '...'
      });
      
      // Fallback handling
      console.log('🔄 Falling back to standard analysis due to embedding failure');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log(`✅ Generated embedding successfully:`, {
      dimensions: embedding.length,
      model: embeddingData.model || 'text-embedding-3-small',
      usage: embeddingData.usage
    });
    
    // Query knowledge base with detailed logging
    console.log('🔍 Querying knowledge base with semantic search...');
    const dbQueryStartTime = Date.now();
    
    const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.3,
      match_count: 5,
      filter_category: null
    });
    
    const dbQueryDuration = Date.now() - dbQueryStartTime;
    console.log(`⏱️ Database query completed in ${dbQueryDuration}ms`);
    
    if (error) {
      console.log('❌ DATABASE QUERY ERROR:', {
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      
      // Fallback handling
      console.log('🔄 Falling back to standard analysis due to database error');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log(`📊 Knowledge base query results:`, {
      entriesFound: knowledge?.length || 0,
      queryThreshold: 0.3,
      maxResults: 5
    });
    
    if (knowledge && knowledge.length > 0) {
      console.log('✅ RAG KNOWLEDGE RETRIEVAL SUCCESSFUL');
      console.log('📚 Retrieved knowledge entries:');
      
      knowledge.forEach((k: any, index: number) => {
        console.log(`   ${index + 1}. "${k.title}" (${k.category}) - Similarity: ${k.similarity?.toFixed(3) || 'N/A'}`);
        console.log(`      Content preview: ${k.content.substring(0, 100)}...`);
      });
      
      // Build comprehensive research context
      const researchContext = knowledge.map((k: any, index: number) => 
        `**${index + 1}. ${k.title}** (Category: ${k.category}, Relevance: ${k.similarity?.toFixed(2) || 'N/A'})
${k.content.substring(0, 400)}${k.content.length > 400 ? '...' : ''}

---`
      ).join('\n\n');
      
      const citations = knowledge.map((k: any) => k.title);
      
      console.log('🎯 RAG CONTEXT BUILDING SUCCESS:', {
        knowledgeEntries: knowledge.length,
        totalContextLength: researchContext.length,
        citationsCount: citations.length,
        averageSimilarity: (knowledge.reduce((sum: number, k: any) => sum + (k.similarity || 0), 0) / knowledge.length).toFixed(3)
      });

      // CRITICAL: Log the actual research context being returned
      console.log('📋 === RESEARCH CONTEXT BEING RETURNED ===');
      console.log('🔍 Research Context Preview (first 500 chars):');
      console.log(researchContext.substring(0, 500) + (researchContext.length > 500 ? '...' : ''));
      console.log('📏 Research Context Metrics:', {
        fullLength: researchContext.length,
        numberOfEntries: knowledge.length,
        averageEntryLength: Math.round(researchContext.length / knowledge.length),
        containsFittsLaw: researchContext.toLowerCase().includes('fitts'),
        containsButtonGuidelines: researchContext.toLowerCase().includes('button'),
        containsMobileUsability: researchContext.toLowerCase().includes('mobile')
      });
      
      console.log('🔍 === RAG CONTEXT BUILDING COMPLETE ===');
      
      return {
        enhancedPrompt: researchContext,
        researchEnhanced: true,
        knowledgeSourcesUsed: knowledge.length,
        researchCitations: citations
      };
    }
    
    console.log('⚠️ No relevant knowledge found in database');
    console.log('💡 This might indicate:');
    console.log('   - Knowledge base is empty');
    console.log('   - Query threshold too high (0.3)');
    console.log('   - Semantic mismatch between query and knowledge');
    
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
    
  } catch (error) {
    console.log('❌ RAG CONTEXT BUILDING FAILED:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
    
    console.log('🔄 Implementing fallback to standard analysis');
    
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }
}

// Function to check and report on knowledge base status
async function checkKnowledgeBase(supabase: any): Promise<void> {
  try {
    console.log('📊 Checking knowledge base status...');
    
    // Count total knowledge entries
    const { count: totalEntries, error: countError } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting knowledge entries:', countError);
      return;
    }
    
    console.log(`📈 Total knowledge entries in database: ${totalEntries || 0}`);
    
    if (totalEntries === 0) {
      console.log('⚠️ WARNING: No knowledge entries found in database!');
      console.log('💡 Consider populating the knowledge base for RAG functionality');
      return;
    }
    
    // Get sample entries by category
    const { data: sampleEntries, error: sampleError } = await supabase
      .from('knowledge_entries')
      .select('id, title, category, created_at')
      .limit(10);
    
    if (sampleError) {
      console.log('❌ Error fetching sample entries:', sampleError);
      return;
    }
    
    if (sampleEntries && sampleEntries.length > 0) {
      console.log('📋 Sample knowledge entries:');
      sampleEntries.forEach((entry: any, index: number) => {
        console.log(`   ${index + 1}. [${entry.category}] ${entry.title}`);
      });
      
      // Count by category
      const { data: categoryStats, error: statsError } = await supabase
        .from('knowledge_entries')
        .select('category')
        .then(({ data, error }) => {
          if (error) return { data: null, error };
          const stats = data?.reduce((acc: any, entry: any) => {
            acc[entry.category] = (acc[entry.category] || 0) + 1;
            return acc;
          }, {});
          return { data: stats, error: null };
        });
      
      if (categoryStats) {
        console.log('📊 Knowledge entries by category:', categoryStats);
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking knowledge base:', error);
  }
}

Deno.serve(async (req) => {
  console.log(`📥 ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight
    const corsResponse = corsHandler.handle(req);
    if (corsResponse) {
      console.log('✅ CORS preflight handled');
      return corsResponse;
    }

    // Check if this is a test endpoint request
    const url = new URL(req.url);
    if (url.pathname.includes('/test') || url.searchParams.has('test')) {
      console.log('🧪 TEST ENDPOINT - Performing API key validation only');
      
      try {
        const envConfig = validateEnvironment();
        
        return new Response(JSON.stringify({
          success: true,
          message: 'API key validation test completed - check logs for details',
          environment: {
            supabaseConfigured: !!envConfig.supabaseUrl,
            openaiConfigured: envConfig.hasOpenAIKey,
            claudeConfigured: envConfig.hasClaudeKey,
            openaiValidation: envConfig.openaiKeyValidation,
            claudeValidation: envConfig.claudeKeyValidation
          },
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('❌ Test endpoint error:', error);
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate environment before processing
    console.log('🔧 Validating environment configuration...');
    const envConfig = validateEnvironment();
    console.log('✅ Environment validation completed');

    // Validate request
    const validationResult = await requestValidator.validate(req);
    if (!validationResult.isValid) {
      console.error('❌ Request validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData = validationResult.data;
    console.log('✅ Request validated successfully');

    // Process images
    console.log('🖼️ Processing images...');
    const imageProcessingResult = await imageProcessingManager.processImages(
      requestData.imageUrls || [requestData.imageUrl],
      requestData.isComparative || false
    );

    if (!imageProcessingResult.success) {
      console.error('❌ Image processing failed:', imageProcessingResult.error);
      return new Response(
        JSON.stringify({ error: imageProcessingResult.error }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Images processed: ${imageProcessingResult.processedImages.length}`);

    // Initialize Supabase client for RAG integration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine AI provider configuration
    console.log('🤖 Determining AI provider...');
    const aiProviderConfig = determineOptimalProvider();
    
    // Process each image with AI provider
    const allAnnotations = [];
    let ragResults = {
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: [] as string[]
    };
    
    // Enhanced RAG context building
    const enableRAG = requestData.ragEnabled === true;
    const originalPrompt = requestData.analysisPrompt || 'Analyze this design for UX improvements';
    
    console.log(`🔧 === PROMPT INTEGRATION DEBUG START ===`);
    console.log(`📋 Prompt Integration Configuration:`, {
      ragEnabled: enableRAG,
      originalPromptLength: originalPrompt.length,
      originalPromptPreview: originalPrompt.substring(0, 200) + '...',
      imageCount: imageProcessingResult.processedImages.length,
      isComparative: requestData.isComparative || false,
      timestamp: new Date().toISOString()
    });
    
    const ragContext = await addKnowledgeContext(originalPrompt, supabase, enableRAG);
    ragResults = {
      researchEnhanced: ragContext.researchEnhanced,
      knowledgeSourcesUsed: ragContext.knowledgeSourcesUsed,
      researchCitations: ragContext.researchCitations
    };
    
    console.log(`📚 === RAG CONTEXT RESULTS ===`, ragResults);
    console.log(`🔍 RAG Context Details:`, {
      contextLength: ragContext.enhancedPrompt.length,
      contextPreview: ragContext.enhancedPrompt.substring(0, 300) + '...',
      researchEnhanced: ragContext.researchEnhanced,
      knowledgeSourcesUsed: ragContext.knowledgeSourcesUsed
    });
    
    // Build the complete prompt with RAG context using the updated prompt builder
    console.log(`🏗️ === CALLING BUILD ANALYSIS PROMPT ===`);
    console.log(`📋 Prompt Builder Call Parameters:`, {
      originalPrompt: originalPrompt.substring(0, 100) + '...',
      ragContextAvailable: ragContext.researchEnhanced,
      ragContextLength: ragContext.researchEnhanced ? ragContext.enhancedPrompt.length : 0,
      ragContextPreview: ragContext.researchEnhanced ? ragContext.enhancedPrompt.substring(0, 200) + '...' : null,
      isComparative: requestData.isComparative || false,
      imageCount: imageProcessingResult.processedImages.length
    });
    
    const enhancedPrompt = buildAnalysisPrompt(
      originalPrompt,
      ragContext.researchEnhanced ? ragContext.enhancedPrompt : undefined,
      requestData.isComparative || false,
      imageProcessingResult.processedImages.length
    );
    
    console.log('🎯 === FINAL PROMPT READY FOR AI ===');
    console.log('📏 Final Prompt Metrics:', {
      finalPromptLength: enhancedPrompt.length,
      ragEnhanced: ragContext.researchEnhanced,
      knowledgeSources: ragContext.knowledgeSourcesUsed,
      originalPromptLength: originalPrompt.length,
      ragContextLength: ragContext.researchEnhanced ? ragContext.enhancedPrompt.length : 0,
      addedByPromptBuilder: enhancedPrompt.length - originalPrompt.length - (ragContext.researchEnhanced ? ragContext.enhancedPrompt.length : 0)
    });

    // CRITICAL: Log the exact prompt sections being sent to AI
    console.log('🔍 === EXACT PROMPT BEING SENT TO OPENAI ===');
    console.log('📄 Prompt Structure Check:');
    console.log('   Contains original prompt:', enhancedPrompt.includes(originalPrompt));
    console.log('   Contains research section:', enhancedPrompt.includes('RESEARCH-ENHANCED ANALYSIS'));
    console.log('   Contains RAG context:', ragContext.researchEnhanced ? enhancedPrompt.includes(ragContext.enhancedPrompt) : false);
    console.log('   Contains JSON instructions:', enhancedPrompt.includes('CRITICAL: You MUST respond'));
    
    // Log specific sections for debugging
    console.log('📋 === PROMPT SECTIONS FOR DEBUGGING ===');
    if (enhancedPrompt.includes('RESEARCH-ENHANCED ANALYSIS')) {
      const researchStart = enhancedPrompt.indexOf('RESEARCH-ENHANCED ANALYSIS');
      const researchEnd = enhancedPrompt.indexOf('IMPORTANT: Use this research context');
      console.log('🔬 Research Section Found:');
      console.log('   Start position:', researchStart);
      console.log('   Research instructions end:', researchEnd);
      console.log('   Sample of research section:');
      console.log('   ' + enhancedPrompt.substring(researchStart, researchStart + 400) + '...');
      
      // Look for specific research content
      if (ragContext.researchEnhanced) {
        console.log('🎯 Looking for specific research content in final prompt:');
        console.log('   Contains "Button Design":', enhancedPrompt.includes('Button Design'));
        console.log('   Contains "Mobile Touch":', enhancedPrompt.includes('Mobile Touch'));
        console.log('   Contains "Fitts":', enhancedPrompt.includes('Fitts'));
        console.log('   Contains "44px" or "48dp":', enhancedPrompt.includes('44px') || enhancedPrompt.includes('48dp'));
      }
    }
    
    for (const processedImage of imageProcessingResult.processedImages) {
      console.log(`🔍 Analyzing image with ${aiProviderConfig.provider}...`);
      
      try {
        const annotations = await analyzeWithAIProvider(
          processedImage.base64Data,
          processedImage.mimeType,
          enhancedPrompt,
          aiProviderConfig
        );
        
        allAnnotations.push(...annotations);
        console.log(`✅ Found ${annotations.length} annotations for image`);
      } catch (error) {
        console.error('❌ AI analysis failed for image:', error);
        return new Response(
          JSON.stringify({ 
            error: error.message,
            debugInfo: {
              environment: envConfig,
              ragStatus: ragResults,
              timestamp: new Date().toISOString()
            }
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log(`✅ AI analysis completed with ${allAnnotations.length} total annotations`);
    console.log(`📚 Final RAG Results:`, ragResults);

    // Save to database
    console.log('💾 Saving to database...');
    const dbResult = await databaseManager.saveAnalysisResults({
      analysisId: requestData.analysisId,
      annotations: allAnnotations,
      aiModelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now()
    });

    if (!dbResult.success) {
      console.error('❌ Database save failed:', dbResult.error);
      return new Response(
        JSON.stringify({ error: dbResult.error }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Results saved to database');

    // Format response with RAG information
    const response = responseFormatter.formatSuccessResponse({
      annotations: allAnnotations,
      totalAnnotations: allAnnotations.length,
      modelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now(),
      ragEnhanced: ragResults.researchEnhanced,
      knowledgeSourcesUsed: ragResults.knowledgeSourcesUsed,
      researchCitations: ragResults.researchCitations
    });

    // Add CORS headers to successful response
    const responseWithCors = new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    console.log('✅ Analysis completed successfully', ragResults.researchEnhanced ? 'with RAG enhancement' : 'without RAG');
    return responseWithCors;

  } catch (error) {
    console.error('❌ Unexpected error in analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
