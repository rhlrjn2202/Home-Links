"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/auth/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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

interface UserProfile {
  first_name: string;
  mobile_number: string;
  email: string;
}

export function UserProfilePage() {
  const { session, user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (sessionLoading || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, mobile_number')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        setProfile({
          first_name: data?.first_name || 'N/A',
          mobile_number: data?.mobile_number || 'N/A',
          email: user.email || 'N/A',
        });
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [sessionLoading, user]);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user session found.');
      return;
    }

    setIsDeleting(true);
    try {
      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/user-self-delete`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account.');
      }

      toast.success('Your account has been successfully deleted.');
      await supabase.auth.signOut(); // Sign out the user after deletion
      navigate('/userauth/login'); // Redirect to login page
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'An unexpected error occurred during account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4 text-center flex-col">
        <p className="text-destructive mb-4">You must be logged in to view this page.</p>
        <Button onClick={() => navigate('/userauth/login')}>Go to Login</Button>
      </div>
    );
  }

  const profileTitle = profile.first_name !== 'N/A' ? `${profile.first_name}'s Profile` : `Profile for ${profile.email}`;

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-140px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{profileTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={profile.first_name} readOnly className="mt-1" />
          </div>
          <div>
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input id="mobileNumber" value={profile.mobile_number} readOnly className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} readOnly className="mt-1" />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full mt-6" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}