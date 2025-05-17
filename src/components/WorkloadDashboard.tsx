
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import WorkloadSummary from "@/components/WorkloadSummary";
import { TeamMember } from "@/types/TeamMemberTypes";
import { exportCapacityReport } from "@/utils/pptxExport";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/styles/animations.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkloadDashboardProps {
  members: TeamMember[];
}

export function WorkloadDashboard({ members }: WorkloadDashboardProps) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  useEffect(() => {
    const handleExportEvent = () => {
      handleExportToPowerPoint();
    };
    
    window.addEventListener("export-capacity-report", handleExportEvent);
    
    return () => {
      window.removeEventListener("export-capacity-report", handleExportEvent);
    };
  }, [members]);
  
  const handleExportToPowerPoint = () => {
    if (!members || members.length === 0) {
      toast({
        title: "Export Failed",
        description: "No team members to export",
        variant: "destructive",
      });
      return;
    }
    
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

  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      // Toggle sort order if same field is selected again
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(value);
      // Default sort orders for different fields
      if (value === "name") {
        setSortOrder("asc");
      } else if (value === "lastUpdated") {
        setSortOrder("desc"); // Newest first
      } else if (value === "role") {
        setSortOrder("asc");
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="role">Role</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportToPowerPoint}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to PowerPoint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
