// src/components/SubscribeButton.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Opcional: para esconder se o utilizador já for premium

const SubscribeButton: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Opcional: Se não quiser mostrar este bloco para quem já é premium.
  if (isLoading || user?.isPremium) {
    return null;
  }

  return (
    // Container que simula o layout do seu site
    <div className="w-full max-w-md text-center p-8 bg-dark-card-bg border border-dark-border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-accent-gold mb-2">
        Premium Access
      </h2>
      <p className="text-text-gray-300 mb-6">
        Unlock all features and support the project.
      </p>
      
      {/* O botão agora é um componente Link do React Router */}
      <Link 
        to="/subscribe" 
        className="inline-block bg-accent-gold text-dark-background font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(194,167,99,0.6)]"
      >
        Become Premium
      </Link>
    </div>
  );
};


export default SubscribeButton;