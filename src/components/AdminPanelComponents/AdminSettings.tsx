
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeSettings } from "./BadgeSettings";
import { BadgeManager } from "./BadgeManager";
import { StripeSettings } from "./StripeSettings";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export function AdminSettings() {
  const { settings } = useAdminSettings();
  const badgesEnabled = settings?.badges_enabled === undefined ? true : settings?.badges_enabled === true;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Settings</h2>
      
      <Tabs defaultValue="badges">
        <TabsList className="mb-4">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges" className="space-y-6">
          <BadgeSettings />
          <BadgeManager badgesEnabled={badgesEnabled} />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-6">
          <StripeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
