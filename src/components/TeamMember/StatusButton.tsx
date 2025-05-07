
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
          onClick={() => onClick(status)}
          className={`status-button ${currentStatus === status ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          aria-label={tooltip}
        />
      </PopoverTrigger>
      <PopoverContent className="p-1 w-auto">
        <p className="text-xs">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
}
