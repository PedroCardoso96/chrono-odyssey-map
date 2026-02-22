// src/pages/Sobre.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// REMOVER: import Header from "../components/Header";
// REMOVER: import Footer from "../components/Footer";
import { Helmet } from "react-helmet";
import DonateButton from '../components/DonateButton'; // Manter, pois o DonateButton é importado manualmente

// --- NOVO: Importe o Layout ---
import Layout from '../components/Layout'; // Verifique o caminho correto

const Sobre = () => {
  const { t } = useTranslation();

  return (
    // Envolve todo o conteúdo da página com o componente Layout
    <Layout>
      <Helmet>
        {/* Usando i18n para o conteúdo do Helmet */}
        <title>{t('aboutPage.title')} – Chrono Odyssey</title>
        <meta
          name="description"
          content={t('aboutPage.intro')}
        />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/sobre" />
      </Helmet>

      {/* REMOVER: A div principal com as cores e min-h-screen, pois o Layout já cuida disso */}
      {/* <div className="flex flex-col min-h-screen bg-[#0d0d0d] text-white"> */}
        {/* REMOVER: <Header /> */}

        {/* Mantenha main e suas classes de layout específicas */}
        <main className="flex justify-center py-12 px-4">
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
            {/* Coluna lateral */}
            <aside className="w-full md:w-[280px] sticky top-20 self-start">
              {/* Substituir cores hardcoded por classes Tailwind */}
              <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-md overflow-hidden">
                <img
                  src="/news-cover.webp" // Certifique-se de que o caminho esteja correto, ex: /news-cover.webp se for na pasta public
                  alt="Sobre o site"
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 text-text-white text-sm space-y-2">
                  {/* Cor hardcoded "#c2a763" substituída por "text-accent-gold" */}
                  <h2 className="text-lg font-semibold text-accent-gold">Sobre o Site</h2>
                  {/* "text-gray-400" é uma cor padrão do Tailwind, então está ok */}
                  <p className="text-xs text-gray-400">Informações do projeto</p>
                  {/* Cor hardcoded "#333" substituída por "border-dark-divider" */}
                  <div className="border-t border-dark-divider my-2" />
                  <p><strong>Criado por:</strong> Serial Healer & PH</p>
                  <p><strong>Idioma:</strong> Português-BR</p>
                  <p><strong>Status:</strong> Em desenvolvimento</p>
                  <p><strong>Versão:</strong> 1.0</p>
                </div>
              </div>
            </aside>

            {/* Conteúdo principal */}
            {/* Substituir cores hardcoded por classes Tailwind */}
            <div className="flex-1 bg-dark-card-bg rounded-xl shadow-lg border border-dark-border p-8 text-text-white">
              <h1 className="text-2xl md:text-3xl font-semibold text-accent-gold mb-6">
                {t("aboutPage.title")}
              </h1>

              <p className="mb-4">{t("aboutPage.intro")}</p>

              <h2 className="text-xl font-semibold mt-6 mb-2 text-accent-gold">
                {t("aboutPage.whatYouFind")}
              </h2>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>{t("aboutPage.feature1")}</li>
                <li>{t("aboutPage.feature2")}</li>
                <li>{t("aboutPage.feature3")}</li>
                <li>{t("aboutPage.feature4")}</li>
                <li>{t("aboutPage.feature5")}</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-2 text-accent-gold">
                {t("aboutPage.transparencyTitle")}
              </h2>
              <p className="mb-4">{t("aboutPage.transparencyText")}</p>
              <p className="mb-4">{t("aboutPage.contentNote")}</p>

              <h2 className="text-xl font-semibold mt-6 mb-2 text-accent-gold">
                {t("aboutPage.supportTitle")}
              </h2>
              <p className="mb-4">{t("aboutPage.supportText")}</p>

              {/* "text-gray-400" é uma cor padrão do Tailwind, então está ok */}
              <p className="text-sm text-gray-400 mt-8">{t("aboutPage.lastUpdate")}</p>

              <div className="mt-10">
                <Link
                  to="/"
                  // Substituir cores hardcoded por classes Tailwind
                  className="inline-block bg-accent-gold hover:bg-donate-bg-hover text-dark-background font-semibold py-2 px-4 rounded transition"
                >
                  {t("aboutPage.backToHome")}
                </Link>
              </div>
            </div>
          </div>
        </main>
        {/* Botões Fixos: permanecem aqui para sua flexibilidade de posicionamento */}
        <div className="fixed right-1 bottom-10 z-[9999] flex flex-col gap-2">
          <DonateButton
            href="https://www.paypal.com/donate/?business=6KXEQHVYHLLQ8&no_recurring=0&item_name=Host%2FVPS&currency_code=BRL"
            icon="/paypal.svg"
            label="Donate with PayPal"
          />
          <DonateButton
            href="https://livepix.gg/serialhealer"
            icon="/pix.svg"
            label="Doe com Pix"
          />
        </div>
        {/* REMOVER: <Footer /> */}
      {/* REMOVER: </> ou div de fechamento */}
    </Layout>
  );
};

export default Sobre;