
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { TeamMembers } from "@/components/TeamMembers";
import { ProjectHeatmap } from "@/components/ProjectHeatmap";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchAndActions } from "@/components/SearchAndActions";
import { WorkloadDashboard } from "@/components/WorkloadDashboard";
import { ProjectList } from "@/components/ProjectList";
import { AvailableMembersList } from "@/components/AvailableMembersList";
import { 
  fetchTeamMembers, 
  updateTeamMember, 
  deleteTeamMember, 
  addTeamMember, 
  subscribeToTeamMembers,
  canEditTeamMember,
  getOrCreateTeamMemberForUser 
} from "@/lib/teamMemberUtils";
import { toast as sonnerToast } from "sonner";

export default function Index() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin, logout } = useAuth();

  // Fetch members and set up subscription and ensure the current user has a team member
  useEffect(() => {
    setLoading(true);
    
    // Set up a real-time subscription to team members
    const unsubscribe = subscribeToTeamMembers(updatedMembers => {
      setMembers(updatedMembers);
      setLoading(false);
    });
    
    // Check if current user has a team member
    if (user) {
      getOrCreateTeamMemberForUser(user.id, user.email, isAdmin ? 'admin' : 'user')
        .then(() => {
          console.log("User team member verified");
        })
        .catch(error => {
          console.error("Error ensuring user has team member:", error);
          toast({
            title: "Error",
            description: "Failed to initialize your team profile. Please refresh.",
            variant: "destructive",
          });
        });
    }
    
    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [user, isAdmin, toast]);

  // Active projects calculation
  const activeProjects = useMemo(() => {
    const projectSet = new Set<string>();
    members.forEach(member => {
      member.projects.forEach(project => projectSet.add(project));
    });
    return Array.from(projectSet);
  }, [members]);

  // Project-member mapping calculation
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

  // Available members calculation
  const availableMembers = useMemo(() => {
    return members.filter(member => member.status === 'available' || member.status === 'someAvailability');
  }, [members]);

  const handleAddMember = async () => {
    if (!user) return;
    
    try {
      const newMember = {
        name: "New Team Member",
        position: "Position",
        status: "available" as const,
        projects: [],
        lastUpdated: new Date(),
        user_id: user.id,
      };
      
      await addTeamMember(newMember);
      
      toast({
        title: "Team member added",
        description: "New team member has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async (id: string, field: string, value: any) => {
    try {
      // Find the member to update
      const memberToUpdate = members.find(m => m.id === id);
      
      if (!memberToUpdate) {
        throw new Error("Member not found");
      }
      
      // Debug information - detailed permission logging
      console.info(`Attempting to update member ${memberToUpdate.name} (${id}):`, { 
        field,
        value,
        memberUserId: memberToUpdate.user_id, 
        currentUserId: user?.id,
        isAdmin,
        user
      });
      
      // Enhanced permission check: admin check first, then if it's the user's own profile
      const hasPermission = isAdmin || (user && memberToUpdate.user_id === user.id);
      
      // If no permission, reject the update
      if (!hasPermission) {
        console.error(`Permission denied: User ${user?.id} cannot edit member ${id}`);
        toast({
          title: "Permission denied",
          description: "You can only update your own profile unless you're an admin.",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare the updates object
      const updates: { [key: string]: any } = {};
      
      // Special handling for projects field - convert comma/semicolon separated string to array
      if (field === 'projects' && typeof value === 'string') {
        updates.projects = value.split(/[;,]/).map(p => p.trim()).filter(p => p.length > 0);
      } else {
        updates[field] = value;
      }
      
      console.info(`Updating ${field} for member ${memberToUpdate.name} (${id})`, updates);
      
      // Perform the update
      await updateTeamMember(id, updates);
      
      // Show success message
      sonnerToast.success(
        isAdmin ? `Successfully updated ${memberToUpdate.name}` : "Your profile was updated", 
        { description: `The ${field} was updated successfully.` }
      );
    } catch (error: any) {
      console.error("Update team member error:", error);
      toast({
        title: "Error updating team member",
        description: error?.message || "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const memberToDelete = members.find(m => m.id === id);
      
      if (!memberToDelete) {
        throw new Error("Member not found");
      }
      
      // Enhanced permission check for deletion
      const hasPermission = isAdmin || (user && memberToDelete.user_id === user.id);
      
      if (!hasPermission) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own profile unless you're an admin.",
          variant: "destructive",
        });
        return;
      }
      
      await deleteTeamMember(id);
      
      toast({
        title: "Team member removed",
        description: "Team member has been removed successfully.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    
    const announcement: Announcement = {
      id: Date.now().toString(),
      message: newAnnouncement,
      timestamp: new Date(),
    };
    
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement("");
    toast({
      title: "Announcement posted",
      description: "Your announcement has been posted to the team.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
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

  const latestAnnouncement = announcements[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {latestAnnouncement && <AnnouncementBanner announcement={latestAnnouncement} />}
      
      <div className="container py-12 space-y-10">
        <NavigationHeader 
          isAdmin={isAdmin} 
          members={members} 
          handleLogout={handleLogout}
        />
        
        <SearchAndActions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddMember={handleAddMember}
          announcements={announcements}
          newAnnouncement={newAnnouncement}
          onAnnouncementChange={setNewAnnouncement}
          onAddAnnouncement={handleAddAnnouncement}
          members={members}
        />

        <TeamMembers
          members={filteredMembers}
          onUpdate={handleUpdateMember}
          onDelete={handleDeleteMember}
          currentUserId={user?.id}
          isAdmin={isAdmin}
        />

        <WorkloadDashboard members={members} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProjectList 
            activeProjects={activeProjects}
            projectsWithMembers={projectsWithMembers}
          />
          
          <AvailableMembersList availableMembers={availableMembers} />
        </div>
        
        <ProjectHeatmap members={members} />
      </div>
    </div>
  );
}
