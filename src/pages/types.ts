export type TipoAssinatura = 'ASSINATURA' | 'CONTRATO - ALUGUEL' | 'CONTRATO - PERSONALIZADO' | 'ACORDO';
export type TipoPagamento = 'DÉBITO' | 'CRÉDITO';
export type Periodo = 'MENSAL' | 'ANUAL';
export type StatusObj =
  | 'IMEDIATO'
  | 'EM PROGRESSO'
  | 'DISTANTE'
  | 'QUITADO - EM PROGRESSO'
  | 'QUITADO - FINALIZADO';

export interface Gasto {
  id: number;
  descricao: string;
  valor: string;
  categoria: string;
  data: string;
  tipoPagamento: TipoPagamento;
  cartaoId: number | null;
  cartaoNome?: string | null;
  parcelaAtual?: number;
  parcelasTotal?: number;
  parcelaId?: string;
}

export interface Receita { id: number; descricao: string; valor: string; data: string; }
export interface Assinatura {
  id: number; nome: string; valor: string; diaCobranca: number; mesCobranca?: number; anoAdesao?: number; tipo: TipoAssinatura; categoriaPersonalizada?: string; tipoPagamento: TipoPagamento; cartaoId: number | null; cartaoNome?: string | null; periodoCobranca: Periodo; pagoEsteMes?: boolean; parcelasTotal?: number; parcelaAtual?: number;
}
export interface Objetivo { id: number; nome: string; valorNecessario: string; valorAtual: number; status: StatusObj; isPrincipal?: boolean; }
export interface Cartao { 
  id: number; 
  nome: string; 
  limite: string; 
  diaVencimento: number; 
  diaFechamento: number;
  isPrincipal?: boolean;
}

export type CategoryType = 'receita' | 'despesa';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
}

export interface Configuracoes {
  user_id: string;
  created_at: string;
  tema: 'light' | 'dark';
  moeda: string;
  primeiro_acesso: boolean;
  credito: { alerta: string; critico: string; positivo: string; };
  saldo: { alerta:string; critico: string; positivo: string; };
  categories: Category[];
}

export type Tab = 'dashboard' | 'gastos' | 'receitas' | 'contas-recorrentes' | 'objetivos' | 'cartoes' | 'dividas' | 'faturas' | 'resumo-anual' | 'configuracoes';

export interface Fatura {
  id: number;
  user_id: string;
  cartao_id: number;
  mes: number;
  ano: number;
  total: string;
  status: string;
}

export interface FaturaTransacao {
  id: number;
  user_id: string;
  fatura_id: number;
  gasto_id: number;
  data: string;
  descricao: string;
  valor: string;
  categoria: string;
}

