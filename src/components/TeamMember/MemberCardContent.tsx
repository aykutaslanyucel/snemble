
import React from "react";
import { CardContent } from "@/components/ui/card";
import { StatusSelector } from "./StatusSelector";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    <CardContent className="px-4 pt-0 pb-2 space-y-4">
      <div className="mb-1">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-normal">
          {position}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-700 mb-1.5">Projects</p>
        <div className="flex flex-wrap gap-1.5">
          {projects.length > 0 ? (
            <>
              {projects.map((project, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-white/90 text-gray-700 hover:bg-white rounded-full px-2.5 py-0.5 text-xs"
                >
                  {project}
                </Badge>
              ))}
              
              {canEdit && (
                <button 
                  onClick={onEditProjects}
                  className="bg-white/80 hover:bg-white/90 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">No projects</p>
              
              {canEdit && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 text-xs bg-white/80 border-gray-200 rounded-full px-2"
                  onClick={onEditProjects}
                >
                  <Plus className="h-2.5 w-2.5 mr-1" />
                  Add Project
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {canEdit && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700 mb-1.5">Status</p>
          <StatusSelector
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
          />
        </div>
      )}
    </CardContent>
  );
}
