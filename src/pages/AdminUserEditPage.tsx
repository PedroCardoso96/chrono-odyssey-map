// src/pages/AdminUserEditPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { useMarkers } from '../contexts/MarkersContext';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Check, X, Trash2, Eye } from 'lucide-react';
import { useAdminActions } from '../hooks/useAdminActions';

// Interface para os dados do utilizador que virão da sua API
interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isPremium: boolean;
  isAdmin: boolean;
  nickname?: string;
  bio?: string;
  twitchUrl?: string;
}

const AdminUserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: adminUser, isLoading: isAdminLoading, token } = useAuth();
  const { approvedMarkers, pendingMarkers, approveMarker, rejectMarker, deleteMarker } = useMarkers();
  const { t } = useTranslation();
  const { centerOnMarker } = useAdminActions();
  const navigate = useNavigate();

  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Estados para o formulário de edição
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // ✅ CORREÇÃO: Busca os dados do utilizador específico da API
  useEffect(() => {
    if (!userId || !token) {
        setPageLoading(false);
        return;
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Utilizador não encontrado');
        const data = await response.json();
        setUserToEdit(data);
        // Preenche o formulário com os dados recebidos
        setNickname(data.nickname || '');
        setBio(data.bio || '');
        setTwitchUrl(data.twitchUrl || '');
        setIsPremium(data.isPremium || false);
      } catch (error) {
        console.error("Erro ao buscar dados do utilizador:", error);
        setUserToEdit(null);
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const userMarkers = useMemo(() => {
      if (!userToEdit) return [];
      // Usa todos os marcadores do contexto para encontrar os deste utilizador
      return [...approvedMarkers, ...pendingMarkers].filter(m => m.authorId === userToEdit.id);
  }, [userToEdit, approvedMarkers, pendingMarkers]);


  const handleViewOnMap = (marker: any) => {
    navigate('/map');
    setTimeout(() => {
      centerOnMarker({ lat: marker.lat, lng: marker.lng, zoom: 5, label: marker.label });
    }, 100);
  };

  // Função para guardar as alterações no backend
  const handleSaveChanges = async () => {
    if (!userId || !token) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname, bio, twitchUrl, isPremium }),
      });
      if (!response.ok) throw new Error('Falha ao guardar as alterações');
      alert('Perfil do utilizador atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao guardar alterações:", error);
      alert(`Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  if (isAdminLoading || pageLoading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p>A carregar...</p></div></Layout>;
  }

  if (!adminUser?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!userToEdit) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><p>Utilizador não encontrado.</p></div></Layout>;
  }

  return (
    <Layout>
      <Helmet><title>Editar Utilizador: {userToEdit.name} | Painel de Admin</title></Helmet>
      <main className="container mx-auto max-w-6xl py-12 px-4">
        <div className="mb-8">
          <Link to="/admin/dashboard" className="text-accent-gold hover:underline">&larr; Voltar ao Painel de Administração</Link>
        </div>
        <h1 className="text-3xl font-bold text-accent-gold mb-8">Editar Utilizador</h1>

        <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-6 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-text-white">Perfil de {userToEdit.name}</h2>
            <button onClick={handleSaveChanges} className="bg-accent-gold text-dark-background font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
              Guardar Alterações
            </button>
          </div>
          <div className="space-y-4 mt-4 border-t border-dark-divider pt-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">Alcunha</label>
              <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold" />
            </div>
            <div>
              <label htmlFor="twitchUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do Canal da Twitch</label>
              <input type="url" id="twitchUrl" value={twitchUrl} onChange={(e) => setTwitchUrl(e.target.value)} className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-gray-300">Assinatura Premium</span>
              <label htmlFor="isPremium" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="isPremium" className="sr-only peer" checked={isPremium} onChange={() => setIsPremium(!isPremium)} />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-text-white mb-4">Marcadores Enviados ({userMarkers.length})</h2>
          <div className="space-y-4">
            {userMarkers.length > 0 ? userMarkers.map(marker => (
              <div key={marker.id} className="bg-dark-background p-4 rounded-lg border border-dark-divider">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-text-white">{t(`mapFilters.${marker.type}`, marker.label)}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {marker.lat.toFixed(2)}, {marker.lng.toFixed(2)}</span>
                      <span className={`flex items-center gap-1 font-semibold ${marker.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {marker.status === 'pending' ? <Clock size={14} /> : <Check size={14} />}
                        {marker.status === 'pending' ? 'Pendente' : 'Aprovado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    {marker.status === 'pending' && (
                      <>
                        <button onClick={() => approveMarker(marker.id)} className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors" title="Aprovar"><Check size={18} /></button>
                        <button onClick={() => rejectMarker(marker.id)} className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors" title="Rejeitar"><X size={18} /></button>
                      </>
                    )}
                    {marker.status === 'approved' && (
                      <button onClick={() => deleteMarker(marker.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors" title="Remover"><Trash2 size={18} /></button>
                    )}
                    <button onClick={() => handleViewOnMap(marker)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors" title="Ver no Mapa"><Eye size={18} /></button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">Este utilizador ainda não enviou nenhum marcador.</p>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default AdminUserEditPage;
