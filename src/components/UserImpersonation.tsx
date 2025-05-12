
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, User, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserOption {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export function UserImpersonation() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser, resetAuthState } = useAuth();
  const { toast } = useToast();
  
  // Store the original user ID if we're impersonating
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);
  
  // Check if we're currently impersonating
  useEffect(() => {
    const storedOriginalId = localStorage.getItem('originalUserId');
    if (storedOriginalId) {
      setOriginalUserId(storedOriginalId);
    }
  }, []);
  
  // Fetch available users (only admins can do this)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get all users via the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, name, role')
          .neq('id', currentUser.id); // Exclude current user
          
        if (error) throw error;
        
        if (data) {
          setUsers(data as UserOption[]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Failed to load users",
          description: "Could not load the list of users to impersonate.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, toast]);
  
  const startImpersonation = async () => {
    if (!selectedUserId || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Store original user ID in local storage
      localStorage.setItem('originalUserId', currentUser.id);
      setOriginalUserId(currentUser.id);
      
      // Get the auth token for the selected user
      // Note: In a real application, this would typically be done via a secure admin API
      // For this demo, we're using a workaround that changes the user in the Auth context
      
      // Get the user's email
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (!selectedUser) throw new Error("Selected user not found");
      
      // Reset the auth state to simulate signing in as another user
      resetAuthState();
      
      // Trigger a page reload with a special query parameter
      window.location.href = `/?impersonate=${selectedUserId}`;
      
    } catch (error) {
      console.error("Error during impersonation:", error);
      toast({
        title: "Impersonation failed",
        description: "Unable to preview as selected user.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const stopImpersonation = () => {
    if (originalUserId) {
      // Remove the stored original user ID
      localStorage.removeItem('originalUserId');
      setOriginalUserId(null);
      
      // Reload the page without the query parameter
      window.location.href = '/';
    }
  };
  
  if (!currentUser) return null;
  
  // Only admins can use this feature
  if (originalUserId) {
    // Show stop impersonation UI
    return (
      <Card className="p-3 bg-yellow-50 border-yellow-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium">You are currently viewing as another user</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={stopImpersonation} 
          className="ml-2 border-yellow-300 hover:bg-yellow-100"
        >
          <UserCheck className="mr-1 h-3 w-3" />
          Return to Admin View
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="user-select">Preview As User</Label>
        <div className="flex gap-2">
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id} className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.name?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.email}</span>
                    {user.role && (
                      <Badge variant="outline" className="ml-2">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={startImpersonation} 
            disabled={!selectedUserId || loading}
            variant="outline"
          >
            <User className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This allows you to see how the app appears to other users.
        </p>
      </div>
    </div>
  );
}
