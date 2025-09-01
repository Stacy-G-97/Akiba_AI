/**
 * Payment initialization API endpoint
 * 
 * SECURITY: This endpoint handles payment initialization securely
 * IntaSend API keys are kept server-side only
 */

export async function POST(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { planId, userEmail, amount, currency } = await request.json();
    
    // Validate input
    if (!planId || !userEmail || !amount || !currency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // SECURITY: Validate amount (prevent negative or excessive amounts)
    if (amount < 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate unique transaction ID
    const transactionId = `akiba_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production, this would integrate with IntaSend API
    // For demo purposes, we'll simulate the response
    const intasendResponse = {
      transactionId,
      checkoutUrl: `https://sandbox.intasend.com/checkout/${transactionId}`,
      status: 'pending'
    };

    // SECURITY: Log payment attempt for monitoring
    console.log(`Payment initialized: ${transactionId} for ${userEmail} - ${amount} ${currency}`);

    return new Response(
      JSON.stringify(intasendResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment initialization error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}