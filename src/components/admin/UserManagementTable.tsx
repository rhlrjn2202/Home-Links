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
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';
import { ExportUsersToCsvButton } from './ExportUsersToCsvButton'; // Import the new component

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

const ITEMS_PER_PAGE = 10;

export function UserManagementTable() {
  const { session, loading: sessionLoading } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

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

      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = new URL(`${SUPABASE_URL}/functions/v1/admin-users`);
      edgeFunctionUrl.searchParams.append('page', currentPage.toString());
      edgeFunctionUrl.searchParams.append('limit', ITEMS_PER_PAGE.toString());
      // The sorting is now handled directly in the Edge Function for both JSON and CSV
      // No need to append sortBy/sortOrder here for JSON, as the function sorts the full list before slicing.

      const response = await fetch(edgeFunctionUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const { users: fetchedUsers, totalCount }: { users: UserData[], totalCount: number } = await response.json();
      setUsers(fetchedUsers);
      setTotalUsers(totalCount);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session, sessionLoading, currentPage]);

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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
        <div className="flex justify-between items-center mb-4"> {/* Flex container for title and button */}
          <div>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </div>
          <ExportUsersToCsvButton /> {/* The new CSV export button */}
        </div>
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
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}