
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  projects: string;
  setProjects: (projects: string) => void;
  onSave: () => void;
}

export function ProjectsDialog({ isOpen, setIsOpen, projects, setProjects, onSave }: ProjectsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Projects</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            placeholder="Projects (comma or semicolon separated)"
            className="w-full"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Separate projects with commas or semicolons
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
