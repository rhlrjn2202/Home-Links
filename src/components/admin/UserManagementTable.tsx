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
import { Loader2, ChevronLeft, ChevronRight, Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';
import { ExportUsersToCsvButton } from './ExportUsersToCsvButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDateToIST } from '@/lib/formatters'; // Import formatter

interface UserData {
  slNo: number;
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  accountCreated: string;
  plan: string;
  daysLeft: number | string;
  isBlocked: boolean; // Added to reflect ban status
}

const ITEMS_PER_PAGE = 10;

export function UserManagementTable() {
  const { session, loading: sessionLoading } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To manage loading state for individual actions

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

  const performAdminAction = async (action: 'deleteUser' | 'blockUser' | 'unblockUser', userId: string) => {
    if (!session?.access_token) {
      toast.error('Authentication session not available. Please log in again.');
      return;
    }

    setActionLoading(userId);
    try {
      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/admin-actions`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} user.`);
      }

      const result = await response.json();
      toast.success(result.message);
      fetchUsers(); // Refresh the user list after action
    } catch (err: any) {
      console.error(`Error performing ${action} for user ${userId}:`, err);
      toast.error(err.message || `An unexpected error occurred during ${action}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    performAdminAction('deleteUser', userId);
  };

  const handleToggleBlockUser = (userId: string, isBlocked: boolean) => {
    if (isBlocked) {
      performAdminAction('unblockUser', userId);
    } else {
      performAdminAction('blockUser', userId);
    }
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </div>
          <ExportUsersToCsvButton />
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
                <TableHead className="text-center">Actions</TableHead> {/* New Actions column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
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
                    <TableCell>{formatDateToIST(user.accountCreated)}</TableCell> {/* Apply formatter */}
                    <TableCell>{user.plan}</TableCell>
                    <TableCell>{user.daysLeft}</TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            disabled={actionLoading === user.id}
                            title="Delete User"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant={user.isBlocked ? "secondary" : "outline"}
                        size="icon"
                        onClick={() => handleToggleBlockUser(user.id, user.isBlocked)}
                        disabled={actionLoading === user.id}
                        title={user.isBlocked ? "Unblock User" : "Block User"}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isBlocked ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Ban className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </TableCell>
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