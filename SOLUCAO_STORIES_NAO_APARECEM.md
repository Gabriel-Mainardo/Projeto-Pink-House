# 🔧 Solução: Stories Não Aparecem no Admin

## 🚨 Problema Identificado

Os stories não estão aparecendo no painel admin porque **a tabela `created_stories` pode não existir no banco de dados** ou **não tem as colunas necessárias**.

## ✅ Solução Passo a Passo

### **1️⃣ Executar Script de Verificação**

1. Acesse o **Supabase Dashboard**
2. Vá em **"SQL Editor"** 
3. Execute o conteúdo do arquivo `sql/check_created_stories_table.sql`
4. Isso vai:
   - ✅ Verificar se a tabela existe
   - ✅ Mostrar a estrutura atual
   - ✅ Criar a tabela se não existir
   - ✅ Adicionar índices para performance

### **2️⃣ Testar o Sistema**

1. Acesse http://localhost:8084/
2. Clique no botão **"+"** para criar story
3. **Abra o Console do Navegador** (F12 → Console)
4. Complete o fluxo:
   - Escolha um plano
   - Crie conteúdo (foto/vídeo/texto)
   - Preencha **nome** e **WhatsApp**
   - Clique "Confirmar e Enviar Story"

### **3️⃣ Verificar Logs no Console**

Você deve ver logs como estes no console:

```
✅ Logs de Upload:
- "Botão clicado, iniciando upload..."
- "Iniciando upload do story..."
- "Upload iniciado, nome da acompanhante: [NOME]"
- "WhatsApp da acompanhante: [NÚMERO]"
- "Fazendo upload do arquivo..."
- "Arquivo enviado, URL: [URL]"
- "Salvando story no banco..."
- "Story salvo no banco com sucesso"
- "Mudando para tela de sucesso..."

✅ Logs do Admin:
- "🔄 Carregando stories criados..."
- "🔍 Buscando stories no banco..."
- "📋 Dados brutos do banco: [DADOS]"
- "📊 Quantidade de stories: [NÚMERO]"
```

### **4️⃣ Verificar no Painel Admin**

1. Acesse http://localhost:8084/admin-stories
2. Clique na aba **"📱 Stories Criados"**
3. Você deve ver o story criado
4. Clique em **"Detalhes"** para ver:
   - 👤 Informações do Solicitante (nome e WhatsApp)
   - 📸 Preview do story
   - ✅ Botões para aprovar/rejeitar

### **5️⃣ Possíveis Problemas e Soluções**

#### **Problema: Tabela não existe**
```sql
-- Execute no SQL Editor do Supabase:
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
```

#### **Problema: Colunas faltando**
```sql
-- Execute no SQL Editor do Supabase:
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS requester_name VARCHAR(255);

ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS requester_whatsapp VARCHAR(50);
```

#### **Problema: Erro de permissão**
- Verifique se o usuário atual tem permissão para acessar a tabela `created_stories`
- No Supabase, vá em **Authentication → Policies** e configure as políticas

### **6️⃣ Logs de Debug Adicionados**

O sistema agora tem logs detalhados que vão ajudar a identificar onde está o problema:

- **No Upload:** Logs em cada etapa do processo
- **No Service:** Logs da consulta ao banco de dados  
- **No Admin:** Logs do carregamento dos stories

### **7️⃣ Se Ainda Não Funcionar**

1. **Verifique os logs do console** para identificar erros específicos
2. **Execute uma consulta manual** no SQL Editor:
   ```sql
   SELECT * FROM created_stories ORDER BY created_at DESC;
   ```
3. **Verifique as permissões** no Supabase
4. **Teste com dados mock** primeiro

## 📋 Checklist de Verificação

- [ ] Tabela `created_stories` existe no Supabase
- [ ] Colunas `requester_name` e `requester_whatsapp` existem
- [ ] Logs aparecem no console durante upload
- [ ] Story salvo com sucesso (log: "Story salvo no banco com sucesso")
- [ ] Admin carrega stories (log: "📱 Stories carregados")
- [ ] Stories aparecem na aba "Stories Criados"

## 🆘 Se Precisar de Ajuda

Compartilhe os **logs do console** que apareceram durante o teste para identificar exatamente onde está o problema! 