-- ============================================
-- SQL PARA MOSTRAR ESTRUTURA COMPLETA DO BANCO
-- Execute no Supabase SQL Editor e me mande o resultado
-- ============================================

-- 1. LISTAR TODAS AS TABELAS
SELECT
    '=== TABELAS EXISTENTES ===' as info,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. ESTRUTURA DA TABELA ACOMPANHANTES
SELECT
    '=== ESTRUTURA: acompanhantes ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- 3. ESTRUTURA DA TABELA CADASTROS_PENDENTES
SELECT
    '=== ESTRUTURA: cadastros_pendentes ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'cadastros_pendentes'
ORDER BY ordinal_position;

-- 4. ESTRUTURA DA TABELA CREATED_STORIES
SELECT
    '=== ESTRUTURA: created_stories ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'created_stories'
ORDER BY ordinal_position;

-- 5. ESTRUTURA DA TABELA ESPECIALIDADES
SELECT
    '=== ESTRUTURA: especialidades ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'especialidades'
ORDER BY ordinal_position;

-- 6. ESTRUTURA DA TABELA ADMIN_USERS
SELECT
    '=== ESTRUTURA: admin_users ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- 7. ESTRUTURA DA TABELA ADVERTISEMENTS
SELECT
    '=== ESTRUTURA: advertisements ===' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'advertisements'
ORDER BY ordinal_position;

-- 8. CONTAR REGISTROS EM CADA TABELA
SELECT '=== CONTAGEM DE REGISTROS ===' as info;
SELECT 'acompanhantes' as tabela, COUNT(*) as total FROM acompanhantes;
SELECT 'cadastros_pendentes' as tabela, COUNT(*) as total FROM cadastros_pendentes;
SELECT 'created_stories' as tabela, COUNT(*) as total FROM created_stories;
SELECT 'especialidades' as tabela, COUNT(*) as total FROM especialidades;
SELECT 'admin_users' as tabela, COUNT(*) as total FROM admin_users;
SELECT 'advertisements' as tabela, COUNT(*) as total FROM advertisements;

-- 9. EXEMPLO DE DADOS DE ACOMPANHANTES (primeiros 3 registros) - CORRIGIDO PARA JSONB
SELECT
    '=== EXEMPLO: acompanhantes (primeiros 3) ===' as info,
    id,
    name,
    age,
    location,
    is_verified,
    is_active,
    is_available,
    created_at,
    CASE
        WHEN gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array' THEN jsonb_array_length(gallery)
        ELSE 0
    END as qtd_fotos,
    CASE
        WHEN videos IS NOT NULL AND jsonb_typeof(videos) = 'array' THEN jsonb_array_length(videos)
        ELSE 0
    END as qtd_videos,
    CASE
        WHEN cities_served IS NOT NULL AND jsonb_typeof(cities_served) = 'array' THEN jsonb_array_length(cities_served)
        ELSE 0
    END as qtd_cidades
FROM acompanhantes
ORDER BY created_at DESC
LIMIT 3;

-- 10. VERIFICAR SE EXISTEM TABELAS PARA PINKPOINTS, MENSAGENS, RATINGS
SELECT
    '=== VERIFICAR TABELAS ADICIONAIS ===' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
    table_name LIKE '%pink%' OR
    table_name LIKE '%point%' OR
    table_name LIKE '%message%' OR
    table_name LIKE '%mensag%' OR
    table_name LIKE '%rating%' OR
    table_name LIKE '%avaliac%' OR
    table_name LIKE '%ranking%' OR
    table_name LIKE '%statistic%'
);

-- 11. VERIFICAR POLÍTICAS RLS (Row Level Security)
SELECT
    '=== POLÍTICAS RLS ===' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 12. VERIFICAR BUCKETS DE STORAGE
SELECT
    '=== BUCKETS DE STORAGE ===' as info,
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY name;

-- 13. LISTAR TODAS AS COLUNAS DAS TABELAS PRINCIPAIS (RESUMO)
SELECT
    '=== RESUMO: TODAS AS COLUNAS ===' as info,
    table_name,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as colunas
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('acompanhantes', 'cadastros_pendentes', 'created_stories', 'especialidades', 'admin_users', 'advertisements')
GROUP BY table_name
ORDER BY table_name;
