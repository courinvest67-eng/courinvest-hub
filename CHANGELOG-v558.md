# Courinvest Hub v558

Versão do service worker: `558`. O cache do app passa a `courinvest-v558`.

## Histórico de interações

A tela alterada é o bloco **Histórico de interações**, no fim da Visão Geral do cliente. Desde a v551 ele deixou de ser uma aba separada. Não havia um `<select>` de cliente nessa tela, nem em Histórico de rebalanceamento nem em Histórico de movimentações.

- O bloco ganhou uma busca digitável, com sugestões enquanto se escreve.
- A busca ignora maiúsculas e acentos, e trata C e K como a mesma letra: "erica" encontra "Érika". Vale qualquer parte do nome, o sobrenome e o apelido, quando o cadastro tiver esse campo.
- Setas, Enter e Esc funcionam no teclado. No celular, cada sugestão tem área de toque. O X limpa o campo.
- Enquanto o nome é digitado, a lista de interações mostra só os clientes que combinam. Ao escolher um, a ficha dele abre com o histórico carregado.
- Não existia a opção "Todos os clientes" nesse histórico. Com o campo vazio, continua aparecendo o histórico de quem está aberto.
