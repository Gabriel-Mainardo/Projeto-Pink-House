-- ================================================
-- VERIFICAR TRIGGERS QUE PODEM ESTAR CRIANDO ACOMPANHANTES AUTOMATICAMENTE
-- ================================================

-- Verificar todos os triggers na tabela acompanhantes
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'acompanhantes';

-- Verificar functions que podem estar sendo chamadas por triggers
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%acompanhante%'
    OR routine_name LIKE '%user%'
    OR routine_name LIKE '%auth%';

-- Verificar se há function handle_new_user que pode estar criando acompanhantes
SELECT
    proname as function_name,
    prosrc as function_code
FROM pg_proc
WHERE proname LIKE '%user%'
    OR proname LIKE '%acompanhante%';
