
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
    <div className="flex flex-col items-end">
      <div className="flex items-center justify-between gap-2">
        <div className="text-right">
          <h3 className="text-lg font-medium">Team Capacity</h3>
          <p className="text-sm text-muted-foreground">
            {capacityStats.availableCount} members available
          </p>
        </div>
        <div className="ml-2">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-purple-400"
          >
            <path 
              d="M12 6C11.0718 6 10.1814 6.36875 9.52527 7.02513C8.86888 7.68152 8.5 8.57174 8.5 9.5V16C8.5 16.2652 8.60536 16.5196 8.79289 16.7071C8.98043 16.8946 9.23478 17 9.5 17H14.5C14.7652 17 15.0196 16.8946 15.2071 16.7071C15.3946 16.5196 15.5 16.2652 15.5 16V9.5C15.5 8.57174 15.1312 7.68152 14.4749 7.02513C13.8186 6.36875 12.9283 6 12 6Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M10 4V6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M14 4V6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M10 17V20" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M14 17V20" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <div className="mt-1 w-full max-w-[200px]">
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
  );
}
