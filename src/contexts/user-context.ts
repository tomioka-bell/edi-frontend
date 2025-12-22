import { createContext } from "react";

export type User = {
  edi_principal_id: string;
  external_id: string;
  username: string;
  display_name?: string;
  email?: string;
  role_name: string;
  profile: string;
  group: string;
  source_system: string;
};

export type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => void;
  hasRole: (r: string) => boolean;
  hasAnyRole: (...r: string[]) => boolean;
  getInitials: (u?: User | null) => string;
};

export const UserContext = createContext<UserContextType | null>(null);
