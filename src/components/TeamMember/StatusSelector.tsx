
import React from "react";
import { StatusButton } from "./StatusButton";
import { TeamMemberStatus } from "@/types/TeamMemberTypes";

// Status button configs with tooltips
const STATUS_BUTTONS = [
  { status: "available", tooltip: "Available" },
  { status: "someAvailability", tooltip: "Some Availability" },
  { status: "busy", tooltip: "Busy" },
  { status: "seriouslyBusy", tooltip: "Seriously Busy" },
  { status: "away", tooltip: "Away" },
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
          tooltip={statusBtn.tooltip}
        />
      ))}
    </div>
  );
}
