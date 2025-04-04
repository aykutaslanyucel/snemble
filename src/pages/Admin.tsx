
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Check,
  UserPlus, 
  ArrowLeft, 
  Shield, 
  UserCog, 
  Users,
  CheckCircle,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState("users");
  const { user, isAdmin, getUsers, setAsAdmin, createUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getUsers, toast]);

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    try {
      await setAsAdmin(userId);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      toast({
        title: "User promoted",
        description: `${userName} is now an admin`,
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async (email: string, password: string, name: string, position: string) => {
    try {
      await createUser(email, password, name, position);
      
      // Refresh the user list
      const userData = await getUsers();
      setUsers(userData);
      
      toast({
        title: "User created",
        description: `${name} has been added successfully`,
      });
      
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
      return false;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have admin privileges</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-6xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Shield className="mr-2 h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Logged in as {user?.name}
          </Badge>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                </CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-primary/5 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-medium">User List</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 sm:self-end"
                      onClick={() => {
                        const UserForm = () => {
                          const [email, setEmail] = useState("");
                          const [name, setName] = useState("");
                          const [position, setPosition] = useState("");
                          const [password, setPassword] = useState("password123");
                          const [role, setRole] = useState("user");
                          
                          return (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <label htmlFor="email">Email</label>
                                <input 
                                  type="email" 
                                  id="email" 
                                  value={email} 
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="px-3 py-2 border rounded"
                                />
                              </div>
                              <div className="grid gap-2">
                                <label htmlFor="name">Name</label>
                                <input 
                                  type="text" 
                                  id="name" 
                                  value={name} 
                                  onChange={(e) => setName(e.target.value)}
                                  className="px-3 py-2 border rounded"
                                />
                              </div>
                              <div className="grid gap-2">
                                <label htmlFor="position">Position</label>
                                <select 
                                  id="position" 
                                  value={position} 
                                  onChange={(e) => setPosition(e.target.value)}
                                  className="px-3 py-2 border rounded"
                                >
                                  <option value="">Select position</option>
                                  <option value="Assistant">Assistant</option>
                                  <option value="Associate">Associate</option>
                                  <option value="Senior Associate">Senior Associate</option>
                                  <option value="Managing Associate">Managing Associate</option>
                                  <option value="Counsel">Counsel</option>
                                  <option value="Partner">Partner</option>
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <label htmlFor="password">Password</label>
                                <input 
                                  type="text" 
                                  id="password" 
                                  value={password} 
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="px-3 py-2 border rounded"
                                />
                              </div>
                              <div className="grid gap-2">
                                <label htmlFor="role">Role</label>
                                <select 
                                  id="role" 
                                  value={role} 
                                  onChange={(e) => setRole(e.target.value)}
                                  className="px-3 py-2 border rounded"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <Button 
                                type="button" 
                                onClick={async () => {
                                  if (email && name && position && password) {
                                    const success = await handleCreateUser(email, password, name, position);
                                    if (success && role === "admin") {
                                      // Find the newly created user by email and promote them
                                      const newUsers = await getUsers();
                                      const newUser = newUsers.find(u => u.email === email);
                                      if (newUser) {
                                        await setAsAdmin(newUser.id);
                                      }
                                    }
                                    toast.dismiss();
                                  } else {
                                    toast({
                                      title: "Missing information",
                                      description: "Please fill in all fields",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Create User
                              </Button>
                            </div>
                          );
                        };
                        
                        toast({
                          title: "Add New User",
                          description: <UserForm />,
                          duration: 100000,
                        });
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">Loading users...</td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">No users found</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.position || user.seniority || "Not set"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                {user.role === "admin" ? (
                                  <><Shield className="h-3 w-3 mr-1" /> Admin</>
                                ) : (
                                  <><User className="h-3 w-3 mr-1" /> User</>
                                )}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {user.role !== "admin" ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePromoteToAdmin(user.id, user.name)}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Admin
                                </Button>
                              ) : (
                                <Badge variant="outline" className="bg-primary/10">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Admin settings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
