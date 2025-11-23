export type TipoAssinatura = 'ASSINATURA' | 'CONTRATO - ALUGUEL' | 'CONTRATO - PERSONALIZADO' | 'ACORDO';
export type TipoPagamento = 'DÉBITO' | 'CRÉDITO';
export type Periodo = 'MENSAL' | 'ANUAL';
export type StatusObj =
  | 'IMEDIATO'
  | 'EM PROGRESSO'
  | 'DISTANTE'
  | 'QUITADO - EM PROGRESSO'
  | 'QUITADO - FINALIZADO';

// Tipagens alinhadas com o Supabase

export interface Gasto {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  metodo_pagamento: TipoPagamento;
  created_at: string;
  // Campos legados que podem ser úteis para a UI
  cartaoId?: string | null;
  cartaoNome?: string | null;
  parcelaAtual?: number;
  parcelasTotal?: number;
}

export interface Receita {
  id: string;
  user_id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  origem: string;
  created_at: string;
}

export interface Assinatura {
  id: string;
  user_id: string;
  nome: string;
  valor: number;
  ciclo: Periodo;
  proximo_pagamento: string;
  categoria: string;
  created_at: string;
}

export interface Objetivo {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  valor_total: number;
  valor_atual: number;
  prazo?: string;
  status: StatusObj;
  is_principal?: boolean;
  created_at: string;
}

export interface Cartao {
  id: string;
  user_id: string;
  nome: string;
  bandeira: string;
  limite: number;
  fechamento: number;
  vencimento: number;
  is_principal?: boolean;
  created_at: string;
}

export interface Fatura {
  id: string;
  user_id: string;
  cartao_id: string;
  ano: number;
  mes: number;
  valor_total: number;
  paga: boolean;
  created_at: string;
}

export interface FaturaTransacao {
  id: string;
  user_id: string;
  fatura_id: string;
  descricao: string;
  valor: number;
  parcelas: number;
  parcela_atual: number;
  data: string;
  created_at: string;
}

export type CategoryType = 'receita' | 'gasto';

export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: CategoryType;
  icone: string;
  created_at: string;
}

export interface Configuracoes {
  user_id: string;
  tema?: 'light' | 'dark';
  moeda?: string;
  primeiro_acesso?: boolean;
  created_at: string;
}


export type Tab = 'dashboard' | 'gastos' | 'receitas' | 'contas-recorrentes' | 'objetivos' | 'cartoes' | 'dividas' | 'faturas' | 'resumo-anual' | 'configuracoes';