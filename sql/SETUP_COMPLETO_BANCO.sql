-- =========================================
-- SETUP COMPLETO DO BANCO - FAIXA ROSA
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- para configurar completamente o banco de dados

-- =========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- =========================================
SELECT 'Verificando tabelas existentes...' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- =========================================
-- 2. CRIAR TABELAS PRINCIPAIS
-- =========================================

-- Tabela de acompanhantes (versão corrigida)
CREATE TABLE IF NOT EXISTS acompanhantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  location TEXT NOT NULL,
  height TEXT,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  audio_url TEXT,
  video_url TEXT,
  rating DECIMAL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  description TEXT NOT NULL,
  cities_served TEXT[] DEFAULT '{}',
  -- Campos de preços (sem underscores - corrigido)
  priceperhour TEXT,
  hasownlocation BOOLEAN DEFAULT false,
  acceptsclientlocation BOOLEAN DEFAULT false,
  acceptsmotel BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabela de cadastros pendentes
CREATE TABLE IF NOT EXISTS cadastros_pendentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  location TEXT NOT NULL,
  height TEXT,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  audio_url TEXT,
  video_url TEXT,
  services TEXT[] DEFAULT '{}',
  cities_served TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  -- Campos de preços (sem underscores)
  priceperhour TEXT,
  hasownlocation BOOLEAN DEFAULT false,
  acceptsclientlocation BOOLEAN DEFAULT false,
  acceptsmotel BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT now()
);

-- Tabela de especialidades/tags
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);

-- =========================================
-- 3. SISTEMA DE STORIES COMPLETO
-- =========================================

-- Tabela para solicitações de stories pagos
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

-- Tabela para stories ativos (após aprovação)
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

-- Tabela para conteúdo dos stories
CREATE TABLE IF NOT EXISTS created_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255), -- Nome da pessoa criando o story
    requester_whatsapp VARCHAR(20), -- WhatsApp da pessoa criando o story
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
-- 4. CONFIGURAR STORAGE
-- =========================================

-- Criar bucket de imagens (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 5. CONFIGURAR RLS (Row Level Security)
-- =========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros_pendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 6. POLÍTICAS LIBERAIS PARA DESENVOLVIMENTO
-- =========================================

-- Políticas para acompanhantes (acesso público)
DROP POLICY IF EXISTS "Permitir tudo acompanhantes" ON acompanhantes;
CREATE POLICY "Permitir tudo acompanhantes" ON acompanhantes FOR ALL USING (true);

-- Políticas para cadastros pendentes
DROP POLICY IF EXISTS "Permitir tudo cadastros_pendentes" ON cadastros_pendentes;
CREATE POLICY "Permitir tudo cadastros_pendentes" ON cadastros_pendentes FOR ALL USING (true);

-- Políticas para especialidades
DROP POLICY IF EXISTS "Permitir tudo especialidades" ON especialidades;
CREATE POLICY "Permitir tudo especialidades" ON especialidades FOR ALL USING (true);

-- Políticas para admin_users (mais restritiva)
DROP POLICY IF EXISTS "Permitir leitura admin_users" ON admin_users;
CREATE POLICY "Permitir leitura admin_users" ON admin_users FOR SELECT USING (true);

-- Políticas para story_requests
DROP POLICY IF EXISTS "Permitir tudo story_requests" ON story_requests;
CREATE POLICY "Permitir tudo story_requests" ON story_requests FOR ALL USING (true);

-- Políticas para active_stories
DROP POLICY IF EXISTS "Permitir tudo active_stories" ON active_stories;
CREATE POLICY "Permitir tudo active_stories" ON active_stories FOR ALL USING (true);

-- Políticas para created_stories
DROP POLICY IF EXISTS "Permitir tudo created_stories" ON created_stories;
CREATE POLICY "Permitir tudo created_stories" ON created_stories FOR ALL USING (true);

-- =========================================
-- 7. POLÍTICAS DE STORAGE
-- =========================================

-- Permitir todas as operações no bucket images
DROP POLICY IF EXISTS "Permitir upload público storage" ON storage.objects;
CREATE POLICY "Permitir upload público storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Permitir visualização pública storage" ON storage.objects;
CREATE POLICY "Permitir visualização pública storage" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Permitir atualização pública storage" ON storage.objects;
CREATE POLICY "Permitir atualização pública storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Permitir exclusão pública storage" ON storage.objects;
CREATE POLICY "Permitir exclusão pública storage" ON storage.objects
FOR DELETE USING (bucket_id = 'images');

-- =========================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =========================================

-- Índices para acompanhantes
CREATE INDEX IF NOT EXISTS idx_acompanhantes_verified ON acompanhantes(is_verified);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_available ON acompanhantes(is_available);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_featured ON acompanhantes(is_featured);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_location ON acompanhantes(location);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_email ON acompanhantes(email);

-- Índices para stories
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_created ON story_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_stories_companion ON active_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_active_stories_expires ON active_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_created ON created_stories(created_at DESC);

-- =========================================
-- 9. TRIGGERS PARA UPDATED_AT
-- =========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas que têm updated_at
DROP TRIGGER IF EXISTS update_acompanhantes_updated_at ON acompanhantes;
CREATE TRIGGER update_acompanhantes_updated_at
    BEFORE UPDATE ON acompanhantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_especialidades_updated_at ON especialidades;
CREATE TRIGGER update_especialidades_updated_at
    BEFORE UPDATE ON especialidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
-- 10. DADOS INICIAIS
-- =========================================

-- Inserir especialidades básicas
INSERT INTO especialidades (name) VALUES 
('Carinhosa'),
('Sensual'),
('Educada'),
('Discreta'),
('Atenciosa'),
('Comunicativa'),
('Romântica'),
('Divertida'),
('Inteligente'),
('Elegante')
ON CONFLICT (name) DO NOTHING;

-- Inserir usuário admin padrão (senha: admin123)
-- NOTA: Em produção, use uma senha hash real
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('admin@faixarosa.com', 'admin123', 'Administrador', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- 11. VERIFICAÇÃO FINAL
-- =========================================

SELECT 'Setup completo! Verificando tabelas criadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Verificando bucket de storage:' as status;
SELECT * FROM storage.buckets WHERE id = 'images';

SELECT 'Verificando especialidades:' as status;
SELECT COUNT(*) as total_especialidades FROM especialidades;

SELECT 'Verificando admin users:' as status;
SELECT email, name, role FROM admin_users;

SELECT '✅ SETUP CONCLUÍDO COM SUCESSO! ✅' as resultado;

-- =========================================
-- PRÓXIMOS PASSOS:
-- =========================================
-- 1. Configure as variáveis de ambiente:
--    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
--    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
--
-- 2. Teste o login admin: admin@faixarosa.com / admin123
--
-- 3. Teste o upload de imagens
--
-- 4. Teste o sistema de stories
-- ========================================= 