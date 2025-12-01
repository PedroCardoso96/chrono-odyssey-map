// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
// import { useMarkers } from '../contexts/MarkersContext'; // ✅ REMOVIDO: Não usaremos pendingMarkers aqui
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Edit, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isLoading, token, updateUserProfile } = useAuth(); // Adicionado 'token' e 'updateUserProfile'
  // const { pendingMarkers } = useMarkers(); // ✅ REMOVIDO: Não usaremos pendingMarkers aqui
  const { t } = useTranslation();

  // Estado para controlar o modo de edição
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para os campos do formulário (inicializados com os dados do usuário)
  // Usamos useEffect para garantir que os estados sejam preenchidos após o usuário carregar
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null); // Para mensagens de feedback

  useEffect(() => {
    if (user) {
      // ✅ ATUALIZADO: Usar os campos existentes ou vazios se não definidos
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setTwitchUrl(user.twitchUrl || '');
    }
  }, [user]);


  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-accent-gold text-lg">A carregar perfil...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // const myPendingMarkers = pendingMarkers.filter(marker => marker.authorId === user.id); // ✅ REMOVIDO

  // Função para salvar as alterações (aqui entra a chamada à API)
  const handleSaveChanges = async () => {
    setMessage(null); // Limpa mensagens anteriores
    // setIsEditing(false); // Não sai do modo de edição imediatamente para feedback visual

    try {
      const response = await fetch('/api/users/me', { // PATCH para atualizar o próprio perfil
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o JWT para autenticação
        },
        body: JSON.stringify({ nickname, bio, twitchUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao guardar alterações no perfil.');
      }

      const updatedUser = await response.json();
      
      // ✅ IMPORTANTE: Atualizar o estado do usuário no AuthContext após o sucesso
      updateUserProfile(updatedUser); // Usa a nova função do contexto
      
      setMessage({ type: 'success', text: 'Perfil guardado com sucesso!' });
      setIsEditing(false); // Sai do modo de edição após guardar com sucesso
    } catch (error: any) {
      console.error('Erro ao guardar alterações:', error);
      setMessage({ type: 'error', text: error.message || 'Erro desconhecido ao guardar perfil.' });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>O Meu Perfil | Chrono Odyssey Map</title>
        <meta name="description" content="Veja e edite o seu perfil e contribuições no mapa." />
      </Helmet>

      <main className="container mx-auto max-w-4xl py-12 px-4">
        <div className="p-8 bg-dark-card-bg border border-dark-border rounded-xl shadow-lg mb-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-2 border-accent-gold" />
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-text-white">{user.name}</h1>
                <p className="text-md text-gray-400">{user.email}</p>
                {user.isPremium && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-accent-gold bg-accent-gold-dark rounded-full">
                    Premium
                  </span>
                )}
                {user.isAdmin && (
                  <span className="inline-block mt-2 ml-2 px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-900 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            {/* Botão para entrar/sair do modo de edição */}
            <button onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)} className="flex items-center gap-2 bg-accent-gold text-dark-background font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
              {isEditing ? <Save size={18} /> : <Edit size={18} />}
              {isEditing ? 'Guardar' : 'Editar Perfil'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {message.text}
            </div>
          )}

          {/* Formulário de Edição (só aparece no modo de edição) */}
          {isEditing ? (
            <div className="space-y-4 mt-6 border-t border-dark-border pt-6">
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
            </div>
          ) : (
            // Exibição das informações (quando não está a editar)
            <div className="space-y-2 mt-6 border-t border-dark-border pt-6">
                <p><strong className="text-gray-300">Alcunha:</strong> {user.nickname || 'Não definido'}</p>
                <p><strong className="text-gray-300">Bio:</strong> {user.bio || 'Não definida'}</p>
                <p><strong className="text-gray-300">Twitch:</strong> {user.twitchUrl ? <a href={user.twitchUrl} target="_blank" rel="noopener noreferrer" className="text-accent-gold underline hover:text-accent-gold-light transition-colors">{user.twitchUrl}</a> : 'Não definido'}</p>
            </div>
          )}
        </div>

        {/* ✅ REMOVIDO: Seção de Marcadores Pendentes */}
        
        <div className="mt-10 text-center">
          <Link
            to="/map"
            className="inline-block bg-accent-gold hover:opacity-90 text-dark-background font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md"
          >
            ← Voltar para o Mapa
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;
