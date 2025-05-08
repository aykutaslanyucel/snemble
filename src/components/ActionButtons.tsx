
import React, { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, MessageSquarePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Announcement } from "@/types/TeamMemberTypes";
import { RichTextEditor } from './RichTextEditor';

interface ActionButtonsProps {
  onAddMember: () => void;
  announcements: Announcement[];
  newAnnouncement: string;
  onAnnouncementChange: (value: string) => void;
  onAddAnnouncement: () => void;
  onUpdateAnnouncement?: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  members?: any[];
  htmlContent?: string;
  onHtmlContentChange?: (html: string) => void;
}

export function ActionButtons({
  onAddMember,
  announcements,
  newAnnouncement,
  onAnnouncementChange,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  members,
  htmlContent = "",
  onHtmlContentChange = () => {}
}: ActionButtonsProps) {
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  
  const handleSubmit = useCallback(() => {
    onAddAnnouncement();
    setAnnouncementDialogOpen(false);
  }, [onAddAnnouncement]);

  return (
    <div className="flex space-x-2">
      <Button onClick={onAddMember} variant="default" className="gap-1">
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">Add Member</span>
      </Button>
      
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-1">
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden md:inline">Add Announcement</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Create a new announcement to display at the top of the page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement">Message (plain text)</Label>
              <Textarea
                id="announcement"
                value={newAnnouncement}
                onChange={(e) => onAnnouncementChange(e.target.value)}
                placeholder="Enter announcement text here..."
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rich-text">Rich Text Content (optional)</Label>
              <div className="border rounded-md">
                <RichTextEditor 
                  value={htmlContent}
                  onChange={onHtmlContentChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You can add formatting, links, and colors to make your announcement stand out.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Post Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
