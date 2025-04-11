
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkloadSummary } from "@/components/WorkloadSummary";
import { TeamHeader } from "@/components/TeamHeader";
import { TeamMember } from "@/types/TeamMemberTypes";

interface NavigationHeaderProps {
  isAdmin: boolean;
  members: TeamMember[];
  handleLogout: () => Promise<void>;
}

export function NavigationHeader({ isAdmin, members, handleLogout }: NavigationHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <TeamHeader />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
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
