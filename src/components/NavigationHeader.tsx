
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TeamHeader } from "@/components/TeamHeader";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

export function NavigationHeader({
  isAdmin,
  handleLogout,
}: {
  isAdmin: boolean;
  members?: any[];
  handleLogout: () => Promise<void>;
}) {
  const { isImpersonating, stopImpersonation } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Team logo" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">Team Dashboard</h1>
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

        <div className="flex items-center space-x-2">
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
      <TeamHeader />
    </div>
  );
}
