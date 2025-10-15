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
      console.log('Auth State Change Event:', event);
      console.log('Current Pathname:', pathname);
      console.log('Current Session:', currentSession);

      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast.success('You have been logged in successfully!'); // Success toast for login
      } else if (event === 'SIGNED_OUT') {
        toast.success('You have been logged out successfully.');
        // Redirect to home page after logout, unless already on a login page
        if (!pathname.startsWith('/userauth/login') && !pathname.startsWith('/adminauth/login')) {
          router.push('/');
        }
      }

      if (currentSession?.user) {
        console.log('Authenticated User ID:', currentSession.user.id);
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
        console.log('Is Admin:', userIsAdmin);

        // Redirect logic for authenticated users
        if (pathname.startsWith('/userauth/login') && !userIsAdmin) {
          console.log('Redirecting non-admin from user login to /');
          router.push('/');
        } else if (pathname.startsWith('/adminauth/login') && userIsAdmin) {
          console.log('Redirecting admin from admin login to /admin/dashboard');
          router.push('/admin/dashboard');
        } else if (pathname.startsWith('/adminauth/login') && !userIsAdmin) {
          console.log('Redirecting authenticated non-admin from admin login to /');
          router.push('/');
        } else if (pathname.startsWith('/admin/dashboard') && !userIsAdmin) {
          console.log('Redirecting authenticated non-admin from admin dashboard to /adminauth/login');
          toast.error('Access Denied: You are not an administrator.');
          router.push('/adminauth/login');
        }
      } else {
        setIsAdmin(false);
        console.log('User is not authenticated.');
        // Redirect logic for unauthenticated users on protected paths
        if (pathname.startsWith('/userauth') && !pathname.startsWith('/userauth/login')) {
          console.log('Redirecting unauthenticated user from userauth page to /userauth/login');
          router.push('/userauth/login');
        } else if (pathname.startsWith('/adminauth') && !pathname.startsWith('/adminauth/login')) {
          console.log('Redirecting unauthenticated user from adminauth page to /adminauth/login');
          router.push('/adminauth/login');
        } else if (pathname.startsWith('/admin/dashboard')) {
          console.log('Redirecting unauthenticated user from admin dashboard to /adminauth/login');
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