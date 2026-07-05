-- ================================================
-- LIMPAR TODOS OS USUÁRIOS DUPLICADOS (CLIENTE E ACOMPANHANTE)
-- ================================================

-- 1. Verificar quais usuários estão nas duas tabelas
SELECT
    '=== USUÁRIOS DUPLICADOS ===' as info;

SELECT
    c.user_id as auth_user_id,
    c.name as client_name,
    c.email as client_email,
    a.name as companion_name,
    a.id as companion_id
FROM clientes c
INNER JOIN acompanhantes a ON a.auth_user_id = c.user_id;

-- 2. Deletar da tabela acompanhantes os que também são clientes
-- ATENÇÃO: Isso vai deletar PERMANENTEMENTE esses registros de acompanhantes
DELETE FROM acompanhantes
WHERE auth_user_id IN (
    SELECT user_id FROM clientes
);

-- 3. Verificar se foi limpo
SELECT
    '=== APÓS LIMPEZA ===' as info;

SELECT
    COUNT(*) as usuarios_duplicados
FROM clientes c
INNER JOIN acompanhantes a ON a.auth_user_id = c.user_id;

-- Deve retornar 0
