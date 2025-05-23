import React, { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Announcement, TeamMember } from "@/types/TeamMemberTypes";
import { v4 as uuidv4 } from 'uuid';

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
  members,
  onSortChange,
  sortValue,
  onExportPowerPoint,
  onExportWord,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddMember: () => Promise<void>;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: (announcement: Announcement) => Promise<void>;
  onUpdateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  members: TeamMember[];
  onSortChange?: (value: string) => void;
  sortValue?: string;
  onExportPowerPoint?: () => void;
  onExportWord?: () => void;
}) {
  const { toast } = useToast();
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [announcementTheme, setAnnouncementTheme] = useState<"info" | "warning" | "success" | "destructive">("info");
  const [announcementPriority, setAnnouncementPriority] = useState<number>(1);
  const [announcementExpiresAt, setAnnouncementExpiresAt] = useState<Date | undefined>(undefined);
  const [announcementIsActive, setAnnouncementIsActive] = useState<boolean>(true);
  const [announcementHtmlContent, setAnnouncementHtmlContent] = useState<string>("");

  const handleOpenAnnouncementDialog = () => {
    setIsAnnouncementDialogOpen(true);
  };

  const handleCloseAnnouncementDialog = () => {
    setIsAnnouncementDialogOpen(false);
    setAnnouncementTheme("info");
    setAnnouncementPriority(1);
    setAnnouncementExpiresAt(undefined);
    setAnnouncementIsActive(true);
    setAnnouncementHtmlContent("");
  };

  const handleAddAnnouncementClick = async () => {
    if (!newAnnouncement.trim()) {
      toast({
        title: "Error",
        description: "Announcement message is required.",
        variant: "destructive",
      });
      return;
    }

    const announcement: Announcement = {
      id: uuidv4(),
      message: newAnnouncement,
      htmlContent: announcementHtmlContent,
      timestamp: new Date(),
      expiresAt: announcementExpiresAt,
      priority: announcementPriority,
      theme: announcementTheme,
      isActive: announcementIsActive
    };

    await onAddAnnouncement(announcement);
    handleCloseAnnouncementDialog();
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
        onSortChange={onSortChange}
        sortValue={sortValue}
        onExportPowerPoint={onExportPowerPoint}
        onExportWord={onExportWord}
        showExportActions={Boolean(onExportPowerPoint && onExportWord)}
      />
      
      <div className="flex space-x-2">
        <Button onClick={handleOpenAnnouncementDialog} variant="outline" className="flex items-center">
          <Megaphone className="h-4 w-4 mr-2" /> 
          Add Announcement
        </Button>
        
        <Button onClick={onAddMember} className="flex items-center">
          <UserPlus className="h-4 w-4 mr-2" /> 
          Add Member
        </Button>
      </div>
    
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Make a new announcement to be displayed at the top of the page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="announcement-theme" className="text-right">Theme</Label>
              <Select value={announcementTheme} onValueChange={value => setAnnouncementTheme(value as "info" | "warning" | "success" | "destructive")} className="col-span-2">
                <SelectTrigger id="announcement-theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="announcement-priority" className="text-right">Priority</Label>
              <Input
                type="number"
                id="announcement-priority"
                defaultValue={1}
                min={1}
                max={10}
                onChange={(e) => setAnnouncementPriority(Number(e.target.value))}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="announcement-expires-at" className="text-right">Expires At</Label>
              <Input
                type="datetime-local"
                id="announcement-expires-at"
                onChange={(e) => setAnnouncementExpiresAt(e.target.value ? new Date(e.target.value) : undefined)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="announcement-is-active" className="text-right">Active</Label>
              <Input
                type="checkbox"
                id="announcement-is-active"
                defaultChecked={true}
                onChange={(e) => setAnnouncementIsActive(e.target.checked)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="announcement-message" className="text-left">Message</Label>
              <Textarea
                id="announcement-message"
                placeholder="Enter announcement message"
                value={newAnnouncement}
                onChange={(e) => onAnnouncementChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="announcement-html-content" className="text-left">HTML Content</Label>
              <Textarea
                id="announcement-html-content"
                placeholder="Enter HTML content for the announcement"
                value={announcementHtmlContent}
                onChange={(e) => setAnnouncementHtmlContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAnnouncementDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddAnnouncementClick}>
              Create Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
