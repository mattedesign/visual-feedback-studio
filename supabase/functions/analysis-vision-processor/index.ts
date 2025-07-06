import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('👁️ Analysis Vision Processor - Google Vision integration');

serve(async (req) => {
  console.log('🔥 VISION PROCESSOR CALLED - Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }

  try {
    const body = await req.json();
    console.log('📷 Processing vision analysis request:', body);

    const { sessionId, imageUrls } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('Image URLs are required');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call Google Vision API
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    console.log(`🔍 Analyzing ${imageUrls.length} images with Google Vision...`);

    const visionResults = [];
    
    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 50 },
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                { type: 'WEB_DETECTION', maxResults: 10 }
              ]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Google Vision API error: ${response.status}`);
        }

        const visionData = await response.json();
        visionResults.push({
          imageUrl,
          analysis: visionData.responses[0],
          processedAt: new Date().toISOString()
        });

      } catch (error) {
        console.warn(`⚠️ Failed to process image ${imageUrl}:`, error.message);
        visionResults.push({
          imageUrl,
          error: error.message,
          processedAt: new Date().toISOString()
        });
      }
    }

    // Update session with vision results
    await supabase
      .from('analysis_sessions')
      .update({ 
        vision_results: {
          results: visionResults,
          processedAt: new Date().toISOString(),
          totalImages: imageUrls.length,
          successfulImages: visionResults.filter(r => !r.error).length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Vision processing completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        visionResults,
        summary: {
          totalImages: imageUrls.length,
          successfulImages: visionResults.filter(r => !r.error).length,
          failedImages: visionResults.filter(r => r.error).length
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Vision processing failed:`, errorMessage);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});