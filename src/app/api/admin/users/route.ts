import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

    // Explicitly treat cookies() as a Promise to satisfy TypeScript compiler,
    // and ensure correct method calls.
    const cookieStorePromise = Promise.resolve(cookies());

    // 1. Create a Supabase client for the *requesting user's session* (using anon key)
    // This client will be used to verify the user's identity and admin status.
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => (await cookieStorePromise).get(name)?.value,
          set: async (name: string, value: string, options: CookieOptions) => {
            (await cookieStorePromise).set(name, value, options);
          },
          remove: async (name: string, options: CookieOptions) => {
            (await cookieStorePromise).delete(name); // FIX: Use .delete() for next/headers cookies
          },
        },
      }
    );

    // Explicitly set the session for supabaseUser client using the access token
    const { error: setSessionError } = await supabaseUser.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken, // Placeholder, actual refresh token might not be available here
    });

    if (setSessionError) {
      console.error('API Route: Error setting session for user client:', setSessionError);
      return NextResponse.json({ error: 'Unauthorized: Invalid access token' }, { status: 401 });
    }

    // Get the user from the session
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    console.log('API Route: User from supabaseUser.auth.getUser():', user ? user.id : 'null');
    if (userError) {
      console.error('API Route: Error getting user from supabaseUser.auth.getUser():', userError);
    }

    if (!user) {
      console.log('API Route: No user found after getUser(), returning 401 Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the authenticated user is an admin using the supabaseUser client
    const { data: adminProfile, error: adminError } = await supabaseUser
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('API Route: Admin Profile Check - Data:', adminProfile ? adminProfile.id : 'null');
    console.log('API Route: Admin Profile Check - Error:', adminError);

    if (adminError || !adminProfile) {
      console.warn(`API Route: User ${user.id} attempted to access admin users API without admin profile or encountered an error.`);
      return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
    }

    // 3. Create a *separate* Supabase client with the SERVICE_ROLE_KEY for privileged data fetching
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the SERVICE_ROLE_KEY here
      {
        cookies: {
          get: async (name: string) => (await cookieStorePromise).get(name)?.value,
          set: async (name: string, value: string, options: CookieOptions) => {
            (await cookieStorePromise).set(name, value, options);
          },
          remove: async (name: string, options: CookieOptions) => {
            (await cookieStorePromise).delete(name); // FIX: Use .delete() for next/headers cookies
          },
        },
      }
    );

    // Fetch all admin user IDs to exclude them from the normal user list using supabaseAdmin
    const { data: allAdminProfiles, error: allAdminProfilesError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id');

    if (allAdminProfilesError) {
      console.error('API Route: Error fetching all admin profiles for filtering with supabaseAdmin:', allAdminProfilesError);
      return NextResponse.json({ error: 'Failed to fetch admin profiles for filtering' }, { status: 500 });
    }

    const adminUserIds = allAdminProfiles.map(admin => admin.id);
    console.log('API Route: Admin User IDs for filtering:', adminUserIds);

    // 4. Fetch user data and profiles using the supabaseAdmin client, excluding subscriptions
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

    // 5. Process data for the table, filtering out all admin users
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