import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'editor' | 'auditor' | 'call_center' | 'sales';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_id?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canEdit: () => boolean;
  canView: (section: 'call_center' | 'sales' | 'crm') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data ? (data as unknown as UserProfile) : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid recursion
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return profile ? roles.includes(profile.role) : false;
  };

  const canEdit = (): boolean => {
    return hasAnyRole(['admin', 'editor']);
  };

  const canView = (section: 'call_center' | 'sales' | 'crm'): boolean => {
    if (!profile) return false;
    
    switch (section) {
      case 'call_center':
        return hasAnyRole(['admin', 'editor', 'auditor', 'call_center']);
      case 'sales':
        return hasAnyRole(['admin', 'editor', 'auditor', 'sales']);
      case 'crm':
        return hasAnyRole(['admin', 'editor', 'auditor', 'call_center']);
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
    canEdit,
    canView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};