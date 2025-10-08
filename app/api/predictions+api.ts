import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

interface DemandPrediction {
  item_name: string;
  predicted_demand: number;
  confidence_score: number;
  recommendation: string;
  factors?: any[];
  timeframe_days: number;
  expires_at: string;
}

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validatePrediction(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.item_name || typeof data.item_name !== 'string' || data.item_name.length === 0) {
    errors.push('Item name is required and must be a non-empty string');
  }

  if (typeof data.predicted_demand !== 'number' || data.predicted_demand < 0) {
    errors.push('Predicted demand must be a non-negative number');
  }

  if (typeof data.confidence_score !== 'number' || data.confidence_score < 0 || data.confidence_score > 100) {
    errors.push('Confidence score must be a number between 0 and 100');
  }

  if (!data.recommendation || typeof data.recommendation !== 'string') {
    errors.push('Recommendation is required and must be a string');
  }

  if (typeof data.timeframe_days !== 'number' || data.timeframe_days <= 0 || data.timeframe_days > 365) {
    errors.push('Timeframe days must be a number between 1 and 365');
  }

  return { valid: errors.length === 0, errors };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const activeOnly = url.searchParams.get('activeOnly') === 'true';

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('demand_predictions')
      .select('*')
      .eq('user_id', sanitizeString(userId));

    if (activeOnly) {
      query = query.gt('expires_at', new Date().toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
    const { userId, ...predictionData } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validation = validatePrediction(predictionData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.errors.join(', ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + predictionData.timeframe_days * 24);

    const sanitizedPrediction: DemandPrediction & { user_id: string } = {
      item_name: sanitizeString(predictionData.item_name),
      predicted_demand: predictionData.predicted_demand,
      confidence_score: predictionData.confidence_score,
      recommendation: sanitizeString(predictionData.recommendation),
      factors: predictionData.factors || [],
      timeframe_days: predictionData.timeframe_days,
      expires_at: expiresAt.toISOString(),
      user_id: sanitizeString(userId),
    };

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('demand_predictions')
      .insert([sanitizedPrediction])
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
      .from('demand_predictions')
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
