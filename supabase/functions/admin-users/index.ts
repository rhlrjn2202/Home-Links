// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data: { user }, error: tokenVerificationError } = await supabaseAdmin.auth.getUser(accessToken);

    if (tokenVerificationError || !user) {
      console.error('Edge Function: Error verifying access token or user not found:', tokenVerificationError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired access token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Edge Function: Verified User ID:', user.id);

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

    const { data: { users: authUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      console.error('Edge Function: Error fetching all users:', listUsersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch base user data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter out admin users
    const nonAdminUsers = (authUsers || []).filter((u: any) => !adminUserIds.includes(u.id));

    // Sort by created_at (account created date) in descending order
    nonAdminUsers.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order
    });

    // Pagination logic
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = nonAdminUsers.slice(startIndex, endIndex);
    const totalCount = nonAdminUsers.length;

    // Fetch user profiles for the paginated users
    const paginatedUserIds = paginatedUsers.map((u: any) => u.id);
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, first_name, mobile_number')
      .in('id', paginatedUserIds);

    if (profilesError) {
      console.error('Edge Function: Error fetching user_profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profilesMap = new Map(userProfiles.map(p => [p.id, p]));

    const formattedUsers = paginatedUsers.map((u: any, index: number) => {
      const profile = profilesMap.get(u.id) || {};
      return {
        slNo: startIndex + index + 1, // Correct serial number for current page
        id: u.id,
        name: profile.first_name || 'N/A',
        mobileNumber: profile.mobile_number || 'N/A',
        email: u.email || 'N/A',
        accountCreated: new Date(u.created_at).toLocaleDateString(),
        plan: 'N/A',
        daysLeft: 'N/A',
      };
    });

    return new Response(JSON.stringify({ users: formattedUsers, totalCount }), {
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