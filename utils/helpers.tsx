import { Gasto } from '../src/pages/types';

export const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

export const toNum = (s: string | number | null | undefined) => {
  if (typeof s === 'number') return s;
  const v = parseFloat(String(s || '0').replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};

export const CATEGORIAS_GASTO = ['ALIMENTAÇÃO', 'TRANSPORTE', 'LAZER', 'SAÚDE', 'MORADIA', 'EDUCAÇÃO', 'COMPRAS', 'VESTUÁRIO', 'ELETRÔNICOS', 'UTENSÍLIOS DOMÉSTICOS', 'BELEZA & CUIDADOS', 'PETS', 'INVESTIMENTOS', 'IMPREVISTO', 'OUTROS'] as const;

export const detectarCategoria = (descricao: string): typeof CATEGORIAS_GASTO[number] => {
  const d = (descricao || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const match = (palavras: string[]) => palavras.some(k => d.includes(k));

  if (d.startsWith('imprevisto')) return 'IMPREVISTO';
  if (match(['almoco','almoço','ifood','lanche','comida','salgado','doce','docinho','cafe','jantar','restaurante','padaria','mercado','supermercado','pizza','hamburguer','acai','açai','cerveja','bebida','suco','refrigerante','agua','sorvete','pao','queijo','leite','carne','frango','peixe','arroz','feijao','macarrao','biscoito','frutas','verduras','legumes','hortifruti','feira','delivery'])) return 'ALIMENTAÇÃO';
  if (match(['uber','taxi','99','gasolina','combustivel','onibus','metro','metrô','estacionamento','pedagio','pedágio','passagem','bus','vlt','trem','mobilidade','moto','carro','veiculo','veículo','uber','cabify','indriver','ipva','licenciamento','multa','transito','trânsito'])) return 'TRANSPORTE';
  if (match(['cinema','teatro','show','festa','balada','bar','jogo','game','passeio','viagem','turismo','parque','diversao','diversão','streaming','netflix','spotify','youtube','prime','disney','hbo','entretenimento','ingresso','evento','concerto','museu','clube','piscina'])) return 'LAZER';
  if (match(['farmacia','farmácia','remedio','remédio','medicamento','consulta','medico','médico','dentista','exame','hospital','clinica','clínica','academia','personal','nutricao','nutrição','psicologia','terapia','fisioterapia','laboratorio','laboratório','cirurgia','vacina','plano','saude','saúde','oculos','óculos','aparelho','ortodontia'])) return 'SAÚDE';
  if (match(['aluguel','condominio','condomínio','luz','energia','eletrica','elétrica','agua','água','internet','gas','gás','iptu','manutencao','manutenção','reforma','pintura','encanador','eletricista','limpeza','faxina','zeladoria','seguro residencial','taxa','boleto'])) return 'MORADIA';
  if (match(['curso','faculdade','universidade','escola','colegio','colégio','livro','apostila','aula','treinamento','workshop','seminario','seminário','mestrado','doutorado','pos','pós','graduacao','graduação','material escolar','mensalidade','matricula','matrícula','idioma','ingles','inglês','espanhol'])) return 'EDUCAÇÃO';
  if (match(['celular','smartphone','notebook','computador','tablet','pc','mouse','teclado','monitor','tv','televisao','televisão','smartwatch','fone','headphone','caixa de som','carregador','cabo','fonte','hd','ssd','memoria','memória','placa','processador','webcam','microfone','alexa','google home','chromecast','apple','samsung','xiaomi','motorola','lg','console','playstation','xbox','nintendo'])) return 'ELETRÔNICOS';
  if (match(['microondas','geladeira','fogao','fogão','maquina de lavar','lavadora','secadora','aspirador','ferro','panela','frigideira','prato','copo','talher','faca','colher','garfo','liquidificador','batedeira','airfryer','cafeteira','torradeira','ventilador','ar condicionado','aquecedor','cama','colchao','colchão','travesseiro','lencol','lençol','cobertor','toalha','cortina','tapete','mesa','cadeira','sofa','sofá','armario','armário','guarda-roupa','estante','rack','organizador','varal','balde','vassoura','rodo','pano','esponja','detergente'])) return 'UTENSÍLIOS DOMÉSTICOS';
  if (match(['roupa','camisa','camiseta','calca','calça','short','bermuda','vestido','saia','blusa','jaqueta','casaco','tenis','tênis','sapato','sandalia','sandália','chinelo','bota','meia','cueca','calcinha','sutia','sutiã','pijama','uniforme','terno','gravata','cinto','bolsa','mochila','carteira','relogio','relógio','anel','colar','brinco','pulseira','acessorio','acessório'])) return 'VESTUÁRIO';
  if (match(['salao','salão','cabelo','cabeleireiro','barba','barbeiro','manicure','pedicure','estetica','estética','depilacao','depilação','massagem','spa','maquiagem','cosmetico','cosmético','perfume','shampoo','condicionador','creme','hidratante','protetor solar','desodorante','sabonete','escova','secador','chapinha','navalha','aparador','unha','esmalte','skin care','tratamento'])) return 'BELEZA & CUIDADOS';
  if (match(['pet','cachorro','gato','ração','racao','veterinario','veterinário','vacina animal','banho e tosa','petshop','brinquedo pet','caminha','coleira','guia','antipulgas','vermifugo','vermífugo','areia gato','comedouro','bebedouro'])) return 'PETS';
  if (match(['investimento','aplicacao','aplicação','poupanca','poupança','cdb','tesouro','acao','ação','bolsa','fundo','previdencia','previdência','renda fixa','renda variavel','variável','crypto','bitcoin','corretora','xp','nuinvest','inter invest'])) return 'INVESTIMENTOS';
  if (match(['loja','shopping','mercadolivre','amazon','shopee','shein','aliexpress','magazine','casas bahia','americanas','presente','gift','compra'])) return 'COMPRAS';

  return 'OUTROS';
};

export const SUGESTOES_BANCOS = ['NUBANK', 'SANTANDER', 'CAIXA', 'C6', 'ITAÚ', 'BRADESCO', 'INTER', 'BANCO DO BRASIL'];

export const SUGESTOES_DESCRICAO: Record<string, string[]> = {
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

export const SUGESTOES_GLOBAIS = [
  'iFood', 'Jantar restaurante', 'Uber', '99', 'Gasolina', 'Netflix', 'Spotify',
  'Amazon', 'Mercado livre', 'Mercado', 'Supermercado', 'Shopee', 'Roupa', 'Sapato',
  'Farmácia', 'Remédio', 'Academia', 'Cinema', 'Viagem', 'Passagem aérea', 'Hotel',
  'Aluguel', 'Luz', 'Água', 'Internet', 'Iptu', 'Curso online', 'Livro', 'Presente',
  'Imprevisto', 'Pizza', 'Hambúrguer', 'Açaí', 'Café', 'Padaria', 'Salgado', 'Cerveja',
  'Bar', 'Jogo', 'Passeio', 'Dentista', 'Consulta médica', 'Exame', 'Estacionamento',
  'Pedágio', 'Ônibus', 'Metrô', 'Transferência', 'Doação', 'Outros',
];