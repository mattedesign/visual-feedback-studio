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

// Enhanced RAG helper function to add knowledge context
async function addKnowledgeContext(prompt: string, supabase: any, enableRAG = false): Promise<{
  enhancedPrompt: string;
  researchEnhanced: boolean;
  knowledgeSourcesUsed: number;
  researchCitations: string[];
}> {
  if (!enableRAG) {
    console.log('⚠️ RAG disabled, using standard prompt');
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }

  try {
    console.log('🔍 Adding RAG knowledge context...');
    console.log(`📝 Analysis prompt: "${prompt.substring(0, 100)}..."`);
    
    // Generate embedding for the analysis prompt using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('⚠️ No OpenAI API key for embedding generation, skipping RAG');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log('🧠 Generating embedding for analysis prompt...');
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
    
    if (!embeddingResponse.ok) {
      console.log('⚠️ Embedding generation failed:', embeddingResponse.status);
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    // Use the actual embedding to search for relevant knowledge
    const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.3,
      match_count: 5,
      filter_category: null
    });
    
    if (error) {
      console.log('⚠️ RPC error:', error);
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log(`🔍 Knowledge search results: ${knowledge?.length || 0} entries found`);
    
    if (knowledge && knowledge.length > 0) {
      console.log(`✅ Found ${knowledge.length} relevant knowledge entries for RAG enhancement`);
      
      // Log the similarity scores for debugging
      knowledge.forEach((k: any, index: number) => {
        console.log(`   ${index + 1}. "${k.title}" (similarity: ${k.similarity?.toFixed(3) || 'N/A'})`);
      });
      
      const context = knowledge.map((k: any) => 
        `**${k.title}** (${k.category}): ${k.content.substring(0, 300)}...`
      ).join('\n\n');
      
      const citations = knowledge.map((k: any) => k.title);
      
      console.log(`📚 Enhanced prompt will include ${knowledge.length} knowledge sources`);
      
      return {
        enhancedPrompt: context, // Return context separately for prompt builder
        researchEnhanced: true,
        knowledgeSourcesUsed: knowledge.length,
        researchCitations: citations
      };
    }
    
    console.log('⚠️ No relevant knowledge found, using standard prompt');
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
    
  } catch (e) {
    console.log('⚠️ RAG failed, using standard prompt:', e);
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
    
    // Get RAG context first
    const enableRAG = requestData.ragEnabled === true;
    const originalPrompt = requestData.analysisPrompt || 'Analyze this design for UX improvements';
    
    console.log(`🔧 RAG enabled: ${enableRAG}`);
    
    const ragContext = await addKnowledgeContext(originalPrompt, supabase, enableRAG);
    ragResults = {
      researchEnhanced: ragContext.researchEnhanced,
      knowledgeSourcesUsed: ragContext.knowledgeSourcesUsed,
      researchCitations: ragContext.researchCitations
    };
    
    console.log(`📚 RAG Context Results:`, {
      enhanced: ragContext.researchEnhanced,
      sources: ragContext.knowledgeSourcesUsed,
      citations: ragContext.researchCitations.length
    });
    
    // Build the complete prompt with RAG context
    const enhancedPrompt = buildAnalysisPrompt(
      originalPrompt,
      ragContext.researchEnhanced ? ragContext.enhancedPrompt : undefined,
      requestData.isComparative || false,
      imageProcessingResult.processedImages.length
    );
    
    console.log('🏗️ Built enhanced prompt with JSON format instructions');
    
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
    console.log(`📚 RAG Results: Enhanced=${ragResults.researchEnhanced}, Sources=${ragResults.knowledgeSourcesUsed}`);

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
