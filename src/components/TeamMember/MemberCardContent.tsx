
import React from "react";
import { CardContent } from "@/components/ui/card";
import { StatusSelector } from "./StatusSelector";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberCardContentProps {
  position: string;
  projects: string[];
  canEdit: boolean;
  onStatusChange: (status: TeamMemberStatus) => void;
  currentStatus: TeamMemberStatus;
  onEditProjects?: () => void;
}

export function MemberCardContent({
  position,
  projects,
  canEdit,
  onStatusChange,
  currentStatus,
  onEditProjects
}: MemberCardContentProps) {
  return (
    <CardContent className="px-6 pt-0 pb-6 space-y-6">
      <div className="mb-2">
        <div className="text-gray-600 dark:text-gray-300 text-md">
          {position}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-gray-700 font-medium">Projects</h4>
          
          {canEdit && (
            <Button 
              onClick={onEditProjects}
              className="rounded-full px-4 py-2 h-auto bg-white text-gray-700 hover:bg-white/90 shadow-sm flex items-center gap-1.5"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <span 
                key={index} 
                className="bg-white/90 text-gray-700 rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              >
                {project}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No projects assigned</p>
          )}
        </div>
      </div>
      
      {canEdit && (
        <div className="space-y-3">
          <h4 className="text-gray-700 font-medium">Status</h4>
          <StatusSelector
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
          />
        </div>
      )}
    </CardContent>
  );
}
