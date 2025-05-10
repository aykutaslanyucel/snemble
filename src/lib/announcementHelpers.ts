
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "@/types/TeamMemberTypes";
import { Json } from "@/integrations/supabase/types";

export const saveAnnouncement = async (announcement: Announcement) => {
  try {
    const { error } = await supabase
      .from('announcements')
      .insert({
        id: announcement.id,
        message: announcement.message,
        html_content: announcement.htmlContent,
        timestamp: announcement.timestamp.toISOString(),
        expires_at: announcement.expiresAt?.toISOString(),
        priority: announcement.priority,
        theme: announcement.theme as Json,
        is_active: announcement.isActive
      });

    if (error) {
      console.error("Error saving announcement:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in saveAnnouncement:", error);
    throw error;
  }
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
  try {
    const updateData: any = {};
    
    if (data.message !== undefined) updateData.message = data.message;
    if (data.htmlContent !== undefined) updateData.html_content = data.htmlContent;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt?.toISOString();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.theme !== undefined) updateData.theme = data.theme as Json;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateAnnouncement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in deleteAnnouncement:", error);
    throw error;
  }
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      message: item.message || "",
      htmlContent: item.html_content,
      timestamp: new Date(item.timestamp),
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
      priority: item.priority || 0,
      theme: item.theme as Announcement['theme'],
      isActive: item.is_active === undefined ? true : item.is_active
    }));
  } catch (error) {
    console.error("Exception in fetchAnnouncements:", error);
    throw error;
  }
};
