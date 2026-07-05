-- Script para limpar todos os stories existentes
-- Execute este script no Supabase SQL Editor para remover todos os stories criados

-- 1. Deletar todos os stories criados
DELETE FROM created_stories;

-- 2. Deletar todas as solicitações de stories
DELETE FROM story_requests;

-- 3. Deletar todos os stories ativos
DELETE FROM active_stories;

-- 4. Verificar se as tabelas estão vazias
SELECT 'created_stories' as tabela, COUNT(*) as total_registros FROM created_stories
UNION ALL
SELECT 'story_requests' as tabela, COUNT(*) as total_registros FROM story_requests  
UNION ALL
SELECT 'active_stories' as tabela, COUNT(*) as total_registros FROM active_stories;

-- 5. Resetar sequências se necessário (opcional)
-- Isso garantirá que os próximos IDs sejam limpos

SELECT 'Todos os stories foram removidos com sucesso!' as status; 