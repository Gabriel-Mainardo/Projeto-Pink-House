const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { conversation_id, sender_id, text, admin_key } = JSON.parse(event.body);

    // Simple admin verification
    if (admin_key !== 'pinkhouse-admin-2024') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (!conversation_id || !sender_id || !text?.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert message bypassing RLS
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id,
        text: text.trim()
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error inserting message:', msgError);
      return { statusCode: 500, headers, body: JSON.stringify({ error: msgError.message }) };
    }

    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message_text: text.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message }) };
  } catch (err) {
    console.error('Admin send message error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
