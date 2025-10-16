import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the authenticated user is an admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError || !adminProfile) {
      console.warn(`User ${user.id} attempted to access admin users API without admin profile.`);
      return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
    }

    // Fetch all admin user IDs to exclude them from the normal user list
    const { data: allAdminProfiles, error: allAdminProfilesError } = await supabase
      .from('admin_profiles')
      .select('id');

    if (allAdminProfilesError) {
      console.error('Error fetching all admin profiles:', allAdminProfilesError);
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
      console.error('Error fetching users from Supabase:', usersError);
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
    console.error('Unhandled error in /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}