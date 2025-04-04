
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/integrations/firebase/client";

export interface UseTeamMembersResult {
  members: TeamMember[];
  filteredMembers: TeamMember[];
  availableMembers: TeamMember[];
  activeProjects: string[];
  projectsWithMembers: Map<string, TeamMember[]>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAddMember: () => void;
  handleUpdateMember: (id: string, field: string, value: any) => void;
  handleDeleteMember: (id: string) => void;
}

export function useTeamMembers(): UseTeamMembersResult {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { isAdmin, currentUserId, user, profile } = useAuth();

  // Fetch team members from Firestore
  useEffect(() => {
    const teamMembersRef = collection(db, "teamMembers");
    
    // Listen for real-time updates to the teamMembers collection
    const unsubscribe = onSnapshot(teamMembersRef, (snapshot) => {
      const teamMembersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          position: data.position,
          status: data.status,
          projects: data.projects,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          userId: data.userId,
          role: data.role,
          customization: data.customization
        } as TeamMember;
      });
      setMembers(teamMembersData);
    }, (error) => {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    });
    
    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const activeProjects = useMemo(() => {
    const projectSet = new Set<string>();
    members.forEach(member => {
      member.projects.forEach(project => projectSet.add(project));
    });
    return Array.from(projectSet);
  }, [members]);

  const projectsWithMembers = useMemo(() => {
    const projectMap = new Map<string, TeamMember[]>();
    
    activeProjects.forEach(project => {
      const assignedMembers = members.filter(member => 
        member.projects.includes(project)
      );
      projectMap.set(project, assignedMembers);
    });
    
    return projectMap;
  }, [activeProjects, members]);

  const availableMembers = useMemo(() => {
    return members.filter(member => member.status === 'available' || member.status === 'someAvailability');
  }, [members]);

  const handleAddMember = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a team member.",
        variant: "destructive"
      });
      return;
    }
    
    const memberName = profile?.name || user?.email?.split('@')[0] || "New Member";
    
    try {
      const newMember = {
        name: memberName,
        position: "Team Member",
        status: "available",
        projects: [],
        lastUpdated: new Date(),
        userId: currentUserId,
        role: profile?.role || "user"
      };
      
      await addDoc(collection(db, "teamMembers"), newMember);
      
      toast({
        title: "Team member added",
        description: "New team member has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMember = async (id: string, field: string, value: any) => {
    const memberToUpdate = members.find(member => member.id === id);
    
    // Check if user can update this member
    if (!memberToUpdate || 
        (!isAdmin && memberToUpdate.userId !== currentUserId)) {
      toast({
        title: "Permission denied",
        description: "You can only update your own team members.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const memberRef = doc(db, "teamMembers", id);
      const updateData: any = {
        [field]: field === 'projects' 
          ? (typeof value === 'string' 
            ? value.split(/[;,]/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
            : value)
          : value,
        lastUpdated: new Date()
      };
      
      await updateDoc(memberRef, updateData);
      
      if (field === 'projects') {
        toast({
          title: "Projects updated",
          description: "Team member's projects have been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      toast({
        title: "Error",
        description: "Failed to update team member.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    const memberToDelete = members.find(member => member.id === id);
    
    // Check if user can delete this member
    if (!memberToDelete || 
        (!isAdmin && memberToDelete.userId !== currentUserId)) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own team members.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteDoc(doc(db, "teamMembers", id));
      
      toast({
        title: "Team member removed",
        description: "Team member has been removed successfully.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return {
    members,
    filteredMembers,
    availableMembers,
    activeProjects,
    projectsWithMembers,
    searchQuery,
    setSearchQuery,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  };
}
