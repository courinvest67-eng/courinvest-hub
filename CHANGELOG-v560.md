# Courinvest Hub v560

Versão do service worker: `560`. O cache do app passa a `courinvest-v560`.

## Financeiro

Conferência de fees no Resumo, só leitura. As entradas e o restante do cadastro não são reescritos. O meio de cobrança do cliente (`feeMetodo`) e as taxas em `config.feeTaxas` são os únicos campos novos, e só mudam quando alguém edita.

- Mês padrão: último mês fechado. Uma linha por cliente ativo de GP ou GF que já tenha começado (`dtCaptacao` no mês ou antes).
- Esperado bruto é o mesmo cálculo do MRR: híbrido com fee fixo até o limite do cliente e, acima, a tabela `padrao2` ou `gp4`; GP puro pela taxa da carteira; GF pura pelo fee fixo.
- Taxas editáveis: Vindi 1,99%, Stripe 3,39%, PIX, boleto e transferência 0%. Se a planilha traz o meio, ele vale; senão, o meio do cliente; senão, PIX.
- A linha mostra bruto, taxa, líquido e recebido. O status compara o recebido com o líquido, com tolerância do maior entre 1% e R$ 5. Dentro da tolerância, é Pago.
- Totais: esperado bruto, taxas de cartão, esperado líquido, recebido, diferença e pendentes. Dá para filtrar por status e usar a busca de cliente.
- Recebimento de quem não tem fee esperado fica à parte.
- No Dashboard e no sino, um aviso único quando o mês fechado tem cliente não pago ou pago a menor.

O MRR do Dashboard soma esse esperado de todo GP/GF do cadastro, inclusive inativo e quem ainda não começou. A conferência de um mês anterior deixa de fora quem começa depois. O override de PIX do relatório entra na receita da ficha, não no MRR nem aqui. A queda de R$ 55.730,50 para R$ 55.441,03 na v556, sem editar cadastro, vem da troca da regra do híbrido: antes o híbrido pagava só percentual sobre o patrimônio; a partir da v556, abaixo do limite paga o fee fixo.
