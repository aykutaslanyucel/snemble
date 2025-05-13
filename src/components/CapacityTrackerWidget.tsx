
import React, { useMemo } from "react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { Card } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface CapacityTrackerWidgetProps {
  members?: TeamMember[];
}

export function CapacityTrackerWidget({ members = [] }: CapacityTrackerWidgetProps) {
  const capacityStats = useMemo(() => {
    const availableMembers = members.filter(m => 
      m.status === 'available' || m.status === 'someAvailability'
    );
    
    const totalMembers = members.length;
    const availableCount = availableMembers.length;
    const percentAvailable = totalMembers > 0 
      ? Math.round((availableCount / totalMembers) * 100) 
      : 0;
      
    return {
      availableCount,
      totalMembers,
      percentAvailable
    };
  }, [members]);

  return (
    <Card className="flex items-center gap-2 bg-white/10 dark:bg-black/20 px-3 py-2 backdrop-blur-sm border border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
      <BarChart2 className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          Capacity: {capacityStats.percentAvailable}%
        </span>
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${capacityStats.percentAvailable}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {capacityStats.availableCount}/{capacityStats.totalMembers} available
        </span>
      </div>
    </Card>
  );
}
