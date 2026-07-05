-- ================================================
-- VERIFICAR POLÍTICAS DE CHAT (conversations e messages)
-- ================================================

-- 1. Políticas da tabela CONVERSATIONS
SELECT
    '=== POLÍTICAS CONVERSATIONS ===' as info,
    policyname,
    cmd as "comando",
    roles,
    qual as "condicao_using"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'conversations'
ORDER BY cmd, policyname;

-- 2. Políticas da tabela MESSAGES
SELECT
    '=== POLÍTICAS MESSAGES ===' as info,
    policyname,
    cmd as "comando",
    roles,
    qual as "condicao_using"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'messages'
ORDER BY cmd, policyname;

-- 3. Estrutura da tabela CONVERSATIONS
SELECT
    '=== ESTRUTURA CONVERSATIONS ===' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'conversations'
ORDER BY ordinal_position;

-- 4. Estrutura da tabela MESSAGES
SELECT
    '=== ESTRUTURA MESSAGES ===' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'messages'
ORDER BY ordinal_position;

-- ================================================
-- Execute e me envie o resultado!
-- ================================================
