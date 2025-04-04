
export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';
export type TeamMemberRole = 'Assistant' | 'Associate' | 'Senior Associate' | 'Managing Associate' | 'Counsel' | 'Partner';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  userId?: string; // Added to track the user who owns this team member
  customization?: {
    color?: string;
    texture?: string;
    hat?: string;
    emoji?: string;
  };
  role?: TeamMemberRole;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}
