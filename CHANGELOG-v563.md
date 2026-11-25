# Courinvest Hub v563

Versão do service worker: `563`. O cache do app passa a `courinvest-v563`.

## Painel do Cliente: mais detalhe

**Despesas.** "Seu mês" agora lista todas as categorias. Cada uma mostra o gasto, o orçado e quanto resta ou quanto estourou (em vermelho). Ao tocar, a categoria abre as subcategorias com o realizado de cada uma. Quando o orçamento do Meuvista traz o orçado por subcategoria (linhas de nível "Categoria"), aparece também o orçado e o selo "+R$ X acima" em quem passou do limite. Sem esse nível, a subcategoria mostra quanto pesa dentro da categoria.

O realizado por subcategoria vem do extrato CSV do Meuvista (colunas Orçamento e Categoria). Guardamos só o nome da categoria e a soma, nunca a descrição do lançamento. Meses importados antes da v563 precisam do extrato importado de novo para ganhar as subcategorias.

**Patrimônio.** "Onde está investido" ganhou a visão por instituição (padrão) ao lado da visão por classe. Cada instituição mostra valor e % do total e, ao tocar, os investimentos dentro dela com valor e %. A instituição vem da coluna Corretora da importação do Gorila. Posição no exterior aparece separada (ex.: "Inter · exterior").

**Taxa da Courinvest fora do painel.** O cliente não vê a taxa da Courinvest em lugar nenhum. A subcategoria "CourInvest" (qualquer grafia: Courinvest, Couri Invest, Cour-invest) some de Serviços Financeiros, e o valor dela sai do realizado e do orçado da categoria. Categoria que só tinha a taxa sai da lista.

A taxa também sai dos totais do painel: despesas realizadas, despesas orçadas e o "gastos de … orçados". O saldo do painel sobe na mesma quantia (receitas − despesas sem a taxa). Conta prevista com o nome da Courinvest sai da lista e da conta. A sugestão de aporte do painel usa esses números, para que "Ver como calculamos" feche sem mostrar a taxa. Por isso a sugestão do painel fica maior que a da ficha pelo valor da taxa.

A ficha no Hub não muda: continua com os números do Meuvista, taxa incluída.

## Ficha do cliente

"Ver como o cliente" também está no menu **Ações ▾** da ficha. Abre o mesmo painel, só leitura, sem gravar nada e sem mexer no acesso do cliente.
