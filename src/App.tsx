import React, { useState } from 'react';
import LifeTracker from './LifeTracker';

class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean; err?: any }> {
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
          <h2>😵 Opa, algo quebrou no Life Tracker.</h2>
          <p style={{ marginTop: 8 }}>Detalhe: {String(this.state.err?.message || this.state.err)}</p>
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

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 ${darkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        <LifeTracker darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </ErrorBoundary>
    </div>
  );
}
