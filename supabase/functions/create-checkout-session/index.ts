
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
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
    const { planType, customerId, successUrl, cancelUrl, metadata } = requestBody;
    
    if (!planType) throw new Error("Plan type is required");
    logStep("Request validated", { planType, customerId });
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Define plan pricing and analysis limits
    const planConfig = {
      monthly: {
        price: 2900, // $29/month
        analyses: 25,
        interval: 'month'
      },
      yearly: {
        price: 29000, // $290/year (save ~$58)
        analyses: 25,
        interval: 'year'
      }
    };

    const config = planConfig[planType as keyof typeof planConfig];
    if (!config) throw new Error("Invalid plan type");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Figmant ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
              description: `${config.analyses} UX analyses per ${config.interval}`
            },
            unit_amount: config.price,
            recurring: {
              interval: config.interval as 'month' | 'year'
            }
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/?subscription_success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/subscription`,
      metadata: {
        ...metadata,
        user_id: user.id,
        plan_type: planType,
        analyses_limit: config.analyses.toString()
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
