-- ================================================
-- DELETAR TODOS OS CLIENTES E ACOMPANHANTES - LIMPEZA TOTAL
-- ================================================

-- ATENÇÃO: Este script vai DELETAR PERMANENTEMENTE todos os dados!
-- Execute com cuidado!

-- 1. Verificar quantos registros serão deletados
SELECT
    '=== ANTES DA LIMPEZA ===' as info;

SELECT
    'CLIENTES' as tabela,
    COUNT(*) as total
FROM clientes
UNION ALL
SELECT
    'ACOMPANHANTES' as tabela,
    COUNT(*) as total
FROM acompanhantes
UNION ALL
SELECT
    'CONVERSAS' as tabela,
    COUNT(*) as total
FROM conversations
UNION ALL
SELECT
    'MENSAGENS' as tabela,
    COUNT(*) as total
FROM messages;

-- 2. Deletar MENSAGENS primeiro (dependem de conversations)
DELETE FROM messages;

-- 3. Deletar CONVERSAS (dependem de clientes e acompanhantes)
DELETE FROM conversations;

-- 4. Deletar CLIENTES
DELETE FROM clientes;

-- 5. Deletar ACOMPANHANTES
DELETE FROM acompanhantes;

-- 6. Verificar se tudo foi deletado
SELECT
    '=== APÓS LIMPEZA ===' as info;

SELECT
    'CLIENTES' as tabela,
    COUNT(*) as total
FROM clientes
UNION ALL
SELECT
    'ACOMPANHANTES' as tabela,
    COUNT(*) as total
FROM acompanhantes
UNION ALL
SELECT
    'CONVERSAS' as tabela,
    COUNT(*) as total
FROM conversations
UNION ALL
SELECT
    'MENSAGENS' as tabela,
    COUNT(*) as total
FROM messages;

-- Deve retornar 0 para todas as tabelas

-- 7. OPCIONAL: Se quiser também deletar os usuários do Supabase Auth
-- DESCOMENTAR APENAS SE QUISER DELETAR OS USUÁRIOS DE AUTH TAMBÉM
-- ATENÇÃO: Isso vai exigir que você delete manualmente no painel do Supabase
-- Não é possível deletar usuários de auth.users via SQL por segurança

SELECT
    '=== USUÁRIOS NO AUTH (NÃO DELETADOS AUTOMATICAMENTE) ===' as info;

SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Para deletar usuários do Auth, vá em:
-- Supabase Dashboard > Authentication > Users > e delete manualmente
