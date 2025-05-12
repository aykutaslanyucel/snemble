
import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { AnnouncementManager } from "@/components/AnnouncementManager";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { saveAnnouncement } from "@/lib/announcementHelpers";
import { useAuth } from "@/contexts/AuthContext";

interface SearchAndActionsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddMember: () => void;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement?: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  members?: TeamMember[];
}

export function SearchAndActions({
  searchQuery,
  onSearchChange,
  onAddMember,
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  members
}: SearchAndActionsProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const handleAddAnnouncement = useCallback(async () => {
    if (!newAnnouncement && !htmlContent) {
      toast({
        title: "Announcement required",
        description: "Please enter an announcement message",
        variant: "destructive",
      });
      return;
    }

    try {
      const newId = uuidv4();
      const announcement: Announcement = {
        id: newId,
        message: newAnnouncement,
        htmlContent: htmlContent,
        timestamp: new Date(),
        priority: 1,
        isActive: true,
        theme: {
          backgroundColor: "from-primary/5 via-primary/10 to-primary/5",
          textColor: "text-foreground",
          animationStyle: "fade"
        }
      };
      
      // First save to Supabase
      await saveAnnouncement(announcement);
      
      // Then update the UI
      onAddAnnouncement(announcement);
      
      // Reset form
      onAnnouncementChange("");
      setHtmlContent("");
      
      toast({
        title: "Announcement added",
        description: "Your announcement has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Error",
        description: "Failed to add announcement. Please try again.",
        variant: "destructive",
      });
    }
  }, [newAnnouncement, htmlContent, onAddAnnouncement, onAnnouncementChange, toast]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <div className="flex space-x-2">
          <ActionButtons onAddMember={onAddMember} />
          
          {isAdmin && (
            <AnnouncementManager
              announcements={announcements}
              onAddAnnouncement={onAddAnnouncement}
              onUpdateAnnouncement={onUpdateAnnouncement || (() => {})}
              onDeleteAnnouncement={onDeleteAnnouncement || (() => {})}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
