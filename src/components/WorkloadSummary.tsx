
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
  available: "#E5DEFF",
  someAvailability: "#D3E4FD",
  busy: "#FDE1D3",
  seriouslyBusy: "#FFDEE2",
  away: "#F1F0FB",
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
  someAvailability: 25,
  busy: 50,
  seriouslyBusy: 100,
  away: 0,
};

const DonutChart = ({ percentage, color, label, count }: { percentage: number; color: string; label: string; count: number }) => (
  <div className="relative w-24 h-24">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#eee"
        strokeWidth="2"
      />
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={`${percentage}, 100`}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="text-xl font-semibold">{count}</span>
      <span className="text-xs text-gray-600 mt-1">{label}</span>
    </div>
  </div>
);

export default function WorkloadSummary({ members, showOnlyCapacity = false }: Props) {
  const workloadData = Object.entries(statusLabels).map(([status, label]) => {
    const count = members.filter(m => m.status === status).length;
    const totalMembers = members.length;
    const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
    
    return {
      status: label,
      count,
      color: statusColors[status as TeamMemberStatus],
      percentage,
    };
  });

  const activeMembers = members.filter(m => m.status !== "away");
  const availableMembers = members.filter(m => m.status === "available");
  const usedCapacity = activeMembers.reduce((acc, member) => {
    return acc + statusWeights[member.status];
  }, 0);

  const maxPossibleCapacity = activeMembers.length * 100;
  const capacityPercentage = maxPossibleCapacity ? Math.min((usedCapacity / maxPossibleCapacity) * 100, 100) : 0;

  if (showOnlyCapacity) {
    return (
      <Card className="w-72 p-4 bg-white border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Team Capacity</h3>
            <p className="text-sm text-gray-600">
              {availableMembers.length} members available
            </p>
          </div>
          <Thermometer className="h-5 w-5 text-fuchsia-400" />
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${capacityPercentage}%`,
              background: `linear-gradient(to right, ${statusColors.available}, ${statusColors.seriouslyBusy})`,
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {workloadData.map((data) => (
        <motion.div
          key={data.status}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <DonutChart
            percentage={data.percentage}
            color={data.color}
            label={data.status}
            count={data.count}
          />
        </motion.div>
      ))}
    </div>
  );
}
