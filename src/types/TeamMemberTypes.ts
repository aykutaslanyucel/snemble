
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

// Define gradient animation types
export type GradientAnimationType = 'none' | 'gentle' | 'smooth' | 'energetic' | 'dramatic';

// Define gradient types
export type GradientType = 'linear' | 'radial';

// Define a consistent customization interface
export interface TeamMemberCustomization {
  color?: string;
  gradient?: string;
  animate?: boolean;
  animationType?: GradientAnimationType;
  texture?: string;
  gradientType?: GradientType;
  gradientAngle?: string;
  radialPosition?: string;
  badge?: string;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  badgeSize?: 'small' | 'medium' | 'large';
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

// Define Badge interface
export interface Badge {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
}
