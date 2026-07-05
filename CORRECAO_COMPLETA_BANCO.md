# 🛠️ **CORREÇÃO COMPLETA - BANCO DE DADOS FAIXA ROSA**

## 📋 **CHECKLIST DE PROBLEMAS IDENTIFICADOS**

### ❌ **1. VARIÁVEIS DE AMBIENTE**
- [ ] `VITE_SUPABASE_URL` não configurada
- [ ] `VITE_SUPABASE_ANON_KEY` não configurada
- [ ] Arquivo `.env` não existe ou está mal configurado

### ❌ **2. SCHEMA DO BANCO**
- [ ] Tabela `created_stories` pode não existir
- [ ] Tabela `story_requests` pode não existir  
- [ ] Tabela `active_stories` pode não existir
- [ ] Conflitos de nomenclatura nas colunas

### ❌ **3. BUCKET DE STORAGE**
- [ ] Bucket `images` pode não estar configurado
- [ ] Políticas de acesso RLS incorretas
- [ ] Pastas não criadas (`stories/`, `audios/`, `videos/`)

### ❌ **4. ROW LEVEL SECURITY (RLS)**
- [ ] Políticas restritivas demais
- [ ] Acesso público não permitido para algumas operações

---

## ✅ **SOLUÇÕES IMPLEMENTADAS**

### **1. ARQUIVO DE CONFIGURAÇÃO DE AMBIENTE**

**Criar arquivo `.env` na raiz do projeto:**
```env
# Configurações do Supabase
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Configurações de desenvolvimento
VITE_NODE_ENV=development
```

**Para Netlify (configurar no painel admin):**
```
VITE_SUPABASE_URL = sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY = sua_chave_anonima_aqui
```

### **2. SCHEMA COMPLETO DO BANCO**

#### **2.1. Verificar Tabelas Existentes:**
```sql
-- Execute no SQL Editor do Supabase:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### **2.2. Criar Tabelas Principais (se não existirem):**
```sql
-- Tabela de acompanhantes (versão final corrigida)
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
  -- Campos de preços (sem underscores)
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
```

#### **2.3. Sistema de Stories Completo:**
```sql
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

-- Tabela para stories ativos
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
    duration INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. CONFIGURAÇÃO DO STORAGE**

#### **3.1. Criar Bucket (se não existir):**
```sql
-- No SQL Editor do Supabase:
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

#### **3.2. Políticas de Storage:**
```sql
-- Política para INSERT (upload)
CREATE POLICY "Permitir upload público" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

-- Política para SELECT (visualização)
CREATE POLICY "Permitir visualização pública" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Política para UPDATE (atualização)
CREATE POLICY "Permitir atualização pública" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

-- Política para DELETE (exclusão)
CREATE POLICY "Permitir exclusão pública" ON storage.objects
FOR DELETE USING (bucket_id = 'images');
```

### **4. POLÍTICAS RLS (Row Level Security)**

#### **4.1. Acompanhantes (Acesso Público para Leitura):**
```sql
-- Habilitar RLS
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública acompanhantes" ON acompanhantes
FOR SELECT USING (true);

-- Permitir inserção autenticada
CREATE POLICY "Permitir inserção autenticada acompanhantes" ON acompanhantes
FOR INSERT WITH CHECK (true);

-- Permitir atualização autenticada
CREATE POLICY "Permitir atualização autenticada acompanhantes" ON acompanhantes
FOR UPDATE USING (true);
```

#### **4.2. Cadastros Pendentes:**
```sql
ALTER TABLE cadastros_pendentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso público cadastros" ON cadastros_pendentes
FOR ALL USING (true);
```

#### **4.3. Stories (Acesso Público):**
```sql
-- Story Requests
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso público story_requests" ON story_requests
FOR ALL USING (true);

-- Active Stories  
ALTER TABLE active_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso público active_stories" ON active_stories
FOR ALL USING (true);

-- Created Stories
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso público created_stories" ON created_stories
FOR ALL USING (true);
```

### **5. DADOS INICIAIS**

#### **5.1. Usuário Admin Padrão:**
```sql
-- Inserir admin padrão (senha: admin123)
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('admin@faixarosa.com', '$2a$10$example.hash.here', 'Administrador', 'super_admin')
ON CONFLICT (email) DO NOTHING;
```

#### **5.2. Especialidades Básicas:**
```sql
INSERT INTO especialidades (name) VALUES 
('Carinhosa'),
('Sensual'),
('Educada'),
('Discreta'),
('Atenciosa'),
('Comunicativa')
ON CONFLICT (name) DO NOTHING;
```

### **6. ÍNDICES PARA PERFORMANCE**

```sql
-- Índices para acompanhantes
CREATE INDEX IF NOT EXISTS idx_acompanhantes_verified ON acompanhantes(is_verified);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_available ON acompanhantes(is_available);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_featured ON acompanhantes(is_featured);
CREATE INDEX IF NOT EXISTS idx_acompanhantes_location ON acompanhantes(location);

-- Índices para stories
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_requests(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion ON created_stories(companion_id);
```

---

## 🧪 **TESTE FINAL**

### **1. Verificar Conexão:**
```javascript
// Teste no console do navegador:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### **2. Teste de Funcionalidades:**
- [ ] Login admin funcionando
- [ ] Cadastro de acompanhantes funcionando
- [ ] Upload de imagens funcionando
- [ ] Sistema de stories funcionando
- [ ] Aprovação de cadastros funcionando

### **3. Verificar Logs:**
- [ ] Sem erros no console
- [ ] Sem erros de RLS
- [ ] Sem erros de colunas inexistentes

---

## 🚀 **RESULTADO ESPERADO**

Após aplicar todas as correções:

✅ **Banco 100% funcional**
✅ **Todas as tabelas criadas**
✅ **Storage configurado**
✅ **RLS liberado adequadamente**
✅ **Variáveis de ambiente configuradas**
✅ **Performance otimizada com índices**

**📞 Precisa de ajuda?** Execute o SQL step-by-step no Supabase SQL Editor e teste cada funcionalidade individualmente. 