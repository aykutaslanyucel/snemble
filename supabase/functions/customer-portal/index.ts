
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";

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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    });

    // Get the JWT token from the header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Parse the request body
    const requestBody = await req.json();
    const { action, session_id, return_url } = requestBody;
    
    if (!action) {
      throw new Error('Missing action parameter');
    }

    // Setup Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Get the customer ID for the current user
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (customerError) {
      throw new Error(`Error fetching customer: ${customerError.message}`);
    }

    if (!customerData?.customer_id) {
      throw new Error('Customer not found');
    }

    let responseData = {};

    // Handle different actions
    switch (action) {
      case 'create_portal': {
        if (!return_url) {
          throw new Error('Missing return_url parameter');
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: customerData.customer_id,
          return_url,
        });

        responseData = {
          url: session.url,
        };
        break;
      }
      
      case 'check_session': {
        if (!session_id) {
          throw new Error('Missing session_id parameter');
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.customer !== customerData.customer_id) {
          throw new Error('Session does not match the current user');
        }

        if (session.payment_status === 'paid' || session.status === 'complete') {
          // Update the subscription status
          const { error: updateError } = await supabase
            .from('subscribers')
            .upsert({
              user_id: user.id,
              email: user.email,
              subscribed: true,
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              stripe_customer_id: customerData.customer_id,
              subscription_tier: 'premium',
            });
            
          if (updateError) {
            throw new Error(`Error updating subscription: ${updateError.message}`);
          }

          responseData = {
            success: true,
            status: 'paid',
          };
        } else {
          responseData = {
            success: false,
            status: session.payment_status,
          };
        }
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error in customer portal:", error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
