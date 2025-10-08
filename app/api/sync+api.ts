import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateSyncData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!['inventory', 'prediction', 'sale', 'waste'].includes(data.data_type)) {
    errors.push('Data type must be one of: inventory, prediction, sale, waste');
  }

  if (!['create', 'update', 'delete'].includes(data.operation)) {
    errors.push('Operation must be one of: create, update, delete');
  }

  if (!data.data_payload || typeof data.data_payload !== 'object') {
    errors.push('Data payload is required and must be an object');
  }

  return { valid: errors.length === 0, errors };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const unsyncedOnly = url.searchParams.get('unsyncedOnly') === 'true';

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('sync_queue')
      .select('*')
      .eq('user_id', sanitizeString(userId));

    if (unsyncedOnly) {
      query = query.eq('synced', false);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...syncData } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validation = validateSyncData(syncData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.errors.join(', ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedSyncData = {
      data_type: sanitizeString(syncData.data_type),
      data_payload: syncData.data_payload,
      operation: sanitizeString(syncData.operation),
      synced: false,
      user_id: sanitizeString(userId),
    };

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('sync_queue')
      .insert([sanitizedSyncData])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, synced } = body;

    if (!id || !userId || typeof synced !== 'boolean') {
      return new Response(JSON.stringify({ error: 'id, userId, and synced (boolean) are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const updateData: any = { synced };
    if (synced) {
      updateData.synced_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('sync_queue')
      .update(updateData)
      .eq('id', sanitizeString(id))
      .eq('user_id', sanitizeString(userId))
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
