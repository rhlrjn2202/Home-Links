"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Loader2 } from 'lucide-react';

export default function UserLoginPage() {
  const { loading } = useSession();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-foreground">User Login / Sign Up</h1>
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers unless specified
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    defaultButtonBackground: 'hsl(var(--primary))',
                    defaultButtonBackgroundHover: 'hsl(var(--primary-foreground))',
                    defaultButtonBorder: 'hsl(var(--primary))',
                    defaultButtonText: 'hsl(var(--primary-foreground))',
                    anchorText: 'hsl(var(--primary))',
                    anchorTextHover: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light" // Use light theme by default
            redirectTo={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'} // Redirect to home after auth
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}