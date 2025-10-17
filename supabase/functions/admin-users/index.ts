// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define interfaces for better type safety
interface AuthUser {
  id: string;
  email: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  mobile_number: string | null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Access token missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key for privileged access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verify the access token using the service role client
    const { data: { user }, error: tokenVerificationError } = await supabaseAdmin.auth.getUser(accessToken);

    if (tokenVerificationError || !user) {
      console.error('Edge Function: Error verifying access token or user not found:', tokenVerificationError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired access token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Edge Function: Verified User ID:', user.id);

    // Check if the user is an admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError || !adminProfile) {
      console.warn(`Edge Function: User ${user.id} attempted to access admin users API without admin profile or encountered an error.`);
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all admin user IDs to exclude them from the normal user list
    const { data: allAdminProfiles, error: allAdminProfilesError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id');

    if (allAdminProfilesError) {
      console.error('Edge Function: Error fetching all admin profiles for filtering:', allAdminProfilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch admin profiles for filtering' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminUserIds = allAdminProfiles.map((admin: { id: string }) => admin.id);
    console.log('Edge Function: Admin User IDs for filtering:', adminUserIds);

    // Fetch all users from auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, created_at')
      .order('created_at', { ascending: true });

    if (authUsersError) {
      console.error('Edge Function: Error fetching auth.users:', authUsersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch base user data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userIds = (authUsers as AuthUser[]).map((u: AuthUser) => u.id);

    // Fetch user profiles for these users
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, mobile_number')
      .in('id', userIds); // Filter profiles by fetched user IDs

    if (profilesError) {
      console.error('Edge Function: Error fetching user_profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profilesMap = new Map((userProfiles as UserProfile[]).map((p: UserProfile) => [p.id, p]));

    // Process data for the table, filtering out all admin users
    const formattedUsers = (authUsers as AuthUser[])
      .filter((u: AuthUser) => !adminUserIds.includes(u.id))
      .map((u: AuthUser, index: number) => {
        const profile: UserProfile | undefined = profilesMap.get(u.id);

        return {
          slNo: index + 1,
          id: u.id,
          name: profile?.first_name || 'N/A',
          mobileNumber: profile?.mobile_number || 'N/A',
          email: u.email || 'N/A',
          accountCreated: new Date(u.created_at).toLocaleDateString(),
          plan: 'N/A',
          daysLeft: 'N/A',
        };
      });

    console.log('Edge Function: Successfully fetched and formatted users.');
    return new Response(JSON.stringify(formattedUsers), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge Function: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});