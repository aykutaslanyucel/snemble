
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

const statusWeights = {
  available: 0,
  someAvailability: 33.33,
  busy: 66.67,
  seriouslyBusy: 100,
  away: 0,
};

export default function WorkloadSummary({ members, showOnlyCapacity = false }: Props) {
  const workloadData = Object.entries(statusLabels).map(([status, label]) => ({
    status: label,
    count: members.filter(m => m.status === status).length,
    color: statusColors[status as TeamMemberStatus],
  }));

  const activeMembers = members.filter(m => m.status !== "away");
  const usedCapacity = activeMembers.reduce((acc, member) => {
    return acc + statusWeights[member.status];
  }, 0);

  const maxPossibleCapacity = activeMembers.length * 100;
  const capacityPercentage = maxPossibleCapacity ? Math.min((usedCapacity / maxPossibleCapacity) * 100, 100) : 0;

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
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${capacityPercentage}%`,
              background: getCapacityGradient(capacityPercentage),
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {capacityPercentage.toFixed(0)}% capacity utilized
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4">
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
  );
}
