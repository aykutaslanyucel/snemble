
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserFormProps {
  onAddUser: (email: string, password: string) => Promise<void>;
}

export function UserForm({ onAddUser }: UserFormProps) {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.endsWith("@snellman.com")) {
      toast({
        title: "Invalid email domain",
        description: "Only @snellman.com email addresses are allowed",
        variant: "destructive",
      });
      return;
    }

    if (!newUserPassword || newUserPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onAddUser(newUserEmail, newUserPassword);
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      console.error("Error adding user:", error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleAddUser} className="flex gap-4">
      <Input
        type="email"
        placeholder="email@snellman.com"
        value={newUserEmail}
        onChange={(e) => setNewUserEmail(e.target.value)}
        className="flex-1"
      />
      <Input
        type="password"
        placeholder="Password"
        value={newUserPassword}
        onChange={(e) => setNewUserPassword(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </form>
  );
}
