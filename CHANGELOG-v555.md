# Courinvest Hub v555

Versão do service worker: `555`. Tema claro da v552 em diante permanece.

## Couri Mile$

- Nova aba no menu, ao lado de Clientes. Lista quem tem o serviço `milhas` no cadastro (GP, GF ou híbrido). Busca, filtro GP/GF, vincular e desvincular. Desvincular pede confirmação e só tira o serviço; os lançamentos ficam na ficha.
- Mile$ continua bônus. Não entra no fee nem no MRR. A estimativa fictícia de R$ 8.870 por cliente saiu do patrimônio sob gestão.
- Visão consolidada: clientes, total de milhas, valor pelo custo médio, vencimentos em 30 e 90 dias, e tabela por cliente.
- Alertas de vencimento próximo e de ficha sem atualização há mais de 60 dias.
- Calculadora de transferência com bônus e calculadora de resgate (preço da passagem contra o custo médio). Nada disso grava senha nem sincroniza com o programa.

## Ficha do cliente

- A aba ✈️ Mile$, dentro de Carteira, deixa de usar números de exemplo. O cliente novo começa vazio.
- Os dados ficam em `c.milhas` (`programas`, `lancamentos`, `ajustes`, `atualizadoEm`) e seguem o mesmo salvamento do cliente.
- Lançamentos: compra, acúmulo, transferência (saída, entrada e bônus), bônus, resgate, venda e ajuste de saldo. O vencimento fica no programa.
- O cálculo é o do Couri Mile$ revisado: milha transferida não entra duas vezes no custo médio; saída acima do saldo é recusada; saldo digitado vira ajuste; resultado de caixa = vendas + economia do resgate − compras.
- Programas: LATAM Pass, Smiles, TudoAzul, Livelo, Esfera, ALL Accor, Itaú / Iupp e um nome livre.
- O patrimônio do cabeçalho não soma mais milhas de exemplo. Se houver custo médio real, ele aparece à parte, fora desse patrimônio.
