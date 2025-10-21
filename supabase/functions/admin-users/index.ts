// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to convert array of objects to CSV string
function convertToCsv(data: any[]) {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Helper function to format date to IST
function formatDateToIST(dateString: string): string {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', // Indian Standard Time
  });
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

    // Filter out admin users and sort by created_at in descending order
    const nonAdminUsers = (authUsers || [])
      .filter((u: any) => !adminUserIds.includes(u.id))
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Descending order
      });

    // Fetch user profiles for these non-admin users to get first_name and mobile_number
    const uniqueNonAdminUserIds = [...new Set(nonAdminUsers.map((u: any) => u.id))];
    let userProfilesMap = new Map();

    if (uniqueNonAdminUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, mobile_number')
        .in('id', uniqueNonAdminUserIds);

      if (profilesError) {
        console.error('Edge Function: Error fetching user profiles:', profilesError);
        // Log the error but don't fail the entire request; proceed without profile data
      } else {
        profiles.forEach((profile: any) => {
          userProfilesMap.set(profile.id, profile);
        });
      }
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    // Format users for both JSON and CSV output
    const formattedUsers = nonAdminUsers.map((u: any, index: number) => {
      const userProfile = userProfilesMap.get(u.id); // Get profile data
      const isBlocked = u.banned_until && new Date(u.banned_until) > new Date();
      return {
        slNo: index + 1, // Serial number for the full list
        id: u.id,
        name: userProfile?.first_name || u.user_metadata?.first_name || 'N/A', // Prioritize profile, then metadata
        mobileNumber: userProfile?.mobile_number || u.user_metadata?.mobile_number || 'N/A', // Prioritize profile, then metadata
        email: u.email || 'N/A',
        accountCreated: formatDateToIST(u.created_at), // Apply formatter here
        plan: 'N/A', // Placeholder, as subscription data is not fetched here
        daysLeft: 'N/A', // Placeholder
        isBlocked: isBlocked, // Include ban status
      };
    });

    if (format === 'csv') {
      console.log('Edge Function: Generating CSV for all non-admin users.');
      const csv = convertToCsv(formattedUsers);
      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    } else {
      // Existing pagination logic for JSON response
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedUsers = formattedUsers.slice(startIndex, endIndex);
      const totalCount = nonAdminUsers.length; // Total count of non-admin users

      console.log('Edge Function: Returning paginated JSON data.');
      return new Response(JSON.stringify({ users: paginatedUsers, totalCount }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Edge Function: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});