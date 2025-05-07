
import { UserPlus, Settings, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Announcement, TeamMember } from "@/types/TeamMemberTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementManager } from "./AnnouncementManager";

interface ActionButtonsProps {
  onAddMember: () => void;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement?: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  members?: TeamMember[];
}

export function ActionButtons({
  onAddMember,
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  onUpdateAnnouncement = () => {},
  onDeleteAnnouncement = () => {},
  members = [],
}: ActionButtonsProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex gap-2">
      {isAdmin && (
        <>
          <AnnouncementManager 
            announcements={announcements}
            onAddAnnouncement={onAddAnnouncement}
            onUpdateAnnouncement={onUpdateAnnouncement}
            onDeleteAnnouncement={onDeleteAnnouncement}
          />
          <Button variant="outline" onClick={onAddMember} className="bg-white/5">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/5">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent("export-capacity-report"))}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Capacity Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
