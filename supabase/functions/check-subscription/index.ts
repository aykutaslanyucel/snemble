
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    console.log("Checking subscription status");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY not set");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      throw new Error("Invalid user token");
    }
    
    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not set");
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Check if user is a Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log("No customer found for:", user.email);
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    console.log("Found customer:", customerId);

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      console.log("No active subscription for customer:", customerId);
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscription details
    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Get price to determine tier
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;
    
    let subscriptionTier;
    if (amount <= 999) {
      subscriptionTier = "Basic";
    } else if (amount <= 1999) {
      subscriptionTier = "Premium";
    } else {
      subscriptionTier = "Enterprise";
    }
    
    console.log("Active subscription found:", {
      subscriptionId: subscription.id,
      tier: subscriptionTier,
      endDate: subscriptionEnd
    });
    
    return new Response(JSON.stringify({
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
