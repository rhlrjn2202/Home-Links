"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';
// Removed unused import: import { supabase } from '@/integrations/supabase/client';

interface UserData {
  slNo: number;
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  accountCreated: string;
  plan: string;
  daysLeft: number | string;
}

export function UserManagementTable() {
  const { session, loading: sessionLoading } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (sessionLoading) return;

      if (!session?.access_token) {
        setError('Authentication session not available. Please log in again.');
        setLoading(false);
        toast.error('Authentication required to view user data.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construct the full Supabase Edge Function URL
        const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co"; // Directly use the project URL
        const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/admin-users`;

        const response = await fetch(edgeFunctionUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        const data: UserData[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, sessionLoading]);

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>View and manage all registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SL No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account Created</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.slNo}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.mobileNumber}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.accountCreated}</TableCell>
                    <TableCell>{user.plan}</TableCell>
                    <TableCell>{user.daysLeft}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}