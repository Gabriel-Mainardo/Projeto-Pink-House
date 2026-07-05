-- Verificar políticas de CONVERSATIONS
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'conversations'
ORDER BY cmd, policyname;
