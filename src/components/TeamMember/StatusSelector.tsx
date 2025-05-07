
import React from "react";
import { StatusButton } from "./StatusButton";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";

// Status button configs with icons, colors and labels
const STATUS_BUTTONS = [
  { status: "available", color: "#D3E4FD", tooltip: "Available" },
  { status: "someAvailability", color: "#F2FCE2", tooltip: "Some Availability" },
  { status: "busy", color: "#FEF7CD", tooltip: "Busy" },
  { status: "seriouslyBusy", color: "#FFDEE2", tooltip: "Seriously Busy" },
  { status: "away", color: "#E5E5E5", tooltip: "Away" },
];

interface StatusSelectorProps {
  currentStatus: TeamMemberStatus;
  onStatusChange: (status: TeamMemberStatus) => void;
}

export function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  return (
    <div className="flex items-center space-x-1 mb-1">
      {STATUS_BUTTONS.map((statusBtn) => (
        <StatusButton
          key={statusBtn.status}
          status={statusBtn.status as TeamMemberStatus}
          currentStatus={currentStatus}
          onClick={onStatusChange}
          color={statusBtn.color}
          tooltip={statusBtn.tooltip}
        />
      ))}
    </div>
  );
}
