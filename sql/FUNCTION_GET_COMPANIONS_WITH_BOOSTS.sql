-- ============================================
-- FUNCTION: Buscar acompanhantes ordenadas por subidas
-- ============================================
-- Regra de ranking:
-- 1. Perfis com boost ativo
-- 2. Quem pagou mais fica mais no topo
-- 3. Em empate, a subida mais recente
-- 4. Perfis sem boost descem naturalmente

CREATE OR REPLACE FUNCTION get_companions_with_boosts()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  real_name VARCHAR,
  display_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  age INTEGER,
  location VARCHAR,
  height VARCHAR,
  weight VARCHAR,
  image TEXT,
  cover_photo TEXT,
  gallery TEXT[],
  videos TEXT[],
  audio_url TEXT,
  video_url TEXT,
  rating DECIMAL,
  tags TEXT[],
  description TEXT,
  priceperhour DECIMAL,
  thirty_minutes DECIMAL,
  pernoite DECIMAL,
  travel_price DECIMAL,
  hasownlocation BOOLEAN,
  acceptsclientlocation BOOLEAN,
  acceptsmotel BOOLEAN,
  cities_served TEXT[],
  services TEXT[],
  minimum_time VARCHAR,
  serves_whom VARCHAR,
  preferences TEXT,
  is_verified BOOLEAN,
  is_active BOOLEAN,
  is_available BOOLEAN,
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  has_boost BOOLEAN,
  boost_id UUID,
  boost_priority INTEGER,
  boost_amount_paid DECIMAL,
  boost_started_at TIMESTAMPTZ,
  boost_badge VARCHAR,
  boost_color VARCHAR,
  boost_expires_at TIMESTAMPTZ,
  hours_remaining NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.real_name,
    a.display_name,
    a.email,
    a.phone,
    a.age,
    a.location,
    a.height,
    a.weight,
    a.image,
    a.cover_photo,
    a.gallery,
    a.videos,
    a.audio_url,
    a.video_url,
    a.rating,
    a.tags,
    a.description,
    a.priceperhour,
    a.thirty_minutes,
    a.pernoite,
    a.travel_price,
    a.hasownlocation,
    a.acceptsclientlocation,
    a.acceptsmotel,
    a.cities_served,
    a.services,
    a.minimum_time,
    a.serves_whom,
    a.preferences,
    a.is_verified,
    a.is_active,
    a.is_available,
    a.is_featured,
    a.created_at,
    a.updated_at,
    COALESCE(ab.id IS NOT NULL, FALSE) as has_boost,
    ab.id as boost_id,
    COALESCE(bp.position_priority, 0) as boost_priority,
    COALESCE(ab.amount_paid, bp.price, 0) as boost_amount_paid,
    ab.started_at as boost_started_at,
    bp.badge_text as boost_badge,
    bp.highlight_color as boost_color,
    ab.expires_at as boost_expires_at,
    CASE
      WHEN ab.expires_at IS NOT NULL THEN EXTRACT(EPOCH FROM (ab.expires_at - NOW())) / 3600
      ELSE NULL
    END as hours_remaining
  FROM acompanhantes a
  LEFT JOIN active_boosts ab ON (
    a.id = ab.companion_id
    AND ab.is_active = true
    AND ab.expires_at > NOW()
    AND ab.payment_status = 'approved'
  )
  LEFT JOIN boost_plans bp ON ab.plan_id = bp.id
  WHERE a.is_active = true
  ORDER BY
    (ab.id IS NOT NULL) DESC,
    COALESCE(ab.amount_paid, bp.price, 0) DESC NULLS LAST,
    ab.started_at DESC NULLS LAST,
    bp.position_priority DESC NULLS LAST,
    a.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_companions_with_boosts IS 'Busca acompanhantes ativas e ordena por boost ativo, valor pago e recencia da subida';
