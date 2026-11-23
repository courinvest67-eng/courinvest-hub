# Courinvest Hub v561

Versão do service worker: `561`. O cache do app passa a `courinvest-v561`.

## Painel do Cliente

Uma pessoa entra com a conta Google. Se o e-mail estiver liberado na ficha, ela vê só o próprio painel, no celular: patrimônio e alocação que já estão no Hub, o controle financeiro do mês e uma sugestão de quanto aportar. Não há menu de admin, lista de clientes, edição nem o financeiro da Courinvest.

O acesso é configurado na ficha, no card "Acesso do cliente": e-mail de acesso e um interruptor de ligar/desligar.

## Controle financeiro (Meuvista)

Na mesma ficha, a seção "Controle financeiro" importa, por mês, o extrato CSV e o orçamento CSV do Meuvista (ponto e vírgula, número em pt-BR).

- Linha com duplicate-action ou delete-action preenchido não entra.
- Lançamento Neutro não entra em receita nem despesa. Se a categoria for de investimento, o valor entra na sugestão como transferência que já saiu do caixa.
- As três linhas finais do extrato (Receitas, Despesas, Saldo final) são totais, não lançamentos.
- O que fica gravado no cliente é o resumo do mês: receitas e despesas estimado/realizado, saldo, categorias, data, fonte Meuvista, reserva mínima e contas previstas que o time digita. Descrição de lançamento não é gravada.

A reserva mínima e as contas previstas até o fim do mês são campos manuais.

## Objetivos

Na ficha, a seção Objetivos guarda as caixinhas do cliente: nome, valor-alvo, prazo (data, quantidade de meses ou sem prazo), ordem e ícone/cor. O admin vincula ativos da carteira já importada, com um percentual de cada um. A soma dos percentuais de um mesmo ativo não passa de 100%. O valor atual da caixinha é a soma do valor do ativo vezes o percentual.

Se o ativo some numa importação nova, o vínculo permanece pela chave (nome ou ticker) e a tela avisa "ativo não encontrado na última importação".

A reserva de emergência pode sugerir o alvo como N meses da média de despesas realizadas do Meuvista. O padrão de N é 6. O admin edita o valor depois.

Para cada objetivo com prazo, o aporte mensal sem rendimento é (alvo − atual) ÷ meses restantes. Se o admin informar uma taxa mensal estimada, aparece uma segunda conta, marcada como estimativa: o saldo atual rende essa taxa e os aportes também. A divisão do caixa do mês usa só a conta sem rendimento.

A sugestão "Quanto posso aportar" fica ao lado da soma do que os objetivos com prazo pedem no mês. A divisão segue a ordem de prioridade. Objetivo sem prazo não entra nessa soma. Não é garantia.

O painel do cliente ganha "Meus objetivos", só leitura. O documento `portalClientes/{e-mail}` passa a incluir esses agregados (nome, alvo, valor atual, progresso, nome e valor dos ativos vinculados). A regra de acesso não muda: a pessoa continua lendo só o próprio documento.

Na pré-visualização local (`?preview=553&ficha=controle`) a cliente de demonstração tem duas caixinhas fictícias: reserva ligada 100% a um CDB, com um ativo que não está na carteira, e viagem em 2 anos com 50% de um Tesouro.

## Quanto posso aportar

Sugestão = saldo realizado do mês − despesas do orçamento que ainda não foram lançadas − contas previstas − reserva mínima − transferências neutras para investimento. Abaixo de zero, mostra zero. Receita que ainda não caiu na conta não entra. Aportes já feitos no mês aparecem à parte (despesa de investimento, lançamento neutro ou aporte registrado na carteira do Hub). O texto na tela diz que não é garantia.

## Segurança

`workspaces/main` continua com todos os clientes num documento só. O admin grava o resumo em `portalClientes/{e-mail}`. A pessoa só lê o próprio documento, e só com o acesso ligado. O arquivo `firestore.rules` repete as regras que já estão no ar (formulários públicos com validação de campos, workspaces, presence, IR) e acrescenta só o bloco `portalClientes`. Storage não muda. Coleções sem regra no arquivo continuam negadas.
