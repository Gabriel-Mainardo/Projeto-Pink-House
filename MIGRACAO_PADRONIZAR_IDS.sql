-- =====================================================
-- MIGRAÇÃO: Padronizar tabela clientes
-- Problema: Alguns registros foram criados com id auto-gerado
-- e o auth.users.id foi salvo no campo user_id.
-- Solução: Todos os registros devem ter id = auth.users.id
-- =====================================================

-- =====================================================
-- PASSO 1: DIAGNÓSTICO (execute primeiro para entender o estado atual)
-- =====================================================

-- 1a. Ver TODOS os clientes e seus ids
SELECT id, user_id, email, name, created_at,
       CASE 
         WHEN user_id IS NOT NULL AND id != user_id THEN '⚠️ ID INCORRETO (id ≠ user_id)'
         WHEN user_id IS NULL THEN '✅ OK (sem user_id, id é o auth id)'
         WHEN id = user_id THEN '✅ OK (id = user_id)'
       END AS status
FROM clientes
ORDER BY created_at;

-- 1b. Verificar se há DUPLICATAS (mesmo email em dois registros)
SELECT email, count(*) AS total
FROM clientes
GROUP BY email
HAVING count(*) > 1;

-- =====================================================
-- PASSO 2: CORREÇÃO SEGURA
-- Abordagem: Atualizar o id diretamente usando UPDATE
-- (mais seguro que DELETE+INSERT)
-- =====================================================

-- 2a. Para registros SEM duplicata:
-- Atualizar o id para ser o user_id (auth.users.id)
-- IMPORTANTE: Só atualiza se NÃO existe outro registro com esse id
UPDATE clientes
SET id = user_id
WHERE user_id IS NOT NULL
  AND id != user_id
  AND NOT EXISTS (
    SELECT 1 FROM clientes c2 WHERE c2.id = clientes.user_id
  );

-- 2b. Para registros COM duplicata (mesmo email, dois registros):
-- Manter o registro que já tem id = auth.users.id
-- e DELETAR o registro com id auto-gerado
DELETE FROM clientes
WHERE user_id IS NOT NULL
  AND id != user_id
  AND EXISTS (
    SELECT 1 FROM clientes c2 WHERE c2.id = clientes.user_id
  );

-- =====================================================
-- PASSO 3: VERIFICAÇÃO FINAL
-- =====================================================

-- 3a. Verificar se ainda há inconsistências
SELECT id, user_id, email, name,
       CASE 
         WHEN user_id IS NOT NULL AND id != user_id THEN '❌ AINDA INCONSISTENTE'
         ELSE '✅ OK'
       END AS status
FROM clientes
ORDER BY created_at;

-- 3b. Contagem geral
SELECT 'clientes' AS tabela, count(*) AS total,
       count(CASE WHEN user_id IS NULL OR id = user_id THEN 1 END) AS corretos,
       count(CASE WHEN user_id IS NOT NULL AND id != user_id THEN 1 END) AS inconsistentes
FROM clientes;

-- =====================================================
-- PASSO 4: VERIFICAR ACOMPANHANTES
-- =====================================================

-- 4a. Acompanhantes sem auth_user_id (podem ter problemas no chat)
SELECT id, name, email, auth_user_id,
       CASE 
         WHEN auth_user_id IS NULL THEN '⚠️ SEM AUTH_USER_ID'
         ELSE '✅ OK'
       END AS status
FROM acompanhantes;

-- 4b. Se precisar atualizar auth_user_id de acompanhantes,
-- use o email para encontrar o auth user id:
-- UPDATE acompanhantes a
-- SET auth_user_id = u.id
-- FROM auth.users u
-- WHERE a.email = u.email
-- AND a.auth_user_id IS NULL;
