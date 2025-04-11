
import { DashboardContainer } from "@/components/DashboardContainer";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function Index() {
  const { loading } = useAuth();
  
  useEffect(() => {
    console.log("Index page rendering - auth loading state:", loading);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8">
        <div className="container space-y-8">
          <Skeleton className="h-16 w-full max-w-md" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <DashboardContainer />;
}
