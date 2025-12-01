// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faYoutube, faDiscord } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  const { t } = useTranslation();

  return (
    // Substituído 'bg-chrono' por 'bg-dark-card-bg' e 'text-gray-100' por 'text-text-white'
    <footer className="bg-dark-card-bg text-text-white px-6 py-10 text-sm border-t border-dark-border">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-accent-gold font-semibold mb-3">{t("footer.aboutTitle")}</h4>
          <p className="text-text-white text-sm leading-relaxed">{t("footer.aboutText")}</p>
        </div>

        <div>
          <h4 className="text-accent-gold font-semibold mb-3">{t("footer.navigation")}</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/map" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.map")}
              </Link>
            </li>
            <li>
              <Link to="/noticias" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.news")}
              </Link>
            </li>
            <li>
              <Link to="/eventos" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.events")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-accent-gold font-semibold mb-3">{t("footer.community")}</h4>
          <ul className="space-y-2">
            <li>
              <a href="https://discord.com/invite/RxNUeyz4Dv" target="_blank" rel="noopener noreferrer" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.officialDiscord")}
              </a>
            </li>
            <li>
              <a href="https://x.com/ChronoOdysseyOF" target="_blank" rel="noopener noreferrer" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.twitter")}
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@ChronoOdyssey" target="_blank" rel="noopener noreferrer" className="text-text-white hover:text-accent-gold underline transition">
                {t("footer.youtube")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-accent-gold font-semibold mb-3">{t("footer.contact")}</h4>
          <p className="text-text-white mb-2">{t("footer.email")}</p>
          <div className="flex gap-4 mt-3">
            <a
              href="https://x.com/ChronoOdysseyOF"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} className="w-5 h-5 text-text-white hover:text-accent-gold transition" />
            </a>
            <a href="https://www.youtube.com/@ChronoOdyssey" target="_blank" rel="noopener noreferrer" aria-label="Youtube" >
              <FontAwesomeIcon icon={faYoutube} className="w-5 h-5 text-text-white hover:text-accent-gold transition" />
            </a>
            <a href="https://discord.gg/gCqggucFTE" target="_blank" rel="noopener noreferrer" aria-label="Discord" >
              <FontAwesomeIcon icon={faDiscord} className="w-5 h-5 text-text-white hover:text-accent-gold transition" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-border mt-10 pt-6 text-center text-text-white text-xs">
        <div className="mb-2 space-x-4">
          <Link to="/sobre" className="text-text-white hover:text-accent-gold underline transition">
            {t("footer.about")}
          </Link>
          <span className="text-gray-500">|</span>
          <Link to="/contato" className="text-text-white hover:text-accent-gold underline transition">
            {t("footer.contact")}
          </Link>
          <span className="text-gray-500">|</span>
          <Link to="/politica-de-privacidade" className="text-text-white hover:text-accent-gold underline transition">
            {t("footer.privacy")}
          </Link>
        </div>
        <p>{t("footer.copyright")}</p>
        <p className="mt-1 text-text-white">{t("footer.powered")}</p>
      </div>
    </footer>
  );
}