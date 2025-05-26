
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
  // This function will help us debug click events
  const handleDialogClick = (e: React.MouseEvent) => {
    // Stop propagation for all clicks inside dialog
    e.stopPropagation();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto flex flex-col bg-white/95 backdrop-blur-sm border-0 shadow-2xl"
        onClick={handleDialogClick}
        // Complete override of the pointer/interact outside behavior
        onPointerDownOutside={(e) => {
          const target = e.target as Element;
          // Prevent closing when clicking color pickers or popover content
          if (
            target.closest('.react-colorful') || 
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('.color-picker-container')
          ) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as Element;
          // Prevent closing when interacting with color pickers or popover content
          if (
            target.closest('.react-colorful') || 
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('.color-picker-container') ||
            target.closest('[role="dialog"]')
          ) {
            e.preventDefault();
          }
        }}
        style={{ zIndex: 50 }} // Ensure dialog is at a high z-index
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Customize Card</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Personalize the appearance of {member.name}'s card with colors, gradients, and badges
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
