// src/pages/SubscribePage.tsx
import React, { useState } from 'react';
import Layout from '../components/Layout'; // Ajuste o caminho se for necessário
import { useAuth } from '../contexts/AuthContext'; // Hook para obter dados do usuário
import { useTranslation } from 'react-i18next'; // Para usar traduções

const SubscribePage: React.FC = () => {
  const { user, token } = useAuth(); // ✅ MUDANÇA: Pega o token do useAuth
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ IDs de Preço de PRODUÇÃO ATUALIZADOS
  const brlPriceId = 'price_1RnFT4JnAFFsyAiZDaZ2HMhx'; // Preço de R$10/mês
  const usdPriceId = 'price_1RnFU3JnAFFsyAiZ1pJlFgOL'; // Preço de $3/mês

  /**
   * Função que lida com o processo de assinatura.
   * @param priceId - O ID do preço do Stripe para o plano selecionado.
   */
  const handleSubscription = async (priceId: string) => {
    setLoading(true);
    setError(null);

    if (!user || !token) { // ✅ MUDANÇA: Verifica se há usuário E token
      setError('Você precisa estar logado para assinar.');
      setLoading(false);
      return;
    }

    try {
      // ✅ MUDANÇA: Usa o token diretamente do useAuth
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Usa o token do useAuth
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao iniciar o processo de pagamento.');
      }

      const session = await response.json();

      if (session.url) {
        window.open(session.url, '_blank');
      } else {
        throw new Error('Não foi possível obter a URL de checkout.');
      }

    } catch (e: any) {
      console.error('Erro no processo de assinatura:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-white">
            Seja um Membro Premium
          </h1>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl">
            Acesso irrestrito a todo o conteúdo da plataforma.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-8">
          {/* CARD 1: REAIS (BRL) */}
          <div className="flex flex-col w-full max-w-md p-8 rounded-lg border bg-dark-card-bg border-dark-border">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-center text-text-white">Assinatura Premium</h2>
              <div className="text-center my-8">
                <span className="text-5xl font-extrabold text-text-white">R$10</span>
                <span className="text-xl text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 text-text-gray-300 mb-8">
                <li className="flex items-center">
                  <span className="text-accent-gold mr-2">✔</span> Acesso a todo conteúdo
                </li>
                <li className="flex items-center">
                  <span className="text-accent-gold mr-2">✔</span> Projetos e Código Fonte
                </li>
                <li className="flex items-center">
                  <span className="text-accent-gold mr-2">✔</span> Suporte Prioritário
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscription(brlPriceId)}
              disabled={loading || !user} // Desabilita se não estiver logado
              className="w-full bg-accent-gold text-dark-background font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : user ? 'Assinar por R$10' : 'Faça login para assinar'}
            </button>
          </div>

          {/* CARD 2: DÓLAR (USD) */}
          <div className="flex flex-col w-full max-w-md p-8 rounded-lg border bg-dark-card-bg border-dark-border">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-center text-blue-400">Premium Subscription</h2>
              <div className="text-center my-8">
                <span className="text-5xl font-extrabold text-text-white">$3</span>
                <span className="text-xl text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 text-text-gray-300 mb-8">
                   <li className="flex items-center">
                     <span className="text-blue-400 mr-2">✔</span> Access to all content
                   </li>
                   <li className="flex items-center">
                     <span className="text-blue-400 mr-2">✔</span> Projects and Source Code
                   </li>
                   <li className="flex items-center">
                     <span className="text-blue-400 mr-2">✔</span> Priority Support
                   </li>
               </ul>
            </div>
            <button
              onClick={() => handleSubscription(usdPriceId)}
              disabled={loading || !user} // Desabilita se não estiver logado
              className="w-full bg-white text-blue-700 font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : user ? 'Subscribe for $3' : 'Login to subscribe'}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-center mt-8">{error}</p>}
      </div>
    </Layout>
  );
};

export default SubscribePage;
