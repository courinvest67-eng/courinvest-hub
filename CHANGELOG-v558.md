# Courinvest Hub v558

Versão do service worker: `558`. O cache do app passa a `courinvest-v558`.

## Financeiro

A tela alterada é o módulo **Financeiro** da empresa (menu lateral), não o histórico de interações do cliente. O histórico de interações ficou como na v557.

- No topo do Financeiro há um campo para buscar o cliente pelo nome.
- A busca ignora maiúsculas e acentos, e trata C e K como a mesma letra: "erica" encontra "Érika". Vale qualquer parte do nome, o sobrenome e o apelido do cadastro, quando o lançamento da planilha corresponde a esse cliente.
- Setas, Enter e Esc funcionam no teclado. No celular, cada sugestão tem área de toque. O X limpa.
- Ao digitar, os recebimentos daquele nome aparecem em destaque. O total do período respeita o ano ou o mês já escolhido na aba. Ao lado, o total desde o início e a quantidade de pagamentos.
- Com o campo vazio, o restante da tela fica como antes.
- O valor recebido vem da planilha de entradas importada (`fin.entradas`: colunas Cliente e Valor). Não é o fee contratado no cadastro.
