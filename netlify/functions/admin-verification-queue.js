const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing env vars' }) };
  }

  // Service role bypasses RLS — admin pode ver todos os registros
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (event.httpMethod === 'GET') {
      // Buscar fila de verificações pendentes
      const { data, error } = await supabase
        .from('companion_verifications')
        .select(`
          *,
          companion:acompanhantes!companion_id (
            id,
            name,
            display_name,
            image,
            email,
            location
          )
        `)
        .or('document_status.eq.pending,video_status.eq.pending,media_comparison_status.eq.pending,photo_status.eq.pending')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar fila de verificações:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (event.httpMethod === 'POST') {
      // Aprovar/rejeitar uma etapa de verificação
      const { companionId, step, decision } = JSON.parse(event.body || '{}');

      if (!companionId || !step || !decision) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'companionId, step e decision são obrigatórios' }) };
      }

      const now = new Date().toISOString();
      const approved = decision === 'approved';

      const fieldMap = {
        document: {
          verified: 'document_verified',
          verified_at: 'document_verified_at',
          status: 'document_status',
        },
        photo: {
          verified: 'photo_verified',
          verified_at: 'photo_verified_at',
          status: 'photo_status',
        },
        video: {
          verified: 'video_verified',
          verified_at: 'video_verified_at',
          status: 'video_status',
        },
        'media-comparison': {
          verified: 'media_comparison_verified',
          verified_at: 'media_comparison_verified_at',
          status: 'media_comparison_status',
        },
      };

      const fields = fieldMap[step];
      if (!fields) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Step inválido: ${step}` }) };
      }

      const payload = {
        [fields.verified]: approved,
        [fields.verified_at]: approved ? now : null,
        [fields.status]: decision,
        updated_at: now,
      };

      const { error } = await supabase
        .from('companion_verifications')
        .update(payload)
        .eq('companion_id', companionId);

      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }

      // Recalcular reliability score
      const { data: verification } = await supabase
        .from('companion_verifications')
        .select('*')
        .eq('companion_id', companionId)
        .single();

      if (verification) {
        const STEP_POINTS = { phone: 0, email: 20, profile: 20, document: 20, photo: 20, video: 20, mediaComparison: 20 };
        let earned = 0;
        if (verification.phone_verified) earned += STEP_POINTS.phone;
        if (verification.email_verified) earned += STEP_POINTS.email;
        if (verification.profile_completed) earned += STEP_POINTS.profile;
        if (verification.document_verified || verification.document_status === 'pending') earned += STEP_POINTS.document;
        if (verification.photo_verified || verification.photo_status === 'pending') earned += STEP_POINTS.photo;
        if (verification.video_verified || verification.video_status === 'pending') earned += STEP_POINTS.video;
        if (verification.media_comparison_verified || verification.media_comparison_status === 'pending') earned += STEP_POINTS.mediaComparison;
        const total = Object.values(STEP_POINTS).reduce((s, p) => s + p, 0);
        const score = Math.min(Math.round((earned / total) * 100), 100);

        await supabase
          .from('companion_verifications')
          .update({ reliability_score: score })
          .eq('companion_id', companionId);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('Erro em admin-verification-queue:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
