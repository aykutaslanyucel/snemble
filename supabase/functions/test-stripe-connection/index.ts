
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.3.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

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
    // Get authorization header
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

    // Verify user is authorized and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Error checking profile: ${profileError.message}`);
    }

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin) {
      throw new Error('Only admins can test Stripe connection');
    }

    // Get stripe settings from the database
    const { data: settings, error: settingsError } = await supabase.rpc('get_admin_settings');
    
    if (settingsError) {
      throw new Error(`Error getting settings: ${settingsError.message}`);
    }
    
    // Find the stripe API key
    let stripeApiKey = '';
    for (const setting of settings) {
      if (setting.key === 'stripe_api_key') {
        stripeApiKey = setting.value;
        break;
      }
    }
    
    if (!stripeApiKey) {
      throw new Error('Stripe API key not found in settings');
    }
    
    // Try to initialize Stripe and make a simple API call
    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2023-10-16',
    });
    
    // Make a simple call to get account info
    const account = await stripe.account.retrieve();
    
    return new Response(JSON.stringify({
      success: true,
      message: "Successfully connected to Stripe API",
      accountId: account.id,
      // Don't return sensitive information
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("Error testing Stripe connection:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
