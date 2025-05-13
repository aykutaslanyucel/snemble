
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

  // Determine the color based on capacity percentage
  const getCapacityColor = (percent: number) => {
    // Create a gradient from blue (low usage) to red (high usage)
    if (percent < 30) return "#D3E4FD"; // Blue - lots of availability
    if (percent < 50) return "#F2FCE2"; // Green - good availability
    if (percent < 70) return "#FEF7CD"; // Yellow - moderate availability
    if (percent < 90) return "#FEC6A1"; // Orange - low availability
    return "#FFDEE2"; // Red - very little availability
  };

  return (
    <Card className="flex items-center gap-2 bg-white/10 dark:bg-black/20 px-3 py-2 backdrop-blur-sm border border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-colors">
      <Thermometer className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {capacityStats.percentAvailable}%
        </span>
        <div className="relative h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          {/* Glass container */}
          <div className="absolute inset-0 rounded-full border border-white/20" />
          
          {/* Liquid fill with glass effect */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${capacityStats.percentAvailable}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-l-full",
              "bg-gradient-to-r from-[#D3E4FD] to-[#FFDEE2]",
              "relative"
            )}
          >
            {/* Add glass reflections */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
          
          {/* Thermometer level marker lines */}
          <div className="absolute inset-y-0 left-1/4 w-0.5 h-full bg-white/20" />
          <div className="absolute inset-y-0 left-1/2 w-0.5 h-full bg-white/20" />
          <div className="absolute inset-y-0 left-3/4 w-0.5 h-full bg-white/20" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {capacityStats.availableCount}/{capacityStats.totalMembers}
        </span>
      </div>
    </Card>
  );
}
