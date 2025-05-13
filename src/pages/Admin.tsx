
import React from "react";
import { AdminSettings } from "@/components/AdminPanelComponents/AdminSettings";
import { BadgeManager } from "@/components/AdminPanelComponents/BadgeManager";
import { StripeSettings } from "@/components/AdminPanelComponents/StripeSettings";
import { UserImpersonation } from "@/components/UserImpersonation";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { TeamManagement } from "@/components/AdminPanelComponents/TeamManagement";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Admin() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <NavigationHeader 
            isAdmin={true} 
            members={[]}
            handleLogout={async () => logout()}
            showTeamSelector={false}
          />
          
          <Button asChild variant="outline" size="sm" className="flex items-center">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage your team workspace settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="settings" className="space-y-4">
              <TabsList className="w-full flex justify-start overflow-x-auto">
                <TabsTrigger value="settings">General Settings</TabsTrigger>
                <TabsTrigger value="badges">Badge Management</TabsTrigger>
                <TabsTrigger value="teams">Team Management</TabsTrigger>
                <TabsTrigger value="stripe">Stripe Settings</TabsTrigger>
                <TabsTrigger value="users">User Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-4">
                <AdminSettings />
              </TabsContent>
              
              <TabsContent value="badges" className="space-y-4">
                <BadgeManager />
              </TabsContent>

              <TabsContent value="teams" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                      Create and manage teams and control visibility settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamManagement />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stripe" className="space-y-4">
                <StripeSettings />
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Preview</CardTitle>
                    <CardDescription>
                      Preview the application as a different user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserImpersonation />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
