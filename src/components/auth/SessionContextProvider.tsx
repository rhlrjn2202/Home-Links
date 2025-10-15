"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Helper function for admin check and redirect, memoized with useCallback
  const checkAdminAndRedirect = useCallback(async (currentUser: User | null, currentPathname: string, currentRouter: typeof router) => {
    if (!currentUser) {
      setIsAdmin(false);
      console.log('User is not authenticated. Handling unauthenticated redirects.');
      // Redirect logic for unauthenticated users on protected paths
      if (currentPathname.startsWith('/userauth') && !currentPathname.startsWith('/userauth/login')) {
        console.log('Redirecting unauthenticated user from userauth page to /userauth/login');
        currentRouter.push('/userauth/login');
        return;
      } else if (currentPathname.startsWith('/adminauth') && !currentPathname.startsWith('/adminauth/login')) {
        console.log('Redirecting unauthenticated user from adminauth page to /adminauth/login');
        currentRouter.push('/adminauth/login');
        return;
      } else if (currentPathname.startsWith('/admin/dashboard')) {
        console.log('Redirecting unauthenticated user from admin dashboard to /adminauth/login');
        currentRouter.push('/adminauth/login');
        return;
      }
      return;
    }

    console.log('Authenticated User ID:', currentUser.id);
    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', currentUser.id)
      .single();

    if (adminError && adminError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking admin status:', adminError);
      toast.error('Failed to check admin status.');
    }
    const userIsAdmin = !!adminData;
    setIsAdmin(userIsAdmin);
    console.log('Is Admin (from checkAdminAndRedirect):', userIsAdmin);

    // Redirect logic for authenticated users
    if (currentPathname.startsWith('/userauth/login') && !userIsAdmin) {
      console.log('Redirecting non-admin from user login to /');
      currentRouter.push('/');
      return;
    } else if (currentPathname.startsWith('/adminauth/login') && userIsAdmin) {
      console.log('Redirecting admin from admin login to /admin/dashboard');
      currentRouter.push('/admin/dashboard');
      return;
    } else if (currentPathname.startsWith('/adminauth/login') && !userIsAdmin) {
      console.log('Redirecting authenticated non-admin from admin login to /');
      currentRouter.push('/');
      return;
    } else if (currentPathname.startsWith('/admin/dashboard') && !userIsAdmin) {
      console.log('Redirecting authenticated non-admin from admin dashboard to /adminauth/login');
      toast.error('Access Denied: You are not an administrator.');
      currentRouter.push('/adminauth/login');
      return;
    }
  }, [router]); // Dependencies for useCallback

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('Auth State Change Event:', event);
      console.log('Current Pathname:', pathname);
      console.log('Current Session:', currentSession);

      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast.success('You have been logged in successfully!');
        // Immediately check and redirect after sign-in
        checkAdminAndRedirect(currentSession?.user || null, pathname, router);
      } else if (event === 'SIGNED_OUT') {
        toast.success('You have been logged out successfully.');
        // Redirect to home page after logout, unless already on a login page
        if (!pathname.startsWith('/userauth/login') && !pathname.startsWith('/adminauth/login')) {
          router.push('/');
        }
        setIsAdmin(false); // Ensure isAdmin is reset on sign out
      }
      // For INITIAL_SESSION or other events, ensure redirects are handled
      // This also covers cases where the user is already logged in on page load
      if (event === 'INITIAL_SESSION' || (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT')) {
        checkAdminAndRedirect(currentSession?.user || null, pathname, router);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check on component mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname, checkAdminAndRedirect]); // Added checkAdminAndRedirect to dependencies

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