
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TeamMemberRole } from "@/types/TeamMemberTypes";

interface UserFormProps {
  onAddUser: (email: string, password: string, name: string, position: string, role: string) => void;
}

export function UserForm({ onAddUser }: UserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  // Extract name from email when email changes
  useEffect(() => {
    if (email && !name) {
      // Extract name from email if possible
      const parts = email.split('@');
      if (parts.length > 0) {
        // Convert from format like "john.doe" to "John Doe"
        const nameParts = parts[0].split('.');
        const formattedName = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        setName(formattedName);
      }
    }
  }, [email, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onAddUser(email, password, name, position, role);
    setEmail("");
    setPassword("");
    setName("");
    setPosition("");
    setRole("user");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@snellman.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="position" className="text-sm font-medium">
            Position
          </label>
          <Select 
            value={position} 
            onValueChange={setPosition}
            required
          >
            <SelectTrigger>
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
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          User Role
        </label>
        <Select 
          value={role} 
          onValueChange={setRole}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Regular User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={loading || !email || !password || !name || !position}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding User...
          </>
        ) : (
          "Add User"
        )}
      </Button>
    </form>
  );
}
