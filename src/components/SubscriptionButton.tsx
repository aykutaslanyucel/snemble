
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionButtonProps {
  className?: string;
}

export function SubscriptionButton({ className }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      // Call the create-checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error("Error invoking create-checkout:", error);
        throw new Error(`Failed to create checkout session: ${error.message || 'Unknown error'}`);
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      console.log("Checkout URL received:", data.url);
      
      // Redirect to the checkout page
      window.location.href = data.url;
      
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
