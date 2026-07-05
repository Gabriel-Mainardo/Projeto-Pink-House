-- ================================================================
-- VER APENAS A ESTRUTURA - SEM DADOS
-- Este script mostra o que existe sem tentar acessar dados
-- ================================================================

-- 1. LISTAR TODAS AS TABELAS
-- ================================================================
SELECT
    tablename as "Nome da Tabela"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VER COLUNAS DA TABELA: acompanhantes
-- ================================================================
SELECT
    column_name as "Coluna",
    data_type as "Tipo",
    character_maximum_length as "Tamanho Max",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- 3. VER COLUNAS DA TABELA: created_stories
-- ================================================================
SELECT
    column_name as "Coluna",
    data_type as "Tipo",
    character_maximum_length as "Tamanho Max",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_name = 'created_stories'
ORDER BY ordinal_position;

-- 4. VER COLUNAS DA TABELA: cadastros_pendentes (se existir)
-- ================================================================
SELECT
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Permite NULL"
FROM information_schema.columns
WHERE table_name = 'cadastros_pendentes'
ORDER BY ordinal_position;

-- 5. VER TODAS AS COLUNAS DE TODAS AS TABELAS PUBLIC
-- ================================================================
SELECT
    table_name as "Tabela",
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "NULL?"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 6. VER BUCKETS DE STORAGE
-- ================================================================
SELECT
    name as "Nome do Bucket",
    public as "Publico?",
    created_at as "Criado em"
FROM storage.buckets;

-- 7. VER CONSTRAINTS (Chaves e Restrições)
-- ================================================================
SELECT
    tc.table_name as "Tabela",
    tc.constraint_name as "Nome da Constraint",
    tc.constraint_type as "Tipo",
    kcu.column_name as "Coluna"
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 8. VER RLS POLICIES
-- ================================================================
SELECT
    tablename as "Tabela",
    policyname as "Nome da Policy",
    permissive as "Permissivo?",
    cmd as "Operação"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 9. VER INDEXES
-- ================================================================
SELECT
    tablename as "Tabela",
    indexname as "Index"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- 10. RESUMO DE QUANTIDADES
-- ================================================================
SELECT
    'Tabelas Public' as "Item",
    COUNT(*)::text as "Quantidade"
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Buckets Storage',
    COUNT(*)::text
FROM storage.buckets

UNION ALL

SELECT
    'RLS Policies',
    COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public';
