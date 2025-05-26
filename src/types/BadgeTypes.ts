
export interface BadgeData {
  id: string;
  name: string;
  description?: string | null;
  image_url: string;
  is_active: boolean | null;
  visibility: 'public' | 'premium' | string; // Allow string for database flexibility
  created_at: string | null;
}
