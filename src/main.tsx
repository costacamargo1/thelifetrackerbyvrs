import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";  // sua landing convertida
import App from "./App";               // seu painel atual

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing vira a primeira página */}
        <Route path="/" element={<Landing />} />

        {/* Seu painel atual fica em /painel */}
        <Route path="/painel" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
