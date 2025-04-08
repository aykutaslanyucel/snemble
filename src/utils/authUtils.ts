
import { User, UserRole } from "@/types/AuthTypes";
import { supabase } from "@/integrations/supabase/client";

// Function to format email as name
export const formatEmailAsName = (email: string) => {
  const namePart = email.split('@')[0];
  return namePart
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Get user profile from Supabase
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || "",
        role: (profile.role as UserRole) || "user",
        position: profile.seniority || "",
        seniority: profile.seniority,
        avatar_url: profile.avatar_url
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Create a team member card
export const createTeamMemberCard = async (userId: string, name: string, position: string, role: UserRole = "user") => {
  try {
    const newMember = {
      id: userId,
      name: name,
      position: position,
      status: "available",
      projects: [],
      lastUpdated: new Date(),
      role: role,
      userId: userId
    };
    
    const { error } = await supabase
      .from('teamMembers')
      .insert(newMember);
      
    if (error) {
      console.error("Error inserting team member:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error creating team member card:", error);
    return false;
  }
};
