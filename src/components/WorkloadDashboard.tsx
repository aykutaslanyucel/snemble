
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import WorkloadSummary from "@/components/WorkloadSummary";
import { TeamMember } from "@/types/TeamMemberTypes";
import { exportCapacityReport } from "@/utils/pptxExport";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/styles/animations.css";

interface WorkloadDashboardProps {
  members: TeamMember[];
}

export function WorkloadDashboard({ members }: WorkloadDashboardProps) {
  const { toast } = useToast();
  
  useEffect(() => {
    const handleExportEvent = () => {
      exportCapacityReport(members);
    };
    
    window.addEventListener("export-capacity-report", handleExportEvent);
    
    return () => {
      window.removeEventListener("export-capacity-report", handleExportEvent);
    };
  }, [members]);
  
  const handleExportToPowerPoint = () => {
    try {
      exportCapacityReport(members);
      toast({
        title: "Export Started",
        description: "Your PowerPoint export is being generated",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PowerPoint",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={handleExportToPowerPoint}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export to PowerPoint
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
