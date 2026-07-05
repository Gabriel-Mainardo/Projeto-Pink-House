-- =====================================================================
-- CORRIGIR POLICY DE INSERT NA TABELA ACOMPANHANTES E COMPANION_VERIFICATIONS
-- =====================================================================
-- Problema: durante o cadastro de acompanhante, o fluxo pode não ter
-- sessão ativa (ex: "Confirm email" ativo no Supabase Auth), então
-- auth.uid() é null e a policy "TO authenticated" bloqueia o INSERT.
-- Solução: permitir INSERT também para a role "anon" durante o cadastro.
-- A segurança é mantida pois UPDATE ainda exige auth.uid() = auth_user_id.
-- =====================================================================

-- ---- TABELA: acompanhantes ----

-- Remover policies de INSERT existentes
DROP POLICY IF EXISTS "Usuários autenticados criam perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir criação de perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "Acompanhantes podem criar perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir criação de perfil no cadastro" ON public.acompanhantes;

-- Nova policy: permite INSERT para anon e authenticated (cadastro público)
CREATE POLICY "Permitir criação de perfil no cadastro"
    ON public.acompanhantes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (auth_user_id IS NOT NULL);

-- ---- TABELA: companion_verifications ----

-- Remover policies de INSERT existentes
DROP POLICY IF EXISTS "Acompanhantes podem criar verificacao" ON public.companion_verifications;
DROP POLICY IF EXISTS "Criar verificação no cadastro" ON public.companion_verifications;
DROP POLICY IF EXISTS "Permitir criação de verificação" ON public.companion_verifications;

-- Nova policy: permite INSERT para anon e authenticated
CREATE POLICY "Criar verificação no cadastro"
    ON public.companion_verifications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (companion_id IS NOT NULL);

-- ---- VERIFICAÇÃO ----

SELECT '=== POLÍTICAS acompanhantes ===' AS info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'acompanhantes'
ORDER BY cmd, policyname;

SELECT '=== POLÍTICAS companion_verifications ===' AS info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'companion_verifications'
ORDER BY cmd, policyname;
