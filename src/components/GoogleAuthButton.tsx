// src/components/UnifiedAuthButtons.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleCredentialResponse {
  credential?: string;
}

const UnifiedAuthButtons: React.FC = () => {
  const { user, login, loginTwitch, logout, isLoading } = useAuth();

  const handleGoogleCallback = (response: GoogleCredentialResponse) => {
    if (response.credential) {
      login(response.credential);
    }
  };

  const showGooglePrompt = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.prompt();
    }
  };

  const handleTwitchLogin = () => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://www.chronoodyssey.com.br/auth/callback/twitch');
    const scope = encodeURIComponent('user:read:email');
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl;
  };

  if (isLoading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-dark-card-bg/80 px-2 py-1.5 rounded-full text-accent-gold text-sm border border-dark-border shadow-lg">
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full border border-accent-gold/30"
        />
        <div className="flex flex-col">
          <span className="truncate max-w-[120px] font-bold leading-tight hidden sm:block">{user.name}</span>
          {user.isAdmin && <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Administrator</span>}
        </div>
        <button
          onClick={logout}
          className="ml-2 text-gray-400 hover:text-red-400 transition-colors px-3 py-1 text-xs font-mono uppercase"
        >
          [ Exit ]
        </button>
      </div>
    );
  }

  // Estilo base comum para os botões de login
  const baseButtonStyle = "group flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-accent-gold/50 text-accent-gold font-bold text-[10px] transition-all duration-300 w-[100px]";

  return (
    <div className="flex items-center gap-2">
      {/* Botão Google - Dourado, Hover Azul */}
      <button
        onClick={showGooglePrompt}
        className={`${baseButtonStyle} hover:bg-[#4285F4] hover:text-white hover:border-[#4285F4] shadow-sm`}
      >
        <img 
          src="/google.svg" 
          alt="Google" 
          className="w-3.5 h-3.5 group-hover:brightness-0 group-hover:invert transition-all" 
        />
        LOGIN
      </button>

      {/* Botão Twitch - Dourado, Hover Roxo */}
      <button
        onClick={handleTwitchLogin}
        className={`${baseButtonStyle} hover:bg-[#9146FF] hover:text-white hover:border-[#9146FF] shadow-sm`}
      >
        <img 
          src="/twitchgold.svg" 
          alt="Twitch" 
          className="w-3.5 h-3.5 group-hover:brightness-0 group-hover:invert transition-all" 
        />
        LOGIN
      </button>
    </div>
  );
};

export default UnifiedAuthButtons;