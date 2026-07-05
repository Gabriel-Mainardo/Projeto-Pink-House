-- =====================================================================
-- CORRIGE TODAS AS COLUNAS FALTANDO NO BANCO DE PRODUÇÃO
-- Rode este SQL no Supabase Dashboard → SQL Editor
-- =====================================================================

-- 1) companion_verifications: adicionar colunas de media_comparison e status
ALTER TABLE companion_verifications
  ADD COLUMN IF NOT EXISTS media_comparison_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS media_comparison_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS media_comparison_video_url TEXT,
  ADD COLUMN IF NOT EXISTS media_comparison_status TEXT
    CHECK (media_comparison_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS document_status TEXT
    CHECK (document_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS photo_status TEXT
    CHECK (photo_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS video_status TEXT
    CHECK (video_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 0;

-- 2) acompanhantes: adicionar coluna reliability_score (aparece na "subida"/boost card)
ALTER TABLE acompanhantes
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 0;

-- 3) Garantir default para registros existentes
UPDATE companion_verifications
SET media_comparison_verified = COALESCE(media_comparison_verified, FALSE)
WHERE media_comparison_verified IS NULL;

UPDATE companion_verifications
SET reliability_score = COALESCE(reliability_score, 0)
WHERE reliability_score IS NULL;

UPDATE acompanhantes
SET reliability_score = COALESCE(reliability_score, 0)
WHERE reliability_score IS NULL;

-- 4) Policy de INSERT no cadastro (permitir anon criar perfil)
DROP POLICY IF EXISTS "Permitir criação de perfil no cadastro" ON public.acompanhantes;
CREATE POLICY "Permitir criação de perfil no cadastro"
  ON public.acompanhantes FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth_user_id IS NOT NULL);

-- 5) Índices úteis
CREATE INDEX IF NOT EXISTS idx_verif_statuses ON companion_verifications
  (document_status, photo_status, video_status, media_comparison_status);

-- =====================================================================
-- Verificar resultado
-- =====================================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companion_verifications'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'acompanhantes' AND column_name = 'reliability_score';
