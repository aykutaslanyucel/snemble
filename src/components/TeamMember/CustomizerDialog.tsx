
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
        className="sm:max-w-lg max-h-[80vh] overflow-y-auto flex flex-col"
        // Prevent dialog from closing when interacting with color pickers
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking inside color pickers
          if (e.target instanceof Element) {
            const target = e.target as Element;
            if (
              target.closest('.react-colorful') || 
              target.closest('[data-radix-popper-content-wrapper]')
            ) {
              e.preventDefault();
            }
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside color pickers
          if (e.target instanceof Element) {
            const target = e.target as Element;
            if (
              target.closest('.react-colorful') || 
              target.closest('[data-radix-popper-content-wrapper]')
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
        <div className="py-4 overflow-y-auto pr-1 flex-1">
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
