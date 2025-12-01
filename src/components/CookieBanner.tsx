// src/components/CookieBanner.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Adicionado para internacionalização

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation(); // Inicializando useTranslation

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // Substituído 'bg-gray-900' por 'bg-dark-card-bg' e 'text-white' por 'text-text-white'
    <div className="fixed bottom-0 left-0 right-0 bg-dark-card-bg text-text-white p-4 z-[99999] shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          {t('cookieBanner.messagePart1')}{" "}
          <Link to="/politica-de-privacidade" className="underline text-accent-gold hover:text-opacity-80 transition-colors">
            {t('cookieBanner.privacyPolicyLink')}
          </Link>
          {t('cookieBanner.messagePart2')}
        </p>
        <button
          onClick={acceptCookies}
          // Substituído amarelo por 'accent-gold' e 'text-black' por 'text-dark-background'
          className="bg-accent-gold hover:bg-opacity-80 text-dark-background font-semibold px-4 py-2 rounded"
        >
          {t('cookieBanner.acceptButton')}
        </button>
      </div>
    </div>
  );
}