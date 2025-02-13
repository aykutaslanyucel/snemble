import { Card } from "@/components/ui/card";
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

interface Props {
  members: TeamMember[];
  showOnlyCapacity?: boolean;
}

const statusColors = {
  available: "from-[#D6E4FF] to-[#ADC8FF]",
  someAvailability: "from-[#C8EAD7] to-[#9DDBB6]",
  busy: "from-[#FFD8A8] to-[#FFB870]",
  seriouslyBusy: "from-[#FFA3A3] to-[#FF7070]",
  away: "from-[#C4C4C4] to-[#9A9A9A]",
};

const statusLabels = {
  available: "Available",
  someAvailability: "Some Availability",
  busy: "Busy",
  seriouslyBusy: "Seriously Busy",
  away: "Away",
};

export default function WorkloadSummary({ members, showOnlyCapacity = false }: Props) {
  const workloadData = Object.entries(statusLabels).map(([status, label]) => ({
    status: label,
    count: members.filter(m => m.status === status).length,
    color: statusColors[status as TeamMemberStatus],
  }));

  const availableMembers = members.filter(m => m.status === "available");
  const totalCapacity = members.filter(m => m.status !== "away").length * 100;
  const usedCapacity = members.reduce((acc, member) => {
    if (member.status === "away") return acc;
    const statusWeights = {
      available: 0,
      someAvailability: 25,
      busy: 50,
      seriouslyBusy: 75,
      away: 0,
    };
    return acc + statusWeights[member.status];
  }, 0);

  const capacityPercentage = totalCapacity ? (usedCapacity / totalCapacity) * 100 : 0;

  const getCapacityGradient = (percentage: number) => {
    if (percentage <= 25) return "linear-gradient(to right, #8B5CF6, #D946EF)"; // Vivid purple to magenta
    if (percentage <= 50) return "linear-gradient(to right, #D946EF, #F97316)"; // Magenta to bright orange
    if (percentage <= 75) return "linear-gradient(to right, #F97316, #EF4444)"; // Bright orange to red
    return "linear-gradient(to right, #EF4444, #DC2626)"; // Red to dark red
  };

  if (showOnlyCapacity) {
    return (
      <Card className="w-72 p-4 bg-white border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Team Capacity</h3>
          <Thermometer className="h-5 w-5 text-fuchsia-400" />
        </div>
        <Progress 
          value={capacityPercentage} 
          className="h-2 bg-gray-100"
          style={{
            background: getCapacityGradient(capacityPercentage),
          }}
        />
        <p className="text-sm text-gray-600 mt-2">
          {capacityPercentage.toFixed(0)}% capacity utilized
        </p>
      </Card>
    );
  }

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
    <div className="container mx-auto">
      <div className="flex justify-end mb-8">
        <Card className="w-72 p-6 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-lg border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Capacity</h3>
            <Thermometer className="h-5 w-5 text-fuchsia-400" />
          </div>
          <Progress 
            value={capacityPercentage} 
            className="h-2 bg-white/10"
            style={{
              background: `linear-gradient(to right, #D6E4FF, #FFD8A8 ${capacityPercentage}%, transparent ${capacityPercentage}%)`,
            }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {capacityPercentage.toFixed(0)}% capacity utilized
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {workloadData.map((data) => (
          <motion.div
            key={data.status}
            className={`aspect-square rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center p-6 relative overflow-hidden group`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center">
              <span className="text-4xl font-bold">{data.count}</span>
              <p className="text-sm mt-2 opacity-80">{data.status}</p>
            </div>
            <motion.div
              className="absolute inset-0 bg-white/5"
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
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
