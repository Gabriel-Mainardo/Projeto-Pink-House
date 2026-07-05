const { createClient } = require('@supabase/supabase-js');

const STEP_POINTS = {
  phone: 0,
  email: 20,
  profile: 20,
  document: 20,
  photo: 20,
  video: 20,
  mediaComparison: 20,
};

const GESTURE_SELFIE_PREFIX = 'gesture-selfie::';

function calculateReliabilityScore(verification) {
  if (!verification) return 0;

  let earnedPoints = 0;
  if (verification.phone_verified) earnedPoints += STEP_POINTS.phone;
  if (verification.email_verified) earnedPoints += STEP_POINTS.email;
  if (verification.profile_completed) earnedPoints += STEP_POINTS.profile;
  if (verification.document_verified) earnedPoints += STEP_POINTS.document;
  if (verification.photo_verified) earnedPoints += STEP_POINTS.photo;
  if (verification.video_verified) earnedPoints += STEP_POINTS.video;
  if (verification.media_comparison_verified) earnedPoints += STEP_POINTS.mediaComparison;

  const totalPossiblePoints = Object.values(STEP_POINTS).reduce((sum, points) => sum + points, 0);
  return totalPossiblePoints > 0 ? Math.min(Math.round((earnedPoints / totalPossiblePoints) * 100), 100) : 0;
}

function getRegularVerificationPhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.filter((photo) => !photo.startsWith(GESTURE_SELFIE_PREFIX));
}

function getLatestMeaningfulValue(records, selector, predicate = (value) => value !== null && value !== undefined) {
  for (const record of records) {
    const value = selector(record);
    if (value !== null && value !== undefined && predicate(value)) {
      return value;
    }
  }

  return null;
}

function mergeVerificationRecords(records) {
  if (!records.length) {
    return null;
  }

  const latest = records[0];
  const mergedPhotos = Array.from(new Set(records.flatMap((record) => record.verification_photos || [])));

  const merged = {
    ...latest,
    phone_verified: records.some((record) => Boolean(record.phone_verified)),
    phone_verified_at: getLatestMeaningfulValue(records, (record) => record.phone_verified_at) || null,
    phone_number: getLatestMeaningfulValue(records, (record) => record.phone_number, (value) => value.trim().length > 0) || null,
    email_verified: records.some((record) => Boolean(record.email_verified)),
    email_verified_at: getLatestMeaningfulValue(records, (record) => record.email_verified_at) || null,
    profile_completed: records.some((record) => Boolean(record.profile_completed)),
    profile_completed_at: getLatestMeaningfulValue(records, (record) => record.profile_completed_at) || null,
    document_verified: records.some((record) => Boolean(record.document_verified)),
    document_verified_at: getLatestMeaningfulValue(records, (record) => record.document_verified_at) || null,
    photo_verified: records.some((record) => Boolean(record.photo_verified)) || getRegularVerificationPhotos(mergedPhotos).length > 0,
    photo_verified_at: getLatestMeaningfulValue(records, (record) => record.photo_verified_at) || null,
    verification_photos: mergedPhotos,
    video_verified: records.some((record) => Boolean(record.video_verified)),
    video_verified_at: getLatestMeaningfulValue(records, (record) => record.video_verified_at) || null,
    media_comparison_verified: records.some((record) => Boolean(record.media_comparison_verified)),
    media_comparison_verified_at: getLatestMeaningfulValue(records, (record) => record.media_comparison_verified_at) || null,
  };

  merged.reliability_score = calculateReliabilityScore(merged);
  return merged;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
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
