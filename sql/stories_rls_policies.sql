-- Politicas de seguranca para a tabela created_stories

-- Habilitar RLS na tabela
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- Politica para permitir leitura publica de stories aprovados
CREATE POLICY "Permitir leitura publica de stories aprovados" ON created_stories
FOR SELECT USING (status = 'approved');

-- Politica para permitir insercao publica (criar stories)
CREATE POLICY "Permitir criacao publica de stories" ON created_stories
FOR INSERT WITH CHECK (true);

-- Politica para admin ler todos os stories
CREATE POLICY "Admin pode ler todos os stories" ON created_stories
FOR SELECT TO authenticated USING (true);

-- Politica para admin atualizar stories (aprovar/rejeitar)
CREATE POLICY "Admin pode atualizar stories" ON created_stories
FOR UPDATE TO authenticated USING (true);

-- Politica para admin deletar stories
CREATE POLICY "Admin pode deletar stories" ON created_stories
FOR DELETE TO authenticated USING (true);