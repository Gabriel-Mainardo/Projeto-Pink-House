const RESEND_API_KEY = process.env.RESEND_API_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid body' }) };
  }

  if (!email) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'email required' }) };
  }

  if (!RESEND_API_KEY) {
    // If env var not configured, assume not suppressed so we don't block legit users
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ suppressed: false }) };
  }

  try {
    const response = await fetch('https://api.resend.com/suppressions', {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
    });

    if (!response.ok) {
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ suppressed: false }) };
    }

    const data = await response.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    const emailLower = email.toLowerCase().trim();
    const isSuppressed = list.some((entry) => entry?.email?.toLowerCase().trim() === emailLower);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ suppressed: isSuppressed }),
    };
  } catch {
    // On unexpected error, assume not suppressed to avoid blocking legit sends
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ suppressed: false }) };
  }
};
