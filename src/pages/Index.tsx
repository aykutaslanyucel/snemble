
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { TeamHeader } from "@/components/TeamHeader";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { TeamMembers } from "@/components/TeamMembers";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import WorkloadSummary from "@/components/WorkloadSummary";

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

  // Calculate active projects and available team members
  const activeProjects = useMemo(() => {
    const projectSet = new Set<string>();
    members.forEach(member => {
      member.projects.forEach(project => projectSet.add(project));
    });
    return Array.from(projectSet);
  }, [members]);

  const availableMembers = useMemo(() => {
    return members.filter(member => member.status === 'available');
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
                ? value.split(/[;,]/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
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

        <WorkloadSummary members={members} showOnlyCapacity={false} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E5DEFF]" />
              <span className="text-gray-800">Active Projects</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({activeProjects.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {activeProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-white/5 rounded-lg border border-white/10 transition-all hover:bg-white/10 hover:shadow-md group"
                >
                  <p className="font-medium text-sm truncate group-hover:text-[#E5DEFF]">
                    {project}
                  </p>
                </div>
              ))}
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
            <div className="grid gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {availableMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center transition-all hover:bg-white/10 hover:shadow-md group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#D3E4FD]/10 flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate group-hover:text-[#D3E4FD]">
                        {member.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {member.position}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-[#D3E4FD]/10 text-[#D3E4FD] border-[#D3E4FD]/20 hover:bg-[#D3E4FD]/20 text-xs py-0.5">
                    Available
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
