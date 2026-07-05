-- Script de debug para verificar a estrutura da tabela created_stories
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'created_stories';

-- 2. Verificar todas as colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'created_stories'
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'created_stories';

-- 4. Teste de inserção simples (sem campos de link)
-- DESCOMENTE APENAS PARA TESTE
/*
INSERT INTO created_stories (
    companion_id,
    requester_name,
    requester_whatsapp,
    type,
    url,
    plan_type,
    status
) VALUES (
    'test-id',
    'Teste Nome',
    '11999999999',
    'photo',
    'https://example.com/test.jpg',
    'destaque',
    'pending'
) RETURNING *;
*/

-- 5. Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'created_stories';

-- 6. Verificar policies de RLS se existirem
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
WHERE tablename = 'created_stories'; 