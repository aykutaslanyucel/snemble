
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Create a more robust query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

// Helper function to log app initialization for debugging
function useAppDebug() {
  useEffect(() => {
    console.log("App initialized at:", new Date().toISOString());
    console.log("React version:", React.version);
    console.log("Environment:", import.meta.env.MODE);
    
    // Check for common issues
    try {
      const testObj = { test: true };
      console.log("JSON stringify test:", JSON.stringify(testObj));
    } catch (error) {
      console.error("JSON stringify error:", error);
    }
  }, []);
}

// Define route protection components inside the App component so they can use useAuth
function AppRoutes() {
  const { user, isAdmin, loading, resetAuthState } = useAuth();
  
  // Use our debug hook
  useAppDebug();
  
  console.log("Auth state in AppRoutes:", { user, isAdmin, loading });

  // Helper component for protected routes requiring authentication
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (loading) {
      console.log("Auth is loading, showing loading state...");
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="spinner"></div>
          <button 
            onClick={resetAuthState} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Taking too long? Click here
          </button>
        </div>
      );
    }
    
    if (!user) {
      console.log("No user found, redirecting to login");
      return <Navigate to="/login" />;
    }

    console.log("User authenticated, rendering protected content");
    return <>{children}</>;
  }

  // Helper component for admin-only routes
  function AdminRoute({ children }: { children: React.ReactNode }) {
    if (loading) {
      console.log("Auth is loading, showing loading state for admin route...");
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="spinner"></div>
          <button 
            onClick={resetAuthState} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Taking too long? Click here
          </button>
        </div>
      );
    }
    
    if (!user || !isAdmin) {
      console.log("Not an admin, redirecting to home");
      return <Navigate to="/" />;
    }

    console.log("Admin authenticated, rendering admin content");
    return <>{children}</>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
