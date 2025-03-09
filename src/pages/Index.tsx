
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, LogOut, Folder, User } from "lucide-react";
import { Link } from "react-router-dom";
import { TeamHeader } from "@/components/TeamHeader";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { TeamMembers } from "@/components/TeamMembers";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import WorkloadSummary from "@/components/WorkloadSummary";
import { ProjectHeatmap } from "@/components/ProjectHeatmap";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}

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
      
      <div className="container py-12 space-y-8">
        <div className="flex items-start justify-between">
          <TeamHeader />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <WorkloadSummary members={members} showOnlyCapacity />
          </div>
        </div>
        
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <ActionButtons
              onAddMember={handleAddMember}
              announcements={announcements}
              newAnnouncement={newAnnouncement}
              onAnnouncementChange={setNewAnnouncement}
              onAddAnnouncement={handleAddAnnouncement}
            />
          </div>
        </Card>

        <TeamMembers
          members={filteredMembers}
          onUpdate={handleUpdateMember}
          onDelete={handleDeleteMember}
        />

        {/* Team Status and Historical Capacity row - fixed to properly adapt to desktop space */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <WorkloadSummary members={members} showOnlyCapacity={false} />
        </div>

        {/* Active Projects and Available Team Members row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E5DEFF]" />
              <span className="text-gray-800">Active Projects</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({activeProjects.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {activeProjects.map((project, index) => {
                const assignedMembers = projectsWithMembers.get(project) || [];
                return (
                  <div 
                    key={index} 
                    className="p-2.5 bg-white/5 rounded-lg border border-white/10 flex flex-col transition-all hover:bg-white/10 hover:shadow-md group"
                  >
                    <div className="flex items-center">
                      <Folder className="w-3.5 h-3.5 text-[#E5DEFF] mr-2 flex-shrink-0" />
                      <p className="font-medium text-xs truncate group-hover:text-[#E5DEFF]">
                        {project}
                      </p>
                    </div>
                    {assignedMembers.length > 0 && (
                      <div className="mt-1.5 pl-5">
                        {assignedMembers.slice(0, 3).map((member, idx) => (
                          <div key={idx} className="text-[10px] text-muted-foreground truncate">
                            {member.name}
                          </div>
                        ))}
                        {assignedMembers.length > 3 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{assignedMembers.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#D3E4FD]" />
              <span className="text-gray-800">Available Team Members</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({availableMembers.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {availableMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="p-2.5 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 transition-all hover:bg-white/10 hover:shadow-md group"
                >
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-[#D3E4FD]/10 flex-shrink-0 text-xs font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <div className="font-medium text-xs truncate group-hover:text-[#D3E4FD]">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate leading-tight">
                      {member.position}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Project Heatmap (full width) */}
        <ProjectHeatmap members={members} />
      </div>
    </div>
  );
}
