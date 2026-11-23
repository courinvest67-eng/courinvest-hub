# Courinvest Hub v562

Versão do service worker: `562`. O cache do app passa a `courinvest-v562`.

## Entrada do cliente

Além do Google, a pessoa pode pedir um link no e-mail cadastrado (Hotmail e outros, sem conta Google). O link abre neste aparelho. Se abrir em outro, a tela pede o mesmo e-mail. Link expirado, usado ou inválido mostra um aviso em português. Só `courinvest.67@gmail.com` continua na área da consultoria. As regras do Firestore não mudam.

Na ficha, o card de acesso explica as duas formas de entrar e copia o link do painel.

## Painel

O painel do cliente ganhou um visual próprio, no fundo claro da Courinvest, com a logo original: saudação, patrimônio com a variação do mês e um botão para ocultar os valores, a sugestão do mês em destaque (o cálculo fica em "Ver como calculamos"), as caixinhas com anel de progresso, o mês com receitas e despesas e um gráfico das categorias, a alocação e o WhatsApp da Courinvest. Continua só leitura, sem fee e sem documento.

Na ficha, "Ver como o cliente" abre esse mesmo painel com os dados que iriam para `portalClientes`, mesmo com o acesso desligado e sem e-mail. Nada é gravado. A abertura do app mostra a logo.
