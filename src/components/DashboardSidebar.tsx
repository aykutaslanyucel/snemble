
import React from "react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { CapacityTrackerWidget } from "@/components/CapacityTrackerWidget";
import WorkloadSummary from "@/components/WorkloadSummary";

interface DashboardSidebarProps {
  members: TeamMember[];
  filteredMembers: TeamMember[];
}

export function DashboardSidebar({ members, filteredMembers }: DashboardSidebarProps) {
  return (
    <div className="space-y-6">
      <CapacityTrackerWidget members={members} />
      <WorkloadSummary members={filteredMembers} />
    </div>
  );
}
