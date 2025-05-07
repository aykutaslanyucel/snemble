
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      <DialogContent 
        className="sm:max-w-lg" 
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside color pickers
          if (e.target instanceof Element) {
            const target = e.target as Element;
            if (
              target.closest('.react-colorful') || 
              target.closest('[data-color-picker-wrapper]') ||
              target.closest('[data-gradient-picker]')
            ) {
              e.preventDefault();
            }
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Customize Card</DialogTitle>
          <DialogDescription>
            Personalize the appearance of this team member's card
          </DialogDescription>
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
