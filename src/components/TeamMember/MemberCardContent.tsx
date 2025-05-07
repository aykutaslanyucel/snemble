
import React from "react";
import { CardContent } from "@/components/ui/card";
import { StatusSelector } from "./StatusSelector";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

interface MemberCardContentProps {
  position: string;
  projects: string[];
  canEdit: boolean;
  onStatusChange: (status: TeamMemberStatus) => void;
  currentStatus: TeamMemberStatus;
}

export function MemberCardContent({
  position,
  projects,
  canEdit,
  onStatusChange,
  currentStatus
}: MemberCardContentProps) {
  return (
    <CardContent className="p-4 pt-0 space-y-3 flex flex-col justify-between">
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span className="font-medium">Position:</span> {position}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          <span className="font-medium">Projects:</span>{" "}
          {projects.length > 0 ? projects.join(", ") : "None"}
        </div>
      </div>
      
      {canEdit && (
        <StatusSelector
          currentStatus={currentStatus}
          onStatusChange={onStatusChange}
        />
      )}
    </CardContent>
  );
}
