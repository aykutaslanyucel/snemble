
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
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

    // Check if the user is a subscriber
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw new Error(`Error checking subscription: ${subscriptionError.message}`);
    }

    // Check if the user is an admin (who gets premium features by default)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Error checking profile: ${profileError.message}`);
    }

    const isAdmin = profile?.role === 'admin';
    let isPremium = false;
    let expiresAt = null;

    if (subscription) {
      // Check if subscription is valid and not expired
      const subscriptionEnd = subscription.subscription_end 
        ? new Date(subscription.subscription_end) 
        : null;
      
      isPremium = subscription.subscribed && 
                (!subscriptionEnd || subscriptionEnd > new Date());
      
      if (subscriptionEnd) {
        expiresAt = subscriptionEnd.toISOString();
      }
    }

    return new Response(JSON.stringify({
      isPremium: isPremium || isAdmin,
      isAdmin: isAdmin,
      subscription: subscription || null,
      expiresAt,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      isPremium: false,
      isAdmin: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
