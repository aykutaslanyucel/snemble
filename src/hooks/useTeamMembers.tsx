
import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query) ||
      member.projects.some((project) => project.toLowerCase().includes(query))
    );
  });

  // Get available members (available or some availability)
  const availableMembers = members.filter((member) => 
    member.status === "available" || member.status === "someAvailability"
  );

  // Get all active projects
  const activeProjects = [...new Set(members.flatMap((member) => member.projects))].sort();

  // Map projects to members
  const projectsWithMembers = activeProjects.map((project) => {
    const assignedMembers = members.filter((member) => 
      member.projects.includes(project)
    );
    return {
      name: project,
      members: assignedMembers,
      capacity: calculateCapacity(assignedMembers)
    };
  });

  function calculateCapacity(teamMembers: TeamMember[]) {
    if (teamMembers.length === 0) return 0;
    
    let availableCount = 0;
    let partialCount = 0;
    
    teamMembers.forEach(member => {
      if (member.status === "available") {
        availableCount++;
      } else if (member.status === "someAvailability") {
        partialCount++;
      }
    });
    
    return Math.round(((availableCount + (partialCount * 0.5)) / teamMembers.length) * 100);
  }

  // Fetch team members data
  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    const q = isAdmin 
      ? query(collection(db, "teamMembers")) 
      : query(collection(db, "teamMembers"), where("userId", "==", user.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

      // Ensure admin user has admin role
      const adminUser = fetchedMembers.find(member => member.id === "b82c63f6-1aa9-4150-a857-eeac0b9c921b");
      if (adminUser && adminUser.role !== "admin") {
        updateDoc(doc(db, "teamMembers", "b82c63f6-1aa9-4150-a857-eeac0b9c921b"), {
          role: "admin"
        });
      }

      // Create admin user team member if doesn't exist
      if (!adminUser && isAdmin) {
        const adminMember = {
          id: "b82c63f6-1aa9-4150-a857-eeac0b9c921b",
          name: "Admin User",
          position: "Admin",
          status: "available" as TeamMemberStatus,
          projects: [],
          lastUpdated: new Date(),
          role: "admin",
          userId: "b82c63f6-1aa9-4150-a857-eeac0b9c921b"
        };
        setDoc(doc(db, "teamMembers", "b82c63f6-1aa9-4150-a857-eeac0b9c921b"), adminMember);
      }
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
      const newId = uuidv4();
      const newMember: TeamMember = {
        id: newId,
        name: "New Team Member",
        position: "Position",
        status: "available",
        projects: [],
        lastUpdated: new Date(),
        userId: user.id
      };
      
      await setDoc(doc(db, "teamMembers", newId), newMember);
      
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
      const memberRef = doc(db, "teamMembers", id);
      
      // Handle projects update
      if (field === "projects" && typeof value === "string") {
        const projects = value.split(";").map(p => p.trim()).filter(p => p);
        await updateDoc(memberRef, {
          projects: projects,
          lastUpdated: new Date()
        });
      } 
      // Handle customization update
      else if (field === "customization") {
        await updateDoc(memberRef, {
          customization: value,
          lastUpdated: new Date()
        });
      } 
      // Handle normal field updates
      else {
        await updateDoc(memberRef, {
          [field]: value,
          lastUpdated: new Date()
        });
      }
      
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
      await deleteDoc(doc(db, "teamMembers", id));
      
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
