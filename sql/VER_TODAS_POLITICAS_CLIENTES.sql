-- ================================================
-- VER TODAS AS POLÍTICAS DA TABELA CLIENTES
-- ================================================

SELECT
    policyname as "Nome da Política",
    cmd as "Comando",
    roles as "Roles",
    qual as "Condição USING",
    with_check as "Condição WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
ORDER BY cmd, policyname;

-- ================================================
-- Me envie TODO o resultado!
-- ================================================
