-- =========================================
-- SISTEMA COMPLETO DE STORIES - FAIXA ROSA
-- =========================================
-- Este arquivo contém TODAS as queries do sistema de stories implementado
-- Incluindo: tabelas, triggers, políticas RLS, dados de exemplo e operações

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
    (SELECT COUNT(*) FROM story_requests WHERE status = 'approved') as approved_requests,
    (SELECT COUNT(*) FROM story_requests WHERE status = 'rejected') as rejected_requests,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as pending_stories,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'approved') as approved_stories,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'rejected') as rejected_stories,
    (SELECT COUNT(*) FROM active_stories WHERE is_active = true AND expires_at > NOW()) as active_stories,
    (SELECT SUM(plan_price) FROM story_requests WHERE status = 'approved') as total_revenue;

-- =========================================
-- 6. FUNÇÕES AUXILIARES
-- =========================================

-- Função para desativar stories expirados
CREATE OR REPLACE FUNCTION deactivate_expired_stories()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE active_stories 
    SET is_active = false 
    WHERE is_active = true 
    AND expires_at <= NOW();
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas por período
CREATE OR REPLACE FUNCTION get_stats_by_period(period_days INTEGER DEFAULT 7)
RETURNS TABLE(
    new_requests BIGINT,
    new_stories BIGINT,
    revenue NUMERIC,
    period_start TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM story_requests 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved')::BIGINT as new_requests,
        (SELECT COUNT(*) FROM created_stories 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved')::BIGINT as new_stories,
        (SELECT COALESCE(SUM(plan_price), 0) FROM story_requests 
         WHERE created_at >= NOW() - INTERVAL '%s days' 
         AND status = 'approved') as revenue,
        (NOW() - INTERVAL '%s days') as period_start;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 7. DADOS DE EXEMPLO PARA TESTES
-- =========================================

-- Inserir solicitações de exemplo
INSERT INTO story_requests (name, phone, plan_name, plan_price, plan_duration, plan_features, status) VALUES
('Ana Silva', '+5511999887766', 'Básico', 29.90, '7 dias', ARRAY['Story por 7 dias'], 'pending'),
('Mariana Costa', '+5511888776655', 'Destaque', 49.90, '7 dias', ARRAY['Story destacado'], 'approved');

-- Inserir stories ativos de exemplo
INSERT INTO active_stories (request_id, companion_id, plan_name, plan_price, expires_at) VALUES
((SELECT id FROM story_requests WHERE name = 'Mariana Costa' LIMIT 1), 'comp_001', 'Destaque', 49.90, NOW() + INTERVAL '7 days');

-- Inserir stories criados de exemplo (com uploads de áudio/vídeo)
INSERT INTO created_stories (companion_id, type, url, thumbnail, duration, file_size, mime_type, status) VALUES
('demo-companion-id-2024', 'photo', 'https://example.com/photos/photo1.jpg', NULL, NULL, 2048576, 'image/jpeg', 'pending'),
('comp_001', 'video', 'https://example.com/videos/video1.mp4', 'https://example.com/videos/video1_thumb.jpg', 25, 15728640, 'video/mp4', 'approved'),
('comp_002', 'audio', 'https://example.com/audios/audio1.mp3', NULL, 18, 512000, 'audio/mpeg', 'pending'),
('comp_003', 'text', 'https://example.com/stories/text1.png', NULL, NULL, 204800, 'image/png', 'approved'),
('comp_004', 'video', 'https://example.com/videos/video2.webm', 'https://example.com/videos/video2_thumb.jpg', 30, 20971520, 'video/webm', 'rejected');

-- =========================================
-- 8. QUERIES DE CONSULTA MAIS USADAS
-- =========================================

-- 8.1 BUSCAR TODAS AS SOLICITAÇÕES DE PAGAMENTO
SELECT 
    id,
    name,
    phone,
    plan_name,
    plan_price,
    plan_duration,
    plan_features,
    status,
    rejection_reason,
    created_at,
    updated_at
FROM story_requests
ORDER BY created_at DESC;

-- 8.2 BUSCAR SOLICITAÇÕES PENDENTES
SELECT * FROM story_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- 8.3 BUSCAR STORIES CRIADOS COM DADOS DA ACOMPANHANTE
SELECT 
    cs.*,
    a.name as companion_name,
    a.image as companion_image
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
ORDER BY cs.created_at DESC;

-- 8.4 BUSCAR STORIES PENDENTES DE APROVAÇÃO
SELECT * FROM v_pending_stories;

-- 8.5 BUSCAR STORIES ATIVOS NO MOMENTO
SELECT * FROM v_active_stories_with_content;

-- 8.6 ESTATÍSTICAS PARA O ADMIN
SELECT * FROM v_admin_stats;

-- 8.7 BUSCAR STORIES POR ACOMPANHANTE
SELECT * FROM created_stories 
WHERE companion_id = 'demo-companion-id-2024' 
ORDER BY created_at DESC;

-- =========================================
-- 9. QUERIES DE OPERAÇÕES (INSERT/UPDATE/DELETE)
-- =========================================

-- 9.1 CRIAR NOVA SOLICITAÇÃO DE PAGAMENTO
INSERT INTO story_requests (name, phone, plan_name, plan_price, plan_duration, plan_features)
VALUES ('Nome da Cliente', '+5511999999999', 'Básico', 29.90, '7 dias', ARRAY['Feature 1', 'Feature 2']);

-- 9.2 APROVAR SOLICITAÇÃO DE PAGAMENTO
UPDATE story_requests 
SET status = 'approved' 
WHERE id = 'REQUEST_ID_AQUI';

-- 9.3 REJEITAR SOLICITAÇÃO DE PAGAMENTO
UPDATE story_requests 
SET status = 'rejected', rejection_reason = 'Motivo da rejeição' 
WHERE id = 'REQUEST_ID_AQUI';

-- 9.4 CRIAR STORY ATIVO APÓS APROVAÇÃO
INSERT INTO active_stories (request_id, companion_id, plan_name, plan_price, expires_at)
VALUES ('REQUEST_ID', 'COMPANION_ID', 'Plano', 29.90, NOW() + INTERVAL '7 days');

-- 9.5 SALVAR STORY CRIADO PELA ACOMPANHANTE
INSERT INTO created_stories (companion_id, type, url, status)
VALUES ('COMPANION_ID', 'photo', 'URL_DA_MEDIA', 'pending');

-- 9.6 APROVAR STORY CRIADO
UPDATE created_stories 
SET status = 'approved' 
WHERE id = 'STORY_ID';

-- 9.7 REJEITAR STORY CRIADO
UPDATE created_stories 
SET status = 'rejected', rejection_reason = 'Motivo da rejeição' 
WHERE id = 'STORY_ID';

-- 9.8 DESATIVAR STORIES EXPIRADOS
SELECT deactivate_expired_stories();

-- =========================================
-- 10. QUERIES DE RELATÓRIOS E ANALYTICS
-- =========================================

-- 10.1 RELATÓRIO DE FATURAMENTO POR PERÍODO
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as requests,
    SUM(plan_price) as revenue,
    plan_name
FROM story_requests 
WHERE status = 'approved' 
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), plan_name
ORDER BY date DESC;

-- 10.2 TOP ACOMPANHANTES POR STORIES CRIADOS
SELECT 
    cs.companion_id,
    a.name as companion_name,
    COUNT(*) as total_stories,
    COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_stories,
    COUNT(CASE WHEN cs.status = 'pending' THEN 1 END) as pending_stories,
    COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_stories
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
GROUP BY cs.companion_id, a.name
ORDER BY total_stories DESC;

-- 10.3 PERFORMANCE POR TIPO DE STORY
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
    ROUND(COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate
FROM created_stories
GROUP BY type
ORDER BY total DESC;

-- 10.4 ESTATÍSTICAS GERAIS DO SISTEMA
SELECT 
    'Solicitações Totais' as metric,
    COUNT(*)::TEXT as value
FROM story_requests
UNION ALL
SELECT 
    'Faturamento Total' as metric,
    'R$ ' || COALESCE(SUM(plan_price), 0)::TEXT as value
FROM story_requests WHERE status = 'approved'
UNION ALL
SELECT 
    'Stories Criados' as metric,
    COUNT(*)::TEXT as value
FROM created_stories
UNION ALL
SELECT 
    'Stories Ativos' as metric,
    COUNT(*)::TEXT as value
FROM active_stories WHERE is_active = true AND expires_at > NOW();

-- =========================================
-- 11. QUERIES DE MANUTENÇÃO
-- =========================================

-- 11.1 LIMPAR DADOS ANTIGOS (CUIDADO!)
-- DELETE FROM story_requests WHERE created_at < NOW() - INTERVAL '1 year';
-- DELETE FROM created_stories WHERE created_at < NOW() - INTERVAL '6 months' AND status = 'rejected';

-- 11.2 REINDEXAR TABELAS PARA PERFORMANCE
-- REINDEX TABLE story_requests;
-- REINDEX TABLE active_stories;
-- REINDEX TABLE created_stories;

-- 11.3 ANALISAR ESTATÍSTICAS DAS TABELAS
-- ANALYZE story_requests;
-- ANALYZE active_stories;
-- ANALYZE created_stories;

-- =========================================
-- 12. BACKUP E RESTORE
-- =========================================

-- Para fazer backup:
-- pg_dump -h HOST -U USER -d DATABASE -t story_requests -t active_stories -t created_stories > stories_backup.sql

-- Para restaurar:
-- psql -h HOST -U USER -d DATABASE < stories_backup.sql

-- =========================================
-- COMENTÁRIOS FINAIS
-- =========================================

-- Este arquivo contém TODAS as queries do sistema de stories implementado.
-- Inclui estrutura completa, dados de exemplo, operações CRUD, relatórios e manutenção.
-- 
-- Para usar:
-- 1. Execute as seções 1-6 para criar a estrutura
-- 2. Execute a seção 7 para dados de exemplo
-- 3. Use as seções 8-11 conforme necessário
--
-- =========================================
-- QUERIES ESPECÍFICAS PARA ÁUDIO E VÍDEO
-- =========================================

-- BUSCAR STORIES COM INFORMAÇÕES DE MÍDIA DETALHADAS
SELECT 
    cs.*,
    a.name as companion_name,
    a.image as companion_image,
    CASE 
        WHEN cs.file_size IS NOT NULL THEN ROUND(cs.file_size / 1024.0 / 1024.0, 2) || ' MB'
        ELSE 'N/A'
    END as file_size_mb,
    CASE 
        WHEN cs.duration IS NOT NULL THEN cs.duration || 's'
        ELSE 'N/A'
    END as duration_formatted,
    cs.mime_type
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
ORDER BY cs.created_at DESC;

-- BUSCAR APENAS STORIES DE VÍDEO
SELECT * FROM created_stories 
WHERE type = 'video' 
ORDER BY created_at DESC;

-- BUSCAR APENAS STORIES DE ÁUDIO
SELECT * FROM created_stories 
WHERE type = 'audio' 
ORDER BY created_at DESC;

-- ESTATÍSTICAS POR TIPO DE MÍDIA
SELECT 
    type,
    COUNT(*) as total,
    ROUND(AVG(duration), 2) as duracao_media_segundos,
    ROUND(AVG(file_size / 1024.0 / 1024.0), 2) as tamanho_medio_mb,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprovados,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejeitados
FROM created_stories 
GROUP BY type
ORDER BY total DESC;

-- BUSCAR VÍDEOS POR DURAÇÃO
SELECT * FROM created_stories 
WHERE type = 'video' 
AND duration BETWEEN 20 AND 30 -- vídeos de 20-30 segundos
ORDER BY duration DESC;

-- BUSCAR ÁUDIOS POR DURAÇÃO
SELECT * FROM created_stories 
WHERE type = 'audio' 
AND duration <= 30 -- áudios até 30 segundos
ORDER BY duration DESC;

-- VERIFICAR UPLOADS GRANDES (acima de 20MB)
SELECT 
    cs.*,
    a.name as companion_name,
    ROUND(cs.file_size / 1024.0 / 1024.0, 2) as file_size_mb
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
WHERE cs.file_size > 20971520 -- 20MB em bytes
ORDER BY cs.file_size DESC;

-- RELATÓRIO DE TIPOS MIME UTILIZADOS
SELECT 
    mime_type,
    type,
    COUNT(*) as total_uploads
FROM created_stories 
WHERE mime_type IS NOT NULL
GROUP BY mime_type, type
ORDER BY total_uploads DESC;

-- Sistema desenvolvido para: Faixa Rosa - Site de Acompanhantes
-- Data: Janeiro 2024
-- Recursos: Stories estilo Instagram com aprovação administrativa
-- Suporte completo para uploads de áudio, vídeo, foto e texto 