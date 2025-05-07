
export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

// FIXED: Include all role types that are used throughout the application
export type TeamMemberRole = 
  | 'Associate' 
  | 'Senior Associate' 
  | 'Managing Associate' 
  | 'Partner' 
  | 'Assistant' 
  | 'admin' 
  | 'user' 
  | 'premium' 
  | 'Team Lead' 
  | 'Senior Member'
  | 'Junior Associate';

export interface TeamMember {
  id?: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  user_id: string;
  role?: TeamMemberRole;
  customization?: {
    color?: string;
    texture?: string;
    hat?: string;
    emoji?: string;
    gradient?: string;
    animate?: boolean;
  };
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}
