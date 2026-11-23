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

## Quanto posso aportar

Sugestão = saldo realizado do mês − despesas do orçamento que ainda não foram lançadas − contas previstas − reserva mínima − transferências neutras para investimento. Abaixo de zero, mostra zero. Receita que ainda não caiu na conta não entra. Aportes já feitos no mês aparecem à parte (despesa de investimento, lançamento neutro ou aporte registrado na carteira do Hub). O texto na tela diz que não é garantia.

## Segurança

`workspaces/main` continua com todos os clientes num documento só, então a regra do Firestore não consegue liberar um cliente só. O admin passa a gravar `portalClientes/{e-mail}` só com o resumo. A pessoa só consegue ler esse documento, e só com o acesso ligado. As regras estão em `firestore.rules` e `storage.rules`. O GitHub Pages não publica regra no Firebase: o Igor cola no console ou faz o deploy. O passo a passo está no relatório do pull request.
