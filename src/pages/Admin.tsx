
import React, { useState } from "react";
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
import { UserManagement } from "@/components/AdminPanelComponents/UserManagement";

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("settings");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-8 space-y-12">
        <div className="flex items-center justify-between">
          <NavigationHeader 
            isAdmin={true} 
            members={[]}
            handleLogout={async () => logout()}
            showTeamSelector={false}
            hideCapacityWidget={true}
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, teams, and system settings
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="border-b bg-muted/40">
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>
              Manage your team workspace settings
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="w-full flex justify-start overflow-x-auto mb-6 bg-muted/50">
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10">General Settings</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary/10">User Management</TabsTrigger>
              <TabsTrigger value="badges" className="data-[state=active]:bg-primary/10">Badge Management</TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-primary/10">Team Management</TabsTrigger>
              <TabsTrigger value="stripe" className="data-[state=active]:bg-primary/10">Stripe Settings</TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-primary/10">User Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4 mt-2">
              <AdminSettings />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4 mt-2">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-4 mt-2">
              <BadgeManager />
            </TabsContent>

            <TabsContent value="teams" className="space-y-4 mt-2">
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
            
            <TabsContent value="stripe" className="space-y-4 mt-2">
              <StripeSettings />
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4 mt-2">
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
        </Card>
      </div>
    </div>
  );
}
