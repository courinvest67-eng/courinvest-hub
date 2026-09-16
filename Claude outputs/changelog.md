# Courinvest Hub — Histórico de Atualizações da Plataforma

Este documento é o registro central de evolução do Courinvest Hub (o app de gestão de clientes e patrimônio da Courinvest). Toda vez que uma nova versão do `index.html` for enviada, ela deve ser registrada aqui.

## Como manter este histórico atualizado

1. Ao receber um novo `index.html`, localizar a variável `SW_VERSION` perto do fim do arquivo (seção do Service Worker inline) — é o número de versão oficial da plataforma.
2. Comparar com a última versão registrada no log abaixo.
3. Pedir (ou levantar a partir do próprio código/conversa) quais foram as mudanças daquela versão e registrar uma nova entrada no log, com data, número de versão e resumo das mudanças.
4. Substituir o arquivo-fonte salvo no projeto (`courinvest-hub-fonte.html`) pela versão mais nova, para manter sempre só a última versão completa como referência (evita acumular várias cópias pesadas).

## Snapshot atual

- **Versão (SW_VERSION):** 416
- **Rótulo interno exibido no app:** "Premium v3.0"
- **Data de registro:** 15/09/2026
- **Arquivo de referência salvo no projeto:** `courinvest-hub-fonte.html`
- **Stack técnica:** React 18 (via Babel Standalone, aplicação single-file), Firebase (Auth + Firestore + Storage), PWA com service worker inline (auto-update sem precisar fechar o app), geração de PDF no navegador (jsPDF + html2canvas, renderizado página a página), leitura de planilhas (SheetJS/XLSX) e PDFs (pdf.js), envio de e-mail automático via EmailJS, dados de mercado via API do Banco Central (Olinda/BCB — Selic, IPCA, Focus).

## Inventário de módulos identificados

- Dashboard: alertas, eventos do mês, ranking de clientes, heatmap
- Cadastro de clientes (campos padrão + campos extras específicos do Hub)
- Agenda de reuniões com tipos personalizáveis
- Planejador FIRE
- Assistente de IRPF interativo
- Motor de relatórios em PDF (dark, estilo GP): capa, sumário, Brasil/Exterior, performance mensal/anual/trimestral, impacto cambial, KPIs, narrativa automática, aviso de come-cotas, rentabilidade por moeda, benchmarks e atribuição, alocação (donuts), proventos, movimentações, objetivos e metas, rentabilidade por instituição, composição detalhada por macro-classe
- Relatórios "light" (IRPF / Aporte / Planejamento) e relatório mensal de Gestão Financeira
- Painel de aprovação e envio em lote dos relatórios mensais (e-mail/WhatsApp), com marcação de enviado, desmarcação e reenvio individual por cliente
- Análise financeira inteligente com insights e diagnóstico automático
- Relatório de orçamento familiar/doméstico multi-página com gráficos
- Módulo de Clientes / Leads / Métricas / gráfico de evolução dos últimos 12 meses
- Notícias ao vivo via RSS + parágrafos de análise macro gerados automaticamente (Selic/Copom, IPCA, Fed)
- Propostas comerciais e apresentação institucional (fluxo lista → preview em PDF → wizard de edição)
- Autenticação e sincronização em tempo real via Firestore
- Rebalanceamento inteligente de carteira (algoritmo de sugestão)
- PWA completo: manifest, ícones, service worker com auto-atualização silenciosa
- Financeiro → Cartão: importação de faturas de cartão de crédito em PDF com extração automática de lançamentos e categorização por tipo de gasto

## Log de versões

### 15/09/2026 — v416
**Nova apresentação comercial dedicada: Consultoria Financeira (trabalho pontual).** Pedido do Igor logo em seguida da padronização de logos: "Falto criar a apresentação do trabalho de consultoria" — até aqui a Consultoria Financeira só aparecia como um card de resumo na Apresentação Institucional (página "Nossa Solução"), sem uma apresentação própria como GP, GF e GF PJ já tinham.

O que foi criado:
1. **Nova função `ApresentacaoConsultoria`** e nova aba "🎯 Consultoria Financeira" no seletor de Comercial → Apresentação, ao lado de Institucional / Gestão de Patrimônio / Gestão Financeira / Gestão Financeira PJ. Também adicionada ao exportador de PowerPoint (`nomeTab` → `consultoria-financeira`).
2. **Capa própria**, com um degradê exclusivo em tom verde-água (cor nova só dessa apresentação, para diferenciar visualmente das outras 3) e a logo já no padrão definido na v415.
3. **Quem Somos (sócios) idêntico ao das outras apresentações** — mesmo bloco "Dois irmãos. Uma missão." com bios, fotos e certificações de Igor e Victor Couri, reaproveitado sem alteração, seguindo o mesmo padrão de posição (2ª página).
4. **Conteúdo construído a partir do que já existe de verdade no motor de propostas** (`SERVICOS_CI.consultoria`, usado para gerar propostas reais) — nada foi inventado: "Para quem é" (segunda opinião, patrimônio em formação, saindo de banco/corretora), "Escopo de trabalho" com os mesmos 7 itens já usados nas propostas (análise da carteira, diagnóstico, estratégia, recomendações de realocação, execução, orientação tributária, material de suporte), e "Como funciona" com as mesmas 3 sessões (Diagnóstico → Estratégia → Execução) já descritas no motor de propostas.
5. **Preços reais e transparentes** — diferente de GF/GFPJ (que escondem o valor como "sob consulta"), aqui mostrei a régua de preço real já usada para montar propostas de verdade: **R$ 990 fixo** para patrimônio até R$ 100 mil, e **1% do patrimônio analisado** acima disso — a mesma tabela (`TABELA_PRECOS_CI` / `precoConsultoria`) que já roda por trás da aba Propostas. Um aviso no rodapé deixa claro que, se o patrimônio crescer, o caminho para a Gestão de Patrimônio continua aberto (mesma lógica de "ponte" já usada no slide extra da apresentação de GF PJ).
6. **Slide final (CTA) com a logo padronizada** desde a criação, já seguindo o padrão da v415 (sem precisar de correção futura).

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente a apresentação inteira (capa, sócios, preços, CTA) via Playwright antes de publicar.

### 15/09/2026 — v415
**Logo padronizada na capa e no slide final de todas as 4 apresentações comerciais.** Depois do ajuste do ícone (v414), o Igor pediu para inserir a logo em todas as apresentações — capa e último slide — para ficar padronizado. Até aqui só a Institucional tinha a logo completa nos dois lugares; a Gestão de Patrimônio (GP) só tinha no slide final; e Gestão Financeira (GF) e Gestão Financeira PJ (GFPJ) não tinham a logo (símbolo) em lugar nenhum — só um texto "COURINVEST" escrito à mão, sem o ícone.

O que mudou:
1. **Capa da GF e da GFPJ:** o texto solto "COURINVEST / CONSULTORIA EM INVESTIMENTOS" no topo foi substituído pelo componente `<CourinvestLogo>` (mesmo usado na Institucional), com o ícone dos 4 arcos + o texto já estilizado.
2. **Slide final (CTA) da GF e da GFPJ:** adicionada a `<CourinvestLogo>` centralizada acima do rodapé de direitos autorais, no mesmo padrão já usado na Institucional e na GP.
3. **Capa da GP:** adicionada a `<CourinvestLogo>` no canto superior esquerdo (antes não tinha logo nenhuma ali, pois o layout da capa é ancorado embaixo por cima da foto de fundo) — usei posicionamento independente para não bagunçar o alinhamento do texto principal, que continua ancorado na parte de baixo.
4. **Slide final (CTA) da GP:** já tinha a logo certa desde antes, mantido sem alteração.

Resultado: as 4 apresentações agora seguem o mesmo padrão — logo na capa (varia de tamanho conforme o layout de cada uma) e logo centralizada de 260px no slide final, antes do rodapé.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente as 3 capas alteradas (GF, GFPJ, GP) lado a lado via Playwright antes de publicar.

### 15/09/2026 — v414
**Ícone da logo (as "3 C's") corrigido para bater com o logo oficial — estava desenhado errado desde sempre.** O Igor mandou print comparando a logo que aparece no Hub com a logo original da empresa e realmente estavam bem diferentes: o Hub desenhava o símbolo à mão em SVG (dois arcos finos + uma bolinha), só aproximando o design real, que na verdade tem 4 arcos concêntricos grossos em formato de "C" (mais parecido com um ícone de ondas/sinal).

O que mudou:
1. Extraí o símbolo da logo oficial (a partir da imagem que o Igor enviou) como um recorte com fundo transparente, e criei uma variável global `COURINVEST_ICON_URI` (uma imagem embutida em base64) com o desenho correto dos 4 arcos dourados.
2. Troquei o SVG desenhado à mão pelo ícone correto em **3 lugares** que reproduziam o símbolo de forma independente: `Logo()` (a logo pequena da barra lateral, usada em todo o app), e as duas variações dentro de `CourinvestLogo()` (usada nas capas das apresentações comerciais — com e sem o texto ao lado).
3. Aproveitei para ajustar o texto "COURINVEST" nas capas de apresentação para peso mais forte (900) e o subtítulo "CONSULTORIA EM INVESTIMENTOS" para fonte monoespaçada (JetBrains Mono, já usada em outras partes do Hub), aproximando mais do estilo da logo oficial. As cores já estavam corretas (azul-marinho em fundo claro, branco em fundo escuro) — não precisou mexer nisso.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente os 4 contextos onde a logo aparece (barra lateral, capa clara, capa escura, ícone sozinho) via Playwright antes de publicar.

### 14/09/2026 — v413
**Consultoria Financeira de volta na página "Nossa Solução" — agora são 4 serviços, não 3.** Correção sobre a v411: eu tinha tirado a Consultoria Financeira (trabalho pontual, sem apresentação comercial própria) da página de resumo dos serviços, achando que o pedido era igualar 1:1 com as 3 abas de apresentação. O Igor confirmou que a Consultoria continua sendo um serviço real, oferecido pontualmente, e pediu pra manter.

O que mudou (página "Nossa Solução", agora com 4 cards):
1. Card da Consultoria Financeira (🎯) restaurado, com o mesmo texto que já existia antes (três sessões: diagnóstico + estratégia + execução), na cor roxa (`#A78BFA`) — a verde que era dela antes agora é da Gestão Financeira PJ.
2. Título ajustado de "Três caminhos, um destino" para "Quatro caminhos, um destino", e o texto de apoio ajustado de "três frentes de atuação" para "quatro frentes de atuação".
3. Espaçamento entre os cards reduzido de 14 para 12px pra acomodar o quarto card sem ficar muito longo.

Validado recompilando a função `ApresentacaoView` inteira com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente os 4 cards renderizados via Playwright antes de publicar.

### 14/09/2026 — v412
**Slide dos sócios movido para a 2ª página da Apresentação Institucional (padronizando com as outras 3) + novo slide "Modelo Fee-Based".** Pedido do Igor: na Apresentação Institucional, "Quem está por trás" (sócios) estava na página 6; nas outras 3 apresentações (GP, GF, GF PJ) esse mesmo bloco sempre é a página logo após a capa. Reordenado para bater com o padrão. Pedido também para acrescentar algo que eu achasse interessante para a apresentação.

O que mudou (`ApresentacaoView`, aba "institucional"), nova ordem das 9 páginas:
1. Capa
2. **Sócios** (movida — antes era a página 6)
3. Manifesto (era a página 2)
4. O Diagnóstico do Mercado (era a página 3)
5. **Modelo Fee-Based (nova)**
6. Nossa Solução — 3 serviços (era a página 4)
7. Nossa Metodologia (era a página 5)
8. Depoimentos (era a página 7)
9. CTA + Contato (era a página 8)

A página nova ("Modelo Fee-Based") resolve, logo depois do diagnóstico de mercado, o problema nº2 citado ali ("conflito de interesse") com uma comparação direta entre o modelo tradicional (comissão por produto) e o modelo Fee-Based da Courinvest (cobrança pelo serviço, sem comissão escondida) — reaproveitando um conceito que já existe em "Nossa Essência" (página 3) e nas apresentações de GP, só que agora explicado com mais profundidade e de forma visual. Não foram inventados números ou estatísticas — só texto institucional/filosofia de trabalho, para não arriscar apresentar dado de negócio incorreto pro cliente.

Validado extraindo a função `ApresentacaoView` inteira e recompilando com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente a sequência capa → sócios → manifesto → diagnóstico → fee-based via Playwright antes de publicar.

### 14/09/2026 — v411
**Apresentação Institucional atualizada para refletir os 3 serviços atuais (GP, GF e GF PJ), padronizada com as outras 3 apresentações.** Pedido do Igor: a página "NOSSA SOLUÇÃO" (página 4 do pitch institucional) ainda listava "Consultoria Financeira" como um dos 3 serviços — uma oferta pontual que não tem apresentação comercial própria — no lugar da Gestão Financeira PJ, criada na v408 e hoje uma das 3 abas reais de apresentação comercial (junto com Gestão de Patrimônio e Gestão Financeira pessoal).

O que mudou (`ApresentacaoView`, aba "institucional"):
1. **Página 4 (NOSSA SOLUÇÃO — 3 serviços)**: trocado o card "Consultoria Financeira" por "Gestão Financeira PJ", com ícone (🏢), cor (verde) e ordem (GP → GF → GF PJ) alinhados exatamente aos ícones e à ordem das abas da Apresentação Comercial. Taglines e público-alvo de cada card revisados para bater com o que cada apresentação dedicada já diz sobre si mesma.
2. **Página 3 (O DIAGNÓSTICO DO MERCADO)**: o discurso de abertura falava só de "investir mal" / "carteiras" — um recorte que so cobria a Gestão de Patrimônio. Ampliado para incluir também os problemas que levam alguém a contratar Gestão Financeira (falta de controle do orçamento) e Gestão Financeira PJ (empresa sem visão de fluxo de caixa), mantendo o mesmo layout de 4 cards.
3. Pequeno ajuste de texto na própria página 4 ("Cada cliente — pessoa física ou empresa —...") para deixar explícito que o pitch institucional cobre público PF e PJ.

A página de sócios (página 6) já estava idêntica entre Institucional, GP, GF e GF PJ — não precisou de mudança. A oferta de Consultoria Financeira pontual (para patrimônios menores, sem apresentação própria) continua existindo normalmente no motor de propostas — só saiu do resumo dos "3 serviços" do pitch institucional, já que esse resumo agora espelha 1:1 as 3 abas de apresentação comercial.

Validado extraindo a função `ApresentacaoView` inteira e recompilando com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo visualmente as páginas 3 e 4 renderizadas via Playwright antes de publicar.

### 13/09/2026 — v410
**Nova aba "🩺 Diagnósticos" em Comercial, com sugestão automática de valor de proposta mensal.** Pedido do Igor: além do diagnóstico gratuito (pessoal e PJ, criados na v408), quando o cliente preenche o formulário, o sistema já calcular pra Courinvest uma sugestão de valor de proposta mensal — um ponto de partida pra quem for montar a proposta.

O que mudou:
1. **`diagnostico.html` e `diagnostico-pj.html`** (páginas públicas) ganharam uma função de precificação (`sugerirPrecoGF` / `sugerirPrecoPJ`) que calcula uma faixa de valor sugerida a partir de faixas de renda/faturamento (ancoradas nos valores reais que a Gestão Financeira pessoal já usou: R$ 510 individual / R$ 790 casal, hoje ocultos da apresentação) e ajustada por sinais de complexidade do próprio diagnóstico (dívidas acima de um limiar, saldo/margem negativa, muitas categorias de despesa ativas, falta de reserva de caixa). **Nunca aparece pro cliente na tela** — só é gravado junto do lead no Firestore.
2. **Nova sub-aba dentro de Comercial: "🩺 Diagnósticos"** (entre "Apresentação" e "Propostas"), novo componente `DiagnosticosView`. Lista os diagnósticos recebidos (pessoa física e empresas em abas separadas), lidos direto do Firestore, mostrando pra cada lead: dados de contato, renda/faturamento, resultado do mês, poupança/margem, e a faixa de valor sugerida com a justificativa — com botões pra marcar como "Contatado" ou "Arquivar".
3. Na versão PJ, a sugestão vem marcada como estimativa (`precoEstimativa:true`), já que ainda não existe uma tabela de preços PJ validada — só a versão pessoal usa números com histórico real por trás.

**Ação necessária no Firebase Console**: as regras de segurança das coleções `diagnosticos_publicos` e `diagnosticos_pj_publicos` precisam ser atualizadas (a lista de campos permitidos no `create` ganhou os campos novos de preço) — os textos atualizados estão salvos em `claude/diagnostico-orcamento-autoatendido.md`. Sem essa atualização, o Firestore passa a rejeitar a gravação de novos leads.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e testando as duas fórmulas de preço isoladamente em Node com vários cenários antes de integrar.

### 13/09/2026 — v409
**Ajuste no slide de preços da Apresentação Comercial de Gestão Financeira (pessoa física).** Pedido para tirar os valores fixos em R$ do slide "Investimento" e deixar só "Sob consulta", no mesmo padrão adotado na apresentação de Gestão Financeira PJ criada na v408.

O que mudou (dentro de `ApresentacaoGF`, aba Comercial → Apresentação → Gestão Financeira):
- Card "Pessoa Física": "A partir de R$ 510" → **"Sob consulta"**, com a legenda trocada para "Definido após diagnóstico gratuito".
- Card "Casal": "A partir de R$ 790" → **"Sob consulta"** (mantida a legenda "Para duas pessoas · conforme objetivos").
- Nenhum outro texto do slide foi alterado (título "Planos personalizados.", descrição e o aviso de rodapé sobre diagnóstico gratuito continuam iguais).

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 13/09/2026 — v408
**Nova apresentação comercial: Gestão Financeira PJ (empresas).** Pedido para criar uma 4ª aba na Apresentação Comercial, adaptando a Gestão Financeira (hoje só pessoa física) para o público empresarial, com liberdade criativa total e mantendo o padrão das demais apresentações (2º slide = currículo dos sócios, igual às outras).

O que foi adicionado:
1. **Nova função `ApresentacaoGFPJ`**, construída sobre a mesma estrutura visual da `ApresentacaoGF` (mesma tipografia, paleta e formato de seções empilhadas, sem o efeito de slides `.pp-page`). Nova aba "🏢 Gestão Financeira PJ" no seletor de Comercial → Apresentação, ao lado de Institucional / Gestão de Patrimônio / Gestão Financeira.
2. **Capa nova**, com foto inédita dos dois sócios (Igor e Victor) tirada da pasta do Drive compartilhada, ainda não usada em nenhuma outra apresentação.
3. **2º slide (Quem Somos) idêntico ao das outras apresentações** — mesmo bloco "Dois irmãos. Uma missão." com bios, fotos e certificações de Igor e Victor Couri, reaproveitado sem nenhuma alteração, conforme pedido.
4. **Conteúdo todo adaptado para o público PJ**: "Para quem é" (pequenos negócios, empresas em crescimento, holdings/grupos), "Escopo de trabalho" (fluxo de caixa, orçamento por centro de custo, KPIs financeiros, relatórios gerenciais, separação PF x PJ, capital de giro, estruturação societária/sucessória, educação financeira para sócios), metodologia em 4 passos adaptada (diagnóstico empresarial → plano → execução → evolução).
5. **Slide criativo extra: "Do caixa da empresa ao patrimônio do sócio"** — conecta a saúde financeira da empresa ao crescimento patrimonial pessoal dos sócios, criando uma ponte natural com o serviço de Gestão de Patrimônio (oportunidade de cross-sell entre os serviços da Courinvest).
6. **Preços sem valores fixos inventados** — como não existe uma tabela real de preços para PJ ainda, os dois planos (essencial / completo) foram apresentados como "Sob consulta, definido após diagnóstico gratuito", igual ao texto de rodapé que já existia na versão pessoa física, em vez de criar números fictícios.
7. Exportação (PowerPoint e Imprimir/Salvar PDF) already funcionando: `nomeTab` do exportador de PPTX ganhou a chave `gfpj` → arquivo `courinvest-apresentacao-gestao-financeira-pj.pptx`.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Gerei também um preview em PDF (technique idêntica à usada no botão "Imprimir/Salvar PDF" do próprio Hub) e conferi visualmente todas as seções antes de entregar. Peço pra abrir Comercial → Apresentação → Gestão Financeira PJ e conferir com calma, principalmente os textos de preço (estão como "sob consulta" de propósito, por falta de uma tabela real de valores para PJ).

### 12/09/2026 — v407
**Ajustes na Apresentação Comercial de Gestão de Patrimônio** — pedido com print da versão mobile mostrando o slide "Dois irmãos. Uma missão." (currículo dos sócios) no meio da apresentação.

O que mudou (dentro de `ApresentacaoGP`, aba Comercial → Apresentação → Gestão de Patrimônio):
1. **Slide dos sócios movido para logo após a capa.** Antes ele era o 8º slide (entre o "Exemplo Prático" e os "Depoimentos"); agora é o 2º, exatamente como já acontecia na apresentação de Gestão Financeira — padronizando a ordem entre as duas apresentações. Nenhum conteúdo do slide foi alterado (mesmas fotos, bios e textos de Igor e Victor Couri), só a posição.
2. **Novo slide: "Investimentos no Exterior".** Inserido entre "Pilares Estratégicos" e "Remuneração do Serviço" — depois de a apresentação já ter explicado o método e a filosofia de alocação, mostra o diferencial de acesso a mercados internacionais antes de entrar em preço. Traz duas colunas lado a lado — 🇺🇸 Estados Unidos (ações/ETFs listados em Nova York, REITs americanos, Treasuries, exposição ao dólar) e 🇪🇺 Europa (ETFs UCITS domiciliados na Irlanda/Luxemburgo, ações europeias, fundos em euro, exposição ao euro) — seguindo o mesmo estilo visual (cards escuros, título em degradê dourado) já usado nos outros slides da apresentação.
3. Os comentários internos que numeram os slides (`P2`, `P3`...) foram renumerados de P2 a P11 para refletir a nova ordem — só organização do código-fonte, sem efeito visual.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra abrir Comercial → Apresentação → Gestão de Patrimônio e conferir visualmente a nova ordem e o slide novo antes de usar em uma reunião real.

### 11/09/2026 — v406
**Pedido com print de Financeiro → 💳 Cartão: o gráfico "Evolução do Gasto Total no Cartão" saiu "muito compacto", pedindo mais espaçamento.** No print (12 meses de 2025), as barras apareciam pequenas, coladas umas nas outras e ocupando só uma fração da largura disponível do card.

Causa: com mais de 10 meses no ano (11 no caso do print), o gráfico trocava pra um modo de largura fixa por barra (36px) com o card virando scroll horizontal — só que a área visível do card é bem mais larga que 11×36px, então sobrava um espaço vazio enorme à direita e as barras ficavam visualmente "amontoadas" numa fatia pequena do card em vez de aproveitar o espaço. Além disso a altura do gráfico (110px), o espaçamento entre barras (6px) e a largura máxima de cada barra (32px) já eram pequenos mesmo no modo normal (≤10 meses), deixando tudo mais apertado do que precisava.

Ajustes: o limite pra trocar pro modo de largura fixa + scroll subiu de 10 para 15 meses — com isso, os 12 meses de um ano normal continuam esticando pra preencher a largura toda do card (sem sobra vazia), só entrando em modo de rolagem horizontal quando o histórico for realmente longo (múltiplos anos concatenados). Aumentei também a altura do gráfico (110→170px), o espaçamento entre barras (6→14px), a largura máxima de cada barra (32→56px) e o tamanho das fontes dos valores/meses (8→10px) — no geral, um gráfico mais respirado e fácil de ler. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 11/09/2026 — v405
**Bug reportado com print de Financeiro → 📊 Resumo, card "📈 Projeção de Receita 2026": mostrava "Baseada em 8 meses realizados" mas "PROJETADO (3m restantes)" — 8+3 é só 11, faltando um mês na conta (Set, Out, Nov e Dez são 4 meses, não 3).**

Causa: o card calculava "meses restantes" a partir do **mês corrente do calendário** (`new Date().getMonth()+1`, hoje = 9/setembro) em vez de a partir do número de meses **já realizados** que o próprio card mostra ao lado (8 — Jan a Ago; setembro ainda não tinha lançamento nenhum na tela do print). A conta `12 − mês_atual` (12 − 9 = 3) tratava setembro, que ainda está em andamento, como se já estivesse fechado e contabilizado — daí sobrava só Out/Nov/Dez como restante.

Correção: "meses restantes" agora é `12 − meses_realizados` em vez de `12 − mês_atual` — usando o mesmo número que já aparece no card "Realizado" ao lado, garantindo que os dois números sempre somem 12 (nesse caso, 8 realizados + 4 restantes). Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e conferindo a conta isolada em Node com os números exatos do print (8 meses realizados → 4 meses restantes, batendo com Set/Out/Nov/Dez).

### 11/09/2026 — v404
**Pedido: "não está sendo reconhecida na importação as faturas de cartão de 2024, 2023, 2022" — importar um PDF antigo em Financeiro → 💳 Cartão sempre caía em "não reconheceu o layout da fatura".** Cliente anexou a fatura de janeiro/2024 (Banco Inter) como exemplo.

Causa: o parser de fatura em PDF (`parseFaturaCartaoTexto`, adicionado bem depois, já pensando só nas faturas mais recentes) só reconhecia o layout do extrato usado a partir de 2025/2026. A fatura do Inter usada de 2022 a 2024 é de um banco diferente e tem formato de texto bem diferente em quase todo ponto que o parser depende: linha de transação sem a palavra "de" entre dia e mês e sem traço antes do "R$" ("11 dez 2023 Pagto Debito Automatico + R$ 716,65" em vez de "12 de março. 2026 Loja - R$ 50,00"); cabeçalho do cartão com os 2 blocos de dígitos separados por espaço ("CARTÃO 5497 6634") em vez do número mascarado inteiro; linha de total na ordem "VALOR TOTAL CARTÃO..." em vez de "Total CARTÃO..."; parcelamento escrito solto no fim da descrição ("Parcela 02 De 06") em vez de entre parênteses; e o vencimento aparecendo em rótulo e valor em linhas separadas (colunas lado a lado no PDF), sem o rodapé com o cartão mascarado na frente que o parser usava como âncora mais confiável.

Também apareceu, só nessa fatura, um problema à parte: em pelo menos uma transação parcelada o PDF.js decodificou o espaço duplo do PDF como caractere de controle (NUL) em vez de espaço de verdade — o que colava a palavra "Parcela..." direto no valor seguinte e quebraria até uma regex correta. E a própria linha que marca o início da seção de lançamentos ("Despesas da fatura") às vezes sai com espaços extras entre letras por causa da fonte usada nesse layout ("Despesas da fat u ra") — a comparação exata usada até então nunca reconheceria essa linha.

Correção: o parser agora tenta dois formatos de layout em cada linha de transação (o novo, tentado primeiro, e o do Inter como alternativa) e aceita as duas variações de cabeçalho de cartão/total e de parcelamento; a busca pelo vencimento ganhou uma 3ª estratégia (procurar uma linha exatamente "VENCIMENTO" e ler a data na linha logo em seguida) pra cobrir esse layout; a extração de texto do PDF passou a normalizar qualquer caractere de controle pra espaço antes de montar as linhas; e a detecção do início da seção de lançamentos agora compara ignorando espaços, então variações de espaçamento entre letras não quebram mais o reconhecimento. Nenhuma mudança no layout novo (2025/2026) — ele continua sendo tentado primeiro e do jeito que já funcionava.

Validação: como não dá pra rodar o app inteiro num navegador aqui, simulei a extração de texto real do PDF enviado (mesma versão do pdf.js da produção, 3.11.174, mesma técnica de agrupar por posição Y) e rodei o parser corrigido direto contra o texto extraído de verdade — reconheceu os 2 cartões da fatura (5497 6634 e 5497 1940), os 6 lançamentos, o parcelamento (2 de 6), o vencimento (10/01/2024) e bateu o total exato da fatura impresso no PDF (R$ 816,65) e o total de cada cartão (R$ 54,00 e R$ 762,65). Validado também recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 10/09/2026 — v403
**Bug reportado com print de Financeiro → 💳 Cartão, fatura de Jun/26: os 12 lançamentos "IG*GranaCapital" (parcelas 1/12 a 12/12, R$ 359,00 no total) apareciam contando como gasto real em "Assinaturas Profissionais", mas essa cobrança foi cancelada e totalmente estornada** — a própria fatura de Jun/26 já traz, na mesma data (07/mai), um crédito de "IG*GranaCapital - + R$ 359,00" que reverte exatamente as 12 parcelas, só que o Hub tratava esse crédito como um valor solto (jogado na notinha genérica de "créditos/estornos... não contam como gasto") sem ligar ele ao débito que ele estava cancelando.

Correção, seguindo a mesma linha da v399 (não só resolver esse caso, mas detectar o padrão de forma automática): criei uma verificação que roda em toda fatura importada — agrupa os lançamentos por beneficiário e, quando a soma dos débitos de um beneficiário bate (com tolerância de centavos) com a soma dos créditos daquele mesmo beneficiário dentro da mesma fatura, entende que foi uma cobrança feita e cancelada/estornada por completo, e não conta esse valor nem como gasto (some da categoria e do total do mês) nem como crédito solto — já que uma coisa anula a outra. Só estornos **totais** são tratados assim; um estorno parcial continua aparecendo normalmente (pra não esconder por engano uma despesa que só foi parcialmente devolvida). Testado contra as 9 faturas reais de 2026 já usadas pra validar o parser: só Jun/26 tem essa situação (os R$ 359,00 do GranaCapital), nenhuma das outras 8 faturas foi afetada — o total de gasto de Jun/26 cai de R$ 991,73 para R$ 632,73 e uma nota nova aparece na tela ("🔄 R$ 359,00 em cobranças feitas e totalmente estornadas/canceladas dentro dessa mesma fatura") explicando o porquê da diferença em relação ao total oficial impresso na fatura (que continua mostrado como "Total da fatura" sem alteração, já que esse valor vem direto do banco). O gráfico "Evolução do Gasto Total no Cartão" também passou a refletir esse ajuste. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 10/09/2026 — v402
**Pedido em Financeiro → 📊 Resumo: o card "💸 Despesas" (com Remuneração dos Sócios e Despesas Operacionais) continuava mostrando o ano inteiro mesmo depois de clicar num mês específico no gráfico "Receita por Mês".** Só o card de detalhamento da receita (mais abaixo) reagia ao clique; o card de despesas, que fica logo acima do gráfico, sempre somava o ano todo.

Correção: agora, ao clicar num mês no gráfico "Receita por Mês", o card "💸 Despesas" passa a mostrar só os lançamentos daquele mês — título, totais (Total / Operacional / Remuneração Sócios), lista de categorias e o detalhamento "por sócio" dentro de cada categoria. Um botão "✕ Ver ano todo" aparece ao lado do título pra voltar a ver o ano completo sem precisar rolar até o gráfico de baixo pra clicar no ✕ de lá. Se o mês selecionado não tiver nenhuma despesa lançada, aparece um aviso em vez do card ficar em branco. A evolução mensal por categoria (que já existia dentro de cada categoria expandida) continua mostrando todos os meses do ano, para dar contexto de tendência mesmo com um mês específico selecionado. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 10/09/2026 — v401
**Ajuste pedido em Financeiro → 💳 Cartão (feature nova da v400): separar as faturas por ano também**, já que o seletor de meses estava mostrando todos os meses importados numa fileira só, misturando anos (ex.: Out/25 a Set/26).

O que mudou: quando há faturas de mais de um ano importadas, aparece uma fileira de abas por ano (ex.: "2025" / "2026") acima do seletor de meses; escolher um ano filtra tanto os meses mostrados abaixo quanto o gráfico "Evolução do Gasto Total no Cartão", que passa a mostrar só os meses daquele ano. Com um único ano importado, essa fileira de anos fica oculta (sem necessidade). Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

### 10/09/2026 — v400
**Pedido: adicionar em Financeiro o detalhamento mensal dos gastos do cartão de crédito, começando por 2026, detalhado por categoria de gasto** — com link de uma pasta do Google Drive contendo as faturas em PDF do cartão (Banco Inter). Pedido inicial era só "detalhamento dos gastos"; logo depois veio um ajuste de direção importante: o detalhamento precisava ser **por categoria de gasto**, não uma lista crua de lançamentos.

O que mudou: nova aba **Financeiro → 💳 Cartão**. Nela tem um botão pra importar as faturas em PDF (aceita vários arquivos de uma vez) — o próprio navegador lê o PDF (usando a mesma biblioteca pdf.js que o Hub já usa pra outras importações) e extrai os lançamentos, sem precisar de nenhum site ou serviço externo. Depois de importar, aparece um seletor de mês e, pra cada mês: o total gasto no cartão, comparado com o total da fatura; um quadro "por categoria" (Alimentação, Transporte, Assinaturas Profissionais, Contabilidade, Seguros, Streaming e Entretenimento, Estacionamento, Saúde e Bem-estar, Viagem, Taxas e IOF, Compras, e "Outros" pra quem não bateu com nenhuma regra ainda) ordenado do maior gasto pro menor, com barra de proporção e % do total — clicando numa categoria, abre a lista dos lançamentos daquela categoria (data, estabelecimento, parcela quando for o caso, valor); e um gráfico de evolução do gasto total mês a mês, com os meses clicáveis pra trocar a visão.

A categorização é automática, por palavra-chave no nome do estabelecimento (ex.: "AGILIZETECNO" → Contabilidade, "99APP"/"UBER" → Transporte, nomes de restaurante/cafeteria → Alimentação, etc.). Reimportar a fatura do mesmo mês substitui os dados daquele mês (não duplica), pra poder reprocessar se precisar.

Pra construir e validar isso com precisão, baixei as 9 faturas reais de jan-set/2026 do link do Drive que você mandou e usei elas como referência: extraí o texto de cada PDF localmente (fora do Hub, só pra testar a lógica) e confirmei, lançamento por lançamento, que o total que o parser calcula bate exatamente com o "Total CARTÃO" impresso em cada fatura, nos 2 cartões × 9 meses — 18 conferências, todas exatas. Uma regra de negócio que descobri nesse processo e que é importante você saber: o **"Total CARTÃO" impresso na fatura soma só os lançamentos de débito (compras)** — estornos e créditos (ex.: reembolso, "PAGTO DEBITO AUTOMATICO") aparecem na lista mas não entram nesse total; o Hub reproduz esse mesmo comportamento. Também validei que nenhum dos estabelecimentos reais dessas 9 faturas caiu em "Outros" (cobertura completa das categorias atuais) — mas se aparecer um estabelecimento novo que devia ir pra uma categoria diferente, só me falar o nome exato que eu ajusto a regra. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe.

Importante: essa entrega traz o **mecanismo** de importação e categorização, mas não tenho como escrever direto nos seus dados (Firestore) daqui — os dados de 2026 só vão aparecer na aba quando você importar as faturas pelo botão novo. Pode reaproveitar as mesmas 9 faturas (jan a set/2026) da pasta do Drive que você linkou.

### 09/09/2026 — v399
**Bug reportado com print da aba Financeiro → 👥 Por Cliente: "Marcus" aparecendo duplicado como dois clientes diferentes** — "Marcus Condé Goyatá Lopes" (R$ 20.650,88, 9 pgtos) e "Marcus Goyatá" (R$ 4.989,92, 2 pgtos), sendo a mesma pessoa lançada com grafias diferentes em NFs importadas em momentos distintos. Pedido: corrigir esse caso e revisar/criar uma lógica que detecte esse tipo de duplicidade de forma geral, não só esse cliente pontual.

Causa raiz: em "Por Cliente", "Recorrentes" e "Ticket Médio", o Hub sempre agrupou os lançamentos usando o texto exato do campo "Cliente" da planilha de NF como chave — então qualquer variação de grafia entre duas importações (nome completo numa NF, versão abreviada em outra) virava, sem querer, dois clientes diferentes nas contas.

Correção: criei uma normalização automática de nome de cliente, calculada uma vez a partir de todos os nomes distintos já importados. Regra: se **todas** as palavras de um nome mais curto aparecem, por inteiro, dentro das palavras de um nome mais longo (ignorando acento/maiúsculas) — e o nome mais curto tem 2 ou mais palavras, pra não juntar por engano dois clientes que só compartilham um primeiro nome comum — os dois são tratados como o mesmo cliente, usando a versão mais completa como nome "oficial". Essa normalização agora é aplicada nos três lugares que agrupam por cliente: "Por Cliente" (incluindo o "Faturamento por Cliente" do Resumo mensal), "Recorrentes" (captação/perda/base) e "Ticket Médio" (contagem de clientes pagantes por mês). "Marcus Condé Goyatá Lopes" e "Marcus Goyatá" agora somam R$ 25.640,80 num único cliente.

Também deixei um ponto de ajuste manual no código (`CLIENTE_ALIAS_MANUAL`) pra casos que essa regra automática não consiga resolver sozinha — por exemplo um apelido bem diferente do nome de cadastro (tipo "Zé" para "José"), onde não há palavra em comum pra regra detectar. Se aparecer outro cliente duplicado desse jeito, é só me avisar com o nome dos dois lançamentos que eu adiciono o caso ali.

Importante: como essa regra roda em cima dos nomes que já estão nos seus dados importados (não tenho acesso à sua base ao vivo daqui), não dá pra eu garantir 100% que não sobrou nenhum outro cliente duplicado — a regra cobre o padrão "nome completo vs. nome parcial" (que foi exatamente o caso do Marcus), mas não pega apelidos sem nenhuma palavra em comum. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra abrir Financeiro → 👥 Por Cliente e dar uma conferida geral na lista pra ver se restou algum outro cliente separado que devia estar junto — qualquer um que encontrar, me manda o nome exato dos dois lançamentos.

### 09/09/2026 — v398
**Pedido em Financeiro → 🔄 Recorrentes: os dois gráficos de barras (Entradas/Perdas e Ticket Médio) também com visualização por ano, não só por mês.**

O que mudou: um seletor **Mensal / Anual** logo acima dos dois gráficos, que controla os dois ao mesmo tempo:
- **Entradas e Perdas**: na visão anual, cada barra soma todos os clientes captados/perdidos daquele ano (em vez de um bloco por mês), com o saldo do ano e a base acumulada no fim daquele ano.
- **Ticket Médio Geral**: na visão anual, cada barra mostra o ticket médio do ano inteiro. Importante: não é a média simples dos 12 tickets mensais — é a receita total do ano dividida pela soma de clientes pagantes de cada mês daquele ano (uma média ponderada), pra um mês com bem mais clientes pagando não pesar igual a um mês com poucos.

Os cards de "Ticket Médio atual" (Geral/GP/GF) no topo continuam sempre mensais (média dos últimos 3 meses) — não fazia sentido esses mudarem com o seletor, já que representam "o ticket agora", não uma série histórica.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe — e com um teste isolado (Node) da agregação por ano, conferindo que a soma de novos/perdidos e a receita batem exatamente com a soma manual dos meses de cada ano. Peço pra abrir Financeiro → 🔄 Recorrentes, alternar entre Mensal e Anual nos dois gráficos e confirmar que os números anuais fazem sentido.

### 09/09/2026 — v397
**Correção de fundo em Financeiro → 🔄 Recorrentes: os dados de captação/perda estavam vindo do cadastro de clientes, e o cadastro tinha muita sujeira.** Reportado com print mostrando datas quebradas ("undefined/undefined/46136" — um número de série de data do Excel que nunca foi convertido), o mesmo cliente ("Jorge e Camila") aparecendo duas vezes como "recém-captado" com valores diferentes, valores de mensalidade com centavos estranhos (R$ 443,82, R$ 294,04...) que não batem com nenhum fee redondo cobrado de verdade, e "Nenhuma perda registrada" — o que não é plausível pra uma base de clientes de vários anos.

Causa raiz: a v395 usava os campos `status`/`dtCaptacao`/`dtStatusChange` do cadastro de clientes (`Clientes` no menu) pra decidir quem entrou/saiu e quando, e o valor em R$ vinha de uma fórmula (fee cadastrado × patrimônio importado) — e esses dois pontos de dado, pra boa parte da base, nunca foram mantidos corretamente: datas de importação antiga viraram número de série do Excel em vez de data, clientes que já saíram há tempos nunca tiveram o status trocado pra "inativo/encerrado" no Hub (por isso zero perdas apareciam), e o patrimônio/fee cadastrado de vários clientes está desatualizado ou incompleto.

Correção, como pedido: a análise inteira agora usa como base o **histórico real de faturamento (NF)** já importado em Financeiro → Importar — a mesma fonte de dado que a aba "Por Cliente" e o "Ticket Médio" (v396) já usavam. Pra cada cliente (agrupado pelo nome exato como está na planilha), olho os lançamentos de Gestão de Patrimônio/Gestão Financeira: o mês do primeiro lançamento é a "captação"; se ele fica 2 meses seguidos sem nenhum lançamento novo — contando a partir do mês mais recente que existe em QUALQUER lançamento recorrente importado (não a partir de hoje, pra não marcar todo mundo como perdido só por a planilha do mês ainda não ter sido importada) — ele é considerado "perdido", com o valor do último pagamento real registrado (não mais uma fórmula sobre patrimônio/fee cadastrado).

Duas limitações que deixei explícitas na própria tela: (1) se um cliente já pagava antes do início do histórico importado nas planilhas, o "mês de captação" mostrado é só o primeiro que aparece nos dados, não necessariamente a captação real; (2) o agrupamento é por nome de texto exato — uma grafia diferente do mesmo cliente entre importações (espaço a mais, abreviação) conta como cliente separado. Ambas são inerentes a trabalhar a partir de planilha em vez de um ID de cliente único, e não têm como ser eliminadas sem mudar como a NF é importada.

Validado com um teste isolado (Node, sem JSX) com 4 clientes simulados — um pagando em dia, um parado há 3 meses (deveria aparecer como perdido, e apareceu), um com só 1 pagamento recente ainda dentro da janela de tolerância (deveria continuar ativo, e continuou), e um lançamento de "Consultoria" avulsa (confirmado que não entra na conta). Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra abrir Financeiro → 🔄 Recorrentes de novo e conferir se os nomes, datas e valores agora fazem sentido — principalmente comparando com o que você sabe de cor sobre quem entrou/saiu recentemente. Se algum cliente ainda aparecer errado, provavelmente é porque o nome dele foi digitado de forma diferente entre duas importações de NF — nesse caso me avisa qual cliente que eu confirmo comparando as planilhas.

### 09/09/2026 — v396
**Complemento pedido na aba Financeiro → 🔄 Recorrentes: evolução do ticket médio por cliente ao longo do tempo.** Pedido logo depois da funcionalidade de entradas/perdas de clientes recorrentes (v395), como um segundo ângulo de análise sobre a mesma base.

O que mudou, na mesma aba **Financeiro → 🔄 Recorrentes**:
- 3 cards novos: **Ticket Médio Geral**, **Ticket Médio GP** (Gestão de Patrimônio) e **Ticket Médio GF** (Gestão Financeira) — cada um mostrando a média dos últimos 3 meses com dados (pra não deixar um mês isolado/incompleto distorcer o número "atual") e uma mini linha de tendência com o histórico completo. O card Geral também mostra a variação percentual contra o mesmo período de 12 meses atrás, quando há dado suficiente.
- Um gráfico de barras com o ticket médio geral mês a mês, desde o primeiro mês com faturamento de Gestão de Patrimônio/Financeira até hoje.

Diferença importante em relação ao card de "MRR Recorrente Ativo" que já existia (v395): aquele é uma **estimativa** a partir do fee/patrimônio atual cadastrado em cada cliente; esse ticket médio novo vem do **faturamento real** já importado na aba Importar — para cada mês, é a soma recebida de Gestão de Patrimônio + Gestão Financeira dividida pelo número de clientes distintos que efetivamente pagaram naquele mês. GP e GF aparecem sempre separados (além do geral combinado) porque uma taxa sobre patrimônio grande e um fee fixo menor têm escalas muito diferentes — uma média misturando os dois seria enganosa se a proporção de clientes GP vs. GF mudar de um mês pro outro, sem nenhuma alteração real de preço.

Validado com um teste isolado (Node, sem JSX) simulando faturamento de 3 clientes GP/GF em 2 meses e um lançamento de "Consultoria" (não recorrente) no meio — confirmado que o ticket médio de cada mês bate exatamente com a conta manual (soma ÷ clientes pagantes) e que o lançamento avulso é excluído corretamente do cálculo. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra abrir Financeiro → 🔄 Recorrentes e conferir se os valores de ticket médio batem com o que você espera, principalmente se os nomes de "Serviço" nas planilhas importadas estão exatamente como "Gestão de Patrimônio" e "Gestão Financeira" — se alguma planilha antiga usou uma grafia diferente, essas entradas não vão entrar nessa conta.

### 09/09/2026 — v395
**Nova funcionalidade pedida: controle e análise de entrada/perda de clientes recorrentes, mês a mês.** Pedido a partir da aba Financeiro, com o esclarecimento de que "recorrente" aqui significa só **Gestão Financeira** e **Gestão de Patrimônio** — os demais trabalhos (avulsos/pontuais) não têm mensalidade e ficam de fora dessa análise.

O que mudou: nova aba **"🔄 Recorrentes"** dentro de Financeiro, com:
- KPIs no topo: recorrentes ativos hoje (separado por Gestão de Patrimônio / Gestão Financeira), MRR (receita recorrente mensal) estimado da base ativa, novos e perdidos nos últimos 12 meses (com o R$ que isso representou), saldo net e taxa de churn histórica.
- Gráfico de barras mês a mês (desde o cliente recorrente mais antigo cadastrado até hoje) mostrando quantos entraram e quantos saíram em cada mês, com o saldo do mês e a base acumulada ao passar o mouse.
- Duas listas: últimos clientes recorrentes captados e últimos perdidos (com serviço, data, quanto tempo ficou como cliente e o valor mensal estimado perdido).

Como foi calculado: reaproveitei os campos que o cadastro de clientes já mantém — `status` (ativo/inativo/encerrado), `dtCaptacao` (data de entrada) e `dtStatusChange` (data da mudança de status) — a mesma lógica que a aba Comercial → Pipeline já usa pra "Evolução da Base", só que aqui filtrada só pra quem tem Gestão Financeira e/ou Gestão de Patrimônio no cadastro (campo `sv`), e com o valor em R$ de cada entrada/saída estimado pela função que já calcula a receita mensal de cada cliente (fee fixo pra Gestão Financeira, % sobre patrimônio pra Gestão de Patrimônio). Combinei as duas perguntas feitas: não pedir motivo da perda (fica só quantidade e datas) e mostrar sim o impacto financeiro em R$.

Limitação importante, deixada explícita na própria tela: o valor em R$ de um cliente já perdido usa o **último dado que ficou registrado no cadastro** dele (fee/patrimônio), não um "histórico congelado" do valor exato que ele pagava no mês em que saiu — o Hub não guarda esse snapshot histórico. Então o número de clientes ganhos/perdidos por mês é exato; o R$ é uma estimativa.

Validado com um teste isolado da lógica de agregação por mês (Node, sem JSX) simulando 6 clientes variados — confirmando que cliente só de "Couri Mile$" (avulso) é excluído corretamente, que a base acumulada mês a mês bate exatamente com a contagem de clientes ativos hoje, e que a virada de ano na sequência de meses funciona. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra abrir Financeiro → 🔄 Recorrentes e conferir se os números batem com o que você espera — principalmente se os clientes que já saíram estão todos com `status` e `dtStatusChange` preenchidos no cadastro (cliente antigo que nunca teve o status mexido pode não ter isso registrado corretamente, e nesse caso pode não aparecer certo no histórico).

### 09/09/2026 — v394
**Ajuste pedido na Proposta Comercial de Gestão Financeira: conteúdo dos "Próximos Passos" e remoção do slide de diagnóstico financeiro.** Pedido feito com prints do PDF da proposta (página "PRÓXIMOS PASSOS") e da tela "Sua situação financeira atual" no Hub.

O que mudou, só na proposta de **Gestão Financeira** (Propostas Comerciais → nova/editar → serviço "Gestão Financeira") — as propostas de Gestão de Patrimônio e Consultoria continuam exatamente como estavam:

1. **Slide "Sua situação financeira atual" removido.** Esse slide (fluxo financeiro mensal, reserva de emergência, dívidas, perfil familiar) não aparece mais na proposta de Gestão Financeira. A numeração das páginas seguintes ("Metodologia" e "Investimento e Precificação") foi ajustada automaticamente pra não pular número (deixa de ter um "buraco" na sequência 01 → 03).
2. **"Próximos Passos" trocado por um roteiro específico do serviço**, substituindo o texto genérico (Revisão / Alinhamento / Assinatura / Início) por:
   1. Criar Grupo de Trabalho no WhatsApp
   2. Formalização do contrato
   3. Reunião Inicial do Serviço
   4. Integração Bancária de todas as contas

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra gerar/visualizar de novo uma proposta de Gestão Financeira e confirmar que o slide de situação financeira já não aparece e que os "Próximos Passos" saíram com o texto novo — e que as propostas de Gestão de Patrimônio e Consultoria continuam iguais a antes.

### 09/09/2026 — v393
**Correção: mesmo depois de virar 8 seções (v392), o PowerPoint de "Gestão Financeira" ainda saía com só 1 slide (a capa) — o resto desaparecia sem nenhum erro visível.** Reportado com print mostrando "Slide 1 de 1" no PowerPoint.

Investigação: descartei duas hipóteses prováveis antes de chegar na causa mais provável. Não é imagem externa quebrada/bloqueada por CORS — conferi o código e TODAS as fotos dessa apresentação (capa e equipe) já vêm embutidas direto no arquivo (formato "data:image", sem depender de internet pra carregar), então não tem imagem de fora pra falhar. A causa mais provável é uma limitação conhecida da biblioteca que tira a "foto" de cada seção (`html2canvas`): ela cria um iframe temporário nos bastidores pra desenhar cada captura e só remove esse iframe depois de terminar — chamar a função de novo pro PRÓXIMO slide imediatamente em seguida, sem dar tempo desse "bastidor" ser desmontado direito, é um cenário já documentado de travamento/corrupção dessa biblioteca. Como a primeira seção (a capa, com uma imagem de fundo grande) provavelmente demora mais pra processar, faz sentido que só ELA saísse certo e as seguintes, vindo rápido demais uma atrás da outra, se perdessem.

Três mudanças, a primeira sendo a correção em si e as outras duas uma rede de segurança pra qualquer causa parecida no futuro:
1. Um pequeno "respiro" (dois quadros de animação, uma fração de segundo) antes de cada seção ser capturada — dá tempo da biblioteca terminar de limpar a captura anterior antes de começar a próxima.
2. Um limite de tempo de 20 segundos por seção: se uma captura travar por qualquer motivo (essa ou outra causa), ela é pulada — sem mais travar TODAS as seções seguintes, só aquela específica.
3. Se mesmo assim algum slide não puder ser gerado, agora aparece um aviso na tela dizendo quantos slides faltaram (antes ficava só num log técnico que ninguém via) — e qualquer imagem já quebrada na tela é trocada por um espaço em branco antes da captura, em vez de deixar a biblioteca tentar buscá-la de novo e travar por causa dela.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Como essa falha só acontece com o html2canvas rodando de verdade num navegador (não reproduzível neste ambiente), peço pra gerar de novo o PowerPoint de "Gestão Financeira" — se ainda faltar algum slide, agora deve aparecer um aviso na tela avisando quantos, e nesse caso peço um print do Console do navegador (F12 → aba Console, procurando por linhas "[PPTX]") pra eu conseguir ver o erro exato e não precisar mais adivinhar a causa.

### 09/09/2026 — v392
**Correção: PowerPoint da Apresentação "Gestão Financeira" saía com um único slide** — uma imagem só, gigante e espremida verticalmente (proporção de ~1:7), em vez de vários slides, um por seção, como as apresentações Institucional e Gestão de Patrimônio já faziam corretamente. Reportado com o próprio arquivo `.pptx` gerado.

Causa: a busca que decide "onde cortar cada slide" (introduzida na v390) procurava elementos com a classe `.pp-page` dentro da apresentação — classe que a Institucional e a Gestão de Patrimônio usam em cada seção, mas que a apresentação de **Gestão Financeira nunca usou** (ela é estruturalmente mais antiga que as outras duas, montada como uma sequência de `<div>` simples, sem essa classe). Sem encontrar nenhuma `.pp-page`, o código caía no último recurso — tratar a apresentação inteira como um slide só — capturando tudo de uma vez numa imagem enorme.

Correção: quando a busca por `.pp-page` não encontra nada, o código agora tenta um segundo caminho antes de desistir — usar cada `<div>` filho direto do container como uma "página" própria (o mesmo princípio já usado há tempos no gerador de PDF do relatório mensal, pra quando uma seção não tem uma classe dedicada). Como cada seção da apresentação de Gestão Financeira já é, na prática, um desses filhos diretos, a apresentação passa a virar 8 slides — um por seção — exatamente como as outras duas apresentações. Institucional, Gestão de Patrimônio e Propostas Comerciais continuam se comportando exatamente como antes (elas têm `.pp-page`, então nunca chegam a usar esse novo caminho).

Validado com um DOM real (jsdom) simulando a estrutura exata da Gestão Financeira (8 `<div>` filhos diretos, sem `.pp-page`) — confirmado que as 8 seções agora são detectadas corretamente — e confirmado que uma apresentação com `.pp-page` (como a Institucional) continua se comportando exatamente igual, sem regressão. Recompilado o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra gerar de novo o PowerPoint de "Gestão Financeira" e confirmar que agora vem com vários slides (um por seção), não mais um só.

### 09/09/2026 — v391
**Correção: os títulos das apresentações saíam com uma caixa branca/dourada cobrindo o texto no PowerPoint gerado pela v390** ("Gerar PowerPoint" novo, entregue horas antes). Reportado com vídeo mostrando o arquivo `.pptx` real aberto: o título de capa ("O caminho certo para sua liberdade financeira.") e o título da página "O Diagnóstico do Mercado" apareciam com um retângulo claro/dourado sólido atrás do texto, em vez do efeito de gradiente sutil que aparece normalmente na tela e no PDF.

Causa: esses títulos usam um efeito de "texto em degradê" (a cor do texto vem de um `background: linear-gradient(...)` que só aparece **dentro do formato das letras**, truque de CSS via `background-clip: text` + texto transparente). O navegador sempre soube renderizar isso certinho — é assim que aparece na tela e é exatamente isso que o botão de PDF captura, porque ele imprime a página real. O problema é específico do botão novo de PowerPoint: a biblioteca que tira a "foto" de cada seção pra virar slide (`html2canvas`) não sabe recortar um fundo pelo formato do texto — ela pinta o degradê inteiro, sólido, num retângulo, sem excluir o espaço fora das letras. Como esse efeito é usado em vários títulos das três apresentações (Institucional, Gestão de Patrimônio, Gestão Financeira) e das Propostas, o problema tendia a aparecer em qualquer slide com título "chamativo".

Correção: só na captura usada pra montar o PowerPoint (a tela normal e o PDF continuam exatamente iguais, sem nenhuma mudança), esses títulos agora trocam automaticamente para uma cor sólida (a primeira cor do degradê original — ex.: branco no título de capa, dourado no "financeira." em destaque) no exato instante da captura, sem o recorte problemático. Perde-se o efeito de gradiente sutil só na versão PowerPoint (fica uma cor sólida, não duas se misturando), mas o texto passa a sair limpo e legível — sem a caixa clara por cima.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Testado à parte com um DOM real (jsdom) simulando exatamente esse padrão de estilo (incluindo a conversão de `#fff`/`#F5C94B` que o navegador faz pra `rgb(...)` internamente) — confirmado que a função nova identifica corretamente todo elemento com esse efeito e substitui pela cor certa, sem alterar nada fora desses elementos específicos. Peço pra gerar de novo o PowerPoint da Apresentação Institucional (mesmo teste do vídeo) e confirmar visualmente que os títulos saem legíveis agora.

### 09/09/2026 — v390
**Nova funcionalidade pedida: opção de gerar as apresentações comerciais e propostas em PowerPoint (.pptx), além do PDF que já existia.** Pedido feito com print da aba Comercial → Apresentação (mobile), que hoje só tem o botão "🖨 Imprimir / Salvar PDF".

O que mudou: as duas telas que já geram apresentação/proposta em PDF — **Apresentação Comercial** (Institucional, Gestão de Patrimônio, Gestão Financeira) e **Propostas Comerciais** (a proposta individual gerada por cliente) — ganharam um segundo botão, **"📊 Gerar PowerPoint"**, ao lado do botão de PDF já existente.

Como funciona por baixo dos panos: cada apresentação já era montada em "páginas" (`.pp-page`, o mesmo bloco que o botão de PDF usa pra imprimir) — o botão novo captura cada uma dessas páginas como imagem (`html2canvas`, biblioteca que o Hub já carregava pra gerar o PDF do relatório mensal) e monta um arquivo `.pptx` de verdade, um slide por página, usando a biblioteca `PptxGenJS` (nova, carregada via CDN só nessa função). Optei por capturar como imagem em vez de recriar cada apresentação em formas nativas do PowerPoint porque o visual de cada slide (gradientes, padrões decorativos, disposição) só existe de verdade em HTML/CSS — a imagem garante fidelidade 100% igual à tela; o efeito colateral é que o conteúdo do slide não é editável no PowerPoint (só a imagem pode ser redimensionada/movida — pra editar texto, a edição continua sendo feita no Hub e regerando o arquivo).

Detalhe técnico que valia registrar: como cada seção tem largura fixa mas altura variável (um slide de capa não tem a mesma proporção de um slide de tabela de preços), o tamanho do slide do PowerPoint é calculado automaticamente a partir da mediana das proporções capturadas — cada imagem entra centralizada dentro desse tamanho, nunca cortada; se alguma seção fugir muito da proporção das demais, a margem que sobra é preenchida com a cor do canto daquela própria imagem (evita barra branca destoando do fundo escuro da maioria dos slides).

Testado em Node.js simulando o html2canvas e o PptxGenJS (proporções bem diferentes entre "slides" — capa alta, conteúdo normal, conteúdo baixo, tabela bem alta) — confirmado que cada imagem entra inteira, centralizada, sem corte nem distorção, e todos os casos de erro (biblioteca não carregada, apresentação não encontrada, captura de alguma página falhando) mostram aviso e não travam a tela. Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Como a geração real do `.pptx` depende de canvas num navegador de verdade (não reproduzível neste ambiente), peço pra conferir: abrir Comercial → Apresentação, clicar em "Gerar PowerPoint" em cada uma das 3 abas (Institucional/GP/GF) e nas Propostas Comerciais → abrir uma proposta existente → "Gerar PowerPoint", confirmar que o arquivo baixa e abre normalmente no PowerPoint/Google Slides com os slides na ordem certa.

### 09/09/2026 — v389
**Refatoração: a lógica de "Análise Financeira Inteligente" virou uma função pura reaproveitável, primeiro passo pra uma nova frente de receita — um produto público autoatendido, o "Diagnóstico de Orçamento Familiar".** Contexto completo do produto novo em `claude/diagnostico-orcamento-autoatendido.md` (parte da mesma estratégia de `parceiros-automacao.md` e `consultoria-digital-automatizada.md`: sair da dependência total do boca a boca e criar fontes de receita que rodam sem depender do seu tempo direto).

O que mudou no Hub: `gerarAnaliseFinanceira` (a função que gera os pontos fortes/alertas/recomendações da aba Financeiro → Análise, hoje presa dentro da ficha do cliente e só funcionando com dados já importados) virou `calcularAnaliseFinanceira(histMensal, receitasAtual, despesasAtual, fmtFn)` — uma função pura, sem depender de nenhum estado de componente, definida perto de `MACRO_CATS`. O uso de dentro da ficha do cliente virou um wrapper de uma linha que só repassa `c.histMensal`, `receitas`, `despesas` e `fmF` — comportamento idêntico pra quem já é cliente, incluindo o suporte a moeda estrangeira que só a ficha do cliente usa.

Por que isso importa: essa função já lidava bem com "só o mês atual, sem histórico nenhum" (o fallback que existia pra quando um cliente importa pela primeira vez) — ou seja, ela já era, sem ninguém ter percebido, o motor perfeito pra um formulário público de "responda uma vez e receba seu diagnóstico na hora", sem precisar de nenhuma inteligência nova.

Entregue junto: `diagnostico.html` (arquivo novo, mesmo padrão do `indicar.html` — hospedar junto do Hub), com um formulário de renda + despesas por 10 categorias simplificadas, que gera o diagnóstico completo (saldo do mês, taxa de poupança, pontos fortes, alertas, recomendações) na hora, direto no navegador do visitante, sem passar por nenhum servidor — e grava o lead numa coleção nova do Firestore (`diagnosticos_publicos`, regra de segurança em `diagnostico-orcamento-autoatendido.md`) pra você acompanhar quem usou. Por decisão de vocês, o v1 é gratuito (sem Vindi ainda) — a arquitetura de cobrança automática (Vindi + webhook + Cloud Function) já está desenhada no documento, pronta pra plugar quando decidirem ativar o preço.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Testado em Node.js dois cenários lado a lado: (1) sem histórico algum (o caso do produto público) e (2) com 2 meses de histórico simulando o uso real de um cliente — os dois bateram com o comportamento esperado, confirmando que a extração não mudou nada pra quem já usa o sistema. Durante esse teste, encontrei (mas não corrigi agora, por ser um comportamento pré-existente e fora do escopo pedido) um bug já registrado em `roadmap.md`: a recomendação de "iniciar aportes" aparece mesmo pra quem já investe, porque o código checa uma chave que nunca existe no objeto usado. Peço pra conferir a aba Financeiro → Análise de um cliente real depois desse deploy, só pra confirmar visualmente que nada mudou lá, e testar o `diagnostico.html` com números de teste depois de publicar a regra do Firestore.

### 04/09/2026 — v388
**Correção: link de indicação de parceiro (`?ref=CODIGO`) saía com URL errada — apontava pra raiz do domínio (`courinvest67-eng.github.io/indicar.html?ref=...`, que dá 404) em vez do endereço real do Hub (`courinvest67-eng.github.io/courinvest-hub/indicar.html?ref=...`).** Pego no primeiro teste de ponta a ponta da Fase 1 do programa de indicação (v387): parceiro "plut" aprovado com sucesso, mas ao clicar em "Copiar link de indicação" e abrir o link copiado numa aba anônima, deu 404 do GitHub Pages.

Causa: o botão montava o link usando só `window.location.origin` (que dá só protocolo+domínio, ex. `https://courinvest67-eng.github.io`) e colava `/indicar.html` direto nisso — sem contar que o Hub está publicado numa subpasta do domínio (`/courinvest-hub/`), não na raiz. Como o domínio é do tipo `usuario.github.io` (GitHub Pages de projeto, não de organização), toda página do site vive dentro dessa subpasta — e o código nunca levava isso em conta.

Correção: o link agora é montado a partir do caminho da própria página em que o Hub está rodando no momento (`window.location.pathname`), removendo só o nome do arquivo final (ex. `index.html`) e mantendo a pasta — então o link fica sempre correto não importa em qual subpasta o Hub estiver hospedado, sem precisar hard-codar "courinvest-hub" em lugar nenhum do código (se um dia o endereço do site mudar de novo, o link se ajusta sozinho).

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra conferir: no card do parceiro "plut" (ou qualquer outro), clicar em "Copiar link de indicação" de novo, colar numa aba anônima e confirmar que agora abre a página `indicar.html` normalmente (em vez do 404) — esse é o mesmo teste que pegou o bug, só que agora deve completar até o formulário de lead aparecer.

### 04/09/2026 — v387
**Fase 1 do programa de indicação automatizado: aba Parceiros ganhou captura automática de parceiros e leads, sem precisar digitar nada na mão.** Pedido pra transformar o programa de parceiros (hoje 100% manual) numa fonte de receita que roda sozinha — plano completo em `claude/parceiros-automacao.md` (salvo no projeto).

O que foi entregue:
1. **Página pública nova** (`indicar.html`, entregue como arquivo separado pra você hospedar junto do Hub, no mesmo domínio — ela precisa gravar direto no Firestore do projeto, então não podia ser um link do Claude) com dois formulários: "quero ser cliente" (lead, aceita `?ref=CODIGO` do parceiro que indicou) e "quero ser parceiro" (auto-cadastro). Os dois gravam sozinhos, 24h por dia, nas coleções novas `leads_publicos` e `parceiros_pendentes` do Firestore.
2. **Cada parceiro cadastrado no Hub agora tem um código e um link de indicação próprios** (`courinvest-hub-fonte.html`, aba Parceiros → botão "🔗 Copiar link de indicação" em cada card; parceiros criados antes dessa versão ganham um botão "Gerar link de indicação" pra criar o código deles também, sem precisar recriar o cadastro).
3. **Nova sub-aba "📥 Pendentes"** dentro de Parceiros, que lê as duas coleções novas do Firestore e mostra, com contador no próprio nome da aba, tudo que chegou sozinho pela página pública — com botão de aprovar (1 clique cria o parceiro/indicação de verdade, já pré-preenchido) ou descartar em cada item.

Por que a aprovação continua sendo um clique humano, e não 100% automática: `programa-parceiros.md` já registra o alerta de que a CVM regula quem pode ser remunerado por indicar clientes de investimento — automatizar só a *captura* (que é trabalho braçal, sem julgamento envolvido) e manter a decisão de "esse vira parceiro remunerado" com você é o ponto de equilíbrio certo aqui.

O que ainda falta pra essa fase funcionar de ponta a ponta (fora do meu alcance, depende de você): (a) colar a regra de segurança do Firestore que libera só a criação (nunca leitura) nas duas coleções novas — texto exato em `parceiros-automacao.md` — e (b) hospedar o arquivo `indicar.html` no mesmo domínio onde o Hub já está publicado.

Próximas fases já desenhadas em `parceiros-automacao.md`, não incluídas nesta entrega: vínculo automático entre indicação convertida e a receita real do cliente (cálculo de comissão sem recálculo manual), portal do parceiro por link próprio com extrato mensal automático por e-mail, e pagamento automatizado (depende de decisão de qual gateway/API bancária usar).

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Testado isoladamente em Node.js a lógica nova de geração/consulta de código de parceiro (acentos, espaços, colisão de código). Como não há navegador nem Firestore real disponível neste ambiente, peço pra conferir depois de colar a regra de segurança e publicar o `indicar.html`: (1) enviar um cadastro de teste em cada formulário da página pública, (2) ver se aparecem na aba "📥 Pendentes", (3) aprovar os dois e confirmar que viram parceiro/indicação normal, (4) copiar o link de um parceiro existente e confirmar que o `?ref=` dele aparece certo na página pública.

### 04/09/2026 — v386
**Correção: card de cliente e o painel "Evolução de Receita" (módulo Financeiro → Por Cliente) mostrando o dígito "1" no lugar do nome do cliente, agrupando o mês inteiro (todos os pagamentos) dentro dessa única entrada mal rotulada.** Reportado com print mostrando uma entrada "1" concentrando 30 pagamentos e R$ 17.010,68 — o total e a quantidade de um mês inteiro (dezembro/2023), não de um cliente só.

Causa raiz, na função de importação da "Planilha de Entradas" (aba Importar): a detecção de qual coluna da planilha é a do nome do cliente (`colCliente`) tentava primeiro um match exato pela palavra "cliente" no singular (`k.trim().toLowerCase()==="cliente"`) — mas o cabeçalho real da planilha usa o plural, "Clientes" (`"clientes"!=="cliente"`, então esse match nunca batia). Caía então num match por substring (`indexOf("cliente")>=0`), que pega a **primeira** coluna da planilha cujo cabeçalho contenha o texto "cliente" — e a planilha tem duas colunas nessa condição: "Nº Clientes" (coluna B, contador que vale sempre "1" em toda linha) e "Clientes" (coluna E, o nome de verdade). Como "Nº Clientes" vem antes de "Clientes" na planilha, o substring match pegava ela primeiro, e toda linha importada guardava o cliente como o texto "1" (o valor da coluna B) em vez do nome real (coluna E) — por isso todos os 30 lançamentos de dezembro/2023 foram agrupados sob o "cliente" fictício "1".

Correção aplicada na função de parse: agora primeiro tenta achar a coluna cujo cabeçalho é exatamente "cliente" OU "clientes" (cobrindo singular e plural); se não achar, cai num match por substring que **exclui** explicitamente cabeçalhos que pareçam ser coluna de contagem ("nº", "n°", "num", "qtd"), então "Nº Clientes" nunca mais é escolhida por engano. Testado isoladamente em Node.js simulando o cabeçalho real da planilha (`Data, Nº Clientes, Serviço, Meio de Recebimento, Clientes, Valor, NF, % Fat.`) — a coluna resolvida agora é "Clientes" (nome real), não mais "Nº Clientes".

**Importante — dados já importados antes dessa correção não se corrigem sozinhos:** essa mudança só afeta importações novas a partir de agora. Os 30 lançamentos de dezembro/2023 que já estão salvos com o cliente "1" continuam assim até serem reimportados. Pra corrigir esse mês específico: na aba Importar → card "Planilha de Entradas", usar o seletor de ano + "🗑 Excluir ano" pra remover só os lançamentos de 2023 problemáticos (ou identificar e remover manualmente só os de dezembro, se preferir manter o resto de 2023 que já esteja correto) e reimportar o arquivo `NF_12_Dez_23.xlsx` — a nova versão vai gravar o nome do cliente certo em cada linha. Vale conferir se outros meses/anos importados têm o mesmo problema (qualquer entrada aparecendo como "1" na aba Por Cliente ou nas Entradas é sinal do mesmo bug).

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra conferir: reimportar a planilha de dezembro/2023 (depois de excluir os lançamentos antigos daquele mês) e ver se os nomes de cliente aparecem certos na aba Entradas e no painel "Evolução de Receita" — e verificar rapidamente os outros meses/anos já importados, caso algum outro tenha caído na mesma armadilha do cabeçalho "Nº Clientes".

### 03/09/2026 — v385
**No cadastro de parceiro, o "Bônus único na conversão" agora pode ser em % em vez de só valor fixo em R$.** Pedido depois de cadastrar um parceiro (contabilidade) no modelo híbrido — fazia sentido o bônus de entrada ser um percentual da mensalidade do cliente indicado (ex: "1,5 meses de taxa"), não só um valor fixo em reais que não escala com o tamanho do cliente.

Adicionado um seletor "R$ valor fixo" / "% da taxa mensal" logo acima do campo de bônus. Quando "% da taxa mensal" está selecionado, o valor digitado (ex: 150) é interpretado como um percentual sobre a taxa/receita mensal informada em cada indicação convertida — 150% equivale a 1,5 meses de taxa daquele cliente específico, então o bônus escala automaticamente com o porte de cada cliente indicado, em vez de ser sempre o mesmo valor fixo.

Parceiros já cadastrados antes dessa mudança continuam com bônus em valor fixo (R$), sem precisar reconfigurar nada — o sistema trata a ausência desse novo campo como "fixo", que era o único formato que existia até aqui.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra conferir: editar o parceiro "InUP Contabilidade" (ou outro no modelo híbrido/único), trocar o bônus pra "% da taxa mensal", informar um percentual, e ver se o Resumo de Comissões calcula certo a partir da taxa mensal de cada indicação convertida dele.

### 03/09/2026 — v384
**Aba "Parceiros" agora cobre os dois sentidos: parceiros que a Courinvest paga (indicam clientes pra gente) e parceiros que pagam a Courinvest (a gente indica clientes/leads pra eles — ex: contador, seguradora, outra empresa parceira).** Na v383 a aba só cobria o primeiro caso.

Cada parceiro agora tem um campo "Sentido da comissão" (💸 Pagamos a ele / 💰 Recebemos dele), escolhido no cadastro. Isso muda:
- A listagem de parceiros passa a ter duas seções separadas ("Parceiros que pagamos" e "Parceiros que nos pagam"), cada parceiro com um selo indicando o sentido.
- Os textos dos campos se adaptam automaticamente — ex: "% recorrente sobre a taxa mensal do cliente" (quando pagamos) vira "% recorrente sobre o que o parceiro fatura com o cliente indicado" (quando recebemos), e o campo de valor mensal na indicação também troca de rótulo.
- A tabela de Indicações ganhou uma coluna "Sentido".
- O Resumo de Comissões agora mostra dois blocos separados — "Comissões que pagamos" e "Comissões que recebemos" — cada um com seus próprios totais, em vez de misturar tudo numa lista só.
- Os KPIs do topo da aba viraram "💸 A pagar/mês", "💰 A receber/mês", "Bônus a pagar" e "Bônus a receber", em vez de um total único ambíguo.

Parceiros cadastrados na v383 (antes desse campo existir) continuam funcionando normalmente — como não tinham o campo "sentido", o sistema trata todos eles como "pagamos" (que era o único sentido que existia até então), então nada muda pra quem já tinha cadastrado parceiro.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra conferir a aba: cadastrar um parceiro no sentido "recebemos" (por exemplo um contador pra quem vocês indicam clientes) e ver se ele aparece na seção certa, com os textos e o resumo calculando do jeito esperado.

### 03/09/2026 — v383
**Nova funcionalidade: aba "Parceiros" no menu lateral, primeira versão de um programa de indicação/comissão.** Pedido pra começar a construir uma frente de renda recorrente vinda de parcerias — parceiros que indicam leads/clientes pra Courinvest.

O que foi entregue:
1. **Aba própria no menu lateral** (🤝 Parceiros), no mesmo nível de Clientes/Financeiro/Agenda — não é uma sub-aba dentro de outro módulo.
2. **Cadastro de parceiros**: nome, contato, e um modelo de comissão configurável por parceiro (recorrente sobre a taxa / bônus único na conversão / híbrido), com percentual e/ou valor de bônus próprios. A decisão de qual modelo usar fica no cadastro de cada parceiro, não travada no código — dá pra testar modelos diferentes com parceiros diferentes ao mesmo tempo.
3. **Registro manual de indicações**: nome do lead indicado, data, status (aberta / em negociação / convertida / perdida), nome do cliente (quando converte) e a taxa mensal dele (usada só pra estimar a comissão recorrente — não está automaticamente ligada ao cadastro real de Clientes/Financeiro nessa primeira versão, como combinamos).
4. **Resumo de comissões**: por parceiro, mostra quantas indicações estão abertas/convertidas/perdidas, a comissão recorrente mensal estimada (soma das indicações convertidas ativas) e o total de bônus únicos pendentes de pagamento — com checkboxes pra marcar quando uma comissão recorrente deixou de valer (cliente saiu) ou um bônus já foi pago.
5. Um documento separado (`programa-parceiros.md`, também salvo no projeto) com 3 propostas de modelo de comissão discutidas — recorrente, bônus único e híbrido — cada uma com % sugerido, exemplo em R$, prós/contras, e um alerta sobre o ponto de atenção regulatória da CVM em relação a quem pode ser remunerado por indicação de clientes de investimento (vale confirmar com o compliance antes de formalizar o programa).

Do lado técnico: os dados de parceiros/indicações agora fazem parte do estado global sincronizado com o Firestore (mesmo mecanismo que já protege Entradas/Despesas/Agenda contra perda de dados entre dispositivos), então cadastros feitos no computador aparecem no celular e vice-versa.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Como não há navegador/Firestore disponível neste ambiente, peço pra conferir a aba nova: cadastrar um parceiro de teste, lançar uma indicação, marcar como convertida e ver se o resumo de comissão calcula certo — e confirmar também que os dados persistem depois de recarregar a página (sinal de que a sincronização com o Firestore está funcionando).

### 03/09/2026 — v382
**Nova funcionalidade pedida: excluir entradas/despesas por ano, sem precisar limpar tudo.** Na aba "Importar" do módulo Financeiro, os cards de Planilha de Entradas e Planilha de Despesas só tinham o botão "Limpar entradas"/"Limpar despesas", que apaga TUDO de uma vez — inconveniente quando o objetivo é só reimportar/corrigir um ano específico.

Adicionado, em cada um dos dois cards, um seletor com os anos presentes nos lançamentos importados (calculado a partir da data de cada entrada/despesa, então só aparecem anos que realmente têm dado) mais um botão "🗑 Excluir ano" ao lado — que apaga só os lançamentos daquele ano (com confirmação mostrando quantos registros serão removidos), mantendo os demais anos intactos. O botão antigo continua existindo, renomeado pra "Limpar todas as entradas/despesas" pra deixar claro que ele apaga tudo.

A exclusão usa a mesma função de salvar já existente (`sEntradas`/`sDespesas`), que já lida corretamente com a sincronização no Firestore (substituição atômica da lista, sem risco de race condition) — nenhuma lógica nova de persistência foi criada, só o filtro por ano antes de salvar.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Peço pra conferir na aba Importar se os anos aparecem certos nos dois seletores (entradas e despesas) e se excluir um ano específico realmente só remove os lançamentos daquele ano, mantendo o resto.

### 03/09/2026 — v381
**Gráfico "Receita por Mês" (módulo de Métricas/Receita) com os valores em R$ de cada barra ilegíveis, colando um em cima do outro**, quando o filtro está em "todos os anos" (o gráfico chega a ter uns 48 meses lado a lado). Print mostrou os números em R$ e as pílulas de variação % espremidos, sobrepostos, impossíveis de ler.

Causa: o valor em R$ e a pílula de variação percentual de cada barra sempre foram escritos na horizontal, com largura proporcional ao tamanho do texto (ex: "R$ 62.946,21" é bem mais largo que a barra fina que fica embaixo dele quando há dezenas de barras espremidas lado a lado num mesmo espaço). Com poucos meses no gráfico (visão de um ano, ~12 barras) tem espaço de sobra e nunca foi problema; o bug só aparece quando o filtro de período mostra muitos meses de uma vez.

Correção: quando o gráfico tem mais de 12 barras (e não é a visão mobile compacta, que já tinha sua própria lógica), dois ajustes automáticos entram em ação:
1. O valor em R$ passa a ser escrito na **vertical** (texto girado 90°) em vez de na horizontal — nesse formato ele ocupa só a largura de um caractere, então não invade mais o espaço da barra vizinha, não importa quantas barras tenham no gráfico.
2. A pílula de variação % (▲/▼ x,x%) só aparece na barra que está selecionada (clicada) — igual já funcionava na visão mobile — em vez de aparecer em todas as barras ao mesmo tempo, que é o que mais pesava na poluição visual.
3. A altura máxima das barras foi reduzida um pouco (de 175px pra 120px) e a altura total do gráfico aumentada (de 220px pra 260px) só nesse modo, pra sobrar espaço suficiente em cima de cada barra pra caber o texto vertical sem cortar.

Ao clicar numa barra específica ela volta a mostrar o valor na horizontal (mais fácil de ler) e a pílula de variação, já que nesse caso só uma barra de cada vez fica "expandida" e não há mais risco de sobreposição. Visões com 12 meses ou menos (ano específico selecionado) continuam exatamente como antes — esse ajuste só entra em ação quando o gráfico realmente fica lotado.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Como não há navegador disponível neste ambiente pra renderizar o gráfico de verdade, peço pra conferir visualmente com o filtro em "todos" (ou qualquer período com mais de 12 meses) se os valores agora ficam legíveis na vertical, e se ao clicar numa barra ela volta a mostrar tudo na horizontal normalmente.

### 02/09/2026 — v380
**Duas correções no relatório mensal do cliente Arthur Werneck, reportadas em sequência sobre o mesmo PDF: (1) câmbio errado na página "Rentabilidade por Moeda" e (2) valor da taxa sumindo na página "Taxa de Administração".**

**1) Câmbio do dólar travado em R$ 5,50 (rotulado "fechamento do mês"), quando o fechamento real de agosto foi R$ 5,18.**

Causa raiz: o fluxo que gera o relatório automaticamente — usado tanto pelo botão "PDF GP" (abre o relatório numa aba nova pra imprimir) quanto pela geração headless usada no envio por e-mail — nunca buscava a cotação real de fechamento do mês nem o retorno real por ativo em USD antes de montar o relatório. Ele simplesmente chamava a geração direto, e o valor de câmbio caía por padrão numa taxa "ao vivo" genérica (`usdRateGlobal`), que numa instância recém-criada (como é o caso do processo headless de e-mail) ainda pode não ter terminado de carregar — e nesse caso cai no valor fixo de segurança, R$ 5,50. O pior é que a lógica que rotula esse número na tela não sabe de qual das 4 fontes possíveis ele veio — só verifica se o número "parece" uma cotação válida (entre 3 e 10) — e por isso rotulava R$ 5,50 como "fechamento do mês" mesmo sendo, na prática, um valor de contingência.

Só o botão manual "Buscar câmbio do mês" (dentro do app, com o usuário presente) buscava a cotação real de verdade, via API — por isso o problema só aparecia nos relatórios gerados automaticamente (impressão em lote / e-mail), nunca quando alguém clicava manualmente antes de gerar.

Correção: extraída a busca de câmbio real (API AwesomeAPI, cotação de fechamento USD/BRL do dia exato ou, se cair em fim de semana/feriado, tenta até 6 dias antes) pra uma função própria e reaproveitável (`buscarCambioFechamentoMes`), que nunca falha — se a API não responder, cai de volta na cotação ao vivo como antes, sem travar a geração do relatório. Essa função agora é chamada automaticamente (junto com a busca do retorno real por ativo em USD) antes de montar o relatório mensal em qualquer fluxo automático — tanto no "PDF GP" quanto no e-mail — exatamente como o botão manual já fazia. O botão manual foi reaproveitado pra usar essa mesma função (antes tinha sua própria cópia da lógica, agora as duas garantidamente batem).

**2) Box "Valor a transferir" (PIX da taxa de administração) saindo completamente em branco no PDF — sem rótulo, sem valor — mesmo o mesmo valor aparecendo certinho em outros dois lugares da mesma página (card de KPI e Memória de Cálculo).**

Como não há navegador disponível neste ambiente pra reproduzir a geração do PDF, a investigação foi por eliminação: como o mesmo número (`_taxa2`) renderiza certo nos outros dois pontos da página, o problema não é de cálculo/dado — é específico de como essa caixa em particular é desenhada. Ela era o único dos três boxes de valor daquela página com `display:inline-block` (os outros usam blocos normais) — um padrão de caixa cujo tamanho é definido pelo próprio conteúdo, que é uma causa conhecida de medição errada (às vezes largura zero) pela biblioteca que tira o "print" de cada página do relatório (html2canvas) nesse tipo de captura.

Correção aplicada: trocado `display:inline-block` por `display:table` nessa caixa especificamente — mantém o mesmo comportamento visual (caixa do tamanho do conteúdo, sem esticar a largura toda), mas com um modelo de caixa que a biblioteca de captura mede de forma mais confiável. É uma correção direcionada a partir da causa mais provável (não uma reprodução ao vivo do bug), então pode precisar de confirmação visual num relatório novo.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Nenhuma das duas correções é verificável ao vivo neste ambiente (dependem de Firebase Storage, APIs externas e canvas num navegador real) — peço pra reenviar/gerar de novo o relatório do Arthur Werneck (ou outro cliente com taxa de administração via PIX e posições em USD) pra confirmar visualmente: (a) o câmbio na página "Rentabilidade por Moeda" batendo com o fechamento real do mês, e (b) o valor aparecendo normalmente na caixa "Valor a transferir".

### 02/09/2026 — v379
**Correção do botão "Baixar Relatório Completo em PDF" sumindo do e-mail** (aparecia só o texto "Entre em contato para receber o relatório completo em PDF."), reportado em vários clientes seguidos. Confirmado com print do console do navegador: `[PDF] Timeout de 75s atingido — seguindo sem o link do PDF.` — não era um bug de lógica quebrando nada, era o processo de gerar o PDF (que roda página por página, uma captura de tela por página do relatório, desde uma correção anterior) demorando mais que o limite de segurança de 75 segundos. Esse mesmo limite já tinha sido aumentado uma vez antes (de 45s pra 75s) por causa exatamente desse sintoma — carteiras vão crescendo (mais ativos, mais páginas de Composição Detalhada) e o teto antigo foi ficando apertado de novo.

Duas mudanças, uma complementando a outra:
1. **Timeouts aumentados** — o limite de geração do PDF completo subiu de 75s pra 130s, e o limite de montar o relatório headless (que faz chamadas reais a cotações de ativos no exterior antes de gerar o HTML) subiu de 60s pra 90s. Isso sozinho já deveria resolver o sintoma reportado.
2. **Redução real do tempo de geração**, pra não precisar ficar só empurrando esse teto pra frente a cada vez que voltar a acontecer: a resolução da captura de tela de cada página (`html2canvas scale`) caiu de 2x pra 1,5x — ~44% menos pixels pra desenhar, codificar em JPEG e subir pro Storage em cada página, mantendo qualidade boa o bastante pra leitura em tela/impressão (só deixa de ser nível "retina"). Todo o resto do algoritmo de fatiamento de página (que já foi corrigido/testado em versões anteriores) usa as dimensões reais do canvas capturado, não um "2" fixo, então se ajusta sozinho a essa mudança sem precisar tocar em mais nada.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Não dá pra medir o tempo real de geração aqui (depende de Firebase Storage, canvas e da carteira real de cada cliente, só reproduzível num navegador de verdade) — peço pra reenviar o relatório de um dos clientes que apareceu sem o botão e conferir se o link volta a aparecer; se o console mostrar de novo algum aviso `[PDF]`/`[Relatório]`, me manda que a gente aprofunda.

### 02/09/2026 — v378
**Correção do PDF do relatório mensal saindo com o "Resumo Executivo" cortado ao meio, entre duas páginas.** Cliente mandou o PDF real de um cliente (Marcus Goyata): a página 3 trazia a seção "Resumo do Mercado Financeiro" inteira e, colado embaixo, só o título e o parágrafo de abertura do "Resumo Executivo" — os 3 cards de KPI (Patrimônio/Rentabilidade/Ganho/vs IPCA), o box "Olá Marcus..." e a citação de análise ficavam jogados pra página seguinte, que sobrava com bastante espaço em branco depois disso.

Causa: diferente da maioria das seções do relatório (que sempre começam numa página nova), "Resumo do Mercado Financeiro" e "Resumo Executivo" foram desenhadas pra ficarem juntas na mesma página quando cabem — só que "Resumo do Mercado Financeiro" não tem tamanho fixo (o texto do overview de mercado muda de tamanho mês a mês) e nesse mês específico as duas juntas passaram da altura de uma página A4. O algoritmo de corte de página alta (que decide onde quebrar quando o conteúdo não cabe) cortou bem no meio do bloco do Resumo Executivo, em vez de manter esse bloco inteiro numa página só.

Correção: "Resumo Executivo" agora sempre começa no topo de uma página nova, nunca mais dividindo espaço com "Resumo do Mercado Financeiro" — cada uma vira sua própria página, cheia ou não. As duas seções cabem folgadas cada uma na sua própria página A4, então esse bloco específico não deve mais precisar do corte automático.

De quebra, corrigido um bug relacionado encontrado durante a investigação: o Sumário (índice) do relatório usava uma variável errada pra checar se havia "Resumo do Mercado Financeiro" pra listar (`d` em vez de `_d`, que é a que realmente tem os dados carregados) — por isso essa seção, mesmo aparecendo normalmente no corpo do PDF, nunca aparecia listada no índice, e a numeração de página estimada de "Resumo Executivo" em diante ficava sistematicamente errada no Sumário. Corrigido pra usar a mesma fonte de dados (com a mesma cadeia de prioridade: mês atual → mês anterior → mês mais recente disponível) que o corpo do relatório já usa.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Como das outras vezes, não dá pra gerar o PDF completo aqui (depende de Firebase Storage e canvas num navegador real) — peço pra gerar um novo relatório de teste do Marcus (ou de qualquer cliente com Resumo do Mercado Financeiro publicado) antes do próximo envio real, pra confirmar visualmente que as duas seções saem cada uma na sua própria página, sem corte no meio.

### 02/09/2026 — v377
**Correção do bug de sinal trocado na "Rentabilidade por Moeda" (USD), confirmando a observação já registrada (mas não corrigida) no changelog da v376.** Cliente Bruno Carvalho: o relatório mostrava -6,00% (-US$ 995,21) / -4,03% (-R$ 3.393,32) pra "Investimentos EUA", enquanto a própria tela de Carteira (dado bruto do Gorila) mostrava +3,45% e **P&L positivo de +R$ 2.700,02** pra essa mesma classe — sinais opostos, mesmo patrimônio atual (R$ 80.838,85 batendo nos dois lugares).

Causa raiz confirmada: a conta de rentabilidade USD/BRL (quando cai na 4ª prioridade, "extrato importado (estimado)" — usada quando não há cotação real por ativo nem extrato Vest) soma o ganho em R$ de cada ativo (`getRentAtivoPer`) mas **exigia que o ativo ainda tivesse posição atual (`a.vA>0`)** pra entrar na conta. Um ativo **totalmente vendido dentro do próprio mês** (posição zerada no fim do período, ex: "AVB" na planilha do Gorila do cliente) tem `a.vA=0` — e por isso seu ganho realizado no período ficava **inteiramente fora da soma**, mesmo aparecendo na planilha com +430% e +R$ 6.393,52 de resultado. Conferi direto na planilha do Gorila usada pra reproduzir o caso: a soma de "Rentabilidade (R$) Período" de TODOS os ativos de "Investimento No Exterior" (incluindo o AVB zerado) dá exatamente **R$ 2.700,02 — o mesmo P&L que a tela de Carteira mostra**. Sem o AVB, a soma vira -R$ 3.693,50 (o número, com sinal trocado, que o relatório vinha usando). Ou seja: o relatório estava descartando silenciosamente o ganho de qualquer ativo liquidado no meio do mês, e nesse caso esse ganho descartado era grande o bastante pra virar o sinal da classe inteira.

Correção: quando o ativo está com posição zerada no fim do período (`a.vA=0`) mas tem um ganho/percentual do período válido vindo do Gorila, a posição inicial dele agora é reconstruída a partir do próprio percentual reportado (`posição inicial = ganho ÷ percentual`) em vez de simplesmente descartar o ativo da conta — pra ativos que continuam na carteira o cálculo não muda em nada (continua sendo fim − ganho, exatamente como antes). Aplicada nos dois cálculos que tinham esse mesmo filtro: a rentabilidade em USD (isolada do câmbio) e a rentabilidade em BRL (com câmbio) da seção "Investimentos EUA/Exterior".

Validação: recompilado o arquivo inteiro com o Babel Standalone da produção (7.26.4) — sem erro de sintaxe. Simulei a fórmula corrigida em Node.js com os números exatos da planilha do Gorila do cliente Bruno Carvalho — a soma de ganho R$ agora bate exatamente com o P&L de R$ 2.700,02 mostrado na Carteira (contra o valor errado/incompleto de antes), e o percentual, que antes saía negativo, agora sai positivo — resolvendo a inversão de sinal reportada. O percentual exato pode não bater 100% com o "Rent. TWR" da Carteira (esse é um cálculo mais sofisticado do Gorila, encadeado dia a dia — o nosso é uma estimativa a partir do fechamento mensal por ativo), mas o **sinal e a ordem de grandeza agora ficam corretos**, e o valor em R$ do ganho (que é um número exato, não uma estimativa) agora bate exatamente com o dado de origem.

Este item fecha a observação de metodologia registrada (mas propositalmente não corrigida) no changelog da v376.

### 01/09/2026 — v376
**Correção: valor em dólar da "Rentabilidade em USD" não batia com o percentual mostrado ao lado**, na seção "Rentabilidade por Moeda" do relatório mensal (GP). Reportado com print de um cliente mostrando "-6,00%" ao lado de "US$ 654,61" — inconsistente, já que -6% do patrimônio em USD do cliente correspondia a quase US$ 1.000, não a US$ 654.

Causa: o percentual em USD (`rentUSDpct`) já vem com o efeito cambial isolado/removido (é calculado especificamente pra mostrar "quanto os ativos renderam em dólar, sem contar a variação do câmbio"). Só que o valor em dólar mostrado ao lado (`rentUSDvalor`) vinha de uma conta diferente e inconsistente: pegava o ganho em REAIS ainda COM o efeito cambial misturado dentro e dividia por uma única taxa de câmbio — misturando dois conceitos diferentes (retorno já sem câmbio vs. ganho ainda com câmbio) que não deveriam ser combinados dessa forma.

Correção: o valor em dólar agora é sempre derivado diretamente do próprio percentual já decidido e do patrimônio atual em USD (`ganho = patrimônio_atual − patrimônio_atual/(1+percentual)`) — matematicamente, por construção, o valor em US$ mostrado NUNCA mais pode divergir do percentual ao lado dele, não importa qual das 4 fontes de dado (fechamento do mês por ativo / extrato Vest / Gorila direto / estimado a partir dos ativos) tenha originado o percentual. Testado com os números exatos do print reportado: -6,00% sobre US$ 15.594,82 de patrimônio agora mostra corretamente **-US$ 995,41** (antes mostrava, incorretamente, US$ 654,61).

Observação à parte, não corrigida agora por ser uma decisão de metodologia (não um bug de fórmula): ao conferir os dados brutos da planilha do cliente usada pra reproduzir esse caso, um ativo (AVB) aparece com posição zerada (totalmente vendido no período) mas ainda carregando um ganho grande no período — o relatório atual ignora esse ganho porque o ativo não está mais na carteira atual. Se isso for um ganho realizado de verdade dentro do mês, a rentabilidade "real" do período pode estar sendo subestimada; vale conferir com o Igor se ativos zerados/vendidos no meio do mês devem entrar no cálculo do período.

Validado recompilando o arquivo inteiro com o Babel Standalone da produção (7.26.4).

### 01/09/2026 — v375
**Correção de regressão introduzida na v374** — o cliente mandou um novo PDF de teste e piorou: em vez de espaço em branco sobrando, várias páginas saíram com o conteúdo cortado à direita (texto e gráficos truncados, cada vez mais estreitos conforme o relatório avançava).

Causa: a mudança da v374 passou a dar pra cada página do PDF o tamanho exato do conteúdo (`doc.addPage([largura,altura])`) em vez de sempre A4. Só que o jsPDF, com a orientação "retrato" ligada, **reordena sozinho** um tamanho customizado sempre que a largura passada é maior que a altura (exatamente o caso mais comum aqui — seção curta = página mais larga que alta) — ele simplesmente troca os dois valores pra "respeitar" o retrato, o que fazia a página sair estreita e alta em vez de larga e curta. Pior: depois de uma página nessas condições, qualquer página seguinte criada sem tamanho explícito (`doc.addPage()`, usado no trecho que divide seções muito longas em várias páginas) **herdava esse tamanho errado** em vez de voltar ao A4 padrão — por isso o efeito ia se espalhando/piorando conforme o relatório avançava.

Correção: toda chamada de `addPage` no gerador de PDF agora informa a orientação explícita ("paisagem" quando a página é mais larga que alta, "retrato" caso contrário) — isso impede o jsPDF de reordenar os valores — e nenhuma chamada mais fica sem tamanho definido, então não há mais como uma página herdar o tamanho errada da anterior.

Validação desta vez foi mais rigorosa que a da v374 (que só validou sintaxe): reproduzi o comportamento do jsPDF 2.5.1 real (mesma versão da produção) num teste isolado — confirmei o bug exato (array `[595,200]` virando `595→200`invertido) e testei a correção numa sequência de 8 páginas simulando o relatório inteiro (página curta, média, cheia, fatia de sobra, etc.), conferindo que cada página sai com a largura e altura exatas pretendidas, sem nenhuma contaminação entre páginas. Também revalidei a sintaxe do arquivo inteiro com o Babel Standalone da produção.

Como da vez passada, não tenho como gerar o PDF completo aqui (depende do Firebase Storage e de canvas/PDF num navegador real) — peço que gere um novo relatório de teste pra essa mesma cliente antes de confiar no próximo envio real.

### 01/09/2026 — v374
**Correção do PDF do relatório mensal (GP) saindo "desconfigurado"** — cliente reportou (com print do PDF + vídeo mostrando como devia ficar) páginas com enormes espaços em branco, seções com o título sozinho numa página quase vazia e o conteúdo real jogado pra página seguinte sem repetir o título, e até páginas totalmente em branco no meio do relatório. O relatório tinha 15 páginas físicas para um design de 11 — 4 páginas "fantasma" geradas pelo bug.

Causa raiz, na função que gera o PDF (`_gerarPdfLinkCourinvestInner`, usada ao enviar o relatório por e-mail):
1. Cada página de conteúdo (`.cv-page`) tem no CSS um `min-height:297mm` — pensado pra impressão pelo navegador, onde isso não importa. Só que o gerador de PDF captura cada página como uma imagem (`html2canvas`) desse DIV, e esse `min-height` forçava a imagem a sair sempre do tamanho de uma folha A4 inteira mesmo quando o conteúdo real era bem mais curto (ex.: a seção "Métricas Estratégicas" tem só 1 card) — daí a folha branca sobrando embaixo.
2. Quando uma seção não cabia numa página só (ex.: "Proventos & Renda Passiva", com KPIs + gráfico), o algoritmo que decide onde cortar tinha uma inversão: ao procurar um ponto de corte anterior pra evitar deixar um "resto" pequeno sozinho na página seguinte, ele pegava o ponto mais ANTIGO que ainda resolvia o problema (recuo máximo) em vez do mais RECENTE (recuo mínimo) — na prática, recuava até logo depois do título da seção, deixando exatamente esse "resto pequeno" no início em vez de no fim.

Correção aplicada:
- A altura mínima forçada (`min-height:297mm`) é removida só na cópia do HTML usada para gerar o PDF (a capa e o sumário — que devem mesmo ocupar a página inteira — não foram alteradas).
- Cada página do PDF agora nasce do tamanho real do conteúdo daquela seção, em vez de sempre criar uma folha A4 inteira.
- O ponto de corte de uma seção que não cabe numa página passou a recuar o mínimo necessário, preenchendo a página atual o máximo possível antes de virar a página — testado com um caso sintético reproduzindo a proporção de blocos da seção "Proventos": antes o corte aproveitava ~41% da página, depois passou a aproveitar ~96%.
- Validado recompilando o arquivo inteiro com a mesma versão do Babel Standalone da produção (7.26.4) antes da entrega.

Vale gerar um novo relatório de teste (o mesmo cliente do print, "Taynan Vidigal", é um bom caso de teste real) depois do deploy pra confirmar visualmente que ficou como no vídeo de referência.

### 01/09/2026 — v373
**Painel "Relatórios do mês" (aprovação e envio em lote):** adicionados os links **"desmarcar"** e **"reenviar"** ao lado do status "✅ enviado" de cada cliente.
- *Desmarcar* limpa o status de enviado (local e no Firestore, `particularidades.relatorios[mês].publicado`), sem apagar o histórico de que o relatório já saiu antes — o cliente volta para "✓ aprovado", pronto para reentrar no fluxo de envio.
- *Reenviar* dispara na hora um novo envio individual (e-mail prioritário, com WhatsApp como retaguarda para quem não tem e-mail cadastrado) para aquele cliente específico, sem precisar reenviar para todo mundo de novo.
- Por baixo dos panos, a lógica de envio (registro no Firebase, geração do PDF, disparo por e-mail/WhatsApp) foi extraída para uma função reutilizável (`enviarRelatorioParaCliente`), usada tanto no envio em lote quanto no reenvio individual — reduz duplicação e risco de os dois fluxos divergirem no futuro.
- Validado recompilando o arquivo inteiro com a mesma versão do Babel Standalone usada em produção (7.26.4) antes da entrega, para garantir que não há erro de sintaxe.

### 31/08/2026 — v372 (baseline)
Primeira versão registrada neste projeto — estabelecida como ponto de partida.
