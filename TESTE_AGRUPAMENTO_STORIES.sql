-- TESTE DE AGRUPAMENTO DE STORIES POR ACOMPANHANTE
-- Este script cria stories de teste para verificar se o agrupamento está funcionando

-- Inserir múltiplos stories para a mesma acompanhante (Instagram-like)
INSERT INTO created_stories (
  companion_id,
  requester_name,
  requester_whatsapp,
  type,
  url,
  status,
  created_at
) VALUES 
-- ACOMPANHANTE 1: Ana (3 stories)
('comp_001', 'Ana Silva', '11999888777', 'photo', 'https://example.com/ana_story1.jpg', 'approved', NOW() - INTERVAL '5 minutes'),
('comp_001', 'Ana Silva', '11999888777', 'photo', 'https://example.com/ana_story2.jpg', 'approved', NOW() - INTERVAL '3 minutes'),
('comp_001', 'Ana Silva', '11999888777', 'video', 'https://example.com/ana_story3.mp4', 'approved', NOW() - INTERVAL '1 minute'),

-- ACOMPANHANTE 2: Maria (2 stories)
('comp_002', 'Maria Santos', '11888777666', 'photo', 'https://example.com/maria_story1.jpg', 'approved', NOW() - INTERVAL '10 minutes'),
('comp_002', 'Maria Santos', '11888777666', 'photo', 'https://example.com/maria_story2.jpg', 'approved', NOW() - INTERVAL '8 minutes'),

-- ACOMPANHANTE 3: Julia (1 story com link)
('comp_003', 'Julia Costa', '11777666555', 'photo', 'https://example.com/julia_story1.jpg', 'approved', NOW() - INTERVAL '15 minutes'),

-- ACOMPANHANTE 4: Carla (4 stories)
('comp_004', 'Carla Oliveira', '11666555444', 'photo', 'https://example.com/carla_story1.jpg', 'approved', NOW() - INTERVAL '20 minutes'),
('comp_004', 'Carla Oliveira', '11666555444', 'video', 'https://example.com/carla_story2.mp4', 'approved', NOW() - INTERVAL '18 minutes'),
('comp_004', 'Carla Oliveira', '11666555444', 'photo', 'https://example.com/carla_story3.jpg', 'approved', NOW() - INTERVAL '16 minutes'),
('comp_004', 'Carla Oliveira', '11666555444', 'photo', 'https://example.com/carla_story4.jpg', 'approved', NOW() - INTERVAL '14 minutes');

-- Adicionar links para alguns stories
UPDATE created_stories 
SET 
  story_link_url = '11999888777',
  story_link_text = 'Chamar no WhatsApp',
  link_type = 'whatsapp'
WHERE requester_name = 'Ana Silva' AND type = 'video';

UPDATE created_stories 
SET 
  story_link_url = 'https://instagram.com/julia_costa',
  story_link_text = 'Seguir no Instagram',
  link_type = 'custom'
WHERE requester_name = 'Julia Costa';

-- Verificar o resultado
SELECT 
  requester_name,
  COUNT(*) as total_stories,
  STRING_AGG(type, ', ' ORDER BY created_at DESC) as tipos_stories,
  MAX(created_at) as story_mais_recente
FROM created_stories 
WHERE status = 'approved'
GROUP BY requester_name
ORDER BY story_mais_recente DESC;

-- Query para simular o que a aplicação faz
SELECT 
  *,
  ROW_NUMBER() OVER (PARTITION BY requester_name ORDER BY created_at DESC) as story_sequence
FROM created_stories 
WHERE status = 'approved'
ORDER BY requester_name, created_at DESC; 