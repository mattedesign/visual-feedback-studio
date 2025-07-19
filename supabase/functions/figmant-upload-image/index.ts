import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { sessionId, imageFile, fileName, fileSize } = await req.json();

    console.log("📸 Processing image upload:", { sessionId, fileName, fileSize });

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from("figmant_analysis_sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .eq("user_id", userData.user.id)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found or access denied");
    }

    // Store in Supabase Storage
    const fileExt = fileName.split('.').pop();
    const filePath = `${sessionId}/${Date.now()}.${fileExt}`;

    // Convert base64 to blob for upload
    const base64Data = imageFile.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("analysis-images")
      .upload(filePath, binaryData, {
        contentType: `image/${fileExt}`,
        duplex: 'half'
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from("analysis-images")
      .getPublicUrl(filePath);

    // Process with Google Vision API
    let visionData = null;
    try {
      console.log("🔍 Processing with Google Vision API...");
      
      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get("GOOGLE_VISION_API_KEY")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Data },
              features: [
                { type: "TEXT_DETECTION", maxResults: 50 },
                { type: "LABEL_DETECTION", maxResults: 20 },
                { type: "IMAGE_PROPERTIES", maxResults: 10 },
                { type: "OBJECT_LOCALIZATION", maxResults: 20 },
                { type: "WEB_DETECTION", maxResults: 10 }
              ]
            }]
          })
        }
      );

      if (visionResponse.ok) {
        const visionResult = await visionResponse.json();
        visionData = visionResult.responses[0];
        console.log("✅ Google Vision processing complete");
      } else {
        console.warn("Google Vision API failed, continuing without vision data");
      }
    } catch (visionError) {
      console.warn("Google Vision processing failed:", visionError);
    }

    // Save image record to database
    const { data: imageRecord, error: imageError } = await supabaseClient
      .from("figmant_session_images")
      .insert({
        session_id: sessionId,
        file_name: fileName,
        file_path: publicUrl,
        file_size: fileSize,
        google_vision_data: visionData,
        upload_order: 0
      })
      .select()
      .single();

    if (imageError) {
      console.error("Database insert error:", imageError);
      throw new Error(`Failed to save image record: ${imageError.message}`);
    }

    console.log("✅ Image uploaded and processed:", imageRecord.id);

    return new Response(JSON.stringify({ 
      success: true, 
      image: {
        id: imageRecord.id,
        file_name: imageRecord.file_name,
        file_path: imageRecord.file_path,
        file_size: imageRecord.file_size,
        google_vision_processed: !!visionData
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Upload image error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});