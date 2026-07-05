# 🔗 Funcionalidade de Links nos Stories

## Como Funciona

A nova funcionalidade permite que as acompanhantes adicionem links aos seus stories que direcionam os visualizadores para seu WhatsApp ou perfil.

## Fluxo da Funcionalidade

### 1. Criação do Story
- Acompanhante cria o story normalmente (foto, vídeo, áudio ou texto)
- Preenche nome e WhatsApp
- Clica em "Confirmar e Enviar Story"

### 2. Modal de Link (NOVO)
- Após o upload, aparece o modal "Adicionar Link no Story"
- Duas opções disponíveis:
  - **WhatsApp**: Link direto para o WhatsApp
  - **Link Personalizado**: URL do perfil ou site

### 3. Preenchimento do Link
- **Para WhatsApp**:
  - Número do WhatsApp: (11) 99999-9999
  - Texto do botão (opcional): "Chamar no WhatsApp"
  
- **Para Link Personalizado**:
  - URL do Link: https://meusite.com/perfil
  - Texto do botão: "Ver meu perfil"

### 4. Preview
- Mostra como o botão vai aparecer no story
- Visualização em tempo real das mudanças

### 5. Finalização
- Botão "Continuar" salva as informações
- Botão "Pular (sem link)" prossegue sem link
- Vai para a tela de sucesso

## Como Aparece no Story

### Visualização
- Botão rosa com gradiente no centro inferior do story
- Ícone + texto personalizado
- 📱 para WhatsApp ou 🔗 para links personalizados

### Funcionalidade
- **WhatsApp**: Abre o WhatsApp Web/App com o número
- **Link Personalizado**: Abre o link em nova aba
- URLs sem protocolo recebem "https://" automaticamente

## Banco de Dados

### Novas Colunas na Tabela `created_stories`:
- `story_link_url`: URL do link (WhatsApp ou personalizado)
- `story_link_text`: Texto que aparece no botão
- `link_type`: Tipo do link ('whatsapp' ou 'custom')

### Script SQL
Execute o arquivo `ADICIONAR_COLUNAS_LINK_STORIES.sql` no Supabase.

## Exemplos de Uso

### WhatsApp
- **URL**: 11999999999
- **Texto**: "Chamar no WhatsApp"
- **Resultado**: Botão que abre https://wa.me/11999999999

### Link Personalizado
- **URL**: https://meusite.com/perfil
- **Texto**: "Ver meu perfil"
- **Resultado**: Botão que abre o link em nova aba

## Benefícios

1. **Para Acompanhantes**:
   - Facilita direcionamento de clientes
   - Aumenta conversões
   - Profissionaliza a apresentação

2. **Para Clientes**:
   - Acesso direto ao contato
   - Experiência mais fluida
   - Confiança aumentada

3. **Para o Negócio**:
   - Mais engajamento nos stories
   - Facilita conversões
   - Diferencial competitivo

## Interface

- Modal com design consistente (gradiente rosa)
- Seleção visual entre opções
- Preview em tempo real
- Explicações claras
- Opção de pular se não quiser link

## Integração

A funcionalidade está integrada com:
- ✅ Criação de stories
- ✅ Visualização de stories
- ✅ Sistema de banco de dados
- ✅ Interface administrativa

## Status

🟢 **FUNCIONALIDADE COMPLETA E ATIVA** 