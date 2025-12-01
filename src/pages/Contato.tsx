// src/pages/Contato.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet"; // Adicionar Helmet para SEO
import { useTranslation } from "react-i18next"; // Manter useTranslation para Helmet e link de voltar

// --- NOVO: Importe o Layout ---
import Layout from '../components/Layout'; // Verifique o caminho correto

const Contato = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Inicialize useTranslation (para Helmet e link de voltar)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "connectionError">("idle"); // Expandir o tipo de status

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xyzjpqjb", { // Mantenha seu endpoint Formspree
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("sent");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setStatus("error"); // Definir status de erro genérico
      }
    } catch (error) {
      setStatus("connectionError"); // Definir status de erro de conexão
    }
  };

  return (
    <Layout>
      <Helmet>
        {/* Usando i18n para o conteúdo do Helmet */}
        <title>{t('footerExtended.contactTitle')} | Chrono Odyssey</title>
        <meta name="description" content={t('footerExtended.contactSubtitle')} />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/contato" />
      </Helmet>

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full mx-auto p-8 bg-dark-card-bg border border-dark-border rounded-xl shadow-lg text-text-white">

          <h1 className="text-2xl font-bold mb-4 text-accent-gold">
            Contact Us
          </h1>

          <p className="mb-4">
            For questions, suggestions, or to report website errors, please use the form below:
          </p>

          {status === "sent" ? (
            <div className="text-green-400 font-semibold mb-6">
              ✅ Message sent successfully! Redirecting to home page...
            </div>
          ) : status === "error" ? (
            <div className="text-red-500 font-semibold mb-6">
              An error occurred while sending. Please try again.
            </div>
          ) : status === "connectionError" ? (
            <div className="text-red-500 font-semibold mb-6">
              Connection error. Please try again.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold"
                />
              </div>

              <div>
                <label className="block mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold"
                />
              </div>

              <div>
                <label className="block mb-1">Message:</label>
                <textarea
                  name="message"
                  rows={6}
                  required
                  className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-accent-gold hover:bg-donate-bg-hover text-dark-background font-semibold py-2 px-4 rounded disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </form>
          )}

          <div className="mt-8">
            <Link
              to="/"
              className="inline-block bg-accent-gold hover:bg-donate-bg-hover text-dark-background font-semibold py-2 px-4 rounded transition"
            >
               {t("aboutPage.backToHome")} {/* Mantém i18n para este link */}
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString("en-US")} {/* Data formatada em inglês diretamente */}
          </p>
        </div>
      </main>
    </Layout>
  );
};

export default Contato;