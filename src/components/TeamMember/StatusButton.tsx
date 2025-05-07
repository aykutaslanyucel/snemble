
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";
import { Check, User, Clock, X, Coffee } from "lucide-react";

interface StatusButtonProps {
  status: TeamMemberStatus;
  currentStatus: TeamMemberStatus;
  onClick: (status: TeamMemberStatus) => void;
  color: string;
  tooltip: string;
}

export function StatusButton({ status, currentStatus, onClick, color, tooltip }: StatusButtonProps) {
  const getIcon = () => {
    switch (status) {
      case "available":
        return <Check className="h-4 w-4 text-gray-700" />;
      case "someAvailability":
        return <User className="h-4 w-4 text-gray-700" />;
      case "busy":
        return <Clock className="h-4 w-4 text-gray-700" />;
      case "seriouslyBusy":
        return <X className="h-4 w-4 text-gray-700" />;
      case "away":
        return <Coffee className="h-4 w-4 text-gray-700" />;
      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            onClick(status);
          }}
          className={`w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center transition-all ${
            currentStatus === status ? 'ring-2 ring-white transform scale-105' : 'hover:scale-105'
          }`}
          style={{ 
            border: currentStatus === status ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(0,0,0,0.05)'
          }}
          aria-label={tooltip}
        >
          {getIcon()}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 w-auto">
        <p className="text-xs">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
}
