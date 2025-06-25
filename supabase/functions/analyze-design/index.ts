
import { corsHeaders, corsHandler } from './corsHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { analyzeWithAIProvider, determineOptimalProvider } from './aiProviderRouter.ts';
import { databaseManager } from './databaseManager.ts';
import { responseFormatter } from './responseFormatter.ts';
import { errorHandler } from './errorHandler.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

console.log('🚀 Design Analysis Function Starting');

// RAG helper function to add knowledge context
async function addKnowledgeContext(prompt: string, supabase: any): Promise<string> {
  try {
    console.log('🔍 Adding knowledge context...');
    
    // Use the working match_knowledge RPC function
    const dummyEmbedding = Array(1536).fill(0.1);
    
    const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${dummyEmbedding.join(',')}]`,
      match_threshold: 0.1,
      match_count: 5,
      filter_category: null
    });
    
    if (error) {
      console.log('⚠️ RPC error:', error);
      return prompt;
    }
    
    if (knowledge && knowledge.length > 0) {
      console.log(`✅ Found ${knowledge.length} knowledge entries`);
      
      const context = knowledge.map((k: any) => 
        `${k.title}: ${k.content.substring(0, 150)}...`
      ).join('\n\n');
      
      return `${prompt}\n\nRELEVANT UX RESEARCH:\n${context}\n\nBased on this research, provide analysis that references relevant UX principles and best practices.`;
    }
    
    console.log('⚠️ No knowledge found, using standard prompt');
    return prompt;
    
  } catch (e) {
    console.log('⚠️ RAG failed, using standard prompt:', e);
    return prompt;
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
    
    for (const processedImage of imageProcessingResult.processedImages) {
      console.log(`🔍 Analyzing image with ${aiProviderConfig.provider}...`);
      
      try {
        // Enhanced prompt with RAG context
        const originalPrompt = requestData.analysisPrompt || 'Analyze this design for UX improvements';
        const enhancedPrompt = await addKnowledgeContext(originalPrompt, supabase);
        
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
          JSON.stringify({ error: error.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log(`✅ AI analysis completed with ${allAnnotations.length} total annotations`);

    // Save to database
    console.log('💾 Saving to database...');
    const dbResult = await databaseManager.saveAnalysisResults({
      analysisId: requestData.analysisId,
      annotations: allAnnotations,
      aiModelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now() // Simple timestamp for now
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

    // Format response
    const response = responseFormatter.formatSuccessResponse({
      annotations: allAnnotations,
      totalAnnotations: allAnnotations.length,
      modelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now(),
      ragEnhanced: true // Now enabled since we're using RAG
    });

    // Add CORS headers to successful response
    const responseWithCors = new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    console.log('✅ Analysis completed successfully with RAG enhancement');
    return responseWithCors;

  } catch (error) {
    console.error('❌ Unexpected error in analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
