
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/integrations/firebase/client";
import { UserForm } from "@/components/Admin/UserForm";
import { UserTable } from "@/components/Admin/UserTable";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Define SortField and SortOrder types to match the UserTable requirements
type SortField = "lastUpdated" | "seniority" | "name";
type SortOrder = "asc" | "desc";

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch users
  const getUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("email"));
      const querySnapshot = await getDocs(usersQuery);
      
      const userData = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        userData.push({
          id: doc.id,
          email: user.email,
          name: user.name || "",
          position: user.position || "",
          role: user.role || "user",
          lastUpdated: user.lastUpdated?.toDate() || new Date(),
        });
      });
      
      return userData;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Create a new user
  const createUser = async (email, password, name, position) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: email,
        name: name,
        position: position,
        role: "user",
        lastUpdated: serverTimestamp(),
      });
      
      return user.uid;
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Handle creating a new user
  const handleCreateUser = async (email, password, name, position) => {
    try {
      await createUser(email, password, name, position);
      
      const userData = await getUsers();
      setUsers(userData);
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Set a user as admin
  const setAsAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: "admin",
        lastUpdated: serverTimestamp(),
      });
      
      toast({
        title: "Success",
        description: "User set as admin successfully",
      });
      
      // Refresh the user list
      const userData = await getUsers();
      setUsers(userData);
    } catch (error) {
      console.error("Error setting user as admin:", error);
      
      toast({
        title: "Error",
        description: "Failed to set user as admin",
        variant: "destructive",
      });
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    
    const fetchUsers = async () => {
      setIsLoading(true);
      const userData = await getUsers();
      setUsers(userData);
      setIsLoading(false);
    };
    
    fetchUsers();
  }, [isAdmin, navigate]);

  // Add a new user (admin only)
  const handleAddUser = async (email, password, name, position, role) => {
    if (!isAdmin) return;
    
    try {
      const userId = await createUser(email, password, name, position);
      
      if (userId && role === "admin") {
        await setAsAdmin(userId);
      }
      
      const userData = await getUsers();
      setUsers(userData);
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      
      toast({
        title: "Error", 
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container mx-auto py-6 px-4 sm:px-6 max-w-6xl"
    >
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline">Admin Access</Badge>
      </div>
      
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>
                  Create a new user account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserForm onAddUser={handleAddUser} />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>
                  Manage existing user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <UserTable 
                    users={users} 
                    fetchUsers={async () => {
                      setIsLoading(true);
                      const userData = await getUsers();
                      setUsers(userData);
                      setIsLoading(false);
                    }}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    setSortField={setSortField}
                    setSortOrder={setSortOrder}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {users.length} users total
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>System settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
