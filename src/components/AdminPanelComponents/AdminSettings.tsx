
import React, { useState } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";

export function AdminSettings() {
  const { settings, updateSetting, loading } = useAdminSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({
    workspaceName: settings?.workspace_name || 'Team Workspace',
    badgesEnabled: settings?.badges_enabled === undefined ? true : Boolean(settings?.badges_enabled),
    publicSharing: settings?.public_sharing || false,
    analyticsEnabled: settings?.analytics_enabled === undefined ? true : Boolean(settings?.analytics_enabled),
    notificationsEnabled: settings?.notifications_enabled === undefined ? true : Boolean(settings?.notifications_enabled),
    maxTeamSize: settings?.max_team_size || 25
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update all settings
      await updateSetting('workspace_name', formState.workspaceName);
      await updateSetting('badges_enabled', formState.badgesEnabled);
      await updateSetting('public_sharing', formState.publicSharing);
      await updateSetting('analytics_enabled', formState.analyticsEnabled);
      await updateSetting('notifications_enabled', formState.notificationsEnabled);
      await updateSetting('max_team_size', formState.maxTeamSize);
      
      toast({
        title: "Settings saved",
        description: "Your workspace settings have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Configure general settings for your team workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace Name</Label>
            <Input
              id="workspaceName"
              name="workspaceName"
              value={formState.workspaceName}
              onChange={handleInputChange}
              placeholder="Enter workspace name"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Label htmlFor="badgesEnabled">Enable Achievement Badges</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show achievement badges on team member profiles</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow team members to earn and display achievement badges
              </p>
            </div>
            <Switch
              id="badgesEnabled"
              checked={formState.badgesEnabled}
              onCheckedChange={handleSwitchChange('badgesEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="publicSharing">Public Dashboard Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing dashboard with non-team members
              </p>
            </div>
            <Switch
              id="publicSharing"
              checked={formState.publicSharing}
              onCheckedChange={handleSwitchChange('publicSharing')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analyticsEnabled">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Collect anonymous usage data to improve the platform
              </p>
            </div>
            <Switch
              id="analyticsEnabled"
              checked={formState.analyticsEnabled}
              onCheckedChange={handleSwitchChange('analyticsEnabled')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificationsEnabled">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for important updates
              </p>
            </div>
            <Switch
              id="notificationsEnabled"
              checked={formState.notificationsEnabled}
              onCheckedChange={handleSwitchChange('notificationsEnabled')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
            <Input
              id="maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={1}
              max={100}
              value={formState.maxTeamSize}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">
              Set the maximum number of members allowed in this workspace
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
