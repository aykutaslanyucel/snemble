
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  position?: string;
  seniority?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  currentUserId: string | null;
  signup: (email: string, password: string, name: string, position: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setAsAdmin: (userId: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
  createUser: (email: string, password: string, name: string, position: string, role?: UserRole) => Promise<void>;
}
