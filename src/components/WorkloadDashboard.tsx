
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WorkloadSummary from "@/components/WorkloadSummary";
import { FileDown } from "lucide-react";
import { exportCapacityReport } from "@/utils/powerPointExport";
import { TeamMember } from "@/types/TeamMemberTypes";

interface WorkloadDashboardProps {
  members: TeamMember[];
}

export function WorkloadDashboard({ members }: WorkloadDashboardProps) {
  const handleExportCapacityReport = () => {
    exportCapacityReport(members);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Workload</h2>
        <Button 
          variant="outline" 
          onClick={handleExportCapacityReport}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export Capacity Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        <Card className="p-8 bg-card dark:bg-black/40 backdrop-blur-md border dark:border-white/5 shadow-xl rounded-2xl w-full">
          <WorkloadSummary members={members} showOnlyCapacity={false} showStatusOnly={true} />
        </Card>
        <Card className="p-8 bg-card dark:bg-black/40 backdrop-blur-md border dark:border-white/5 shadow-xl rounded-2xl w-full">
          <WorkloadSummary members={members} showOnlyCapacity={false} showHistoricalOnly={true} />
        </Card>
      </div>
    </div>
  );
}
