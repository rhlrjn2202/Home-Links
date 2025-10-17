import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('API Route: Starting GET request for /api/admin/users');
    console.log('API Route: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set');
    console.log('API Route: NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set');

    // Extract the Authorization header
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    console.log('API Route: Access Token from Authorization header:', accessToken ? accessToken.substring(0, 20) + '...' : 'Missing');

    if (!accessToken) {
      console.log('API Route: No access token found in Authorization header, returning 401 Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized: Access token missing' }, { status: 401 });
    }

    // Initialize Supabase client. We'll use the provided access token directly.
    // For server-side, we still need to provide cookie handlers, but the primary auth
    // will come from the token we explicitly set.
    const cookieStore = await cookies(); // Still need this for potential refresh token handling by Supabase client

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => {
            cookieStore.set(name, value, options);
          },
          remove: (name: string, options: CookieOptions) => {
            cookieStore.set(name, '', options);
          },
        },
      }
    );

    // Set the session explicitly using the access token from the header
    // This is crucial for the server-side client to recognize the user
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken, // Supabase client might try to refresh, so provide a placeholder
    });

    if (setSessionError) {
      console.error('API Route: Error setting session with provided access token:', setSessionError);
      return NextResponse.json({ error: 'Unauthorized: Invalid access token' }, { status: 401 });
    }

    // 1. Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('API Route: User from supabase.auth.getUser():', user ? user.id : 'null');
    if (userError) {
      console.error('API Route: Error getting user from supabase.auth.getUser():', userError);
    }

    if (!user) {
      console.log('API Route: No user found after getUser(), returning 401 Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the authenticated user is an admin
    const { data: adminProfile, error: adminError } = await supabase
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

    // Fetch all admin user IDs to exclude them from the normal user list
    const { data: allAdminProfiles, error: allAdminProfilesError } = await supabase
      .from('admin_profiles')
      .select('id');

    if (allAdminProfilesError) {
      console.error('API Route: Error fetching all admin profiles for filtering:', allAdminProfilesError);
      return NextResponse.json({ error: 'Failed to fetch admin profiles for filtering' }, { status: 500 });
    }

    const adminUserIds = allAdminProfiles.map(admin => admin.id);
    console.log('API Route: Admin User IDs for filtering:', adminUserIds);

    // 3. Fetch user data, profiles, and subscriptions
    const { data: usersData, error: usersError } = await supabase
      .from('auth.users')
      .select(`
        id,
        email,
        created_at,
        user_profiles (
          first_name,
          mobile_number
        ),
        user_subscriptions (
          plan_name,
          expires_at
        )
      `)
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('API Route: Error fetching users from Supabase:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users from database' }, { status: 500 });
    }

    // 4. Process data for the table, filtering out all admin users
    const formattedUsers = usersData
      .filter(u => !adminUserIds.includes(u.id)) // Exclude all admin users
      .map((u, index) => {
        const profile = u.user_profiles?.[0] || {}; // Assuming one profile per user
        const subscription = u.user_subscriptions?.[0] || {}; // Assuming one active subscription per user

        let daysLeft = null;
        if (subscription.expires_at) {
          const expiryDate = new Date(subscription.expires_at);
          const now = new Date();
          const diffTime = expiryDate.getTime() - now.getTime();
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          slNo: index + 1,
          id: u.id,
          name: profile.first_name || 'N/A',
          mobileNumber: profile.mobile_number || 'N/A',
          email: u.email || 'N/A',
          accountCreated: new Date(u.created_at).toLocaleDateString(),
          plan: subscription.plan_name || 'Free',
          daysLeft: daysLeft !== null ? (daysLeft > 0 ? daysLeft : 'Expired') : 'N/A',
        };
      });

    console.log('API Route: Successfully fetched and formatted users.');
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('API Route: Unhandled error in /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}