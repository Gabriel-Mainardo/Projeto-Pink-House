# 🔧 Teste e Correção das Políticas do Bucket

## 🚨 POSSÍVEL PROBLEMA

Se o bucket `images` existe mas ainda dá erro 400/404, pode ser um problema de **políticas de acesso (RLS)**.

## ✅ SOLUÇÃO: Verificar e Corrigir Políticas

### 1. Acesse o Painel do Supabase
1. Vá para: https://supabase.com/dashboard  
2. Selecione seu projeto: **lavzkjjnrgooajzganrh**
3. Vá para **Storage** → clique no bucket **images**
4. Clique na aba **Policies**

### 2. Verificar Políticas Existentes
Se houver políticas existentes que podem estar bloqueando, **EXCLUA TODAS** e recrie conforme abaixo.

### 3. Criar Novas Políticas (Copie e Cole no SQL Editor)

#### Vá para **SQL Editor** e execute estes comandos:

```sql
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública" ON storage.objects;

-- 2. CRIAR POLÍTICAS LIBERAIS PARA DESENVOLVIMENTO
CREATE POLICY "public_access_select" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "public_access_insert" ON storage.objects  
FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "public_access_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

CREATE POLICY "public_access_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'images');
```

### 4. Verificar Configuração do Bucket

No painel **Storage**, clique no bucket **images** e verifique:
- ✅ **Public bucket** deve estar MARCADO
- ✅ **File size limit**: 50MB ou maior
- ✅ **Allowed MIME types**: Deve incluir pelo menos:
  ```
  image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,audio/mp3,audio/wav
  ```

### 5. Se AINDA NÃO FUNCIONAR - Recriar o Bucket

Se mesmo assim não funcionar, **EXCLUA** o bucket e **RECRIE**:

1. No Storage, clique nos 3 pontinhos do bucket **images** → **Delete bucket**
2. Confirme a exclusão
3. Clique em **Create a new bucket**
4. Configure:
   - **Name**: `images`
   - **Public bucket**: ✅ **MARCAR**
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/*,video/*,audio/*`
5. Depois execute novamente as políticas do **passo 3**

### 6. Teste Final

Após aplicar as correções:
1. **Limpe o cache do navegador** (Ctrl+F5)
2. Acesse: https://faixa-rosa.netlify.app/cadastro
3. Tente fazer upload de uma foto
4. Verifique no console do navegador (F12) se ainda aparecem erros

## 🔍 LOGS PARA ANÁLISE

Se ainda houver erro, abra o **Console do navegador** (F12) e copie:
- A mensagem de erro completa
- A URL que está sendo chamada
- O status code retornado

Isso nos ajudará a identificar se é problema de:
- ❌ Políticas de acesso
- ❌ Configuração do bucket  
- ❌ Variáveis de ambiente
- ❌ Outro problema

## ⚡ RESULTADO ESPERADO

Após a correção, o upload deve funcionar e você deve ver:
- ✅ Arquivo enviado com sucesso
- ✅ Preview da imagem na tela
- ✅ URL gerada: `https://lavzkjjnrgooajzganrh.supabase.co/storage/v1/object/public/images/gallery/...` 