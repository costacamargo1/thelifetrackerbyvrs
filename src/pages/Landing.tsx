import React, { useState } from "react";
import LifeTrackerCompactLogo from "../components/LifeTrackerCompactLogo";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-sans bg-white text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <a href="/" className="flex items-center">
         <LifeTrackerCompactLogo/>
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
              <a href="/painel" className="font-medium text-slate-600 hover:text-primary-500 transition-all transform hover:-translate-y-0.5">
                Entrar
              </a>
              <a
                href="/painel"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Começar Gratuitamente
              </a>
            </div>

            {/* Botão Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
            >
              {!menuOpen ? (
                /* Ícone menu */
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              ) : (
                /* Ícone X */
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
              <a href="/painel" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">
                Entrar
              </a>
            </div>
            <a href="/painel" className="block w-full px-5 py-3 text-center font-medium text-white bg-primary-500 hover:bg-primary-600">
              Começar Gratuitamente
            </a>
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
                  <a
                    href="/painel"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Começar Gratuitamente
                  </a>

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
        <section id="features" className="py-20 bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary-500 tracking-wide uppercase">
                Recursos
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Inteligência financeira ao seu alcance
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                Ferramentas poderosas para você entender seu dinheiro como nunca antes.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* CARD 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m-3-3h6"/>
</svg>



                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Rastreamento de Gastos</h3>
                <p className="mt-2 text-base text-slate-600">
                  Categorize despesas automaticamente e veja relatórios claros.
                </p>
              </div>

              {/* CARD 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
</svg>

                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Monitoramento de Receitas</h3>
                <p className="mt-2 text-base text-slate-600">
                  Identifique suas principais fontes de renda.
                </p>
              </div>

              {/* CARD 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M3 6.75h18M16.5 10.5h.008v.008H16.5V10.5Zm0 3h.008v.008H16.5V13.5Zm0 3h.008v.008H16.5V16.5Zm-3-6h.008v.008H13.5V10.5Zm0 3h.008v.008H13.5V13.5Zm0 3h.008v.008H13.5V16.5Zm-3-6h.008v.008H10.5V10.5Zm0 3h.008v.008H10.5V13.5Zm0 3h.008v.008H10.5V16.5Z" />
</svg>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Projeções Futuras</h3>
                <p className="mt-2 text-base text-slate-600">
                  Planeje seu futuro com precisão.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Comece em 3 passos simples
            </h2>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-500 text-white text-2xl shadow-lg">
                    {n}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">
                    {n === 1 ? "Crie sua Conta" : n === 2 ? "Adicione suas Transações" : "Veja a Mágica"}
                  </h3>
                  <p className="mt-2 text-base text-slate-600">
                    {n === 1
                      ? "Cadastre-se gratuitamente."
                      : n === 2
                      ? "Adicione seus gastos e receitas."
                      : "Receba relatórios instantâneos."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PREÇOS */}
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

              <p className="mt-8 text-sm text-slate-600">
                Não solicitamos cartão de crédito — é realmente grátis.
              </p>

              <a
                href="/painel"
                className="mt-10 block w-full px-6 py-4 text-lg rounded-lg text-white bg-primary-500 hover:bg-primary-600 shadow-lg transform hover:-translate-y-0.5"
              >
                Garantir meu Acesso Gratuito
              </a>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-white py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Pronto para transformar sua vida financeira?
            </h2>

            <a
              href="/painel"
              className="mt-10 inline-flex items-center justify-center px-10 py-4 text-lg rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition shadow-lg"
            >
              Começar Gratuitamente Agora
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="container mx-auto max-w-7xl px-4 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* LOGO */}
          <div className="col-span-2 lg:col-span-2">
            <span className="font-extrabold text-3xl text-primary-500">LifeTracker</span>
            <p className="mt-4 text-base max-w-xs">Organizando seu presente, projetando seu futuro.</p>
          </div>

          {/* PRODUTO */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase">Produto</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#features" className="hover:text-white">Recursos</a></li>
              <li><a href="#pricing" className="hover:text-white">Preços</a></li>
            </ul>
          </div>

          {/* EMPRESA */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase">Empresa</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="hover:text-white">Sobre</a></li>
              <li><a href="#" className="hover:text-white">Carreiras</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="hover:text-white">Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Termos</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 py-8 text-center text-base">
          © 2025 LifeTracker. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
