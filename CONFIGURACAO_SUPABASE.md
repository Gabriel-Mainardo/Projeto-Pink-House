# 🔧 Configuração do Supabase

## Problema Identificado e Solucionado

O site estava apresentando tela branca após o carregamento devido à falta de configuração das variáveis de ambiente do Supabase.

## ✅ Solução Implementada

1. **Modo Demo**: O site agora funciona em modo demo com dados mockados quando as variáveis do Supabase não estão configuradas
2. **Fallback Inteligente**: O código detecta automaticamente se está em modo demo ou produção
3. **Dados de Exemplo**: Fornece dados de exemplo para testar a interface

## 🚀 Como Configurar o Supabase (Produção)

### 1. Criar Projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma nova conta ou faça login
- Crie um novo projeto

### 2. Obter Credenciais
No painel do Supabase:
- Vá em **Settings** → **API**
- Copie:
  - **Project URL** (VITE_SUPABASE_URL)
  - **anon public** key (VITE_SUPABASE_ANON_KEY)

### 3. Criar Arquivo .env
Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
VITE_APP_ENV=production
```

### 4. Configurar Banco de Dados
Execute os scripts SQL encontrados na pasta `sql/` para criar as tabelas necessárias:
- `SETUP_COMPLETO_BANCO.sql`
- `stories_structure_only.sql`
- `create_ads_table.sql`

## 🎭 Modo Demo Atual

O site está funcionando em modo demo com:
- ✅ Tela de carregamento
- ✅ Verificação de idade
- ✅ Dados mockados de acompanhantes
- ✅ Interface completa funcional

## 📱 Funcionalidades Disponíveis

### Públicas
- [x] Página inicial com splash screen
- [x] Catálogo de acompanhantes
- [x] Perfis individuais
- [x] Sistema de cadastro
- [x] Login de usuário

### Administrativas
- [x] Login de admin
- [x] Dashboard administrativo
- [x] Gerenciamento de cadastros
- [x] Sistema de stories
- [x] Gerenciamento de anúncios

## 🔍 Verificação

Para verificar se está funcionando:
1. Abra o navegador em `http://localhost:5173`
2. Verifique o console do navegador (F12)
3. Deve aparecer: "🎭 Modo demo - retornando dados mockados"

## 🚨 Próximos Passos

1. Configure as credenciais do Supabase no arquivo `.env`
2. Execute os scripts SQL no banco
3. Teste todas as funcionalidades
4. Faça deploy para produção

## 📞 Suporte

Se precisar de ajuda com a configuração do Supabase, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- Arquivos de exemplo na pasta `sql/`
- Logs no console do navegador



