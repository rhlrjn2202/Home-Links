"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Changed from next/navigation
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
  const navigate = useNavigate(); // Changed from useRouter
  const location = useLocation(); // Changed from usePathname

  // Helper function for admin check and redirect, memoized with useCallback
  const checkAdminAndRedirect = useCallback(async (currentUser: User | null, currentPathname: string, currentNavigate: typeof navigate) => {
    if (!currentUser) {
      setIsAdmin(false);
      console.log('User is not authenticated. Handling unauthenticated redirects.');
      // Redirect logic for unauthenticated users on protected paths
      if (currentPathname.startsWith('/userauth') && !currentPathname.startsWith('/userauth/login')) {
        console.log('Redirecting unauthenticated user from userauth page to /userauth/login');
        currentNavigate('/userauth/login'); // Changed router.push to navigate
        return;
      } else if (currentPathname.startsWith('/adminauth') && !currentPathname.startsWith('/adminauth/login')) {
        console.log('Redirecting unauthenticated user from adminauth page to /adminauth/login');
        currentNavigate('/adminauth/login'); // Changed router.push to navigate
        return;
      } else if (currentPathname.startsWith('/admin/dashboard')) {
        console.log('Redirecting unauthenticated user from admin dashboard to /adminauth/login');
        currentNavigate('/adminauth/login'); // Changed router.push to navigate
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
      currentNavigate('/'); // Changed router.push to navigate
      return;
    } else if (currentPathname.startsWith('/adminauth/login') && userIsAdmin) {
      console.log('Redirecting admin from admin login to /admin/dashboard');
      currentNavigate('/admin/dashboard'); // Changed router.push to navigate
      return;
    } else if (currentPathname.startsWith('/adminauth/login') && !userIsAdmin) {
      console.log('Redirecting authenticated non-admin from admin login to /');
      currentNavigate('/'); // Changed router.push to navigate
      return;
    } else if (currentPathname.startsWith('/admin/dashboard') && !userIsAdmin) {
      console.log('Redirecting authenticated non-admin from admin dashboard to /adminauth/login');
      toast.error('Access Denied: You are not an administrator.');
      currentNavigate('/adminauth/login'); // Changed router.push to navigate
      return;
    }
  }, [navigate]); // Dependencies for useCallback

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('Auth State Change Event:', event);
      console.log('Current Pathname:', location.pathname); // Changed pathname to location.pathname
      console.log('Current Session:', currentSession);

      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast.success('You have been logged in successfully!');
        // Immediately check and redirect after sign-in
        checkAdminAndRedirect(currentSession?.user || null, location.pathname, navigate); // Changed pathname to location.pathname, router to navigate
      } else if (event === 'SIGNED_OUT') {
        toast.success('You have been logged out successfully.');
        // Redirect to home page after logout, unless already on a login page
        if (!location.pathname.startsWith('/userauth/login') && !location.pathname.startsWith('/adminauth/login')) { // Changed pathname to location.pathname
          navigate('/'); // Changed router.push to navigate
        }
        setIsAdmin(false); // Ensure isAdmin is reset on sign out
      }
      // For INITIAL_SESSION or other events, ensure redirects are handled
      // This also covers cases where the user is already logged in on page load
      if (event === 'INITIAL_SESSION' || (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT')) {
        checkAdminAndRedirect(currentSession?.user || null, location.pathname, navigate); // Changed pathname to location.pathname, router to navigate
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
  }, [navigate, location.pathname, checkAdminAndRedirect]); // Added checkAdminAndRedirect to dependencies, changed router to navigate, pathname to location.pathname

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