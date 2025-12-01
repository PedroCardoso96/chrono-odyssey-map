// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import GoogleAuthButton from './GoogleAuthButton';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle2, ShieldCheck } from 'lucide-react'; // <-- Adicionado ícone de Admin

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="image-border-2 bg-dark-background w-full flex justify-between items-center text-text-white shadow-lg px-4 py-1">
      {/* Esquerda: logo + LanguageSwitcher */}
      <div className="flex items-center gap-4">
        <Link to="/" title="Voltar à página inicial">
          <img
            src="/logo.webp"
            alt="Logo Chrono Odyssey"
            className="h-11 w-11 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Direita: ícones sociais + botão GoogleAuth */}
      <nav className="flex items-center gap-6">
        <a href="https://discord.gg/gCqggucFTE" target="_blank" rel="noreferrer">
          <img alt="Discord" src="/icon-social-disc.webp" className="h-10 w-10 rounded-full object-cover" />
        </a>
        <a href="https://www.twitch.tv/serialhealer_" target="_blank" rel="noreferrer">
          <img alt="Twitch" src="/twitchicon.webp" className="h-10 w-10 rounded-full object-cover" />
        </a>

        {/* Link de Perfil para todos os usuários logados */}
        {user && (
          <Link to="/profile" title="Perfil">
            <UserCircle2 className="h-10 w-10 text-gray-300 hover:text-accent-gold transition-colors" />
          </Link>
        )}

        {/* NOVO: Link do Painel de Admin, apenas para admins */}
        {user?.isAdmin && (
          <Link to="/admin/dashboard" title="Painel de Administração">
            <ShieldCheck className="h-10 w-10 text-red-400 hover:text-red-300 transition-colors" />
          </Link>
        )}

        <GoogleAuthButton />
      </nav>
    </header>
  );
}
