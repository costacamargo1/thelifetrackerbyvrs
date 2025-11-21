import React, { useState, useEffect } from 'react';
import LifeTracker from './LifeTracker';

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean; err?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, err: error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Erro no LifeTracker:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Opa, algo quebrou no LifeTracker.</h2>
          <p style={{ marginTop: 8 }}>
            Detalhe: {String(this.state.err?.message || this.state.err)}
          </p>
          <p style={{ marginTop: 8, opacity: 0.7 }}>
            Veja o Console (F12 &gt; Console) para mais informações.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // -------------------------------
  // DETECTA TEMA AUTOMÁTICO DO SISTEMA PARA NÃO CEGAR O USUÁRIO COM UMA POPFLASH DO PROFESSOR FALLEN
  // -------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
      return;
    }

    if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
      return;
    }

    // Sem preferência → usa tema do sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  // -------------------------------
  // BOTÃO PRA TROCAR O TEMA PADRÃO FIFA
  // -------------------------------
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // -------------------------------

  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <LifeTracker darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </ErrorBoundary>
    </div>
  );
}
