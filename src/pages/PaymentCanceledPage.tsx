// src/pages/PaymentCanceledPage.tsx
import React from 'react';
import Layout from '../components/Layout'; // Verifique se o caminho para o Layout está correto

const PaymentCanceledPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-lg text-center p-8 md:p-12 rounded-lg border bg-dark-card-bg border-dark-border">
          
          {/* Ícone de Falha/Cancelamento */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-500/10">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl md:text-4xl font-bold text-text-white">
            Pagamento Cancelado
          </h1>

          {/* Mensagem de Confirmação */}
          <p className="mt-4 text-lg text-text-gray-300">
            A transação não foi concluída. Sua assinatura não foi ativada. Você pode tentar novamente a qualquer momento.
          </p>

          {/* Divisor Estilizado */}
          <div className="my-8 h-px w-full bg-dark-divider"></div>

          {/* Botão de Call-to-Action */}
          <a
            href="/subscribe" // Este link leva o usuário de volta para a página de assinatura.
            className="inline-block w-full sm:w-auto bg-accent-gold text-dark-background font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity duration-300"
          >
            Try Again!
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCanceledPage;
