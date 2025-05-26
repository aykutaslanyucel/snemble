
export interface BadgeData {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  visibility: 'public' | 'premium';
  created_at: string;
}
