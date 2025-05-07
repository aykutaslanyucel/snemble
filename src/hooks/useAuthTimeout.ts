
import { useEffect } from 'react';

/**
 * Hook to prevent infinite loading state in authentication
 * @param loading Current loading state from auth context
 * @param resetAuthState Function to reset auth state if loading gets stuck
 * @param timeoutMs Timeout in milliseconds (default 15000 - 15 seconds)
 */
export function useAuthTimeout(
  loading: boolean, 
  resetAuthState: () => void,
  timeoutMs = 15000
) {
  useEffect(() => {
    // Only set timeout when loading is true
    if (!loading) return;
    
    console.log("Auth loading timeout started...");
    
    // Set timeout to reset auth state if loading takes too long
    const timeoutId = setTimeout(() => {
      console.warn(`Auth loading state stuck for ${timeoutMs/1000}s, forcing reset`);
      resetAuthState();
    }, timeoutMs);
    
    // Cleanup on unmount or when loading becomes false
    return () => {
      console.log("Auth loading timeout cleared");
      clearTimeout(timeoutId);
    };
  }, [loading, resetAuthState, timeoutMs]);
}
