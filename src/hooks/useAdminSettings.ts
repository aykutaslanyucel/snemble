
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Define admin settings interface
interface AdminSettings {
  badges_enabled?: boolean;
  stripe_enabled?: boolean;
  stripe_api_key?: string;
  stripe_price_id?: string;
  stripe_product_name?: string;
  stripe_price_amount?: number;
  stripe_test_mode?: boolean;
  [key: string]: any;
}

// Define the type for the response from the RPC function
interface AdminSettingRecord {
  key: string;
  value: string;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching admin settings...");
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn("Admin settings fetch timeout after 10s");
        setLoading(false);
        setSettings({ badges_enabled: true }); // Default fallback value
        sonnerToast.error("Settings fetch timeout", {
          description: "Using default settings"
        });
      }, 10000);
      
      // Use the rpc function to get admin settings
      const { data, error } = await supabase
        .rpc('get_admin_settings');
        
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
        
      if (error) {
        console.error("Error fetching admin settings:", error);
        throw error;
      }
      
      console.log("Admin settings data:", data);
      
      // Transform array of settings to an object
      const settingsObj: AdminSettings = {};
      if (data && Array.isArray(data)) {
        data.forEach((setting: AdminSettingRecord) => {
          try {
            // Handle different value types
            if (typeof setting.value === 'string') {
              if (setting.value === 'true' || setting.value === 'false') {
                settingsObj[setting.key] = setting.value === 'true';
              } else if (!isNaN(Number(setting.value)) && setting.key.includes('amount')) {
                // Special handling for amount fields - store as numbers
                settingsObj[setting.key] = Number(setting.value);
              } else {
                try {
                  // Try to parse as JSON
                  const parsedValue = JSON.parse(setting.value);
                  settingsObj[setting.key] = parsedValue;
                } catch (e) {
                  // Not valid JSON, use as string
                  settingsObj[setting.key] = setting.value;
                }
              }
            } else {
              settingsObj[setting.key] = setting.value;
            }
          } catch (e) {
            // If parsing fails, use as is
            settingsObj[setting.key] = setting.value;
          }
        });
      }
      
      // If no badges_enabled setting found, default to true to prevent UI issues
      if (settingsObj.badges_enabled === undefined) {
        settingsObj.badges_enabled = true;
      }
      
      console.log("Parsed settings object:", settingsObj);
      setSettings(settingsObj);
    } catch (error) {
      console.error("Error in fetchSettings:", error);
      setError(error as Error);
      // Use default values to prevent UI breakage
      setSettings({ badges_enabled: true });
      toast({
        title: "Settings Error",
        description: "Could not load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('admin_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_settings' },
        (payload) => {
          console.log("Admin settings table changed:", payload);
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  // Update a setting
  const updateSetting = async (key: string, value: any) => {
    try {
      setLoading(true);
      console.log(`Updating setting ${key} to:`, value);
      
      // Convert value to string if it's an object or boolean
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : 
                         typeof value === 'boolean' ? String(value) : 
                         String(value);
      
      const { error } = await supabase.rpc('update_admin_setting', {
        p_key: key,
        p_value: stringValue
      });
        
      if (error) {
        console.error(`Error updating ${key} setting:`, error);
        throw error;
      }
      
      console.log(`Setting ${key} updated successfully`);
      
      toast({
        title: "Setting updated",
        description: `The ${key} setting has been updated.`,
      });
      
      // Update local state optimistically
      setSettings(prev => prev ? { ...prev, [key]: value } : { [key]: value });
    } catch (error) {
      console.error(`Error updating ${key} setting:`, error);
      toast({
        title: "Error",
        description: `Failed to update the ${key} setting.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    settings, 
    loading, 
    error,
    updateSetting, 
    fetchSettings,
    // Provide a safe way to access settings that won't throw errors
    getSetting: (key: string, defaultValue: any = undefined) => {
      return settings?.[key] ?? defaultValue;
    }
  };
}
