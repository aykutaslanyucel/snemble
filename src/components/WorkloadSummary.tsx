
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Users, ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, subYears, startOfWeek } from "date-fns";

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

// Mock historical data - in real app, this would come from your backend
const generateMockHistoricalData = (period: 'month' | 'year') => {
  const data = [];
  const intervals = period === 'month' ? 4 : 12;
  const dateFunc = period === 'month' ? subMonths : subYears;
  
  for (let i = intervals - 1; i >= 0; i--) {
    const date = dateFunc(new Date(), i);
    data.push({
      date: format(startOfWeek(date), 'MMM d'),
      capacity: Math.floor(Math.random() * 40) + 60, // Random capacity between 60-100%
    });
  }
  return data;
};

const DonutChart = ({ percentage, color, label, count }: { percentage: number; color: string; label: string; count: number }) => (
  <div className="relative w-16 h-16">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <defs>
        <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      <circle
        cx="18"
        cy="18"
        r="15.91549430918954"
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="3"
      />
      <circle
        cx="18"
        cy="18"
        r="15.91549430918954"
        fill="none"
        stroke={`url(#gradient-${label})`}
        strokeWidth="3"
        strokeDasharray={`${percentage} 100`}
        transform="rotate(-90 18 18)"
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="text-sm font-semibold">{count}</span>
      <span className="text-[10px] text-gray-600">{label}</span>
    </div>
  </div>
);

export default function WorkloadSummary({ members, showOnlyCapacity = false }: Props) {
  const [timeRange, setTimeRange] = React.useState<'month' | 'year'>('month');
  const historicalData = React.useMemo(() => generateMockHistoricalData(timeRange), [timeRange]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Status</h3>
        <div className="grid grid-cols-5 gap-2">
          {workloadData.map((data) => (
            <motion.div
              key={data.status}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
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
      </Card>

      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Historical Capacity</h3>
          <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as 'month' | 'year')}>
            <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="Year view">Year</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="capacity"
                stroke="#E5DEFF"
                strokeWidth={2}
                dot={{ fill: "#E5DEFF", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
