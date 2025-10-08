import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

interface InventoryItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  expiry_date?: string;
  status: 'good' | 'warning' | 'critical';
}

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateInventoryItem(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    errors.push('Quantity must be a non-negative number');
  }

  if (!data.unit || typeof data.unit !== 'string') {
    errors.push('Unit is required and must be a string');
  }

  if (typeof data.cost !== 'number' || data.cost < 0) {
    errors.push('Cost must be a non-negative number');
  }

  if (!['good', 'warning', 'critical'].includes(data.status)) {
    errors.push('Status must be one of: good, warning, critical');
  }

  if (data.expiry_date && isNaN(Date.parse(data.expiry_date))) {
    errors.push('Expiry date must be a valid date string');
  }

  return { valid: errors.length === 0, errors };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', sanitizeString(userId))
      .order('created_at', { ascending: false });

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
    const { userId, ...itemData } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validation = validateInventoryItem(itemData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.errors.join(', ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedItem: InventoryItem & { user_id: string } = {
      name: sanitizeString(itemData.name),
      category: sanitizeString(itemData.category),
      quantity: itemData.quantity,
      unit: sanitizeString(itemData.unit),
      cost: itemData.cost,
      status: itemData.status,
      user_id: sanitizeString(userId),
    };

    if (itemData.expiry_date) {
      sanitizedItem.expiry_date = itemData.expiry_date;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([sanitizedItem])
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
    const { id, userId, ...itemData } = body;

    if (!id || !userId) {
      return new Response(JSON.stringify({ error: 'id and userId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validation = validateInventoryItem(itemData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.errors.join(', ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedItem: Partial<InventoryItem> = {
      name: sanitizeString(itemData.name),
      category: sanitizeString(itemData.category),
      quantity: itemData.quantity,
      unit: sanitizeString(itemData.unit),
      cost: itemData.cost,
      status: itemData.status,
    };

    if (itemData.expiry_date) {
      sanitizedItem.expiry_date = itemData.expiry_date;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('inventory_items')
      .update(sanitizedItem)
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');

    if (!id || !userId) {
      return new Response(JSON.stringify({ error: 'id and userId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', sanitizeString(id))
      .eq('user_id', sanitizeString(userId));

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
