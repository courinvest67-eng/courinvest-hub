# Courinvest Hub v559

Versão do service worker: `559`. O cache do app passa a `courinvest-v559`.

## Financeiro

A busca da v558 continua no módulo Financeiro da empresa. O que muda é a pessoa por trás de nomes incompletos na planilha de entradas.

- Cada nome da coluna Cliente é comparado com o cadastro do Hub. A comparação tira acento, passa para minúsculas e ignora de, da, do, dos, das e e.
- É a mesma pessoa quando o primeiro nome coincide e todos os tokens do nome curto aparecem, na mesma ordem, no nome completo do cadastro. A tela mostra o nome do cadastro. A linha original da planilha não é alterada.
- Se o nome curto servir para mais de um cliente, não junta sozinho e marca como ambíguo.
- A busca, o total do período, o total desde o início e a quantidade de pagamentos somam todas as variações daquela pessoa. Nas sugestões, cada cliente aparece uma vez.
- Nomes sem cadastro ou ambíguos ficam em "Nomes não vinculados / ambíguos", com um seletor de cliente. O vínculo vai para `fin.aliases` (nome da planilha → id do cliente) e sobe no mesmo salvamento do Financeiro. Desfazer apaga só o alias.

Não foi possível ler a planilha real do Firestore nesta sessão. O exemplo da pré-visualização junta "Marcos Goiatá" e "Marcos Condé Goiatá Lopes". "Ana Souza" fica ambíguo (Ana Souza Lima e Ana Paula Souza). "Oficina do Bairro" fica sem cadastro. No código, o alias manual antigo "Marcus Goyatá" → "Marcus Condé Goyatá Lopes" continua só no motor de recorrentes.
