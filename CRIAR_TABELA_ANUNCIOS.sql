-- ==========================================
-- SCRIPT PARA CRIAR TABELA DE ANÚNCIOS
-- Execute este script no Supabase SQL Editor
-- ==========================================

-- 1. Criar a tabela advertisements
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Saiba Mais',
    cta_url TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 1,
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_order ON advertisements(display_order);
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at ON advertisements(created_at);

-- 3. Inserir anúncios de exemplo (opcional)
INSERT INTO advertisements (title, description, cta_text, cta_url, image_url, is_active, display_order) VALUES
('Clube Premium VIP', 'Acesso exclusivo a eventos privados e encontros especiais. Conecte-se com pessoas selecionadas em um ambiente sofisticado.', 'Conhecer Club', 'https://example.com', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', true, 1),
('Produtos de Bem-Estar', 'Linha premium de produtos para cuidados pessoais e bem-estar. Qualidade e discrição garantidas.', 'Ver Produtos', 'https://example.com', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=400&q=80', true, 2),
('Serviços Exclusivos', 'Consultoria personalizada e serviços premium. Atendimento diferenciado para clientes especiais.', 'Contratar', 'https://example.com', 'https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=400&q=80', true, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE advertisements 
    SET view_count = view_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE advertisements 
    SET click_count = click_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- 9. Política para permitir leitura pública (anúncios ativos)
CREATE POLICY "Anúncios ativos são visíveis publicamente" ON advertisements
    FOR SELECT USING (is_active = true);

-- 10. Política para admins poderem fazer tudo
-- IMPORTANTE: Substitua 'seu-email@admin.com' pelo email do admin real
CREATE POLICY "Admins podem gerenciar anúncios" ON advertisements
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@faixarosa.com' OR
        auth.jwt() ->> 'email' = 'gabriel@faixarosa.com'
    );

-- ==========================================
-- INSTRUÇÕES:
-- 1. Vá no Supabase Dashboard
-- 2. SQL Editor
-- 3. Cole este script completo
-- 4. Clique em "Run"
-- 5. Atualize a página do AdminDashboard
-- ==========================================