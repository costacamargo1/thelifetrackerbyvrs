# Life Tracker

Projeto React + TypeScript + Tailwind pronto para rodar localmente e fazer deploy na Vercel.

## Rodar localmente
```bash
npm install
npm run dev
```
Abra http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Deploy (Vercel)
- Faça push deste repositório para o GitHub.
- Na Vercel > Import Project > selecione o repositório.
- Framework: *Vite* | Build: `npm run build` | Output: `dist`

---

## Descrição Detalhada do Projeto: Life Tracker

O **Life Tracker** é uma aplicação web completa para gerenciamento de finanças pessoais, construída com tecnologias modernas como **React**, **TypeScript** e **Tailwind CSS**. O projeto foi desenvolvido para ser uma ferramenta centralizada, permitindo ao usuário um controle granular sobre suas receitas, gastos, cartões de crédito, assinaturas e objetivos financeiros, tudo isso com uma interface reativa e com suporte a tema claro e escuro.

A aplicação é um *Single Page Application (SPA)*, onde a navegação entre as diferentes seções é gerenciada internamente pelo React, sem a necessidade de recarregar a página. Todos os dados são salvos localmente no navegador do usuário através do `localStorage`, garantindo privacidade e funcionamento offline.

### Estrutura e Tecnologias

*   **React**: Utilizado para construir a interface de usuário de forma componentizada e reativa. O estado da aplicação é gerenciado através dos hooks `useState`, `useEffect` e `useMemo`.
*   **TypeScript**: Garante a segurança de tipos em todo o código, prevenindo erros comuns em JavaScript e melhorando a manutenibilidade. As interfaces como `Gasto`, `Receita`, `Cartao`, etc., definidas no início de `LifeTracker.tsx`, são um bom exemplo disso.
*   **Tailwind CSS**: Framework CSS *utility-first* usado para estilizar toda a aplicação. Ele permite a criação de interfaces complexas e responsivas diretamente no JSX. O modo escuro é implementado com a estratégia de classe (`darkMode: ["class"]` em `tailwind.config.ts`) e as cores são definidas como variáveis CSS em `src/index.css`, permitindo a troca de tema de forma eficiente.
*   **Vite**: Ferramenta de build moderna que proporciona um ambiente de desenvolvimento extremamente rápido com *Hot Module Replacement (HMR)*.

---

### Funcionalidades Principais (Abas)

A navegação principal é feita por um conjunto de botões que alteram o estado `tab`, renderizando a seção correspondente.

#### 1. Dashboard (Aba Principal)

É a tela inicial e o centro nervoso da aplicação, oferecendo uma visão geral da saúde financeira do usuário.

*   **Cards de Resumo**: Exibe os principais indicadores:
    *   **Saldo (Dinheiro)**: Calculado como `totalReceitas - gastosDebito - assinDebitoMensal`.
    *   **Crédito Disponível**: O limite total de todos os cartões menos os gastos e assinaturas no crédito.
    *   **Gastos (Crédito, Dinheiro e Total)**: Soma dos gastos do mês.
    *   **Estilo e Interatividade**: Os cards utilizam as classes `glass-card` e `glass-card-hover` (definidas em `src/index.css`) para um efeito de "vidro" com animação ao passar o mouse.
    *   **Cores Dinâmicas**: Os valores de Saldo e Crédito Disponível mudam de cor (verde, laranja, vermelho) com base em limites definidos pelo usuário na aba "Configurações". A função `getCorValor` em `LifeTracker.tsx` é responsável por essa lógica.

*   **Previsão de Gastos**: Uma seção que projeta os gastos fixos do mês atual, incluindo:
    *   **Aluguel**: Permite marcar o aluguel como pago, o que gera um gasto automático na aba "Gastos" (função `pagarAluguel`).
    *   **Acordos e Assinaturas**: Mostra os totais e permite abrir um modal para ver os detalhes.

*   **Gráficos e Listas Adicionais**:
    *   **Gastos por Categoria**: Uma lista que agrupa todos os gastos por sua categoria.
    *   **Compras Parceladas Ativas**: Exibe compras que ainda possuem parcelas a vencer.
    *   **Assinaturas Anuais**: Lista as assinaturas anuais e destaca com um "⚠️" as que estão próximas do vencimento, usando a função `calcularProximoVencimentoAnual`.
    *   **Objetivos**: Mostra o progresso de cada objetivo cadastrado.

#### 2. Gastos

Seção dedicada ao registro e visualização de todos os gastos.

*   **Formulário Inteligente**:
    *   **Detecção de Categoria**: Ao digitar a descrição, a função `detectarCategoria` sugere automaticamente uma categoria (ex: "ifood" -> "ALIMENTAÇÃO").
    *   **Sugestões de Descrição**: Oferece uma lista de sugestões (`SUGESTOES_GLOBAIS`) que pode ser navegada com as setas do teclado e selecionada com Enter, agilizando o preenchimento.
    *   **Parcelamento**: Para pagamentos no crédito, é possível definir um número de parcelas. A função `adicionarGasto` cria múltiplos registros de gasto, um para cada mês futuro.

*   **Lista de Gastos**: Exibe os gastos em ordem cronológica inversa, com detalhes como data, categoria, forma de pagamento e parcelas. Cada item possui botões para **Editar** e **Excluir**.

#### 3. Receitas

Funciona de forma similar à aba de Gastos, mas para registrar entradas de dinheiro como salários, bônus, etc.

#### 4. Assinaturas/Contratos

Permite gerenciar pagamentos recorrentes.

*   **Tipos Flexíveis**: Suporta diferentes tipos de recorrência:
    *   `ASSINATURA`: (ex: Netflix, Spotify).
    *   `CONTRATO - ALUGUEL`: Um tipo especial com a opção de "Pagar".
    *   `ACORDO`: Para dívidas parceladas, com controle de parcelas pagas e restantes.
*   **Cálculo de Vencimento**: O sistema avisa sobre assinaturas com vencimento próximo.
*   **Gerenciamento de Parcelas**: Para acordos, é possível "Pagar parcela", atualizando o progresso da dívida.

#### 5. Objetivos

Uma ferramenta para acompanhar metas financeiras.

*   **Cadastro de Metas**: O usuário define um nome e um valor necessário.
*   **Acompanhamento de Progresso**: É possível adicionar ou remover valores do "Valor Atual" e visualizar o progresso em uma barra percentual.
*   **Status**: Cada objetivo pode ter um status como "EM PROGRESSO" ou "QUITADO - FINALIZADO", o que altera a aparência do card.

#### 6. Cartões

Gerenciamento completo dos cartões de crédito.

*   **Cadastro**: Permite adicionar novos cartões com nome, limite, dia de vencimento e dia de fechamento. O campo de nome possui sugestões (`SUGESTOES_BANCOS`).
*   **Visualização**: Cada cartão é exibido em um card com seu ícone (ex: `Nubank`, `Itau`), limite e datas. As imagens SVG são importadas no topo do `LifeTracker.tsx`.
*   **Edição e Remoção**: É possível editar os dados de um cartão ou removê-lo. Ao remover, os gastos antigos associados a ele mantêm o nome do cartão como referência histórica, mas perdem o `cartaoId`.

#### 7. Faturas

Visualizador detalhado das faturas de cartão de crédito para um determinado mês.

*   **Seleção de Mês**: O usuário pode navegar entre os meses para ver faturas passadas ou futuras.
*   **Agrupamento por Cartão**: A tela exibe colunas separadas para cada cartão, listando todos os lançamentos (gastos e assinaturas) daquele período.
*   **Busca**: Um campo de busca permite filtrar os lançamentos por descrição, categoria ou valor.
*   **Totalizadores**: Mostra o total de cada fatura individual e o valor total de todas as faturas do mês.

#### 8. Configurações

Permite ao usuário personalizar o comportamento da aplicação.

*   **Cores do Dashboard**: O usuário pode definir os valores que determinam quando os indicadores de "Saldo" e "Crédito Disponível" ficam laranja (alerta) ou vermelho (crítico), tornando a visualização mais pessoal.

#### 9. Resumo Anual

Oferece uma visão macro do ano financeiro.

*   **Gráficos de Barra**: Exibe gráficos mensais para:
    *   Receitas
    *   Gastos em Dinheiro
    *   Gastos em Crédito
*   **Seleção de Ano**: O usuário pode alterar o ano para analisar dados históricos.