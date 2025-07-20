import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Erro no login:', error.message);
        return { error };
      }
      
      console.log('✅ Login realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error.message);
        throw error;
      }
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Erro ao alterar senha:', error.message);
        return { error };
      }
      
      console.log('✅ Senha alterada com sucesso');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao alterar senha:', error);
      return { error };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signIn,
    signOut,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 