
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Users, ListTodo } from "lucide-react";
import { motion } from "framer-motion";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface WorkloadData {
  status: string;
  count: number;
}

interface Props {
  members: TeamMember[];
}

export default function WorkloadSummary({ members }: Props) {
  const workloadData = [
    { status: "Available", count: members.filter(m => m.status === "available").length },
    { status: "Some Availability", count: members.filter(m => m.status === "someAvailability").length },
    { status: "Busy", count: members.filter(m => m.status === "busy").length },
    { status: "Seriously Busy", count: members.filter(m => m.status === "seriouslyBusy").length },
    { status: "Away", count: members.filter(m => m.status === "away").length },
  ];

  const availableMembers = members.filter(m => m.status === "available");
  const totalCapacity = members.length * 100;
  const usedCapacity = members.reduce((acc, member) => {
    const statusWeights = {
      available: 0,
      someAvailability: 25,
      busy: 50,
      seriouslyBusy: 75,
      away: 100,
    };
    return acc + statusWeights[member.status];
  }, 0);

  const capacityPercentage = (usedCapacity / totalCapacity) * 100;

  // Get unique projects and members participating
  const projectsWithMembers = members.reduce((acc, member) => {
    member.projects.forEach(project => {
      if (!acc[project]) {
        acc[project] = new Set();
      }
      acc[project].add(member.name);
    });
    return acc;
  }, {} as Record<string, Set<string>>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <Card className="p-6 col-span-2">
        <h3 className="text-lg font-semibold mb-4">Team Workload Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Capacity</h3>
            <Thermometer className="h-5 w-5 text-muted-foreground" />
          </div>
          <Progress value={capacityPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {capacityPercentage.toFixed(0)}% capacity utilized
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Available Team Members</h3>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {availableMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members currently available</p>
            ) : (
              availableMembers.map(member => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{member.name}</span>
                  <Badge variant="secondary">{member.position}</Badge>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Projects</h3>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {Object.entries(projectsWithMembers).map(([project, members]) => (
              <motion.div
                key={project}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <Badge className="w-full justify-between" variant="outline">
                  {project}
                  <span className="text-xs text-muted-foreground">
                    {members.size} members
                  </span>
                </Badge>
                <div className="absolute z-10 invisible group-hover:visible bg-popover text-popover-foreground p-2 rounded-md shadow-lg -top-2 left-full ml-2 text-sm min-w-[200px]">
                  <p className="font-semibold mb-1">Team Members:</p>
                  <ul className="list-disc list-inside">
                    {Array.from(members).map(member => (
                      <li key={member} className="text-xs">{member}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
