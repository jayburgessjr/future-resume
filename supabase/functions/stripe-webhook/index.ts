import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[STRIPE-WEBHOOK] Webhook received");
    
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe keys not configured");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
      return new Response(`Webhook signature verification failed`, { status: 400 });
    }

    console.log("[STRIPE-WEBHOOK] Event type:", event.type);

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[STRIPE-WEBHOOK] Checkout completed:", session.id);

        if (session.mode === "subscription" && session.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;

          // Update user's profile with subscription info
          const { error } = await supabaseService
            .from("profiles")
            .update({
              stripe_customer_id: customerId,
              plan: "pro",
              sub_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[STRIPE-WEBHOOK] Failed to update profile:", error);
          } else {
            console.log("[STRIPE-WEBHOOK] Profile updated for customer:", customerId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[STRIPE-WEBHOOK] Subscription updated:", subscription.id);

        const { error } = await supabaseService
          .from("profiles")
          .update({
            sub_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan: subscription.status === "active" ? "pro" : "free",
          })
          .eq("stripe_customer_id", subscription.customer as string);

        if (error) {
          console.error("[STRIPE-WEBHOOK] Failed to update subscription:", error);
        } else {
          console.log("[STRIPE-WEBHOOK] Subscription updated for customer:", subscription.customer);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[STRIPE-WEBHOOK] Subscription deleted:", subscription.id);

        const { error } = await supabaseService
          .from("profiles")
          .update({
            plan: "free",
            sub_status: "canceled",
            current_period_end: null,
          })
          .eq("stripe_customer_id", subscription.customer as string);

        if (error) {
          console.error("[STRIPE-WEBHOOK] Failed to cancel subscription:", error);
        } else {
          console.log("[STRIPE-WEBHOOK] Subscription canceled for customer:", subscription.customer);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[STRIPE-WEBHOOK] Payment failed for customer:", invoice.customer);

        // Optionally update status or send notification
        // For now, we'll let Stripe handle retry logic
        break;
      }

      default:
        console.log("[STRIPE-WEBHOOK] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});