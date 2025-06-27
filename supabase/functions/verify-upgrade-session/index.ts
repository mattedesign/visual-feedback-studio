
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-UPGRADE-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const { sessionId, upgradeType } = requestBody;
    
    if (!sessionId || !upgradeType) {
      throw new Error("Session ID and upgrade type are required");
    }
    
    logStep("Request validated", { sessionId, upgradeType });
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    logStep("Session retrieved from Stripe", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      status: session.status 
    });

    // Verify the session belongs to the user and was successful
    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    if (session.status !== 'complete') {
      throw new Error(`Session not complete. Status: ${session.status}`);
    }

    // Extract upgrade information from metadata
    const metadata = session.metadata || {};
    const upgradeName = metadata.upgrade_name || upgradeType.replace(/_/g, ' ');
    
    logStep("Session verified successfully", { 
      upgradeName, 
      upgradeType,
      userId: user.id 
    });

    // Generate mock additional visuals based on upgrade type
    const additionalVisuals = generateMockVisuals(upgradeType);
    
    // TODO: In a real implementation, you would:
    // 1. Credit the user's account with the upgrade
    // 2. Generate actual additional visual content
    // 3. Update the user's subscription/credits in the database
    // 4. Send confirmation email

    const response = {
      success: true,
      sessionId: session.id,
      upgradeName,
      upgradeType,
      additionalVisuals,
      timestamp: new Date().toISOString(),
      userEmail: user.email
    };

    logStep("Verification complete", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateMockVisuals(upgradeType: string) {
  const mockVisuals = [];
  
  switch (upgradeType) {
    case 'style_variety_pack':
      mockVisuals.push(
        { style: 'professional', description: 'Clean, corporate-focused design' },
        { style: 'minimal', description: 'Simplified, whitespace-heavy approach' },
        { style: 'bold', description: 'High-contrast, attention-grabbing design' }
      );
      break;
    case 'responsive_design_pack':
      mockVisuals.push(
        { device: 'mobile', description: 'Mobile-optimized layout' },
        { device: 'tablet', description: 'Tablet-responsive design' },
        { device: 'desktop', description: 'Desktop-enhanced experience' }
      );
      break;
    case 'ab_test_variants':
      mockVisuals.push(
        { variant: 'A', description: 'Original design with subtle improvements' },
        { variant: 'B', description: 'Alternative layout for conversion testing' }
      );
      break;
    case 'accessibility_focus':
      mockVisuals.push(
        { type: 'wcag_compliant', description: 'WCAG 2.1 AA compliant version' },
        { type: 'high_contrast', description: 'High contrast accessibility version' }
      );
      break;
    default:
      mockVisuals.push({ type: 'enhanced', description: 'Enhanced design variation' });
  }
  
  return mockVisuals;
}
