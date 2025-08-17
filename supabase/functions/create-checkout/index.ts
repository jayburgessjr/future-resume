import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use anon key for authentication, service key for DB writes
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user's profile
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile not found: ${profileError.message}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let customerId = profile.stripe_customer_id;

    // Create or find customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      
      // Update profile with customer ID
      await supabaseService
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
        
      logStep("Created new customer", { customerId });
    } else {
      logStep("Found existing customer", { customerId });
    }

    // Get price ID or create inline price
    const priceId = Deno.env.get("STRIPE_PRICE_PRO");
    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:3000";

    // Create checkout session
    const sessionConfig: any = {
      customer: customerId,
      mode: "subscription",
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
      metadata: { user_id: user.id },
    };

    if (priceId) {
      // Use configured price ID
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      // Create inline price for $20/month
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Resume Builder Pro",
              description: "Unlimited resumes, version history, interview toolkit, and exports"
            },
            unit_amount: 2000, // $20.00 in cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});