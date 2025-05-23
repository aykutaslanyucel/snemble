
export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away' | 'vacation';

// Allow string for dynamic roles from the database
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

// Define a consistent customization interface that allows for flexible properties
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

// Define the theme type to accept both strings and objects
export type AnnouncementThemeValue = 'info' | 'warning' | 'success' | 'destructive' | string;

// Announcement theme with flexible properties for different styles
export interface AnnouncementTheme {
  backgroundColor?: string; 
  textColor?: string;
  borderColor?: string;
  animationStyle?: 'scroll' | 'fade' | 'flash' | 'none';
  [key: string]: any; // Allow additional properties from database
}

export interface Announcement {
  id: string;
  message: string;
  htmlContent?: string;  // For rich text content
  timestamp: Date;
  expiresAt?: Date;      // When the announcement should expire
  priority?: number;     // For ordering announcements
  theme?: AnnouncementTheme | AnnouncementThemeValue;  // Allow both object and string values
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
