
export type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
  user_id?: string;
  role?: string;
  customization?: {
    color?: string;
    texture?: string;
    hat?: string;
    emoji?: string;
  };
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: Date;
}
