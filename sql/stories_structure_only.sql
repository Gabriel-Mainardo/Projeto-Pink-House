-- =========================================
-- SISTEMA DE STORIES - ESTRUTURA APENAS
-- =========================================
-- Este arquivo contém APENAS a estrutura das tabelas sem dados de exemplo

-- =========================================
-- 1. CRIAÇÃO DAS TABELAS
-- =========================================

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
    duration INTEGER, -- duração em segundos para vídeo/áudio
    file_size BIGINT, -- tamanho do arquivo em bytes
    mime_type VARCHAR(100), -- tipo MIME do arquivo
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =========================================

-- Índices para story_requests
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_created_at ON story_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_requests_plan_name ON story_requests(plan_name);

-- Índices para active_stories
CREATE INDEX IF NOT EXISTS idx_active_stories_companion_id ON active_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_active_stories_expires_at ON active_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_stories_is_active ON active_stories(is_active);
CREATE INDEX IF NOT EXISTS idx_active_stories_created_at ON active_stories(created_at DESC);

-- Índices para created_stories
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_type ON created_stories(type);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at DESC);

-- =========================================
-- 3. TRIGGERS PARA UPDATED_AT
-- =========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
DROP TRIGGER IF EXISTS update_story_requests_updated_at ON story_requests;
CREATE TRIGGER update_story_requests_updated_at
    BEFORE UPDATE ON story_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_active_stories_updated_at ON active_stories;
CREATE TRIGGER update_active_stories_updated_at
    BEFORE UPDATE ON active_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_created_stories_updated_at ON created_stories;
CREATE TRIGGER update_created_stories_updated_at
    BEFORE UPDATE ON created_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS nas tabelas
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- Políticas para story_requests
DROP POLICY IF EXISTS "story_requests_insert_policy" ON story_requests;
CREATE POLICY "story_requests_insert_policy" ON story_requests
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "story_requests_select_policy" ON story_requests;
CREATE POLICY "story_requests_select_policy" ON story_requests
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "story_requests_update_policy" ON story_requests;
CREATE POLICY "story_requests_update_policy" ON story_requests
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para active_stories
DROP POLICY IF EXISTS "active_stories_insert_policy" ON active_stories;
CREATE POLICY "active_stories_insert_policy" ON active_stories
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "active_stories_select_policy" ON active_stories;
CREATE POLICY "active_stories_select_policy" ON active_stories
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "active_stories_update_policy" ON active_stories;
CREATE POLICY "active_stories_update_policy" ON active_stories
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para created_stories
DROP POLICY IF EXISTS "created_stories_insert_policy" ON created_stories;
CREATE POLICY "created_stories_insert_policy" ON created_stories
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "created_stories_select_policy" ON created_stories;
CREATE POLICY "created_stories_select_policy" ON created_stories
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "created_stories_update_policy" ON created_stories;
CREATE POLICY "created_stories_update_policy" ON created_stories
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- =========================================
-- 5. VIEWS PARA CONSULTAS COMPLEXAS
-- =========================================

-- View para stories pendentes com dados da acompanhante
CREATE OR REPLACE VIEW v_pending_stories AS
SELECT 
    cs.*,
    a.name as companion_name,
    a.image as companion_image,
    a.location as companion_location
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
WHERE cs.status = 'pending'
ORDER BY cs.created_at DESC;

-- View para stories aprovados ativos
CREATE OR REPLACE VIEW v_active_stories_with_content AS
SELECT 
    ast.*,
    cs.type as content_type,
    cs.url as content_url,
    cs.thumbnail as content_thumbnail,
    a.name as companion_name,
    a.image as companion_image,
    a.location as companion_location
FROM active_stories ast
LEFT JOIN created_stories cs ON cs.companion_id = ast.companion_id AND cs.status = 'approved'
LEFT JOIN acompanhantes a ON ast.companion_id = a.id
WHERE ast.is_active = true 
AND ast.expires_at > NOW()
ORDER BY ast.created_at DESC;

-- View para estatísticas do admin
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM story_requests WHERE status = 'pending') as pending_requests,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as pending_stories,
    (SELECT COUNT(*) FROM active_stories WHERE is_active = true AND expires_at > NOW()) as active_stories,
    (SELECT COALESCE(SUM(plan_price), 0) FROM story_requests WHERE status = 'approved') as total_revenue,
    (SELECT COUNT(*) FROM created_stories WHERE created_at >= CURRENT_DATE) as stories_today,
    (SELECT COUNT(*) FROM story_requests WHERE created_at >= CURRENT_DATE) as requests_today;

-- =========================================
-- 6. FUNÇÕES AUXILIARES
-- =========================================

-- Função para desativar stories expirados
CREATE OR REPLACE FUNCTION deactivate_expired_stories()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE active_stories 
    SET is_active = false 
    WHERE expires_at <= NOW() 
    AND is_active = true;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas por período
CREATE OR REPLACE FUNCTION get_stats_by_period(period_days INTEGER DEFAULT 7)
RETURNS TABLE(
    new_requests BIGINT,
    approved_requests BIGINT,
    new_stories BIGINT,
    approved_stories BIGINT,
    revenue NUMERIC,
    period_start TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM story_requests 
         WHERE created_at >= NOW() - INTERVAL '%s days') as new_requests,
        (SELECT COUNT(*) FROM story_requests 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved') as approved_requests,
        (SELECT COUNT(*) FROM created_stories 
         WHERE created_at >= NOW() - INTERVAL '%s days') as new_stories,
        (SELECT COUNT(*) FROM created_stories 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved') as approved_stories,
        (SELECT COALESCE(SUM(plan_price), 0) FROM story_requests 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved') as revenue,
        (NOW() - INTERVAL '%s days') as period_start;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- COMENTÁRIOS FINAIS
-- =========================================
-- Este arquivo cria apenas a estrutura das tabelas do sistema de stories.
-- Execute este arquivo no Supabase para criar todas as tabelas e configurações necessárias.
-- Depois você pode adicionar dados conforme necessário através da aplicação. 