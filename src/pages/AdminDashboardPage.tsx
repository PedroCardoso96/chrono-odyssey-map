// src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Users, Search, MapPin, Save, XCircle } from 'lucide-react';

// ✅ Interface para os dados do usuário (obtidos do backend)
interface UserData {
  id: string; // IDs de usuário são STRING (cuid)
  name: string;
  email: string;
  picture?: string; // Adicionado: foto de perfil (opcional)
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string; // Adicionado: data de criação
  nickname?: string; // Adicionado: novo campo de perfil (opcional)
  bio?: string;      // Adicionado: novo campo de perfil (opcional)
  twitchUrl?: string; // Adicionado: novo campo de perfil (opcional)
}

// ✅ Interface para os dados de um marcador (obtidos do backend)
interface MarkerData {
  id: number; // IDs de marcador são NUMBER (autoincrement)
  lat: number;
  lng: number;
  type: string;
  label: string;
  description: string | null; // Pode ser string ou null, conforme seu JSON
  status: string; // 'approved', 'pending', 'rejected'
  authorId: string; // ID do autor (usuário) é uma string (cuid)
  createdAt: string; // Data de criação do marcador
  
  // O objeto 'author' aninhado
  author: {
    id: string; // ID do usuário (cuid)
    name: string;
    email: string; // E-mail do autor (adicionado para display)
  } | null; // Pode ser 'null' se o autor for excluído (onDelete: SetNull)
}

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading, token } = useAuth();
  
  // Estados para usuários e marcadores
  const [users, setUsers] = useState<UserData[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  
  // Estados para a UI (busca e edição)
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [markerSearchTerm, setMarkerSearchTerm] = useState('');
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);
  const [newLabel, setNewLabel] = useState('');

  // ✅ MUDANÇA: Função auxiliar para obter os headers de autenticação, agora com useCallback
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  }, [token]); // Depende do token

  // --- BUSCA DE DADOS ---
  // ✅ MUDANÇA: fetchMarkers agora é um useCallback e depende de getAuthHeaders
  const fetchMarkers = useCallback(async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/markers`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Falha ao buscar marcadores');
      const data: MarkerData[] = await response.json();
      setMarkers(data);
    } catch (error) {
      console.error("Erro ao buscar marcadores no Admin Dashboard:", error);
    }
  }, [getAuthHeaders]); // Depende de getAuthHeaders
  
  // ✅ MUDANÇA: fetchUsers agora é um useCallback e depende de getAuthHeaders
  const fetchUsers = useCallback(async () => {
      try {
          // ✅ MUDANÇA: URL corrigida para /api/users
          const response = await fetch(`${window.location.origin}/api/users`, {
              headers: getAuthHeaders()
          });
          if (!response.ok) throw new Error('Falha ao buscar usuários');
          const data: UserData[] = await response.json();
          setUsers(data);
      } catch (error) {
          console.error("Erro ao buscar usuários no Admin Dashboard:", error);
      }
  }, [getAuthHeaders]); // Depende de getAuthHeaders

  useEffect(() => {
    // Espera explicitamente que a autenticação termine de carregar
    if (isLoading) {
      return;
    }

    // Só tenta buscar dados se o usuário for admin e o token estiver disponível
    if (user?.isAdmin && token) {
        fetchMarkers();
        fetchUsers();
    }
    
  }, [isLoading, token, user, fetchMarkers, fetchUsers]); // ✅ MUDANÇA: Depende de fetchMarkers e fetchUsers


  // --- LÓGICA DE ATUALIZAÇÃO DO MARCADOR ---
  const handleUpdateLabel = async () => {
    if (!editingMarker || !token) return;
    try {
      const response = await fetch(`${window.location.origin}/api/markers/${editingMarker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ label: newLabel }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o marcador.');
      
      const updatedMarker: MarkerData = await response.json();
      setMarkers(prev => prev.map(m => (m.id === updatedMarker.id ? updatedMarker : m)));
      setEditingMarker(null);
      setNewLabel('');
    } catch (error) {
      console.error("Erro ao atualizar o label:", error);
      alert(`Erro ao atualizar o label: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  const startEditing = (marker: MarkerData) => {
    setEditingMarker(marker);
    setNewLabel(marker.label);
  };

  // Redireciona se não for admin ou se ainda estiver carregando e não for admin
  if (isLoading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p className="text-accent-gold">A carregar Painel de Admin...</p></div></Layout>;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Lógica de filtragem para usuários e marcadores
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  const filteredMarkers = markers.filter(m =>
    m.label.toLowerCase().includes(markerSearchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(markerSearchTerm.toLowerCase()) ||
    m.id.toString().includes(markerSearchTerm)
  );

  return (
    <Layout>
      <Helmet>
        <title>Painel de Admin | Chrono Odyssey Map</title>
      </Helmet>

      <main className="container mx-auto max-w-7xl py-12 px-4 space-y-12">
        <h1 className="text-3xl font-bold text-accent-gold">Painel de Administração</h1>

        {/* ================================================================== */}
        {/* SEÇÃO: Gerir Marcadores Personalizados                           */}
        {/* ================================================================== */}
        <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-text-white mb-4 flex items-center gap-2">
            <MapPin /> Gerir Marcadores Personalizados
          </h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Procurar por ID, nome ou tipo..."
              value={markerSearchTerm}
              onChange={(e) => setMarkerSearchTerm(e.target.value)}
              className="w-full bg-dark-background border border-dark-border text-text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-accent-gold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="p-3">ID</th>
                  <th className="p-3">Label</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Autor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-gray-400">Nenhum marcador encontrado.</td>
                  </tr>
                ) : (
                  filteredMarkers.map(m => (
                    <tr key={m.id} className="border-b border-dark-divider hover:bg-dark-background">
                      <td className="p-3 font-mono text-sm">{m.id}</td>
                      <td className="p-3">
                        {editingMarker?.id === m.id ? (
                          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="bg-dark-background border border-accent-gold rounded px-2 py-1 w-full" autoFocus />
                        ) : ( m.label )}
                      </td>
                      <td className="p-3">{m.type}</td>
                      <td className="p-3 text-sm text-gray-400">
                        {m.author ? m.author.name || m.author.email : 'Desconhecido'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          m.status === 'approved' ? 'text-green-300 bg-green-800/50' :
                          m.status === 'pending' ? 'text-yellow-300 bg-yellow-800/50' :
                          'text-red-300 bg-red-800/50'
                        }`}>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        {editingMarker?.id === m.id ? (
                          <div className="flex gap-2">
                            <button onClick={handleUpdateLabel} className="text-green-400 hover:text-green-300"><Save size={20} /></button>
                            <button onClick={() => setEditingMarker(null)} className="text-red-400 hover:text-red-300"><XCircle size={20} /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEditing(m)} className="text-accent-gold hover:underline text-sm">Editar Label</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* ================================================================== */}
        {/* SEÇÃO: Gerir Utilizadores                                        */}
        {/* ================================================================== */}
        <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-text-white mb-4 flex items-center gap-2">
            <Users /> Gerir Utilizadores
          </h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Procurar por nome ou e-mail..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full bg-dark-background border border-dark-border text-text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-accent-gold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-dark-divider hover:bg-dark-background">
                      <td className="p-3 flex items-center gap-2">
                        <img src={u.picture || `https://i.pravatar.cc/40?u=${u.email}`} alt={u.name} className="w-8 h-8 rounded-full" />
                        {u.name} ({u.nickname || 'N/A'})
                      </td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        {u.isPremium ? (
                          <span className="px-2 py-1 text-xs font-semibold text-yellow-300 bg-yellow-800/50 rounded-full">Premium</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-600/50 rounded-full">Padrão</span>
                        )}
                        {u.isAdmin && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold text-blue-300 bg-blue-800/50 rounded-full">Admin</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/user/${u.id}`} className="text-accent-gold hover:underline">Editar</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default AdminDashboardPage;
