import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, Announcement } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchAndActions } from "@/components/SearchAndActions";
import { MemberGrid } from "@/components/MemberGrid";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
    }
  }, [user]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order(sortBy, { ascending: true });

        if (error) {
          console.error("Error fetching team members:", error);
          toast({
            title: "Error",
            description: "Failed to load team members. Please refresh.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setMembers(data);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please refresh.",
          variant: "destructive",
        });
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('priority', { ascending: false })
          .order('timestamp', { ascending: false });

        if (error) {
          console.error("Error fetching announcements:", error);
          toast({
            title: "Error",
            description: "Failed to load announcements. Please refresh.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Convert timestamp strings to Date objects
          const announcementsWithDates = data.map(announcement => ({
            ...announcement,
            timestamp: new Date(announcement.timestamp),
            expiresAt: announcement.expires_at ? new Date(announcement.expires_at) : null
          }));
          setAnnouncements(announcementsWithDates);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast({
          title: "Error",
          description: "Failed to load announcements. Please refresh.",
          variant: "destructive",
        });
      }
    };

    fetchMembers();
    fetchAnnouncements();

    // Subscribe to member changes
    const membersSubscription = supabase
      .channel('public:team_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, (payload) => {
        console.log('Team member change received!', payload)
        fetchMembers();
      })
      .subscribe()
    
    // Subscribe to announcement changes
    const announcementSubscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
        console.log('Announcement change received!', payload)
        fetchAnnouncements();
      })
      .subscribe()

    return () => {
      supabase.removeChannel(membersSubscription)
      supabase.removeChannel(announcementSubscription)
    };
  }, [sortBy, toast, user]);

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = [...members];

    if (searchTerm) {
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Already sorted by the useEffect based on sortBy
    return filtered;
  }, [members, searchTerm]);

  const handleMemberUpdate = async (id: string, data: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error("Error updating team member:", error);
        throw error;
      }

      setMembers(members.map(member => member.id === id ? { ...member, ...data } : member));
      toast({
        title: "Success",
        description: "Team member updated successfully.",
      });
    } catch (error) {
      console.error("Error updating team member:", error);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMemberDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("Error deleting team member:", error);
        throw error;
      }

      setMembers(members.filter(member => member.id !== id));
      toast({
        title: "Success",
        description: "Team member deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnouncement = (announcement: Announcement) => {
    setAnnouncements([...announcements, announcement]);
  };

  const handleUpdateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === id ? { ...announcement, ...data } : announcement
    ));
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting announcement:", error);
        throw error;
      }

      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      toast({
        title: "Success",
        description: "Announcement deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <AnnouncementBanner 
        announcements={announcements}
        onDelete={isAdmin ? handleDeleteAnnouncement : undefined}
      />
      
      <div className="container max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-8 space-y-12">
        <NavigationHeader 
          isAdmin={isAdmin}
          members={members}
          handleLogout={logout}
          showTeamSelector={true}
          hideCapacityWidget={false}
        />
        
        <SearchAndActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          members={members}
          announcements={announcements}
          onAddAnnouncement={handleAddAnnouncement}
          onUpdateAnnouncement={handleUpdateAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          isAdmin={isAdmin}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MemberGrid 
              members={filteredAndSortedMembers}
              onMemberUpdate={handleMemberUpdate}
              onMemberDelete={handleMemberDelete}
            />
          </div>
          
          <div className="lg:col-span-1">
            <DashboardSidebar 
              members={members}
              filteredMembers={filteredAndSortedMembers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
