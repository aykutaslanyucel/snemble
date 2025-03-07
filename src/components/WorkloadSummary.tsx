import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Users, ListTodo, Briefcase, Star, Shield, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, subYears, startOfWeek, subWeeks, addDays, setHours, isMonday, previousMonday, endOfDay, getDay } from "date-fns";

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
  available: "#D3E4FD",       // Blue
  someAvailability: "#F2FCE2", // Green
  busy: "#FEF7CD",           // Yellow
  seriouslyBusy: "#FFDEE2",   // Red
  away: "#F1F0FB",           // Gray
};

const statusGradientColors = {
  available: "#B3D4FF",       // Slightly darker blue
  someAvailability: "#D2ECB2", // Slightly darker green
  busy: "#FEE69D",           // Slightly darker yellow
  seriouslyBusy: "#FFBEC2",   // Slightly darker red
  away: "#E1E0EB",           // Slightly darker gray
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
  
  const today = new Date();
  let currentDate = endOfDay(previousMonday(today));
  
  for (let i = 0; i < intervals; i++) {
    const mondayDate = i === 0 ? currentDate : endOfDay(subWeeks(currentDate, i));
    
    const baseCapacity = 75;
    const variance = Math.sin(i * 0.5) * 15;
    const capacity = Math.floor(baseCapacity + variance);
    
    data.unshift({
      date: format(mondayDate, 'MMM d'),
      capacity: Math.min(Math.max(capacity, 40), 95),
      fullDate: mondayDate,
    });
  }
  
  return data.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
};

const chartVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.15
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const donutVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

const DonutChart = ({ percentage, color, gradientColor, label, count, icon: Icon, index = 0 }: { 
  percentage: number; 
  color: string; 
  gradientColor?: string;
  label: string; 
  count: number; 
  icon?: React.ElementType;
  index?: number;
}) => {
  const safeId = `gradient-${label.replace(/\s+/g, '-')}`;
  const finalGradientColor = gradientColor || color;
  
  return (
    <motion.div 
      className="relative w-full h-24 sm:w-24 sm:h-24"
      variants={donutVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <defs>
          <linearGradient id={safeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: finalGradientColor, stopOpacity: 0.85 }} />
          </linearGradient>
        </defs>
        <motion.circle
          cx="18"
          cy="18"
          r="15.91549430918954"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: index * 0.1, duration: 0.5 } }}
        />
        <motion.circle
          cx="18"
          cy="18"
          r="15.91549430918954"
          fill="none"
          stroke={`url(#${safeId})`}
          strokeWidth="3"
          strokeDasharray={`${percentage} 100`}
          transform="rotate(-90 18 18)"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 100" }}
          animate={{ 
            strokeDasharray: `${percentage} 100`,
            transition: { 
              delay: index * 0.1 + 0.2, 
              duration: 1.2,
              ease: "easeOut" 
            }
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {Icon && <Icon className="h-3 w-3 mb-0.5" />}
        <motion.span 
          className="text-xl font-semibold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { 
              delay: index * 0.1 + 0.3,
              duration: 0.5,
              ease: "easeOut"
            }
          }}
        >{count}</motion.span>
        <motion.span 
          className="text-xs text-gray-600 leading-tight max-w-full px-1"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { 
              delay: index * 0.1 + 0.4,
              duration: 0.5,
              ease: "easeOut"
            }
          }}
        >{label}</motion.span>
      </div>
    </motion.div>
  );
};

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

  const workloadData = Object.entries(statusLabels).map(([status, label], index) => {
    const statusKey = status as TeamMemberStatus;
    const count = members.filter(m => m.status === statusKey).length;
    const totalMembers = members.length;
    const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
    
    return {
      status: label,
      count,
      color: statusColors[statusKey],
      gradientColor: statusGradientColors[statusKey],
      percentage,
      index,
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
      .map(([groupName, groupMembers], index) => {
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
        
        const darkerRoleColor = roleColor.replace(
          /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,
          (_, r, g, b) => {
            const darken = (hex: string) => {
              const num = Math.max(0, parseInt(hex, 16) - 20);
              return num.toString(16).padStart(2, '0');
            };
            return `#${darken(r)}${darken(g)}${darken(b)}`;
          }
        );

        const roleIcon = groupName === 'Senior / Managing'
          ? roleIcons['Senior Associate']
          : roleIcons[groupName.split(' /')[0] as keyof typeof roleIcons];

        return {
          role: groupName,
          count: groupMembers.length,
          percentage: capacityPercentage,
          color: roleColor,
          gradientColor: darkerRoleColor,
          icon: roleIcon,
          index,
        };
      });
  }, [members]);

  const activeMembers = members.filter(m => m.status !== "away");
  const availableMembers = members.filter(m => m.status === "available" || m.status === "someAvailability");
  const usedCapacity = activeMembers.reduce((acc, member) => {
    return acc + statusWeights[member.status];
  }, 0);

  const maxPossibleCapacity = activeMembers.length * 100;
  const capacityPercentage = maxPossibleCapacity ? Math.min((usedCapacity / maxPossibleCapacity) * 100, 100) : 0;

  if (showOnlyCapacity) {
    return (
      <Card className="w-full sm:w-72 p-4 bg-white border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Team Capacity</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {availableMembers.length} members available
            </p>
          </div>
          <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 text-fuchsia-400" />
        </div>
        <motion.div 
          className="relative h-2 bg-gray-100 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "100%", transition: { duration: 0.7, ease: "easeOut" } }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: `${capacityPercentage}%`, 
              transition: { duration: 1.2, ease: "easeInOut", delay: 0.3 }
            }}
            style={{
              background: `linear-gradient(to right, ${statusColors.available}, ${statusColors.seriouslyBusy})`,
            }}
          />
        </motion.div>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          {capacityPercentage.toFixed(0)}% capacity utilized
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#D3E4FD] mr-2"></div>
            Team Status
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 mr-2">View by:</span>
            <ToggleGroup 
              type="single" 
              value={showRoleMetrics ? "roles" : "status"} 
              onValueChange={(value) => value && setShowRoleMetrics(value === "roles")}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1"
            >
              <ToggleGroupItem value="status" aria-label="Status view" className="data-[state=on]:bg-white/10 text-xs px-2 sm:px-3">
                Status
              </ToggleGroupItem>
              <ToggleGroupItem value="roles" aria-label="Roles view" className="data-[state=on]:bg-white/10 text-xs px-2 sm:px-3">
                Roles
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showRoleMetrics ? (
            <motion.div 
              key="roles"
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full donut-chart-container"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {roleMetricsData.map((data, idx) => (
                <DonutChart
                  key={data.role}
                  percentage={data.percentage}
                  color={data.color}
                  gradientColor={data.gradientColor}
                  label={data.role}
                  count={data.count}
                  icon={data.icon}
                  index={idx}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="status"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full donut-chart-container"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {workloadData.map((data, idx) => (
                <DonutChart
                  key={data.status}
                  percentage={data.percentage}
                  color={data.color}
                  gradientColor={data.gradientColor}
                  label={data.status}
                  count={data.count}
                  index={idx}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#D3E4FD] mr-2"></div>
            Historical Capacity
          </h3>
          <ToggleGroup 
            type="single" 
            value={timeRange} 
            onValueChange={(value) => value && setTimeRange(value as 'month' | 'year')}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1"
          >
            <ToggleGroupItem value="month" aria-label="Month view" className="data-[state=on]:bg-white/10 text-xs px-2 sm:px-3">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="Year view" className="data-[state=on]:bg-white/10 text-xs px-2 sm:px-3">
              Year
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <motion.div 
          className="h-[200px] sm:h-[250px]"
          variants={chartVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => window.innerWidth < 640 ? value.substring(0, 3) : value}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}
                formatter={(value) => [`${value}% capacity`]}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="capacity"
                stroke="#D3E4FD"
                strokeWidth={2}
                dot={{ fill: "#D3E4FD", strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </Card>
    </div>
  );
}
