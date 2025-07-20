import { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: any }>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 