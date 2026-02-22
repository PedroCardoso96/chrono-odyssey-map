// src/components/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import { ModalProvider } from '../contexts/ModalContext'; // <-- IMPORTA O PROVIDER
import Modal from './Modal'; // <-- IMPORTA O COMPONENTE MODAL

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
  
    // Envolve toda a aplicação com o ModalProvider
	// Aplicando as classes de cor de fundo e texto padrão do Tailwind
    // 'bg-dark-background' e 'text-text-white' foram definidas no seu tailwind.config.js
    <ModalProvider>
	
      <div className="flex flex-col min-h-screen bg-dark-background text-text-white">

        <Header />
        <main className="flex-grow">
          {children}{/* Aqui o conteúdo específico de cada página será renderizado */}
        </main>
        <Footer />
        {/* O z-index já está hardcoded dentro do CookieBanner, então não é preciso passar className aqui */}
        <CookieBanner />
        <Modal /> {/* <-- ADICIONA O COMPONENTE MODAL AQUI */}
      </div>
    </ModalProvider>
  );
};

export default Layout;
