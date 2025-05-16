
import React, { useMemo } from "react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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
    if (percentUtilized <= 20) return "bg-blue-500";
    if (percentUtilized <= 50) return "bg-green-500";
    if (percentUtilized <= 70) return "bg-yellow-500";
    if (percentUtilized <= 90) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">Team Capacity</h3>
        <p className="text-sm text-muted-foreground">
          {capacityStats.availableCount} members available
        </p>
        
        <div className="mt-2 max-w-[200px]">
          {/* Custom progress bar with gradient */}
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${capacityStats.percentUtilized}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full",
                capacityStats.percentUtilized <= 20 ? "bg-gradient-to-r from-blue-300 to-blue-500" :
                capacityStats.percentUtilized <= 50 ? "bg-gradient-to-r from-green-300 to-green-500" :
                capacityStats.percentUtilized <= 70 ? "bg-gradient-to-r from-yellow-300 to-yellow-500" :
                capacityStats.percentUtilized <= 90 ? "bg-gradient-to-r from-orange-300 to-orange-500" :
                "bg-gradient-to-r from-red-300 to-red-500"
              )}
            />
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {capacityStats.percentUtilized}% capacity utilized
          </p>
        </div>
      </div>
      
      <div className="ml-2 self-center relative">
        {/* Improved thermometer with better visuals */}
        <div className="relative h-[40px] w-[14px]">
          {/* Thermometer body - glass tube */}
          <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div>
          
          {/* Thermometer bulb */}
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div>
          
          {/* Mercury level with gradient */}
          <motion.div 
            className={cn(
              "absolute bottom-0 left-[3px] w-[8px] rounded-t-full transition-all duration-500",
              capacityStats.percentUtilized <= 20 ? "bg-gradient-to-t from-blue-500 to-blue-300" :
              capacityStats.percentUtilized <= 50 ? "bg-gradient-to-t from-green-500 to-green-300" :
              capacityStats.percentUtilized <= 70 ? "bg-gradient-to-t from-yellow-500 to-yellow-300" :
              capacityStats.percentUtilized <= 90 ? "bg-gradient-to-t from-orange-500 to-orange-300" :
              "bg-gradient-to-t from-red-500 to-red-300"
            )}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(5, capacityStats.percentUtilized * 0.3)}px` }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Mercury in bulb */}
          <motion.div 
            className={cn(
              "absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-[12px] h-[12px] rounded-full",
              capacityStats.percentUtilized <= 20 ? "bg-blue-500" :
              capacityStats.percentUtilized <= 50 ? "bg-green-500" :
              capacityStats.percentUtilized <= 70 ? "bg-yellow-500" :
              capacityStats.percentUtilized <= 90 ? "bg-orange-500" :
              "bg-red-500"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
