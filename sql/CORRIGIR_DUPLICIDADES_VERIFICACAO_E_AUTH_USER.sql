-- Corrige duplicidades que quebram consultas single/maybeSingle no app.
-- 1. Remove registros duplicados em companion_verifications mantendo o mais recente.
-- 2. Remove acompanhantes duplicadas por auth_user_id mantendo o registro mais recente.
-- 3. Recria constraints/indices para evitar reincidencia.

BEGIN;

WITH ranked_verifications AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY companion_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS row_num
  FROM public.companion_verifications
)
DELETE FROM public.companion_verifications cv
USING ranked_verifications rv
WHERE cv.id = rv.id
  AND rv.row_num > 1;

WITH ranked_companions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY auth_user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS row_num
  FROM public.acompanhantes
  WHERE auth_user_id IS NOT NULL
)
DELETE FROM public.acompanhantes a
USING ranked_companions rc
WHERE a.id = rc.id
  AND rc.row_num > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'companion_verifications_companion_id_key'
  ) THEN
    ALTER TABLE public.companion_verifications
      ADD CONSTRAINT companion_verifications_companion_id_key UNIQUE (companion_id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_acompanhantes_auth_user_id_unique
  ON public.acompanhantes (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

COMMIT;
