# Courinvest Hub v563

Versão do service worker: `563`. O cache do app passa a `courinvest-v563`.

## Painel do Cliente: mais detalhe

**Despesas.** "Seu mês" agora lista todas as categorias. Cada uma mostra o gasto, o orçado e quanto resta ou quanto estourou (em vermelho). Ao tocar, a categoria abre as subcategorias com o realizado de cada uma. Quando o orçamento do Meuvista traz o orçado por subcategoria (linhas de nível "Categoria"), aparece também o orçado e o selo "+R$ X acima" em quem passou do limite. Sem esse nível, a subcategoria mostra quanto pesa dentro da categoria.

O realizado por subcategoria vem do extrato CSV do Meuvista (colunas Orçamento e Categoria). Guardamos só o nome da categoria e a soma, nunca a descrição do lançamento. Meses importados antes da v563 precisam do extrato importado de novo para ganhar as subcategorias.

**Patrimônio.** "Onde está investido" ganhou a visão por instituição (padrão) ao lado da visão por classe. Cada instituição mostra valor e % do total e, ao tocar, os investimentos dentro dela com valor e %. A instituição vem da coluna Corretora da importação do Gorila. Posição no exterior aparece separada (ex.: "Inter · exterior").

## Ficha do cliente

"Ver como o cliente" também está no menu **Ações ▾** da ficha. Abre o mesmo painel, só leitura, sem gravar nada e sem mexer no acesso do cliente.
