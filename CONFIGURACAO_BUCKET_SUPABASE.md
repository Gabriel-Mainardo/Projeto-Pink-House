# Configuração do Bucket de Imagens no Supabase Storage

## 1. Criar o Bucket

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique em **Create a new bucket**
5. Configure o bucket:
   - **Name**: `images`
   - **Public bucket**: ✅ (marcado)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

## 2. Configurar Políticas de Acesso (RLS)

No painel do Storage, clique no bucket `images` e vá para a aba **Policies**.

### Política para Upload (INSERT)
```sql
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

### Política para Visualização (SELECT)
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

### Política para Exclusão (DELETE)
```sql
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

## 3. Estrutura de Pastas Recomendada

O sistema criará automaticamente as seguintes pastas:
- `/gallery/` - Imagens das galerias das profissionais
- `/profiles/` - Fotos de perfil (opcional)

## 4. Configuração das Tabelas

Certifique-se de que suas tabelas tenham os campos para galeria:

### Tabela `acompanhantes`
```sql
ALTER TABLE acompanhantes 
ADD COLUMN gallery TEXT[] DEFAULT '{}';
```

### Tabela `cadastros_pendentes`
```sql
ALTER TABLE cadastros_pendentes 
ADD COLUMN gallery TEXT[] DEFAULT '{}';
```

## 5. Teste a Configuração

1. Execute o projeto localmente: `npm run dev`
2. Acesse: http://localhost:8082/cadastro
3. Tente fazer upload de uma imagem
4. Verifique se a imagem aparece no bucket do Supabase

## 6. Troubleshooting

### Erro: "PolicyNotFound"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se de que o bucket está público

### Erro: "BucketNotFound"
- Verifique se o bucket `images` foi criado
- Confirme o nome exato do bucket

### Erro: "StorageApiError"
- Verifique as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Confirme se as políticas permitem a operação

## 7. Configuração no Netlify

No painel do Netlify, vá em **Site settings > Environment variables** e configure:

- `VITE_SUPABASE_URL`: Sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY`: Sua chave anônima do Supabase

Após configurar, faça um novo deploy do site.

## 8. Limitações Atuais

- Máximo 6 imagens por galeria
- Tamanho máximo: 5MB por imagem
- Formatos aceitos: JPG, PNG, WebP
- Upload apenas para usuários autenticados (no formulário de cadastro)

## 9. Próximas Melhorias

- [ ] Compressão automática de imagens
- [ ] Redimensionamento para múltiplos tamanhos
- [ ] Sistema de moderação de imagens
- [ ] Watermark automático 