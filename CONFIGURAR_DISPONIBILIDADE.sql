-- ============================================
-- CONFIGURAÇÃO DE DISPONIBILIDADE
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR SE O CAMPO is_available EXISTE
-- (Já existe baseado no schema que você me mandou)

-- 2. ATUALIZAR REGISTROS EXISTENTES
-- Garantir que todos os registros tenham is_available = true por padrão
UPDATE acompanhantes
SET is_available = true
WHERE is_available IS NULL;

-- 3. VERIFICAR RESULTADO
-- Rode isso para ver quantas acompanhantes estão disponíveis/indisponíveis
SELECT
  is_available,
  COUNT(*) as total
FROM acompanhantes
GROUP BY is_available;

-- 4. TESTAR UPDATE MANUAL
-- Teste mudar a disponibilidade de uma acompanhante específica
-- Substitua 'ID_DA_ACOMPANHANTE' pelo ID real
-- UPDATE acompanhantes
-- SET is_available = false
-- WHERE id = 'ID_DA_ACOMPANHANTE';

-- ============================================
-- INFORMAÇÕES IMPORTANTES:
-- ============================================
-- ✅ O campo is_available já existe na tabela
-- ✅ Tipo: boolean
-- ✅ Aceita NULL: sim
-- ✅ Valor padrão: true
--
-- ⚠️ ATENÇÃO: As policies RLS estão MUITO PERMISSIVAS!
-- Atualmente qualquer pessoa pode fazer UPDATE em acompanhantes.
-- Isso é necessário para o toggle funcionar, mas é INSEGURO.
--
-- Recomendo depois configurar policies corretas onde:
-- - Público: só SELECT (leitura)
-- - Acompanhante: UPDATE apenas do próprio registro
-- - Admin: UPDATE de qualquer registro
-- ============================================
