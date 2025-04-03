
import { useState, useMemo } from "react";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

// Initial members with explicit user associations
const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    position: "Senior Developer",
    status: "available",
    projects: ["Project Alpha", "Project Beta"],
    lastUpdated: new Date(),
    userId: "1", // Assigning user ID to track ownership
  },
  {
    id: "2",
    name: "Sarah Smith",
    position: "UX Designer",
    status: "busy",
    projects: ["Project Gamma"],
    lastUpdated: new Date(),
    userId: "2", // Assigning user ID to track ownership
  },
  {
    id: "3",
    name: "Mike Brown",
    position: "Product Manager",
    status: "away",
    projects: ["Project Delta", "Project Epsilon"],
    lastUpdated: new Date(),
    userId: "3", // Assigning user ID to track ownership
  },
];

export function useTeamMembers(): UseTeamMembersResult {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { isAdmin, currentUserId } = useAuth();

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

  const handleAddMember = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a team member.",
        variant: "destructive"
      });
      return;
    }
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: "New Member",
      position: "Position",
      status: "available",
      projects: [],
      lastUpdated: new Date(),
      userId: currentUserId,  // Associate with current user
    };
    
    setMembers([newMember, ...members]);
    toast({
      title: "Team member added",
      description: "New team member has been added successfully.",
    });
  };

  const handleUpdateMember = (id: string, field: string, value: any) => {
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
    
    setMembers(
      members.map((member) =>
        member.id === id
          ? { 
              ...member, 
              [field]: field === 'projects' 
                ? (typeof value === 'string' 
                  ? value.split(/[;,]/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
                  : value)
                : value,
              lastUpdated: new Date() 
            }
          : member
      )
    );
    
    if (field === 'projects') {
      toast({
        title: "Projects updated",
        description: "Team member's projects have been updated successfully.",
      });
    }
  };

  const handleDeleteMember = (id: string) => {
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
    
    setMembers(members.filter((member) => member.id !== id));
    toast({
      title: "Team member removed",
      description: "Team member has been removed successfully.",
      variant: "destructive",
    });
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
