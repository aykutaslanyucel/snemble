
import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMember } from "@/types/TeamMemberTypes";
import { 
  createTeamMember, 
  updateTeamMember, 
  deleteTeamMember,
  ensureAdminUser
} from "@/utils/teamMemberUtils";
import {
  filterMembersBySearch,
  getAvailableMembers,
  getActiveProjects,
  getProjectsWithMembers
} from "@/utils/teamMemberFilters";

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Derived state using the filter utilities
  const filteredMembers = filterMembersBySearch(members, searchQuery);
  const availableMembers = getAvailableMembers(members);
  const activeProjects = getActiveProjects(members);
  const projectsWithMembers = getProjectsWithMembers(members, activeProjects);

  // Fetch team members data
  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    const q = isAdmin 
      ? query(collection(db, "teamMembers")) 
      : query(collection(db, "teamMembers"), where("userId", "==", user.id));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMembers: TeamMember[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMembers.push({
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        } as TeamMember);
      });
      
      // Sort members by name
      fetchedMembers.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(fetchedMembers);
      setIsLoading(false);

      // Ensure admin user exists with correct role
      await ensureAdminUser(fetchedMembers, isAdmin);
    }, (error) => {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Could not load team members data",
        variant: "destructive"
      });
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, isAdmin, toast]);

  // Add a new team member
  const handleAddMember = async () => {
    if (!user) return;
    
    try {
      await createTeamMember(user.id);
      
      toast({
        title: "Team member added",
        description: "The new team member has been added successfully",
      });
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    }
  };

  // Update a team member
  const handleUpdateMember = async (id: string, field: string, value: any) => {
    try {
      await updateTeamMember(id, field, value);
      
      toast({
        title: "Team member updated",
        description: "The team member has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating team member:", error);
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    }
  };

  // Delete a team member
  const handleDeleteMember = async (id: string) => {
    try {
      await deleteTeamMember(id);
      
      toast({
        title: "Team member deleted",
        description: "The team member has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    }
  };

  return {
    members,
    filteredMembers,
    availableMembers,
    activeProjects,
    projectsWithMembers,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  };
}
