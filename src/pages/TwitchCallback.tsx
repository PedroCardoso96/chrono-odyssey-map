// src/pages/TwitchCallback.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout'; // Usando o seu Layout padrão para manter o estilo

const TwitchCallback: React.FC = () => {
  const { loginTwitch } = useAuth();
  const navigate = useNavigate();
  const hasCalledLogin = useRef(false); // Evita chamadas duplicadas no StrictMode do React

  useEffect(() => {
    // 1. A Twitch envia o token no fragmento da URL (#access_token=...)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken && !hasCalledLogin.current) {
      hasCalledLogin.current = true;
      
      console.log("[AUTH] Token Twitch detectado, iniciando protocolo de unificação...");

      loginTwitch(accessToken)
        .then(() => {
          // Sucesso: O backend vinculou a conta e retornou o seu JWT
          console.log("[AUTH] Login unificado com sucesso.");
          navigate('/'); // Redireciona para a Home
        })
        .catch((err) => {
          console.error("[AUTH] Erro ao processar login Twitch:", err);
          navigate('/?error=twitch_auth_failed');
        });
    } else if (!accessToken) {
      console.warn("[AUTH] Nenhum token encontrado na URL.");
      navigate('/');
    }
  }, [loginTwitch, navigate]);

  return (
    <Layout>
      <main className="min-h-[80vh] flex flex-col items-center justify-center bg-dark-background px-4">
        <div className="relative">
          {/* Spinner estilizado com as cores do Chrono Odyssey */}
          <div className="w-16 h-16 border-4 border-dark-border border-t-accent-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-accent-gold font-mono tracking-[0.2em] uppercase animate-pulse">
            Authenticating
          </h2>
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-dark-border to-transparent mx-auto" />
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Sincronizando registros da Twitch...
          </p>
        </div>

        {/* Efeito de glitch sutil no fundo (opcional, combina com o tema de Chrono) */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('/grid.png')] bg-repeat"></div>
      </main>
    </Layout>
  );
};

export default TwitchCallback;