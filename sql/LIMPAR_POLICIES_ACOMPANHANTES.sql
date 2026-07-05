-- ================================================
-- LIMPAR TODAS AS POLÍTICAS E RECRIAR CORRETO
-- ================================================

-- ========================================
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ========================================

DROP POLICY IF EXISTS "Acesso total acompanhantes" ON public.acompanhantes;
DROP POLICY IF EXISTS "Usuários autenticados criam perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "public_insert_acompanhantes" ON public.acompanhantes;
DROP POLICY IF EXISTS "Público vê acompanhantes ativas" ON public.acompanhantes;
DROP POLICY IF EXISTS "public_read_acompanhantes" ON public.acompanhantes;
DROP POLICY IF EXISTS "Acompanhante atualiza seu perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "public_update_acompanhantes" ON public.acompanhantes;

-- ========================================
-- 2. CRIAR POLÍTICAS LIMPAS E CORRETAS
-- ========================================

-- INSERT: Apenas usuários AUTENTICADOS podem criar perfil
CREATE POLICY "Autenticados criam perfil"
    ON public.acompanhantes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- SELECT: TODO MUNDO (anon e authenticated) pode VER acompanhantes ativas
CREATE POLICY "Todos veem acompanhantes ativas"
    ON public.acompanhantes
    FOR SELECT
    TO public
    USING (is_active = true);

-- UPDATE: Apenas a PRÓPRIA acompanhante atualiza seu perfil
CREATE POLICY "Própria acompanhante atualiza perfil"
    ON public.acompanhantes
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid());

-- DELETE: Apenas a PRÓPRIA acompanhante pode deletar (opcional)
CREATE POLICY "Própria acompanhante deleta perfil"
    ON public.acompanhantes
    FOR DELETE
    TO authenticated
    USING (auth_user_id = auth.uid());

-- ========================================
-- 3. GARANTIR RLS ATIVO
-- ========================================

ALTER TABLE public.acompanhantes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. PERMISSÕES BÁSICAS
-- ========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.acompanhantes TO authenticated;
GRANT SELECT ON public.acompanhantes TO anon;

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== POLÍTICAS FINAIS ===' as info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'acompanhantes'
ORDER BY cmd, policyname;

-- ================================================
-- ✅ EXECUTE ESTE SQL E TESTE NOVAMENTE!
-- ================================================
