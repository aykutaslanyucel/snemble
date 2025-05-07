
import { useEffect, useRef } from 'react';

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
  // Use ref to track if the timeout has been triggered
  const timeoutTriggeredRef = useRef(false);
  
  useEffect(() => {
    // Only set timeout when loading is true and hasn't been triggered yet
    if (!loading || timeoutTriggeredRef.current) {
      return;
    }
    
    console.log(`Auth loading timeout started (${timeoutMs/1000}s)...`);
    
    // Set timeout to reset auth state if loading takes too long
    const timeoutId = setTimeout(() => {
      console.warn(`Auth loading state stuck for ${timeoutMs/1000}s, forcing reset`);
      timeoutTriggeredRef.current = true;
      resetAuthState();
    }, timeoutMs);
    
    // Cleanup on unmount or when loading becomes false
    return () => {
      console.log("Auth loading timeout cleared");
      clearTimeout(timeoutId);
    };
  }, [loading, resetAuthState, timeoutMs]);
  
  // Reset the triggered state when loading changes to false
  useEffect(() => {
    if (!loading && timeoutTriggeredRef.current) {
      timeoutTriggeredRef.current = false;
    }
  }, [loading]);
}
