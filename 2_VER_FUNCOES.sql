-- VER TODAS AS FUNÇÕES CRIADAS
SELECT
    routine_name as nome_funcao,
    routine_type as tipo,
    data_type as retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
