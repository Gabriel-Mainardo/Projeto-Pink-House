-- ================================================
-- PERMITIR DELETE DE ACOMPANHANTES PELO ADMIN
-- ================================================

-- 1. Remover políticas antigas de DELETE
DROP POLICY IF EXISTS "Admin pode deletar acompanhantes" ON public.acompanhantes;
DROP POLICY IF EXISTS "Permitir delete para admin" ON public.acompanhantes;

-- 2. Criar política que permite DELETE público (para o admin via service key)
-- Como o admin usa uma service key ou anon key, vamos permitir DELETE para todos
CREATE POLICY "Permitir delete acompanhantes"
    ON public.acompanhantes
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- 3. Garantir permissões
GRANT DELETE ON public.acompanhantes TO anon, authenticated;

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Verificar políticas de DELETE
SELECT
    '=== POLÍTICAS DE DELETE ===' as info,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'acompanhantes'
    AND cmd = 'DELETE';

-- Verificar permissões
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'acompanhantes'
    AND privilege_type = 'DELETE';
