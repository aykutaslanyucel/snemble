
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SparkleIcon, Loader2 } from 'lucide-react';

interface SubscriptionButtonProps {
  text?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
}

export function SubscriptionButton({
  text = "Upgrade to Premium",
  variant = "default",
  className = ""
}: SubscriptionButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const PRICE_ID = "price_1OaGdZOCWA5HpHYPF8880g";  // Replace with your actual Stripe price ID
  
  const handleClick = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade to Premium",
          variant: "destructive",
        });
        return;
      }
      
      // Set up the success and cancel URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/payment-success`;
      const cancelUrl = `${origin}/payment-cancel`;
      
      console.log("Creating checkout session...");
      console.log("Success URL:", successUrl);
      console.log("Cancel URL:", cancelUrl);
      
      // Get the user's JWT token
      const { data: { session }, error: tokenError } = await supabase.auth.getSession();
      
      if (tokenError || !session) {
        throw new Error("Failed to get auth session");
      }
      
      // Call the Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_id: PRICE_ID,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });
      
      console.log("Checkout response:", data);
      
      if (error) {
        throw new Error(`Checkout error: ${error.message || "Unknown error"}`);
      }
      
      if (!data || !data.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      variant={variant} 
      className={`gap-2 ${className}`} 
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SparkleIcon className="h-4 w-4" />
      )}
      {text}
    </Button>
  );
}

export default SubscriptionButton;
