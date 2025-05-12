
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

    // Get or create a Stripe customer for this user
    let customerId;
    const { data: customers, error: customerError } = await supabase
      .from("stripe_customers")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (customerError) {
      console.error("Error fetching customer:", customerError);
    }

    if (customers?.customer_id) {
      customerId = customers.customer_id;
      console.log("Found existing customer:", customerId);
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      console.log("Created new customer:", customerId);
      
      // Save the customer ID
      const { error } = await supabase
        .from("stripe_customers")
        .insert({
          user_id: user.id,
          customer_id: customerId,
        });
        
      if (error) {
        console.error("Error saving customer:", error);
      }
    }

    // Get success and cancel URLs from request origin
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${origin}/payment-success`;
    const cancelUrl = `${origin}/payment-canceled`;
    
    // Create a Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
              description: "Access to premium features",
            },
            unit_amount: 1500, // $15.00
            recurring: {
              interval: "month"
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("Created checkout session:", session.id);
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
