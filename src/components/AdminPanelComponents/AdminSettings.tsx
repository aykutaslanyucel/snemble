
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AdminSettings() {
  const { settings } = useAdminSettings();
  const badgesEnabled = settings?.badges_enabled === undefined ? true : settings?.badges_enabled === true;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>General Configuration</CardTitle>
          <CardDescription>
            Configure general settings for your team dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the tabs below to configure specific features of the platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
