
// Helper functions for Stripe-related features
import { supabase } from "@/integrations/supabase/client";

interface CheckSubscriptionResponse {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export const checkUserSubscription = async (): Promise<CheckSubscriptionResponse> => {
  try {
    console.log("Checking user subscription status...");
    const { data, error } = await supabase.functions.invoke<CheckSubscriptionResponse>('check-subscription');
    
    if (error) {
      console.error("Error checking subscription:", error);
      throw error;
    }
    
    console.log("Subscription status received:", data);
    return data || { subscribed: false };
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return { subscribed: false };
  }
};

export const startCheckoutProcess = async (): Promise<string> => {
  try {
    console.log("Starting checkout process...");
    const { data, error } = await supabase.functions.invoke<{ url: string }>('create-checkout');
    
    if (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
    
    if (!data?.url) {
      throw new Error("No checkout URL returned");
    }
    
    console.log("Checkout URL received:", data.url);
    return data.url;
  } catch (error) {
    console.error("Failed to start checkout process:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error creating checkout session");
  }
};

export const openCustomerPortal = async (): Promise<string> => {
  try {
    console.log("Opening customer portal...");
    const { data, error } = await supabase.functions.invoke<{ url: string }>('customer-portal');
    
    if (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
    
    if (!data?.url) {
      throw new Error("No customer portal URL returned");
    }
    
    console.log("Customer portal URL received:", data.url);
    return data.url;
  } catch (error) {
    console.error("Failed to open customer portal:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error opening customer portal");
  }
};

// A hook could be built on top of this function to track subscription state
export const isFeatureEnabled = async (feature: string): Promise<boolean> => {
  try {
    // First check if the feature is gated behind a subscription
    const { data: settingsData } = await supabase.rpc('get_admin_settings');
    
    // Parse settings
    const settings: Record<string, any> = {};
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
    
    // Check if feature requires subscription
    const badgesEnabled = settings['badges_enabled'];
    
    // If the feature is badges and badges are disabled globally, return false
    if (feature === 'badges' && badgesEnabled === false) {
      return false;
    }
    
    // Check user's subscription status
    const subscriptionStatus = await checkUserSubscription();
    
    // If the user has an active subscription, enable the feature
    if (subscriptionStatus.subscribed) {
      return true;
    }
    
    // Default to disabled for premium features
    return false;
  } catch (error) {
    console.error(`Error checking if feature ${feature} is enabled:`, error);
    return false;
  }
};
