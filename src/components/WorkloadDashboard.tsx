
import React from "react";
import { Card } from "@/components/ui/card";
import WorkloadSummary from "@/components/WorkloadSummary";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface WorkloadDashboardProps {
  members: TeamMember[];
}

export function WorkloadDashboard({ members }: WorkloadDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl w-full">
        <WorkloadSummary members={members} showOnlyCapacity={false} showStatusOnly={true} />
      </Card>
      <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl w-full">
        <WorkloadSummary members={members} showOnlyCapacity={false} showHistoricalOnly={true} />
      </Card>
    </div>
  );
}
