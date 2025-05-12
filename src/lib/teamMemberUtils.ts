import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { User } from "@supabase/supabase-js";

/**
 * Fetch all team members from Supabase
 */
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase.from("team_members").select("*");

  if (error) {
    console.error("Error fetching team members:", error);
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  // Map the data to our TeamMember type
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    position: item.position,
    status: item.status as TeamMemberStatus,
    projects: item.projects || [],
    lastUpdated: new Date(item.last_updated),
    user_id: item.user_id,
    role: item.role,
    customization: item.customization,
    vacationStart: item.vacation_start ? new Date(item.vacation_start) : undefined,
    vacationEnd: item.vacation_end ? new Date(item.vacation_end) : undefined,
    isOnVacation: item.is_on_vacation || false
  }));
};

/**
 * Set up real-time subscription to team members
 */
export const subscribeToTeamMembers = (callback: (members: TeamMember[]) => void) => {
  const subscription = supabase
    .channel("public:team_members")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "team_members" },
      async () => {
        try {
          const updatedMembers = await fetchTeamMembers();
          callback(updatedMembers);
        } catch (error) {
          console.error("Error refreshing team members after change:", error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

/**
 * Update a team member
 */
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
  const updateData: any = {};
  
  // Map our TeamMember fields to database columns
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.position !== undefined) updateData.position = updates.position;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.projects !== undefined) updateData.projects = updates.projects;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.customization !== undefined) updateData.customization = updates.customization;
  if (updates.vacationStart !== undefined) updateData.vacation_start = updates.vacationStart;
  if (updates.vacationEnd !== undefined) updateData.vacation_end = updates.vacationEnd;
  if (updates.isOnVacation !== undefined) updateData.is_on_vacation = updates.isOnVacation;

  const { error } = await supabase
    .from("team_members")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating team member:", error);
    throw new Error(`Failed to update team member: ${error.message}`);
  }
};

/**
 * Delete a team member
 */
export const deleteTeamMember = async (id: string) => {
  const { error } = await supabase.from("team_members").delete().eq("id", id);

  if (error) {
    console.error("Error deleting team member:", error);
    throw new Error(`Failed to delete team member: ${error.message}`);
  }
};

/**
 * Add a team member
 */
export const addTeamMember = async (member: Omit<TeamMember, "id" | "lastUpdated">) => {
  // Transform to database format
  const newMember = {
    name: member.name,
    position: member.position,
    status: member.status,
    projects: member.projects || [],
    user_id: member.user_id,
    role: member.role,
    customization: member.customization,
    vacation_start: member.vacationStart?.toISOString(),
    vacation_end: member.vacationEnd?.toISOString(),
    is_on_vacation: member.isOnVacation || false
  };

  const { data, error } = await supabase
    .from("team_members")
    .insert(newMember)
    .select();

  if (error) {
    console.error("Error adding team member:", error);
    throw new Error(`Failed to add team member: ${error.message}`);
  }

  return data[0];
};

/**
 * Check if the current user can edit a team member
 */
export const canEditTeamMember = async (
  memberId: string,
  currentUserId?: string
): Promise<boolean> => {
  if (!currentUserId) return false;

  // First check if user is admin
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUserId)
    .single();

  if (profileData?.role === "admin") {
    return true;
  }

  // Otherwise, check if the team member belongs to the user
  const { data } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("id", memberId)
    .single();

  return data?.user_id === currentUserId;
};

/**
 * Ensure a team member exists for the current user
 */
export const getOrCreateTeamMemberForUser = async (
  userId: string,
  email: string,
  role: string = 'user'
): Promise<TeamMember> => {
  try {
    // First, check if a team member already exists for this user
    const { data: existingMembers, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error checking for existing member:", fetchError);
      throw new Error(`Failed to check for existing member: ${fetchError.message}`);
    }

    if (existingMembers && existingMembers.length > 0) {
      // Return the existing member data
      const member = existingMembers[0];
      return {
        id: member.id,
        name: member.name,
        position: member.position,
        status: member.status as TeamMemberStatus,
        projects: member.projects || [],
        lastUpdated: new Date(member.last_updated),
        user_id: member.user_id,
        role: member.role,
        customization: member.customization,
        vacationStart: member.vacation_start ? new Date(member.vacation_start) : undefined,
        vacationEnd: member.vacation_end ? new Date(member.vacation_end) : undefined,
        isOnVacation: member.is_on_vacation || false
      };
    }

    // Get the profile for this user to get their name
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
      // Continue anyway with email as name
    }

    // Create a new team member
    const username = profileData?.name || email.split('@')[0];
    const defaultPosition = role === 'admin' ? 'Team Lead' : 'Team Member';

    const newMember = {
      name: username,
      position: defaultPosition,
      status: 'available' as TeamMemberStatus,
      projects: [],
      user_id: userId,
      role: role,
      is_on_vacation: false
    };

    const { data: createdMember, error: createError } = await supabase
      .from("team_members")
      .insert(newMember)
      .select()
      .single();

    if (createError) {
      console.error("Error creating team member:", createError);
      throw new Error(`Failed to create team member: ${createError.message}`);
    }

    if (!createdMember) {
      throw new Error("Failed to create team member: No data returned");
    }

    return {
      id: createdMember.id,
      name: createdMember.name,
      position: createdMember.position,
      status: createdMember.status as TeamMemberStatus,
      projects: createdMember.projects || [],
      lastUpdated: new Date(createdMember.last_updated),
      user_id: createdMember.user_id,
      role: createdMember.role,
      customization: createdMember.customization,
      vacationStart: createdMember.vacation_start ? new Date(createdMember.vacation_start) : undefined,
      vacationEnd: createdMember.vacation_end ? new Date(createdMember.vacation_end) : undefined,
      isOnVacation: createdMember.is_on_vacation || false
    };
  } catch (error) {
    console.error("Error in getOrCreateTeamMemberForUser:", error);
    throw error;
  }
};
