# 🚀 Configuração de Aprovação Automática

Este guia explica como configurar o sistema para aprovar cadastros automaticamente.

## 📋 O que foi alterado?

1. **RegisterSuccess.tsx**: Agora salva diretamente na tabela `acompanhantes` (sem aprovação manual)
2. **Dashboard.tsx**: Removido banner de "Cadastro Pendente"
3. **SQL**: Criado script para adicionar campos necessários e configurar permissões

## 🔧 Passo a Passo

### 1. Executar SQL no Supabase

Acesse o **SQL Editor** do seu projeto no Supabase e execute o arquivo:

```
sql/setup_auto_approval.sql
```

Este script irá:
- ✅ Adicionar todos os campos necessários na tabela `acompanhantes`
- ✅ Criar índices para melhorar performance
- ✅ Configurar políticas RLS (Row Level Security) para permitir:
  - SELECT público (para o catálogo)
  - INSERT público (para registro)
  - UPDATE do próprio perfil
- ✅ Criar trigger para atualizar `updated_at` automaticamente

### 2. Verificar campos da tabela

Após executar o SQL, verifique se a tabela `acompanhantes` possui os seguintes campos:

**Campos obrigatórios:**
- `id` (BIGINT) - Chave primária
- `name` (TEXT) - Nome artístico
- `email` (TEXT) - Email da acompanhante
- `phone` (TEXT) - Telefone/WhatsApp
- `age` (INTEGER) - Idade
- `location` (TEXT) - Cidade - Bairro
- `image` (TEXT) - URL da foto de perfil
- `gallery` (TEXT[]) - Array de URLs das fotos
- `description` (TEXT) - Descrição do perfil
- `priceperhour` (TEXT) - Valor por hora

**Campos adicionais:**
- `display_name` (TEXT) - Nome de exibição
- `cover_photo` (TEXT) - Foto de capa
- `thirty_minutes` (TEXT) - Valor 30 minutos
- `pernoite` (TEXT) - Valor pernoite
- `videos` (TEXT[]) - Array de URLs de vídeos
- `audio_url` (TEXT) - URL do áudio
- `tags` (TEXT[]) - Especialidades/Tags
- `cities_served` (TEXT[]) - Cidades atendidas
- `services` (TEXT[]) - Serviços oferecidos
- `hasownlocation` (BOOLEAN) - Tem local próprio
- `acceptsclientlocation` (BOOLEAN) - Aceita local do cliente
- `acceptsmotel` (BOOLEAN) - Aceita motel
- `is_active` (BOOLEAN) - Perfil ativo
- `is_verified` (BOOLEAN) - Perfil verificado
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

### 3. Testar o fluxo de cadastro

1. Acesse a página de registro
2. Preencha os dados básicos (email, senha, nome artístico)
3. Complete as informações de localização
4. Adicione uma foto (opcional)
5. Configure os valores
6. Clique em "Finalizar Cadastro"

O sistema irá:
1. ✅ Salvar diretamente na tabela `acompanhantes`
2. ✅ Fazer login automático
3. ✅ Redirecionar para o dashboard
4. ✅ Mostrar tutorial de boas-vindas (primeira vez)
5. ✅ Perfil já estará ATIVO e visível no catálogo

## 🐛 Solução de Problemas

### Erro: "relation acompanhantes does not exist"
**Solução:** Criar a tabela acompanhantes no Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS acompanhantes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  age INTEGER,
  location TEXT,
  image TEXT,
  gallery TEXT[],
  description TEXT,
  priceperhour TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Erro: "permission denied for table acompanhantes"
**Solução:** Execute novamente a parte de políticas RLS do script `setup_auto_approval.sql`

### Erro: "Dados de cadastro incompletos"
**Verificar:**
1. Abra o console do navegador (F12)
2. Veja os logs para entender quais dados estão faltando
3. O RegisterSuccess.tsx agora mostra logs detalhados:
   - `📦 Dados de registro:` - Mostra todos os dados do localStorage
   - `💾 Salvando na tabela acompanhantes:` - Mostra dados antes de salvar
   - `✅ Cadastro salvo com sucesso:` - Confirma sucesso
   - `❌ Erro ao salvar cadastro:` - Mostra erro se houver

## 📊 Diferenças: Antes vs Agora

### ANTES (Com Aprovação Manual):
1. Cadastro → `cadastros_pendentes`
2. Admin precisa aprovar
3. Após aprovação → `acompanhantes`
4. Perfil fica visível

### AGORA (Aprovação Automática):
1. Cadastro → `acompanhantes` **direto**
2. ~~Admin precisa aprovar~~ ❌
3. Perfil **já fica visível imediatamente** ✅
4. Dashboard não mostra banner de "pendente"

## 🎉 Pronto!

Seu sistema agora está configurado para aprovar cadastros automaticamente. As acompanhantes podem se cadastrar e começar a receber contatos imediatamente!

## ⚠️ Observação de Segurança

Em produção, considere adicionar:
- Verificação de email
- Captcha no formulário de registro
- Moderação de conteúdo (fotos/descrição)
- Sistema de denúncias
- Verificação de identidade opcional
