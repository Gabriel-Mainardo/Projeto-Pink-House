-- ================================================================
-- SCRIPT COMPLETO PARA INSPECIONAR TODA A ESTRUTURA DO SUPABASE
-- ================================================================

-- 1. LISTAR TODAS AS TABELAS
-- ================================================================
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- 2. VER ESTRUTURA DETALHADA DE CADA TABELA
-- ================================================================
SELECT
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND t.table_schema = c.table_schema
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY t.table_schema, t.table_name, c.ordinal_position;

-- 3. VER CONSTRAINTS (PRIMARY KEYS, FOREIGN KEYS, UNIQUE, ETC)
-- ================================================================
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- 4. VER INDEXES
-- ================================================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename, indexname;

-- 5. VER RLS POLICIES (Row Level Security)
-- ================================================================
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
ORDER BY schemaname, tablename, policyname;

-- 6. VER FUNCTIONS/STORED PROCEDURES
-- ================================================================
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname;

-- 7. VER TRIGGERS
-- ================================================================
SELECT
    event_object_schema AS schema_name,
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS trigger_event,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_schema, event_object_table, trigger_name;

-- 8. VER ENUMS (TIPOS CUSTOMIZADOS)
-- ================================================================
SELECT
    n.nspname AS schema,
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, t.typname, e.enumsortorder;

-- 9. VER STORAGE BUCKETS (PARA ARQUIVOS)
-- ================================================================
SELECT
    id,
    name,
    owner,
    public,
    created_at,
    updated_at
FROM storage.buckets;

-- 10. VER OBJETOS NOS BUCKETS (images, media, videos)
-- ================================================================
SELECT
    name AS file_name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id IN ('images', 'media', 'videos')
ORDER BY bucket_id, created_at DESC
LIMIT 50;

-- 11. CONTAGEM DE REGISTROS POR TABELA
-- ================================================================
SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n_live_tup DESC;

-- 12. VER USUÁRIOS AUTH (TABELA DE AUTENTICAÇÃO)
-- ================================================================
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    role
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- 13. RESUMO DA TABELA ACOMPANHANTES (se existir)
-- ================================================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- 14. PRIMEIROS 5 REGISTROS DA TABELA ACOMPANHANTES
-- ================================================================
SELECT *
FROM acompanhantes
LIMIT 5;

-- 15. VER TABELA CREATED_STORIES (se existir)
-- ================================================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'created_stories'
ORDER BY ordinal_position;

-- 16. VER TODAS AS EXTENSIONS INSTALADAS
-- ================================================================
SELECT
    extname AS extension_name,
    extversion AS version
FROM pg_extension
ORDER BY extname;
