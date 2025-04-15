
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import WorkloadSummary from "@/components/WorkloadSummary";
import { TeamHeader } from "@/components/TeamHeader";
import { useAuth } from "@/contexts/AuthContext";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface NavigationHeaderProps {
  isAdmin: boolean;
  members: TeamMember[];
}

export function NavigationHeader({ isAdmin, members }: NavigationHeaderProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <TeamHeader />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <ThemeToggle />
        </div>
        <WorkloadSummary members={members} showOnlyCapacity />
      </div>
    </div>
  );
}
