// src/components/LanguageSwitcher.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from '../contexts/AuthContext'; // Importação necessária para telemetria

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { token } = useAuth(); // Acessamos o token para validar a gravação no DB

  const languages = [
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
    { code: "fr", label: "FR" },
    { code: "de", label: "DE" },
    { code: "es", label: "ES" },
  ];

  const handleChange = async (lng: string) => {
    // 1. Aplicação Visual: i18n altera o idioma localmente
    i18n.changeLanguage(lng);

    // 2. Telemetria para Fase 3: Captura silenciosa da região no banco de dados
    if (token) {
      try {
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: lng }) // Salva a linguagem no perfil para triangulação futura
        });
      } catch (err) {
        // Falha silenciosa para não interromper a experiência do usuário
        console.warn("[TELEMETRIA] Não foi possível mapear a região no DB.");
      }
    }
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      title="Change Language"
      className="px-2 py-1 text-sm rounded border border-gray-400 bg-transparent text-white hover:bg-gray-700 transition"
      aria-label="Switch Language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code} className="text-black">
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;