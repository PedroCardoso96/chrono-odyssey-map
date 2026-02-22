// src/contexts/MarkersContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Importa o hook de autenticação
// import { isUserAdmin } from '../utils/isUserAdmin'; // ✅ REMOVIDO: isUserAdmin não é mais necessário aqui

// Define a interface para o objeto Marker
interface Marker {
  author?: { id: string; name: string }; // Author agora é opcional e tem ID e nome
  id: number;
  lat: number;
  lng: number;
  type: string;
  label: string;
  description?: string; // Descrição pode ser opcional
  status: string;
  authorId: string;
}

interface MarkersContextType {
  approvedMarkers: Marker[];
  pendingMarkers: Marker[];
  refreshMarkers: () => void;
  refreshPendingMarkers: () => void;
  addMarker: (marker: Partial<Marker>) => Promise<void>; // Parcial para permitir que o ID seja gerado pelo backend
  approveMarker: (id: number) => Promise<void>;
  rejectMarker: (id: number) => Promise<void>;
  clearAllMarkers: () => Promise<void>;
  deleteMarker: (id: number) => Promise<void>;
  updateMarker: (id: number, data: Partial<Pick<Marker, 'label' | 'description' | 'status'>>) => Promise<void>;
}

const MarkersContext = createContext<MarkersContextType | undefined>(undefined);

export function MarkersProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, token } = useAuth(); // ✅ MUDANÇA: Obtém o token do AuthContext
  const [approvedMarkers, setApprovedMarkers] = useState<Marker[]>([]);
  const [pendingMarkers, setPendingMarkers] = useState<Marker[]>([]);

  // Determina se o usuário é admin. Agora usa user.isAdmin diretamente do JWT.
  const isAdmin = useMemo(() => user?.isAdmin || false, [user]); // ✅ MUDANÇA: Usa user.isAdmin

  // Função auxiliar para criar os headers com o token de autenticação
  // ✅ MUDANÇA: Agora recebe o token como argumento
  const getAuthHeaders = useCallback((authToken: string | null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authToken) { // Usa o token passado como argumento
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }, []); // Dependências vazias, pois authToken é passado como argumento

  // Função auxiliar para obter a URL da API, garantindo compatibilidade com dev/prod
  const getApiUrl = useCallback((endpoint: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}${endpoint}`;
    }
    return endpoint;
  }, []);

  // ✅ ATUALIZADO: Busca APENAS marcadores aprovados (para o mapa, público)
  const refreshMarkers = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/markers'), { method: 'GET' });
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} ao buscar marcadores aprovados.`);
        setApprovedMarkers([]);
        return;
      }
      const data = await response.json();
      setApprovedMarkers(data);
    } catch (error) {
      console.error('❌ Erro ao buscar marcadores aprovados:', error);
      setApprovedMarkers([]);
    }
  }, [getApiUrl]);

  // ✅ ATUALIZADO: Busca APENAS marcadores pendentes (para admins, requer autenticação)
  const refreshPendingMarkers = useCallback(async () => {
    // Só tenta buscar se não estiver carregando e se for admin E tiver um token
    if (!isAdmin || !token) { // ✅ MUDANÇA: Verifica isAdmin E token
        setPendingMarkers([]); // Se não for admin ou não tiver token, garante que o estado de pendentes esteja vazio
        return;
    }
    try {
      // Esta rota exige autenticação e permissão de admin
      const response = await fetch(getApiUrl('/api/markers/pending'), { method: 'GET', headers: getAuthHeaders(token) }); // ✅ MUDANÇA: Passa o token
      if (!response.ok) {
        if(response.status === 401 || response.status === 403) {
            console.warn('⚠️ Acesso negado à rota de marcadores pendentes. Usuário não é admin ou não autenticado.');
            setPendingMarkers([]);
            return;
        }
        throw new Error(`HTTP error! status: ${response.status} ao buscar marcadores pendentes.`);
      }
      const data = await response.json();
      setPendingMarkers(data);
    } catch (error) {
      console.error('❌ Erro ao buscar marcadores pendentes:', error);
      setPendingMarkers([]);
    }
  }, [isAdmin, token, getApiUrl, getAuthHeaders]); // ✅ MUDANÇA: Depende de token

  // Adiciona um novo marcador (sempre como pendente no backend)
  const addMarker = useCallback(async (marker: Partial<Marker>) => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token para adicionar marcador
        throw new Error('Usuário não autenticado para adicionar marcador.');
    }
    try {
      const { id, ...markerData } = marker;
      const response = await fetch(getApiUrl('/api/markers'), {
        method: 'POST',
        headers: getAuthHeaders(token), // ✅ MUDANÇA: Passa o token
        body: JSON.stringify(markerData)
      });
      if (!response.ok) throw new Error('Erro na resposta do servidor ao adicionar marcador.');
      const newMarker: Marker = await response.json();
      if (!newMarker.id) throw new Error('Marcador criado sem ID.');
      
      setPendingMarkers(prev => [...prev, newMarker]);
      
      if (isAdmin) {
          refreshPendingMarkers();
      }
    } catch (error) {
      console.error('Erro ao adicionar marcador:', error);
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, isAdmin, refreshPendingMarkers, token]); // ✅ MUDANÇA: Depende de token

  // Aprova um marcador (muda status para 'approved')
  const approveMarker = useCallback(async (id: number) => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token
        throw new Error('Usuário não autenticado para aprovar marcador.');
    }
    try {
      const response = await fetch(getApiUrl(`/api/markers/${id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(token), // ✅ MUDANÇA: Passa o token
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        const approvedMarker: Marker = await response.json();
        setPendingMarkers(prevPending => prevPending.filter(m => m.id !== id));
        setApprovedMarkers(prevApproved => [...prevApproved, approvedMarker]);
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao aprovar marcador:', error);
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, token]); // ✅ MUDANÇA: Depende de token

  // Rejeita um marcador (muda status para 'rejected' ou deleta)
  const rejectMarker = useCallback(async (id: number) => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token
        throw new Error('Usuário não autenticado para rejeitar marcador.');
    }
    try {
      const response = await fetch(getApiUrl(`/api/markers/${id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(token), // ✅ MUDANÇA: Passa o token
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        setPendingMarkers(prev => prev.filter(m => m.id !== id));
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao rejeitar marcador:', error);
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, token]); // ✅ MUDANÇA: Depende de token

  // Deleta um marcador específico
  const deleteMarker = useCallback(async (id: number) => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token
        throw new Error('Usuário não autenticado para deletar marcador.');
    }
    setApprovedMarkers(prev => prev.filter(m => m.id !== id));
    setPendingMarkers(prev => prev.filter(m => m.id !== id));
    try {
      const response = await fetch(getApiUrl(`/api/markers/${id}`), { method: 'DELETE', headers: getAuthHeaders(token) }); // ✅ MUDANÇA: Passa o token
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar marcador:', error);
      refreshMarkers();
      if (isAdmin) {
          refreshPendingMarkers();
      }
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, refreshMarkers, refreshPendingMarkers, isAdmin, token]); // ✅ MUDANÇA: Depende de token

  // Limpa todos os marcadores
  const clearAllMarkers = useCallback(async () => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token
        throw new Error('Usuário não autenticado para limpar marcadores.');
    }
    try {
      const response = await fetch(getApiUrl('/api/markers/clear'), { method: 'DELETE', headers: getAuthHeaders(token) }); // ✅ MUDANÇA: Passa o token
      if (response.ok) {
        setApprovedMarkers([]);
        setPendingMarkers([]);
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar marcadores:', error);
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, token]); // ✅ MUDANÇA: Depende de token

  // Atualiza um marcador (label, description, status)
  const updateMarker = useCallback(async (id: number, data: Partial<Pick<Marker, 'label' | 'description' | 'status'>>) => {
    if (!token) { // ✅ MUDANÇA: Verifica se há token
        throw new Error('Usuário não autenticado para atualizar marcador.');
    }
    try {
      const response = await fetch(getApiUrl(`/api/markers/${id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(token), // ✅ MUDANÇA: Passa o token
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
      const updatedMarker: Marker = await response.json();
      setApprovedMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedMarker } : m)));
      setPendingMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedMarker } : m)));
    } catch (error) {
      console.error('❌ Erro ao atualizar marcador:', error);
      throw error;
    }
  }, [getApiUrl, getAuthHeaders, token]); // ✅ MUDANÇA: Depende de token

  // ✅ NOVO/MODIFICADO: useEffect para buscar marcadores aprovados e pendentes ao carregar ou mudar o usuário
  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    refreshMarkers();

    let pendingInterval: NodeJS.Timeout | undefined;

    // Busca os marcadores pendentes APENAS se o usuário for admin E tiver um token
    if (isAdmin && token) { // ✅ MUDANÇA: Verifica isAdmin E token
      refreshPendingMarkers();
      pendingInterval = setInterval(() => {
        refreshPendingMarkers();
      }, 30000); // ✅ CORRIGIDO: Era 3000 no erro, agora 30000
    } else {
        setPendingMarkers([]);
    }

    return () => {
        if (pendingInterval) {
            clearInterval(pendingInterval);
        }
    };
  }, [isLoading, isAdmin, token, refreshMarkers, refreshPendingMarkers]); // ✅ MUDANÇA: Dependências: token

  const contextValue = useMemo(
    () => ({
      approvedMarkers,
      pendingMarkers,
      refreshMarkers,
      refreshPendingMarkers,
      addMarker,
      approveMarker,
      rejectMarker,
      clearAllMarkers,
      deleteMarker,
      updateMarker,
    }),
    [ approvedMarkers, pendingMarkers, refreshMarkers, refreshPendingMarkers, addMarker, approveMarker, rejectMarker, clearAllMarkers, deleteMarker, updateMarker ]
  );

  return <MarkersContext.Provider value={contextValue}>{children}</MarkersContext.Provider>;
}

export function useMarkers() {
  const context = useContext(MarkersContext);
  if (context === undefined) {
    throw new Error('useMarkers deve ser usado dentro de MarkersProvider');
  }
  return context;
}
