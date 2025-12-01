// src/components/GoogleAuthButton.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importa o nosso hook

// Define o tipo para a resposta do Google para maior segurança
interface GoogleCredentialResponse {
  credential?: string;
}

const GoogleAuthButton: React.FC = () => {
  // Usa o estado e as funções do nosso contexto centralizado
  const { user, login, logout, isLoading } = useAuth();

  // Esta função será o callback que o Google chamará após o login
  const handleGoogleCallback = (response: GoogleCredentialResponse) => {
    if (response.credential) {
      // Chama a função 'login' do AuthContext, que fará a chamada à sua API
      login(response.credential);
    } else {
      console.error("A resposta do Google não continha a credencial.");
    }
  };

  // Esta função mostra o prompt de login do Google, como no seu código original
  const showGooglePrompt = () => {
    // Verifica se a API do Google está carregada no objeto window
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "", // Carrega o ID do .env
        callback: handleGoogleCallback,
      });
      // Mostra o prompt de "One Tap" ou abre o pop-up
      window.google.accounts.id.prompt();
    } else {
      console.error("A biblioteca de identidade do Google (GSI) não foi carregada.");
    }
  };

  // Não exibe nada enquanto o contexto verifica o estado de login inicial
  if (isLoading) {
    return null;
  }

  // Se o usuário estiver logado, exibe a sua UI customizada
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-gold-card-bg/60 px-2 py-1.5 rounded-full text-text-yellow text-sm border border-dark-border">
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="truncate max-w-[120px] font-medium hidden sm:block">{user.name}</span>
        <button
          onClick={logout}
          className="ml-auto text-gray-400 hover:text-white transition-colors px-3 py-1"
          title="Logout"
        >
          Sair
        </button>
      </div>
    );
  }

  // Se não estiver logado, exibe o seu botão customizado original
  return (
    <button
      onClick={showGooglePrompt}
      className="bg-accent-gold hover:opacity-90 text-dark-background font-semibold text-sm px-4 py-2 rounded-md flex items-center gap-2 transition-opacity"
    >
      <img src="/google.svg" alt="Google" className="w-5 h-5" />
      Login With Google
    </button>
  );
};

export default GoogleAuthButton;
