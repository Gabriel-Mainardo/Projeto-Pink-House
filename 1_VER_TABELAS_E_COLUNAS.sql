-- VER TODAS AS TABELAS E SUAS COLUNAS
SELECT
    t.table_name as tabela,
    c.column_name as coluna,
    c.data_type as tipo,
    c.character_maximum_length as tamanho_max,
    c.is_nullable as aceita_null,
    c.column_default as valor_padrao
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
