
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { CardCustomizer } from "@/components/PremiumFeatures/CardCustomizer";
import { TeamMember, TeamMemberCustomization } from "@/types/TeamMemberTypes";

interface CustomizerDialogProps {
  teamMember: TeamMember;
  onUpdate: (updates: TeamMemberCustomization) => void;
}

export function CustomizerDialog({ teamMember, onUpdate }: CustomizerDialogProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handleSave = async (customization: TeamMemberCustomization) => {
    await onUpdate(customization);
    setShowCustomizer(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCustomizer(true)}
        className="flex items-center gap-1"
      >
        <Palette className="h-3 w-3" />
        Customize
      </Button>

      {showCustomizer && (
        <CardCustomizer
          currentCustomization={teamMember.customization}
          onSave={handleSave}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </>
  );
}
