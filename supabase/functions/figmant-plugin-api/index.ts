import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageData {
  name: string;
  format: 'PNG' | 'JPG' | 'SVG';
  image: string; // base64 data URI
}

interface PluginRequest {
  images: ImageData[];
  sessionTitle?: string;
  context?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase clients - dual client approach for proper JWT validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Authenticate user from session token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create auth client with anon key for JWT validation
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });
    
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const userId = userData.user.id;
    console.log('🔍 Plugin API request from user:', userId);

    // Check subscription and usage limits
    let { data: subscriber, error: subscriberError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (subscriberError && subscriberError.code === 'PGRST116') {
      // Create new trial subscriber record
      const { data: newSubscriber, error: createError } = await supabase
        .from("subscribers")
        .insert({
          user_id: userId,
          email: userData.user.email!,
          subscription_tier: 'trial',
          subscribed: false,
          analyses_used: 0,
          analyses_limit: 3
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create subscriber:", createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create subscriber record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      subscriber = newSubscriber;
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve subscription data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can perform analysis
    if (subscriber.analyses_used >= subscriber.analyses_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Analysis limit reached',
          subscription: {
            tier: subscriber.subscription_tier,
            used: subscriber.analyses_used,
            limit: subscriber.analyses_limit
          }
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PluginRequest = await req.json();
    
    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Images array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each image
    for (const image of body.images) {
      if (!image.name || !image.format || !image.image) {
        return new Response(
          JSON.stringify({ error: 'Each image must have name, format, and image data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!['PNG', 'JPG', 'SVG'].includes(image.format)) {
        return new Response(
          JSON.stringify({ error: 'Supported formats: PNG, JPG, SVG' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create analysis session
    const { data: sessionData, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .insert({
        user_id: userId,
        title: body.sessionTitle || `Plugin Analysis - ${new Date().toISOString()}`,
        status: 'draft',
        design_type: 'figma_export'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create analysis session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = sessionData.id;
    const processedImages = [];

    // Process each image
    for (let i = 0; i < body.images.length; i++) {
      const image = body.images[i];
      
      try {
        // Detect and validate format
        const detectedFormat = detectImageFormat(image.image);
        if (detectedFormat.toLowerCase() !== image.format.toLowerCase()) {
          console.warn(`Format mismatch for ${image.name}: declared ${image.format}, detected ${detectedFormat}`);
        }

        // Decode base64 data
        const base64Data = image.image.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 data format');
        }

        // Convert to Uint8Array for upload
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }

        // Generate file path
        const fileExtension = getFileExtension(detectedFormat);
        const fileName = `${image.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.${fileExtension}`;
        const filePath = `figmant-plugin/${sessionId}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('analysis-images')
          .upload(filePath, bytes, {
            contentType: getMimeType(detectedFormat),
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload failed for ${image.name}:`, uploadError);
          throw new Error(`Failed to upload ${image.name}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(filePath);

        // Process with Google Vision if it's a raster image
        let visionData = null;
        if (['PNG', 'JPG'].includes(image.format)) {
          try {
            visionData = await processWithGoogleVision(image.image);
          } catch (visionError) {
            console.warn(`Google Vision failed for ${image.name}:`, visionError);
          }
        }

        // Store image record
        const { data: imageData, error: imageError } = await supabase
          .from('figmant_session_images')
          .insert({
            session_id: sessionId,
            file_name: fileName,
            file_path: filePath,
            file_size: bytes.length,
            upload_order: i + 1,
            google_vision_data: visionData
          })
          .select()
          .single();

        if (imageError) {
          console.error(`Failed to store image record for ${image.name}:`, imageError);
          throw new Error(`Failed to store ${image.name}`);
        }

        processedImages.push({
          id: imageData.id,
          name: image.name,
          format: detectedFormat,
          url: urlData.publicUrl,
          processed_with_vision: visionData !== null,
          upload_order: i + 1
        });

      } catch (error) {
        console.error(`Error processing image ${image.name}:`, error);
        // Continue with other images but log the error
        processedImages.push({
          name: image.name,
          format: image.format,
          error: error.message,
          upload_order: i + 1
        });
      }
    }

    // Update session status
    await supabase
      .from('figmant_analysis_sessions')
      .update({ status: 'pending' })
      .eq('id', sessionId);

    // Increment analysis usage counter
    await supabase
      .from('subscribers')
      .update({ 
        analyses_used: subscriber.analyses_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Log plugin usage for analytics
    await logPluginUsage(supabase, userId, sessionId, processedImages.filter(img => !img.error).length);

    console.log('✅ Plugin analysis session created:', sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        images_processed: processedImages.filter(img => !img.error).length,
        total_images: body.images.length,
        images: processedImages,
        message: 'Images uploaded successfully. Analysis can be started via the analysis endpoint.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in figmant-plugin-api:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectImageFormat(dataUri: string): string {
  if (dataUri.startsWith('data:image/png')) return 'PNG';
  if (dataUri.startsWith('data:image/jpeg') || dataUri.startsWith('data:image/jpg')) return 'JPG';
  if (dataUri.startsWith('data:image/svg+xml')) return 'SVG';
  throw new Error('Unsupported image format');
}

function getFileExtension(format: string): string {
  switch (format.toUpperCase()) {
    case 'PNG': return 'png';
    case 'JPG': return 'jpg';
    case 'SVG': return 'svg';
    default: throw new Error(`Unknown format: ${format}`);
  }
}

function getMimeType(format: string): string {
  switch (format.toUpperCase()) {
    case 'PNG': return 'image/png';
    case 'JPG': return 'image/jpeg';
    case 'SVG': return 'image/svg+xml';
    default: throw new Error(`Unknown format: ${format}`);
  }
}

async function processWithGoogleVision(imageData: string): Promise<any> {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }

  const base64Data = imageData.split(',')[1];
  
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: base64Data },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 50 },
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
          { type: 'WEB_DETECTION' }
        ]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.status}`);
  }

  const result = await response.json();
  return result.responses[0];
}

// Helper function to log plugin usage for analytics
async function logPluginUsage(supabase: any, userId: string, sessionId: string, imageCount: number) {
  try {
    await supabase
      .from('credit_usage')
      .insert({
        user_id: userId,
        session_id: sessionId,
        operation_type: 'figma_plugin_upload',
        credits_consumed: imageCount
      });
  } catch (error) {
    console.error('Failed to log plugin usage:', error);
  }
}