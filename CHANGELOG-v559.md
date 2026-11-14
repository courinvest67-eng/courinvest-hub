# Courinvest Hub v559

Versão do service worker: `559`. O cache do app passa a `courinvest-v559`.

## Financeiro

A busca da v558 continua no módulo Financeiro da empresa. Não há tela nova.

- Se um nome curto da planilha de entradas se repete num nome mais completo, da própria planilha ou do cadastro, é a mesma pessoa. O primeiro nome precisa coincidir e os sobrenomes do nome curto entram na mesma ordem. A comparação ignora acento, maiúsculas e de, da, do, dos, das e e.
- A tela mostra sempre o nome mais completo. As linhas originais não mudam.
- Se o nome curto cabe em mais de um nome completo, fica separado, sem aviso.
- A busca, o total do período, o total desde o início e a quantidade de pagamentos somam as variações. A sugestão aparece uma vez.
- O alias "Marcus Goyatá" → "Marcus Condé Goyatá Lopes" do motor de recorrentes permanece.

Não foi possível ler a planilha real do Firestore. No exemplo, "Marcos Goiatá" e "Marcos Condé Goiatá Lopes" aparecem como um cliente só, R$ 2.000,00 em 2 pagamentos.
