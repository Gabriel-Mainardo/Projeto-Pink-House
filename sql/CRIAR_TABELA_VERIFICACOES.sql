-- =============================================================
-- Tabela: companion_verifications
-- Rastreia o progresso de verificação de cada acompanhante
-- =============================================================

CREATE TABLE IF NOT EXISTS companion_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  companion_id UUID NOT NULL REFERENCES acompanhantes(id) ON DELETE CASCADE,

  -- Fase 1: Básicas
  phone_verified        BOOLEAN   DEFAULT FALSE,
  phone_verified_at     TIMESTAMPTZ,
  phone_number          TEXT,

  email_verified        BOOLEAN   DEFAULT FALSE,
  email_verified_at     TIMESTAMPTZ,

  profile_completed     BOOLEAN   DEFAULT FALSE,
  profile_completed_at  TIMESTAMPTZ,

  -- Fase 2: Avançadas
  document_verified     BOOLEAN   DEFAULT FALSE,
  document_verified_at  TIMESTAMPTZ,
  document_type         TEXT,
  document_front_url    TEXT,
  document_back_url     TEXT,
  document_status       TEXT      DEFAULT 'pending'
                        CHECK (document_status IN ('pending','approved','rejected')),

  photo_verified        BOOLEAN   DEFAULT FALSE,
  photo_verified_at     TIMESTAMPTZ,
  verification_photos   TEXT[],
  photo_status          TEXT      DEFAULT 'pending'
                        CHECK (photo_status IN ('pending','approved','rejected')),

  video_verified        BOOLEAN   DEFAULT FALSE,
  video_verified_at     TIMESTAMPTZ,
  verification_video_url TEXT,
  video_status          TEXT      DEFAULT 'pending'
                        CHECK (video_status IN ('pending','approved','rejected')),

  media_comparison_verified BOOLEAN DEFAULT FALSE,
  media_comparison_verified_at TIMESTAMPTZ,
  media_comparison_video_url TEXT,
  media_comparison_status   TEXT    DEFAULT 'pending'
                        CHECK (media_comparison_status IN ('pending','approved','rejected')),

  reliability_score     INTEGER   DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (companion_id)
);

-- Índice para busca rápida por companion_id
CREATE INDEX IF NOT EXISTS idx_companion_verifications_companion_id
  ON companion_verifications (companion_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_companion_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_companion_verifications_updated_at ON companion_verifications;
CREATE TRIGGER trg_companion_verifications_updated_at
  BEFORE UPDATE ON companion_verifications
  FOR EACH ROW EXECUTE FUNCTION update_companion_verifications_updated_at();

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
ALTER TABLE companion_verifications ENABLE ROW LEVEL SECURITY;

-- Acompanhante lê o próprio registro
CREATE POLICY "companions_select_own"
  ON companion_verifications FOR SELECT
  USING (true);

-- Acompanhante cria o próprio registro
CREATE POLICY "companions_insert_own"
  ON companion_verifications FOR INSERT
  WITH CHECK (true);

-- Acompanhante atualiza o próprio registro
CREATE POLICY "companions_update_own"
  ON companion_verifications FOR UPDATE
  USING (true);
