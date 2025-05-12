
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

export default function Admin() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-8 space-y-6">
        <NavigationHeader isAdmin={true} members={[]} handleLogout={async () => {}} />
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage your team workspace settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="settings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="settings">General Settings</TabsTrigger>
                <TabsTrigger value="badges">Badge Management</TabsTrigger>
                <TabsTrigger value="stripe">Stripe Settings</TabsTrigger>
                <TabsTrigger value="users">User Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-4">
                <AdminSettings />
              </TabsContent>
              
              <TabsContent value="badges" className="space-y-4">
                <BadgeManager />
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
