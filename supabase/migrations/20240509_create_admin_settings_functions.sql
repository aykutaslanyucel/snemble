
-- Function to get all admin settings
CREATE OR REPLACE FUNCTION public.get_admin_settings()
RETURNS TABLE(key text, value text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT setting_key as key, setting_value::text as value 
  FROM public.admin_settings;
$$;

-- Function to update admin setting
CREATE OR REPLACE FUNCTION public.update_admin_setting(p_key text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_settings (setting_key, setting_value, updated_at)
  VALUES (p_key, p_value::jsonb, NOW())
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = p_value::jsonb,
    updated_at = NOW();
END;
$$;
