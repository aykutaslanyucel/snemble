
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startCheckoutProcess } from "@/utils/stripeHelpers";

interface SubscriptionButtonProps {
  className?: string;
}

export function SubscriptionButton({ className }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      // Use the helper function to start checkout process
      const checkoutUrl = await startCheckoutProcess();
      
      // Redirect to the checkout page
      window.location.href = checkoutUrl;
      
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to start the subscription process.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      className={className}
      disabled={loading}
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {loading ? "Preparing Checkout..." : "Subscribe"}
    </Button>
  );
}
