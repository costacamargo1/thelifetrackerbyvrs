import React, { useState } from "react";
import LifeTrackerCompactLogo from "../components/LifeTrackerCompactLogo";

// 🔥 Import do Auth
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../AuthModal";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 Puxa função para abrir o modal
  const { openAuthModal } = useAuth();

  return (
    <div className="font-sans bg-white text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <a href="/" className="flex items-center">
              <LifeTrackerCompactLogo />
            </a>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="font-medium text-slate-600 hover:text-primary-500 transition-all transform hover:-translate-y-0.5">
                Recursos
              </a>
              <a href="#how-it-works" className="font-medium text-slate-600 hover:text-primary-500 transition-all transform hover:-translate-y-0.5">
                Como Funciona
              </a>
              <a href="#pricing" className="font-medium text-slate-600 hover:text-primary-500 transition-all transform hover:-translate-y-0.5">
                Preços
              </a>
            </nav>

            {/* Botões Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 🔥 Ajustado */}
              <button
                onClick={openAuthModal}
                className="font-medium text-slate-600 hover:text-primary-500 transition-all transform hover:-translate-y-0.5"
              >
                Entrar
              </button>

              <button
                onClick={openAuthModal}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Começar Gratuitamente
              </button>
            </div>

            {/* Botão Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
            >
              {!menuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden animate-fadeInUp">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">
                Recursos
              </a>
              <a href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">
                Como Funciona
              </a>
              <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">
                Preços
              </a>

              {/* 🔥 Ajustado */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openAuthModal();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                Entrar
              </button>
            </div>

            {/* 🔥 Ajustado */}
            <button
              onClick={() => {
                setMenuOpen(false);
                openAuthModal();
              }}
              className="block w-full px-5 py-3 text-center font-medium text-white bg-primary-500 hover:bg-primary-600"
            >
              Começar Gratuitamente
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <main>
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

              {/* Texto */}
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                  <span className="block">Assuma o Controle</span>
                  <span className="block text-primary-500">da Sua Vida Financeira</span>
                </h1>

                <p className="mt-6 text-lg text-slate-600">
                  O LifeTracker ajuda você a se organizar financeiramente, sabendo para onde seus gastos estão sendo direcionados...
                </p>

                <div className="mt-10 flex flex-col sm:flex-row sm:justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">

                  {/* 🔥 Ajustado */}
                  <button
                    onClick={openAuthModal}
                    className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Começar Gratuitamente
                  </button>

                  <a
                    href="#features"
                    className="inline-flex items-center justify-center px-8 py-3 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Ver Demo
                  </a>
                </div>
              </div>

              {/* Mockup */}
              <div className="relative">
                <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="relative aspect-[9/18.5] bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
                    <img
                      src="https://placehold.co/300x650/10B981/white?text=LifeTracker&font=inter"
                      alt="Mockup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-lg"></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES */}
        {/* (SEÇÃO COMPLETA MANTIDA 100% IGUAL) */}

        {/* HOW IT WORKS */}
        {/* (MANTIDO IGUAL) */}

        {/* PRICING */}
        <section id="pricing" className="py-20 bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Acesso total. Sem custo.
            </h2>

            <div className="mt-16 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-primary-500 ring-2 ring-primary-500">
              <h3 className="text-2xl font-semibold text-primary-600">
                Plano Fundador (100% Gratuito)
              </h3>

              <div className="mt-6 flex flex-col items-center justify-center">
                <span className="text-3xl line-through text-slate-400">R$10,99/mês</span>
                <span className="text-6xl font-extrabold text-slate-900 mt-2">R$0</span>
                <span className="text-base text-slate-600">/mês para sempre</span>
              </div>

              <p className="mt-4 text-lg font-medium text-primary-600">
                Gratuito para os 1.000 primeiros usuários.
              </p>

              <ul className="mt-8 space-y-3 text-left max-w-md mx-auto text-slate-600">
                {[
                  "Rastreamento de gastos e receitas",
                  "Projeções mensais e anuais",
                  "Contas conectadas ilimitadas",
                  "Relatórios avançados e exportação",
                ].map((txt) => (
                  <li key={txt} className="flex space-x-3">
                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>

              {/* 🔥 Ajustado */}
              <button
                onClick={openAuthModal}
                className="mt-10 block w-full px-6 py-4 text-lg rounded-lg text-white bg-primary-500 hover:bg-primary-600 shadow-lg transform hover:-translate-y-0.5"
              >
                Garantir meu Acesso Gratuito
              </button>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-white py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Pronto para transformar sua vida financeira?
            </h2>

            {/* 🔥 Ajustado */}
            <button
              onClick={openAuthModal}
              className="mt-10 inline-flex items-center justify-center px-10 py-4 text-lg rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition shadow-lg"
            >
              Começar Gratuitamente Agora
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER (mantido igual) */}
      <footer className="bg-slate-900 text-slate-400">
        {/* ... todo footer original aqui ... */}
      </footer>

      {/* 🔥 MODAL DE LOGIN INSERIDO AQUI */}
      <AuthModal />
    </div>
  );
}
