import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Users, ListTodo, Briefcase, Star, Shield, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, subYears, startOfWeek, subWeeks, addDays, setHours, isMonday, previousMonday, endOfDay, getDay } from "date-fns";
import { TeamMember, TeamMemberStatus, TeamMemberRole } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";
interface Props {
  members: TeamMember[];
  showOnlyCapacity?: boolean;
  showStatusOnly?: boolean;
  showHistoricalOnly?: boolean;
}

// Fixed colors for statuses - these will always be consistent
const STATUS_COLORS = {
  available: "#D3E4FD",
  // Blue
  someAvailability: "#F2FCE2",
  // Green
  busy: "#FEF7CD",
  // Yellow
  seriouslyBusy: "#FFDEE2",
  // Red
  away: "#F1F0FB" // Gray
};

// Fixed gradient colors for statuses - these will always be consistent
const STATUS_GRADIENT_COLORS = {
  available: "#B3D4FF",
  // Slightly darker blue
  someAvailability: "#D2ECB2",
  // Slightly darker green
  busy: "#FEE69D",
  // Slightly darker yellow
  seriouslyBusy: "#FFBEC2",
  // Slightly darker red
  away: "#E1E0EB" // Slightly darker gray
};
const STATUS_LABELS = {
  available: "Available",
  someAvailability: "Some Availability",
  busy: "Busy",
  seriouslyBusy: "Seriously Busy",
  away: "Away"
};
const STATUS_WEIGHTS = {
  available: 0,
  someAvailability: 25,
  busy: 50,
  seriouslyBusy: 100,
  away: 0
};

// Fixed colors for roles - these will always be consistent
// FIXED: Changed to proper type mapping to avoid TypeScript errors
const ROLE_COLORS: Record<string, string> = {
  'Associate': "#D6BCFA",
  'Senior Associate': "#9b87f5",
  'Managing Associate': "#7E69AB",
  'Partner': "#6E59A5",
  'Assistant': "#F1F0FB",
  'Team Lead': "#6E59A5",
  // Same as Partner for consistency
  'Senior Member': "#9b87f5",
  // Same as Senior Associate for consistency
  'user': "#D6BCFA",
  // Same as Associate for consistency
  'admin': "#6E59A5",
  // Same as Partner for consistency
  'premium': "#9b87f5",
  // Same as Senior Associate for consistency
  'Junior Associate': "#D6BCFA" // Same as Associate for consistency
};

// Fixed icons for roles
const ROLE_ICONS: Record<string, React.ElementType> = {
  'Associate': Briefcase,
  'Senior Associate': Star,
  'Managing Associate': Star,
  'Partner': Shield,
  'Assistant': UserCog,
  'Team Lead': Shield,
  // Same as Partner
  'Senior Member': Star,
  // Same as Senior Associate
  'user': Briefcase,
  // Same as Associate
  'admin': Shield,
  // Same as Partner
  'premium': Star,
  // Same as Senior Associate
  'Junior Associate': Briefcase // Same as Associate
};
const ROLE_GROUPS = {
  'Assistant': 'Assistant',
  'Junior Associate': 'Junior Associate',
  'Senior Associate': 'Senior / Managing',
  'Managing Associate': 'Senior / Managing',
  'Partner': 'Partner'
};

// Move this function outside component to prevent recreation on each render
const generateMockHistoricalData = (period: 'month' | 'year') => {
  const data = [];
  const intervals = period === 'month' ? 4 : 12;
  const today = new Date();
  let currentDate = endOfDay(previousMonday(today));
  for (let i = 0; i < intervals; i++) {
    const mondayDate = i === 0 ? currentDate : endOfDay(subWeeks(currentDate, i));
    const baseCapacity = 75;
    // Use a deterministic calculation instead of Math.random()
    const variance = Math.sin(i * 0.5) * 15;
    const capacity = Math.floor(baseCapacity + variance);
    data.unshift({
      date: format(mondayDate, 'MMM d'),
      capacity: Math.min(Math.max(capacity, 40), 95),
      fullDate: mondayDate
    });
  }
  return data.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
};
const chartVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
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
  hidden: {
    scale: 0.9,
    opacity: 0
  },
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
const DonutChart = ({
  percentage,
  color,
  gradientColor,
  label,
  count,
  icon: Icon,
  index = 0
}: {
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
  return <motion.div className="relative w-32 h-32" variants={donutVariants} initial="hidden" animate="visible" whileHover="hover" custom={index}>
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <defs>
          <linearGradient id={safeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{
            stopColor: color,
            stopOpacity: 1
          }} />
            <stop offset="100%" style={{
            stopColor: finalGradientColor,
            stopOpacity: 0.85
          }} />
          </linearGradient>
        </defs>
        <motion.circle cx="18" cy="18" r="15.91549430918954" fill="none" stroke="#f3f4f6" strokeWidth="3" initial={{
        opacity: 0
      }} animate={{
        opacity: 1,
        transition: {
          delay: index * 0.1,
          duration: 0.5
        }
      }} />
        <motion.circle cx="18" cy="18" r="15.91549430918954" fill="none" stroke={`url(#${safeId})`} strokeWidth="3" strokeDasharray={`${percentage} 100`} transform="rotate(-90 18 18)" strokeLinecap="round" initial={{
        strokeDasharray: "0 100"
      }} animate={{
        strokeDasharray: `${percentage} 100`,
        transition: {
          delay: index * 0.1 + 0.2,
          duration: 1.2,
          ease: "easeOut"
        }
      }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {Icon && <Icon className="h-4 w-4 mb-1" />}
        <motion.span className="text-2xl font-semibold" initial={{
        opacity: 0,
        scale: 0.5
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          delay: index * 0.1 + 0.3,
          duration: 0.5,
          ease: "easeOut"
        }
      }}>{count}</motion.span>
        <motion.span className="text-sm text-gray-600 dark:text-gray-300 leading-tight max-w-full px-1" initial={{
        opacity: 0
      }} animate={{
        opacity: 1,
        transition: {
          delay: index * 0.1 + 0.4,
          duration: 0.5,
          ease: "easeOut"
        }
      }}>{label}</motion.span>
      </div>
    </motion.div>;
};

// Helper function to map role strings to consistent role colors
function getRoleColor(role: string): string {
  return ROLE_COLORS[role] || ROLE_COLORS['Associate'];
}

// Helper function to map role strings to consistent role icons
function getRoleIcon(role: string): React.ElementType {
  return ROLE_ICONS[role] || ROLE_ICONS['Associate'];
}
export default function WorkloadSummary({
  members,
  showOnlyCapacity = false,
  showStatusOnly = false,
  showHistoricalOnly = false
}: Props) {
  const [timeRange, setTimeRange] = React.useState<'month' | 'year'>('month');
  const [showRoleMetrics, setShowRoleMetrics] = React.useState<boolean>(true);

  // Use useMemo to stabilize data across renders
  const historicalData = useMemo(() => generateMockHistoricalData(timeRange), [timeRange]);

  // Use useMemo for workload data to prevent recalculation on each render
  const workloadData = useMemo(() => {
    return Object.entries(STATUS_LABELS).map(([status, label], index) => {
      const statusKey = status as TeamMemberStatus;
      const count = members.filter(m => m.status === statusKey).length;
      const totalMembers = members.length;
      const percentage = totalMembers > 0 ? count / totalMembers * 100 : 0;
      return {
        status: label,
        count,
        color: STATUS_COLORS[statusKey],
        gradientColor: STATUS_GRADIENT_COLORS[statusKey],
        percentage,
        index
      };
    });
  }, [members]);

  // Use useMemo for role metrics data but only include roles that have active members
  const roleMetricsData = useMemo(() => {
    // Get the positions from active members (excluding away status)
    const activeMembers = members.filter(m => m.status !== 'away');
    const activePositions = new Set<string>(activeMembers.map(m => m.position));

    // Group members by their actual positions
    const positionGroups: Record<string, TeamMember[]> = {};
    activeMembers.forEach(member => {
      const position = member.position;
      if (!positionGroups[position]) {
        positionGroups[position] = [];
      }
      positionGroups[position].push(member);
    });

    // Create data for each active position
    return Object.entries(positionGroups).map(([position, groupMembers], index) => {
      const totalCapacity = groupMembers.reduce((acc, member) => {
        return acc + (member.status !== 'away' ? STATUS_WEIGHTS[member.status] : 0);
      }, 0);
      const maxPossibleCapacity = groupMembers.length * 100;
      const capacityPercentage = maxPossibleCapacity > 0 ? Math.min(totalCapacity / maxPossibleCapacity * 100, 100) : 0;

      // Use role color based on position
      const roleColor = getRoleColor(position);
      const darkerRoleColor = roleColor.replace(/^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i, (_, r, g, b) => {
        const darken = (hex: string) => {
          const num = Math.max(0, parseInt(hex, 16) - 20);
          return num.toString(16).padStart(2, '0');
        };
        return `#${darken(r)}${darken(g)}${darken(b)}`;
      });
      return {
        role: position,
        count: groupMembers.length,
        percentage: capacityPercentage,
        color: roleColor,
        gradientColor: darkerRoleColor,
        icon: getRoleIcon(position),
        index
      };
    });
  }, [members]);

  // Calculate capacity once per render with useMemo
  const {
    activeMembers,
    availableMembers,
    capacityPercentage
  } = useMemo(() => {
    const active = members.filter(m => m.status !== "away");
    const available = members.filter(m => m.status === "available" || m.status === "someAvailability");
    const usedCapacity = active.reduce((acc, member) => {
      return acc + STATUS_WEIGHTS[member.status];
    }, 0);
    const maxPossibleCapacity = active.length * 100;
    const capacity = maxPossibleCapacity ? Math.min(usedCapacity / maxPossibleCapacity * 100, 100) : 0;
    return {
      activeMembers: active,
      availableMembers: available,
      capacityPercentage: capacity
    };
  }, [members]);
  if (showOnlyCapacity) {
    return <Card className="w-72 p-4 bg-card border-white/10 dark:border-white/5 dark:bg-black/40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Team Capacity</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {availableMembers.length} members available
            </p>
          </div>
          <Thermometer className="h-5 w-5 text-fuchsia-400" />
        </div>
        <motion.div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden" initial={{
        width: 0
      }} animate={{
        width: "100%",
        transition: {
          duration: 0.7,
          ease: "easeOut"
        }
      }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" initial={{
          width: "0%"
        }} animate={{
          width: `${capacityPercentage}%`,
          transition: {
            duration: 1.2,
            ease: "easeInOut",
            delay: 0.3
          }
        }} style={{
          background: `linear-gradient(to right, ${STATUS_COLORS.available}, ${STATUS_COLORS.seriouslyBusy})`
        }} />
        </motion.div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {capacityPercentage.toFixed(0)}% capacity utilized
        </p>
      </Card>;
  }
  if (showStatusOnly) {
    return <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            
            Team Status
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">View by:</span>
            <ToggleGroup type="single" value={showRoleMetrics ? "roles" : "status"} onValueChange={value => value && setShowRoleMetrics(value === "roles")} className="bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-1">
              <ToggleGroupItem value="status" aria-label="Status view" className="data-[state=on]:bg-white/10 text-xs px-3">
                Status
              </ToggleGroupItem>
              <ToggleGroupItem value="roles" aria-label="Roles view" className="data-[state=on]:bg-white/10 text-xs px-3">
                Roles
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showRoleMetrics ? <motion.div key="roles" className="flex flex-wrap justify-center gap-8 w-full p-4" variants={chartVariants} initial="hidden" animate="visible" exit="exit">
              {roleMetricsData.length > 0 ? roleMetricsData.map((data, idx) => <DonutChart key={data.role} percentage={data.percentage} color={data.color} gradientColor={data.gradientColor} label={data.role} count={data.count} icon={data.icon} index={idx} />) : <div className="text-center py-8 text-muted-foreground">
                  No active team members with status information
                </div>}
            </motion.div> : <motion.div key="status" className="flex flex-wrap justify-center gap-8 w-full p-4" variants={chartVariants} initial="hidden" animate="visible" exit="exit">
              {workloadData.map((data, idx) => <DonutChart key={data.status} percentage={data.percentage} color={data.color} gradientColor={data.gradientColor} label={data.status} count={data.count} index={idx} />)}
            </motion.div>}
        </AnimatePresence>
      </div>;
  }
  if (showHistoricalOnly) {
    return <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            
            Historical Capacity
          </h3>
          <ToggleGroup type="single" value={timeRange} onValueChange={value => value && setTimeRange(value as 'month' | 'year')} className="bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-1">
            <ToggleGroupItem value="month" aria-label="Month view" className="data-[state=on]:bg-white/10">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="Year view" className="data-[state=on]:bg-white/10">
              Year
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <motion.div className="h-[250px]" variants={chartVariants} initial="hidden" animate="visible">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `${value}%`} />
              <Tooltip contentStyle={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }} formatter={value => [`${value}% capacity`]} labelFormatter={label => `${label}`} />
              <Line type="monotone" dataKey="capacity" stroke="#D3E4FD" strokeWidth={2} dot={{
              fill: "#D3E4FD",
              strokeWidth: 2
            }} animationDuration={1500} animationEasing="ease-out" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>;
  }
  return null;
}