
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Announcement } from "@/types/TeamMemberTypes";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { toast } = useToast();

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

  return {
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    handleAddAnnouncement,
    latestAnnouncement: announcements[0]
  };
}
