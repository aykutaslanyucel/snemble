
import React from "react";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";

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
          onUpdateAnnouncement={onUpdateAnnouncement}
          onDeleteAnnouncement={onDeleteAnnouncement}
          members={members}
        />
      </div>
    </Card>
  );
}
