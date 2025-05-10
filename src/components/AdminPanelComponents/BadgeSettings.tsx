
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function BadgeSettings() {
  const { settings, updateSetting, loading, fetchSettings } = useAdminSettings();
  const [badgesEnabled, setBadgesEnabled] = useState<boolean>(
    settings?.badges_enabled === undefined ? true : !!settings?.badges_enabled
  );
  const { toast } = useToast();
  
  // Update local state when settings change
  useEffect(() => {
    if (settings?.badges_enabled !== undefined) {
      console.log("Setting badges_enabled from settings:", settings.badges_enabled);
      setBadgesEnabled(!!settings.badges_enabled);
    }
  }, [settings]);
  
  const handleSave = async () => {
    try {
      console.log("Saving badge settings:", badgesEnabled);
      await updateSetting('badges_enabled', badgesEnabled);
      toast({
        title: "Settings updated",
        description: `Badges are now ${badgesEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating badge settings:', error);
      toast({
        title: "Error",
        description: "Failed to update badge settings.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badge Settings</CardTitle>
        <CardDescription>
          Control how badges are displayed across the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="badges-enabled">Enable Badges</Label>
            <p className="text-sm text-muted-foreground">
              Allow premium users to display badges on their cards
            </p>
          </div>
          <Switch
            id="badges-enabled"
            checked={badgesEnabled}
            onCheckedChange={(checked) => {
              console.log("Switch toggled to:", checked);
              setBadgesEnabled(checked);
            }}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
