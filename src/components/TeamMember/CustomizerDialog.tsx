
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardCustomizer } from "@/components/PremiumFeatures/CardCustomizer";
import { TeamMember } from "@/types/TeamMemberTypes";

interface CustomizerDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  member: TeamMember;
  onUpdate: (updates: any) => void;
}

export function CustomizerDialog({ isOpen, setIsOpen, member, onUpdate }: CustomizerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customize Card</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CardCustomizer 
            teamMember={member} 
            onUpdate={(updates) => {
              onUpdate(updates);
              setIsOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
