
import React from "react";
import { motion } from "framer-motion";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { StatusConfig, TeamMemberStatus } from "./types";

interface StatusButtonProps {
  status: TeamMemberStatus;
  currentStatus: TeamMemberStatus;
  onStatusChange: (status: TeamMemberStatus) => void;
  statusConfig: Record<TeamMemberStatus, StatusConfig>;
  canEdit: boolean;
}

export function StatusButton({ 
  status, 
  currentStatus, 
  onStatusChange, 
  statusConfig, 
  canEdit 
}: StatusButtonProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <motion.div
      whileHover={{ scale: canEdit ? 1.1 : 1 }}
      whileTap={{ scale: canEdit ? 0.95 : 1 }}
    >
      <Toggle 
        pressed={currentStatus === status} 
        onPressedChange={() => onStatusChange(status)} 
        className={cn(
          "w-10 h-10 p-0 rounded-full", 
          currentStatus === status ? config.iconColor : "text-gray-400",
          !canEdit && "opacity-70 cursor-not-allowed"
        )}
        disabled={!canEdit}
      >
        <Icon className="h-5 w-5" />
      </Toggle>
    </motion.div>
  );
}
