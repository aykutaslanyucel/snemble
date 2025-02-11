import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  LogOut,
  SortAsc,
  UserPlus,
  Settings,
  MessageSquarePlus,
} from "lucide-react";
import TeamMemberCard from "@/components/TeamMemberCard";
import { TeamHeader } from "@/components/TeamHeader";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const initialMembers = [
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

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}

export default function Index() {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { toast } = useToast();

  const handleAddMember = () => {
    const newMember = {
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
          ? { ...member, [field]: value, lastUpdated: new Date() }
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
      {latestAnnouncement && (
        <div className="bg-primary/10 backdrop-blur-sm border-b">
          <div className="container py-2 px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {latestAnnouncement.message}
              </p>
              <span className="text-xs text-muted-foreground">
                {latestAnnouncement.timestamp.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="container py-8 space-y-8">
        <TeamHeader />
        
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Announcement
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Announcements</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your announcement here..."
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={handleAddAnnouncement} className="w-full">
                      Post Announcement
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <Card key={announcement.id} className="p-4">
                        <p className="text-sm mb-2">{announcement.message}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">
                            {announcement.timestamp.toLocaleDateString()}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={handleAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <TeamMemberCard
                  member={member}
                  onUpdate={handleUpdateMember}
                  onDelete={handleDeleteMember}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
