
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { getFirestore, doc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/integrations/firebase/client";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: string;
  lastUpdated: Date;
  name?: string;
  position?: string;
}

type SortField = "lastUpdated" | "seniority" | "name";
type SortOrder = "asc" | "desc";

interface UserTableProps {
  users: User[];
  fetchUsers: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
}

export function UserTable({ 
  users, 
  fetchUsers, 
  sortField, 
  sortOrder, 
  setSortField, 
  setSortOrder 
}: UserTableProps) {
  const { toast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "lastUpdated":
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      case "seniority":
        // Sort by position/seniority
        const positionOrder = {
          "Assistant": 0,
          "Associate": 1,
          "Senior Associate": 2,
          "Managing Associate": 3,
          "Counsel": 4,
          "Partner": 5,
        };
        const aPosition = a.position || "Associate";
        const bPosition = b.position || "Associate";
        comparison = (positionOrder[aPosition as keyof typeof positionOrder] || 0) - 
                    (positionOrder[bPosition as keyof typeof positionOrder] || 0);
        break;
      case "name":
        comparison = (a.name || a.email).localeCompare(b.name || b.email);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleRoleChange = async (userId: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        [field]: value,
        lastUpdated: new Date()
      });
      
      // If we're updating position, also update any team member cards
      if (field === 'position') {
        // Find team member cards for this user
        const teamMembersRef = collection(db, "teamMembers");
        const q = query(teamMembersRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              position: value,
              role: value, // Also update the role field
              lastUpdated: new Date()
            });
          });
        }
      }
      
      toast({
        title: "Success",
        description: `User ${field} updated successfully`,
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update user ${field}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the user from the users collection
      await deleteDoc(doc(db, "users", userId));
      
      // Also delete any team member cards associated with this user
      const teamMembersRef = collection(db, "teamMembers");
      const q = query(teamMembersRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }
      
      toast({
        title: "Success",
        description: "User and associated data deleted successfully",
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
            Name/Email <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
          </TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Role</TableHead>
          <TableHead onClick={() => handleSort("lastUpdated")} className="cursor-pointer">
            Last Updated <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <div className="font-medium">{user.name || "Not set"}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={user.position || ""}
                onValueChange={(value) => handleRoleChange(user.id, 'position', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                  <SelectItem value="Associate">Associate</SelectItem>
                  <SelectItem value="Senior Associate">Senior Associate</SelectItem>
                  <SelectItem value="Managing Associate">Managing Associate</SelectItem>
                  <SelectItem value="Counsel">Counsel</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={user.role || "user"}
                onValueChange={(value) => handleRoleChange(user.id, 'role', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{new Date(user.lastUpdated).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
