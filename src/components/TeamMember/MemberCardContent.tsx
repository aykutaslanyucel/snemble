
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
    <CardContent className="p-4 pt-0 space-y-3">
      <div className="mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {position}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium mb-1">Projects</p>
        <div className="flex flex-wrap gap-2">
          {projects.length > 0 ? (
            <>
              {projects.map((project, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-white/80 text-gray-700 hover:bg-white/90 px-3 py-1 rounded-full"
                >
                  {project}
                </Badge>
              ))}
              
              {canEdit && (
                <button 
                  onClick={onEditProjects}
                  className="bg-white/80 hover:bg-white/90 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">No projects</p>
              
              {canEdit && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs bg-white/80 border-gray-200 rounded-full"
                  onClick={onEditProjects}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Project
                </Button>
              )}
            </div>
          )}
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
