const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
    const { mergeVerificationRecords } = await import('../../shared/reliability.mjs');
    const { companion_ids: companionIds } = JSON.parse(event.body || '{}');
    const uniqueIds = Array.from(new Set((Array.isArray(companionIds) ? companionIds : []).filter(Boolean)));

    if (uniqueIds.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, scores: {} }) };
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Server configuration error' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('companion_verifications')
      .select('*')
      .in('companion_id', uniqueIds)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reliability scores:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
    }

    const recordsByCompanion = new Map();
    for (const record of data || []) {
      const current = recordsByCompanion.get(record.companion_id) || [];
      current.push(record);
      recordsByCompanion.set(record.companion_id, current);
    }

    const scores = {};
    for (const companionId of uniqueIds) {
      const merged = mergeVerificationRecords(recordsByCompanion.get(companionId) || []);
      scores[companionId] = merged?.reliability_score || 0;
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, scores }) };
  } catch (error) {
    console.error('public-reliability-scores error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Internal server error' }) };
  }
};
