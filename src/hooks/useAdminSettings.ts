
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define admin settings interface
interface AdminSettings {
  badges_enabled?: boolean;
  stripe_enabled?: boolean;
  [key: string]: any;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use raw SQL query instead of the problematic .from() call
        const { data, error } = await supabase
          .rpc('get_admin_settings');
          
        if (error) throw error;
        
        // Transform array of settings to an object
        const settingsObj: AdminSettings = {};
        if (data) {
          data.forEach((setting: {key: string, value: any}) => {
            try {
              // Handle different value types
              if (typeof setting.value === 'string') {
                if (setting.value === 'true' || setting.value === 'false') {
                  settingsObj[setting.key] = setting.value === 'true';
                } else {
                  try {
                    settingsObj[setting.key] = JSON.parse(setting.value);
                  } catch (e) {
                    settingsObj[setting.key] = setting.value;
                  }
                }
              } else {
                settingsObj[setting.key] = setting.value;
              }
            } catch (e) {
              // If it's not a valid JSON, use as is
              settingsObj[setting.key] = setting.value;
            }
          });
        }
        
        setSettings(settingsObj);
      } catch (error) {
        console.error("Error fetching admin settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('admin_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update a setting
  const updateSetting = async (key: string, value: any) => {
    try {
      setLoading(true);
      
      // Convert value to string if it's an object or boolean
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : 
                         typeof value === 'boolean' ? String(value) : value;
      
      const { error } = await supabase.rpc('update_admin_setting', {
        p_key: key,
        p_value: stringValue
      });
        
      if (error) throw error;
      
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

  return { settings, loading, updateSetting };
}
