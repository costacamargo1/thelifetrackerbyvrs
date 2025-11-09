import React from 'react';

import Nubank from './components/assets/icons/card-nubank.svg';
import Itau from './components/assets/icons/card-itau.svg';
import Bradesco from './components/assets/icons/card-bradesco.svg';
import BB from './components/assets/icons/card-bb.svg';
import Caixa from './components/assets/icons/card-caixa.svg';
import Santander from './components/assets/icons/card-santander.svg';
import C6 from './components/assets/icons/card-c6.svg';


/** =========================
 * Tipos básicos
 * ========================= */
type TipoAssinatura = 'ASSINATURA' | 'CONTRATO - ALUGUEL' | 'CONTRATO - PERSONALIZADO' | 'ACORDO';
type TipoPagamento = 'DÉBITO' | 'CRÉDITO';
type Periodo = 'MENSAL' | 'ANUAL';
type StatusObj =
  | 'IMEDIATO'
  | 'EM PROGRESSO'
  | 'DISTANTE'
  | 'QUITADO - EM PROGRESSO'
  | 'QUITADO - FINALIZADO';
interface Gasto { // ... (sem alterações na interface)
  id: number;
  descricao: string;
  valor: string;           // mantemos string nos forms
  categoria: string;
  data: string;            // yyyy-mm-dd
  tipoPagamento: TipoPagamento;
  cartaoId: number | null; // Será `number` para crédito, `null` para débito
  cartaoNome?: string | null;
  parcelaAtual?: number;
  parcelasTotal?: number;
  parcelaId?: string; // Para agrupar gastos de uma mesma compra parcelada
}

interface Receita { id: number; descricao: string; valor: string; data: string; }
interface Divida { id: number; pessoa: string; valor: string; descricao: string; }
interface Assinatura {
  id: number;
  nome: string;
  valor: string;
  diaCobranca: number;
  mesCobranca?: number;
  anoAdesao?: number;
  tipo: TipoAssinatura;
  categoriaPersonalizada?: string;
  tipoPagamento: TipoPagamento;
  cartaoId: number | null;
  cartaoNome?: string | null;
  periodoCobranca: Periodo;
  pagoEsteMes?: boolean; // Para CONTRATO - ALUGUEL
  parcelasTotal?: number;  // Só para 'ACORDO', número total de parcelas
  parcelaAtual?: number;   // Começa em 1, incrementa ao "pagar"
}
interface Objetivo { id: number; nome: string; valorNecessario: string; valorAtual: number; status: StatusObj; }
interface Cartao { id: number; nome: string; limite: string; diaVencimento: number; }
interface Configuracoes {
  credito: {
    alerta: string; 
    critico: string;
    positivo: string;
  };
  saldo: {
    alerta: string;
    critico: string;
    positivo: string;
  }; // Closing bracket for 'saldo'
}


/** =========================
 * Helpers
 * ========================= */
const getDadosCartao = (nomeCartao: string): { bg: string; text: string; imagem: string | null } => {
  const nome = (nomeCartao || '').toLowerCase();

  if (nome.includes('nubank')) return { bg: 'bg-purple-600', text: 'text-white', imagem: Nubank };
  if (nome.includes('santander')) return { bg: 'bg-red-600', text: 'text-white', imagem: Santander };
  if (nome.includes('caixa')) return { bg: 'bg-blue-700', text: 'text-white', imagem: Caixa };
  if (nome.includes('inter')) return { bg: 'bg-orange-500', text: 'text-white', imagem: null }; // Não temos imagem para o Inter ainda
  if (nome.includes('bradesco')) return { bg: 'bg-red-700', text: 'text-white', imagem: Bradesco };
  if (nome.includes('itau') || nome.includes('itaú')) return { bg: 'bg-orange-400', text: 'text-black', imagem: Itau };
  if (nome.includes('c6')) return { bg: 'bg-gray-800', text: 'text-white', imagem: C6 };
  if (nome.includes('bb') || nome.includes('brasil')) return { bg: 'bg-yellow-400', text: 'text-blue-800', imagem: BB };

  return { bg: 'bg-gray-200', text: 'text-black', imagem: null };
};

const getCorProgresso = (percent: number) => {
  if (percent < 50) return 'bg-green-500';
  if (percent < 75) return 'bg-yellow-500';
  if (percent < 90) return 'bg-orange-500';
  return 'bg-red-600';
};

const getCorTextoProgresso = (percent: number) => {
  if (percent < 50) return 'text-green-600';
  if (percent < 75) return 'text-yellow-600';
  if (percent < 90) return 'text-orange-600';
  return 'text-red-600';
};


const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

const toNum = (s: string | number | null | undefined) => {
  if (typeof s === 'number') return s;
  const v = parseFloat(String(s || '0').replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};

const isSameMonth = (isoDate: string, ref = new Date()) => {
  const d = new Date(isoDate);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

const calcularGastosPorCategoria = (lista: Gasto[] = []) => {
  return lista.reduce((acc: Record<string, number>, g) => {
    const cat = (g?.categoria ?? 'OUTROS') as string;
    const v = toNum(g?.valor);
    acc[cat] = (acc[cat] || 0) + v;
    return acc;
  }, {} as Record<string, number>);
};

const calcularProximoVencimentoMensal = (assinatura: Assinatura): { dias: number; ehProximo: boolean } | null => {
  if (assinatura.periodoCobranca !== 'MENSAL') {
    return null;
  }

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const diaCobranca = assinatura.diaCobranca;

  let diasRestantes;
  if (diaCobranca >= diaHoje) {
    diasRestantes = diaCobranca - diaHoje;
  } else {
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    diasRestantes = (ultimoDiaDoMes - diaHoje) + diaCobranca;
  }

  return { dias: diasRestantes, ehProximo: diasRestantes <= 10 };
};

const calcularProximoVencimentoAnual = (assinatura: Assinatura): { data: Date; dias: number; meses: number; texto: string; ehProximo: boolean } | null => {
  if (assinatura.periodoCobranca !== 'ANUAL' || !assinatura.mesCobranca || !assinatura.anoAdesao) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let proximoVencimento = new Date(hoje.getFullYear(), assinatura.mesCobranca - 1, assinatura.diaCobranca);
  if (proximoVencimento < hoje) {
    proximoVencimento.setFullYear(hoje.getFullYear() + 1);
  }

  const diffTime = proximoVencimento.getTime() - hoje.getTime();
  const diffDiasTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let meses = 0;
  let dias = diffDiasTotal;

  if (diffDiasTotal > 30) {
    meses = Math.floor(diffDiasTotal / 30.44); // Média de dias no mês
    dias = Math.round(diffDiasTotal % 30.44);
  }

  let texto = '';
  if (meses > 0) texto += `${meses} mes${meses > 1 ? 'es' : ''}`;
  if (dias > 0) texto += `${texto ? ' e ' : ''}${dias} dia${dias > 1 ? 's' : ''}`;
  if (!texto) texto = 'hoje';
  else texto = `em ${texto}`;

  return { data: proximoVencimento, dias: diffDiasTotal, meses, texto, ehProximo: diffDiasTotal <= 30 };
};

const CATEGORIAS_GASTO = ['ALIMENTAÇÃO', 'TRANSPORTE', 'LAZER', 'SAÚDE', 'MORADIA', 'EDUCAÇÃO', 'COMPRAS', 'VESTUÁRIO', 'ELETRÔNICOS', 'UTENSÍLIOS DOMÉSTICOS', 'BELEZA & CUIDADOS', 'PETS', 'INVESTIMENTOS', 'IMPREVISTO', 'OUTROS'] as const;



const detectarCategoria = (descricao: string): typeof CATEGORIAS_GASTO[number] => {
  const d = (descricao || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const match = (palavras: string[]) => palavras.some(k => d.includes(k));
  
  // Imprevisto tem prioridade se começar com a palavra
  if (d.startsWith('imprevisto')) return 'IMPREVISTO';
  
  // Alimentação
  if (match(['almoco','almoço','ifood','lanche','comida','salgado','doce','docinho','cafe','jantar','restaurante','padaria','mercado','supermercado','pizza','hamburguer','acai','açai','cerveja','bebida','suco','refrigerante','agua','sorvete','pao','queijo','leite','carne','frango','peixe','arroz','feijao','macarrao','biscoito','frutas','verduras','legumes','hortifruti','feira','delivery'])) return 'ALIMENTAÇÃO';
  
  // Transporte
  if (match(['uber','taxi','99','gasolina','combustivel','onibus','metro','metrô','estacionamento','pedagio','pedágio','passagem','bus','vlt','trem','mobilidade','moto','carro','veiculo','veículo','uber','cabify','indriver','ipva','licenciamento','multa','transito','trânsito'])) return 'TRANSPORTE';
  
  // Lazer
  if (match(['cinema','teatro','show','festa','balada','bar','jogo','game','passeio','viagem','turismo','parque','diversao','diversão','streaming','netflix','spotify','youtube','prime','disney','hbo','entretenimento','ingresso','evento','concerto','museu','clube','piscina'])) return 'LAZER';
  
  // Saúde
  if (match(['farmacia','farmácia','remedio','remédio','medicamento','consulta','medico','médico','dentista','exame','hospital','clinica','clínica','academia','personal','nutricao','nutrição','psicologia','terapia','fisioterapia','laboratorio','laboratório','cirurgia','vacina','plano','saude','saúde','oculos','óculos','aparelho','ortodontia'])) return 'SAÚDE';
  
  // Moradia
  if (match(['aluguel','condominio','condomínio','luz','energia','eletrica','elétrica','agua','água','internet','gas','gás','iptu','manutencao','manutenção','reforma','pintura','encanador','eletricista','limpeza','faxina','zeladoria','seguro residencial','taxa','boleto'])) return 'MORADIA';
  
  // Educação
  if (match(['curso','faculdade','universidade','escola','colegio','colégio','livro','apostila','aula','treinamento','workshop','seminario','seminário','mestrado','doutorado','pos','pós','graduacao','graduação','material escolar','mensalidade','matricula','matrícula','idioma','ingles','inglês','espanhol'])) return 'EDUCAÇÃO';
  
  // Eletrônicos
  if (match(['celular','smartphone','notebook','computador','tablet','pc','mouse','teclado','monitor','tv','televisao','televisão','smartwatch','fone','headphone','caixa de som','carregador','cabo','fonte','hd','ssd','memoria','memória','placa','processador','webcam','microfone','alexa','google home','chromecast','apple','samsung','xiaomi','motorola','lg','console','playstation','xbox','nintendo'])) return 'ELETRÔNICOS';
  
  // Utensílios Domésticos
  if (match(['microondas','geladeira','fogao','fogão','maquina de lavar','lavadora','secadora','aspirador','ferro','panela','frigideira','prato','copo','talher','faca','colher','garfo','liquidificador','batedeira','airfryer','cafeteira','torradeira','ventilador','ar condicionado','aquecedor','cama','colchao','colchão','travesseiro','lencol','lençol','cobertor','toalha','cortina','tapete','mesa','cadeira','sofa','sofá','armario','armário','guarda-roupa','estante','rack','organizador','varal','balde','vassoura','rodo','pano','esponja','detergente'])) return 'UTENSÍLIOS DOMÉSTICOS';
  
  // Vestuário
  if (match(['roupa','camisa','camiseta','calca','calça','short','bermuda','vestido','saia','blusa','jaqueta','casaco','tenis','tênis','sapato','sandalia','sandália','chinelo','bota','meia','cueca','calcinha','sutia','sutiã','pijama','uniforme','terno','gravata','cinto','bolsa','mochila','carteira','relogio','relógio','anel','colar','brinco','pulseira','acessorio','acessório'])) return 'VESTUÁRIO';
  
  // Beleza & Cuidados
  if (match(['salao','salão','cabelo','cabeleireiro','barba','barbeiro','manicure','pedicure','estetica','estética','depilacao','depilação','massagem','spa','maquiagem','cosmetico','cosmético','perfume','shampoo','condicionador','creme','hidratante','protetor solar','desodorante','sabonete','escova','secador','chapinha','navalha','aparador','unha','esmalte','skin care','tratamento'])) return 'BELEZA & CUIDADOS';
  
  // Pets
  if (match(['pet','cachorro','gato','ração','racao','veterinario','veterinário','vacina animal','banho e tosa','petshop','brinquedo pet','caminha','coleira','guia','antipulgas','vermifugo','vermífugo','areia gato','comedouro','bebedouro'])) return 'PETS';
  
  // Investimentos
  if (match(['investimento','aplicacao','aplicação','poupanca','poupança','cdb','tesouro','acao','ação','bolsa','fundo','previdencia','previdência','renda fixa','renda variavel','variável','crypto','bitcoin','corretora','xp','nuinvest','inter invest'])) return 'INVESTIMENTOS';
  
  // Compras (genérico para lojas)
  if (match(['loja','shopping','mercadolivre','amazon','shopee','shein','aliexpress','magazine','casas bahia','americanas','presente','gift','compra'])) return 'COMPRAS';
  
  return 'OUTROS';
};
// ---------------------------------

const SUGESTOES_BANCOS = ['NUBANK', 'SANTANDER', 'CAIXA', 'C6', 'ITAÚ', 'BRADESCO', 'INTER', 'BANCO DO BRASIL'];
const SUGESTOES_DESCRICAO: Record<string, string[]> = {
  'ALIMENTAÇÃO': [
    'Almoço', 'Jantar', 'Café da manhã', 'Lanche', 'iFood', 'Uber Eats', 'Rappi',
    'Mercado', 'Supermercado', 'Padaria', 'Restaurante', 'Pizza', 'Hambúrguer',
    'Açaí', 'Sorvete', 'Cerveja', 'Delivery', 'Feira', 'Hortifruti'
  ],
  'TRANSPORTE': [
    'Uber', 'Táxi', '99', 'Gasolina', 'Combustível', 'Estacionamento', 'Pedágio',
    'Passagem ônibus', 'Metrô', 'IPVA', 'Licenciamento', 'Multa', 'Manutenção carro'
  ],
  'LAZER': [
    'Cinema', 'Teatro', 'Show', 'Festa', 'Bar', 'Netflix', 'Spotify', 'Prime Video',
    'Disney+', 'HBO Max', 'Viagem', 'Passeio', 'Ingresso', 'Game', 'Streaming'
  ],
  'SAÚDE': [
    'Farmácia', 'Remédio', 'Consulta médica', 'Dentista', 'Exame', 'Academia',
    'Personal trainer', 'Nutricionista', 'Psicólogo', 'Fisioterapia', 'Plano de saúde',
    'Óculos', 'Vacina'
  ],
  'MORADIA': [
    'Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'IPTU',
    'Manutenção', 'Reforma', 'Limpeza', 'Encanador', 'Eletricista'
  ],
  'EDUCAÇÃO': [
    'Mensalidade', 'Curso', 'Faculdade', 'Livro', 'Material escolar', 'Aula particular',
    'Inglês', 'Idiomas', 'Workshop', 'Treinamento', 'Apostila'
  ],
  'ELETRÔNICOS': [
    'Celular', 'Notebook', 'Tablet', 'TV', 'Fone de ouvido', 'Mouse', 'Teclado',
    'Monitor', 'Carregador', 'Console', 'PlayStation', 'Xbox', 'Nintendo Switch'
  ],
  'UTENSÍLIOS DOMÉSTICOS': [
    'Microondas', 'Geladeira', 'Fogão', 'Máquina de lavar', 'Aspirador', 'Airfryer',
    'Liquidificador', 'Panela', 'Jogo de cama', 'Toalha', 'Sofá', 'Mesa', 'Cadeira',
    'Colchão', 'Travesseiro', 'Cortina', 'Tapete'
  ],
  'VESTUÁRIO': [
    'Roupa', 'Camisa', 'Calça', 'Tênis', 'Sapato', 'Jaqueta', 'Casaco',
    'Bolsa', 'Mochila', 'Relógio', 'Óculos de sol', 'Cinto', 'Meia'
  ],
  'BELEZA & CUIDADOS': [
    'Salão', 'Corte de cabelo', 'Barbeiro', 'Manicure', 'Pedicure', 'Depilação',
    'Perfume', 'Shampoo', 'Maquiagem', 'Creme', 'Skin care', 'Massagem', 'Spa'
  ],
  'PETS': [
    'Ração', 'Veterinário', 'Vacina pet', 'Banho e tosa', 'Petshop', 
    'Brinquedo pet', 'Remédio pet', 'Coleira', 'Areia de gato'
  ],
  'INVESTIMENTOS': [
    'CDB', 'Tesouro Direto', 'Ações', 'Fundo imobiliário', 'Previdência privada',
    'Bitcoin', 'Poupança', 'Renda fixa'
  ],
  'COMPRAS': [
    'Mercado Livre', 'Amazon', 'Shopee', 'Shein', 'Aliexpress', 
    'Magazine Luiza', 'Casas Bahia', 'Presente'
  ],
  'IMPREVISTO': [
    'Imprevisto', 'Emergência', 'Conserto urgente', 'Perda', 'Quebra'
  ],
  'OUTROS': ['Outros']
};
const SUGESTOES_GLOBAIS = [
  'iFood',
  'Jantar restaurante',
  'Uber',
  '99',
  'Gasolina',
  'Netflix',
  'Spotify',
  'Amazon',
  'Mercado livre',
  'Mercado',          // adicionado
  'Supermercado',     // adicionado
  'Shopee',
  'Roupa',
  'Sapato',
  'Farmácia',
  'Remédio',
  'Academia',
  'Cinema',
  'Viagem',
  'Passagem aérea',
  'Hotel',
  'Aluguel',
  'Luz',
  'Água',
  'Internet',
  'Iptu',
  'Curso online',
  'Livro',
  'Presente',
  'Imprevisto',       // adicionado
  'Pizza',
  'Hambúrguer',
  'Açaí',
  'Café',
  'Padaria',
  'Salgado',
  'Cerveja',
  'Bar',
  'Jogo',
  'Passeio',
  'Dentista',
  'Consulta médica',
  'Exame',
  'Estacionamento',
  'Pedágio',
  'Ônibus',
  'Metrô',
  'Transferência',
  'Doação',
  'Outros',
];

/** =========================
 * Componente principal
 * ========================= */

export default function LifeTracker({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  // Abas
  const [tab, setTab] = React.useState<'dashboard' | 'gastos' | 'receitas' | 'assinaturas' | 'objetivos' | 'cartoes' | 'dividas' | 'configuracoes'>('dashboard');

  // Modais e ordenação de listas
  const [showMensaisModal, setShowMensaisModal] = React.useState(false);
  const [mensaisSort, setMensaisSort] = React.useState<'nome' | 'valor' | 'vencimento'>('vencimento');
  const [mensaisQuery, setMensaisQuery] = React.useState('');
  const [showCreditoMesModal, setShowCreditoMesModal] = React.useState(false);

  // Estados
  const [gastos, setGastos] = React.useState<Gasto[]>([]);
  const [receitas, setReceitas] = React.useState<Receita[]>([]);
  const [assinaturas, setAssinaturas] = React.useState<Assinatura[]>([]);
  const [objetivos, setObjetivos] = React.useState<Objetivo[]>([]);
  const [cartoes, setCartoes] = React.useState<Cartao[]>([]);
  const [dividas, setDividas] = React.useState<Divida[]>([]);
  const [configuracoes, setConfiguracoes] = React.useState<Configuracoes>({
    credito: { alerta: '2500', critico: '1000', positivo: '5000' },
    saldo: { alerta: '500', critico: '100', positivo: '2000' },
  });
  // --- Edição de cartões ---
  const [editingCardId, setEditingCardId] = React.useState<number | null>(null);
  const [editCardDraft, setEditCardDraft] = React.useState<Cartao | null>(null);
  // --- Edição de gastos e receitas ---
  const [editingGastoId, setEditingGastoId] = React.useState<number | null>(null);
  const [editingReceitaId, setEditingReceitaId] = React.useState<number | null>(null);
  const [editingAssinaturaId, setEditingAssinaturaId] = React.useState<number | null>(null);
  // --- Sugestões de cartões ---
  const [sugestoesCartao, setSugestoesCartao] = React.useState<string[]>([]);
  const [sugestaoAtivaIndex, setSugestaoAtivaIndex] = React.useState(-1);
  const [sugestoesDescricao, setSugestoesDescricao] = React.useState<string[]>([]);
  const [sugestaoDescricaoAtivaIndex, setSugestaoDescricaoAtivaIndex] = React.useState(-1);


  const startEditCard = (c: Cartao) => {
    setEditingCardId(c.id);
    setEditCardDraft({ ...c });
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardDraft(null);
  };

const saveEditCard = () => {
  if (!editCardDraft || editCardDraft.id === undefined) return;
  
  const updatedCartoes = cartoes.map(x => {
    if (x.id === editCardDraft.id) {
      return {
        id: editCardDraft.id,
        nome: editCardDraft.nome ?? "",
        limite: editCardDraft.limite ?? "0",
        diaFechamento: (editCardDraft as any).diaFechamento ?? 1, 
        diaVencimento: editCardDraft.diaVencimento ?? 1 // This line was already present and correct
      };
    }
    return x;
  });
  
  setCartoes(updatedCartoes);
  setEditingCardId(null);
  setEditCardDraft(null);
};

  const deleteCard = (id: number) => {
    const toDelete = cartoes.find(c => c.id == id);
    if (!toDelete) return;
    if (!window.confirm(`Remover o cartão "${toDelete.nome}"? Seus gastos antigos permanecem, apenas deixam de apontar para este cartão.`)) return;

    // Remover cartão e, se era padrão, definir o primeiro restante como padrão
    setCartoes((prev: Cartao[]) => prev.filter((x: Cartao) => x.id !== id));

    // Para não quebrar referências: zera cartaoId dos gastos que apontavam para ele (mantém cartaoNome como histórico)
    setGastos(prev => prev.map(g => g.cartaoId === id ? { ...g, cartaoId: null } : g));
    // Também para assinaturas
    setAssinaturas(prev => prev.map(a => a.cartaoId === id ? { ...a, cartaoId: null } : a));
  };

  const removerAssinatura = (id: number): void => {
    const assinaturaParaRemover = assinaturas.find(a => a.id === id);

    if (!assinaturaParaRemover) return;

    // Se for um aluguel pago, remove também o gasto correspondente para estornar o valor.
    if (assinaturaParaRemover.tipo === 'CONTRATO - ALUGUEL' && assinaturaParaRemover.pagoEsteMes) {
      const descricaoGastoAluguel = `Pagamento Aluguel: ${assinaturaParaRemover.nome}`;
      setGastos(prevGastos => prevGastos.filter(g => 
        !(g.descricao === descricaoGastoAluguel && g.categoria === 'MORADIA' && isSameMonth(g.data))
      ));
    }

    setAssinaturas(prev => prev.filter(a => a.id !== id));
  };

  const pagarParcelaAcordo = (id: number): void => {
    setAssinaturas((prev: Assinatura[]) =>
      prev.map((a: Assinatura) => {
        if (a.id === id && a.tipo === 'ACORDO') {
          const proximaParcela = (a.parcelaAtual ?? 0) + 1;
          return { ...a, parcelaAtual: proximaParcela };
        }
        return a;
      })
    );
  };

  // Forms
  
  const [novoGasto, setNovoGasto] = React.useState<Gasto>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
    categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
    parcelasTotal: 1
  });

  const [novaReceita, setNovaReceita] = React.useState<Receita>({
    id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10)
  });

  const [novaAssinatura, setNovaAssinatura] = React.useState<Assinatura>({
    id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
    categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear()
  });

  const [novoObjetivo, setNovoObjetivo] = React.useState<Objetivo>({
    id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO'
  } as unknown as Objetivo);

  interface NovoCartaoDraft {
  nome: string;
  limite: string;
  diaVencimento: number; 
  diaFechamento: number; 
}
// Tipo mais rígido para o estado de novo cartão
interface NovoCartaoDraft {
  nome: string;
  limite: string;
  diaVencimento: number;
}
const [novoCartao, setNovoCartao] = React.useState<NovoCartaoDraft>({
  nome: '',
  limite: '',
  // diaVencimento: 1, // Duplicate property removed
  diaVencimento: 1, diaFechamento: 1, 
});


  const [novaDivida, setNovaDivida] = React.useState<Divida>({
    id: 0, pessoa: '', valor: '', descricao: ''
  });

  // Persistência (localStorage)
  React.useEffect(() => {
    const load = <T,>(k: string, fallback: T) => {
      try { const s = localStorage.getItem(k); return s ? JSON.parse(s) as T : fallback; }
      catch { return fallback; }
    };
    setGastos(load<Gasto[]>('gastos', []));
    setReceitas(load<Receita[]>('receitas', []));
    setAssinaturas(load<Assinatura[]>('assinaturas', []));
    setObjetivos(load<Objetivo[]>('objetivos', []));
    setCartoes(load<Cartao[]>('cartoes', []));
    setDividas(load<Divida[]>('dividas', []));
    setConfiguracoes(load<Configuracoes>('configuracoes', {
      credito: { alerta: '2500', critico: '1000', positivo: '5000' },
      saldo: { alerta: '500', critico: '100', positivo: '2000' },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => { localStorage.setItem('gastos', JSON.stringify(gastos)); }, [gastos]);
  React.useEffect(() => { localStorage.setItem('receitas', JSON.stringify(receitas)); }, [receitas]);
  React.useEffect(() => { localStorage.setItem('assinaturas', JSON.stringify(assinaturas)); }, [assinaturas]);
  React.useEffect(() => { localStorage.setItem('objetivos', JSON.stringify(objetivos)); }, [objetivos]);
  React.useEffect(() => { localStorage.setItem('cartoes', JSON.stringify(cartoes)); }, [cartoes]);
  React.useEffect(() => { localStorage.setItem('dividas', JSON.stringify(dividas)); }, [dividas]);
  React.useEffect(() => { localStorage.setItem('configuracoes', JSON.stringify(configuracoes)); }, [configuracoes]);

  // Derivados
  const totalReceitas = React.useMemo(
    () => receitas.reduce((acc, r) => acc + toNum(r.valor), 0),
    [receitas]
  );

  const gastosDebito = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'DÉBITO').reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const gastosCredito = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'CRÉDITO').reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const gastosCreditoMes = React.useMemo(
    () => gastos.filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data)).reduce((acc, g) => acc + toNum(g.valor), 0),
    [gastos]
  );

  const totalLimite = React.useMemo(
    () => cartoes.reduce((acc, c) => acc + toNum(c.limite), 0),
    [cartoes]
  );

  const gastosTotal = React.useMemo(
    () => gastosCredito + gastosDebito,
    [gastosCredito, gastosDebito]
  );

  const assinDebitoMensal = React.useMemo(
    () => assinaturas
      .filter(a => a.tipoPagamento === 'DÉBITO' && a.periodoCobranca === 'MENSAL' && a.tipo !== 'CONTRATO - ALUGUEL')
      .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const saldo = React.useMemo(
    () => totalReceitas - gastosDebito - assinDebitoMensal,
    [totalReceitas, gastosDebito, assinDebitoMensal]
  );

  // Listas derivadas para modais
  const assinMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ASSINATURA'), [assinaturas]);

  // Assinaturas mensais pagas no crédito também contam como gasto de crédito do mês
  const assinaturasCreditoMensal = React.useMemo(
    () => assinMensais.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((s, a) => s + toNum(a.valor), 0),
    [assinMensais]
  );


  const porCategoria = React.useMemo(() => calcularGastosPorCategoria(gastos), [gastos]);
  const anuaisTodos = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'ANUAL'), [assinaturas]);
  const anuaisProximas = React.useMemo(() => anuaisTodos.filter(a => {
    const vencimento = calcularProximoVencimentoAnual(a);
    return !!vencimento && (vencimento.ehProximo ?? false);
  }), [anuaisTodos]);

  // Assinaturas anuais que vencem no mês atual
  const anuaisVencendoMes = React.useMemo(() => anuaisTodos.filter(a => {
    const vencimento = calcularProximoVencimentoAnual(a);
    return vencimento ? isSameMonth(vencimento.data.toISOString()) : false;
  }), [anuaisTodos]);

  const totalAssinAnualMesCorrenteCredito = React.useMemo(
    () => anuaisVencendoMes.filter(a => a.tipoPagamento === 'CRÉDITO').reduce((acc, a) => acc + toNum(a.valor), 0),
    [anuaisVencendoMes]
  );

  const creditoDisponivel = React.useMemo(
    () =>
      Math.max(
        0,
        totalLimite - (gastosCredito + assinaturasCreditoMensal + totalAssinAnualMesCorrenteCredito)
      ),
    [totalLimite, gastosCredito, assinaturasCreditoMensal, totalAssinAnualMesCorrenteCredito]
  ); 

  // Compras parceladas ativas
 const comprasParceladasAtivas = React.useMemo(() => {
    const parcelados = gastos.filter(g => g.parcelaId && g.tipoPagamento === 'CRÉDITO');
    const grouped = parcelados.reduce((acc, g) => {
      if (!g.parcelaId) return acc;
      if (!acc[g.parcelaId]) {
        acc[g.parcelaId] = {
          descricao: g.descricao,
          // Ensure g.valor is a string before passing to toNum
          // And g.parcelasTotal is a number before multiplication
          valorTotal: toNum(String(g.valor)) * (g.parcelasTotal || 1),
          parcelasPagas: 0,
          parcelasTotal: g.parcelasTotal || 0,
          valorParcela: toNum(g.valor),
          cartaoNome: g.cartaoNome || 'Não identificado',
        };
      }
      // Conta quantas parcelas já passaram (parcelas com data <= hoje)
      const hoje = new Date();
      const dataParcela = new Date(g.data);
      // Check if acc[g.parcelaId] is defined before accessing its properties
      if (dataParcela <= hoje && acc[g.parcelaId]) {
        acc[g.parcelaId]!.parcelasPagas = Math.max(acc[g.parcelaId]!.parcelasPagas, g.parcelaAtual || 0);
      }
      return acc;
    }, {} as Record<string, { descricao: string; valorTotal: number; parcelasPagas: number; parcelasTotal: number; valorParcela: number; cartaoNome: string }>);

    return Object.values(grouped).filter(g => g.parcelasPagas < g.parcelasTotal);
  }, [gastos]);

  const totalAssinMensal = React.useMemo(
    () => assinaturas
      .filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ASSINATURA')
      .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const totalAluguelMensal = React.useMemo(
    () => assinaturas.filter(a => a.tipo === 'CONTRATO - ALUGUEL' && a.periodoCobranca === 'MENSAL')
                     .reduce((acc, a) => acc + toNum(a.valor), 0),
    [assinaturas]
  );

  const totalAssinAnualMesCorrente = React.useMemo(
    () => anuaisVencendoMes.reduce((acc, a) => acc + toNum(a.valor), 0),
    [anuaisVencendoMes]
  );

  const totalAnualAssinaturas = React.useMemo(() => {
    return assinaturas.reduce((acc, a) => {
      return acc + (toNum(a.valor) * (a.periodoCobranca === 'MENSAL' ? 12 : 1));
    }, 0);
  }, [assinaturas]);


const acordosMensais = React.useMemo(() => {
  return assinaturas
    .filter(a => a.tipo === 'ACORDO' && a.periodoCobranca === 'MENSAL' && (a.parcelaAtual ?? 1) <= (a.parcelasTotal ?? 1))
    .reduce((acc, a) => {
      const valorParcela = toNum(a.valor) / (a.parcelasTotal ?? 1);
      return acc + valorParcela;
    }, 0);
}, [assinaturas]);

const acordosAnuaisVencendoMes = React.useMemo(() => {
  return anuaisVencendoMes
    .filter(a => a.tipo === 'ACORDO' && (a.parcelaAtual ?? 1) <= (a.parcelasTotal ?? 1))
    .reduce((acc, a) => {
      const valorParcela = toNum(a.valor) / (a.parcelasTotal ?? 1);
      return acc + valorParcela;
    }, 0);
}, [anuaisVencendoMes]);

const totalAcordosMes = acordosMensais + acordosAnuaisVencendoMes;

// AGORA O PREVISAO MES (atualize o total)
const previsaoMes = React.useMemo(() => ({
  aluguel: totalAluguelMensal,
  assinaturas: totalAssinMensal + totalAssinAnualMesCorrente,
  credito: gastosCreditoMes,
  total: totalAluguelMensal + totalAssinMensal + totalAssinAnualMesCorrente + gastosCreditoMes + totalAcordosMes
}), [totalAluguelMensal, totalAssinMensal, totalAssinAnualMesCorrente, gastosCreditoMes, totalAcordosMes]);
  // ------------------------------------

  // Listas derivadas para modais
  const alugueisMensais = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'CONTRATO - ALUGUEL'), [assinaturas]);
  const acordosMensaisList = React.useMemo(() => assinaturas.filter(a => a.periodoCobranca === 'MENSAL' && a.tipo === 'ACORDO'), [assinaturas]);

  // Lista detalhada de gastos de crédito do mês (gastos + assinaturas mensais no crédito)
  const creditGastosMesList = React.useMemo(() => {
    const now = new Date();
    const gastosList = gastos
      .filter(g => g.tipoPagamento === 'CRÉDITO' && isSameMonth(g.data))
      .map(g => ({
        id: `gasto-${g.id}`,
        tipo: 'gasto' as const,
        data: isNaN(new Date(g.data).getTime()) ? '' : g.data,
        descricao: g.descricao,
        valor: toNum(g.valor),
        cartaoId: g.cartaoId,
        cartaoNome: g.cartaoNome ?? cartoes.find(c => c.id === g.cartaoId)?.nome ?? ''
      }));
 
    const assinList = assinMensais
      .filter(a => a.tipoPagamento === 'CRÉDITO')
      .map(a => ({
        id: `assinatura-${a.id}`,
        tipo: 'assinatura' as const,
        data: new Date(now.getFullYear(), now.getMonth(), a.diaCobranca ?? 1).toISOString().slice(0,10),
        descricao: a.nome + ' (assinatura)',
        valor: toNum(a.valor),
        cartaoId: a.cartaoId,
        cartaoNome: cartoes.find(c => c.id === a.cartaoId)?.nome ?? ''
      }));

    return [...gastosList, ...assinList].sort((a, b) => (new Date(a.data)).getTime() - (new Date(b.data)).getTime());
  }, [gastos, assinMensais, cartoes]);

 // Resumo por cartão (considerando o total comprometido)
  const creditByCard = React.useMemo(() => {
    const map = new Map<number, number>();
    gastos.filter(g => g.tipoPagamento === 'CRÉDITO').forEach(g => {
      const id = g.cartaoId;
      if (!id) return;
      map.set(id, (map.get(id) ?? 0) + toNum(g.valor));
    });
    assinaturas
      .filter(a => a.tipoPagamento === 'CRÉDITO' && a.periodoCobranca === 'MENSAL' && a.diaCobranca <= new Date().getDate())
      .forEach(a => {
        const id = a.cartaoId;
        if (!id) return;
        map.set(id, (map.get(id) ?? 0) + toNum(a.valor));
      });
    return cartoes.map(c => ({
      cartao: c,
      usado: map.get(c.id) ?? 0,
      disponivel: Math.max(0, toNum(c.limite) - (map.get(c.id) ?? 0)),
    }));
  }, [gastos, cartoes, assinaturas]);


  // Ordenação e filtro da lista de assinaturas mensais
  const mensaisList = React.useMemo(() => {
    const q = mensaisQuery.trim().toLowerCase();
    const base = assinMensais.filter(a => a.nome.toLowerCase().includes(q));
    const sort = [...base].sort((a, b) => {
      if (mensaisSort === 'nome') return a.nome.localeCompare(b.nome);
      if (mensaisSort === 'valor') return toNum(a.valor) - toNum(b.valor);
      // vencimento
      return (a.diaCobranca ?? 0) - (b.diaCobranca ?? 0);
    });
    return sort;
  }, [assinMensais, mensaisQuery, mensaisSort]);


  // --- BLOCO DE CÓDIGO CORROMPIDO REMOVIDO DAQUI ---

  // Ações
  const adicionarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoGasto.tipoPagamento === 'CRÉDITO' && !novoGasto.cartaoId) {
      alert('Por favor, selecione um cartão para o gasto de crédito.');
      return;
    }

    const parcelas = novoGasto.tipoPagamento === 'CRÉDITO' ? (novoGasto.parcelasTotal || 1) : 1;
    const valorParcela = toNum(novoGasto.valor) / parcelas;
    const parcelaId = parcelas > 1 ? `${Date.now()}` : undefined;

    const novosGastos: Gasto[] = [];
    const dataInicial = new Date(novoGasto.data + 'T12:00:00'); // Evita problemas de fuso

    for (let i = 0; i < parcelas; i++) {
      const dataParcela = new Date(dataInicial);
      dataParcela.setMonth(dataInicial.getMonth() + i);

      const cartaoNome = novoGasto.tipoPagamento === 'CRÉDITO'
        ? (cartoes.find(c => c.id === novoGasto.cartaoId)?.nome ?? null)
        : null;

      novosGastos.push({
        ...novoGasto,
        id: Date.now() + i,
        valor: String(valorParcela.toFixed(2)),
        data: dataParcela.toISOString().slice(0, 10),
        cartaoId: novoGasto.tipoPagamento === 'CRÉDITO' ? novoGasto.cartaoId : null,
        cartaoNome,
        parcelaId,
        parcelaAtual: parcelas > 1 ? i + 1 : undefined,
        parcelasTotal: parcelas > 1 ? parcelas : undefined,
      });
    }

    setGastos(g => [...g, ...novosGastos]);

    setNovoGasto({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
      parcelasTotal: 1
    });
  };

  const iniciarEdicaoGasto = (gasto: Gasto) => {
    setEditingGastoId(gasto.id);
    setNovoGasto({ ...gasto });
  };

  const cancelarEdicaoGasto = () => {
    setEditingGastoId(null);
    setNovoGasto({
      id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10),
      categoria: 'ALIMENTAÇÃO', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null,
      parcelasTotal: 1
    });
  };

  const salvarEdicaoGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações neste gasto?')) return;
    setGastos(gastos => gastos.map(g => g.id === editingGastoId ? { ...novoGasto, id: g.id } : g));
    cancelarEdicaoGasto();
  };

  const iniciarEdicaoReceita = (receita: Receita) => {
    setEditingReceitaId(receita.id);
    setNovaReceita({ ...receita });
  };

  const cancelarEdicaoReceita = () => {
    setEditingReceitaId(null);
    setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
  };

  const salvarEdicaoReceita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações nesta receita?')) return;
    setReceitas(receitas => receitas.map(r => r.id === editingReceitaId ? { ...novaReceita, id: r.id } : r));
    cancelarEdicaoReceita();
  };

  const removerGasto = (id: number) => {
    setGastos(g => g.filter(gasto => gasto.id !== id));
  };

  const removerReceita = (id: number) => {
    setReceitas(r => r.filter(receita => receita.id !== id));
  };

  const iniciarEdicaoAssinatura = (assinatura: Assinatura) => {
    setEditingAssinaturaId(assinatura.id);
    setNovaAssinatura({ ...assinatura });
  };

  const cancelarEdicaoAssinatura = () => {
    setEditingAssinaturaId(null);
    setNovaAssinatura({ id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA', categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear() });
  };
  

  const salvarEdicaoAssinatura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Salvar as alterações nesta assinatura?')) return;
    setAssinaturas(assinaturas => assinaturas.map(a => a.id === editingAssinaturaId ? { ...novaAssinatura, id: a.id } : a));
    cancelarEdicaoAssinatura();
  };

  const adicionarReceita = (e: React.FormEvent) => {
    e.preventDefault();
    setReceitas(r => [...r, { ...novaReceita, id: Date.now() }]);
    setNovaReceita({ id: 0, descricao: '', valor: '', data: new Date().toISOString().slice(0,10) });
  };

  const adicionarCartao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartao.nome.trim() || !novoCartao.limite) return;
    // Garante que o nome seja capitalizado para consistência
    const cartaoFinal = { ...novoCartao, nome: novoCartao.nome.trim().toUpperCase(), id: Date.now() };
    setCartoes((prev: Cartao[]) => [...prev, cartaoFinal]);
    setSugestoesCartao([]);
    
    setNovoCartao({ nome: '', limite: '', diaVencimento: 1, diaFechamento: 1 });
  };

  const adicionarAssinatura = (e: React.FormEvent) => {
    e.preventDefault();
    setAssinaturas(a => [...a, {
      ...novaAssinatura,
      id: Date.now(),
      cartaoNome: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? (cartoes.find(c => c.id === novaAssinatura.cartaoId)?.nome ?? null)
        : null,
      cartaoId: novaAssinatura.tipoPagamento === 'CRÉDITO'
        ? novaAssinatura.cartaoId
        : null
    }]);
    setNovaAssinatura({
      id: 0, nome: '', valor: '', diaCobranca: 1, tipo: 'ASSINATURA',
      categoriaPersonalizada: '', tipoPagamento: 'DÉBITO', cartaoId: cartoes[0]?.id ?? null, cartaoNome: null, periodoCobranca: 'MENSAL', mesCobranca: new Date().getMonth() + 1, anoAdesao: new Date().getFullYear()
    });
  };
    // Resetar 'pagoEsteMes' para aluguéis no início de cada mês
  React.useEffect(() => {
    const hoje = new Date();
    const primeiroDiaDoMes = hoje.getDate() === 1;

    if (primeiroDiaDoMes) {
      const jaResetou = localStorage.getItem('resetAluguelMes') === `${hoje.getFullYear()}-${hoje.getMonth()}`;
      if (!jaResetou) {
        setAssinaturas(prev => prev.map(a => a.tipo === 'CONTRATO - ALUGUEL' ? { ...a, pagoEsteMes: false } : a));
        localStorage.setItem('resetAluguelMes', `${hoje.getFullYear()}-${hoje.getMonth()}`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adicionarObjetivo = (e: React.FormEvent) => {
    e.preventDefault();
    setObjetivos(o => [...o, { ...novoObjetivo, id: Date.now(), valorAtual: novoObjetivo.valorAtual || 0 }]);
    setNovoObjetivo({ id: 0, nome: '', valorNecessario: '', valorAtual: 0, status: 'EM PROGRESSO' } as unknown as Objetivo);
  };

  const atualizarObjetivoValor = (id: number, delta: number) => {
    setObjetivos(list => list.map(o => o.id === id ? { ...o, valorAtual: Math.max(0, o.valorAtual + delta) } : o));
  };

  const alterarStatusObjetivo = (id: number, status: StatusObj) => {
    setObjetivos(list => list.map(o => o.id === id ? { ...o, status } : o));
  };

  const adicionarDivida = (e: React.FormEvent) => {
    e.preventDefault();
    setDividas(d => [...d, { ...novaDivida, id: Date.now() }]);
    setNovaDivida({ id: 0, pessoa: '', valor: '', descricao: '' });
  };
  
  const pagarAluguel = (aluguel: Assinatura) => {
    if (aluguel.pagoEsteMes) {
      alert('Este aluguel já foi marcado como pago para o mês atual.');
      return;
    }

    // Adicionar o gasto correspondente
    const novoGastoAluguel: Gasto = {
      id: Date.now(),
      descricao: `Pagamento Aluguel: ${aluguel.nome}`,
      valor: aluguel.valor,
      categoria: 'MORADIA',
      data: new Date().toISOString().slice(0, 10),
      tipoPagamento: aluguel.tipoPagamento,
      cartaoId: aluguel.cartaoId,
      cartaoNome: aluguel.cartaoNome,
    };
    setGastos(g => [...g, novoGastoAluguel]);

    // Marcar como pago
    setAssinaturas(prev => prev.map(a => 
      a.id === aluguel.id ? { ...a, pagoEsteMes: true } : a
    ));
  };

  const getCorValor = (valor: number, config: Configuracoes['credito'] | Configuracoes['saldo']) => {
    const critico = toNum(config.critico);
    const alerta = toNum(config.alerta);
    const positivo = toNum(config.positivo);
    if (valor <= critico) return 'text-red-600';
    if (valor <= alerta) return 'text-orange-500';
    if (valor >= positivo) return 'text-green-600';
    return ''; // Cor padrão (preto)
  };

  // UI helpers
  const TabButton: React.FC<{ id: typeof tab; children: React.ReactNode }> = ({ id, children }) => (
    <button
      className={`px-3 py-2 rounded-xl text-sm ${
        tab === id
          ? 'bg-black text-white dark:bg-gray-700 dark:text-white'
          : 'bg-white text-black border border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
      }`}
      onClick={() => setTab(id)}
      type="button"
    >
      {children}
    </button>

  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Life Tracker</h1>
        <div className="flex gap-2">
          <TabButton id="dashboard">Dashboard</TabButton>
          <TabButton id="gastos">Gastos</TabButton>
          <TabButton id="receitas">Receitas</TabButton>
          <TabButton id="assinaturas">Assinaturas/Contratos</TabButton>
          <TabButton id="objetivos">Objetivos</TabButton>
          <TabButton id="cartoes">Cartões</TabButton>
          <TabButton id="dividas">Dívidas</TabButton>
          <TabButton id="configuracoes">Configurações</TabButton>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-3 py-2 rounded-xl text-sm bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
          type="button"
        >
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      {tab === 'dashboard' && (
        <>
          {/* Cards do dashboard */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <div className="text-sm opacity-60">Saldo (Dinheiro)</div>
              <div className={`text-2xl font-semibold ${getCorValor(saldo, configuracoes.saldo)}`}>
                {fmt(saldo)}
              </div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <div className="text-sm opacity-60">
                Crédito Disponível
              </div>
              <div className={`text-xl font-semibold ${getCorValor(creditoDisponivel, configuracoes.credito)}`}>
                {fmt(creditoDisponivel)}
              </div>
              <div className="text-xs opacity-60">Total de {fmt(totalLimite)}</div>
              {cartoes.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {creditByCard.map(({ cartao, disponivel }) => (
                    <li key={cartao.id} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${getDadosCartao(cartao.nome).bg}`}></span>
                      <span className="flex-1 truncate">{cartao.nome}</span>
                      <span className="font-medium">{fmt(disponivel)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <div className="text-sm opacity-60">Gastos (Crédito)</div>              
              <div className="text-xl font-medium">{fmt(gastosCredito + assinaturasCreditoMensal)}</div>
              {assinaturasCreditoMensal > 0 && (
                <div className="text-xs opacity-60">
                  (inclui {fmt(assinaturasCreditoMensal)} de assinaturas)
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <div className="text-sm opacity-60">Gastos (Dinheiro)</div>
              <div className="text-xl font-medium">{fmt(gastosDebito)}</div>
            </div>
            <div className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <div className="text-sm opacity-60">Gastos (Total)</div>
              <div className="text-xl font-medium">{fmt(gastosTotal)}</div>
            </div>
          </section>

          {/* Previsão do mês */}
          <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200">
            <h2 className="text-lg font-medium mb-3 text-black dark:text-gray-200">Previsão de Gastos (este mês)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <div className="opacity-60">Aluguel</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.aluguel)}</div>
                {alugueisMensais.map(aluguel => (
                  <div key={aluguel.id} className="mt-1 text-xs flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${aluguel.pagoEsteMes ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{aluguel.pagoEsteMes ? 'Pago' : 'Não Pago'}</span>
                    {!aluguel.pagoEsteMes && (
                      <button
                        onClick={() => pagarAluguel(aluguel)}
                        className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              <div className="opacity-60"> Acordos: </div>
              <div className="text-lg font-semibold">{fmt(totalAcordosMes)}</div>
              </div>
              <button type="button" onClick={() => setShowMensaisModal(true)} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <div className="opacity-60">Assinaturas Mensais</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.assinaturas)}</div>
              </button>
              <button type="button" onClick={() => setShowCreditoMesModal(true)} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-left cursor-pointer hover:ring-2 hover:ring-black/10 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <div className="opacity-60">Gastos em Crédito (mês)</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.credito)}</div>
              </button>
              <div className="p-3 rounded-xl bg-gray-900 text-white dark:bg-gray-700">
                <div className="opacity-80">TOTAL PREVISTO PARA O MÊS ATUAL</div>
                <div className="text-lg font-semibold">{fmt(previsaoMes.total)}</div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gastos por categoria */}
            <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-lg font-medium mb-3">Gastos por categoria</h2>
              {Object.keys(porCategoria).length === 0 ? (
                <p className="text-sm opacity-60">Sem lançamentos</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {Object.entries(porCategoria).map(([cat, total]) => (
                    <li key={cat} className="flex justify-between">
                      <span>{cat}</span>
                      <span>{fmt(total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Compras Parceladas Ativas */}
            <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-lg font-medium mb-3">Compras Parceladas Ativas</h2>
              {comprasParceladasAtivas.length === 0 ? (
                <p className="text-sm opacity-60">Nenhuma compra parcelada ativa.</p>
              ) : (
                <ul className="text-sm divide-y">
                  {comprasParceladasAtivas.map((p, i) => (
                    <li key={i} className="py-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{p.descricao}</span>
                        <span className="font-semibold">{fmt(p.valorTotal)}</span>
                      </div>
                      <div className="text-xs opacity-70">
                        {p.parcelasPagas} de {p.parcelasTotal} pagas ({fmt(p.valorParcela)}/mês)
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Assinaturas anuais */}
          <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
            <h2 className="text-lg font-medium mb-3">Assinaturas anuais</h2>
            {anuaisTodos.length === 0 ? (
              <p className="text-sm opacity-60">Nenhuma assinatura anual.</p>
            ) : (
              <ul className="text-sm divide-y">
                {anuaisTodos.map(a => {
                  const vencimento = calcularProximoVencimentoAnual(a);
                  if (!vencimento) return null;

                  return (
                    <li key={a.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {vencimento.ehProximo && <span className="mr-2" title="Vencimento próximo!">⚠️</span>}
                          {a.nome}
                        </div>
                        <div className="opacity-60 text-xs">                          
                          Vence dia {String(a.diaCobranca).padStart(2,'0')}{a.mesCobranca ? `/${String(a.mesCobranca).padStart(2,'0')}`: ''} • {a.tipoPagamento}
                          {a.cartaoId ? ` • ${cartoes.find(c => c.id === a.cartaoId)?.nome ?? ''}` : ''}
                        </div>
                      </div>
                      <div className={`font-semibold ${vencimento.ehProximo ? 'text-red-600' : ''}`}>{fmt(toNum(a.valor))} • {vencimento.texto}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Objetivos */}
          <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-700 dark:text-gray-200">
            <h2 className="text-lg font-medium mb-3">Objetivos</h2>
            {objetivos.length === 0 ? (
              <p className="text-sm opacity-60">Nenhum objetivo cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objetivos.map(o => {
                  const necessario = toNum(o.valorNecessario);
                  const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valorAtual / necessario) * 100)) : 0;
                  const progresso = (o.status === 'QUITADO - EM PROGRESSO' || o.status === 'QUITADO - FINALIZADO') ? 100 : progressoBase;
                  const quitado = o.status.startsWith('QUITADO');

                  return (
                <div key={o.id} className={`p-3 rounded-xl border border-gray-200 ${quitado ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-gray-200' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
                      <div className="flex items-start justify-between">
                    <div className="font-medium text-sm text-black dark:text-gray-200">{o.nome}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${quitado ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>{o.status}</div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">Meta: {fmt(necessario)}</div>
                      <div className="h-2 bg-gray-200 rounded mt-2">
                        <div className={`h-2 rounded ${quitado ? 'bg-green-500' : 'bg-black'}`} style={{ width: `${progresso}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div>{fmt(o.valorAtual)}</div>
                        <div>{progresso}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </>
      )}

      {tab === 'gastos' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
          <h2 className="text-lg font-medium">{editingGastoId ? 'Alterar Gasto' : 'Lançar Gasto'}</h2>
          <form className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end"
                onSubmit={editingGastoId ? salvarEdicaoGasto : adicionarGasto}
                key={`gasto-form-${editingGastoId || 'novo'}`}>
          <div className="md:col-span-3 relative">
            <label className="text-xs opacity-70">Descrição</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-lg bg-white
                         dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={novoGasto.descricao}
              onChange={(e) => {
  const desc = e.target.value;
  const catAuto = detectarCategoria(desc);
  setNovoGasto({ ...novoGasto, descricao: desc, categoria: catAuto });

  // === SUGESTÕES GLOBAIS AO DIGITAR ===
  if (desc.trim().length >= 2) {
    const filtradas = SUGESTOES_GLOBAIS
      .filter(s => s.toLowerCase().includes(desc.toLowerCase()))
      .slice(0, 8); // Máximo 8 sugestões

    setSugestoesDescricao(filtradas);
    setSugestaoDescricaoAtivaIndex(filtradas.length > 0 ? 0 : -1);
  } else {
    setSugestoesDescricao([]);
  }
}}
              onBlur={() => setTimeout(() => setSugestoesDescricao([]), 200)}
              onKeyDown={(e) => {
                if (sugestoesDescricao.length > 0 && e.key !== 'Tab') { // Ignorar Tab para não interferir com a navegação padrão

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSugestaoDescricaoAtivaIndex(prev => (prev + 1) % sugestoesDescricao.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSugestaoDescricaoAtivaIndex(prev => (prev - 1 + sugestoesDescricao.length) % sugestoesDescricao.length);
                  } else if (e.key === 'Enter' && sugestaoDescricaoAtivaIndex > -1) {
                    e.preventDefault();
                    const sugestaoSelecionada = sugestoesDescricao[sugestaoDescricaoAtivaIndex];
                    if (sugestaoSelecionada) {
                      const catAuto = detectarCategoria(sugestaoSelecionada);
                      setNovoGasto({ ...novoGasto, descricao: sugestaoSelecionada, categoria: catAuto });
                      setSugestoesDescricao([]);
                    }
                  } else if (e.key === 'Escape') {
                    setSugestoesDescricao([]);
                  }
                }
              }}
              onFocus={() => {
                // Mostra todas as sugestões da categoria quando focar no campo vazio
                // Apenas se não houver sugestões ativas já
                if (!novoGasto.descricao.trim() && sugestoesDescricao.length === 0) {
                  const sugestoesCategoria = SUGESTOES_DESCRICAO[novoGasto.categoria] || [];
                  setSugestoesDescricao(sugestoesCategoria.slice(0, 8));
                  setSugestaoDescricaoAtivaIndex(0);
                }
              }}
              placeholder="ex: almoço ifood"
            />
{sugestoesDescricao.length > 0 && (
  <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
    {sugestoesDescricao.map((s, index) => (
      <li
        key={s}
        className={`p-2 cursor-pointer text-sm ${
          sugestaoDescricaoAtivaIndex === index ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-100'
        }`}
        onMouseDown={() => {
          if (s) {  // Adicione esta verificação
            const catAuto = detectarCategoria(s);
            setNovoGasto({ ...novoGasto, descricao: s, categoria: catAuto });
            setSugestoesDescricao([]);
          }
        }}
        onMouseEnter={() => setSugestaoDescricaoAtivaIndex(index)}
      >
        {s}
      </li>
    ))}
  </ul>
)}
          </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoGasto.valor}
                onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Pagamento</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoGasto.tipoPagamento}
                onChange={(e) => {
                  const tipo = e.target.value as TipoPagamento;
                  setNovoGasto({ ...novoGasto, tipoPagamento: tipo, cartaoId: tipo === 'CRÉDITO' ? (novoGasto.cartaoId || cartoes[0]?.id || null) : null });
                }}
              >
                <option value="DÉBITO">DÉBITO (PIX/Dinheiro/à vista)</option>
                <option value="CRÉDITO">CRÉDITO (cartão)</option>
              </select>
            </div>
            {novoGasto.tipoPagamento === 'CRÉDITO' && (
              <div className="md:col-span-2">
                <label className="text-xs opacity-70">Cartão</label>
                <select
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white
                             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={novoGasto.cartaoId ?? ''}
                  onChange={(e) => setNovoGasto({ ...novoGasto, cartaoId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Selecione...</option>
                  {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}
            {novoGasto.tipoPagamento === 'CRÉDITO' && (
              <div>
                <label className="text-xs opacity-70">Parcelas</label>
                <input
                  type="number" min="1" max="24"
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white
                             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={novoGasto.parcelasTotal || 1}
                  onChange={(e) => setNovoGasto({ ...novoGasto, parcelasTotal: Number(e.target.value) || 1 })}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Categoria</label>
              <select 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoGasto.categoria}
                onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
                {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs opacity-70">Data</label>
              <input
                type="date" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoGasto.data}
                onChange={(e) => setNovoGasto({ ...novoGasto, data: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm
                                 dark:bg-gray-700 dark:text-white">
                {editingGastoId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingGastoId && (
                <button type="button" onClick={cancelarEdicaoGasto} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
              )}
            </div>
          </form>

<div>
  <h3 className="text-sm font-medium mb-2">Últimos gastos</h3>
  {gastos.length === 0 ? ( 
    <p className="text-sm opacity-60">Sem lançamentos</p>
  ) : ( 
    <div className="space-y-2">
      {gastos.slice().reverse().map(g => (
        <div key={g.id} className="p-3 rounded-lg border bg-white hover:shadow-sm transition">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{g.descricao}</span>
                {g.parcelasTotal && g.parcelasTotal > 1 && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex-shrink-0">
                    {g.parcelaAtual}/{g.parcelasTotal}
                  </span>
                )}
              </div>
              
              <div className="text-xs opacity-60 mt-0.5 flex items-center gap-2 flex-wrap dark:text-gray-400">
                <span>{new Date(g.data).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>{g.categoria}</span>
                <span>•</span>
                <span>{g.tipoPagamento}{g.cartaoNome && ` - ${g.cartaoNome}`}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="font-semibold text-sm whitespace-nowrap">
                  {fmt(toNum(g.valor))}
                </div>
              </div>
              
              <div className="flex gap-1.5">
                <button 
                  type="button" 
                  onClick={() => iniciarEdicaoGasto(g)} 
                  className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition
                             dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  title="Editar"
                >
                  Editar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja remover este gasto?')) {
                      removerGasto(g.id);
                    }
                  }}
                  className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 transition
                             dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  title="Excluir"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        </section>
      )}

      {tab === 'receitas' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
          <h2 className="text-lg font-medium">{editingReceitaId ? 'Alterar Receita' : 'Lançar Receita'}</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            onSubmit={editingReceitaId ? salvarEdicaoReceita : adicionarReceita}
            key={`receita-form-${editingReceitaId || 'novo'}`}
          >
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Descrição</label>
              <input
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaReceita.descricao}
                onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
                placeholder="ex: salário"
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaReceita.valor}
                onChange={(e) => setNovaReceita({ ...novaReceita, valor: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Data</label>
              <input
                type="date" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaReceita.data}
                onChange={(e) => setNovaReceita({ ...novaReceita, data: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm
                                 dark:bg-gray-700 dark:text-white">
                {editingReceitaId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingReceitaId && (
                <button type="button" onClick={cancelarEdicaoReceita} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
              )}
            </div>
          </form>

<div>
  <h3 className="text-sm font-medium mb-2">Últimas receitas</h3>
  {receitas.length === 0 ? (
    <p className="text-sm opacity-60">Sem lançamentos</p>
  ) : (
    <div className="space-y-3">
      {receitas.slice().reverse().map(r => (
        <div key={r.id} className="p-4 rounded-xl border bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-medium text-base">{r.descricao}</div>
              
              <div className="text-sm opacity-70 mt-1 dark:text-gray-400">
                <span className="font-medium">Data:</span> {new Date(r.data).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                {fmt(toNum(r.valor))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t">
            <button 
              type="button" 
              onClick={() => iniciarEdicaoReceita(r)} 
              className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition
                         dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              Editar
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm('Tem certeza que deseja remover esta receita?')) {
                  removerReceita(r.id);
                }
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition
                         dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        </section>
      )}

{tab === 'assinaturas' && (
  <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
    <h2 className="text-lg font-medium">{editingAssinaturaId ? 'Alterar Assinatura/Contrato' : 'Adicionar Assinatura/Contrato'}</h2>
    <form
      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      onSubmit={editingAssinaturaId ? salvarEdicaoAssinatura : adicionarAssinatura}
      key={`assinatura-form-${editingAssinaturaId || 'novo'}`}
    >
      <div className="md:col-span-4">
        <label className="text-xs opacity-70">Nome</label>
        <input className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={novaAssinatura.nome}
          onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, nome: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs opacity-70">Valor {novaAssinatura.tipo === 'ACORDO' ? 'Total' : ''} (R$)</label>
        <input type="number" step="0.01" min="0" className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={novaAssinatura.valor}
          onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, valor: e.target.value })} />
      </div>
      <div className="md:col-span-3 grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs opacity-70">Dia</label>
          <input type="number" min="1" max="31" className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={novaAssinatura.diaCobranca || ''}
            onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, diaCobranca: Number(e.target.value) })} />
        </div>
        {novaAssinatura.periodoCobranca === 'ANUAL' && (
          <div>
            <label className="text-xs opacity-70">Mês</label>
            <select className="w-full p-2 border rounded-lg"
              value={novaAssinatura.mesCobranca}
              onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, mesCobranca: Number(e.target.value || 1) })}>
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
        {novaAssinatura.periodoCobranca === 'ANUAL' && (
          <div>
            <label className="text-xs opacity-70">Ano Adesão</label>
            <input type="number" min="2000" max="2100" 
              className="w-full p-2 border border-gray-200 rounded-lg bg-white
                         dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={novaAssinatura.anoAdesao} onChange={(e) => setNovaAssinatura({ ...novaAssinatura, anoAdesao: Number(e.target.value) })} />
          </div>
        )}
      </div>
      <div className="md:col-span-3">
        <label className="text-xs opacity-70">Tipo</label>
        <select 
          className="w-full p-2 border border-gray-200 rounded-lg bg-white
                     dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={novaAssinatura.tipo}
          onChange={(e) => setNovaAssinatura({ ...novaAssinatura, tipo: e.target.value as TipoAssinatura })}
        >
          <option value="ASSINATURA">Assinatura</option>
          <option value="CONTRATO - ALUGUEL">Contrato - Aluguel</option>
          <option value="CONTRATO - PERSONALIZADO">Contrato - Personalizado</option>
          <option value="ACORDO">Acordo</option>
        </select>
      </div>
      {novaAssinatura.tipo === 'CONTRATO - PERSONALIZADO' && (
        <div className="md:col-span-3">
          <label className="text-xs opacity-70">Categoria do contrato</label>
          <input 
            className="w-full p-2 border border-gray-200 rounded-lg bg-white
                       dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={novaAssinatura.categoriaPersonalizada || ''}
            onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, categoriaPersonalizada: e.target.value })} />
        </div>
      )}
      {novaAssinatura.tipo === 'ACORDO' && (
        <div className="md:col-span-2">
          <label className="text-xs opacity-70">Número de parcelas</label>
          <input
            type="number"
            min="1" 
            className="w-full p-2 border border-gray-200 rounded-lg bg-white
                       dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={novaAssinatura.parcelasTotal || 1}
            onChange={(e) => setNovaAssinatura({ ...novaAssinatura, parcelasTotal: parseInt(e.target.value) || 1, parcelaAtual: editingAssinaturaId ? novaAssinatura.parcelaAtual : 1 })}
            placeholder="ex: 3"
          />
        </div>
      )}
      <div className="md:col-span-2">
        <label className="text-xs opacity-70">Periodicidade</label>
        <select 
          className="w-full p-2 border border-gray-200 rounded-lg bg-white
                     dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={novaAssinatura.periodoCobranca}
          onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, periodoCobranca: e.target.value as Periodo })}>
          <option value="MENSAL">MENSAL</option>
          <option value="ANUAL">ANUAL</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs opacity-70">Pagamento</label>
        <select 
          className="w-full p-2 border border-gray-200 rounded-lg bg-white
                     dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={novaAssinatura.tipoPagamento}
          onChange={(e)=>setNovaAssinatura({
            ...novaAssinatura,
            tipoPagamento: e.target.value as TipoPagamento,
            cartaoId: e.target.value === 'CRÉDITO' ? (novaAssinatura.cartaoId || cartoes[0]?.id || null) : null
          })}>
          <option value="DÉBITO">DÉBITO</option>
          <option value="CRÉDITO">CRÉDITO</option>
        </select>
      </div>
      {novaAssinatura.tipoPagamento === 'CRÉDITO' && (
        <div className="md:col-span-3">
          <label className="text-xs opacity-70">Cartão</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={novaAssinatura.cartaoId ?? ''}
            onChange={(e)=>setNovaAssinatura({ ...novaAssinatura, cartaoId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Selecione...</option>
            {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      )}
      <div className="md:col-span-2 flex gap-2">
        <button className="px-3 py-2 rounded-lg bg-black text-white text-sm w-full
                           dark:bg-gray-700 dark:text-white">
          {editingAssinaturaId ? 'Salvar' : 'Adicionar'}
        </button>
        {editingAssinaturaId && (
          <button type="button" onClick={cancelarEdicaoAssinatura} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Cancelar</button>
        )}
      </div>
    </form>

    <div>
      <h3 className="text-sm font-medium mb-2">Lista de Assinaturas e Contratos</h3>
      {assinaturas.length === 0 ? (
        <p className="text-sm opacity-60">Sem registros</p>
      ) : (
        <div className="space-y-3">
          {assinaturas.slice().reverse().map(a => {
            const ehAcordo = a.tipo === 'ACORDO';
            const parcelaAtual = a.parcelaAtual ?? 1;
            const parcelasTotal = a.parcelasTotal ?? 1;
            const parcelaConcluida = ehAcordo && parcelaAtual > parcelasTotal;
            const valorParcela = ehAcordo ? toNum(a.valor) / parcelasTotal : toNum(a.valor);
            const progressoParcelas = ehAcordo ? (parcelaAtual / parcelasTotal) * 100 : 0;

            return (
              <div key={a.id} className={`p-4 rounded-xl border border-gray-200
                                         ${parcelaConcluida ? 'bg-green-50 border-green-300 dark:bg-green-900 dark:border-green-700 dark:text-gray-200' : 'bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base">{a.nome}</span>
                      {a.periodoCobranca === 'MENSAL' && calcularProximoVencimentoMensal(a)?.ehProximo && !parcelaConcluida && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Vence em breve</span>
                      )}
                      {a.periodoCobranca === 'ANUAL' && calcularProximoVencimentoAnual(a)?.ehProximo && !parcelaConcluida && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Vence em breve</span>
                      )}
                      {parcelaConcluida && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">✓ Concluído</span>
                      )}
                    </div>
                    
                    <div className="text-sm opacity-70 mt-1 space-y-0.5 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Tipo:</span> {a.tipo}
                        {a.categoriaPersonalizada && ` • ${a.categoriaPersonalizada}`}
                      </div>
                      <div>
                        <span className="font-medium">Vencimento:</span> {' '}
                        {a.periodoCobranca === 'ANUAL' 
                          ? `${String(a.diaCobranca).padStart(2,'0')}/${String(a.mesCobranca).padStart(2,'0')}` 
                          : `Todo dia ${a.diaCobranca}`}
                        {' • '}{a.periodoCobranca}
                      </div>
                      <div>
                        <span className="font-medium">Pagamento:</span> {a.tipoPagamento}
                        {a.tipoPagamento === 'CRÉDITO' && a.cartaoNome && ` • ${a.cartaoNome}`}
                      </div>
                      {ehAcordo && (
                        <div>
                          <span className="font-medium">Parcelas:</span> {parcelaAtual}/{parcelasTotal} pagas
                          {' • '}{fmt(valorParcela)}/mês
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {ehAcordo ? fmt(valorParcela) : fmt(toNum(a.valor))}
                      {ehAcordo && <span className="text-xs font-normal opacity-60">/mês</span>}
                    </div>
                    {ehAcordo && (
                      <div className="text-xs opacity-60 mt-1">
                        Total: {fmt(toNum(a.valor))}
                      </div>
                    )}
                    {!ehAcordo && (
                      <div className="text-xs opacity-60 mt-1">
                        Anual: {fmt(toNum(a.valor) * (a.periodoCobranca === 'MENSAL' ? 12 : 1))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progresso para Acordos */}
                {ehAcordo && (
                  <div className="mt-3 mb-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${parcelaConcluida ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-400'}`}
                        style={{ width: `${Math.min(progressoParcelas, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button 
                    type="button" 
                    onClick={() => iniciarEdicaoAssinatura(a)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition
                               dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    ✏️ Editar
                  </button>
                  {ehAcordo && !parcelaConcluida && (
                    <button 
                      type="button" 
                      onClick={() => {
                        if (window.confirm(`Confirmar pagamento da parcela ${parcelaAtual}/${parcelasTotal}?`)) {
                          pagarParcelaAcordo(a.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition
                                 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                    >
                      ✓ Pagar parcela {parcelaAtual}
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => removerAssinatura(a.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition
                               dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )} 
      <div className="mt-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-700 dark:text-gray-200">
        <div className="text-sm font-semibold text-right">
          Valor Total Anual de Assinaturas: {fmt(totalAnualAssinaturas)}
        </div>
      </div>
    </div>
  </section>
)}

      {tab === 'objetivos' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
          <h2 className="text-lg font-medium">Objetivos</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" 
                onSubmit={adicionarObjetivo}>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Nome</label>
              <input 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoObjetivo.nome}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor necessário (R$)</label>
              <input type="number" step="0.01" min="0" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={String(novoObjetivo.valorNecessario || '')}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, valorNecessario: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Status</label>
              <select 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoObjetivo.status}
                onChange={(e)=>setNovoObjetivo({ ...novoObjetivo, status: e.target.value as StatusObj })}>
                <option>IMEDIATO</option>
                <option>EM PROGRESSO</option>
                <option>DISTANTE</option>
                <option>QUITADO - EM PROGRESSO</option>
                <option>QUITADO - FINALIZADO</option>
              </select>
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm
                                 dark:bg-gray-700 dark:text-white">Adicionar</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objetivos.length === 0 ? (
              <p className="text-sm opacity-60">Sem objetivos</p>
            ) : objetivos.map(o => {
              const necessario = toNum(o.valorNecessario);
              const progressoBase = necessario > 0 ? Math.min(100, Math.round((o.valorAtual / necessario) * 100)) : 0;
              const progresso = (o.status === 'QUITADO - EM PROGRESSO') ? 100 : progressoBase;
              const quitado = o.status.startsWith('QUITADO');
              return (
                <div key={o.id} className={`p-4 rounded-2xl border ${quitado ? 'bg-green-50 border-green-300 dark:bg-green-900 dark:border-green-700' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{o.nome}</div>
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={o.status}
                      onChange={(e)=>alterarStatusObjetivo(o.id, e.target.value as StatusObj)}
                    >
                      <option>IMEDIATO</option>
                      <option>EM PROGRESSO</option>
                      <option>DISTANTE</option>
                      <option>QUITADO - EM PROGRESSO</option>
                      <option>QUITADO - FINALIZADO</option>
                    </select>
                  </div>
                  <div className="text-sm opacity-70 mt-1">Meta: {fmt(necessario)}</div>
                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div className={`h-2 rounded ${quitado ? 'bg-green-600' : 'bg-black'}`} style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div>Acumulado: {fmt(o.valorAtual)}</div>
                    <div>{progresso}%</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="px-2 py-1 bg-gray-900 text-white rounded dark:bg-gray-600 dark:text-white" onClick={()=>atualizarObjetivoValor(o.id, 50)} type="button">+ R$50</button>
                    <button className="px-2 py-1 bg-gray-200 rounded dark:bg-gray-600 dark:text-white" onClick={()=>atualizarObjetivoValor(o.id, -50)} type="button">- R$50</button>
                    <button className="px-2 py-1 rounded bg-red-600 text-white text-xs dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            onClick={() => { if (window.confirm('Remover este objetivo?')) setObjetivos(prev => prev.filter(obj => obj.id !== o.id)); }} type="button">Remover</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'cartoes' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
          <h2 className="text-lg font-medium">Cartões de Crédito</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" 
                onSubmit={adicionarCartao}>
            <div className="relative">
              <label className="text-xs opacity-70">Nome</label>
              <input 
                className="w-full p-2 border border-gray-300 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoCartao.nome}
                onChange={(e) => {
                  const valor = e.target.value;
                  setNovoCartao({ ...novoCartao, nome: valor.toUpperCase() });
                  if (valor.trim()) {
                    const sugestoes = SUGESTOES_BANCOS.filter(b => b.startsWith(valor.toUpperCase()));
                    setSugestoesCartao(sugestoes);
                    setSugestaoAtivaIndex(sugestoes.length > 0 ? 0 : -1);
                  } else {
                    setSugestoesCartao([]);
                  }
                }}
                onBlur={() => setTimeout(() => setSugestoesCartao([]), 150)}
                onKeyDown={(e) => {
                  if (sugestoesCartao.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSugestaoAtivaIndex(prev => (prev + 1) % sugestoesCartao.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSugestaoAtivaIndex(prev => (prev - 1 + sugestoesCartao.length) % sugestoesCartao.length);
                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                      if (sugestaoAtivaIndex > -1) {
                        e.preventDefault();
                        if (sugestoesCartao[sugestaoAtivaIndex]) {
                          setNovoCartao(c => ({...c, nome: sugestoesCartao[sugestaoAtivaIndex] ?? ''}));
                      }
                      setSugestoesCartao([]);
                      }
                    } else if (e.key === 'Escape') {
                      setSugestoesCartao([]);
                    }
                  }
                }}
                 />
              {sugestoesCartao.length > 0 && novoCartao.nome.trim() && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {sugestoesCartao.map((s, index) => <li key={s} className={`p-2 cursor-pointer ${sugestaoAtivaIndex === index ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`} onMouseDown={() => { setNovoCartao(c => ({...c, nome: s})); setSugestoesCartao([]); }}>{s}</li>)}
                </ul>
              )}
            </div>
            <div>
              <label className="text-xs opacity-70">Limite (R$)</label>
              <input type="number" step="0.01" min="0" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoCartao.limite}
                onChange={(e)=>setNovoCartao({ ...novoCartao, limite: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Dia de vencimento</label>
              <input type="number" min="1" max="28" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoCartao.diaVencimento || ''}
                onChange={(e)=>setNovoCartao({ ...novoCartao, diaVencimento: Number(e.target.value) })} />
            </div>            
            <div>
              <label className="text-xs opacity-70">Dia de fechamento</label>
              <input type="number" min="1" max="31"
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novoCartao.diaFechamento || ''}
                onChange={(e) => setNovoCartao({ ...novoCartao, diaFechamento: Number(e.target.value) })} />
            </div>
            <div> 
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm
                                 dark:bg-gray-700 dark:text-white">Adicionar</button>
            </div>
          </form>

        
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {cartoes.length === 0 ? (
      <p className="text-sm opacity-60">Nenhum cartão</p>
    ) : cartoes.map(c => {
      const usadoMes = gastos.filter(g => g.tipoPagamento === 'CRÉDITO' && g.cartaoId === c.id && isSameMonth(g.data))
                             .reduce((acc, g) => acc + toNum(g.valor), 0);
      const disp = Math.max(0, toNum(c.limite) - usadoMes);
      const dadosCartao = getDadosCartao(c.nome);
      const isEditing = editingCardId === c.id;

      if (isEditing && editCardDraft) {
        return (
          <div key={c.id} className="p-4 rounded-2xl border bg-white dark:bg-gray-800 space-y-2">
            <div className="flex items-center justify-between dark:text-gray-200">
              <div className="font-medium">Editar cartão</div>
              <span className="text-xs opacity-60">#{c.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
<label className="flex flex-col">
  <span className="opacity-60">Nome</span>
  <input 
    className="p-2 border border-gray-200 rounded-lg bg-white
               dark:bg-gray-700 dark:text-white dark:border-gray-600"
    value={editCardDraft?.nome ?? ''}
    onChange={(e)=>setEditCardDraft(editCardDraft ? { ...editCardDraft, nome: e.target.value } : null)} />
</label>
<label className="flex flex-col">
  <span className="opacity-60">Limite (R$)</span>
  <input type="number" min="0" step="0.01" 
    className="p-2 border border-gray-200 rounded-lg bg-white
               dark:bg-gray-700 dark:text-white dark:border-gray-600"
    value={editCardDraft?.limite ?? ''}
    onChange={(e)=>setEditCardDraft(editCardDraft ? { ...editCardDraft, limite: e.target.value } : null)} />
</label>
<label className="flex flex-col">
  <span className="opacity-60">Dia de fechamento</span>
  <input type="number" min="1" max="31"
    className="p-2 border border-gray-200 rounded-lg bg-white
               dark:bg-gray-700 dark:text-white dark:border-gray-600"
    value={(editCardDraft as any).diaFechamento} onChange={(e) => setEditCardDraft(prev => prev ? { ...prev, diaFechamento: Number(e.target.value || 1) } : null)} />
</label>
              <label className="flex flex-col">
                <span className="opacity-60">Dia de vencimento</span>
                <input type="number" min="1" max="28" 
                  className="p-2 border border-gray-200 rounded-lg bg-white
                             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={editCardDraft.diaVencimento}
                  onChange={(e)=>setEditCardDraft({ ...(editCardDraft as Cartao), diaVencimento: Number(e.target.value || 1) })} />
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" className="px-3 py-2 rounded bg-black text-white text-xs" onClick={saveEditCard}>Salvar</button>
              <button type="button" className="px-3 py-2 rounded bg-gray-200 text-xs" onClick={cancelEditCard}>Cancelar</button>
            </div>
          </div>
        );
      }

      return (
        <div key={c.id} className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col
                                   dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full inline-block ${dadosCartao.bg}`}></span>
                {c.nome}
              </div>
            </div>            
            <div className="text-sm opacity-70 mt-1">Fechamento: dia {(c as any).diaFechamento}</div>
            <div className="text-sm opacity-70 mt-1">Venc.: dia {c.diaVencimento}</div>
            {dadosCartao.imagem && ( // Imagens de cartão podem precisar de ajuste para modo escuro, ou serem SVGs que se adaptam
              <img src={dadosCartao.imagem} alt={c.nome} className="w-24 h-auto my-3" />
            )}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button type="button" className="px-2 py-1 rounded bg-gray-900 text-white text-xs dark:bg-gray-600 dark:text-white" onClick={()=>startEditCard(c)}>Editar</button>
            <button type="button" className="px-2 py-1 rounded bg-red-600 text-white text-xs dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800" onClick={()=>deleteCard(c.id)}>Remover</button>
          </div>
        </div>
      );
    })}
  </div>
        </section>
      )}

      {tab === 'dividas' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 dark:text-gray-200 space-y-4">
          <h2 className="text-lg font-medium">Dívidas — Quem me deve</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" 
                onSubmit={adicionarDivida}>
            <div>
              <label className="text-xs opacity-70">Pessoa</label>
              <input 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaDivida.pessoa}
                onChange={(e)=>setNovaDivida({ ...novaDivida, pessoa: e.target.value })} />
            </div>
            <div>
              <label className="text-xs opacity-70">Valor (R$)</label>
              <input type="number" step="0.01" min="0" 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaDivida.valor}
                onChange={(e)=>setNovaDivida({ ...novaDivida, valor: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Descrição</label>
              <input 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={novaDivida.descricao}
                onChange={(e)=>setNovaDivida({ ...novaDivida, descricao: e.target.value })} />
            </div>
            <div>
              <button className="w-full px-3 py-2 rounded-lg bg-black text-white text-sm
                                 dark:bg-gray-700 dark:text-white">Adicionar</button>
            </div>
          </form>

          {dividas.length === 0 ? (
            <p className="text-sm opacity-60">Sem dívidas registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="dark:text-gray-400">
                <tr className="text-left opacity-60">
                  <th className="py-2">Pessoa</th>
                  <th>Descrição</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dividas.slice().reverse().map(d => (
                  <tr key={d.id} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="py-2">{d.pessoa}</td>
                    <td>{d.descricao}</td>
                    <td className="text-right">{fmt(toNum(d.valor))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === 'configuracoes' && (
        <section className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 space-y-6">
          <h2 className="text-lg font-medium text-black dark:text-gray-200">Configurações</h2>

          <div className="p-4 border border-gray-200 rounded-xl dark:border-gray-600">
            <h3 className="font-medium mb-2 text-black dark:text-gray-200">Cores do Dashboard</h3>
            <p className="text-sm opacity-70 mb-4 dark:text-gray-400">Defina os valores para que os indicadores de "Saldo" e "Crédito Disponível" mudem de cor.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-black dark:text-gray-200">Saldo (Dinheiro)</h4>
                <div className="space-y-2">
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-orange-500">laranja</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.saldo.alerta} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, alerta: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-red-600">vermelho</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.saldo.critico} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, critico: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-green-600">verde</b> acima de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.saldo.positivo} onChange={e => setConfiguracoes(c => ({ ...c, saldo: { ...c.saldo, positivo: e.target.value } }))} />
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-black dark:text-gray-200">Crédito Disponível</h4>
                <div className="space-y-2">
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-orange-500">laranja</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.credito.alerta} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, alerta: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-red-600">vermelho</b> abaixo de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.credito.critico} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, critico: e.target.value } }))} />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="opacity-60">Fica <b className="text-green-600">verde</b> acima de (R$):</span>
                    <input type="number" step="0.01" 
                      className="p-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={configuracoes.credito.positivo} onChange={e => setConfiguracoes(c => ({ ...c, credito: { ...c.credito, positivo: e.target.value } }))} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal: Assinaturas Mensais */}
      {showMensaisModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" 
             onClick={() => setShowMensaisModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-7xl p-6 dark:bg-gray-800 dark:text-gray-200" 
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Assinaturas Mensais</h3>
              <button className="px-3 py-1 rounded bg-black text-white dark:bg-gray-700 dark:text-white" onClick={() => setShowMensaisModal(false)} type="button">Fechar</button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={mensaisQuery} onChange={e=>setMensaisQuery(e.target.value)} placeholder="Buscar por nome..." className="border rounded px-2 py-1 flex-1" type="text" />
              <select value={mensaisSort} onChange={e=>setMensaisSort(e.target.value as any)} className="border rounded px-2 py-1">
                <option value="vencimento">Ordenar por vencimento</option>
                <option value="nome">Ordenar por nome</option>
                <option value="valor">Ordenar por valor</option>
              </select>
            </div>
            <div className="border-b border-gray-200 pb-4 mb-4"></div> {/* Separador horizontal adicionado */}
            <div className="grid md:grid-cols-3 gap-6 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="pr-6">
                <div className="font-medium mb-2">Assinaturas</div>
                {mensaisList.length === 0 ? <p className="text-sm opacity-60">Nenhuma</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {mensaisList.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">
                            {calcularProximoVencimentoMensal(a)?.ehProximo && !darkMode && ( // Ícone de aviso só no modo claro
                              <span className="mr-2" title="Vencimento próximo!">⚠️</span>
                            )}
                            {a.nome}
                          </td>
                          <td>{fmt(toNum(a.valor))}</td>
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${a.cartaoNome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(mensaisList.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
              <div className="px-6">
                <div className="font-medium mb-2">Contratos (Aluguel)</div>
                {alugueisMensais.length === 0 ? <p className="text-sm opacity-60">Nenhum</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left opacity-60"><tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr></thead>
                    <tbody>
                      {alugueisMensais.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="py-1">{a.nome}</td>
                          <td>{fmt(toNum(a.valor))}</td> 
                          <td>{a.diaCobranca}</td>
                          <td>{a.tipoPagamento}{a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${a.cartaoNome ?? ''}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-2 text-right text-sm font-semibold">Total: {fmt(alugueisMensais.reduce((s,a)=>s + toNum(a.valor), 0))}</div>
              </div>
              <div className="pl-6">
            <div className="font-medium mb-2">Acordos</div>
            {acordosMensaisList.length === 0 ? (
              <p className="text-sm opacity-60">Nenhum</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left opacity-60">
                  <tr><th>Nome</th><th>Valor</th><th>Dia</th><th>Pagamento</th></tr>
                </thead>
                <tbody>
                  {acordosMensaisList.map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="py-1">
            {a.nome}
            {a.parcelasTotal && a.parcelasTotal > 1 && (
              <span className="text-xs opacity-70 ml-1">
                ({a.parcelaAtual ?? 1}/{a.parcelasTotal})
              </span>
            )}
          </td>
            <td>{fmt(toNum(a.valor))}</td>
            <td>{a.diaCobranca}</td>
            <td>
              {a.tipoPagamento}
              {a.tipoPagamento === 'CRÉDITO' && a.cartaoId ? ` • ${a.cartaoNome ?? ''}` : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
  <div className="mt-2 text-right text-sm font-semibold">
    Total: {fmt(acordosMensaisList.reduce((s, a) => s + toNum(a.valor), 0))}
  </div>
              </div>
            </div>
          </div>
      </div>
      )}

      {/* Modal: Gastos em Crédito (mês) */}
      {showCreditoMesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" 
             onClick={() => setShowCreditoMesModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-6xl p-6 dark:bg-gray-800 dark:text-gray-200" 
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Gastos em Crédito (mês)</h3>
              <button className="px-3 py-1 rounded bg-black text-white dark:bg-gray-700 dark:text-white" onClick={() => setShowCreditoMesModal(false)} type="button">Fechar</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6"> {/* Removed creditByCard from here */}
              <div className="md:col-span-2">
                <table className="w-full text-sm">
                  <thead className="text-left opacity-60">
                    <tr><th>Data</th><th>Descrição</th><th>Cartão</th><th>Valor</th></tr>
                  </thead>
                  <tbody>{creditGastosMesList.map((l: { id: string; data: string; descricao: string; cartaoNome: string | null; valor: number; }) => (
                      <tr key={l.id} className="border-t">
                        <td className="py-1 border-gray-200 dark:border-gray-700">{l.data.toString().startsWith('Invalid') ? l.data.toString() : (new Date(l.data)).toLocaleDateString()}</td>
                        <td>{l.descricao}</td>
                        <td>
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full inline-block ${getDadosCartao(l.cartaoNome ?? '').bg}`}></span>
                            {l.cartaoNome}
                          </span>
                        </td>
                        <td>{fmt(l.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:col-span-1">
                <div className="font-medium mb-2">Resumo por cartão</div>
                <ul className="text-sm space-y-2">
                  {creditByCard.map(r => ( 
                    <li key={r.cartao.id} className="p-2 rounded border flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.cartao.nome}</div>
                        <div className="opacity-60">
                          Limite {fmt(toNum(r.cartao.limite))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fmt(r.usado)}</div>
                        <div
                          className={`opacity-60 ${getCorTextoProgresso((r.usado / toNum(r.cartao.limite)) * 100)}`}
                        >
                          Restante {fmt(r.disponivel)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  ); // Closing parenthesis for the return statement
} // Closing curly brace for the LifeTracker function

function setShowCreditoMesModal(arg0: boolean): void {
  throw new Error('Function not implemented.');
}