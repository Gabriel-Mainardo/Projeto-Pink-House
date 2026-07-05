-- ================================================
-- VERIFICAR POLÍTICAS DA TABELA ACOMPANHANTES
-- ================================================

-- Ver todas as políticas da tabela acompanhantes
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'acompanhantes'
ORDER BY cmd, policyname;

-- Verificar se RLS está ativo
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'acompanhantes';
