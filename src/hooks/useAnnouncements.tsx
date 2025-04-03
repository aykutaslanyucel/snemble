
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Announcement } from "@/types/TeamMemberTypes";

export interface UseAnnouncementsResult {
  announcements: Announcement[];
  newAnnouncement: string;
  setNewAnnouncement: (value: string) => void;
  handleAddAnnouncement: () => void;
  latestAnnouncement: Announcement | undefined;
}

export function useAnnouncements(): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    
    // Only admins can add announcements
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only admins can post announcements.",
        variant: "destructive",
      });
      return;
    }
    
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

  const latestAnnouncement = announcements[0];

  return {
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    handleAddAnnouncement,
    latestAnnouncement
  };
}
