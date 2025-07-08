import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🖼️ Get Images By Session - Dedicated image retrieval endpoint');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    console.log('📥 Get images request:', { sessionId: sessionId?.substring(0, 8) });

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify session exists and get user context
    const { data: session, error: sessionError } = await supabase
      .from('goblin_analysis_sessions')
      .select('id, user_id, status, title')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('❌ Session not found:', sessionError?.message);
      throw new Error(`Session not found: ${sessionError?.message}`);
    }

    console.log('✅ Session found:', {
      sessionId: session.id.substring(0, 8),
      userId: session.user_id?.substring(0, 8),
      status: session.status,
      title: session.title
    });

    // Fetch images for the session
    const { data: images, error: imagesError } = await supabase
      .from('goblin_analysis_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true });

    if (imagesError) {
      console.error('❌ Failed to fetch images:', imagesError);
      throw new Error(`Failed to fetch images: ${imagesError.message}`);
    }

    console.log(`📸 Found ${images?.length || 0} images for session`);

    // Process and validate image URLs
    const processedImages = (images || []).map((img, index) => {
      const debugInfo = {
        id: img.id,
        fileName: img.file_name,
        originalPath: img.file_path,
        uploadOrder: img.upload_order,
        fileSize: img.file_size,
        screenType: img.screen_type,
        createdAt: img.created_at
      };

      // Validate and potentially fix image URL
      let processedUrl = img.file_path;
      let urlStatus = 'original';

      if (!processedUrl.startsWith('http')) {
        // Convert relative path to full URL
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const cleanPath = processedUrl.replace(/^\/+/, '');
        
        if (!cleanPath.startsWith('analysis-images/')) {
          if (cleanPath.includes('/')) {
            const pathParts = cleanPath.split('/');
            processedUrl = `${supabaseUrl}/storage/v1/object/public/analysis-images/${pathParts[pathParts.length - 1]}`;
          } else {
            processedUrl = `${supabaseUrl}/storage/v1/object/public/analysis-images/${cleanPath}`;
          }
        } else {
          processedUrl = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
        }
        urlStatus = 'converted';
      }

      const isValidUrl = processedUrl.startsWith('http');
      const isPublicUrl = processedUrl.includes('/storage/v1/object/public/');
      const isAnalysisImage = processedUrl.includes('/analysis-images/');

      console.log(`🔍 Image ${index + 1} processed:`, {
        fileName: img.file_name,
        originalPath: img.file_path,
        processedUrl,
        urlStatus,
        isValidUrl,
        isPublicUrl,
        isAnalysisImage
      });

      return {
        ...debugInfo,
        processedUrl,
        urlStatus,
        validation: {
          isValidUrl,
          isPublicUrl,
          isAnalysisImage,
          hasErrors: !isValidUrl || !isPublicUrl || !isAnalysisImage
        }
      };
    });

    const validImages = processedImages.filter(img => !img.validation.hasErrors);
    const invalidImages = processedImages.filter(img => img.validation.hasErrors);

    console.log(`📊 Image processing summary:`, {
      totalImages: processedImages.length,
      validImages: validImages.length,
      invalidImages: invalidImages.length,
      sessionId: sessionId.substring(0, 8)
    });

    if (invalidImages.length > 0) {
      console.warn('⚠️ Found invalid images:', invalidImages.map(img => ({
        fileName: img.fileName,
        errors: img.validation
      })));
    }

    // Return comprehensive response
    const response = {
      success: true,
      sessionId,
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        userId: session.user_id
      },
      images: processedImages,
      validImages: validImages.map(img => ({
        id: img.id,
        fileName: img.fileName,
        url: img.processedUrl,
        uploadOrder: img.uploadOrder,
        fileSize: img.fileSize,
        screenType: img.screenType
      })),
      summary: {
        totalImages: processedImages.length,
        validImages: validImages.length,
        invalidImages: invalidImages.length,
        readyForAnalysis: validImages.length > 0
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Returning image data:', {
      sessionId: sessionId.substring(0, 8),
      totalImages: processedImages.length,
      validImages: validImages.length,
      readyForAnalysis: validImages.length > 0
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Get images failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});