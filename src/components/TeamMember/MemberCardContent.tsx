
import React from "react";
import { CardContent } from "@/components/ui/card";
import { StatusSelector } from "./StatusSelector";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { Plus, Check, User, Clock, X, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCardBackground, getStatusText } from "./CardBackground";

interface MemberCardContentProps {
  position: string;
  projects: string[];
  canEdit: boolean;
  onStatusChange: (status: TeamMemberStatus) => void;
  currentStatus: TeamMemberStatus;
  onEditProjects?: () => void;
  lastUpdated: Date;
}

export function MemberCardContent({
  position,
  projects,
  canEdit,
  onStatusChange,
  currentStatus,
  onEditProjects,
  lastUpdated
}: MemberCardContentProps) {
  // Time since last update
  const getTimeAgo = () => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    
    if (diffMinutes < 1) return "less than a minute ago";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return "more than a day ago";
  };

  // Get status icon and text
  const getStatusIcon = (status: TeamMemberStatus) => {
    switch (status) {
      case "available":
        return <Check className="h-3.5 w-3.5 text-gray-700" />;
      case "someAvailability":
        return <User className="h-3.5 w-3.5 text-gray-700" />;
      case "busy":
        return <Clock className="h-3.5 w-3.5 text-gray-700" />;
      case "seriouslyBusy":
        return <X className="h-3.5 w-3.5 text-gray-700" />;
      case "away":
        return <Coffee className="h-3.5 w-3.5 text-gray-700" />;
      default:
        return null;
    }
  };

  // Get color for this status - creating a mock TeamMember object to use the getCardBackground function
  const cardStyle = getCardBackground({ status: currentStatus } as TeamMember);

  return (
    <CardContent className="px-6 pt-0 pb-6 space-y-6 relative">
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
      
      {canEdit ? (
        <div className="space-y-3">
          <h4 className="text-gray-700 font-medium">Status</h4>
          <div>
            <StatusSelector
              currentStatus={currentStatus}
              onStatusChange={onStatusChange}
            />
            <div className="mt-2">
              <Badge 
                className="inline-flex items-center gap-1 px-3 py-1.5"
                style={{ background: cardStyle.background }}
                variant="outline"
              >
                <span className="flex-shrink-0">{getStatusIcon(currentStatus)}</span>
                <span className="text-xs font-medium text-gray-700">{getStatusText(currentStatus)}</span>
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-gray-700 font-medium">Status</h4>
          <Badge 
            className="inline-flex items-center gap-1.5 px-3 py-1.5"
            style={{ background: cardStyle.background }}
            variant="outline"
          >
            <span className="flex-shrink-0">{getStatusIcon(currentStatus)}</span>
            <span className="text-xs font-medium text-gray-700">{getStatusText(currentStatus)}</span>
          </Badge>
        </div>
      )}

      <div className="absolute bottom-4 right-6">
        <span className="text-xs text-gray-400">{getTimeAgo()}</span>
      </div>
    </CardContent>
  );
}
