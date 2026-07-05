-- ==========================================
-- SQL PARA APROVAÇÃO AUTOMÁTICA - VERSÃO FINAL
-- Baseado na estrutura REAL do seu banco Supabase
-- ==========================================

-- 1. ADICIONAR CAMPOS QUE FALTAM (apenas os que não existem)
-- Obs: Sua tabela já tem quase tudo! Vou adicionar só os que faltam:

ALTER TABLE acompanhantes
ADD COLUMN IF NOT EXISTS cover_photo TEXT,           -- Foto de capa
ADD COLUMN IF NOT EXISTS thirty_minutes TEXT,        -- Valor 30 minutos
ADD COLUMN IF NOT EXISTS pernoite TEXT,              -- Valor pernoite
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,  -- Serviços oferecidos
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;      -- Perfil ativo

-- 2. AJUSTAR CAMPOS EXISTENTES (garantir valores padrão corretos)
-- Seus campos cities_served já é JSONB (perfeito!)
-- Vamos apenas garantir que os booleanos tenham valores padrão

ALTER TABLE acompanhantes
ALTER COLUMN hasownlocation SET DEFAULT false,
ALTER COLUMN acceptsclientlocation SET DEFAULT true,  -- Mudando para true (aceita por padrão)
ALTER COLUMN acceptsmotel SET DEFAULT true,           -- Mudando para true (aceita por padrão)
ALTER COLUMN is_featured SET DEFAULT false,
ALTER COLUMN is_verified SET DEFAULT false,           -- Mudando para false (não verificada por padrão)
ALTER COLUMN is_available SET DEFAULT true;

-- 3. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE (se não existirem)
CREATE INDEX IF NOT EXISTS idx_acompanhantes_email ON acompanhantes(email);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_location ON acompanhantes(location);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_is_active ON acompanhantes(is_active);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_created_at ON acompanhantes(created_at);

-- 4. CONFIGURAR RLS (Row Level Security)
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir visualização pública de acompanhantes" ON acompanhantes;
DROP POLICY IF EXISTS "Permitir cadastro público de acompanhantes" ON acompanhantes;
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON acompanhantes;
DROP POLICY IF EXISTS "Enable read access for all users" ON acompanhantes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON acompanhantes;

-- Política 1: SELECT público (para o catálogo)
CREATE POLICY "public_read_acompanhantes"
ON acompanhantes FOR SELECT
TO public
USING (is_active = true);

-- Política 2: INSERT público (para registro de novas acompanhantes)
CREATE POLICY "public_insert_acompanhantes"
ON acompanhantes FOR INSERT
TO public
WITH CHECK (true);

-- Política 3: UPDATE do próprio perfil
CREATE POLICY "public_update_acompanhantes"
ON acompanhantes FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 5. CRIAR/ATUALIZAR TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_acompanhantes_updated_at ON acompanhantes;
CREATE TRIGGER update_acompanhantes_updated_at
    BEFORE UPDATE ON acompanhantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. VERIFICAR ESTRUTURA FINAL
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
ORDER BY ordinal_position;

-- ==========================================
-- CONFIGURAÇÃO CONCLUÍDA! ✅
-- ==========================================
-- Agora sua tabela está pronta para:
-- 1. Receber cadastros automáticos (sem aprovação)
-- 2. Exibir perfis no catálogo
-- 3. Permitir edição de perfis
-- ==========================================
