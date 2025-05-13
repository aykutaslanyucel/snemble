
import React, { useMemo } from "react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { Card } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
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
      
    return {
      availableCount,
      totalMembers,
      percentAvailable
    };
  }, [members]);

  // Return the appropriate color class based on capacity percentage
  const getLiquidColor = (percent: number) => {
    if (percent <= 20) return "from-blue-300 to-blue-500";
    if (percent <= 50) return "from-green-300 to-green-500";
    if (percent <= 70) return "from-yellow-300 to-yellow-500";
    if (percent <= 90) return "from-orange-300 to-orange-500";
    return "from-red-300 to-red-500";
  };

  // Determine the maximum fill based on percent
  const fillHeight = `${Math.min(100, Math.max(10, capacityStats.percentAvailable))}%`;

  return (
    <Card className="flex items-center gap-3 bg-white/10 dark:bg-black/20 px-4 py-3 backdrop-blur-sm border border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
      <div className="flex flex-col items-center">
        <div className="relative h-14 w-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          {/* Glass container */}
          <div className="absolute inset-0 rounded-full border border-white/20" />
          
          {/* Liquid fill with glass effect */}
          <motion.div 
            initial={{ height: "0%" }}
            animate={{ height: fillHeight }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 w-full rounded-b-full",
              `bg-gradient-to-t ${getLiquidColor(capacityStats.percentAvailable)}`,
              "relative"
            )}
            style={{ 
              boxShadow: "0 0 5px rgba(255, 255, 255, 0.5) inset"
            }}
          >
            {/* Add glass reflections */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
          
          {/* Thermometer level marker lines */}
          <div className="absolute top-1/4 inset-x-0 h-0.5 bg-white/20" />
          <div className="absolute top-2/4 inset-x-0 h-0.5 bg-white/20" />
          <div className="absolute top-3/4 inset-x-0 h-0.5 bg-white/20" />
        </div>
        <Thermometer className="h-4 w-4 text-primary mt-1" />
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium">Team Capacity</span>
          <span className="text-xs text-muted-foreground">
            {capacityStats.availableCount}/{capacityStats.totalMembers}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold">
            {capacityStats.percentAvailable}%
          </span>
          <span className="text-xs text-muted-foreground">available</span>
        </div>
      </div>
    </Card>
  );
}
