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
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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
      console.log("Team members updated via subscription", updatedMembers.length);
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

  // Fetch announcements from Supabase
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('priority', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Transform the data to match our Announcement type
          const formattedAnnouncements: Announcement[] = data.map(item => ({
            id: item.id,
            message: item.message || '',
            htmlContent: item.html_content,
            timestamp: new Date(item.timestamp),
            expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
            priority: item.priority,
            theme: item.theme as any,
            isActive: item.is_active
          }));
          
          setAnnouncements(formattedAnnouncements);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast({
          title: "Error",
          description: "Failed to load announcements. Please refresh.",
          variant: "destructive",
        });
      }
    };

    fetchAnnouncements();
    
    // Subscribe to announcement changes
    const announcementsSubscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('Announcement change received:', payload);
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      announcementsSubscription.unsubscribe();
    };
  }, [toast]);

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

  // Improved update handler that updates UI optimistically for better UX
  const handleUpdateMember = async (id: string, field: string, value: any) => {
    try {
      // Find the member to update
      const memberToUpdate = members.find(m => m.id === id);
      
      if (!memberToUpdate) {
        console.error(`Member not found with ID: ${id}`);
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
      
      // Enhanced permission check with detailed logging
      const hasPermission = isAdmin || (user && memberToUpdate.user_id === user.id);
      
      // If no permission, reject the update and log details
      if (!hasPermission) {
        console.error(`Permission denied: User ${user?.id} cannot edit member ${id}`);
        console.error(`  > Admin: ${isAdmin}, User: ${user?.id}, Member User ID: ${memberToUpdate.user_id}`);
        
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
      
      // Create an optimistic update locally first for immediate feedback
      const updatedMembers = members.map(m => {
        if (m.id === id) {
          // Create a shallow copy of the member
          const updatedMember = { ...m };
          
          // Apply the field updates
          if (field === 'projects' && typeof value === 'string') {
            updatedMember.projects = value.split(/[;,]/).map(p => p.trim()).filter(p => p.length > 0);
          } else {
            // @ts-ignore - dynamic field assignment
            updatedMember[field] = value;
          }
          
          // Update the timestamp
          updatedMember.lastUpdated = new Date();
          
          return updatedMember;
        }
        return m;
      });
      
      // Update UI immediately for better UX
      setMembers(updatedMembers);
      
      // Perform the actual update in the background
      await updateTeamMember(id, updates);
      
      // Show success message
      sonnerToast.success(
        isAdmin ? `Successfully updated ${memberToUpdate.name}` : "Your profile was updated", 
        { description: `The ${field} was updated successfully.` }
      );
    } catch (error: any) {
      console.error("Update team member error:", error);
      console.error("Stack trace:", error?.stack);
      
      // If the update fails, refetch the current state to ensure UI consistency
      try {
        const currentMembers = await fetchTeamMembers();
        setMembers(currentMembers);
      } catch (fetchError) {
        console.error("Failed to fetch current members after update error", fetchError);
      }
      
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

  const handleAddAnnouncement = async (announcement: Announcement) => {
    if (!user) return;
    
    try {
      // Prepare the announcement data for Supabase
      const { id, message, htmlContent, timestamp, expiresAt, priority, theme, isActive } = announcement;
      
      const { error } = await supabase
        .from('announcements')
        .insert({
          id: id || uuidv4(),
          message,
          html_content: htmlContent,
          timestamp: timestamp.toISOString(),
          expires_at: expiresAt?.toISOString(),
          priority,
          theme,
          is_active: isActive,
          created_by: user.id
        });
        
      if (error) throw error;
      
      // New data will be fetched via subscription
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Error",
        description: "Failed to add announcement.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    if (!isAdmin) return;
    
    try {
      // Convert the data for Supabase
      const updateData: any = {};
      
      if (data.message !== undefined) updateData.message = data.message;
      if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent;
      if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt?.toISOString();
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      
      const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // New data will be fetched via subscription
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // New data will be fetched via subscription
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement.",
        variant: "destructive",
      });
    }
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
      {announcements.length > 0 && (
        <AnnouncementBanner 
          announcements={announcements} 
          onDelete={isAdmin ? handleDeleteAnnouncement : undefined}
        />
      )}
      
      <div className="container py-8 space-y-6">
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
          onUpdateAnnouncement={handleUpdateAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
