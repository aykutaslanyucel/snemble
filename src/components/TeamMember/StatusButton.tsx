
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";

interface StatusButtonProps {
  status: TeamMemberStatus;
  currentStatus: TeamMemberStatus;
  onClick: (status: TeamMemberStatus) => void;
  color: string;
  tooltip: string;
}

export function StatusButton({ status, currentStatus, onClick, color, tooltip }: StatusButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            onClick(status);
          }}
          className={`status-button w-8 h-8 rounded-full transition-all flex items-center justify-center ${currentStatus === status ? 'active ring-2 ring-white/30 transform scale-110 shadow-lg' : ''}`}
          style={{ 
            backgroundColor: color,
            border: currentStatus === status ? '2px solid rgba(255,255,255,0.5)' : '1px solid transparent'
          }}
          aria-label={tooltip}
        />
      </PopoverTrigger>
      <PopoverContent className="p-1 w-auto">
        <p className="text-xs">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
}
