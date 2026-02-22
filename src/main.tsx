// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./i18n"; // ✅ Inicializa i18next
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Verifica a variável de ambiente do Google OAuth
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  throw new Error("VITE_GOOGLE_CLIENT_ID is not defined in your environment files");
}

// Renderiza a aplicação dentro do GoogleOAuthProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
