// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST for actions
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
      console.warn(`Edge Function: User ${user.id} attempted to perform admin action without admin profile.`);
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let responseData;

    switch (action) {
      case 'deleteUser':
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;
        responseData = { message: 'User deleted successfully.' };
        break;
      case 'blockUser':
        // Set banned_until to a far future date for a permanent block
        const { error: blockError } = await supabaseAdmin.auth.admin.updateUser(userId, {
          banned_until: '2099-12-31T23:59:59Z', // Effectively permanent
        });
        if (blockError) throw blockError;
        responseData = { message: 'User blocked successfully.' };
        break;
      case 'unblockUser':
        // Set banned_until to null to unblock
        const { error: unblockError } = await supabaseAdmin.auth.admin.updateUser(userId, {
          banned_until: null,
        });
        if (unblockError) throw unblockError;
        responseData = { message: 'User unblocked successfully.' };
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error in admin-actions:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});