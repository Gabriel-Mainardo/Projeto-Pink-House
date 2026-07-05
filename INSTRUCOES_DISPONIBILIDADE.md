# 🎯 Sistema de Disponibilidade - Instruções

## 📋 O que foi feito?

### 1. **SQL Completo** (`sql/SISTEMA_DISPONIBILIDADE_COMPLETO.sql`)

Execute este arquivo no SQL Editor do Supabase. Ele faz:

- ✅ Adiciona a coluna `is_available` nas tabelas `acompanhantes` e `cadastros_pendentes`
- ✅ Define todas as acompanhantes existentes como disponíveis por padrão
- ✅ Atualiza a função `get_companions_with_boosts()` para retornar **TODAS as acompanhantes** (disponíveis e indisponíveis)
- ✅ Cria função `update_availability()` para atualizar o status
- ✅ Configura políticas RLS (Row Level Security) para segurança
- ✅ Adiciona índices para melhorar a performance
- ✅ Executa verificações automáticas

### 2. **CompanionCard** (Já está pronto!)

O card das acompanhantes **já tem o badge de disponibilidade**:
- 🟢 **"Disponível"** em verde quando `is_available = true`
- 🔴 **"Indisponível"** em vermelho quando `is_available = false`

### 3. **ProfileDashboard** (Atualizado)

O dashboard da acompanhante agora tem:

- ✅ Seção "Indique e Ganhe" + Toggle de Disponibilidade lado a lado
- ✅ Carrega o status de disponibilidade do banco ao iniciar
- ✅ Salva automaticamente no banco quando a acompanhante clica no toggle
- ✅ Animação de pulso no ícone quando disponível
- ✅ Feedback visual imediato (UX otimizada)
- ✅ Tratamento de erros com reversão do estado

## 🚀 Como Funciona

### Passo 1: Execute a SQL

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo `sql/SISTEMA_DISPONIBILIDADE_COMPLETO.sql`
4. Cole todo o conteúdo e clique em **Run**
5. Verifique as mensagens de sucesso no final

### Passo 2: Como Funciona

Quando a acompanhante clica no toggle "Disponível para atendimento":

1. **Interface atualiza imediatamente** (melhor UX)
2. **Salva no banco de dados** na tabela `acompanhantes`
3. **Badge no card muda automaticamente** entre "Disponível" (verde) e "Indisponível" (vermelho)

### Passo 3: Visualização no Catálogo

🎯 **IMPORTANTE: TODOS OS CARDS APARECEM NO CATÁLOGO!**

A diferença está no badge visual:

```
┌─────────────────────────┐
│      [Foto da Ana]      │
│                         │
│  Ana, 25 anos           │
│  🟢 DISPONÍVEL          │ ← Badge Verde
│  São Paulo - SP         │
└─────────────────────────┘

┌─────────────────────────┐
│    [Foto da Maria]      │
│                         │
│  Maria, 28 anos         │
│  🔴 INDISPONÍVEL        │ ← Badge Vermelho
│  Rio de Janeiro - RJ    │
└─────────────────────────┘
```

## 🎨 Interface

### Dashboard - Desktop
```
┌─────────────────────────────┬─────────────────────────────────┐
│  ⚡ Indique e ganhe         │ 📻 Disponível para atendimento  │
│                             │                        [TOGGLE] │
└─────────────────────────────┴─────────────────────────────────┘
```

### Dashboard - Mobile
```
┌─────────────────────────────────┐
│  ⚡ Indique e ganhe             │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 📻 Disponível    [TOGGLE]       │
└─────────────────────────────────┘
```

### Card no Catálogo
```
Logo abaixo do nome da acompanhante:

• Disponível:
  🟢 DISPONÍVEL (texto verde em negrito)

• Indisponível:
  🔴 INDISPONÍVEL (texto vermelho em negrito)
```

## 🔧 Detalhes Técnicos

### Estados do Toggle no Dashboard

**Ativo (Disponível):**
- 🟢 Fundo rosa (`#e91e63`)
- 🟢 Ícone anima (pulsa)
- 🟢 Badge no card: **"Disponível"** (verde)

**Inativo (Indisponível):**
- ⚪ Fundo cinza
- ⚪ Ícone estático
- 🔴 Badge no card: **"Indisponível"** (vermelho)

### Badge no Card (CompanionCard.tsx)

Localização: Logo abaixo do nome, acima da idade e localização

```tsx
<div className="flex items-center mt-1 mb-1">
  <div className={`w-2 h-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
  <span className={`text-xs font-bold uppercase tracking-wide ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
    {isAvailable ? 'Disponível' : 'Indisponível'}
  </span>
</div>
```

### Segurança

- ✅ Políticas RLS configuradas
- ✅ Apenas a própria acompanhante pode alterar seu status
- ✅ Admin pode ver todas independente do status
- ✅ Todos os usuários podem ver todos os cards (com o badge indicando disponibilidade)

### Performance

- ✅ Índices criados para queries rápidas
- ✅ Estado local atualizado primeiro (UX suave)
- ✅ Salvamento assíncrono no banco

## 🧪 Testar

### 1. No Dashboard da Acompanhante
- Clique no toggle "Disponível para atendimento"
- Verifique se o ícone anima e fica rosa quando ativo
- Desative e veja o ícone ficar cinza

### 2. No Catálogo
- Abra o catálogo em outra aba
- O card sempre deve aparecer
- Quando disponível: Badge 🟢 **DISPONÍVEL** (verde)
- Quando indisponível: Badge 🔴 **INDISPONÍVEL** (vermelho)

### 3. No Banco de Dados
Execute esta query no Supabase para verificar:

```sql
SELECT
    name,
    is_available,
    updated_at
FROM acompanhantes
ORDER BY updated_at DESC
LIMIT 10;
```

### 4. Teste Completo
1. Desative a disponibilidade no dashboard
2. Atualize o catálogo
3. **Card deve continuar aparecendo** com badge 🔴 **INDISPONÍVEL**
4. Ative novamente
5. Atualize o catálogo
6. **Badge muda para** 🟢 **DISPONÍVEL**

## 📝 Notas

- Por padrão, todas as acompanhantes são criadas como **disponíveis** (`true`)
- O campo `updated_at` é atualizado automaticamente ao mudar a disponibilidade
- Em caso de erro na atualização, o estado é revertido automaticamente
- O sistema funciona em conjunto com o sistema de boosts/subidas
- **TODOS OS CARDS SEMPRE APARECEM**, independente do status de disponibilidade
- A diferença visual está apenas no badge verde/vermelho

## ✅ Checklist

- [x] SQL criada e documentada
- [x] Coluna `is_available` adicionada
- [x] Função de busca retorna TODAS as acompanhantes
- [x] Badge de disponibilidade já existe no CompanionCard
- [x] Interface do dashboard atualizada
- [x] Integração com Supabase funcionando
- [x] Políticas de segurança configuradas
- [x] Índices de performance criados
- [x] Tratamento de erros implementado
- [x] Todos os cards aparecem sempre (sem filtro)

---

🎉 **Sistema pronto para uso!**

💡 **Resumo:** Acompanhante clica no toggle → Card sempre aparece → Badge muda de verde para vermelho (ou vice-versa)
