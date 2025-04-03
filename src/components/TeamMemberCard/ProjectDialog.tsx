
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialProjects: string;
  onSaveProjects: () => void;
  onProjectChange: (value: string) => void;
}

export function ProjectDialog({
  isOpen,
  setIsOpen,
  initialProjects,
  onSaveProjects,
  onProjectChange
}: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Add or edit projects, separated by semicolons (;)
          </div>
          <Textarea 
            placeholder="Project names (separate with semicolons)" 
            value={initialProjects} 
            onChange={(e) => onProjectChange(e.target.value)} 
            className="min-h-[100px]" 
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveProjects}>Save Projects</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
