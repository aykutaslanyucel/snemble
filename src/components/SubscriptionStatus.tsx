
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { checkUserSubscription } from "@/utils/stripeHelpers";
import { SubscriptionButton } from './SubscriptionButton';
import { ManageSubscriptionButton } from './ManageSubscriptionButton';
import { format } from 'date-fns';

interface SubscriptionStatusProps {
  className?: string;
}

interface SubscriptionDetails {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // Use the helper function to check subscription status
      const subscriptionDetails = await checkUserSubscription();
      setStatus(subscriptionDetails);
      
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    
    // Check subscription status every minute
    const interval = setInterval(fetchSubscriptionStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Subscription Status
          {status?.subscribed && (
            <Badge className="bg-green-500">{status.subscription_tier}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {loading ? "Checking subscription status..." : (
            status?.subscribed 
              ? "You have an active subscription" 
              : "Upgrade to access premium features"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : status?.subscribed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Tier</div>
              <div className="font-medium">{status.subscription_tier}</div>
              
              <div className="text-muted-foreground">Renews</div>
              <div className="font-medium">
                {status.subscription_end && format(new Date(status.subscription_end), "MMM d, yyyy")}
              </div>
            </div>
            
            <ManageSubscriptionButton className="w-full mt-4" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to Premium to unlock all features and customize your experience.
            </p>
            <SubscriptionButton className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
