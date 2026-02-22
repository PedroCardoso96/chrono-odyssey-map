// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarkersProvider } from './contexts/MarkersContext';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './i18n';

// --- Páginas ---
const HomePage = lazy(() => import('./pages/HomePage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const PoliticaDePrivacidade = lazy(() => import('./pages/PoliticaDePrivacidade'));
const Contato = lazy(() => import('./pages/Contato'));
const Sobre = lazy(() => import('./pages/Sobre'));
const Noticias = lazy(() => import('./pages/Noticias'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCanceledPage = lazy(() => import('./pages/PaymentCanceledPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUserEditPage = lazy(() => import('./pages/AdminUserEditPage')); // <-- 1. IMPORTA A PÁGINA DE EDIÇÃO

// --- Componente de Loading ---
const PageLoading = () => (
  <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
    <div className="text-[#c2a763] text-xl">A carregar...</div>
  </div>
);

// --- Componente Principal da Aplicação ---
export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <MarkersProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/subscribe" element={<SubscribePage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/canceled" element={<PaymentCanceledPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/user/:userId" element={<AdminUserEditPage />} /> {/* <-- 2. ADICIONA A NOVA ROTA */}
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MarkersProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
