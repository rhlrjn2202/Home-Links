"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Toaster, toast } from 'sonner'; // Import Toaster and toast from sonner

interface SessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (currentSession?.user) {
        // Check if the user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('id', currentSession.user.id)
          .single();

        if (adminError && adminError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error checking admin status:', adminError);
          toast.error('Failed to check admin status.');
        }
        const userIsAdmin = !!adminData;
        setIsAdmin(userIsAdmin);

        // Redirect logic for authenticated users
        if (pathname.startsWith('/userauth/login') && !userIsAdmin) {
          router.push('/');
        } else if (pathname.startsWith('/adminauth/login') && userIsAdmin) {
          router.push('/admin/dashboard');
        } else if (pathname.startsWith('/adminauth/login') && !userIsAdmin) {
          // If a non-admin tries to access admin login and is authenticated, redirect to user home
          router.push('/');
        } else if (pathname.startsWith('/admin/dashboard') && !userIsAdmin) {
          // NEW: Redirect authenticated non-admins from admin dashboard
          toast.error('Access Denied: You are not an administrator.');
          router.push('/adminauth/login');
        }
      } else {
        setIsAdmin(false);
        // Redirect logic for unauthenticated users
        if (pathname.startsWith('/userauth') && !pathname.startsWith('/userauth/login')) {
          router.push('/userauth/login');
        } else if (pathname.startsWith('/adminauth') && !pathname.startsWith('/adminauth/login')) {
          router.push('/adminauth/login');
        } else if (pathname.startsWith('/admin/dashboard')) {
          router.push('/adminauth/login');
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const value = { session, user, loading, isAdmin };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
}