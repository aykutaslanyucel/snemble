
import React from "react";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { TeamMember } from "@/types/TeamMemberTypes";

interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}

interface SearchAndActionsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddMember: () => void;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: () => void;
  members?: TeamMember[];
  isAdmin?: boolean;
}

export function SearchAndActions({
  searchQuery,
  onSearchChange,
  onAddMember,
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  members,
  isAdmin = false
}: SearchAndActionsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <ActionButtons
          onAddMember={onAddMember}
          announcements={announcements}
          newAnnouncement={newAnnouncement}
          onAnnouncementChange={onAnnouncementChange}
          onAddAnnouncement={onAddAnnouncement}
          members={members}
          isAdmin={isAdmin}
        />
      </div>
    </Card>
  );
}
