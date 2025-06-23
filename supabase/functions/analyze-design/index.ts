
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { AnalysisRequest } from './types.ts';
import { fetchImageAsBase64 } from './imageProcessor.ts';
import { createAnalysisPrompt } from './promptBuilder.ts';
import { analyzeWithAIProvider, determineOptimalProvider, AIProvider } from './aiProviderRouter.ts';
import { formatAnalysisResponse, formatErrorResponse } from './responseFormatter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Enhanced AI Analysis Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Timestamp:', new Date().toISOString());
    
    // Enhanced environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment validation:', {
      supabaseUrlExists: !!supabaseUrl,
      supabaseServiceKeyExists: !!supabaseServiceKey,
      openaiKeyExists: !!Deno.env.get('OPENAI_API_KEY'),
      claudeKeyExists: !!Deno.env.get('ANTHROPIC_API_KEY')
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Supabase configuration missing');
      throw new Error('Supabase configuration is missing');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let requestBody: AnalysisRequest;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Request parsing failed:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { imageUrl, imageUrls, analysisId, analysisPrompt, designType, isComparative, aiProvider } = requestBody;

    // Determine which images to process
    const imagesToProcess = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    const isMultiImage = imagesToProcess.length > 1;

    console.log('=== Analysis Configuration ===');
    console.log({
      analysisId,
      imageCount: imagesToProcess.length,
      isComparative: isComparative || isMultiImage,
      isMultiImage,
      designType,
      promptLength: analysisPrompt?.length || 0,
      requestedProvider: aiProvider || 'auto'
    });

    // Validate required parameters
    if (imagesToProcess.length === 0) {
      console.error('Validation failed: No images provided');
      throw new Error('At least one image URL is required');
    }
    if (!analysisId) {
      console.error('Validation failed: No analysis ID provided');
      throw new Error('analysisId is required');
    }

    // Determine AI provider configuration
    let providerConfig;
    if (aiProvider && (aiProvider === 'openai' || aiProvider === 'claude')) {
      // Use explicitly requested provider
      providerConfig = { provider: aiProvider as AIProvider };
      console.log(`Using explicitly requested provider: ${aiProvider}`);
    } else {
      // Auto-determine optimal provider
      providerConfig = determineOptimalProvider();
      console.log(`Auto-determined provider config:`, providerConfig);
    }

    // Enhanced image processing with detailed logging and timeout protection
    console.log('=== Image Processing Phase ===');
    
    const processedImages = [];
    for (let index = 0; index < imagesToProcess.length; index++) {
      const url = imagesToProcess[index];
      console.log(`Processing image ${index + 1}/${imagesToProcess.length}: ${url.substring(0, 50)}...`);
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Image processing timeout (30s)')), 30000);
        });
        
        const processPromise = fetchImageAsBase64(url);
        const result = await Promise.race([processPromise, timeoutPromise]);
        
        const { base64Image, mimeType } = result as { base64Image: string, mimeType: string };
        
        console.log(`Image ${index + 1} processed successfully:`, {
          mimeType,
          base64Size: base64Image.length,
          isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
        });
        
        processedImages.push({ base64Image, mimeType, index, url });
      } catch (imageError) {
        console.error(`Image ${index + 1} processing failed:`, imageError);
        throw new Error(`Failed to process image ${index + 1}: ${imageError.message}`);
      }
    }

    console.log('All images processed successfully');

    // Enhanced prompt creation
    console.log('=== Prompt Creation Phase ===');
    const systemPrompt = createAnalysisPrompt(
      analysisPrompt, 
      isComparative || isMultiImage, 
      imagesToProcess.length
    );
    
    console.log('System prompt created:', {
      promptLength: systemPrompt.length,
      includesComparative: systemPrompt.includes('COMPARATIVE'),
      includesImageCount: systemPrompt.includes(imagesToProcess.length.toString())
    });

    // For comparative analysis, use the first image as primary but enhance context
    const primaryImage = processedImages[0];
    
    let enhancedPrompt = systemPrompt;
    if (isMultiImage || isComparative) {
      enhancedPrompt += `\n\n=== MULTI-IMAGE CONTEXT ===\n`;
      enhancedPrompt += `You are analyzing ${imagesToProcess.length} images for comparative analysis.\n`;
      enhancedPrompt += `Image URLs being analyzed:\n`;
      imagesToProcess.forEach((url, index) => {
        enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
      });
      enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imagesToProcess.length - 1}) to specify which image each annotation applies to.\n`;
      enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations.\n`;
      enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
    }

    console.log('Enhanced prompt prepared:', {
      finalLength: enhancedPrompt.length,
      isComparativeAnalysis: isComparative || isMultiImage
    });

    // Call AI Provider with enhanced error handling and timeout
    console.log('=== AI Provider Analysis Phase ===');
    let annotations;
    try {
      const aiTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout (120s)')), 120000);
      });
      
      const aiPromise = analyzeWithAIProvider(
        primaryImage.base64Image, 
        primaryImage.mimeType, 
        enhancedPrompt, 
        providerConfig
      );
      
      annotations = await Promise.race([aiPromise, aiTimeoutPromise]);
      
      console.log('AI analysis completed:', {
        annotationCount: annotations.length,
        hasAnnotations: annotations.length > 0,
        usedProvider: providerConfig.provider
      });
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      throw new Error(`AI analysis failed: ${aiError.message}`);
    }

    // Process annotations with imageIndex handling
    const processedAnnotations = annotations.map(annotation => ({
      ...annotation,
      imageIndex: annotation.imageIndex ?? 0
    }));

    console.log('Annotations processed:', {
      originalCount: annotations.length,
      processedCount: processedAnnotations.length,
      imageIndexDistribution: processedAnnotations.reduce((acc, ann) => {
        acc[ann.imageIndex] = (acc[ann.imageIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    });

    // Save annotations to database
    console.log('=== Database Save Phase ===');
    const savedAnnotations = [];
    
    for (const annotation of processedAnnotations) {
      try {
        const { data, error } = await supabase
          .from('annotations')
          .insert({
            analysis_id: analysisId,
            x: annotation.x,
            y: annotation.y,
            category: annotation.category,
            severity: annotation.severity,
            feedback: annotation.feedback,
            implementation_effort: annotation.implementationEffort,
            business_impact: annotation.businessImpact,
            image_index: annotation.imageIndex
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving annotation:', error);
          throw new Error(`Database save failed: ${error.message}`);
        }

        savedAnnotations.push(data);
        console.log('Annotation saved successfully:', data.id);
      } catch (saveError) {
        console.error('Failed to save annotation:', saveError);
        throw new Error(`Failed to save annotation: ${saveError.message}`);
      }
    }

    console.log('All annotations saved to database:', {
      totalSaved: savedAnnotations.length,
      savedIds: savedAnnotations.map(a => a.id)
    });

    // Format response
    const responseData = formatAnalysisResponse(processedAnnotations);
    
    console.log('=== Analysis Completed Successfully ===');
    console.log('Final response:', {
      success: responseData.success,
      totalAnnotations: responseData.totalAnnotations,
      totalSavedAnnotations: savedAnnotations.length,
      isComparative: isComparative || isMultiImage,
      usedProvider: providerConfig.provider
    });
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Enhanced error categorization
    let errorCategory = 'unknown_error';
    let errorSeverity = 'medium';
    
    if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
      errorCategory = 'auth_error';
      errorSeverity = 'high';
    } else if (error.message.includes('Rate limit')) {
      errorCategory = 'rate_limit';
      errorSeverity = 'medium';
    } else if (error.message.includes('base64') || error.message.includes('Image') || error.message.includes('timeout')) {
      errorCategory = 'image_processing_error';
      errorSeverity = 'medium';
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      errorCategory = 'parsing_error';
      errorSeverity = 'low';
    } else if (error.message.includes('API key not configured')) {
      errorCategory = 'config_error';
      errorSeverity = 'high';
    } else if (error.message.includes('Database save failed')) {
      errorCategory = 'database_error';
      errorSeverity = 'high';
    }
    
    console.error('Error categorization:', {
      category: errorCategory,
      severity: errorSeverity,
      isRetryable: errorSeverity !== 'high'
    });
    
    const errorData = formatErrorResponse(error);
    
    return new Response(
      JSON.stringify(errorData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
