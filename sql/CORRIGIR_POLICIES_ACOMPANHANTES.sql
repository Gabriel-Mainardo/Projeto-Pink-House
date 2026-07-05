-- ================================================
-- CORRIGIR POLÍTICAS DA TABELA ACOMPANHANTES
-- ================================================
-- Permitir que usuários autenticados criem seus perfis

-- ========================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ========================================

DROP POLICY IF EXISTS "Permitir criação de perfil" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir leitura de perfil próprio" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir atualização de perfil próprio" ON public.acompanhantes;
DROP POLICY IF EXISTS "Público pode ver acompanhantes ativas" ON public.acompanhantes;
DROP POLICY IF EXISTS "Acompanhantes podem criar perfil" ON public.acompanhantes;

-- ========================================
-- 2. CRIAR POLÍTICAS CORRETAS
-- ========================================

-- INSERT: Usuários autenticados podem criar perfil
CREATE POLICY "Usuários autenticados criam perfil"
    ON public.acompanhantes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- SELECT: Todos (público) podem ver acompanhantes ativas
CREATE POLICY "Público vê acompanhantes ativas"
    ON public.acompanhantes
    FOR SELECT
    TO public
    USING (is_active = true);

-- UPDATE: Acompanhante pode atualizar seu próprio perfil
CREATE POLICY "Acompanhante atualiza seu perfil"
    ON public.acompanhantes
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid());

-- ========================================
-- 3. GARANTIR RLS ATIVO
-- ========================================

ALTER TABLE public.acompanhantes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAÇÃO
-- ========================================

SELECT '=== POLÍTICAS ACOMPANHANTES ATUALIZADAS ===' as info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'acompanhantes'
ORDER BY cmd, policyname;

-- ================================================
-- ✅ PRONTO! Execute este SQL no Supabase
-- ================================================
