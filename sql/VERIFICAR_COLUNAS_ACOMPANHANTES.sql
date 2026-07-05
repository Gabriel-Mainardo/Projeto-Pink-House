-- Verificar colunas da tabela acompanhantes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'acompanhantes'
ORDER BY ordinal_position;
