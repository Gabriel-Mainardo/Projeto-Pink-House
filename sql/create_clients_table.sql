CREATE TABLE clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para otimização
CREATE INDEX idx_clients_email ON clients(email);

-- Ativar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir que usuários autenticados vejam seus próprios perfis
CREATE POLICY "Clients can view their own profile" ON clients
  FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários autenticados atualizem seus próprios perfis
CREATE POLICY "Clients can update their own profile" ON clients
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Permitir que usuários autenticados criem seus próprios perfis
CREATE POLICY "Clients can create their own profile" ON clients
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que usuários autenticados deletem seus próprios perfis (opcional, dependendo da lógica de negócio)
CREATE POLICY "Clients can delete their own profile" ON clients
  FOR DELETE USING (auth.uid() = id);

-- Função para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
