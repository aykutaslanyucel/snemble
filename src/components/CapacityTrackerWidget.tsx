
import React, { useMemo } from "react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      
    const percentUtilized = 100 - percentAvailable;
    
    return {
      availableCount,
      totalMembers,
      percentAvailable,
      percentUtilized
    };
  }, [members]);

  // Choose color for progress based on utilization
  const getProgressColor = (percentUtilized: number) => {
    if (percentUtilized <= 20) return "bg-blue-400";
    if (percentUtilized <= 50) return "bg-green-400";
    if (percentUtilized <= 70) return "bg-yellow-400";
    if (percentUtilized <= 90) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">Team Capacity</h3>
        <p className="text-sm text-muted-foreground">
          {capacityStats.availableCount} members available
        </p>
        
        <div className="mt-2 max-w-[200px]">
          {/* Progress bar */}
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${capacityStats.percentUtilized}%` }}
              transition={{ duration: 0.5 }}
              className={cn("h-full", getProgressColor(capacityStats.percentUtilized))}
            />
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {capacityStats.percentUtilized}% capacity utilized
          </p>
        </div>
      </div>
      
      <div className="ml-2 self-center">
        <svg 
          width="24" 
          height="40" 
          viewBox="0 0 24 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-purple-400"
        >
          {/* Thermometer body */}
          <rect x="9" y="8" width="6" height="26" rx="3" stroke="currentColor" strokeWidth="2" />
          
          {/* Thermometer bulb */}
          <circle cx="12" cy="34" r="5" stroke="currentColor" strokeWidth="2" />
          
          {/* Mercury level - adjust the height based on utilization */}
          <motion.rect 
            x="10" 
            y={34 - (capacityStats.percentUtilized * 0.2)} 
            width="4" 
            height={capacityStats.percentUtilized * 0.2 + 4}
            initial={{ height: 4 }}
            animate={{ 
              height: capacityStats.percentUtilized * 0.2 + 4,
              y: 34 - (capacityStats.percentUtilized * 0.2)
            }}
            transition={{ duration: 0.8 }}
            rx="2"
            fill={
              capacityStats.percentUtilized <= 20 ? "#60A5FA" : 
              capacityStats.percentUtilized <= 50 ? "#4ADE80" : 
              capacityStats.percentUtilized <= 70 ? "#FBBF24" : 
              capacityStats.percentUtilized <= 90 ? "#FB923C" : 
              "#F87171"
            }
          />
        </svg>
      </div>
    </div>
  );
}
