# 🚀 Guia Rápido: Configurar Upload de Imagens

## ✅ O que foi implementado

- **Componente ImageUpload**: Drag & drop para upload de múltiplas imagens
- **Galeria no cadastro**: Substitui o campo de URL por upload direto
- **Preview em tempo real**: Visualização das imagens antes do envio
- **Validações**: Tipos de arquivo, tamanho e quantidade máxima
- **Primeira imagem = Foto principal**: Sistema automático

## 🔧 Configuração necessária no Supabase

### 1. Criar o bucket `images`
```
1. Vá para Storage no painel do Supabase
2. Create new bucket → Nome: "images" → Public: ✅
3. File size limit: 5MB
```

### 2. Adicionar coluna `gallery` nas tabelas
```sql
-- No SQL Editor do Supabase:
ALTER TABLE acompanhantes ADD COLUMN gallery TEXT[] DEFAULT '{}';
ALTER TABLE cadastros_pendentes ADD COLUMN gallery TEXT[] DEFAULT '{}';
```

### 3. Configurar políticas do Storage
```sql
-- Permitir visualização pública
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Permitir upload para formulário
CREATE POLICY "Allow anonymous upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');
```

## 🎯 Como usar

1. **Usuário acessa**: `/cadastro`
2. **Arrasta imagens** para a área de upload
3. **Preview automático** das imagens selecionadas
4. **Primeira imagem** vira foto principal
5. **Formulário envia** com galeria completa

## 📱 Funcionalidades

- ✅ **Drag & Drop**: Arraste arquivos para upload
- ✅ **Múltiplas imagens**: Até 6 fotos por galeria  
- ✅ **Validação automática**: JPG, PNG, WebP até 5MB
- ✅ **Preview**: Visualização antes do envio
- ✅ **Remoção**: Clique no X para remover foto
- ✅ **Responsivo**: Funciona no mobile e desktop

## 🌐 Deploy automático

O Netlify já vai processar automaticamente as mudanças!
Site: https://faixa-rosa.netlify.app/cadastro

## 🔍 Para testar

1. Acesse o formulário de cadastro
2. Adicione pelo menos 1 imagem
3. Preencha os dados obrigatórios
4. Envie o cadastro
5. Verifique no painel admin se as imagens aparecem

---

**Próximos passos**: Configure o bucket no Supabase seguindo os passos acima! 🚀 