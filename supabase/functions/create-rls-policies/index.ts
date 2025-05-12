
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.24.0");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Add RLS policy for profiles to allow admins to create profiles
    const { error: profilesError } = await supabase.rpc('create_admin_insert_policy_for_profiles');
    
    if (profilesError) {
      throw profilesError;
    }
    
    // Add RLS policy for team_members to allow admins to create team members
    const { error: teamMembersError } = await supabase.rpc('create_admin_insert_policy_for_team_members');
    
    if (teamMembersError) {
      throw teamMembersError;
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "RLS policies created successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating RLS policies:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Failed to create RLS policies: ${error instanceof Error ? error.message : String(error)}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
