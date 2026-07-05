# Evento locationConfirmed

## Descrição
O evento personalizado `locationConfirmed` é disparado sempre que o usuário confirma sua localização no sistema, seja através de detecção automática ou seleção manual.

## Quando é disparado
- ✅ Quando a localização é detectada automaticamente (GPS)
- ✅ Quando o usuário confirma a cidade detectada automaticamente
- ✅ Quando o usuário seleciona uma cidade manualmente
- ✅ Quando o sistema usa fallback para cidade mais próxima (em caso de erro)

## Estrutura do evento
```javascript
{
  detail: {
    city: string,           // Nome da cidade (ex: "Recife")
    state: string,          // Estado (ex: "PE") 
    fullName: string,       // Nome completo (ex: "Recife - PE")
    latitude: number,       // Coordenada de latitude
    longitude: number,      // Coordenada de longitude
    isManualSelection: boolean,  // true = seleção manual, false = auto-detecção
    isFallback?: boolean,   // true apenas quando é fallback por erro
    timestamp: string       // ISO timestamp do evento
  }
}
```

## Como usar

### 1. Adicionar listener simples
```javascript
window.addEventListener('locationConfirmed', (event) => {
  console.log('Localização confirmada:', event.detail);
  
  // Sua lógica aqui
  const { city, state, isManualSelection } = event.detail;
  
  if (isManualSelection) {
    console.log(`Usuário selecionou manualmente: ${city} - ${state}`);
  } else {
    console.log(`Localização detectada automaticamente: ${city} - ${state}`);
  }
});
```

### 2. Integração com Google Analytics
```javascript
window.addEventListener('locationConfirmed', (event) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'location_confirmed', {
      event_category: 'user_location',
      event_label: event.detail.fullName,
      custom_parameter_city: event.detail.city,
      custom_parameter_state: event.detail.state,
      custom_parameter_manual: event.detail.isManualSelection
    });
  }
});
```

### 3. Integração com Facebook Pixel
```javascript
window.addEventListener('locationConfirmed', (event) => {
  if (typeof fbq !== 'undefined') {
    fbq('trackCustom', 'LocationConfirmed', {
      city: event.detail.city,
      state: event.detail.state,
      location_method: event.detail.isManualSelection ? 'manual' : 'automatic'
    });
  }
});
```

### 4. Recarregar dados baseados na localização
```javascript
window.addEventListener('locationConfirmed', (event) => {
  // Recarregar lista de acompanhantes da nova cidade
  refetchCompanions(event.detail.city, event.detail.state);
  
  // Atualizar filtros
  updateLocationFilters(event.detail);
  
  // Salvar no estado global
  setUserLocation(event.detail);
});
```

## Implementação atual
O evento está implementado nos seguintes locais:

1. **LocationContext.tsx** - `confirmCitySelection()`: Quando usuário confirma seleção manual
2. **LocationContext.tsx** - `getCurrentLocation()`: Quando localização é detectada automaticamente
3. **App.tsx** - Listener de exemplo configurado

## Arquivos modificados
- `/src/contexts/LocationContext.tsx` - Adicionado disparo do evento
- `/src/App.tsx` - Adicionado listener de exemplo
- `/EVENTO_LOCATION_CONFIRMED.md` - Esta documentação

## Exemplo de saída no console
```
🌍 Evento locationConfirmed disparado: {
  city: "Recife",
  state: "PE", 
  fullName: "Recife - PE",
  latitude: -8.047562,
  longitude: -34.877,
  isManualSelection: false,
  timestamp: "2025-07-22T15:30:45.123Z"
}

🚀 App.tsx - Evento locationConfirmed recebido: {
  city: "Recife",
  state: "PE",
  fullName: "Recife - PE", 
  latitude: -8.047562,
  longitude: -34.877,
  isManualSelection: false,
  timestamp: "2025-07-22T15:30:45.123Z"
}
```