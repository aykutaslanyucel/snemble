
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Announcement } from "@/types/TeamMemberTypes";
import { Dispatch, SetStateAction } from "react";

interface ActionButtonsProps {
  onAddMember: () => void;
  // The following props are optional since they're only used by SearchAndActions
  announcements?: Announcement[];
  newAnnouncement?: string;
  onAnnouncementChange?: (value: string) => void;
  onAddAnnouncement?: () => Promise<void> | void;
  onUpdateAnnouncement?: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  members?: any[];
  htmlContent?: string;
  onHtmlContentChange?: Dispatch<SetStateAction<string>>;
}

export function ActionButtons({
  onAddMember,
  // Optional props can be used by other components
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  members,
  htmlContent,
  onHtmlContentChange
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button onClick={onAddMember} variant="default" className="gap-1">
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">Add Member</span>
      </Button>
    </div>
  );
}
