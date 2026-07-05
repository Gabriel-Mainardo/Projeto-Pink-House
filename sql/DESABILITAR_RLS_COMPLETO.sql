-- ================================================
-- DESABILITAR RLS COMPLETAMENTE (TEMPORÁRIO - APENAS TESTE)
-- ================================================
-- Vamos desabilitar RLS completamente para testar

-- 1. DESABILITAR RLS na tabela clientes
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS está ativo?"
FROM pg_tables
WHERE tablename = 'clientes';

-- ================================================
-- ATENÇÃO: Isso é só para TESTAR!
-- Depois que funcionar, vamos REABILITAR o RLS
-- ================================================
