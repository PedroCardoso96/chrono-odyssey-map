// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// A interface do utilizador agora inclui os novos campos
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
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null; // O token agora faz parte do contexto (será o JWT do seu backend)
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => void; // Para atualizar o perfil no contexto
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null); // Estado para guardar o JWT do backend
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Este efeito agora carrega tanto o utilizador como o JWT ao iniciar a aplicação
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('authToken'); // Carrega o JWT do backend
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken); // Define o JWT no estado
      }
    } catch (error) {
      console.error("Falha ao carregar sessão do localStorage:", error);
      localStorage.clear(); // Limpa se houver erro para evitar estados inconsistentes
    }
    setIsLoading(false);
  }, []);

  const login = async (googleToken: string) => {
    setIsLoading(true);
    try {
      // Envia o Google ID Token para a rota de login do seu backend
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha na autenticação com o backend');
      }

      // Espera que o backend retorne { success, token: seuJWT, user }
      const data = await response.json();
      if (data.success && data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token); // Armazena o JWT do seu backend
        setUser(data.user);
        setToken(data.token);
      } else {
        throw new Error(data.message || 'Resposta da API de login inválida: JWT ou dados do usuário ausentes.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
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

  // Função para atualizar o perfil do utilizador no contexto e localStorage
  const updateUserProfile = useCallback((updatedFields: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, updateUserProfile }}>
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
