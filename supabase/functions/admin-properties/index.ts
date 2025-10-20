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

    // Fetch properties with associated images and user email
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
        user_id(email, user_profiles(first_name, mobile_number))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (propertiesError) {
      console.error('Edge Function: Supabase properties fetch error details:', propertiesError); // Added detailed error logging
      return new Response(JSON.stringify({ error: 'Failed to fetch properties' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedProperties = properties.map((prop: any) => ({
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
      submittedByName: prop.user_id?.user_profiles?.first_name || 'N/A',
    }));

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