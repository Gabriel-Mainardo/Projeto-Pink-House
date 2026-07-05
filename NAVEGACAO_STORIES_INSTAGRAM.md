# Sistema de Navegação de Stories - Estilo Instagram

## Como Funciona Agora

### ✅ Comportamento Correto (Instagram-like)

1. **Agrupamento por Acompanhante**
   - Stories são agrupados por `requester_name` (nome da acompanhante)
   - Cada acompanhante pode ter múltiplos stories em sequência
   - Exemplo: Ana Silva tem 3 stories, Maria Santos tem 2 stories

2. **Navegação Lateral**
   - **Clique direita/esquerda**: Navega entre stories da MESMA acompanhante
   - **Acabaram os stories**: Vai para a PRÓXIMA acompanhante
   - **Primeiro story + clique esquerda**: Vai para acompanhante ANTERIOR

3. **Progressão dos Stories**
   - Cada story dura 8 segundos (ou duração do vídeo/áudio)
   - Barra de progresso no topo mostra andamento
   - Auto-avança para próximo story da mesma pessoa
   - Quando acabam, vai para próxima acompanhante

## Estrutura Técnica

### Backend (`storiesService.ts`)
```javascript
// Agrupamento por acompanhante
const storiesByCompanion = data.reduce((acc, story) => {
  const companionKey = story.requester_name || 'Acompanhante';
  
  if (!acc[companionKey]) {
    acc[companionKey] = {
      companion_name: companionKey,
      stories: []
    };
  }
  
  acc[companionKey].stories.push(story);
  return acc;
}, {});
```

### Frontend (`StoryViewer.tsx`)
```javascript
const nextStory = () => {
  // Tem mais stories desta acompanhante?
  if (currentIndex < stories.length - 1) {
    setCurrentIndex(prev => prev + 1); // Próximo story
  } else {
    // Ir para próxima acompanhante ou fechar
    navigateToNextCompanion();
  }
};
```

## Exemplo Prático

### Cenário de Teste
- **Ana Silva**: 3 stories (foto, foto, vídeo)
- **Maria Santos**: 2 stories (foto, foto)  
- **Julia Costa**: 1 story (foto com link)

### Fluxo de Navegação
1. Usuário clica em "Ana Silva"
2. Mostra story 1/3 de Ana
3. Clique direita → story 2/3 de Ana
4. Clique direita → story 3/3 de Ana
5. Clique direita → story 1/2 de Maria
6. Auto-avança → story 2/2 de Maria
7. Auto-avança → story 1/1 de Julia
8. Auto-avança → Fecha (fim dos stories)

## Diferenças do Sistema Anterior

### ❌ Sistema Antigo (Problemático)
- Cada imagem era um "story" separado
- Navegação lateral mudava de acompanhante imediatamente
- Stories passavam muito rápido
- Não tinha agrupamento por pessoa

### ✅ Sistema Novo (Instagram-like)
- Stories agrupados por acompanhante
- Navegação dentro dos stories da mesma pessoa
- Progressão natural e controlada
- Experiência familiar para usuários

## Configurações

### Duração dos Stories
- **Fotos/Texto**: 8 segundos
- **Vídeos**: Duração natural do vídeo
- **Áudios**: Duração natural do áudio

### Controles Disponíveis
- **Clique lateral**: Navegação manual
- **Barra de progresso**: Indicador visual
- **Botão fechar**: Sair a qualquer momento
- **Links**: Botões de ação nos stories

## Logs de Debug

O sistema inclui logs detalhados:
```
🔄 Clique lado direito - currentIndex: 0, total: 3
✅ Navegando para próximo story
👤 Ana Silva: 3 stories
🔄 Indo para próxima acompanhante: Maria Santos
```

## Script de Teste

Use o arquivo `TESTE_AGRUPAMENTO_STORIES.sql` para criar dados de teste e verificar o agrupamento correto dos stories por acompanhante. 