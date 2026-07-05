-- =========================================
-- SISTEMA DE STORIES - ESTRUTURA CORRIGIDA
-- =========================================
-- Execute este arquivo no Supabase para criar as tabelas do sistema de stories

-- Tabela para solicitações de upgrade de plano (stories pagos)
CREATE TABLE IF NOT EXISTS story_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    plan_name VARCHAR(100) NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    plan_duration VARCHAR(50) NOT NULL,
    plan_features TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para stories ativos (após aprovação de pagamento)
CREATE TABLE IF NOT EXISTS active_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES story_requests(id) ON DELETE CASCADE,
    companion_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para stories criados pelas acompanhantes (conteúdo)
CREATE TABLE IF NOT EXISTS created_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'text')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_created_at ON story_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_stories_companion_id ON active_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_active_stories_expires_at ON active_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_story_requests_updated_at
    BEFORE UPDATE ON story_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_active_stories_updated_at
    BEFORE UPDATE ON active_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_created_stories_updated_at
    BEFORE UPDATE ON created_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitindo acesso público para funcionamento)
CREATE POLICY "Enable all access" ON story_requests FOR ALL USING (true);
CREATE POLICY "Enable all access" ON active_stories FOR ALL USING (true);
CREATE POLICY "Enable all access" ON created_stories FOR ALL USING (true);

-- =========================================
-- COMENTÁRIO FINAL
-- =========================================
-- Estrutura criada com sucesso!
-- Agora você pode usar o sistema de stories através da aplicação React.
-- As tabelas foram criadas com todos os campos necessários para suportar:
-- - Fotos, vídeos, áudios e textos
-- - Duração e tamanho de arquivo
-- - Status de aprovação/rejeição
-- - Controle de expiração 