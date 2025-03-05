import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Users, ListTodo, Briefcase, Star, Shield, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
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
  role?: 'Associate' | 'Senior Associate' | 'Managing Associate' | 'Partner' | 'Assistant';
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

const roleIcons = {
  'Associate': Briefcase,
  'Senior Associate': Star,
  'Managing Associate': Star,
  'Partner': Shield,
  'Assistant': UserCog,
};

const roleColors = {
  'Associate': "#D6BCFA",
  'Senior Associate': "#9b87f5",
  'Managing Associate': "#7E69AB",
  'Partner': "#6E59A5",
  'Assistant': "#F1F0FB",
};

const roleGroups = {
  'Associate': 'Associate',
  'Senior / Managing': 'Senior / Managing',
  'Partner': 'Partner',
  'Assistant': 'Assistant',
};

const generateMockHistoricalData = (period: 'month' | 'year') => {
  const data = [];
  const intervals = period === 'month' ? 4 : 12;
  const dateFunc = period === 'month' ? subMonths : subYears;
  
  for (let i = intervals - 1; i >= 0; i--) {
    const date = dateFunc(new Date(), i);
    data.push({
      date: format(startOfWeek(date), 'MMM d'),
      capacity: Math.floor(Math.random() * 40) + 60,
    });
  }
  return data;
};

const DonutChart = ({ percentage, color, label, count, icon: Icon }: { percentage: number; color: string; label: string; count: number; icon?: React.ElementType }) => (
  <div className="relative w-24 h-24">
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
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${percentage} 100`}
        transform="rotate(-90 18 18)"
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      {Icon && <Icon className="h-3 w-3 mb-0.5" />}
      <span className="text-xl font-semibold">{count}</span>
      <span className="text-xs text-gray-600 leading-tight max-w-full px-1">{label}</span>
    </div>
  </div>
);

function determineRoleFromPosition(position: string): TeamMember['role'] {
  position = position.toLowerCase();
  
  if (position.includes('partner')) return 'Partner';
  if (position.includes('senior') || position.includes('lead')) return 'Senior Associate';
  if (position.includes('managing')) return 'Managing Associate';
  if (position.includes('assistant') || position.includes('admin')) return 'Assistant';
  
  return 'Associate';
}

export default function WorkloadSummary({ members, showOnlyCapacity = false }: Props) {
  const [timeRange, setTimeRange] = React.useState<'month' | 'year'>('month');
  const [showRoleMetrics, setShowRoleMetrics] = React.useState<boolean>(true);
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

  const roleMetricsData = React.useMemo(() => {
    const membersWithRoles = members.map(member => ({
      ...member,
      role: member.role || determineRoleFromPosition(member.position)
    }));

    const roleGroups = {
      'Associate': membersWithRoles.filter(m => m.role === 'Associate'),
      'Senior / Managing': membersWithRoles.filter(m => 
        m.role === 'Senior Associate' || m.role === 'Managing Associate'
      ),
      'Partner': membersWithRoles.filter(m => m.role === 'Partner'),
      'Assistant': membersWithRoles.filter(m => m.role === 'Assistant'),
    };

    return Object.entries(roleGroups)
      .filter(([_, groupMembers]) => groupMembers.length > 0)
      .map(([groupName, groupMembers]) => {
        const totalCapacity = groupMembers.reduce((acc, member) => {
          return acc + (member.status !== 'away' ? statusWeights[member.status] : 0);
        }, 0);
        
        const maxPossibleCapacity = groupMembers.filter(m => m.status !== 'away').length * 100;
        const capacityPercentage = maxPossibleCapacity > 0 
          ? Math.min((totalCapacity / maxPossibleCapacity) * 100, 100) 
          : 0;
        
        const roleColor = groupName === 'Senior / Managing' 
          ? roleColors['Senior Associate'] 
          : roleColors[groupName.split(' /')[0] as keyof typeof roleColors] || '#E5DEFF';
        
        const roleIcon = groupName === 'Senior / Managing'
          ? roleIcons['Senior Associate']
          : roleIcons[groupName.split(' /')[0] as keyof typeof roleIcons];

        return {
          role: groupName,
          count: groupMembers.length,
          percentage: capacityPercentage,
          color: roleColor,
          icon: roleIcon,
        };
      });
  }, [members]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#E5DEFF] mr-2"></div>
            Team Status
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-2">View by:</span>
            <ToggleGroup 
              type="single" 
              value={showRoleMetrics ? "roles" : "status"} 
              onValueChange={(value) => value && setShowRoleMetrics(value === "roles")}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1"
            >
              <ToggleGroupItem value="status" aria-label="Status view" className="data-[state=on]:bg-white/10 text-xs px-3">
                Status
              </ToggleGroupItem>
              <ToggleGroupItem value="roles" aria-label="Roles view" className="data-[state=on]:bg-white/10 text-xs px-3">
                Roles
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        {showRoleMetrics ? (
          <div className="grid grid-cols-4 gap-4 w-full">
            {roleMetricsData.map((data) => (
              <motion.div
                key={data.role}
                className="flex flex-col items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <DonutChart
                  percentage={data.percentage}
                  color={data.color}
                  label={data.role}
                  count={data.count}
                  icon={data.icon}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 w-full">
            {workloadData.map((data) => (
              <motion.div
                key={data.status}
                className="flex flex-col items-center justify-center"
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
        )}
      </Card>

      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#D3E4FD] mr-2"></div>
            Historical Capacity
          </h3>
          <ToggleGroup 
            type="single" 
            value={timeRange} 
            onValueChange={(value) => value && setTimeRange(value as 'month' | 'year')}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1"
          >
            <ToggleGroupItem value="month" aria-label="Month view" className="data-[state=on]:bg-white/10">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="Year view" className="data-[state=on]:bg-white/10">
              Year
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="h-[250px]">
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
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}
              />
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
