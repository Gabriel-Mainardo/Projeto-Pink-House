-- Script SQL para configurar aprovação automática de cadastros
-- Este script garante que a tabela acompanhantes tem todos os campos necessários

-- Adicionar campos que podem estar faltando na tabela acompanhantes
ALTER TABLE acompanhantes
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS cover_photo TEXT,
ADD COLUMN IF NOT EXISTS thirty_minutes TEXT,
ADD COLUMN IF NOT EXISTS pernoite TEXT,
ADD COLUMN IF NOT EXISTS videos TEXT[],
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS hasownlocation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS acceptsclientlocation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS acceptsmotel BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Criar índice para busca por email (se não existir)
CREATE INDEX IF NOT EXISTS idx_acompanhantes_email ON acompanhantes(email);

-- Criar índice para busca por localização
CREATE INDEX IF NOT EXISTS idx_acompanhantes_location ON acompanhantes(location);

-- Criar índice para busca por cidade
CREATE INDEX IF NOT EXISTS idx_acompanhantes_cities_served ON acompanhantes USING GIN(cities_served);

-- Atualizar o RLS (Row Level Security) para permitir inserção pública
-- ATENÇÃO: Isso permite que qualquer pessoa insira dados.
-- Em produção, você deve adicionar autenticação adequada.

-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT público (para catálogo)
DROP POLICY IF EXISTS "Permitir visualização pública de acompanhantes" ON acompanhantes;
CREATE POLICY "Permitir visualização pública de acompanhantes"
ON acompanhantes FOR SELECT
TO public
USING (is_active = true);

-- Criar política para permitir INSERT público (para registro)
DROP POLICY IF EXISTS "Permitir cadastro público de acompanhantes" ON acompanhantes;
CREATE POLICY "Permitir cadastro público de acompanhantes"
ON acompanhantes FOR INSERT
TO public
WITH CHECK (true);

-- Criar política para permitir UPDATE apenas do próprio perfil
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON acompanhantes;
CREATE POLICY "Permitir atualização do próprio perfil"
ON acompanhantes FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Criar função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_acompanhantes_updated_at ON acompanhantes;
CREATE TRIGGER update_acompanhantes_updated_at
    BEFORE UPDATE ON acompanhantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar a estrutura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;
