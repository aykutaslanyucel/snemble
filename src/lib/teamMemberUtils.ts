
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Convert Supabase team member to app TeamMember
export const mapDbToTeamMember = (dbTeamMember: any): TeamMember => {
  return {
    id: dbTeamMember.id,
    name: dbTeamMember.name,
    position: dbTeamMember.position,
    status: dbTeamMember.status as TeamMemberStatus,
    projects: dbTeamMember.projects || [],
    lastUpdated: new Date(dbTeamMember.last_updated),
    user_id: dbTeamMember.user_id,
    role: dbTeamMember.role || 'user' // Default role
  };
};

// Convert app TeamMember to Supabase format
export const mapTeamMemberToDb = (teamMember: TeamMember) => {
  return {
    id: teamMember.id,
    name: teamMember.name,
    position: teamMember.position,
    status: teamMember.status,
    projects: teamMember.projects,
    last_updated: teamMember.lastUpdated,
    user_id: teamMember.user_id,
    role: teamMember.role
  };
};

// Fetch all team members
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }

  return data ? data.map(mapDbToTeamMember) : [];
};

// Add a new team member
export const addTeamMember = async (teamMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  const newTeamMember = {
    ...teamMember,
    last_updated: new Date()
  };

  const { data, error } = await supabase
    .from('team_members')
    .insert([newTeamMember])
    .select()
    .single();

  if (error) {
    console.error('Error adding team member:', error);
    throw error;
  }

  return mapDbToTeamMember(data);
};

// Update a team member
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  const dbUpdates: any = {
    ...updates,
    last_updated: new Date()
  };

  if ('lastUpdated' in dbUpdates) {
    delete dbUpdates.lastUpdated;
  }

  if ('projects' in updates) {
    dbUpdates.projects = updates.projects;
  }

  const { data, error } = await supabase
    .from('team_members')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team member:', error);
    throw error;
  }

  return mapDbToTeamMember(data);
};

// Delete a team member
export const deleteTeamMember = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Check if current user can edit a team member
export const canEditTeamMember = (
  teamMember: TeamMember, 
  currentUserId: string | undefined, 
  isAdmin: boolean
): boolean => {
  if (!currentUserId) return false;
  if (isAdmin) return true;
  return teamMember.user_id === currentUserId;
};

// Set up real-time subscription
export const subscribeToTeamMembers = (
  callback: (teamMembers: TeamMember[]) => void
): (() => void) => {
  // First, fetch all team members
  fetchTeamMembers()
    .then(callback)
    .catch(err => console.error('Error in initial team members fetch:', err));
  
  // Then set up real-time changes
  const subscription = supabase
    .channel('team_members_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'team_members' }, 
      async () => {
        // Re-fetch all team members when any change occurs
        try {
          const updatedMembers = await fetchTeamMembers();
          callback(updatedMembers);
        } catch (error) {
          console.error('Error refreshing team members:', error);
        }
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};
