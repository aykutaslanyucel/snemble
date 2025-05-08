
import React from "react";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, User, Clock, X, Coffee, Calendar } from "lucide-react";

interface StatusSelectorProps {
  currentStatus: TeamMemberStatus;
  onStatusChange: (status: TeamMemberStatus) => void;
}

export function StatusSelector({
  currentStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const handleStatusChange = (value: string) => {
    onStatusChange(value as TeamMemberStatus);
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>Available</span>
          </div>
        </SelectItem>
        <SelectItem value="someAvailability">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-blue-600" />
            <span>Some Availability</span>
          </div>
        </SelectItem>
        <SelectItem value="busy">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-yellow-600" />
            <span>Busy</span>
          </div>
        </SelectItem>
        <SelectItem value="seriouslyBusy">
          <div className="flex items-center">
            <X className="h-4 w-4 mr-2 text-red-600" />
            <span>Seriously Busy</span>
          </div>
        </SelectItem>
        <SelectItem value="away">
          <div className="flex items-center">
            <Coffee className="h-4 w-4 mr-2 text-gray-600" />
            <span>Away</span>
          </div>
        </SelectItem>
        <SelectItem value="vacation">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
            <span>Vacation</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
