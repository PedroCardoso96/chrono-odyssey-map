// src/pages/MapPage.tsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

// --- IMPORTS NECESSÁRIOS (Manter) ---
import MapComponent from '../components/MapComponent';
import FilterSidebar from '../components/FilterSidebar';
import DonateButton from '../components/DonateButton';
import { useFilters } from '../hooks/useFilters';
// import { isUserAdmin } from '../utils/isUserAdmin'; // ✅ REMOVIDO: Não é mais necessário
import Content from '../components/Content';

// --- NOVO: Importe o Layout ---
import Layout from '../components/Layout';

// --- NOVO: Importe o PremiumTimersBanner ---
import PremiumTimersBanner from '../components/PremiumTimersBanner';

// NOVO: Importe o useAuth para ter acesso reativo ao usuário
import { useAuth } from '../contexts/AuthContext';

//IMPORT DO CSS DO POPUP LEAFLET
import './../styles/leaflet-custom-popup.css';

export default function MapPage() {
  const { filters, toggleFilter, hideAll, showAll } = useFilters();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { user, isLoading } = useAuth();
  // ✅ MUDANÇA: Use user?.isAdmin diretamente, pois já vem do JWT
  const isAdmin = user?.isAdmin || false;

  // ✅ REMOVIDO: PremiumTimersBanner não precisa mais desta prop
  // const isUserActuallyPremium = user?.isPremium || false;

  return (
    <Layout>
      <Helmet>
        <title>Chrono Odyssey | Interactive Map</title>
        <meta name="description" content="Explore o mapa interativo de Chrono Odyssey com todas as localizações, chefes e recursos." />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/map" />
      </Helmet>

      {/* Main agora ocupa a tela inteira (h-screen) e é um contêiner flexível. */}
      <main className="flex flex-1 relative h-screen">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-20 left-4 p-2 rounded-md"
            style={{ zIndex: 9999 }}
            title="Open filters"
          >
            <img src="/botaosidebar.webp" alt="Open" className="w-7 h-7" />
          </button>
        )}

        <FilterSidebar
          filters={filters}
          toggleFilter={toggleFilter}
          hideAll={hideAll}
          showAll={showAll}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          onClearAll={() => { alert('Clear markers functionality to be implemented.'); }}
        />

        {/* Contêiner do Mapa - agora ocupa o espaço restante do flex e tem sua própria altura flexível. */}
        <div className="flex-1 h-full flex flex-col">
          <MapComponent filters={filters} />
        </div>
      </main>

      {/* ================================================================== */}
      {/* == NOVO: BANNER DE TIMERS PREMIUM (Abaixo do main do mapa) == */}
      {/* ================================================================== */}
      <div className="container mx-auto px-4 mt-8 max-w-[1900px]">
        {/* ✅ MUDANÇA: Removida a prop isUserPremium, pois o componente a obtém do useAuth */}
        <PremiumTimersBanner />
      </div>

      {/* ================================================================== */}
      {/* == SEÇÃO DE DOAÇÃO E CONTEÚDO (Permanecem aqui) == */}
      {/* ================================================================== */}
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

      <Content />
    </Layout>
  );
}
