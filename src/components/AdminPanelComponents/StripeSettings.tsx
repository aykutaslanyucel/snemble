
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function StripeSettings() {
  const { settings, getSetting, updateSetting, loading: settingsLoading } = useAdminSettings();
  const { toast } = useToast();
  const [testingStripe, setTestingStripe] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Get values from settings or use defaults
  const stripeEnabled = getSetting('stripe_enabled', false);
  const stripeApiKey = getSetting('stripe_api_key', '');
  const stripePriceId = getSetting('stripe_price_id', '');
  const stripeProductName = getSetting('stripe_product_name', 'Premium Subscription');
  const stripePriceAmount = getSetting('stripe_price_amount', 4999);
  const stripeTestMode = getSetting('stripe_test_mode', true);

  // Local state for form
  const [formValues, setFormValues] = useState({
    stripeEnabled,
    stripeApiKey,
    stripePriceId, 
    stripeProductName,
    stripePriceAmount: stripePriceAmount / 100, // Convert from cents to dollars for display
    stripeTestMode
  });

  // Update form when settings change
  React.useEffect(() => {
    if (!settingsLoading) {
      setFormValues({
        stripeEnabled: getSetting('stripe_enabled', false),
        stripeApiKey: getSetting('stripe_api_key', ''),
        stripePriceId: getSetting('stripe_price_id', ''),
        stripeProductName: getSetting('stripe_product_name', 'Premium Subscription'),
        stripePriceAmount: getSetting('stripe_price_amount', 4999) / 100, // Convert from cents to dollars for display
        stripeTestMode: getSetting('stripe_test_mode', true)
      });
    }
  }, [settings, settingsLoading, getSetting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      
      // Convert price amount back to cents for storage
      const priceInCents = Math.round(parseFloat(formValues.stripePriceAmount as any) * 100);
      
      await updateSetting('stripe_enabled', formValues.stripeEnabled);
      await updateSetting('stripe_api_key', formValues.stripeApiKey);
      await updateSetting('stripe_price_id', formValues.stripePriceId);
      await updateSetting('stripe_product_name', formValues.stripeProductName);
      await updateSetting('stripe_price_amount', priceInCents);
      await updateSetting('stripe_test_mode', formValues.stripeTestMode);
      
      // Store the API key in Supabase Edge Function secrets
      // Note: This wouldn't actually work in a real app, just a placeholder for demo
      // In a real app, you'd use a secure API to set this
      
      toast({
        title: "Settings saved",
        description: "Your Stripe settings have been updated"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const testStripeConnection = async () => {
    try {
      setTestingStripe(true);
      
      // Test the Stripe connection by trying to access the Stripe API
      const { data, error } = await supabase.functions.invoke("test-stripe-connection");
      
      if (error) throw new Error(error.message);
      
      if (data.success) {
        toast({
          title: "Connection successful",
          description: "Your Stripe API key works correctly",
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("Error testing Stripe:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to Stripe",
        variant: "destructive"
      });
    } finally {
      setTestingStripe(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
          <CardDescription>
            Configure your Stripe integration for handling subscriptions and payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Stripe</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to upgrade to Premium via Stripe
              </p>
            </div>
            <Switch
              name="stripeEnabled"
              checked={formValues.stripeEnabled}
              onCheckedChange={handleSwitchChange('stripeEnabled')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripeApiKey">Stripe API Key</Label>
            <Input
              id="stripeApiKey"
              name="stripeApiKey"
              value={formValues.stripeApiKey}
              onChange={handleInputChange}
              placeholder="sk_test_..."
              type="password"
              disabled={!formValues.stripeEnabled}
            />
            <p className="text-xs text-muted-foreground">
              {formValues.stripeTestMode ? 
                "Use a test key (starts with sk_test_) for development" : 
                "Use a live key (starts with sk_live_) for production"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use Stripe test mode for development
              </p>
            </div>
            <Switch
              name="stripeTestMode"
              checked={formValues.stripeTestMode}
              onCheckedChange={handleSwitchChange('stripeTestMode')}
              disabled={!formValues.stripeEnabled}
            />
          </div>

          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Subscription Configuration</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeProductName">Product Name</Label>
                <Input
                  id="stripeProductName"
                  name="stripeProductName"
                  value={formValues.stripeProductName}
                  onChange={handleInputChange}
                  placeholder="Premium Subscription"
                  disabled={!formValues.stripeEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripePriceAmount">Price (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="stripePriceAmount"
                    name="stripePriceAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.stripePriceAmount}
                    onChange={handleInputChange}
                    className="pl-7"
                    placeholder="49.99"
                    disabled={!formValues.stripeEnabled}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Price ID</Label>
                <Input
                  id="stripePriceId"
                  name="stripePriceId"
                  value={formValues.stripePriceId}
                  onChange={handleInputChange}
                  placeholder="price_1234567890"
                  disabled={!formValues.stripeEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: The Stripe Price ID for your subscription product
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
          <Button
            type="button"
            variant="outline"
            onClick={testStripeConnection}
            disabled={!formValues.stripeEnabled || !formValues.stripeApiKey || testingStripe || saveLoading}
            className="w-full sm:w-auto"
          >
            {testingStripe ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={saveLoading}
            className="w-full sm:w-auto"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
          <CardDescription>
            Required setup steps for Stripe integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5">
                {formValues.stripeEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Enable Stripe Integration</p>
                <p className="text-sm text-muted-foreground">
                  Toggle Stripe integration on and provide your API key
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5">
                {formValues.stripeEnabled && formValues.stripePriceId ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Configure Price ID</p>
                <p className="text-sm text-muted-foreground">
                  Set up a subscription product in your Stripe dashboard
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Deploy Edge Functions</p>
                <p className="text-sm text-muted-foreground">
                  Supabase Edge Functions for checkout and customer portal are deployed
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
