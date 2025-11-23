import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
