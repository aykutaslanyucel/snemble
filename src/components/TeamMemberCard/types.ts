
import { LucideIcon, CheckCircle, User, Clock, XCircle, Coffee } from "lucide-react";
import { TeamMemberRole } from "@/types/TeamMemberTypes";

export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  role?: TeamMemberRole;
  userId?: string;
  customization?: {
    color?: string;
    texture?: string;
    hat?: string;
    emoji?: string;
  };
}

export interface StatusConfig {
  color: string;
  iconColor: string;
  icon: LucideIcon;
  label: string;
}

export const statusConfig: Record<TeamMemberStatus, StatusConfig> = {
  available: {
    color: "bg-[#D6E4FF]/90 hover:bg-[#D6E4FF]",
    iconColor: "text-blue-600",
    icon: CheckCircle,
    label: "Available"
  },
  someAvailability: {
    color: "bg-[#C8EAD7]/90 hover:bg-[#C8EAD7]",
    iconColor: "text-green-600",
    icon: User,
    label: "Some Availability"
  },
  busy: {
    color: "bg-[#FFD8A8]/90 hover:bg-[#FFD8A8]",
    iconColor: "text-orange-600",
    icon: Clock,
    label: "Busy"
  },
  seriouslyBusy: {
    color: "bg-[#FFA3A3]/90 hover:bg-[#FFA3A3]",
    iconColor: "text-red-600",
    icon: XCircle,
    label: "Seriously Busy"
  },
  away: {
    color: "bg-[#C4C4C4]/90 hover:bg-[#C4C4C4]",
    iconColor: "text-gray-600",
    icon: Coffee,
    label: "Away"
  }
};

export interface Props {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}
