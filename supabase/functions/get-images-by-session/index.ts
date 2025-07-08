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
    
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch images for the session - simple and clean
    const { data: images, error: imagesError } = await supabase
      .from('goblin_analysis_images')
      .select('file_path, upload_order, screen_type, vision_metadata, file_size')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true });

    if (imagesError) {
      throw new Error(`Failed to fetch images: ${imagesError.message}`);
    }

    // Simple URL conversion - no over-engineering
    const processedImages = (images || []).map(img => {
      let file_path = img.file_path;
      
      // Convert relative path to full URL if needed
      if (!file_path.startsWith('http')) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const cleanPath = file_path.replace(/^\/+/, '');
        
        if (!cleanPath.startsWith('analysis-images/')) {
          file_path = `${supabaseUrl}/storage/v1/object/public/analysis-images/${cleanPath}`;
        } else {
          file_path = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
        }
      }

      return {
        file_path,
        upload_order: img.upload_order,
        screen_type: img.screen_type,
        vision_metadata: img.vision_metadata,
        file_size: img.file_size
      };
    });

    console.log(`📸 Returning ${processedImages.length} images for session ${sessionId.substring(0, 8)}`);

    return new Response(
      JSON.stringify(processedImages),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Get images failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});