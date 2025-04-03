
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { TeamMembers } from "@/components/TeamMembers";
import { ProjectHeatmap } from "@/components/ProjectHeatmap";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchAndActions } from "@/components/SearchAndActions";
import { WorkloadDashboard } from "@/components/WorkloadDashboard";
import { ProjectList } from "@/components/ProjectList";
import { AvailableMembersList } from "@/components/AvailableMembersList";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function Dashboard() {
  const { 
    members, 
    filteredMembers, 
    availableMembers, 
    activeProjects,
    projectsWithMembers,
    searchQuery, 
    setSearchQuery, 
    handleAddMember, 
    handleUpdateMember, 
    handleDeleteMember 
  } = useTeamMembers();

  const {
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    handleAddAnnouncement,
    latestAnnouncement
  } = useAnnouncements();

  const { isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {latestAnnouncement && <AnnouncementBanner announcement={latestAnnouncement} />}
      
      <div className="container py-12 space-y-10">
        <NavigationHeader 
          isAdmin={isAdmin} 
          members={members} 
          handleLogout={handleLogout} 
        />
        
        <SearchAndActions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddMember={handleAddMember}
          announcements={announcements}
          newAnnouncement={newAnnouncement}
          onAnnouncementChange={setNewAnnouncement}
          onAddAnnouncement={handleAddAnnouncement}
          members={members}
          isAdmin={isAdmin}
        />

        <TeamMembers
          members={filteredMembers}
          onUpdate={handleUpdateMember}
          onDelete={handleDeleteMember}
        />

        <WorkloadDashboard members={members} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProjectList 
            activeProjects={activeProjects}
            projectsWithMembers={projectsWithMembers}
          />
          
          <AvailableMembersList availableMembers={availableMembers} />
        </div>
        
        <ProjectHeatmap members={members} />
      </div>
    </div>
  );
}
