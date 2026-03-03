// src/pages/Noticias.tsx
import React, { useEffect, useState, memo } from "react";
import { Helmet } from "react-helmet";
import DonateButton from '../components/DonateButton';
import Layout from '../components/Layout'; 

interface Noticia {
  id: string; 
  title: string;
  contentHtml: string;
  publishedAt: string;
  sourceUrl?: string;
}

// COMPONENTE MEMOIZADO: Isso garante que a notícia carregue uma vez e 
// o React nunca mais encoste nela, preservando o Iframe do Twitter lá dentro.
const NoticiaItem = memo(({ noticia }: { noticia: Noticia }) => {
  return (
    <article
      id={noticia.id}
      className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-6 md:p-8 scroll-mt-24"
    >
      <h1 className="text-2xl md:text-3xl font-semibold text-accent-gold mb-4">{noticia.title}</h1>
      <p className="text-sm text-gray-400 mb-6 font-mono uppercase tracking-widest">
        [ {new Date(noticia.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ]
      </p>
      
      <section
        className="prose prose-invert max-w-none text-[17px] leading-relaxed 
        [&_p]:mb-5 [&_li]:mb-2 [&_h2]:mb-6 [&_h3]:mb-4
        [&_.twitter-tweet]:min-h-[350px] [&_.twitter-tweet]:my-8 [&_.twitter-tweet]:mx-auto"
        dangerouslySetInnerHTML={{ __html: noticia.contentHtml }}
      />
      
      {noticia.sourceUrl && (
        <p className="mt-10 text-xs text-gray-500 border-t border-dark-divider pt-4 text-right italic font-mono uppercase">
          Origin: <a href={noticia.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent-gold underline hover:text-white transition-colors">Source Protocol</a>
        </p>
      )}
    </article>
  );
}, (prevProps, nextProps) => {
  // Regra de ouro: Só re-renderiza se o ID da notícia mudar (o que nunca acontece nesta lista)
  return prevProps.noticia.id === nextProps.noticia.id;
});

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        if (ordenadas.length > 0) setActiveId(ordenadas[0].id);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }
    fetchNoticias();
  }, []);

  // Injeção do Script e Meta Tag (Dark Mode)
  useEffect(() => {
    if (!document.getElementById('twitter-wjs')) {
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    let meta = document.querySelector('meta[name="twitter:widgets:theme"]');
    if (!meta) {
      meta = document.createElement('meta');
      (meta as any).name = "twitter:widgets:theme";
      (meta as any).content = "dark";
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Re-carrega os widgets apenas quando as notícias terminam de carregar a primeira vez
  useEffect(() => {
    if (noticias.length > 0 && (window as any).twttr && (window as any).twttr.widgets) {
      (window as any).twttr.widgets.load();
    }
  }, [noticias]);

  // Observer de Scroll (Isolado para não afetar o componente NoticiaItem)
  useEffect(() => {
    const handleScroll = () => {
      const articles = document.querySelectorAll('article[id]');
      let currentActiveId = null;
      articles.forEach((article) => {
        const rect = article.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2.5 && rect.bottom >= 100) {
          currentActiveId = article.id;
        }
      });
      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId]);

  const scrollToArticle = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>News – Chrono Odyssey</title>
      </Helmet>

      <main className="flex justify-center py-12 px-4 min-h-screen">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR ESQUERDA */}
          <aside className="w-full lg:w-[280px] shrink-0 sticky top-24 self-start hidden md:block">
            <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-md overflow-hidden">
              <img src="/news-cover.webp" alt="Cover" className="w-full h-auto object-cover" />
              <div className="p-4 text-text-white text-sm space-y-2">
                <h2 className="text-lg font-semibold text-accent-gold">Chrono Odyssey</h2>
                <div className="border-t border-dark-divider my-2" />
                <p><strong>Platform:</strong> PC</p>
                <p><strong>Status:</strong> Closed Beta</p>
              </div>
            </div>
          </aside>

          {/* CENTRO (Com NoticiaItem Protegido) */}
          <div className="flex-1 space-y-12 min-w-0">
            {loading && <p className="text-text-white text-center py-10 font-mono animate-pulse tracking-widest text-accent-gold">[[ ACCESSING ENCRYPTED DATA... ]]</p>}
            
            {noticias.map((noticia) => (
              <NoticiaItem key={noticia.id} noticia={noticia} />
            ))}
          </div>

          {/* SIDEBAR DIREITA */}
          <aside className="hidden xl:block w-[280px] shrink-0 sticky top-24 self-start">
            <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-md p-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-dark-divider pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping"></span>
                Timeline
              </h3>
              <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-dark-border hover:[&::-webkit-scrollbar-thumb]:bg-accent-gold [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                {noticias.map(n => (
                  <li key={n.id}>
                    <button
                      onClick={() => scrollToArticle(n.id)}
                      className={`text-left w-full text-xs py-2 px-3 rounded transition-all duration-300 border-l-2 ${
                        activeId === n.id 
                          ? 'bg-accent-gold/10 border-accent-gold text-accent-gold font-bold translate-x-1' 
                          : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {n.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed right-1 bottom-10 z-[9999] flex flex-col gap-2">
        <DonateButton href="https://livepix.gg/serialhealer" icon="/pix.svg" label="Support Project" />
      </div>
    </Layout>
  );
}