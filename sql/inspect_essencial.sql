-- ================================================================
-- INSPEÇÃO ESSENCIAL DO BANCO - SEM ERROS
-- ================================================================

-- 1. VER TODAS AS TABELAS CRIADAS
-- ================================================================
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. ESTRUTURA DA TABELA ACOMPANHANTES
-- ================================================================
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- 3. PRIMEIROS 10 ACOMPANHANTES
-- ================================================================
SELECT *
FROM acompanhantes
ORDER BY created_at DESC
LIMIT 10;

-- 4. ESTRUTURA DA TABELA CREATED_STORIES
-- ================================================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'created_stories'
ORDER BY ordinal_position;

-- 5. ÚLTIMOS 20 STORIES CRIADOS
-- ================================================================
SELECT *
FROM created_stories
ORDER BY created_at DESC
LIMIT 20;

-- 6. VER USUÁRIOS AUTH
-- ================================================================
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data->>'user_type' as user_type,
    raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- 7. VER BUCKETS DE STORAGE
-- ================================================================
SELECT
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY name;

-- 8. CONTAGEM DE ARQUIVOS POR BUCKET
-- ================================================================
SELECT
    bucket_id,
    COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id IN ('images', 'media', 'videos')
GROUP BY bucket_id
ORDER BY bucket_id;

-- 9. ÚLTIMOS 20 ARQUIVOS ENVIADOS
-- ================================================================
SELECT
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects
WHERE bucket_id IN ('images', 'media', 'videos')
ORDER BY created_at DESC
LIMIT 20;

-- 10. VER RLS POLICIES ATIVAS
-- ================================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 11. ESTATÍSTICAS DAS TABELAS
-- ================================================================
SELECT
    schemaname,
    tablename,
    n_live_tup as total_rows,
    n_dead_tup as dead_rows,
    last_autovacuum,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 12. VER TODAS AS FOREIGN KEYS
-- ================================================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
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

-- 13. VER INDEXES
-- ================================================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 14. VERIFICAR SE EXISTE TABELA DE CADASTROS PENDENTES
-- ================================================================
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'cadastros_pendentes'
ORDER BY ordinal_position;

-- 15. RESUMO GERAL
-- ================================================================
SELECT
    'Total de tabelas' as metric,
    COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Total de usuários auth',
    COUNT(*)::text
FROM auth.users

UNION ALL

SELECT
    'Total de acompanhantes',
    COUNT(*)::text
FROM acompanhantes

UNION ALL

SELECT
    'Total de stories',
    COUNT(*)::text
FROM created_stories

UNION ALL

SELECT
    'Total de buckets',
    COUNT(*)::text
FROM storage.buckets;
