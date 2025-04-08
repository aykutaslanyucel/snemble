
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  ChevronDown, 
  ChevronUp, 
  CircleDot, 
  Clock, 
  Loader2, 
  UserCheck
} from "lucide-react";
import { TeamMember as TeamMemberType, TeamMemberStatus } from "@/types/TeamMemberTypes";

interface WorkloadSummaryProps {
  members: TeamMemberType[];
  showOnlyCapacity?: boolean;
  showStatusOnly?: boolean;
  showHistoricalOnly?: boolean;
}

const statusColors: { [key in TeamMemberStatus]: string } = {
  available: "text-green-500",
  busy: "text-red-500",
  seriouslyBusy: "text-red-700",
  away: "text-yellow-500",
  someAvailability: "text-blue-500",
};

const statusLabels: { [key in TeamMemberStatus]: string } = {
  available: "Available",
  busy: "Busy",
  seriouslyBusy: "Seriously Busy",
  away: "Away",
  someAvailability: "Some Availability",
};

export function WorkloadSummary({ members, showOnlyCapacity, showStatusOnly, showHistoricalOnly }: WorkloadSummaryProps) {
  const totalMembers = members.length;
  const availableMembers = members.filter(
    (member) => member.status === "available"
  ).length;
  const busyMembers = members.filter((member) => member.status === "busy").length;
  const awayMembers = members.filter((member) => member.status === "away").length;
  const someAvailabilityMembers = members.filter(
    (member) => member.status === "someAvailability"
  ).length;

  const workloadData = members.map((member) => ({
    name: member.name,
    projects: member.projects.length,
  }));

  const avgProjectsPerMember =
    totalMembers > 0 ? members.reduce((acc, member) => acc + member.projects.length, 0) / totalMembers : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Team Status</p>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <UserCheck className="h-4 w-4 mr-1" />
              {totalMembers} Members
            </Badge>
            <Badge variant="outline" className={statusColors["available"]}>
              <CircleDot className="h-4 w-4 mr-1" />
              {availableMembers} Available
            </Badge>
            <Badge variant="outline" className={statusColors["busy"]}>
              <CircleDot className="h-4 w-4 mr-1" />
              {busyMembers} Busy
            </Badge>
            <Badge variant="outline" className={statusColors["away"]}>
              <CircleDot className="h-4 w-4 mr-1" />
              {awayMembers} Away
            </Badge>
            <Badge variant="outline" className={statusColors["someAvailability"]}>
              <CircleDot className="h-4 w-4 mr-1" />
              {someAvailabilityMembers} Some Availability
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Workload Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projects" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-muted-foreground">
            Average projects per member: {avgProjectsPerMember.toFixed(1)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
