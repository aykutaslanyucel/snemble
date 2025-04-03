
import { UserPlus, Settings, MessageSquarePlus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Announcement, TeamMember } from "@/types/TeamMemberTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionButtonsProps {
  onAddMember: () => void;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: () => void;
  members?: TeamMember[];
  isAdmin?: boolean;
}

export function ActionButtons({
  onAddMember,
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  members = [],
  isAdmin = false,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {isAdmin && (
        <>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-white/5">
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
                    onChange={(e) => onAnnouncementChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={onAddAnnouncement} className="w-full">
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
