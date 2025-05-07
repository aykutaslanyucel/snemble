
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

// Define a consistent customization interface
export interface TeamMemberCustomization {
  color?: string;
  gradient?: string;
  animate?: boolean;
  texture?: string;
  hat?: string;
  emoji?: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  user_id: string;
  role?: TeamMemberRole;
  customization?: TeamMemberCustomization;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}
