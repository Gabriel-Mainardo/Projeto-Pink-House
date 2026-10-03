-- Require a confirmed Auth session before creating a companion profile.
-- Older policies permitted anonymous inserts before email confirmation.
BEGIN;

DROP POLICY IF EXISTS "Autenticados criam perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir criação de perfil no cadastro" ON public.acompanhantes;

CREATE POLICY "Acompanhante cria próprio perfil"
  ON public.acompanhantes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

COMMIT;
