import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, subYears, startOfWeek, subWeeks, addDays, setHours, isMonday, previousMonday, endOfDay, getDay } from "date-fns";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

interface WorkloadSummaryProps {
  members: TeamMember[];
  showOnlyCapacity?: boolean;
  showStatusOnly?: boolean;
  showHistoricalOnly?: boolean;
}

const capacityColors = {
  fullCapacity: '#FFA3A3',
  highCapacity: '#FFD8A8',
  mediumCapacity: '#D6E4FF',
  lowCapacity: '#C8EAD7',
  available: '#FFFFFF',
};

const statusColors = {
  available: '#C8EAD7',
  someAvailability: '#D6E4FF',
  busy: '#FFD8A8',
  seriouslyBusy: '#FFA3A3',
  away: '#C4C4C4',
};

const statusLabels: { [key in TeamMemberStatus]: string } = {
  available: 'Available',
  someAvailability: 'Some Availability',
  busy: 'Busy',
  seriouslyBusy: 'Seriously Busy',
  away: 'Away',
};

function generateHistoricalData(members: TeamMember[], timeFrame: 'month' | 'year' = 'month') {
  const now = new Date();
  const startDate = timeFrame === 'month' ? subMonths(now, 1) : subYears(now, 1);
  const endDate = now;
  const timePoints = [];

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    timePoints.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  const historicalData = members.map(member => {
    const data = timePoints.map(date => {
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      let status: TeamMemberStatus = 'available';

      if (isWeekend) {
        status = 'away';
      } else {
        const randomValue = Math.random();
        if (randomValue < 0.25) {
          status = 'available';
        } else if (randomValue < 0.5) {
          status = 'someAvailability';
        } else if (randomValue < 0.75) {
          status = 'busy';
        } else {
          status = 'seriouslyBusy';
        }
      }

      return {
        date,
        status,
        name: member.name,
      };
    });
    return { member, data };
  });

  return historicalData;
}

function summarizeMemberCapacity(member: TeamMember): string {
  const projectCount = member.projects.length;

  if (projectCount >= 5) {
    return 'fullCapacity';
  } else if (projectCount >= 3) {
    return 'highCapacity';
  } else if (projectCount >= 1) {
    return 'mediumCapacity';
  } else {
    return 'lowCapacity';
  }
}

function getStatusColor(status: TeamMemberStatus): string {
  return statusColors[status] || capacityColors.available;
}

function AvailabilityLegend() {
  return (
    <div className="flex items-center space-x-4">
      {Object.entries(statusColors).map(([status, color]) => (
        <div key={status} className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
          <span>{statusLabels[status as TeamMemberStatus]}</span>
        </div>
      ))}
    </div>
  );
}

function CapacityLegend() {
  return (
    <div className="flex items-center space-x-4">
      {Object.entries(capacityColors).map(([capacity, color]) => (
        <div key={capacity} className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
          <span>{capacity}</span>
        </div>
      ))}
    </div>
  );
}

function StatusSummary({ members }: { members: TeamMember[] }) {
  const statusCounts = useMemo(() => {
    return members.reduce((acc: { [key in TeamMemberStatus]: number }, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    }, {
      available: 0,
      someAvailability: 0,
      busy: 0,
      seriouslyBusy: 0,
      away: 0,
    });
  }, [members]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Current Team Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status as TeamMemberStatus) }} />
              <span className="capitalize">{statusLabels[status as TeamMemberStatus]}</span>
            </div>
            <span className="font-bold">{count}</span>
          </Card>
        ))}
      </div>
      <AvailabilityLegend />
    </div>
  );
}

function CapacitySummary({ members }: { members: TeamMember[] }) {
  const capacitySummary = useMemo(() => {
    return members.reduce((acc: { [key: string]: number }, member) => {
      const capacity = summarizeMemberCapacity(member);
      acc[capacity] = (acc[capacity] || 0) + 1;
      return acc;
    }, {});
  }, [members]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Capacity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(capacitySummary).map(([capacity, count]) => (
          <Card key={capacity} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: capacityColors[capacity] }} />
              <span className="capitalize">{capacity}</span>
            </div>
            <span className="font-bold">{count}</span>
          </Card>
        ))}
      </div>
      <CapacityLegend />
    </div>
  );
}

function HistoricalWorkload({ members }: { members: TeamMember[] }) {
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  const historicalData = useMemo(() => generateHistoricalData(members, timeFrame), [members, timeFrame]);

  const data = useMemo(() => {
    const allDates = new Set<Date>();
    historicalData.forEach(item => {
      item.data.forEach(d => allDates.add(d.date));
    });

    const sortedDates = Array.from(allDates).sort((a, b) => a.getTime() - b.getTime());

    return sortedDates.map(date => {
      const dateLabel = format(date, 'MMM dd');
      const dataPoint: { date: string; [key: string]: any } = { date: dateLabel };

      historicalData.forEach(item => {
        const status = item.data.find(d => d.date.getTime() === date.getTime())?.status || 'available';
        dataPoint[item.member.name] = Object.keys(statusColors).findIndex(key => key === status);
      });

      return dataPoint;
    });
  }, [historicalData]);

  const memberNames = useMemo(() => members.map(member => member.name), [members]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historical Workload</h3>
      <Select onValueChange={(value) => setTimeFrame(value as 'month' | 'year')}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="year">Last Year</SelectItem>
        </SelectContent>
      </Select>
      <Card className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, Object.keys(statusColors).length - 1]}
              ticks={[0, 1, 2, 3, 4]}
              tickFormatter={(value) => statusLabels[Object.keys(statusColors)[value] as TeamMemberStatus]}
            />
            <Tooltip />
            {memberNames.map((name, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={name}
                stroke={getColorByIndex(index)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function getColorByIndex(index: number): string {
  return COLORS[index % COLORS.length];
}

export default function WorkloadSummary({
  members,
  showOnlyCapacity,
  showStatusOnly,
  showHistoricalOnly,
}: WorkloadSummaryProps) {
  if (showStatusOnly) {
    return <StatusSummary members={members} />;
  }

  if (showHistoricalOnly) {
    return <HistoricalWorkload members={members} />;
  }

  return (
    <div className="space-y-6">
      {!showOnlyCapacity && <StatusSummary members={members} />}
      {!showStatusOnly && <CapacitySummary members={members} />}
    </div>
  );
}
