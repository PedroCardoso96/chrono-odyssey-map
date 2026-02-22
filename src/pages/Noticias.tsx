// src/pages/Noticias.tsx
import React, { useEffect, useState } from "react";
// REMOVER: import Header from "../components/Header";
// REMOVER: import Footer from "../components/Footer";
import { Helmet } from "react-helmet";
import DonateButton from '../components/DonateButton'; // Manter, pois é um botão específico desta página

// --- NOVO: Importe o Layout ---
import Layout from '../components/Layout'; // Verifique o caminho correto

interface Noticia {
  id?: string;
  title: string;
  contentHtml: string;
  publishedAt: string;
  sourceUrl?: string;
}

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const res = await fetch("/newsapi/noticias");
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const data: Noticia[] = await res.json();

        const ordenadas = data
          .filter(n => n.title && n.contentHtml)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        setNoticias(ordenadas);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido ao carregar notícias.");
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  return (
    // Envolve todo o conteúdo da página com o componente Layout
    <Layout>
      <Helmet>
        {/* Títulos e descrições hardcoded em inglês, como combinado */}
        <title>News – Chrono Odyssey</title>
        <meta name="description" content="Latest news on Chrono Odyssey development." />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/noticias" />
      </Helmet>

      {/* REMOVER: A div principal com bg-[#0d0d0d] min-h-screen, pois o Layout já cuida disso */}
      {/* <div className="flex flex-col min-h-screen bg-[#0d0d0d] text-white"> */}
        {/* REMOVER: <Header /> */}

        {/* Mantenha o main com seus estilos, mas o bg-dark-background será do Layout */}
        <main className="flex justify-center py-12 px-4 min-h-screen">
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-[280px] sticky top-20 self-start">
              {/* Substituir hardcoded colors por classes Tailwind */}
              <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-md overflow-hidden">
                <img
                  src="/news-cover.webp"
                  alt="Chrono Odyssey"
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 text-text-white text-sm space-y-2"> {/* text-white agora é text-text-white */}
                  <h2 className="text-lg font-semibold text-accent-gold">Chrono Odyssey</h2> {/* #c2a763 agora é accent-gold */}
                  <p className="text-xs text-gray-400">To be announced</p>
                  <div className="border-t border-dark-divider my-2" /> {/* #333 agora é dark-divider */}
                  {noticias.length > 0 && (
                    <p>
                      <strong>Last Publication:</strong>{" "} {/* Texto pode ser traduzido aqui ou hardcoded se preferir */}
                      {new Date(noticias[0].publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <p><strong>Genre:</strong> MMORPG, Action, Fantasy</p>
                  <p><strong>Platform:</strong> PC</p>
                  <p><strong>Status:</strong> Closed Beta</p>
                </div>
              </div>
            </aside>

            {/* Conteúdo das notícias */}
            <div className="flex-1 space-y-10">
              {/* Substituir hardcoded colors por classes Tailwind */}
              {loading && <p className="text-text-white">Loading news...</p>}
              {error && <p className="text-red-500">Error: {error}</p>} {/* Red-500 é padrão do Tailwind, ok */}
              {!loading && noticias.length === 0 && (
                <p className="text-text-white">No news found.</p>
              )}

              {noticias.map((noticia) => (
                <article
                  key={noticia.id}
                  // Substituir hardcoded colors por classes Tailwind
                  className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-8"
                >
                  <h1 className="text-2xl md:text-3xl font-semibold text-accent-gold mb-4"> {/* #c2a763 agora é accent-gold */}
                    {noticia.title}
                  </h1>
                  <p className="text-sm text-gray-400 mb-6">
                    Published on:{" "} {/* Texto pode ser traduzido aqui ou hardcoded se preferir */}
                    {new Date(noticia.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <section
                    // As cores dentro de contentHtml (do Markdown) precisarão ser ajustadas via CSS global
                    // ou estilos de Tailwind passados para o prose, se o seu remark/markdown-to-html permitir.
                    // O `prose prose-invert` já ajuda com um tema escuro.
                    className="prose prose-invert max-w-none text-[17px] leading-relaxed [&_p]:mb-5 [&_li]:mb-2 [&_h2]:mb-6 [&_h3]:mb-4"
                    dangerouslySetInnerHTML={{ __html: noticia.contentHtml }}
                  />

                  {noticia.sourceUrl && (
                    <p className="mt-10 text-sm text-gray-400">
                      Source:{" "} {/* Texto pode ser traduzido aqui ou hardcoded se preferir */}
                      <a
                        href={noticia.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-gold underline hover:text-donate-text-gold" // #c2a763 agora é accent-gold, hover é donate-text-gold
                      >
                        External link
                      </a>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </main>

        {/* Botões fixos (Manter aqui, pois são específicos desta página) */}
        <div className="fixed right-1 bottom-10 z-[9999] flex flex-col gap-2">
          <DonateButton
            href="https://www.paypal.com/donate/?business=6KXEQHVYHLLQ8&no_recurring=0&item_name=Host%2FVPS&currency_code=BRL"
            icon="/paypal.svg"
            label="Donate with PayPal"
          />
          <DonateButton
            href="https://livepix.gg/serialhealer"
            icon="/pix.svg"
            label="Donate with Pix"
          />
        </div>

        {/* REMOVER: <Footer /> */}
      {/* REMOVER: </div> */}
    </Layout>
  );
}