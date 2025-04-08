import { useState, useMemo } from "react";
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

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    position: "Senior Developer",
    status: "available",
    projects: ["Project Alpha", "Project Beta"],
    lastUpdated: new Date(),
  },
  {
    id: "2",
    name: "Sarah Smith",
    position: "UX Designer",
    status: "busy",
    projects: ["Project Gamma"],
    lastUpdated: new Date(),
  },
  {
    id: "3",
    name: "Mike Brown",
    position: "Product Manager",
    status: "away",
    projects: ["Project Delta", "Project Epsilon"],
    lastUpdated: new Date(),
  },
];

export default function Index() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { toast } = useToast();
  const { isAdmin, logout } = useAuth();

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
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: "New Member",
      position: "Position",
      status: "available",
      projects: [],
      lastUpdated: new Date(),
    };
    setMembers([newMember, ...members]);
    toast({
      title: "Team member added",
      description: "New team member has been added successfully.",
    });
  };

  const handleUpdateMember = (id: string, field: string, value: any) => {
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
    setMembers(members.filter((member) => member.id !== id));
    toast({
      title: "Team member removed",
      description: "Team member has been removed successfully.",
      variant: "destructive",
    });
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
