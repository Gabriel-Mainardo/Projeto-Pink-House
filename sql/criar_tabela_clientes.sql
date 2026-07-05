-- ================================================================
-- CRIAR TABELA CLIENTES
-- ================================================================

CREATE TABLE IF NOT EXISTS public.clientes (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Dados básicos
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,

    -- Preferências (opcional - para matching futuro)
    preferred_age_min INTEGER,
    preferred_age_max INTEGER,
    preferred_location TEXT,
    preferred_gender TEXT, -- 'mulheres', 'homens', 'trans'

    -- Status e configurações
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,

    -- Privacidade
    show_profile BOOLEAN DEFAULT false, -- Se quer perfil público ou não

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_id UNIQUE(user_id),
    CONSTRAINT unique_email UNIQUE(email)
);

-- ================================================================
-- INDEXES PARA PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_is_active ON public.clientes(is_active);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON public.clientes(created_at DESC);

-- ================================================================
-- RLS POLICIES (Row Level Security)
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Policy: Clientes podem ver apenas seu próprio perfil
CREATE POLICY "Clientes podem ver próprio perfil"
    ON public.clientes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Clientes podem atualizar apenas seu próprio perfil
CREATE POLICY "Clientes podem atualizar próprio perfil"
    ON public.clientes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Qualquer usuário autenticado pode criar um perfil de cliente
CREATE POLICY "Usuários autenticados podem criar perfil cliente"
    ON public.clientes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Clientes podem deletar seu próprio perfil
CREATE POLICY "Clientes podem deletar próprio perfil"
    ON public.clientes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================================
-- TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- COMENTÁRIOS (DOCUMENTAÇÃO)
-- ================================================================

COMMENT ON TABLE public.clientes IS 'Tabela de perfis de clientes do sistema';
COMMENT ON COLUMN public.clientes.user_id IS 'Referência ao usuário na tabela auth.users';
COMMENT ON COLUMN public.clientes.name IS 'Nome do cliente';
COMMENT ON COLUMN public.clientes.preferred_gender IS 'Preferência de gênero: mulheres, homens ou trans';
COMMENT ON COLUMN public.clientes.show_profile IS 'Se true, perfil pode ser visível para acompanhantes';

-- ================================================================
-- VERIFICAÇÃO
-- ================================================================

-- Ver estrutura da tabela criada
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
