-- ===============================================
-- RESUMO DAS QUERIES PRINCIPAIS - FAIXA ROSA
-- ===============================================

-- CONSULTAS BÁSICAS
SELECT * FROM story_requests ORDER BY created_at DESC;
SELECT * FROM created_stories ORDER BY created_at DESC;
SELECT * FROM story_requests WHERE status = 'pending';
SELECT * FROM created_stories WHERE status = 'pending';

-- OPERAÇÕES DE APROVAÇÃO/REJEIÇÃO
UPDATE story_requests SET status = 'approved' WHERE id = 'ID_AQUI';
UPDATE story_requests SET status = 'rejected', rejection_reason = 'Motivo' WHERE id = 'ID_AQUI';
UPDATE created_stories SET status = 'approved' WHERE id = 'ID_AQUI';
UPDATE created_stories SET status = 'rejected', rejection_reason = 'Motivo' WHERE id = 'ID_AQUI';

-- INSERIR NOVOS REGISTROS
INSERT INTO story_requests (name, phone, plan_name, plan_price, plan_duration, plan_features)
VALUES ('Nome', 'Telefone', 'Plano', 29.90, '7 dias', ARRAY['Feature']);

INSERT INTO created_stories (companion_id, type, url, status)
VALUES ('companion_id', 'photo', 'https://url.jpg', 'pending');

-- ESTATÍSTICAS PARA ADMIN
SELECT 
    (SELECT COUNT(*) FROM story_requests WHERE status = 'pending') as solicitacoes_pendentes,
    (SELECT COUNT(*) FROM created_stories WHERE status = 'pending') as stories_pendentes,
    (SELECT SUM(plan_price) FROM story_requests WHERE status = 'approved') as faturamento_total;

-- QUERY PRINCIPAL DO ADMIN (com dados da acompanhante)
SELECT 
    cs.*,
    a.name as companion_name,
    a.image as companion_image
FROM created_stories cs
LEFT JOIN acompanhantes a ON cs.companion_id = a.id
ORDER BY 
    CASE WHEN cs.status = 'pending' THEN 1 ELSE 2 END,
    cs.created_at DESC; 