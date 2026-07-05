-- ================================================
-- CONFIGURAÇÃO COMPLETA DA TABELA CLIENTES
-- ================================================

-- 1. Criar tabela clientes (se não existir)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    cpf TEXT,
    phone TEXT,
    birth_date DATE,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    blocked_companions UUID[] DEFAULT '{}',
    favorite_companions UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_active ON public.clientes(is_active);

-- 3. REMOVER políticas antigas (se existirem)
DROP POLICY IF EXISTS "Clientes podem inserir seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem ver seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem atualizar seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir leitura de clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir atualização de clientes" ON public.clientes;

-- 4. HABILITAR RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS CORRETAS

-- Permitir que usuários autenticados criem seu próprio perfil de cliente
CREATE POLICY "Permitir criação de perfil de cliente"
    ON public.clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir que clientes vejam apenas seus próprios dados
CREATE POLICY "Clientes podem ver próprios dados"
    ON public.clientes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Permitir que clientes atualizem apenas seus próprios dados
CREATE POLICY "Clientes podem atualizar próprios dados"
    ON public.clientes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir que admins vejam todos os clientes
CREATE POLICY "Admins podem ver todos os clientes"
    ON public.clientes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Permitir que admins atualizem qualquer cliente
CREATE POLICY "Admins podem atualizar qualquer cliente"
    ON public.clientes
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_clientes_updated_at ON public.clientes;
CREATE TRIGGER trigger_update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_clientes_updated_at();

-- 8. Garantir que a tabela seja acessível
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.clientes TO authenticated;
GRANT SELECT ON public.clientes TO anon;

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Verificar se a tabela foi criada
SELECT
    'Tabela clientes' as tipo,
    COUNT(*) as registros
FROM public.clientes;

-- Verificar políticas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'clientes'
ORDER BY policyname;

-- Verificar se RLS está ativo
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'clientes';

-- ================================================
-- DONE! ✅
-- ================================================
-- Execute este SQL no Supabase SQL Editor
-- Depois tente criar uma conta novamente
