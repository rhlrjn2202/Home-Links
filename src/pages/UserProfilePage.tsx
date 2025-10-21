"use client";

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/components/auth/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Eye, Rocket } from 'lucide-react';
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
import { fetchUserProperties, Property } from '@/lib/supabase/properties'; // Import Property interface and fetchUserProperties
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface UserProfile {
  first_name: string;
  mobile_number: string;
  email: string;
}

export function UserProfilePage() {
  const { session, user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUserProfileAndProperties() {
      if (sessionLoading || !user) {
        setLoading(false);
        setLoadingProperties(false);
        return;
      }

      setLoading(true);
      setLoadingProperties(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, mobile_number')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        setProfile({
          first_name: profileData?.first_name || 'N/A',
          mobile_number: profileData?.mobile_number || 'N/A',
          email: user.email || 'N/A',
        });

        // Fetch user properties
        const fetchedProperties = await fetchUserProperties(user.id);
        setUserProperties(fetchedProperties);

      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data: ' + error.message);
      } finally {
        setLoading(false);
        setLoadingProperties(false);
      }
    }

    fetchUserProfileAndProperties();
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

  const handleBoostProperty = (propertyId: string) => {
    toast.info(`Boosting property ${propertyId} (feature coming soon!)`);
    // Implement actual boost logic here later
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
    <div className="container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      {/* User Profile Card */}
      <Card className="w-full lg:w-1/3 max-w-md lg:max-w-none mx-auto lg:mx-0">
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

      {/* Submitted Properties Section */}
      <Card className="w-full lg:w-2/3 mx-auto lg:mx-0">
        <CardHeader>
          <CardTitle className="text-2xl">Your Submitted Properties</CardTitle>
          <CardDescription>Manage the properties you have listed.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProperties ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading your properties...</p>
            </div>
          ) : userProperties.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>You haven't submitted any properties yet.</p>
              <Button asChild className="mt-4">
                <Link to="/submit-property">Submit Your First Property</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={property.property_images[0]?.image_url || '/images/placeholder.jpg'}
                      alt={property.title}
                      className="rounded-t-lg absolute inset-0 w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 px-3 py-1 rounded-md text-xs font-semibold ${
                        property.status === 'approved' ? 'bg-green-500' :
                        property.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    >
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{property.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {property.locality}, {property.district}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-price-accent">{property.price}</span>
                      <span className="text-sm text-muted-foreground">{property.transaction_type}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/properties/${property.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Listing
                        </Link>
                      </Button>
                      <Button onClick={() => handleBoostProperty(property.id)} className="flex-1">
                        <Rocket className="mr-2 h-4 w-4" /> Boost
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}