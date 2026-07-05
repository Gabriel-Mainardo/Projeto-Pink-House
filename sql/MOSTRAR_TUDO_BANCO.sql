-- ================================================
-- MOSTRAR TODA A ESTRUTURA DO BANCO DE DADOS
-- ================================================
-- Execute este SQL e me envie TODO o resultado

-- ================================================
-- 1. LISTAR TODAS AS TABELAS
-- ================================================
SELECT
    '=== TABELAS ===' as info,
    schemaname,
    tablename,
    rowsecurity as "RLS_ativo"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================================
-- 2. LISTAR TODAS AS COLUNAS DE CADA TABELA
-- ================================================
SELECT
    '=== COLUNAS ===' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ================================================
-- 3. LISTAR TODAS AS POLÍTICAS RLS
-- ================================================
SELECT
    '=== POLÍTICAS RLS ===' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as "comando",
    qual as "usando_condicao",
    with_check as "com_verificacao"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================
-- 4. LISTAR TODAS AS FUNÇÕES/PROCEDURES
-- ================================================
SELECT
    '=== FUNÇÕES ===' as info,
    routine_schema,
    routine_name,
    routine_type,
    data_type as "retorno"
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ================================================
-- 5. LISTAR TODOS OS TRIGGERS
-- ================================================
SELECT
    '=== TRIGGERS ===' as info,
    trigger_schema,
    trigger_name,
    event_object_table as "tabela",
    action_timing as "quando",
    event_manipulation as "evento"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ================================================
-- 6. LISTAR TODOS OS ÍNDICES
-- ================================================
SELECT
    '=== ÍNDICES ===' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ================================================
-- 7. LISTAR FOREIGN KEYS (RELACIONAMENTOS)
-- ================================================
SELECT
    '=== FOREIGN KEYS ===' as info,
    tc.table_name as "tabela_origem",
    kcu.column_name as "coluna_origem",
    ccu.table_name as "tabela_destino",
    ccu.column_name as "coluna_destino",
    tc.constraint_name as "nome_constraint"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ================================================
-- 8. CONTAGEM DE REGISTROS POR TABELA
-- ================================================
SELECT
    '=== CONTAGEM DE REGISTROS ===' as info,
    schemaname,
    relname as "tabela",
    n_live_tup as "total_registros"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- ================================================
-- 9. VERIFICAR EXTENSÕES ATIVAS
-- ================================================
SELECT
    '=== EXTENSÕES ===' as info,
    extname as "extensao",
    extversion as "versao"
FROM pg_extension
ORDER BY extname;

-- ================================================
-- 10. VERIFICAR PERMISSÕES DAS TABELAS
-- ================================================
SELECT
    '=== PERMISSÕES ===' as info,
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- ================================================
-- 11. ESTRUTURA DETALHADA DA TABELA CLIENTES
-- ================================================
SELECT
    '=== DETALHES TABELA CLIENTES ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'clientes'
ORDER BY ordinal_position;

-- ================================================
-- 12. VERIFICAR SE TABELA CLIENTES EXISTE
-- ================================================
SELECT
    '=== EXISTE TABELA CLIENTES? ===' as info,
    EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'clientes'
    ) as "existe";

-- ================================================
-- 13. LISTAR STORAGE BUCKETS
-- ================================================
SELECT
    '=== STORAGE BUCKETS ===' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- ================================================
-- 14. POLÍTICAS DO STORAGE
-- ================================================
SELECT
    '=== POLÍTICAS STORAGE ===' as info,
    bucket_id,
    name as "policy_name",
    definition
FROM storage.policies
ORDER BY bucket_id, name;

-- ================================================
-- INSTRUÇÕES
-- ================================================
-- 1. Execute todo este SQL no Supabase SQL Editor
-- 2. Copie TODO o resultado (todas as tabelas que aparecerem)
-- 3. Me envie o resultado completo
-- 4. Assim poderei entender exatamente como está seu banco
-- ================================================
