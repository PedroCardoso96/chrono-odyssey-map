// src/pages/PoliticaDePrivacidade.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Adicionar Helmet para SEO
// REMOVER: import Header from '../components/Header';
// REMOVER: import Footer from '../components/Footer';

// --- NOVO: Importe o Layout ---
import Layout from '../components/Layout'; // Verifique o caminho correto

const PoliticaDePrivacidade = () => {
  return (
    // Envolve todo o conteúdo da página com o componente Layout
    <Layout>
      <Helmet>
        {/* Conteúdo do Helmet hardcoded em inglês */}
        <title>Privacy Policy – Chrono Odyssey</title>
        <meta
          name="description"
          content="Learn about how user information is collected, used, and protected on Chrono Odyssey's website."
        />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/politica-de-privacidade" />
      </Helmet>

      {/* REMOVER: A div principal com as cores e min-h-screen, pois o Layout já cuida disso */}
      {/* <div className="flex flex-col min-h-screen bg-[#0d0d0d]"> */}
        {/* REMOVER: <Header /> */}

        {/* Mantenha o 'main' e suas classes, mas as cores bg-dark-background virão do Layout */}
        <main className="flex-grow flex items-center justify-center py-12 px-4">

          {/* Substituir cores hardcoded por classes Tailwind e usar texto em inglês */}
          <div className="max-w-4xl w-full mx-auto p-8 md:p-12 bg-dark-card-bg border border-dark-border rounded-xl shadow-lg text-text-gray-300">

            <h1 className="text-3xl font-bold mb-6 text-center text-accent-gold">
              Privacy Policy
            </h1>

            <p className="mb-4 leading-relaxed">
              This Privacy Policy describes how user information is collected, used, and protected when using our website.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3 text-accent-gold">1. Information Collection</h2>
            <p className="mb-4 leading-relaxed">
              We use cookies to improve your Browse experience. These cookies may include anonymous data about your activity on the site.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3 text-accent-gold">2. Advertising (Google AdSense)</h2>
            <p className="mb-4 leading-relaxed">
              Our website uses Google AdSense to display advertisements. Google may use cookies to display personalized ads based on your previous visits to this and other sites.
            </p>
            <p className="mb-4 leading-relaxed">
              You can opt out of personalized advertising by visiting:{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-accent-gold hover:text-text-white transition-colors" // Hover text-white para contraste
              >
                Google Ad Settings
              </a>
              .
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3 text-accent-gold">3. Consent</h2>
            <p className="mb-4 leading-relaxed">
              By continuing to use our website, you consent to the use of cookies as described in this policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3 text-accent-gold">4. Changes to this Policy</h2>
            <p className="mb-4 leading-relaxed">
              This policy may be updated occasionally. We recommend reviewing it periodically.
            </p>

            <p className="mt-10 text-sm text-gray-400 text-center">
              Last updated: {new Date("2025-07-19").toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="mt-10 text-center">
              <Link
                to="/"
                className="inline-block bg-accent-gold hover:bg-donate-bg-hover text-dark-background font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md"
              >
                ← Back to Home Page
              </Link>
            </div>
          </div>
        </main>

        {/* REMOVER: <Footer /> */}
      {/* REMOVER: </div> */}
    </Layout>
  );
};

export default PoliticaDePrivacidade;