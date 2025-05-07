
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            onClick(status);
          }}
          className={`w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all ${
            currentStatus === status 
              ? 'shadow-md transform scale-105' 
              : 'shadow-sm hover:scale-105'
          }`}
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
