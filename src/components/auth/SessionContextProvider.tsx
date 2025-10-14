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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
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
          setIsAdmin(!!adminData);

          // Redirect logic for authenticated users
          if (pathname.startsWith('/userauth/login') && !adminData) {
            router.push('/');
          } else if (pathname.startsWith('/adminauth/login') && adminData) {
            router.push('/admin/dashboard');
          } else if (pathname.startsWith('/adminauth/login') && !adminData) {
            // If a non-admin tries to access admin login and is authenticated, redirect to user home
            router.push('/');
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
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
      if (initialSession?.user) {
        supabase
          .from('admin_profiles')
          .select('id')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: adminData, error: adminError }) => {
            if (adminError && adminError.code !== 'PGRST116') {
              console.error('Error checking initial admin status:', adminError);
              toast.error('Failed to check admin status.');
            }
            setIsAdmin(!!adminData);
            // Apply initial redirects
            if (pathname.startsWith('/userauth/login') && !adminData) {
              router.push('/');
            } else if (pathname.startsWith('/adminauth/login') && adminData) {
              router.push('/admin/dashboard');
            } else if (pathname.startsWith('/adminauth/login') && !adminData) {
              router.push('/');
            }
          });
      } else {
        // Apply initial redirects for unauthenticated users
        if (pathname.startsWith('/userauth') && !pathname.startsWith('/userauth/login')) {
          router.push('/userauth/login');
        } else if (pathname.startsWith('/adminauth') && !pathname.startsWith('/adminauth/login')) {
          router.push('/adminauth/login');
        } else if (pathname.startsWith('/admin/dashboard')) {
          router.push('/adminauth/login');
        }
      }
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