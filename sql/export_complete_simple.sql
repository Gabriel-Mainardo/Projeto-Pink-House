-- SQL SIMPLIFICADA - Retorna tudo em uma query só
-- Execute no Supabase SQL Editor e me mande o resultado completo

-- Estrutura da tabela acompanhantes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'acompanhantes'
ORDER BY ordinal_position;
