
-- Function to create admin insert policy for profiles
CREATE OR REPLACE FUNCTION public.create_admin_insert_policy_for_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'admins_can_insert_profiles'
  ) THEN
    -- Create the policy if it doesn't exist
    EXECUTE 'CREATE POLICY "admins_can_insert_profiles" ON public.profiles
              FOR INSERT
              TO authenticated
              WITH CHECK (EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = ''admin''
              ))';
  END IF;
END;
$$;

-- Function to create admin insert policy for team_members
CREATE OR REPLACE FUNCTION public.create_admin_insert_policy_for_team_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'team_members' 
    AND policyname = 'admins_can_insert_team_members'
  ) THEN
    -- Create the policy if it doesn't exist
    EXECUTE 'CREATE POLICY "admins_can_insert_team_members" ON public.team_members
              FOR INSERT
              TO authenticated
              WITH CHECK (EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = ''admin''
              ))';
  END IF;
END;
$$;
