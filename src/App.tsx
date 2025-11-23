import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LifeTracker from './LifeTracker';
import { useAuth } from './hooks/useAuth';

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
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2>Opa, algo quebrou no LifeTracker.</h2>
          <p style={{ marginTop: 8 }}>
            Verifique o console para mais detalhes.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o carregamento terminou e não há usuário/sessão, redireciona para a landing page.
    if (!loading && !session) {
      navigate('/');
    }
  }, [user, session, loading, navigate]);

  // Enquanto o estado de autenticação está sendo verificado, mostra um loader.
  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Carregando...</p>
      </div>
    );
  }
  
  // Se o usuário está autenticado, renderiza a aplicação principal.
  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <LifeTracker />
      </ErrorBoundary>
    </div>
  );
}
