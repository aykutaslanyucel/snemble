
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const { user } = useAuth();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setStatus("error");
        setLoading(false);
        return;
      }

      try {
        // Call Supabase Edge Function to verify the payment
        const { data, error } = await supabase.functions.invoke("customer-portal", {
          body: { action: "check_session", session_id: sessionId },
        });

        if (error || !data?.success) {
          throw new Error(error?.message || "Failed to verify payment");
        }

        // Payment verified successfully
        setStatus("success");
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <h1 className="text-xl">Verifying your payment...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {status === "success" ? (
          <>
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for upgrading to Premium! Your account has been successfully upgraded, and you now have access to all premium features.
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <Link to="/account">
                <Button className="w-full">
                  View your account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" /> Return to Home
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold">Payment Verification Issue</h1>
              <p className="text-muted-foreground">
                We couldn't verify your payment at this time. If you completed the payment, your account will be updated shortly. Please contact support if this issue persists.
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <Link to="/">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" /> Return to Home
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
