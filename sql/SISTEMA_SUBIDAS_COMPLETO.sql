-- ============================================
-- SISTEMA DE SUBIDAS (BOOST) - ESTRUTURA COMPLETA
-- ============================================
-- Sistema para acompanhantes comprarem destaque e ficarem no topo
-- Preparado para integração com Mercado Pago

-- ============================================
-- 1. TABELA DE PLANOS DE SUBIDA
-- ============================================
CREATE TABLE IF NOT EXISTS boost_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_hours INTEGER NOT NULL, -- Duração em horas
  price DECIMAL(10, 2) NOT NULL, -- Preço em reais
  highlight_color VARCHAR(20) DEFAULT '#FF007F', -- Cor do destaque
  badge_text VARCHAR(50) DEFAULT 'EM DESTAQUE', -- Texto do badge
  position_priority INTEGER NOT NULL DEFAULT 1, -- Quanto maior, mais no topo
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_boost_plans_active ON boost_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_boost_plans_priority ON boost_plans(position_priority DESC);

-- ============================================
-- 2. TABELA DE SUBIDAS ATIVAS (COMPRADAS)
-- ============================================
CREATE TABLE IF NOT EXISTS active_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID NOT NULL REFERENCES acompanhantes(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES boost_plans(id) ON DELETE CASCADE,

  -- Informações de pagamento (para integração futura com Mercado Pago)
  payment_id VARCHAR(255), -- ID do pagamento no Mercado Pago
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  payment_method VARCHAR(100), -- pix, credit_card, etc
  amount_paid DECIMAL(10, 2) NOT NULL,

  -- Controle de tempo
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: Uma acompanhante só pode ter uma subida ativa por vez (partial unique index)
-- Nota: A verificação de expiração é feita pela function deactivate_expired_boosts()
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_boost_per_companion
  ON active_boosts (companion_id)
  WHERE (is_active = true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_active_boosts_companion ON active_boosts(companion_id);
CREATE INDEX IF NOT EXISTS idx_active_boosts_expires ON active_boosts(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_boosts_active ON active_boosts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_active_boosts_payment ON active_boosts(payment_id);

-- ============================================
-- 3. HISTÓRICO DE SUBIDAS (para relatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS boost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID NOT NULL REFERENCES acompanhantes(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES boost_plans(id) ON DELETE CASCADE,
  boost_id UUID REFERENCES active_boosts(id) ON DELETE SET NULL,

  payment_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_hours INTEGER,

  views_during_boost INTEGER DEFAULT 0, -- Visualizações durante a subida
  clicks_during_boost INTEGER DEFAULT 0, -- Cliques durante a subida

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boost_history_companion ON boost_history(companion_id);
CREATE INDEX IF NOT EXISTS idx_boost_history_dates ON boost_history(started_at, ended_at);

-- ============================================
-- 4. INSERIR PLANOS PADRÃO DE SUBIDA
-- ============================================

-- Limpar planos existentes (cuidado em produção!)
TRUNCATE TABLE boost_plans CASCADE;

-- Plano 1: Subida Básica - 24 horas
INSERT INTO boost_plans (name, description, duration_hours, price, position_priority, badge_text, highlight_color) VALUES
('Subida 24h', 'Fique em destaque por 24 horas e aumente suas visualizações', 24, 19.90, 1, 'EM DESTAQUE', '#FF007F');

-- Plano 2: Subida Premium - 3 dias (72h)
INSERT INTO boost_plans (name, description, duration_hours, price, position_priority, badge_text, highlight_color) VALUES
('Subida 3 Dias', 'Destaque premium por 3 dias completos - Melhor custo-benefício!', 72, 49.90, 2, 'PREMIUM', '#9333EA');

-- Plano 3: Subida VIP - 7 dias (168h)
INSERT INTO boost_plans (name, description, duration_hours, price, position_priority, badge_text, highlight_color) VALUES
('Subida 7 Dias', 'Máximo destaque por uma semana inteira - Resultados garantidos!', 168, 89.90, 3, 'VIP', '#DC2626');

-- Plano 4: Subida Turbo - 1 hora (teste/urgente)
INSERT INTO boost_plans (name, description, duration_hours, price, position_priority, badge_text, highlight_color) VALUES
('Subida Turbo 1h', 'Destaque imediato por 1 hora - Perfeito para horários de pico', 1, 4.90, 1, 'TURBO', '#F59E0B');

-- ============================================
-- 5. FUNCTION: Desativar subidas expiradas automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION deactivate_expired_boosts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Atualizar subidas expiradas
  UPDATE active_boosts
  SET is_active = false,
      updated_at = NOW()
  WHERE is_active = true
    AND expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Mover para histórico
  INSERT INTO boost_history (
    companion_id, plan_id, boost_id, payment_id, amount_paid,
    started_at, ended_at, duration_hours
  )
  SELECT
    ab.companion_id,
    ab.plan_id,
    ab.id,
    ab.payment_id,
    ab.amount_paid,
    ab.started_at,
    ab.expires_at,
    bp.duration_hours
  FROM active_boosts ab
  JOIN boost_plans bp ON ab.plan_id = bp.id
  WHERE ab.is_active = false
    AND ab.expires_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM boost_history bh WHERE bh.boost_id = ab.id
    );

  RETURN expired_count;
END;
$$;

-- ============================================
-- 6. TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_boost_plans_updated_at ON boost_plans;
CREATE TRIGGER update_boost_plans_updated_at
  BEFORE UPDATE ON boost_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_active_boosts_updated_at ON active_boosts;
CREATE TRIGGER update_active_boosts_updated_at
  BEFORE UPDATE ON active_boosts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. FUNCTION: Criar uma nova subida (após pagamento aprovado)
-- ============================================
CREATE OR REPLACE FUNCTION create_boost(
  p_companion_id UUID,
  p_plan_id UUID,
  p_payment_id VARCHAR(255) DEFAULT NULL,
  p_payment_status VARCHAR(50) DEFAULT 'approved',
  p_payment_method VARCHAR(100) DEFAULT 'pending'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_boost_id UUID;
  v_duration_hours INTEGER;
  v_price DECIMAL(10, 2);
BEGIN
  -- Buscar informações do plano
  SELECT duration_hours, price
  INTO v_duration_hours, v_price
  FROM boost_plans
  WHERE id = p_plan_id AND is_active = true;

  IF v_duration_hours IS NULL THEN
    RAISE EXCEPTION 'Plano não encontrado ou inativo';
  END IF;

  -- Desativar qualquer subida ativa anterior desta acompanhante
  UPDATE active_boosts
  SET is_active = false, updated_at = NOW()
  WHERE companion_id = p_companion_id
    AND is_active = true;

  -- Criar nova subida
  INSERT INTO active_boosts (
    companion_id,
    plan_id,
    payment_id,
    payment_status,
    payment_method,
    amount_paid,
    started_at,
    expires_at,
    is_active
  ) VALUES (
    p_companion_id,
    p_plan_id,
    p_payment_id,
    p_payment_status,
    p_payment_method,
    v_price,
    NOW(),
    NOW() + (v_duration_hours || ' hours')::INTERVAL,
    true
  )
  RETURNING id INTO v_boost_id;

  RETURN v_boost_id;
END;
$$;

-- ============================================
-- 8. VIEW: Acompanhantes com boost ativo
-- ============================================
CREATE OR REPLACE VIEW companions_with_active_boost AS
SELECT
  a.*,
  ab.id as boost_id,
  ab.expires_at as boost_expires_at,
  bp.name as boost_plan_name,
  bp.badge_text as boost_badge,
  bp.highlight_color as boost_color,
  bp.position_priority as boost_priority,
  EXTRACT(EPOCH FROM (ab.expires_at - NOW())) / 3600 as hours_remaining
FROM acompanhantes a
INNER JOIN active_boosts ab ON a.id = ab.companion_id
INNER JOIN boost_plans bp ON ab.plan_id = bp.id
WHERE ab.is_active = true
  AND ab.expires_at > NOW()
  AND ab.payment_status = 'approved'
ORDER BY bp.position_priority DESC, ab.started_at DESC;

-- ============================================
-- 9. QUERIES ÚTEIS PARA O SISTEMA
-- ============================================

-- Query para listar acompanhantes com boost ativo no topo
-- (Usar na página principal)
/*
SELECT * FROM (
  -- Primeiro: Acompanhantes COM boost ativo
  SELECT
    a.*,
    ab.id as boost_id,
    bp.position_priority as boost_priority,
    bp.badge_text as boost_badge,
    bp.highlight_color as boost_color,
    true as has_boost
  FROM acompanhantes a
  INNER JOIN active_boosts ab ON a.id = ab.companion_id
  INNER JOIN boost_plans bp ON ab.plan_id = bp.id
  WHERE a.is_active = true
    AND ab.is_active = true
    AND ab.expires_at > NOW()
    AND ab.payment_status = 'approved'

  UNION ALL

  -- Depois: Acompanhantes SEM boost
  SELECT
    a.*,
    NULL as boost_id,
    0 as boost_priority,
    NULL as boost_badge,
    NULL as boost_color,
    false as has_boost
  FROM acompanhantes a
  WHERE a.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM active_boosts ab
      WHERE ab.companion_id = a.id
        AND ab.is_active = true
        AND ab.expires_at > NOW()
    )
) as all_companions
ORDER BY
  has_boost DESC,          -- Primeiro os com boost
  boost_priority DESC,      -- Depois por prioridade do plano
  created_at DESC;          -- Por último, os mais recentes
*/

-- Query para verificar boost ativo de uma acompanhante
/*
SELECT
  ab.*,
  bp.name as plan_name,
  bp.duration_hours,
  bp.badge_text,
  EXTRACT(EPOCH FROM (ab.expires_at - NOW())) / 3600 as hours_remaining
FROM active_boosts ab
JOIN boost_plans bp ON ab.plan_id = bp.id
WHERE ab.companion_id = 'UUID_DA_ACOMPANHANTE'
  AND ab.is_active = true
  AND ab.expires_at > NOW();
*/

-- ============================================
-- 10. POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE boost_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_history ENABLE ROW LEVEL SECURITY;

-- Políticas para boost_plans (todos podem ver planos ativos)
DROP POLICY IF EXISTS "Planos visíveis para todos" ON boost_plans;
CREATE POLICY "Planos visíveis para todos"
  ON boost_plans FOR SELECT
  USING (is_active = true);

-- Políticas para active_boosts
DROP POLICY IF EXISTS "Boosts visíveis para todos" ON active_boosts;
CREATE POLICY "Boosts visíveis para todos"
  ON active_boosts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Acompanhante pode ver seus boosts" ON active_boosts;
CREATE POLICY "Acompanhante pode ver seus boosts"
  ON active_boosts FOR SELECT
  USING (auth.uid()::text = companion_id::text);

DROP POLICY IF EXISTS "Sistema pode inserir boosts" ON active_boosts;
CREATE POLICY "Sistema pode inserir boosts"
  ON active_boosts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sistema pode atualizar boosts" ON active_boosts;
CREATE POLICY "Sistema pode atualizar boosts"
  ON active_boosts FOR UPDATE
  USING (true);

-- Políticas para boost_history
DROP POLICY IF EXISTS "Acompanhante pode ver seu histórico" ON boost_history;
CREATE POLICY "Acompanhante pode ver seu histórico"
  ON boost_history FOR SELECT
  USING (auth.uid()::text = companion_id::text);

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================

-- Executar limpeza de boosts expirados
SELECT deactivate_expired_boosts();

COMMENT ON TABLE boost_plans IS 'Planos de subida disponíveis para compra';
COMMENT ON TABLE active_boosts IS 'Subidas ativas (boosts) das acompanhantes';
COMMENT ON TABLE boost_history IS 'Histórico de todas as subidas já realizadas';
COMMENT ON FUNCTION create_boost IS 'Criar uma nova subida após aprovação do pagamento';
COMMENT ON FUNCTION deactivate_expired_boosts IS 'Desativar automaticamente subidas expiradas';
