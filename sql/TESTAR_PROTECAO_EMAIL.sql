-- ================================================
-- TESTAR PROTEÇÃO DE EMAIL DUPLICADO
-- ================================================

-- Teste 1: Inserir um cliente com email de teste
INSERT INTO clientes (email, name, user_id)
VALUES ('teste-protecao@email.com', 'Cliente Teste', gen_random_uuid());

SELECT '✅ Cliente criado com sucesso' as resultado;

-- Teste 2: Tentar criar acompanhante com MESMO email (deve FALHAR)
-- Esta query deve retornar erro: "Este email já está cadastrado como cliente"
INSERT INTO acompanhantes (email, name, auth_user_id)
VALUES ('teste-protecao@email.com', 'Acompanhante Teste', gen_random_uuid());

-- Se chegou aqui, a proteção NÃO está funcionando!
SELECT '❌ ERRO: Proteção não funcionou!' as resultado;

-- Limpar teste
DELETE FROM clientes WHERE email = 'teste-protecao@email.com';
DELETE FROM acompanhantes WHERE email = 'teste-protecao@email.com';
