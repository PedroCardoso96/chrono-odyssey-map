// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import i18n from 'i18next';

// Interface atualizada com campos da Fase 1 e Telemetria
interface UserProfile {
  id: string;
  name: string;
  picture?: string;
  email: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  nickname?: string;
  bio?: string;
  twitchUrl?: string;
  language?: string;
  theme?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (googleToken: string) => Promise<void>;
  loginTwitch: (twitchAccessToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);

        // Garante que o tema e idioma salvos sejam aplicados ao carregar a página
        if (parsedUser.theme) {
          document.documentElement.classList.toggle('dark', parsedUser.theme === 'dark');
        }
        if (parsedUser.language) {
          i18n.changeLanguage(parsedUser.language);
        }
      }
    } catch (error) {
      console.error("Falha ao carregar sessão:", error);
      localStorage.clear();
    }
    setIsLoading(false);
  }, []);

  // Helper unificado para processar a resposta do backend e sincronizar telemetria regional
  const handleAuthResponse = useCallback(async (data: any) => {
    if (data.success && data.user && data.token) {
      const dbUser = data.user;
      
      // 1. Persistência Local
      localStorage.setItem('user', JSON.stringify(dbUser));
      localStorage.setItem('authToken', data.token);
      setUser(dbUser);
      setToken(data.token);
      
      // 2. Sincronização de Tema
      if (dbUser.theme) {
        document.documentElement.classList.toggle('dark', dbUser.theme === 'dark');
      }

      // 3. LÓGICA DE TELEMETRIA REGIONAL (FASE 3)
      const currentUILanguage = i18n.language; // Idioma detectado/selecionado no navegador
      const dbLanguage = dbUser.language;

      if (dbLanguage && dbLanguage !== "en") {
        // Se o banco já tem uma preferência (diferente do padrão "en"), ela tem prioridade
        i18n.changeLanguage(dbLanguage);
      } else if (currentUILanguage && currentUILanguage !== dbLanguage) {
        // Se o banco está no padrão "en" mas o usuário já está usando outro idioma,
        // sincronizamos o banco para capturar a região real para a triangulação futura.
        try {
          await fetch('/api/users/me', {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({ language: currentUILanguage }),
          });
          // Atualiza o estado local para refletir que o idioma agora está mapeado no DB
          const updatedUser = { ...dbUser, language: currentUILanguage };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (e) {
          console.warn("[AUTH] Falha na telemetria regional inicial.");
        }
      }
    } else {
      throw new Error(data.message || 'Dados de autenticação inválidos.');
    }
  }, []);

  const login = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await response.json();
      await handleAuthResponse(data);
    } catch (error) {
      console.error('Erro no login Google:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loginTwitch = async (twitchAccessToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/twitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: twitchAccessToken }),
      });
      const data = await response.json();
      await handleAuthResponse(data);
    } catch (error) {
      console.error('Erro no login Twitch:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  const updateUserProfile = useCallback((updatedFields: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, loginTwitch, logout, isLoading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};