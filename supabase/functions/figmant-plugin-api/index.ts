import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the API key for validation
    const keyHash = await hashAPIKey(apiKey);
    
    // Validate API key and get user info
    const { data: keyData, error: keyError } = await supabase.rpc('validate_api_key', {
      p_key_hash: keyHash
    });

    if (keyError || !keyData || keyData.length === 0 || !keyData[0].is_valid) {
      console.error('API key validation failed:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = keyData[0].user_id;
    const permissions = keyData[0].permissions;

    // Check if user has write permissions
    if (!permissions.write) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
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

    // Log API usage
    await logAPIUsage(supabase, keyData[0].api_key_id, req, 200);

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

async function hashAPIKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function logAPIUsage(supabase: any, apiKeyId: string, req: Request, statusCode: number) {
  try {
    await supabase.rpc('log_api_usage', {
      p_api_key_id: apiKeyId,
      p_endpoint: '/figmant-plugin-api',
      p_method: req.method,
      p_status_code: statusCode,
      p_ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      p_user_agent: req.headers.get('user-agent') || 'unknown'
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}