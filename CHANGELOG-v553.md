# Courinvest Hub v553

Versão do service worker: `553`. Tema claro e a aba Clientes redesenhada na v552 permanecem. Os dados já gravados no Firebase não mudam de formato: os campos novos são opcionais.

## Relatório IR

- Corrigido o texto do crédito de imposto pago no exterior. A Lei 14.754/2023, art. 4º, exige tratado, acordo ou reciprocidade, além dos limites dos §§ 1º a 4º. O modelo antigo dizia que o abatimento não dependia de acordo.
- Corrigida a isenção de FII e Fiagro: o art. 41 fala em no mínimo 100 cotistas, e em 30% para o conjunto de cotistas pessoas físicas ligadas. O modelo dizia 500 cotistas e 10%.
- Essa regra de cotistas não é mais aplicada a FI-Infra.
- O regime de 15% fica restrito a aplicações financeiras no exterior (art. 2º e art. 3º). Ganho sobre bem que não seja aplicação financeira não entra automaticamente nesse regime (art. 2º, § 2º).
- Exemplos numéricos da Parte 1 passam a usar o ano-calendário do relatório, em vez de 2025 fixo.
- Dossiê por cliente e ano-calendário, em `ir_dossies` (coleção nova). Cada documento esperado tem situação: solicitado, recebido, extraído, conferido ou sem movimento. A lista pode ser sugerida pela carteira e também recebe instituição à mão (conta encerrada ou fonte que não está no Hub).
- A fila do ano mostra a etapa: aguardando informe, revisão, pronto ou enviado. O prazo oficial da declaração fica em branco até alguém conferir na Receita; o prazo interno é outro campo.
- Gerar de novo o mesmo cliente e ano não apaga o anterior em silêncio: a versão anterior vai para `ir_relatorios_versoes` e o documento atual ganha `versao`, `rascunho`, `templateFiscal` e `revisado`. O identificador `pessoaId_ano` continua sendo o relatório vigente.
- Relatório com pendência de documento, item de revisão ou apuração incompleta de várias corretoras abre como rascunho. O e-mail só sai depois de marcar como revisado. Se a soma de várias corretoras estiver incompleta, é preciso registrar que a apuração foi conferida fora do Hub.

## Dashboard

- A Visão Geral abre numa fila de ações: carteiras desatualizadas (mais de 8 dias), relatórios do mês ainda não enviados, caixa parado (acima de 5% e de R$ 10 mil) e contatos atrasados (sem interação ou há mais de 60 dias). Cada cartão mostra a quantidade e um botão.
- Indicadores, gráficos e rankings da visão de patrimônio e da visão financeira ficam atrás de “Ver indicadores, gráficos e rankings”.

## Financeiro

- A aba abre no Resumo, não em Importar.
- Conciliação do mês entre fee previsto (MRR do cadastro, que não é caixa) e o que entrou na planilha: pago, parcial, atrasado, divergente ou em aberto.
- Lançamento de relatório de IR e comissão de parceiro ficam numa lista separada, para não serem somados de novo no fee.

## Vencimentos

- Fila “até confirmar o reinvestimento”. Situações: contatar, destino definido, aguardando liquidação e reinvestido.
- Título vencido, ou que já saiu da carteira importada, permanece na fila até a situação reinvestido. O acompanhamento fica no campo opcional `vencOperacional` do cliente.

## Conferir

Estes pontos aparecem na aba Relatório IR e, quando cabem, no texto do relatório. Não foram alterados como se fossem regra fechada:

- Frações de ações em leilão no código 99: prática deste modelo, sem fonte oficial revalidada aqui.
- Alíquota de 15% no exemplo de JCP: número ilustrativo; vale o informe.
- CBE: o texto ainda cita US$ 1.000.000 e 5 de abril. Limite e prazo do Banco Central não foram revalidados.
- Conversão do rendimento pela PTAX de venda. O art. 4º, § 2º, confirma só a cotação de compra do dia do pagamento do imposto no exterior.
- Códigos de ficha (Bens e Direitos, Isentos, Tributação Exclusiva) não foram revalidados contra o manual do exercício.
- Condições da isenção de FII/Fiagro que o art. 41 não reescreveu, inclusive negociação em bolsa ou balcão.
- Isenção de FI-Infra: base própria, fora do art. 41.
- Não estender os 15% a todo bem ou renda no exterior.
- Limite do crédito por rendimento, imposto reembolsável e proibição de usar o crédito em outro ano: o Hub não calcula isso rendimento a rendimento.
- Soma de várias corretoras no exterior: só ganhos de capital e dividendos, menos o imposto informado. Juros e perdas ficam de fora; a versão fica em rascunho.
- Prazo oficial de entrega da declaração: campo vazio de propósito.
- Não há alíquota única de retenção no país de origem. O texto antigo que citava 30% nos EUA foi retirado.

A validação de um contador continua necessária. O Hub não envia a declaração à Receita Federal.
