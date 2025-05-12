
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Announcement } from "@/types/TeamMemberTypes";

interface ActionButtonsProps {
  onAddMember: () => void;
}

export function ActionButtons({
  onAddMember
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
