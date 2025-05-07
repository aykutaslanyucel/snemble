
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";
import { Check, User, Clock, X, Coffee } from "lucide-react";

// Match colors with CardBackground.ts
const STATUS_COLORS = {
  "available": "#dae7ff", // Blue for Available
  "someAvailability": "#cdecdb", // Green for Some Availability
  "busy": "#ffdcb1", // Orange for Busy
  "seriouslyBusy": "#ffacac", // Red/Pink for Seriously Busy
  "away": "#cacaca" // Gray for Away
};

interface StatusButtonProps {
  status: TeamMemberStatus;
  currentStatus: TeamMemberStatus;
  onClick: (status: TeamMemberStatus) => void;
  tooltip: string;
}

export function StatusButton({ status, currentStatus, onClick, tooltip }: StatusButtonProps) {
  const getIcon = () => {
    switch (status) {
      case "available":
        return <Check className="h-3 w-3 text-gray-700" />;
      case "someAvailability":
        return <User className="h-3 w-3 text-gray-700" />;
      case "busy":
        return <Clock className="h-3 w-3 text-gray-700" />;
      case "seriouslyBusy":
        return <X className="h-3 w-3 text-gray-700" />;
      case "away":
        return <Coffee className="h-3 w-3 text-gray-700" />;
      default:
        return null;
    }
  };

  // Get color based on status
  const backgroundColor = STATUS_COLORS[status] || "#F1F0FB";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            onClick(status);
          }}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            currentStatus === status 
              ? 'shadow-md transform scale-105' 
              : 'shadow-sm hover:scale-105'
          }`}
          style={{ 
            backgroundColor: backgroundColor,
            boxShadow: currentStatus === status ? '0 3px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
          }}
          aria-label={tooltip}
        >
          {getIcon()}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2 rounded-xl shadow-lg">
        <p className="text-sm font-medium">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
}
