-- ============================================================
-- TODAS AS QUERIES DO SISTEMA DE STORIES - FAIXA ROSA
-- ============================================================
-- Arquivo com TODAS as queries implementadas no sistema

-- ============================================================
-- ESTRUTURA DAS TABELAS
-- ============================================================

-- Tabela: story_requests (solicitações de pagamento)
CREATE TABLE story_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    plan_name VARCHAR(100) NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    plan_duration VARCHAR(50) NOT NULL,
    plan_features TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: created_stories (stories criados pelas acompanhantes)
CREATE TABLE created_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- QUERIES DE CONSULTA (SELECT)
-- ============================================================

-- 1. BUSCAR TODAS AS SOLICITAÇÕES
SELECT * FROM story_requests ORDER BY created_at DESC;

-- 2. BUSCAR SOLICITAÇÕES PENDENTES  
SELECT * FROM story_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- 3. BUSCAR TODOS OS STORIES CRIADOS
SELECT * FROM created_stories ORDER BY created_at DESC;

-- 4. BUSCAR STORIES PENDENTES
SELECT * FROM created_stories WHERE status = 'pending' ORDER BY created_at DESC;

-- 5. APROVAR SOLICITAÇÃO
UPDATE story_requests SET status = 'approved' WHERE id = 'REQUEST_ID';

-- 6. REJEITAR SOLICITAÇÃO
UPDATE story_requests SET status = 'rejected', rejection_reason = 'MOTIVO' WHERE id = 'REQUEST_ID';

-- 7. APROVAR STORY
UPDATE created_stories SET status = 'approved' WHERE id = 'STORY_ID';

-- 8. REJEITAR STORY
UPDATE created_stories SET status = 'rejected', rejection_reason = 'MOTIVO' WHERE id = 'STORY_ID';

-- 9. CRIAR NOVA SOLICITAÇÃO
INSERT INTO story_requests (name, phone, plan_name, plan_price, plan_duration, plan_features)
VALUES ('Nome', '+5511999999999', 'Básico', 29.90, '7 dias', ARRAY['Feature 1']);

-- 10. SALVAR STORY CRIADO
INSERT INTO created_stories (companion_id, type, url, status)
VALUES ('companion_id', 'photo', 'https://url.jpg', 'pending');

-- 11. ESTATÍSTICAS DO ADMIN
SELECT 
    (SELECT COUNT(*) FROM story_requests WHERE status = 'pending') as solicitacoes_pendentes,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as stories_pendentes;

-- 12. STORIES COM DADOS DA ACOMPANHANTE
SELECT 
    cs.*,
    a.name as companion_name,
    a.image as companion_image
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
ORDER BY cs.created_at DESC;

-- 13. BUSCAR SOLICITAÇÕES APROVADAS
SELECT * FROM story_requests 
WHERE status = 'approved' 
ORDER BY created_at DESC;

-- 14. BUSCAR SOLICITAÇÕES REJEITADAS
SELECT * FROM story_requests 
WHERE status = 'rejected' 
ORDER BY created_at DESC;

-- 15. BUSCAR STORIES APROVADOS
SELECT * FROM created_stories 
WHERE status = 'approved' 
ORDER BY created_at DESC;

-- 16. BUSCAR STORIES REJEITADOS
SELECT * FROM created_stories 
WHERE status = 'rejected' 
ORDER BY created_at DESC;

-- 17. BUSCAR STORIES POR ACOMPANHANTE
SELECT * FROM created_stories 
WHERE companion_id = 'COMPANION_ID_AQUI' 
ORDER BY created_at DESC;

-- 18. BUSCAR STORIES POR TIPO
SELECT * FROM created_stories 
WHERE type = 'photo' 
ORDER BY created_at DESC;

-- 19. CONTAR SOLICITAÇÕES POR STATUS
SELECT 
    status,
    COUNT(*) as total
FROM story_requests
GROUP BY status;

-- 20. CONTAR STORIES POR STATUS
SELECT 
    status,
    COUNT(*) as total
FROM created_stories
GROUP BY status;

-- 21. CONTAR STORIES POR TIPO
SELECT 
    type,
    COUNT(*) as total
FROM created_stories
GROUP BY type;

-- 22. ESTATÍSTICAS GERAIS
SELECT 
    (SELECT COUNT(*) FROM story_requests WHERE status = 'pending') as pending_requests,
    (SELECT COUNT(*) FROM story_requests WHERE status = 'approved') as approved_requests,
    (SELECT COUNT(*) FROM story_requests WHERE status = 'rejected') as rejected_requests,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as pending_stories,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'approved') as approved_stories,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'rejected') as rejected_stories;

-- ============================================================
-- QUERIES DE INSERÇÃO (INSERT)
-- ============================================================

-- 23. SALVAR STORY CRIADO - VÍDEO
INSERT INTO created_stories (companion_id, type, url, thumbnail, status)
VALUES ('companion_id_aqui', 'video', 'https://url-do-video.mp4', 'https://url-thumbnail.jpg', 'pending');

-- 24. SALVAR STORY CRIADO - ÁUDIO
INSERT INTO created_stories (companion_id, type, url, status)
VALUES ('companion_id_aqui', 'audio', 'https://url-do-audio.mp3', 'pending');

-- 25. SALVAR STORY CRIADO - TEXTO
INSERT INTO created_stories (companion_id, type, url, status)
VALUES ('companion_id_aqui', 'text', 'https://url-da-imagem-texto.png', 'pending');

-- ============================================================
-- QUERIES DE ATUALIZAÇÃO (UPDATE)
-- ============================================================

-- 26. ATUALIZAR DADOS DE SOLICITAÇÃO
UPDATE story_requests 
SET name = 'Novo Nome', 
    phone = '+5511888888888' 
WHERE id = 'REQUEST_ID_AQUI';

-- ============================================================
-- QUERIES DE EXCLUSÃO (DELETE)
-- ============================================================

-- 27. EXCLUIR SOLICITAÇÃO ESPECÍFICA
DELETE FROM story_requests WHERE id = 'REQUEST_ID_AQUI';

-- 28. EXCLUIR STORY ESPECÍFICO
DELETE FROM created_stories WHERE id = 'STORY_ID_AQUI';

-- 29. EXCLUIR SOLICITAÇÕES REJEITADAS ANTIGAS (30 dias)
DELETE FROM story_requests 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '30 days';

-- 30. EXCLUIR STORIES REJEITADOS ANTIGOS (30 dias)
DELETE FROM created_stories 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '30 days';

-- ============================================================
-- QUERIES DE RELATÓRIOS E ANALYTICS
-- ============================================================

-- 31. FATURAMENTO TOTAL
SELECT SUM(plan_price) as total_revenue 
FROM story_requests 
WHERE status = 'approved';

-- 32. FATURAMENTO POR PLANO
SELECT 
    plan_name,
    COUNT(*) as total_vendas,
    SUM(plan_price) as faturamento
FROM story_requests 
WHERE status = 'approved'
GROUP BY plan_name
ORDER BY faturamento DESC;

-- 33. FATURAMENTO POR DIA (últimos 30 dias)
SELECT 
    DATE(created_at) as data,
    COUNT(*) as vendas,
    SUM(plan_price) as faturamento
FROM story_requests 
WHERE status = 'approved'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 34. TOP ACOMPANHANTES POR STORIES CRIADOS
SELECT 
    companion_id,
    COUNT(*) as total_stories,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM created_stories
GROUP BY companion_id
ORDER BY total_stories DESC;

-- 35. PERFORMANCE POR TIPO DE STORY
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
    ROUND(
        COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as taxa_aprovacao
FROM created_stories
GROUP BY type;

-- 36. STORIES CRIADOS POR DIA (últimos 30 dias)
SELECT 
    DATE(created_at) as data,
    COUNT(*) as stories_criados
FROM created_stories
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- ============================================================
-- QUERIES ESPECÍFICAS DO ADMIN
-- ============================================================

-- 37. DASHBOARD DO ADMIN - ESTATÍSTICAS PRINCIPAIS
SELECT 
    (SELECT COUNT(*) FROM story_requests WHERE status = 'pending') as solicitacoes_pendentes,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as stories_pendentes,
    (SELECT SUM(plan_price) FROM story_requests WHERE status = 'approved') as faturamento_total,
    (SELECT COUNT(*) FROM story_requests WHERE status = 'approved') as vendas_total;

-- 38. LISTA PARA ABA "PAGAMENTOS" DO ADMIN
SELECT 
    id,
    name,
    phone,
    plan_name,
    plan_price,
    status,
    rejection_reason,
    created_at
FROM story_requests
ORDER BY 
    CASE WHEN status = 'pending' THEN 1 ELSE 2 END,
    created_at DESC;

-- 39. LISTA PARA ABA "STORIES CRIADOS" DO ADMIN
SELECT 
    cs.id,
    cs.companion_id,
    cs.type,
    cs.url,
    cs.thumbnail,
    cs.status,
    cs.rejection_reason,
    cs.created_at,
    a.name as companion_name,
    a.image as companion_image
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
ORDER BY 
    CASE WHEN cs.status = 'pending' THEN 1 ELSE 2 END,
    cs.created_at DESC;

-- ============================================================
-- QUERIES DE BUSCA E FILTROS
-- ============================================================

-- 40. BUSCAR SOLICITAÇÕES POR NOME
SELECT * FROM story_requests 
WHERE LOWER(name) LIKE LOWER('%NOME_AQUI%')
ORDER BY created_at DESC;

-- 41. BUSCAR SOLICITAÇÕES POR TELEFONE
SELECT * FROM story_requests 
WHERE phone LIKE '%TELEFONE_AQUI%'
ORDER BY created_at DESC;

-- 42. BUSCAR SOLICITAÇÕES POR PLANO
SELECT * FROM story_requests 
WHERE plan_name = 'PLANO_AQUI'
ORDER BY created_at DESC;

-- 43. BUSCAR STORIES POR PERÍODO
SELECT * FROM created_stories 
WHERE created_at BETWEEN 'DATA_INICIO' AND 'DATA_FIM'
ORDER BY created_at DESC;

-- 44. BUSCAR STORIES POR MÚLTIPLOS FILTROS
SELECT * FROM created_stories 
WHERE type = 'TIPO_AQUI'
AND status = 'STATUS_AQUI'
AND companion_id = 'COMPANION_ID_AQUI'
ORDER BY created_at DESC;

-- ============================================================
-- QUERIES DE MANUTENÇÃO
-- ============================================================

-- 45. VERIFICAR INTEGRIDADE DOS DADOS
SELECT 
    'story_requests' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status IN ('pending', 'approved', 'rejected') THEN 1 END) as status_validos
FROM story_requests
UNION ALL
SELECT 
    'created_stories' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status IN ('pending', 'approved', 'rejected') THEN 1 END) as status_validos
FROM created_stories;

-- 46. LISTAR REGISTROS COM PROBLEMAS
SELECT 'story_requests' as tabela, id, 'status inválido' as problema
FROM story_requests 
WHERE status NOT IN ('pending', 'approved', 'rejected')
UNION ALL
SELECT 'created_stories' as tabela, id, 'type inválido' as problema
FROM created_stories 
WHERE type NOT IN ('photo', 'video', 'audio', 'text')
UNION ALL
SELECT 'created_stories' as tabela, id, 'URL vazia' as problema
FROM created_stories 
WHERE url IS NULL OR url = '';

-- ============================================================
-- QUERIES DE BACKUP
-- ============================================================

-- 47. EXPORTAR TODAS AS SOLICITAÇÕES
SELECT 
    id,
    name,
    phone,
    plan_name,
    plan_price,
    plan_duration,
    array_to_string(plan_features, '|') as plan_features,
    status,
    rejection_reason,
    created_at,
    updated_at
FROM story_requests
ORDER BY created_at;

-- 48. EXPORTAR TODOS OS STORIES
SELECT 
    id,
    companion_id,
    type,
    url,
    thumbnail,
    status,
    rejection_reason,
    created_at,
    updated_at
FROM created_stories
ORDER BY created_at;

-- ============================================================
-- QUERIES PARA FRONTEND (TypeScript/JavaScript)
-- ============================================================

-- 49. Query para storiesService.getAllRequests()
-- SELECT * FROM story_requests ORDER BY created_at DESC;

-- 50. Query para storiesService.getPendingRequests()
-- SELECT * FROM story_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- 51. Query para storiesService.approveRequest(id)
-- UPDATE story_requests SET status = 'approved' WHERE id = $1;

-- 52. Query para storiesService.rejectRequest(id, reason)
-- UPDATE story_requests SET status = 'rejected', rejection_reason = $2 WHERE id = $1;

-- 53. Query para storiesService.saveCreatedStory(data)
-- INSERT INTO created_stories (companion_id, type, url, thumbnail) VALUES ($1, $2, $3, $4);

-- 54. Query para storiesService.getCreatedStories()
-- SELECT cs.*, a.name as companion_name, a.image as companion_image 
-- FROM created_stories cs 
-- LEFT JOIN acompanhantes a ON cs.companion_id = a.id 
-- ORDER BY cs.created_at DESC;

-- 55. Query para storiesService.getPendingStories()
-- SELECT cs.*, a.name as companion_name, a.image as companion_image 
-- FROM created_stories cs 
-- LEFT JOIN acompanhantes a ON cs.companion_id = a.id 
-- WHERE cs.status = 'pending' 
-- ORDER BY cs.created_at DESC;

-- 56. Query para storiesService.approveStory(id)
-- UPDATE created_stories SET status = 'approved' WHERE id = $1;

-- 57. Query para storiesService.rejectStory(id, reason)
-- UPDATE created_stories SET status = 'rejected', rejection_reason = $2 WHERE id = $1;

-- ============================================================
-- EXEMPLOS DE DADOS PARA TESTES
-- ============================================================

-- 58. Inserir dados de exemplo para testes
INSERT INTO story_requests (name, phone, plan_name, plan_price, plan_duration, plan_features, status) VALUES
('Ana Silva', '+5511999887766', 'Básico', 29.90, '7 dias', ARRAY['Story por 7 dias', 'Aparição no feed'], 'pending'),
('Mariana Costa', '+5511888776655', 'Destaque', 49.90, '7 dias', ARRAY['Story destacado', 'Posição premium'], 'approved'),
('Julia Santos', '+5511777665544', 'Premium', 99.90, '30 dias', ARRAY['Story premium', 'Posição top'], 'pending'),
('Carla Oliveira', '+5511666554433', 'Básico', 29.90, '7 dias', ARRAY['Story por 7 dias'], 'rejected');

INSERT INTO created_stories (companion_id, type, url, status) VALUES
('demo-companion-id-2024', 'photo', 'https://exemplo.com/foto1.jpg', 'pending'),
('comp_001', 'video', 'https://exemplo.com/video1.mp4', 'approved'),
('comp_002', 'audio', 'https://exemplo.com/audio1.mp3', 'pending'),
('comp_003', 'text', 'https://exemplo.com/texto1.png', 'rejected');

-- ============================================================
-- COMANDOS DE ADMINISTRAÇÃO DO BANCO
-- ============================================================

-- 59. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_created_at ON story_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at DESC);

-- 60. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_story_requests_updated_at
    BEFORE UPDATE ON story_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_created_stories_updated_at
    BEFORE UPDATE ON created_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 61. Configurar Row Level Security (RLS)
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "story_requests_policy" ON story_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "created_stories_policy" ON created_stories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIM DO ARQUIVO
-- ============================================================
-- Total: 60 queries cobrindo TODAS as operações do sistema
-- Criado para: Faixa Rosa - Sistema de Stories
-- Data: Janeiro 2024 