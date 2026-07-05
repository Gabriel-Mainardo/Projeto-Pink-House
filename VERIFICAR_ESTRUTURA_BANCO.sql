-- ============================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DO BANCO
-- Copie e cole no Supabase SQL Editor
-- ============================================

-- 1. LISTAR TODAS AS TABELAS
SELECT
    '=== TABELAS EXISTENTES ===' as info;

SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. ESTRUTURA DETALHADA DE CADA TABELA
SELECT
    '=== ESTRUTURA DAS TABELAS ===' as info;

SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. ÍNDICES
SELECT
    '=== ÍNDICES ===' as info;

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. FUNÇÕES CUSTOMIZADAS
SELECT
    '=== FUNÇÕES CRIADAS ===' as info;

SELECT
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 5. TRIGGERS
SELECT
    '=== TRIGGERS ===' as info;

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. POLÍTICAS RLS (Row Level Security)
SELECT
    '=== POLÍTICAS RLS ===' as info;

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. VERIFICAR RLS ATIVO NAS TABELAS
SELECT
    '=== STATUS RLS NAS TABELAS ===' as info;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. STORAGE BUCKETS
SELECT
    '=== BUCKETS DE STORAGE ===' as info;

SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 9. CONTAGEM DE REGISTROS POR TABELA
SELECT
    '=== CONTAGEM DE REGISTROS ===' as info;

SELECT
    schemaname,
    relname as table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 10. VERIFICAR TABELAS ESPECÍFICAS DO PROJETO
SELECT
    '=== VERIFICAÇÃO DE TABELAS ESPECÍFICAS ===' as info;

SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'acompanhantes')
        THEN '✓ acompanhantes'
        ELSE '✗ acompanhantes'
    END as tabela
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cadastros_pendentes')
        THEN '✓ cadastros_pendentes'
        ELSE '✗ cadastros_pendentes'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'created_stories')
        THEN '✓ created_stories'
        ELSE '✗ created_stories'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'active_stories')
        THEN '✓ active_stories'
        ELSE '✗ active_stories'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'story_requests')
        THEN '✓ story_requests'
        ELSE '✗ story_requests'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'especialidades')
        THEN '✓ especialidades'
        ELSE '✗ especialidades'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users')
        THEN '✓ admin_users'
        ELSE '✗ admin_users'
    END
UNION ALL
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertisements')
        THEN '✓ advertisements'
        ELSE '✗ advertisements'
    END;
