"use client";

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Loader2 } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/UserManagementTable'; // Import the new component

export default function AdminDashboardPage() {
  const { loading, isAdmin, user } = useSession();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
            <p className="mt-4 text-muted-foreground">You do not have administrative privileges to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome, Admin {user?.email}!</p>
          <div className="mt-8 grid grid-cols-1 gap-6">
            <UserManagementTable /> {/* Integrated the new UserManagementTable */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Manage Properties</h2>
              <p className="text-muted-foreground">Approve, edit, or delete property listings.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Site Settings</h2>
              <p className="text-muted-foreground">Configure application settings.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}