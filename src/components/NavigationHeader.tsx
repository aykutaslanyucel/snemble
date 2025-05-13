
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, AlertCircle, ChevronDown, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CapacityTrackerWidget } from "@/components/CapacityTrackerWidget";
import { TeamMember } from "@/types/TeamMemberTypes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TeamSelector } from "@/components/TeamSelector";

export function NavigationHeader({
  isAdmin,
  handleLogout,
  members,
  showTeamSelector = true,
}: {
  isAdmin: boolean;
  members?: TeamMember[];
  handleLogout: () => Promise<void>;
  showTeamSelector?: boolean;
}) {
  const { isImpersonating, stopImpersonation } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between py-6 border-b pb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Team logo" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            {showTeamSelector ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <h1 className="text-2xl font-semibold">Team Dashboard</h1>
                    <ChevronDown className="h-4 w-4 text-muted-foreground mt-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  <TeamSelector userId={undefined} isAdmin={isAdmin} inDropdown={true} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-2xl font-semibold">Team Dashboard</h1>
            )}
          </div>
        </div>

        {isImpersonating && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Previewing as User
            <Button 
              onClick={() => stopImpersonation?.()} 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-yellow-800 hover:bg-yellow-200"
            >
              Exit Preview
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <CapacityTrackerWidget members={members} />
          
          {isAdmin && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/admin" className="flex items-center">
                <Settings className="mr-1 h-4 w-4" /> Admin
              </Link>
            </Button>
          )}
          
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
