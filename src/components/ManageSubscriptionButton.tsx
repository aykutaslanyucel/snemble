
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { openCustomerPortal } from "@/utils/stripeHelpers";

interface ManageSubscriptionButtonProps {
  className?: string;
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // Use the helper function to get the customer portal URL
      const portalUrl = await openCustomerPortal();
      
      // Redirect to the customer portal
      window.location.href = portalUrl;
      
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to open subscription management portal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleManageSubscription} 
      className={className}
      variant="outline"
      disabled={loading}
    >
      <Settings className="mr-2 h-4 w-4" />
      {loading ? "Loading..." : "Manage Subscription"}
    </Button>
  );
}
