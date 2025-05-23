
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { TeamMember } from "@/types/TeamMemberTypes";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Thermometer } from "lucide-react";

interface CapacityTrackerWidgetProps {
  members?: TeamMember[];
}

export function CapacityTrackerWidget({ members = [] }: CapacityTrackerWidgetProps) {
  const { availablePercentage, availableCount, totalCount, gradient } = useMemo(() => {
    if (!members || members.length === 0) {
      return { 
        availablePercentage: 0, 
        availableCount: 0, 
        totalCount: 0, 
        gradient: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)" 
      };
    }

    const total = members.length;
    const availableMembers = members.filter(
      member => 
        member.status === "available" || 
        member.status === "someAvailability"
    );
    const available = availableMembers.length;
    const percentage = Math.round((available / total) * 100);
    
    // Create a gradient based on the capacity percentage
    let gradient;
    if (percentage <= 30) {
      gradient = "linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)";
    } else if (percentage <= 70) {
      gradient = "linear-gradient(90deg, #f59e0b 0%, #22c55e 100%)";
    } else {
      gradient = "linear-gradient(90deg, #22c55e 0%, #10b981 100%)";
    }

    return { 
      availablePercentage: percentage, 
      availableCount: available, 
      totalCount: total,
      gradient
    };
  }, [members]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-3 bg-card dark:bg-card/80 px-3 py-1 rounded-full shadow-sm border">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2">
                <Progress 
                  value={availablePercentage} 
                  className="h-2"
                  gradient={gradient}
                />
              </div>
              <span className="text-xs font-medium">
                {availableCount} members available
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Team capacity: {availablePercentage}% available</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
