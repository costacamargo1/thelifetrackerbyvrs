# Life Tracker by vrs

O **Life Tracker** é uma aplicação web de finanças pessoais, projetada para oferecer uma visão clara e controle total sobre a vida financeira do usuário. Construído com tecnologias web modernas, o painel centraliza o gerenciamento de despesas, receitas, cartões de crédito e metas, tudo em uma interface intuitiva e responsiva.

A aplicação funciona inteiramente no lado do cliente (client-side), garantindo que todos os dados financeiros permaneçam privados e seguros no navegador do usuário, utilizando o `localStorage` para persistência de dados.

![image](https://github.com/user-attachments/assets/141929c8-045c-411d-894a-a08899839131)

## 🚀 Rodando o Projeto

### Requisitos
- Node.js (v18 ou superior)
- npm (ou um gerenciador de pacotes compatível)

### Instalação e Execução Local
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/thelifetrackerbyvrs.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd thelifetrackerbyvrs
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

### Build para Produção
Para criar uma versão otimizada para produção:
```bash
npm run build
```
Os arquivos finais estarão na pasta `dist/`. Para visualizar o build localmente:
```bash
npm run preview
```

---

## ✨ Design e Interface (UI/UX)

A interface do Life Tracker foi projetada para ser limpa, moderna e funcional.

*   **Estilo "Glassmorphism"**: A UI utiliza um efeito de "vidro fosco" (`glass-card`) nos cartões e painéis, criando uma sensação de profundidade e modernidade.
*   **Tema Claro e Escuro (Dark/Light Mode)**: A aplicação detecta a preferência de tema do sistema operacional do usuário na primeira visita. É possível alternar entre os modos a qualquer momento, e a escolha é salva para visitas futuras.
*   **Responsividade**: A interface é totalmente responsiva, adaptando-se a desktops, tablets e dispositivos móveis. Em telas menores, a barra de navegação lateral (`Sidebar`) é recolhida por padrão para maximizar o espaço útil.
*   **Feedback Visual e Animações**: Animações sutis de fade-in (`animate-fadeInUp`) são usadas para carregar elementos de forma suave. Cores dinâmicas nos painéis de Saldo e Crédito (vermelho, laranja, verde) fornecem feedback visual imediato sobre a saúde financeira, com base em limites personalizáveis.
*   **Ícones**: A aplicação faz uso extensivo de ícones das bibliotecas `lucide-react` e `react-icons`, além de SVGs customizados para as bandeiras dos cartões, tornando a interface mais informativa e visualmente agradável.

---

## 🛠️ Lógica Técnica e Gerenciamento de Estado

O coração da aplicação reside no componente `LifeTracker.tsx`, que centraliza o estado e a lógica de negócio.

*   **Gerenciamento de Estado (React Hooks)**:
    *   `useState`: Gerencia o estado local, como a aba ativa (`tab`), os dados dos formulários e o estado dos modais.
    *   `useEffect`: Utilizado para persistir os dados no `localStorage` sempre que o estado principal (gastos, receitas, etc.) é alterado. Também é usado para carregar os dados na inicialização da aplicação.
    *   `useMemo`: Otimiza o desempenho calculando valores derivados (como totais, saldos e resumos) apenas quando suas dependências mudam, evitando recálculos desnecessários a cada renderização.

*   **Persistência de Dados (`localStorage`)**: Todos os dados inseridos pelo usuário (gastos, receitas, cartões, etc.) são serializados para JSON e salvos no `localStorage` do navegador. Isso torna a aplicação autônoma (sem necessidade de backend) e garante a privacidade do usuário.

*   **Funções Auxiliares (`utils/helpers.tsx`)**: Funções utilitárias, como `fmt` (para formatar valores monetários) e `toNum` (para conversão segura para número), são usadas em toda a aplicação para garantir consistência.

---

## 📋 Funcionalidades Detalhadas

A navegação é organizada em abas, cada uma representando uma funcionalidade chave.

### 1. Dashboard
A tela principal, que oferece um resumo completo da situação financeira.
*   **Cards Principais**: Saldo em conta, crédito disponível, total de gastos no débito e crédito.
*   **Previsão do Mês**: Um painel que projeta os gastos fixos do mês corrente, incluindo aluguel, assinaturas e faturas de cartão.
*   **Pagamento de Aluguel**: Funcionalidade que permite marcar o aluguel como pago, gerando automaticamente uma transação de despesa.
*   **Resumos Visuais**:
    *   **Gastos por Categoria**: Lista as despesas agrupadas por categoria.
    *   **Compras Parceladas**: Mostra o andamento de compras parceladas ativas.
    *   **Assinaturas Anuais**: Alerta sobre assinaturas anuais com vencimento próximo.
    *   **Metas Financeiras**: Exibe o progresso de cada objetivo cadastrado.

### 2. Gastos
Permite o registro detalhado de todas as despesas.
*   **Formulário Inteligente**:
    *   **Sugestão de Descrição**: Ao digitar, sugere descrições comuns para agilizar o preenchimento.
    *   **Detecção de Categoria**: Preenche a categoria automaticamente com base na descrição (ex: "Uber" → "Transporte").
    *   **Suporte a Parcelamento**: Ao adicionar um gasto no crédito, é possível dividi-lo em várias parcelas, e o sistema cria os lançamentos futuros automaticamente.

### 3. Receitas
Uma seção simples e direta para registrar todas as fontes de renda.

### 4. Contas Recorrentes
Gerenciamento de despesas fixas, como assinaturas, aluguéis e acordos.
*   **Flexibilidade**: Suporta pagamentos mensais e anuais.
*   **Tipos de Contas**: Permite diferenciar entre `Assinatura`, `Contrato de Aluguel` e `Acordo` (dívidas parceladas).

### 5. Objetivos
Ferramenta para definir e acompanhar metas financeiras.
*   **Acompanhamento de Progresso**: O usuário pode adicionar ou retirar valores de cada objetivo, e o progresso é exibido visualmente em uma barra.

### 6. Cartões
Gerenciador de cartões de crédito.
*   **Cadastro Completo**: Permite salvar informações como nome do cartão, limite, e dias de fechamento e vencimento da fatura.
*   **Identidade Visual**: Exibe o ícone correspondente a cada banco para fácil identificação.

### 7. Faturas
Visualizador de faturas de cartão de crédito.
*   **Navegação por Mês**: Permite consultar o extrato de qualquer mês.
*   **Detalhes por Cartão**: Agrupa todos os lançamentos (compras e assinaturas) por cartão, exibindo o total de cada fatura.
*   **Busca Rápida**: Um campo de busca facilita encontrar transações específicas.

### 8. Resumo Anual
Oferece uma visão macro do desempenho financeiro ao longo do ano.
*   **Gráficos e Tabela**: Apresenta gráficos de barras mensais para receitas e despesas, além de uma tabela detalhada com o saldo de cada mês.

### 9. Configurações
Área para personalizar a experiência do usuário.
*   **Limites de Alerta**: Permite configurar os valores que definem as cores (alerta e crítico) dos cards de saldo e crédito no dashboard.
*   **Gerenciador de Categorias**: O usuário pode criar, editar e excluir categorias de despesa e receita.
