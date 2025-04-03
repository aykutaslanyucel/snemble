
import { AlertTriangle, CheckCircle, Circle } from "lucide-react";
import { TeamMember } from "@/types/TeamMemberTypes";

export interface ProjectWorkload {
  name: string;
  score: number;
  category: 'severelyOverloaded' | 'highWorkload' | 'balancedWorkload' | 'lowWorkload' | 'inactive';
  assignedMembers: TeamMember[];
}

// Status point values for workload calculation
export const STATUS_POINTS = {
  available: 3,
  someAvailability: 2,
  busy: 1,
  seriouslyBusy: 0,
  away: 0 // Away members are excluded from calculation
};

// Updated modern color palette for 2025 design trend
export const CATEGORY_COLORS = {
  severelyOverloaded: "#FF8080", // Refined red
  highWorkload: "#FFBB66", // Refined amber
  balancedWorkload: "#A8DEBC", // Refined green
  lowWorkload: "#ACCBEE", // Refined blue
  inactive: "#E0E0E0" // Refined gray
};

// Category names with shorter labels for minimalistic design
export const CATEGORY_NAMES = {
  severelyOverloaded: "Critical",
  highWorkload: "High",
  balancedWorkload: "Balanced",
  lowWorkload: "Available",
  inactive: "Inactive"
};

// Icons for categories - simplified
export const CATEGORY_ICONS = {
  severelyOverloaded: AlertTriangle,
  highWorkload: AlertTriangle,
  balancedWorkload: CheckCircle,
  lowWorkload: CheckCircle,
  inactive: Circle
};

export interface Props {
  members: TeamMember[];
}
