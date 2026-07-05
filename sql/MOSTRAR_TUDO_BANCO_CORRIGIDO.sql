-- ================================================
-- MOSTRAR TODA A ESTRUTURA DO BANCO DE DADOS
-- (Versão Corrigida - Sem storage.policies)
-- ================================================

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
    cmd as "comando"
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
    indexname
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
    ccu.column_name as "coluna_destino"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
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
-- 9. VERIFICAR TABELA CLIENTES
-- ================================================
SELECT
    '=== TABELA CLIENTES ===' as info,
    EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'clientes'
    ) as "existe";

-- ================================================
-- 10. ESTRUTURA DA TABELA CLIENTES (se existir)
-- ================================================
SELECT
    '=== ESTRUTURA CLIENTES ===' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'clientes'
ORDER BY ordinal_position;

-- ================================================
-- 11. POLÍTICAS DA TABELA CLIENTES (se existir)
-- ================================================
SELECT
    '=== POLÍTICAS CLIENTES ===' as info,
    policyname,
    cmd as "comando",
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
ORDER BY policyname;

-- ================================================
-- 12. LISTAR STORAGE BUCKETS
-- ================================================
SELECT
    '=== STORAGE BUCKETS ===' as info,
    id,
    name,
    public
FROM storage.buckets
ORDER BY name;

-- ================================================
-- INSTRUÇÕES
-- ================================================
-- Execute este SQL e me envie TODO o resultado
-- ================================================
