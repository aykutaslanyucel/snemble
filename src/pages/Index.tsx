
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
              [field]: field === 'projects' && typeof value === 'string' 
                ? value.split(';').map(p => p.trim()).filter(p => p.length > 0)
                : value,
              lastUpdated: new Date() 
            }
          : member
      )
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 bg-card/30 backdrop-blur-sm border border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              Active Projects
              <span className="text-sm font-normal text-muted-foreground">
                ({activeProjects.length})
              </span>
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto fancy-scroll">
              {activeProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transition-all hover:bg-white/10"
                >
                  {project}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/30 backdrop-blur-sm border border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              Available Team Members
              <span className="text-sm font-normal text-muted-foreground">
                ({availableMembers.length})
              </span>
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto fancy-scroll">
              {availableMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex justify-between items-center transition-all hover:bg-white/10"
                >
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.position}</div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
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
