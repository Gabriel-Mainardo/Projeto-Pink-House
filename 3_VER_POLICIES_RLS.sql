-- VER POLÍTICAS RLS (SEGURANÇA)
SELECT
    tablename as tabela,
    policyname as nome_policy,
    cmd as comando,
    roles as roles,
    qual as condicao
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
