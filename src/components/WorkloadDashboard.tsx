
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { WorkloadSummary } from "@/components/WorkloadSummary";
import { TeamMember } from "@/types/TeamMemberTypes";
import { exportCapacityReport } from "@/utils/pptxExport";

interface WorkloadDashboardProps {
  members: TeamMember[];
}

export function WorkloadDashboard({ members }: WorkloadDashboardProps) {
  useEffect(() => {
    const handleExportEvent = () => {
      exportCapacityReport(members);
    };
    
    window.addEventListener("export-capacity-report", handleExportEvent);
    
    return () => {
      window.removeEventListener("export-capacity-report", handleExportEvent);
    };
  }, [members]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <Card className="p-8 bg-card dark:bg-black/40 backdrop-blur-md border dark:border-white/5 shadow-xl rounded-2xl w-full">
        <WorkloadSummary members={members} showOnlyCapacity={false} showStatusOnly={true} />
      </Card>
      <Card className="p-8 bg-card dark:bg-black/40 backdrop-blur-md border dark:border-white/5 shadow-xl rounded-2xl w-full">
        <WorkloadSummary members={members} showOnlyCapacity={false} showHistoricalOnly={true} />
      </Card>
    </div>
  );
}
