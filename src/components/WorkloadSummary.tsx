import React from "react";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

interface WorkloadSummaryProps {
  members: TeamMember[];
  showOnlyCapacity?: boolean;
}

export default function WorkloadSummary({ members, showOnlyCapacity = false }: WorkloadSummaryProps) {
  // Count members by status
  const statusCounts = {
    available: 0,
    someAvailability: 0,
    busy: 0,
    seriouslyBusy: 0,
    away: 0,
  };

  members.forEach((member) => {
    statusCounts[member.status]++;
  });

  // Calculate total capacity
  const totalMembers = members.length;
  const availableCapacity = statusCounts.available + statusCounts.someAvailability * 0.5;
  const capacityPercentage = totalMembers > 0 
    ? Math.round((availableCapacity / totalMembers) * 100) 
    : 0;

  // Determine capacity color
  let capacityColor = "text-green-600";
  if (capacityPercentage < 30) {
    capacityColor = "text-red-600";
  } else if (capacityPercentage < 60) {
    capacityColor = "text-orange-600";
  }

  if (showOnlyCapacity) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="font-medium">Team Capacity:</div>
        <div className={`font-bold ${capacityColor}`}>
          {capacityPercentage}%
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Team Workload Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Available</span>
            <span className="font-medium text-blue-600">{statusCounts.available}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Some Availability</span>
            <span className="font-medium text-green-600">{statusCounts.someAvailability}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Busy</span>
            <span className="font-medium text-orange-600">{statusCounts.busy}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Seriously Busy</span>
            <span className="font-medium text-red-600">{statusCounts.seriouslyBusy}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Away</span>
            <span className="font-medium text-gray-600">{statusCounts.away}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t">
            <span className="text-sm font-medium">Team Capacity</span>
            <span className={`font-bold ${capacityColor}`}>{capacityPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
