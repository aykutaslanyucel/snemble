
export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away' | 'vacation';

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
  | string; // Allow string for dynamic roles from the database

// Define gradient animation types
export type GradientAnimationType = 'none' | 'gentle' | 'smooth' | 'energetic' | 'dramatic';

// Define gradient types
export type GradientType = 'linear' | 'radial';

// Define badge position types
export type BadgePosition = 'top-right' | 'bottom-right';

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
  badgePosition?: BadgePosition;
  badgeSize?: 'small' | 'medium' | 'large';
  backgroundImage?: string;
  [key: string]: any; // Allow additional properties from database
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
  vacationStart?: Date;
  vacationEnd?: Date;
  isOnVacation?: boolean;
}

export interface Announcement {
  id: string;
  message: string;
  htmlContent?: string;  // For rich text content
  timestamp: Date;
  expiresAt?: Date;      // When the announcement should expire
  priority?: number;     // For ordering announcements
  theme?: {              // Theme customization
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    animationStyle?: 'scroll' | 'fade' | 'flash' | 'none';
    [key: string]: any; // Allow additional properties from database
  };
  isActive?: boolean;    // Whether the announcement is currently active
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
