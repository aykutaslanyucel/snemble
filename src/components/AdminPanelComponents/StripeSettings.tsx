
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function StripeSettings() {
  const { settings, updateSetting, loading } = useAdminSettings();
  const [stripeApiKey, setStripeApiKey] = useState(settings?.stripe_api_key || "");
  const [stripeEnabled, setStripeEnabled] = useState(settings?.stripe_enabled || false);
  const [testMode, setTestMode] = useState(settings?.stripe_test_mode || true);
  const [priceId, setPriceId] = useState(settings?.stripe_price_id || "");
  const { toast } = useToast();

  // Update state when settings change
  useEffect(() => {
    if (settings) {
      setStripeApiKey(settings.stripe_api_key || "");
      setStripeEnabled(settings.stripe_enabled || false);
      setTestMode(settings.stripe_test_mode === undefined ? true : settings.stripe_test_mode);
      setPriceId(settings.stripe_price_id || "");
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      // Save all Stripe settings
      await updateSetting('stripe_enabled', stripeEnabled);
      await updateSetting('stripe_test_mode', testMode);
      await updateSetting('stripe_price_id', priceId);
      
      // Only save API key if it's not empty and different from placeholder
      if (stripeApiKey && stripeApiKey !== "•••••••••••••••••••••") {
        await updateSetting('stripe_api_key', stripeApiKey);
      }
      
      toast({
        title: "Settings saved",
        description: "Your Stripe settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving Stripe settings:", error);
      toast({
        title: "Error",
        description: "Failed to save Stripe settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Premium Subscription Settings
          {stripeEnabled && <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>}
        </CardTitle>
        <CardDescription>
          Configure Stripe for premium subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="stripe-enabled">Enable Premium Subscriptions</Label>
            <p className="text-sm text-muted-foreground">
              Allow users to upgrade to premium
            </p>
          </div>
          <Switch
            id="stripe-enabled"
            checked={stripeEnabled}
            onCheckedChange={setStripeEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="test-mode">Test Mode</Label>
            <p className="text-sm text-muted-foreground">
              Use Stripe test environment
            </p>
          </div>
          <Switch
            id="test-mode"
            checked={testMode}
            onCheckedChange={setTestMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripe-api-key">Stripe API Key</Label>
          <Input
            id="stripe-api-key"
            value={stripeApiKey || ""}
            onChange={(e) => setStripeApiKey(e.target.value)}
            type="password"
            placeholder="sk_test_..."
          />
          <p className="text-xs text-muted-foreground">
            Your Stripe secret key 
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-id">Premium Plan Price ID</Label>
          <Input
            id="price-id"
            value={priceId || ""}
            onChange={(e) => setPriceId(e.target.value)}
            placeholder="price_1234..."
          />
          <p className="text-xs text-muted-foreground">
            The Stripe Price ID for your premium subscription
          </p>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-500">Implementation Required</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-600 mt-1">
                This is a configuration UI only. You'll need additional server-side implementation to process subscriptions securely.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
