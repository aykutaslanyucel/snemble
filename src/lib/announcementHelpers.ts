
import { Announcement } from "@/types/TeamMemberTypes";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Saves an announcement to Supabase
 */
export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  try {
    const { message, htmlContent, timestamp, expiresAt, priority, theme, isActive, id } = announcement;
    
    const announcementId = id || uuidv4();
    
    const { error } = await supabase
      .from('announcements')
      .insert({
        id: announcementId,
        message,
        html_content: htmlContent,
        timestamp: timestamp.toISOString(),
        expires_at: expiresAt?.toISOString(),
        priority,
        theme,
        is_active: isActive
      });
      
    if (error) {
      console.error("Error saving announcement:", error);
      throw new Error(`Failed to save announcement: ${error.message}`);
    }
    
    console.log("Announcement saved successfully with ID:", announcementId);
  } catch (error) {
    console.error("Error in saveAnnouncement:", error);
    throw error;
  }
}

/**
 * Updates an existing announcement
 */
export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (data.message !== undefined) updateData.message = data.message;
    if (data.htmlContent !== undefined) updateData.html_content = data.htmlContent;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt?.toISOString();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating announcement:", error);
      throw new Error(`Failed to update announcement: ${error.message}`);
    }
    
    console.log("Announcement updated successfully:", id);
  } catch (error) {
    console.error("Error in updateAnnouncement:", error);
    throw error;
  }
}

/**
 * Deletes an announcement
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting announcement:", error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
    
    console.log("Announcement deleted successfully:", id);
  } catch (error) {
    console.error("Error in deleteAnnouncement:", error);
    throw error;
  }
}

/**
 * Fetches all announcements
 */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false });
    
    if (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
    
    if (!data) return [];
    
    // Transform the data to match our Announcement type
    return data.map(item => ({
      id: item.id,
      message: item.message || '',
      htmlContent: item.html_content,
      timestamp: new Date(item.timestamp),
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
      priority: item.priority,
      theme: item.theme as any,
      isActive: item.is_active
    }));
  } catch (error) {
    console.error("Error in fetchAnnouncements:", error);
    throw error;
  }
}
