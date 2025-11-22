import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";      // Landing Page
import App from "./App";                    // Painel LifeTracker
import { AuthProvider } from "./hooks/useAuth";  // 🔥 Provider de Autenticação

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>

    {/* 🔥 Provider global de autenticação */}
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Landing Page (página inicial) */}
          <Route path="/" element={<Landing />} />

          {/* Painel (requer usuário logado) */}
          <Route path="/painel" element={<App />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  </React.StrictMode>
);
