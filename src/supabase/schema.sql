
-- Create tables for our team capacity management app

-- Users table to store user data and roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own data" ON public.users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all users data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Team members table to store member information
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'someAvailability', 'busy', 'seriouslyBusy', 'away')),
  projects TEXT[] DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT NULL,
  customization JSONB DEFAULT NULL
);

-- Add RLS policies for the team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view all team members" ON public.team_members
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can update their own team member record" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any team member" ON public.team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Users can insert their own team member record" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert any team member" ON public.team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Users can delete their own team member record" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any team member" ON public.team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add RLS policies for the announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view announcements" ON public.announcements
  FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Only admins can update announcements" ON public.announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Only admins can delete announcements" ON public.announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_updated timestamp when team_member is updated
CREATE TRIGGER update_team_member_last_updated
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp when user is updated
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
