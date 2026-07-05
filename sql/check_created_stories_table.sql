-- Script para verificar se a tabela created_stories existe e sua estrutura
-- Execute este script no painel SQL do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'created_stories'
) AS table_exists;

-- 2. Se a tabela existir, mostrar sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar quantos registros existem na tabela (se ela existir)
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'created_stories' AND table_schema = 'public')
    THEN (SELECT COUNT(*) FROM created_stories)::text
    ELSE 'Tabela não existe'
  END AS total_records;

-- 4. Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS created_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  companion_id VARCHAR(255) NOT NULL,
  requester_name VARCHAR(255),
  requester_whatsapp VARCHAR(50),
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

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at);

-- 6. Verificar novamente após criação
SELECT 'Tabela created_stories agora existe e está pronta para uso!' AS status; 