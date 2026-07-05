-- SQL para exportar toda a estrutura do banco de dados Supabase
-- Execute este script no SQL Editor do Supabase e copie o resultado

-- 1. LISTAR TODAS AS TABELAS
SELECT
  'TABELAS' as tipo,
  table_name as nome,
  null as detalhes
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. ESTRUTURA COMPLETA DA TABELA ACOMPANHANTES
SELECT
  'COLUNAS_ACOMPANHANTES' as tipo,
  column_name as nome,
  data_type as tipo_dado,
  is_nullable as aceita_null,
  column_default as valor_padrao,
  character_maximum_length as tamanho_max
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- 3. ESTRUTURA COMPLETA DA TABELA CADASTROS_PENDENTES (se existir)
SELECT
  'COLUNAS_CADASTROS_PENDENTES' as tipo,
  column_name as nome,
  data_type as tipo_dado,
  is_nullable as aceita_null,
  column_default as valor_padrao,
  character_maximum_length as tamanho_max
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cadastros_pendentes'
ORDER BY ordinal_position;

-- 4. ESTRUTURA COMPLETA DA TABELA CREATED_STORIES (se existir)
SELECT
  'COLUNAS_CREATED_STORIES' as tipo,
  column_name as nome,
  data_type as tipo_dado,
  is_nullable as aceita_null,
  column_default as valor_padrao,
  character_maximum_length as tamanho_max
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'created_stories'
ORDER BY ordinal_position;

-- 5. ÍNDICES EXISTENTES
SELECT
  'INDICES' as tipo,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. POLÍTICAS RLS (Row Level Security)
SELECT
  'POLITICAS_RLS' as tipo,
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

-- 7. TRIGGERS EXISTENTES
SELECT
  'TRIGGERS' as tipo,
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. CONSTRAINTS (Chaves primárias, foreign keys, etc)
SELECT
  'CONSTRAINTS' as tipo,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 9. FUNÇÕES CUSTOMIZADAS
SELECT
  'FUNCOES' as tipo,
  n.nspname as schema,
  p.proname as nome_funcao,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_functiondef(p.oid) as definicao_completa
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- 10. STORAGE BUCKETS (se houver)
SELECT
  'STORAGE_BUCKETS' as tipo,
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;
