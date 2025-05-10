
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManageSubscriptionButtonProps {
  className?: string;
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // Call the customer-portal edge function
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error("Error invoking customer-portal:", error);
        throw new Error(`Failed to create customer portal session: ${error.message || 'Unknown error'}`);
      }
      
      if (!data?.url) {
        throw new Error("No customer portal URL returned");
      }
      
      console.log("Customer portal URL received:", data.url);
      
      // Redirect to the customer portal
      window.location.href = data.url;
      
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
