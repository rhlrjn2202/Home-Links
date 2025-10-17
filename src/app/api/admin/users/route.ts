import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, ReadonlyRequestCookies } from 'next/headers'; // Import ReadonlyRequestCookies
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('API Route: Starting GET request for /api/admin/users');
    console.log('API Route: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set');
    console.log('API Route: NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set');
    console.log('API Route: SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set');

    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      console.log('API Route: No access token found in Authorization header, returning 401 Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized: Access token missing' }, { status: 401 });
    }

    // Correctly get the cookieStore instance and explicitly type it
    const cookieStore: ReadonlyRequestCookies = cookies();

    // Create a Supabase client with the SERVICE_ROLE_KEY for privileged operations and token verification
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the SERVICE_ROLE_KEY here
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => {
            cookieStore.set(name, value, options);
          },
          remove: (name: string, options: CookieOptions) => {
            cookieStore.delete(name);
          },
        },
      }
    );

    // Verify the access token using supabaseAdmin.auth.getUser()
    const { data: { user }, error: tokenVerificationError } = await supabaseAdmin.auth.getUser(accessToken);

    if (tokenVerificationError || !user) {
      console.error('API Route: Error verifying access token or user not found:', tokenVerificationError);
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired access token' }, { status: 401 });
    }

    console.log('API Route: Verified User ID:', user.id);

    // Now that the user is verified, check if they are an admin.
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id) // Use the extracted userId
      .single();

    console.log('API Route: Admin Profile Check - Data:', adminProfile ? adminProfile.id : 'null');
    console.log('API Route: Admin Profile Check - Error:', adminError);

    if (adminError || !adminProfile) {
      console.warn(`API Route: User ${user.id} attempted to access admin users API without admin profile or encountered an error.`);
      return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
    }

    // Fetch all admin user IDs to exclude them from the normal user list
    const { data: allAdminProfiles, error: allAdminProfilesError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id');

    if (allAdminProfilesError) {
      console.error('API Route: Error fetching all admin profiles for filtering with supabaseAdmin:', allAdminProfilesError);
      return NextResponse.json({ error: 'Failed to fetch admin profiles for filtering' }, { status: 500 });
    }

    const adminUserIds = allAdminProfiles.map(admin => admin.id);
    console.log('API Route: Admin User IDs for filtering:', adminUserIds);

    // Fetch user data and profiles using the supabaseAdmin client
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('auth.users') // This table requires service_role key access
      .select(`
        id,
        email,
        created_at,
        user_profiles (
          first_name,
          mobile_number
        )
      `)
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('API Route: Error fetching users from Supabase with supabaseAdmin:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users from database' }, { status: 500 });
    }

    // Process data for the table, filtering out all admin users
    const formattedUsers = usersData
      .filter(u => !adminUserIds.includes(u.id)) // Exclude all admin users
      .map((u, index) => {
        const profile = u.user_profiles?.[0] || {}; // Assuming one profile per user

        return {
          slNo: index + 1,
          id: u.id,
          name: profile.first_name || 'N/A',
          mobileNumber: profile.mobile_number || 'N/A',
          email: u.email || 'N/A',
          accountCreated: new Date(u.created_at).toLocaleDateString(),
          plan: 'N/A', // Set to N/A as subscriptions are not fetched
          daysLeft: 'N/A', // Set to N/A as subscriptions are not fetched
        };
      });

    console.log('API Route: Successfully fetched and formatted users.');
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('API Route: Unhandled error in /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}