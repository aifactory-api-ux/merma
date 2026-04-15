/**
 * Merma Project - Auth Context Stub
 * 
 * Minimal AuthContext and AuthContextType for useAuth.ts import.
 */

import { createContext } from 'react';
import type { UserSummary } from '../types';

export interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
