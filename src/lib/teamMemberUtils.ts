import { TeamMember, TeamMemberStatus, TeamMemberRole } from "@/types/TeamMemberTypes";
import { supabase } from "@/integrations/supabase/client";
import { validate as isValidUUID } from 'uuid';
import { Json } from "@/integrations/supabase/types";

// Format name from email
export const formatNameFromEmail = (email: string): string => {
  const namePart = email.split('@')[0];
  return namePart
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

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
    role: dbTeamMember.role || 'user',
    customization: dbTeamMember.customization
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
    last_updated: teamMember.lastUpdated ? teamMember.lastUpdated.toISOString() : new Date().toISOString(),
    user_id: teamMember.user_id,
    role: teamMember.role,
    customization: teamMember.customization as unknown as Json
  };
};

// Fetch all team members
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  console.log("Fetching team members...");
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} team members`);
  return data ? data.map(mapDbToTeamMember) : [];
};

// Add a new team member
export const addTeamMember = async (teamMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  // Validate user_id is a valid UUID
  if (teamMember.user_id && !isValidUUID(teamMember.user_id)) {
    console.error(`Invalid UUID format for user_id: ${teamMember.user_id}`);
    throw new Error(`Invalid UUID format for user_id: ${teamMember.user_id}`);
  }
  
  console.log(`Adding team member for user: ${teamMember.user_id || 'unknown'}`);
  
  const newTeamMemberData = {
    name: teamMember.name,
    position: teamMember.position,
    status: teamMember.status,
    projects: teamMember.projects || [],
    user_id: teamMember.user_id,
    role: teamMember.role,
    customization: teamMember.customization as unknown as Json
    // last_updated will be set by default in the database
  };

  const { data, error } = await supabase
    .from('team_members')
    .insert(newTeamMemberData)
    .select()
    .single();

  if (error) {
    console.error('Error adding team member:', error);
    throw error;
  }

  console.log(`Successfully added team member with ID: ${data.id}`);
  return mapDbToTeamMember(data);
};

// Update a team member with improved error handling and debugging
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  console.info(`Updating team member with ID: ${id}`, updates);
  
  // Map updates to database format
  const dbUpdates: any = {};
  
  if ('name' in updates) dbUpdates.name = updates.name;
  if ('position' in updates) dbUpdates.position = updates.position;
  if ('status' in updates) dbUpdates.status = updates.status;
  if ('projects' in updates) dbUpdates.projects = updates.projects;
  if ('role' in updates) dbUpdates.role = updates.role;
  if ('user_id' in updates) dbUpdates.user_id = updates.user_id;
  
  // Fix the customization type casting
  if ('customization' in updates) {
    dbUpdates.customization = updates.customization as unknown as Json;
  }
  
  // Update last_updated timestamp to trigger UI refresh
  dbUpdates.last_updated = new Date().toISOString();
  
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      console.error('Error details:', JSON.stringify(error));
      console.error('Update payload:', JSON.stringify(dbUpdates));
      console.error('Member ID:', id);
      throw error;
    }

    console.info(`Successfully updated team member with ID: ${id}`);
    return mapDbToTeamMember(data);
  } catch (error: any) {
    console.error('Exception in updateTeamMember:', error?.message || error);
    console.error('Stack trace:', error?.stack);
    throw error;
  }
};

// Delete a team member
export const deleteTeamMember = async (id: string): Promise<void> => {
  console.log(`Deleting team member with ID: ${id}`);
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
  
  console.log(`Successfully deleted team member with ID: ${id}`);
};

// Simplified permission check with improved logging
export const canEditTeamMember = (
  teamMember: TeamMember, 
  currentUserId: string | undefined, 
  isAdmin: boolean
): boolean => {
  if (!currentUserId) {
    console.log("Cannot edit: No current user ID provided");
    return false;
  }
  
  if (isAdmin) {
    console.log(`User ${currentUserId} can edit member ${teamMember.id} (admin privileges)`);
    return true;
  }
  
  const canEdit = teamMember.user_id === currentUserId;
  console.log(`User ${currentUserId} ${canEdit ? 'can' : 'cannot'} edit member ${teamMember.id} (user_id: ${teamMember.user_id})`);
  
  return canEdit;
};

// Get or create a team member for a user with position directly from seniority
export const getOrCreateTeamMemberForUser = async (userId: string, email: string, role: string): Promise<TeamMember> => {
  console.log(`Getting or creating team member for user: ${userId}, email: ${email}, role: ${role}`);
  
  if (!userId || !isValidUUID(userId)) {
    console.error(`Invalid UUID format for userId: ${userId}`);
    throw new Error(`Invalid UUID format for userId: ${userId}`);
  }
  
  // First check if a team member already exists for this user
  const { data: existingMember, error: fetchError } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking for existing team member:', fetchError);
    throw fetchError;
  }

  if (existingMember) {
    console.log(`Found existing team member for user ${userId}`);
    return mapDbToTeamMember(existingMember);
  }

  // Get the user's seniority directly from profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('seniority')
    .eq('id', userId)
    .maybeSingle();
  
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  // Format name from email
  const formattedName = formatNameFromEmail(email);
  
  // Use seniority directly as position, with fallback to Junior Associate
  const position = profileData?.seniority || "Junior Associate";
  
  // Convert role string to TeamMemberRole type
  const memberRole: TeamMemberRole = (role === 'admin' || role === 'user' || role === 'premium') 
    ? role as TeamMemberRole 
    : 'user';
  
  const newTeamMember: Omit<TeamMember, 'id'> = {
    name: formattedName,
    position: position, // Use seniority directly as position
    status: 'available',
    projects: [],
    lastUpdated: new Date(),
    user_id: userId,
    role: memberRole
  };

  try {
    console.log(`Creating new team member for user ${userId} with position: ${position}`);
    return await addTeamMember(newTeamMember);
  } catch (error) {
    console.error(`Failed to create team member for user ${userId}:`, error);
    throw error;
  }
};

// Ensure all users have team member entries
export const ensureAllUsersHaveTeamMembers = async (): Promise<void> => {
  console.log("Ensuring all users have team member entries...");
  
  try {
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log("No profiles found to create team members for");
      return;
    }
    
    // For each profile, ensure a team member exists
    for (const profile of profiles) {
      try {
        await getOrCreateTeamMemberForUser(
          profile.id, 
          profile.email, 
          profile.role || 'user'
        );
      } catch (error) {
        console.error(`Failed to ensure team member for user ${profile.id}:`, error);
        // Continue with next profile even if one fails
      }
    }
    
    console.log(`Completed team member verification for ${profiles.length} profiles`);
  } catch (error) {
    console.error("Error in ensureAllUsersHaveTeamMembers:", error);
    throw error;
  }
};

// Set up real-time subscription with improved error handling and timeout protection
export const subscribeToTeamMembers = (
  callback: (teamMembers: TeamMember[]) => void
): (() => void) => {
  // Add timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    console.warn("Team members fetch is taking too long, providing empty data");
    callback([]);
  }, 10000); // 10 seconds timeout

  // First, ensure all users have team members then fetch all team members
  ensureAllUsersHaveTeamMembers()
    .then(() => fetchTeamMembers())
    .then(members => {
      clearTimeout(timeoutId); // Clear timeout on success
      callback(members);
    })
    .catch(err => {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('Error in initial team members fetch:', err);
      // Provide empty array as fallback to prevent UI crashes
      callback([]);
    });
  
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
