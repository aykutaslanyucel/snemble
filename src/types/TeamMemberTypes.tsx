
// This file contains the type definitions for the TeamMember component
export type TeamMemberStatus = 
  | "available"
  | "someAvailability"
  | "busy"
  | "seriouslyBusy"
  | "away";

export type TeamMemberRole = "user" | "admin" | "premium";

export interface TeamMemberCustomization {
  color?: string;
  gradient?: string;
  animate?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  user_id: string;
  role?: TeamMemberRole;
  customization?: TeamMemberCustomization;
}

// Type for announcement banners
export interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}
