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

    // Verify user is an admin
    const { data: { user }, error: tokenVerificationError } = await supabaseAdmin.auth.getUser(accessToken);

    if (tokenVerificationError || !user) {
      console.error('Edge Function: Error verifying access token or user not found:', tokenVerificationError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired access token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError || !adminProfile) {
      console.warn(`Edge Function: User ${user.id} attempted to access admin properties API without admin profile.`);
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;

    // 1. Fetch properties with associated images and user_id (from auth.users)
    const { data: properties, error: propertiesError, count } = await supabaseAdmin
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        district,
        locality,
        property_type,
        transaction_type,
        created_at,
        property_images(image_url, order_index),
        user_id(id, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (propertiesError) {
      console.error('Edge Function: Supabase properties fetch error details:', JSON.stringify(propertiesError, null, 2)); // Log full error object
      return new Response(JSON.stringify({ error: propertiesError.message || 'Failed to fetch properties' }), { // Return specific error message
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Extract unique user IDs from fetched properties
    const uniqueUserIds = [...new Set(properties.map((prop: any) => prop.user_id?.id).filter(Boolean))];

    let userProfilesMap = new Map();
    if (uniqueUserIds.length > 0) {
      // 3. Fetch user profiles for these unique user IDs
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, mobile_number')
        .in('id', uniqueUserIds);

      if (profilesError) {
        console.error('Edge Function: Error fetching user profiles:', JSON.stringify(profilesError, null, 2)); // Log full error object
        // Log the error but don't fail the entire request; proceed without profile names/numbers
      } else {
        profiles.forEach((profile: any) => {
          userProfilesMap.set(profile.id, profile);
        });
      }
    }

    // 4. Format properties and combine with user profile data
    const formattedProperties = properties.map((prop: any) => {
      const userProfile = userProfilesMap.get(prop.user_id?.id);
      return {
        id: prop.id,
        title: prop.title,
        description: prop.description,
        price: prop.price,
        district: prop.district,
        locality: prop.locality,
        propertyType: prop.property_type,
        transactionType: prop.transaction_type,
        createdAt: new Date(prop.created_at).toLocaleDateString(),
        images: prop.property_images.sort((a: any, b: any) => a.order_index - b.order_index).map((img: any) => img.image_url),
        submittedByEmail: prop.user_id?.email || 'N/A',
        submittedByName: userProfile?.first_name || 'N/A',
        submittedByMobile: userProfile?.mobile_number || 'N/A',
      };
    });

    return new Response(JSON.stringify({ properties: formattedProperties, totalCount: count }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error in admin-properties:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});