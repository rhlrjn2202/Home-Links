import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Log environment variables to confirm they are loaded
    console.log('API Route: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set');
    console.log('API Route: NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set');

    // Explicitly await cookies() to ensure we're working with the resolved ReadonlyRequestCookies object
    const cookieStore = await cookies();

    // Log all cookies received by the API route
    console.log('API Route: All cookies received:');
    cookieStore.getAll().forEach((cookie: { name: string; value: string }) => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, Math.min(cookie.value.length, 20))}...`);
    });

    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    console.log('API Route: sb-access-token value:', accessToken ? accessToken.substring(0, 20) + '...' : 'Missing');
    console.log('API Route: sb-refresh-token value:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'Missing');

    // If essential Supabase auth cookies are missing, return unauthorized early
    if (!accessToken || !refreshToken) {
      console.log('API Route: Supabase auth cookies (access or refresh token) missing, returning 401 Unauthorized.');
      return NextResponse.json({ error: 'Unauthorized: Supabase auth cookies missing' }, { status: 401 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // These handlers must be synchronous and use the already-awaited cookieStore
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

    // 1. Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('API Route: User from supabase.auth.getUser():', user);
    if (userError) {
      console.error('API Route: Error getting user:', userError);
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

    console.log('API Route: Admin Profile Check - Data:', adminProfile);
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

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('API Route: Unhandled error in /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}