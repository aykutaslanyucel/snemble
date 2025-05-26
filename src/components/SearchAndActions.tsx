
import React from "react";
import { SearchBar } from "./SearchBar";
import { MenuButton } from "./MenuButton";
import { AnnouncementManager } from "./AnnouncementManager";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";

interface SearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  members: TeamMember[];
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  isAdmin: boolean;
}

export function SearchAndActions({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  members,
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  isAdmin
}: SearchAndActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={onSearchChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
      <div className="flex items-center gap-2">
        {isAdmin && (
          <AnnouncementManager
            announcements={announcements}
            onAddAnnouncement={onAddAnnouncement}
            onUpdateAnnouncement={onUpdateAnnouncement}
            onDeleteAnnouncement={onDeleteAnnouncement}
          />
        )}
        {!isAdmin && (
          <Button variant="outline" className="bg-white/5" disabled>
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        )}
        <MenuButton members={members} />
      </div>
    </div>
  );
}
