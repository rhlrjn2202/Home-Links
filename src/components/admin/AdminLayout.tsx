"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('/admin/properties') ? 'properties' : 'users';

  const handleTabChange = (value: string) => {
    if (value === 'users') {
      navigate('/admin/dashboard');
    } else if (value === 'properties') {
      navigate('/admin/properties');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="users" className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}>
            Manage Users
          </TabsTrigger>
          <TabsTrigger value="properties" className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}>
            Manage Properties
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}