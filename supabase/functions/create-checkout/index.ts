
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
    console.log("Processing checkout request");
    
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
    
    // Get admin settings for Stripe configuration
    const { data: settingsData } = await supabaseClient.rpc('get_admin_settings');
    const settings = {};
    if (settingsData && Array.isArray(settingsData)) {
      settingsData.forEach((setting) => {
        try {
          if (setting.value === 'true' || setting.value === 'false') {
            settings[setting.key] = setting.value === 'true';
          } else {
            try {
              settings[setting.key] = JSON.parse(setting.value);
            } catch (e) {
              settings[setting.key] = setting.value;
            }
          }
        } catch (e) {
          settings[setting.key] = setting.value;
        }
      });
    }
    
    console.log("Retrieved settings:", settings);
    
    const priceId = settings['stripe_price_id'];
    if (!priceId) {
      throw new Error("No price ID configured in admin settings");
    }

    // Check if user already exists as a customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      console.log("Created new customer:", customerId);
    }

    const origin = req.headers.get("Origin") || "http://localhost:3000";
    
    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription-canceled`,
    });

    console.log("Created checkout session:", session.id);
    
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
