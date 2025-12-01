# Hooks de Event Listeners - Organização

Este documento explica a organização dos event listeners no projeto Chrono Odyssey Map.

## Estrutura Organizada

### 1. `useMapEventListeners.ts`
**Responsabilidade**: Gerencia todos os event listeners principais do mapa Leaflet.

**Eventos gerenciados**:
- `contextmenu`: Clique direito no mapa para adicionar marcadores
- `popupopen`: Abertura de popups (para botão de remover marcadores)
- `resize`: Redimensionamento da janela

**Características**:
- Centraliza todos os event listeners do mapa
- Gerencia cleanup automático
- Fornece funções para adicionar/remover listeners customizados
- Verifica permissões de admin automaticamente

### 2. `useCustomEvents.ts`
**Responsabilidade**: Gerencia eventos customizados entre componentes.

**Eventos gerenciados**:
- `centerOnMarker`: Centraliza o mapa em um marcador específico

**Características**:
- Usa `CustomEvent` para comunicação entre componentes
- Fornece feedback visual (popup temporário)
- Animação suave ao centralizar

### 3. `useAdminActions.ts`
**Responsabilidade**: Fornece funções de ação para componentes admin.

**Funções**:
- `centerOnMarker`: Dispara evento para centralizar no marcador

**Características**:
- Hook simples e focado
- Reutilizável em qualquer componente admin

## Benefícios da Organização

### ✅ **Separação de Responsabilidades**
- Cada hook tem uma responsabilidade específica
- Fácil de testar e manter
- Código mais limpo e organizado

### ✅ **Reutilização**
- Hooks podem ser usados em diferentes componentes
- Lógica centralizada evita duplicação

### ✅ **Cleanup Automático**
- Todos os event listeners são removidos automaticamente
- Evita memory leaks
- Gerencia dependências corretamente

### ✅ **Type Safety**
- TypeScript garante tipos corretos
- Interfaces bem definidas
- Menos erros em runtime

### ✅ **Manutenibilidade**
- Fácil de adicionar novos event listeners
- Fácil de modificar comportamentos existentes
- Código mais legível

## Como Usar

### No MapComponent:
```tsx
// Event listeners do mapa
useMapEventListeners({
  mapRef,
  user,
  onMarkerClick: handleMarkerClick,
  onResize: recenterMapWithSidebar
});

// Eventos customizados
useCustomEvents({ mapRef });
```

### No AdminPanel:
```tsx
// Ações de admin
const { centerOnMarker } = useAdminActions();

// Usar a função
centerOnMarker({
  lat: marker.lat,
  lng: marker.lng,
  zoom: 1,
  label: marker.label,
});
```

## Adicionando Novos Event Listeners

1. **Para eventos do Leaflet**: Adicione no `useMapEventListeners`
2. **Para eventos customizados**: Adicione no `useCustomEvents`
3. **Para ações específicas**: Crie um novo hook ou adicione no `useAdminActions`

## Exemplo de Adição de Novo Event Listener

```tsx
// Em useMapEventListeners.ts
const handleClick = useCallback((e: L.LeafletMouseEvent) => {
  // Lógica do evento
}, [dependencies]);

// Adicionar no useEffect
map.on("click", handleClick);

// Cleanup
map.off("click", handleClick);
``` 