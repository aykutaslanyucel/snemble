
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.16.0";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.24.0");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Not authenticated");
    }
    
    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Get the Stripe customer for this user
    const { data: customer, error: customerError } = await supabase
      .from("stripe_customers")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (customerError || !customer?.customer_id) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customer.customer_id;
    console.log("Found customer ID:", customerId);

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      console.log("No active subscriptions found");
      
      // Update subscribers table
      const { error: updateError } = await supabase
        .from("subscribers")
        .upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id' 
        });
        
      if (updateError) {
        console.error("Error updating subscriber record:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get subscription details
    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Determine subscription tier based on price
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
      id: subscription.id,
      tier: subscriptionTier,
      end: subscriptionEnd
    });
    
    // Update subscribers table
    const { error: updateError } = await supabase
      .from("subscribers")
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id' 
      });
      
    if (updateError) {
      console.error("Error updating subscriber record:", updateError);
    }
    
    return new Response(JSON.stringify({ 
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        subscribed: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
