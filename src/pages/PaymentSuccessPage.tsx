// src/pages/PaymentSuccess.tsx
import React from 'react';
import Layout from '../components/Layout'; // Verifique se o caminho para o Layout está correto

const PaymentSuccess: React.FC = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-lg text-center p-8 md:p-12 rounded-lg border bg-dark-card-bg border-dark-border">
          
          {/* Ícone de Sucesso */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/10">
            <svg
              className="h-12 w-12 text-accent-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl md:text-4xl font-bold text-text-white">
            Payment Confirmed!
          </h1>

          {/* Mensagem de Confirmação */}
          <p className="mt-4 text-lg text-text-gray-300">
            Obrigado por se juntar à nossa comunidade. Sua assinatura premium está ativa e você já pode desfrutar de todos os benefícios exclusivos.
          </p>

          {/* Divisor Estilizado */}
          <div className="my-8 h-px w-full bg-dark-divider"></div>

          {/* Botão de Call-to-Action */}
          <a
            href="/" // Este link leva o usuário de volta para a página inicial.
            className="inline-block w-full sm:w-auto bg-accent-gold text-dark-background font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity duration-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;