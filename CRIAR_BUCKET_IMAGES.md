# 🚨 SOLUÇÃO: Criar Bucket 'images' no Supabase

## ❌ PROBLEMA IDENTIFICADO

O erro mostra: `{statusCode: '404', error: 'Bucket not found', message: 'Bucket not found'}`

Isso significa que o bucket `images` não existe no seu projeto Supabase.

## ✅ SOLUÇÃO RÁPIDA

### 1. Acesse o Painel do Supabase
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto: **lavzkjjnrgooajzganrh**

### 2. Criar o Bucket 'images'
1. No menu lateral, clique em **Storage**
2. Clique em **Create a new bucket**
3. Configure exatamente assim:
   ```
   Name: images
   Public bucket: ✅ (MARCAR)
   File size limit: 50MB
   Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/mov,audio/mp3,audio/wav,audio/webm
   ```
4. Clique em **Create bucket**

### 3. Configurar Políticas (RLS)
Depois de criar o bucket, clique nele e vá para **Policies**:

#### Política 1: Permitir Visualização Pública
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

#### Política 2: Permitir Upload
```sql
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');
```

#### Política 3: Permitir Exclusão
```sql
CREATE POLICY "Allow delete" ON storage.objects
FOR DELETE USING (bucket_id = 'images');
```

## 🧪 TESTAR APÓS CRIAÇÃO

1. Acesse: https://faixa-rosa.netlify.app/cadastro
2. Tente fazer upload de uma foto
3. O erro deve desaparecer!

## 📝 ESTRUTURA FINAL DO BUCKET

Após criado, o bucket terá estas pastas automaticamente:
```
images/
├── gallery/          # Fotos das galerias
├── stories/          # Imagens dos stories  
├── audios/          # Arquivos de áudio
└── videos/          # Arquivos de vídeo
```

## ⚠️ IMPORTANTE

- O bucket DEVE se chamar exatamente `images`
- DEVE estar marcado como público
- As políticas são essenciais para funcionar

Após criar o bucket, teste novamente o upload no formulário! 