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
  getOrCreateTeamMemberForUser 
} from "@/lib/teamMemberUtils";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Megaphone, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Index() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user, isAdmin, logout } = useAuth();
  
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    message: '',
    htmlContent: '',
    priority: 1,
    theme: 'info',
    expiresAt: undefined,
    isActive: true
  });

  // Add a loading timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn("Application has been loading for too long, forcing render");
          setLoading(false);
          toast({
            title: "Loading timeout",
            description: "Some data might not be available. Please refresh if needed.",
            variant: "destructive",
          });
        }
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, toast]);

  // Fetch members and set up subscription and ensure the current user has a team member
  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    
    // Attempt to fetch team members
    const fetchData = async () => {
      try {
        const teamMembers = await fetchTeamMembers();
        if (isMounted) {
          console.log("Team members fetched successfully:", teamMembers.length);
          setMembers(teamMembers);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to load team data. Please refresh.",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchData();
    
    // Set up a real-time subscription to team members
    const unsubscribe = subscribeToTeamMembers(updatedMembers => {
      console.log("Team members updated via subscription", updatedMembers.length);
      if (isMounted) {
        setMembers(updatedMembers);
        setLoading(false);
      }
    });
    
    // Check if current user has a team member
    if (user) {
      getOrCreateTeamMemberForUser(user.id, user.email, isAdmin ? 'admin' : 'user')
        .then(() => {
          console.log("User team member verified");
        })
        .catch(error => {
          console.error("Error ensuring user has team member:", error);
          if (isMounted) {
            toast({
              title: "Error",
              description: "Failed to initialize your team profile. Please refresh.",
              variant: "destructive",
            });
          }
        });
    }
    
    // Cleanup subscription on component unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user, isAdmin, toast]);

  // Fetch announcements from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('priority', { ascending: false });
          
        if (error) throw error;
        
        if (data && isMounted) {
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
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load announcements. Please refresh.",
            variant: "destructive",
          });
        }
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
          if (isMounted) {
            fetchAnnouncements();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
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

  // Sort members based on current sort settings
  const sortedMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    
    return [...members].sort((a, b) => {
      // Define role order for sorting
      const roleOrder = {
        'Partner': 1,
        'Managing Associate': 2,
        'Senior Associate': 3,
        'Associate': 4,
        'Assistant': 5,
        'Other': 6
      };
      
      // Define availability order for sorting
      const availabilityOrder = {
        'available': 1,
        'someAvailability': 2,
        'unavailable': 3
      };
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      } else if (sortBy === 'nameDesc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'role') {
        const roleA = roleOrder[a.position as keyof typeof roleOrder] || 99;
        const roleB = roleOrder[b.position as keyof typeof roleOrder] || 99;
        return sortOrder === 'asc' ? roleA - roleB : roleB - roleA;
      } else if (sortBy === 'availability') {
        const availA = availabilityOrder[a.status as keyof typeof availabilityOrder] || 99;
        const availB = availabilityOrder[b.status as keyof typeof availabilityOrder] || 99;
        return availA - availB; // Always sort by most available first
      } else {
        // Default sort by lastUpdated
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [members, sortBy, sortOrder]);

  // Sort filtered members the same way
  const filteredMembers = useMemo(() => {
    const filtered = members.filter((member) =>
      Object.values(member).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    return [...filtered].sort((a, b) => {
      // Define role order for sorting
      const roleOrder = {
        'Partner': 1,
        'Managing Associate': 2,
        'Senior Associate': 3,
        'Associate': 4,
        'Assistant': 5,
        'Other': 6
      };
      
      // Define availability order for sorting
      const availabilityOrder = {
        'available': 1,
        'someAvailability': 2,
        'unavailable': 3
      };
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      } else if (sortBy === 'nameDesc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'role') {
        const roleA = roleOrder[a.position as keyof typeof roleOrder] || 99;
        const roleB = roleOrder[b.position as keyof typeof roleOrder] || 99;
        return sortOrder === 'asc' ? roleA - roleB : roleB - roleA;
      } else if (sortBy === 'availability') {
        const availA = availabilityOrder[a.status as keyof typeof availabilityOrder] || 99;
        const availB = availabilityOrder[b.status as keyof typeof availabilityOrder] || 99;
        return availA - availB; // Always sort by most available first
      } else {
        // Default sort by lastUpdated
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [members, searchQuery, sortBy, sortOrder]);
  
  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      // Toggle sort order if same field is selected again
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(value);
      // Default sort orders for different fields
      if (value === "name") {
        setSortOrder("asc");
      } else if (value === "nameDesc") {
        setSortBy("name");
        setSortOrder("desc");
      } else if (value === "lastUpdated") {
        setSortOrder("desc"); // Newest first
      } else if (value === "role") {
        setSortOrder("asc");
      } else if (value === "availability") {
        setSortOrder("desc"); // Most available first
      }
    }
  };

  const handleExportToPowerPoint = () => {
    try {
      exportCapacityReport(filteredMembers.length > 0 ? filteredMembers : members);
      toast({
        title: "Export Started",
        description: "Your PowerPoint export is being generated",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PowerPoint",
        variant: "destructive",
      });
    }
  };

  const handleExportToWord = () => {
    try {
      // Import is relative to make it lazy-loaded
      import('@/utils/docxExport').then(module => {
        module.exportWordDocument(filteredMembers.length > 0 ? filteredMembers : members);
        toast({
          title: "Export Started",
          description: "Your Word document is being generated",
        });
      }).catch(error => {
        throw error;
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Word",
        variant: "destructive",
      });
    }
  };

  const handleOpenAnnouncementDialog = () => {
    setAnnouncementFormData({
      message: '',
      htmlContent: '',
      priority: 1,
      theme: 'info',
      expiresAt: undefined,
      isActive: true
    });
    setIsAnnouncementDialogOpen(true);
  };

  const handleCloseAnnouncementDialog = () => {
    setIsAnnouncementDialogOpen(false);
  };

  const handleAnnouncementFormSubmit = async () => {
    const announcement: Announcement = {
      id: uuidv4(),
      message: announcementFormData.message,
      htmlContent: announcementFormData.htmlContent,
      timestamp: new Date(),
      expiresAt: announcementFormData.expiresAt,
      priority: announcementFormData.priority,
      theme: announcementFormData.theme as any,
      isActive: announcementFormData.isActive
    };
    
    await handleAddAnnouncement(announcement);
    handleCloseAnnouncementDialog();
  };

  // Loading and error UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg">Loading team data...</p>
          <button 
            onClick={() => setLoading(false)} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Taking too long? Click here
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">{error.message || "Failed to load application data"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
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
      
      <div className="container py-8 space-y-8">
        <NavigationHeader 
          isAdmin={isAdmin} 
          members={members} 
          handleLogout={handleLogout}
          showWelcomeHeader={true}
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
          onSortChange={handleSortChange}
          sortValue={sortBy === "name" && sortOrder === "desc" ? "nameDesc" : sortBy}
          onExportPowerPoint={handleExportToPowerPoint}
          onExportWord={handleExportToWord}
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

      {/* Announcement Dialog */}
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Announcement</DialogTitle>
            <DialogDescription>
              Create a new announcement to display at the top of the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={announcementFormData.message}
                onChange={e => setAnnouncementFormData({ ...announcementFormData, message: e.target.value })}
                placeholder="Enter message"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="htmlContent">HTML Content</Label>
              <Textarea
                id="htmlContent"
                value={announcementFormData.htmlContent}
                onChange={e => setAnnouncementFormData({ ...announcementFormData, htmlContent: e.target.value })}
                placeholder="Enter HTML content"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={String(announcementFormData.priority)}
                onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, priority: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={announcementFormData.theme}
                onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                type="datetime-local"
                id="expiresAt"
                value={announcementFormData.expiresAt ? new Date(announcementFormData.expiresAt).toISOString().slice(0, 16) : ""}
                onChange={e => setAnnouncementFormData({
                  ...announcementFormData,
                  expiresAt: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={announcementFormData.isActive}
                onCheckedChange={checked => setAnnouncementFormData({ ...announcementFormData, isActive: checked })}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAnnouncementDialog}>
              Cancel
            </Button>
            <Button onClick={handleAnnouncementFormSubmit}>
              Add Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
