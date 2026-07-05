-- ================================================
-- VERIFICAR E LIMPAR DADOS INCORRETOS DO CLIENTE
-- ================================================

-- 1. Verificar se o cliente está cadastrado como acompanhante por engano
SELECT
    '=== VERIFICANDO DADOS DO CLIENTE ===' as info;

-- Buscar o auth_user_id do cliente
SELECT
    'CLIENTE NA TABELA CLIENTES:' as tipo,
    id,
    user_id as auth_user_id,
    name,
    email
FROM clientes
WHERE user_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15';

-- Buscar se esse mesmo auth_user_id está na tabela de acompanhantes (ERRO!)
SELECT
    'CLIENTE NA TABELA ACOMPANHANTES (ERRO!):' as tipo,
    id,
    auth_user_id,
    name,
    display_name
FROM acompanhantes
WHERE auth_user_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15';

-- ================================================
-- LIMPAR REGISTRO INCORRETO
-- ================================================

-- Se o registro acima existir na tabela acompanhantes, deletar:
DELETE FROM acompanhantes
WHERE auth_user_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15'
AND auth_user_id IN (
    SELECT user_id FROM clientes WHERE user_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15'
);

-- Verificar se foi deletado
SELECT
    '=== APÓS LIMPEZA ===' as info;

SELECT
    'ACOMPANHANTES COM ESSE AUTH_USER_ID:' as tipo,
    COUNT(*) as total
FROM acompanhantes
WHERE auth_user_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15';

-- ================================================
-- VERIFICAR TODAS AS CONVERSAS DO CLIENTE
-- ================================================

SELECT
    '=== CONVERSAS DO CLIENTE ===' as info;

SELECT
    c.id as conversation_id,
    c.client_id,
    c.companion_id,
    cl.name as client_name,
    a.display_name as companion_name,
    c.created_at
FROM conversations c
LEFT JOIN clientes cl ON cl.user_id = c.client_id
LEFT JOIN acompanhantes a ON a.id = c.companion_id
WHERE c.client_id = '764f91d1-8b18-4cc1-824e-a63f1f977e15'
ORDER BY c.created_at DESC;
