-- =========================================
-- SCRIPT DE CORREÇÃO FINAL - FAIXA ROSA
-- =========================================
-- Execute este script no SQL Editor do Supabase para corrigir TODOS os problemas

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 'Verificando tabelas existentes...' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. CRIAR TABELAS FUNDAMENTAIS

-- Acompanhantes (com colunas corrigidas)
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
  -- CORRIGIDO: nomes corretos das colunas (sem underscores)
  priceperhour TEXT,
  hasownlocation BOOLEAN DEFAULT false,
  acceptsclientlocation BOOLEAN DEFAULT false,
  acceptsmotel BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Cadastros pendentes
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
  priceperhour TEXT,
  hasownlocation BOOLEAN DEFAULT false,
  acceptsclientlocation BOOLEAN DEFAULT false,
  acceptsmotel BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT now()
);

-- Especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Sistema de Stories Completo
CREATE TABLE IF NOT EXISTS story_requests (
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

CREATE TABLE IF NOT EXISTS created_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255),
    requester_whatsapp VARCHAR(20),
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONFIGURAR STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;

-- 4. CONFIGURAR RLS (POLÍTICAS LIBERAIS PARA FUNCIONAMENTO)
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros_pendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS RESTRITIVAS EXISTENTES
DROP POLICY IF EXISTS "Permitir tudo acompanhantes" ON acompanhantes;
DROP POLICY IF EXISTS "Permitir tudo cadastros_pendentes" ON cadastros_pendentes;
DROP POLICY IF EXISTS "Permitir tudo especialidades" ON especialidades;
DROP POLICY IF EXISTS "Permitir tudo story_requests" ON story_requests;
DROP POLICY IF EXISTS "Permitir tudo created_stories" ON created_stories;

-- CRIAR POLÍTICAS LIBERAIS (FUNCIONAIS)
CREATE POLICY "Acesso total acompanhantes" ON acompanhantes FOR ALL USING (true);
CREATE POLICY "Acesso total cadastros" ON cadastros_pendentes FOR ALL USING (true);
CREATE POLICY "Acesso total especialidades" ON especialidades FOR ALL USING (true);
CREATE POLICY "Acesso total story_requests" ON story_requests FOR ALL USING (true);
CREATE POLICY "Acesso total created_stories" ON created_stories FOR ALL USING (true);

-- 5. POLÍTICAS DE STORAGE (LIBERAIS)
DROP POLICY IF EXISTS "Upload público" ON storage.objects;
DROP POLICY IF EXISTS "Visualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Exclusão pública" ON storage.objects;

CREATE POLICY "Storage upload total" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Storage view total" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Storage update total" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Storage delete total" ON storage.objects FOR DELETE USING (bucket_id = 'images');

-- 6. INSERIR DADOS BÁSICOS
INSERT INTO especialidades (name) VALUES 
('Carinhosa'),
('Sensual'),
('Educada'),
('Discreta'),
('Atenciosa'),
('Comunicativa')
ON CONFLICT (name) DO NOTHING;

-- 7. VERIFICAÇÃO FINAL
SELECT 'CORREÇÃO CONCLUÍDA! Verificando resultado:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT * FROM storage.buckets WHERE id = 'images';

-- INSTRUÇÕES FINAIS:
-- 1. Configure as variáveis de ambiente:
--    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
--    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
-- 2. Teste todas as funcionalidades
-- 3. Verifique o console do navegador para erros 