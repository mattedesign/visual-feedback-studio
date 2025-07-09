import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🖼️ Get Images By Session - Simple image retrieval');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    console.log('🔍 get-images-by-session: Request received for session:', sessionId?.substring(0, 8));
    
    if (!sessionId) {
      console.error('❌ get-images-by-session: No sessionId provided');
      throw new Error('sessionId is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch images for the session - simple and clean with enhanced error handling
    console.log('📸 get-images-by-session: Querying database for images...');
    const { data: images, error: imagesError } = await supabase
      .from('goblin_analysis_images')
      .select('id, file_path, file_name, upload_order, screen_type, vision_metadata, file_size')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true });

    if (imagesError) {
      console.error('❌ get-images-by-session: Database query failed:', imagesError);
      throw new Error(`Failed to fetch images: ${imagesError.message}`);
    }

    console.log(`📊 get-images-by-session: Found ${images?.length || 0} images in database`);
    
    if (!images || images.length === 0) {
      console.warn('⚠️ get-images-by-session: No images found for session');
      return new Response(
        JSON.stringify({
          validImages: [],
          summary: {
            total: 0,
            sessionId: sessionId.substring(0, 8),
            hydrationComplete: true,
            goblinPrompt: "🧙‍♂️ No images found for this session. The goblin is disappointed."
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform images to match expected frontend format with validation
    console.log('🔄 get-images-by-session: Transforming images to frontend format...');
    const validImages = (images || []).map((img, index) => {
      let url = img.file_path;
      
      // Enhanced URL validation and transformation
      if (!url) {
        console.warn(`⚠️ get-images-by-session: Image ${index + 1} has no file_path`);
        url = '';
      } else if (!url.startsWith('http')) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        if (!supabaseUrl) {
          console.error('❌ get-images-by-session: SUPABASE_URL environment variable not set');
          throw new Error('Server configuration error: SUPABASE_URL not set');
        }
        
        const cleanPath = url.replace(/^\/+/, '');
        
        if (!cleanPath.startsWith('analysis-images/')) {
          url = `${supabaseUrl}/storage/v1/object/public/analysis-images/${cleanPath}`;
        } else {
          url = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
        }
        
        console.log(`🔗 get-images-by-session: Transformed relative path to URL for image ${index + 1}:`, {
          originalPath: img.file_path,
          transformedUrl: url
        });
      }

      const transformedImage = {
        id: img.id || `img-${img.upload_order}`,
        url, // Transform file_path to url
        file_path: url, // Keep for backward compatibility
        fileName: img.file_name || `image-${img.upload_order}`, // Transform to fileName
        file_name: img.file_name, // Keep for backward compatibility
        upload_order: img.upload_order,
        screen_type: img.screen_type,
        vision_metadata: img.vision_metadata,
        file_size: img.file_size
      };
      
      return transformedImage;
    });

    const response = {
      validImages,
      summary: {
        total: validImages.length,
        sessionId: sessionId.substring(0, 8),
        hydrationComplete: true,
        goblinPrompt: "🧙‍♂️ Images hydrated by goblin magic! Ready for UX scrutiny."
      }
    };

    console.log(`📸 Hydrated ${validImages.length} images for session ${sessionId.substring(0, 8)}`);
    console.log("🧠 Hydration response prepared with goblin magic");

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ get-images-by-session: Request failed:', error);
    console.error('🔍 get-images-by-session: Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch images for session',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});