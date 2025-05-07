
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Define route protection components inside the App component so they can use useAuth
function AppRoutes() {
  const { user, isAdmin, loading } = useAuth();
  
  console.log("Auth state in AppRoutes:", { user, isAdmin, loading });

  // Helper component for protected routes requiring authentication
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (loading) {
      console.log("Auth is loading, showing loading state...");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
