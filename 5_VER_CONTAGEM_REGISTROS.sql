-- VER QUANTOS REGISTROS TEM EM CADA TABELA
SELECT
    relname as tabela,
    n_live_tup as total_registros
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
