// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { MapPin, Edit, Save, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isLoading, token, updateUserProfile } = useAuth();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setTwitchUrl(user.twitchUrl || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent-gold rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSaveChanges = async () => {
    setMessage(null);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname, bio, twitchUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao guardar alterações no perfil.');
      }

      const updatedUser = await response.json();
      updateUserProfile(updatedUser);
      
      setMessage({ type: 'success', text: 'Perfil guardado com sucesso!' });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao guardar alterações:', error);
      setMessage({ type: 'error', text: error.message || 'Erro desconhecido ao guardar perfil.' });
    }
  };

  const handleLinkTwitch = () => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://www.chronoodyssey.com.br/auth/callback/twitch');
    const scope = encodeURIComponent('user:read:email');
    
    // O backend saberá que é um VÍNCULO porque o usuário já chegará com o Token JWT no cabeçalho após o callback
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  };

  return (
    <Layout>
      <Helmet>
        <title>O Meu Perfil | Chrono Odyssey Map</title>
        <meta name="description" content="Veja e edite o seu perfil e conexões no mapa." />
      </Helmet>

      <main className="container mx-auto max-w-4xl py-12 px-4">
        <div className="p-8 bg-dark-card-bg border border-dark-border rounded-xl shadow-lg mb-10">
          
          {/* HEADER DO PERFIL */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-2 border-accent-gold shadow-[0_0_15px_rgba(194,167,99,0.3)]" />
                {user.isPremium && (
                   <div className="absolute -bottom-1 -right-1 bg-accent-gold text-dark-background p-1 rounded-full shadow-lg">
                     <CheckCircle2 size={16} />
                   </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-text-white tracking-tight">{user.name}</h1>
                <p className="text-md text-gray-400 font-mono">{user.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  {user.isPremium && (
                    <span className="px-3 py-1 text-[10px] font-bold text-accent-gold bg-accent-gold/10 border border-accent-gold/30 rounded-full uppercase tracking-widest">
                      Premium
                    </span>
                  )}
                  {user.isAdmin && (
                    <span className="px-3 py-1 text-[10px] font-bold text-blue-400 bg-blue-900/30 border border-blue-500/30 rounded-full uppercase tracking-widest">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)} 
              className="flex items-center gap-2 bg-accent-gold text-dark-background font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all shadow-md active:scale-95 uppercase text-xs tracking-widest"
            >
              {isEditing ? <Save size={16} /> : <Edit size={16} />}
              {isEditing ? 'Guardar' : 'Editar Perfil'}
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-3 rounded-md text-center font-bold text-sm animate-pulse ${message.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'bg-red-600/20 text-red-400 border border-red-600/50'}`}>
              {message.text}
            </div>
          )}

          {/* FORMULÁRIO / INFO */}
          <div className="space-y-6 border-t border-dark-border pt-8">
            {isEditing ? (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-accent-gold uppercase tracking-widest mb-2">Alcunha</label>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-3 bg-dark-background border border-dark-border text-text-white rounded-md focus:border-accent-gold outline-none transition-colors" placeholder="Como quer ser chamado?" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-accent-gold uppercase tracking-widest mb-2">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-3 bg-dark-background border border-dark-border text-text-white rounded-md focus:border-accent-gold outline-none transition-colors resize-none" placeholder="Conte um pouco sobre a sua jornada em Chrono Odyssey..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-accent-gold uppercase tracking-widest mb-2">Twitch URL</label>
                  <input type="url" value={twitchUrl} onChange={(e) => setTwitchUrl(e.target.value)} className="w-full p-3 bg-dark-background border border-dark-border text-text-white rounded-md focus:border-accent-gold outline-none transition-colors" placeholder="https://twitch.tv/seu-canal" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alcunha</span>
                    <p className="text-text-white text-lg">{user.nickname || '—'}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bio</span>
                    <p className="text-gray-400 text-sm italic">{user.bio || 'Sem descrição definida.'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Canal Twitch</span>
                    {user.twitchUrl ? (
                      <a href={user.twitchUrl} target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline flex items-center gap-2">
                        {user.twitchUrl}
                      </a>
                    ) : <p className="text-gray-600 italic">Não vinculado</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO DE CONEXÕES (UNIFICAÇÃO MANUAL) */}
          <div className="mt-12 border-t border-dark-border pt-8">
            <h3 className="text-sm font-bold text-text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <LinkIcon size={16} className="text-accent-gold" />
              Contas Conectadas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GOOGLE (Sempre conectado se o usuário original for Google) */}
              <div className="flex items-center justify-between p-4 bg-dark-background/50 border border-dark-border rounded-lg group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-md group-hover:bg-white/10 transition-colors">
                    <img src="/google.svg" alt="Google" className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Google Account</span>
                </div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter bg-green-500/10 px-2 py-1 rounded">Ativo</span>
              </div>

              {/* TWITCH (Dinâmico) */}
              <div className="flex items-center justify-between p-4 bg-dark-background/50 border border-dark-border rounded-lg group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#9146FF]/10 rounded-md group-hover:bg-[#9146FF]/20 transition-colors">
                    <img src="/twitchgold.svg" alt="Twitch" className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Twitch ID</span>
                </div>
                
                {user.twitchId ? (
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter bg-green-500/10 px-2 py-1 rounded">Vinculado</span>
                ) : (
                  <button 
                    onClick={handleLinkTwitch}
                    className="text-[10px] font-black text-accent-gold uppercase tracking-tighter border border-accent-gold/40 px-3 py-1 rounded hover:bg-accent-gold hover:text-dark-background transition-all"
                  >
                    Vincular
                  </button>
                )}
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
              * O vínculo permite unificar permissões Premium e Admin entre diferentes plataformas.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/map" className="inline-flex items-center gap-2 text-gray-500 hover:text-accent-gold transition-colors text-xs font-bold uppercase tracking-widest">
            <MapPin size={14} />
            Voltar ao Mapa Interativo
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;