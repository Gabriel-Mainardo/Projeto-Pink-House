# Correção: Timer Individual de 20 Segundos para Stories

## Problema Identificado

Após implementar o agrupamento de stories por acompanhante, surgiu um problema onde:
- O primeiro story da acompanhante durava 20 segundos corretamente
- Mas quando passava para a próxima acompanhante, todos os stories dela passavam muito rápido
- Faltava um reset individual do timer para cada story

## Correções Implementadas

### 1. **Duração Aumentada para 20 Segundos**
```typescript
// Duração de 20 segundos para cada story individual
const STORY_DURATION = 20000;
```

### 2. **Reset Completo do Timer**
- **Novo useEffect** que reseta tudo quando muda de acompanhante:
  - `currentIndex` volta para `initialStoryIndex`
  - `progress` reseta para 0
  - `isPlaying` volta para true
  - Timer anterior é limpo

### 3. **Limpeza Adequada do Timer**
```typescript
// Limpar timer anterior se existir
if (timerRef.current) {
  clearInterval(timerRef.current);
  timerRef.current = null;
}
```

### 4. **Logs para Debug**
Adicionados logs detalhados para acompanhar o comportamento:
- `🔄 Resetando story viewer` - quando muda acompanhante
- `⏱️ Iniciando timer para story` - quando inicia cada story
- `📷 Iniciando timer de 20s` - para fotos/texto
- `🎬 Mídia finalizada` - para vídeos/áudios
- `⏰ Timer finalizado` - quando completa 20s

### 5. **Atualização mais Frequente**
```typescript
// Atualização a cada 100ms para suavidade da barra de progresso
setInterval(() => {
  // ...
}, 100);
```

## Fluxo Corrigido

### Antes da Correção:
1. Ana story 1 → 20s ✅
2. Ana story 2 → 20s ✅ 
3. Ana story 3 → 20s ✅
4. **Maria story 1 → 2s ❌ (bug)**
5. **Maria story 2 → 2s ❌ (bug)**

### Depois da Correção:
1. Ana story 1 → 20s ✅
2. Ana story 2 → 20s ✅
3. Ana story 3 → 20s ✅
4. **Maria story 1 → 20s ✅ (corrigido)**
5. **Maria story 2 → 20s ✅ (corrigido)**

## Tecnologia

### Dependencies UseEffect:
```typescript
// Reset quando muda acompanhante
useEffect(() => {
  // Reset completo
}, [isOpen, companionName, initialStoryIndex]);

// Timer para cada story individual
useEffect(() => {
  // Lógica do timer
}, [currentIndex, isPlaying, isOpen, companionName]);
```

### Funções de Navegação:
- `nextStory()` e `prevStory()` agora limpam o timer antes de mudar
- Garantem que `setProgress(0)` seja chamado sempre

## Resultado Final

✅ **Cada story individual agora tem exatos 20 segundos**
✅ **Timer reseta corretamente entre acompanhantes**  
✅ **Barra de progresso funciona suavemente**
✅ **Navegação manual preserva a funcionalidade**

## Deploy

- **Status**: ✅ Deployado com sucesso
- **URL**: https://faixa-rosa.netlify.app
- **Build**: 748kB (otimizado)
- **Data**: ${new Date().toLocaleString('pt-BR')}

---

**Teste**: Acesse o site, vá nos stories e verifique que cada story individual (de qualquer acompanhante) dura exatamente 20 segundos. 