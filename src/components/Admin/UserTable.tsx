
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
import { getFirestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: "Other" | "Junior Associate" | "Senior Associate" | "Partners";
  lastUpdated: Date;
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
  const db = getFirestore();

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
        const seniorityOrder = {
          "Other": 0,
          "Junior Associate": 1,
          "Senior Associate": 2,
          "Partners": 3,
        };
        comparison = seniorityOrder[a.seniority] - seniorityOrder[b.seniority];
        break;
      case "name":
        comparison = a.email.localeCompare(b.email);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleRoleChange = async (userId: string, newRole: string, newSeniority?: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        seniority: newSeniority
      });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
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
            Email <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
          </TableHead>
          <TableHead>Role</TableHead>
          <TableHead onClick={() => handleSort("seniority")} className="cursor-pointer">
            Seniority <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
          </TableHead>
          <TableHead onClick={() => handleSort("lastUpdated")} className="cursor-pointer">
            Last Updated <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={user.seniority}
                onValueChange={(value) => handleRoleChange(user.id, user.role, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Junior Associate">Junior Associate</SelectItem>
                  <SelectItem value="Senior Associate">Senior Associate</SelectItem>
                  <SelectItem value="Partners">Partners</SelectItem>
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
