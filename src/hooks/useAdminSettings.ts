
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*');
          
        if (error) throw error;
        
        // Transform array of settings to an object
        const settingsObj: AdminSettings = {};
        if (data) {
          data.forEach(setting => {
            try {
              // Handle different value types
              if (typeof setting.setting_value === 'string') {
                if (setting.setting_value === 'true' || setting.setting_value === 'false') {
                  settingsObj[setting.setting_key] = setting.setting_value === 'true';
                } else {
                  settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
                }
              } else {
                settingsObj[setting.setting_key] = setting.setting_value;
              }
            } catch (e) {
              // If it's not a valid JSON, use as is
              settingsObj[setting.setting_key] = setting.setting_value;
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
  }, [toast]);

  // Update a setting
  const updateSetting = async (key: string, value: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: typeof value === 'object' ? value : JSON.stringify(value)
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
