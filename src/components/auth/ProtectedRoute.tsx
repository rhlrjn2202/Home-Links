"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    // User is not logged in, redirect to login page
    return <Navigate to="/userauth/login" replace />;
  }

  return <>{children}</>;
}