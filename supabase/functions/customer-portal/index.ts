
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
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = customer.customer_id;
    console.log("Found customer ID:", customerId);

    // Get return URL from request origin
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin,
    });

    console.log("Created customer portal session:", session.id);
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating customer portal:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
