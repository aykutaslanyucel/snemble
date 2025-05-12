
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "@/types/TeamMemberTypes";
import { Json } from "@/integrations/supabase/types";

export const saveAnnouncement = async (announcement: Announcement): Promise<boolean> => {
  try {
    console.log("Saving announcement:", announcement);
    
    // Convert theme object to JSON compatible format
    let theme: any;
    if (announcement.theme) {
      // Make a copy to avoid modifying the original object
      theme = { ...announcement.theme };
    }
    
    // Ensure required fields are present
    if (!announcement.message && !announcement.htmlContent) {
      console.error("Error saving announcement: message or htmlContent is required");
      throw new Error("Message or HTML content is required");
    }

    const announcementData = {
      id: announcement.id,
      message: announcement.message || "",
      html_content: announcement.htmlContent || "",
      timestamp: announcement.timestamp.toISOString(),
      expires_at: announcement.expiresAt?.toISOString(),
      priority: announcement.priority || 0,
      theme: theme as Json,
      is_active: announcement.isActive === undefined ? true : announcement.isActive
    };
    
    const { error, data } = await supabase
      .from('announcements')
      .insert(announcementData);

    if (error) {
      console.error("Error saving announcement:", error);
      throw error;
    }
    
    console.log("Announcement saved successfully", data);
    return true;
  } catch (error) {
    console.error("Exception in saveAnnouncement:", error);
    throw error;
  }
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<boolean> => {
  try {
    console.log(`Updating announcement ${id} with:`, data);
    
    const updateData: Record<string, any> = {};
    
    if (data.message !== undefined) updateData.message = data.message;
    if (data.htmlContent !== undefined) updateData.html_content = data.htmlContent;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt?.toISOString();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    // Handle theme separately to ensure proper JSON conversion
    if (data.theme !== undefined) {
      // Make a copy to avoid modifying the original object
      updateData.theme = { ...data.theme } as Json;
    }
    
    const { error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
    
    console.log("Announcement updated successfully");
    return true;
  } catch (error) {
    console.error("Exception in updateAnnouncement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting announcement ${id}`);
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
    
    console.log("Announcement deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception in deleteAnnouncement:", error);
    throw error;
  }
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    console.log("Fetching announcements");
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} announcements`);
    
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

// Set up a real-time subscription for announcements
export const subscribeToAnnouncements = (
  callback: (announcements: Announcement[]) => void
): (() => void) => {
  console.log("Setting up announcements subscription");
  
  // First fetch all announcements
  fetchAnnouncements()
    .then(announcements => {
      callback(announcements);
    })
    .catch(err => {
      console.error('Error in initial announcements fetch:', err);
      callback([]);
    });
  
  // Then set up real-time changes
  const channel = supabase
    .channel('announcements_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'announcements' },
      async (payload) => {
        console.log('Received announcement update:', payload);
        // Re-fetch all announcements when any change occurs
        try {
          const allAnnouncements = await fetchAnnouncements();
          callback(allAnnouncements);
        } catch (error) {
          console.error('Error refreshing announcements:', error);
        }
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    try {
      supabase.removeChannel(channel);
      console.log('Unsubscribed from announcements changes');
    } catch (error) {
      console.error('Error unsubscribing from announcements changes:', error);
    }
  };
};
