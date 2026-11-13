# Courinvest Hub v557

Versão do service worker: `557`. O cache do app passa a `courinvest-v557` e os ícones são pedidos com `?v=557`, para o navegador não reaproveitar o desenho antigo.

## Ícone

- Os arquivos da raiz foram trocados pelo símbolo original da Courinvest, em fundo branco: `icon-512.png`, `icon-192.png`, `icon-96.png`, `apple-touch-icon.png` e `icon-maskable-512.png`.
- O atalho da aba, o ícone da Apple, o tile do Windows e os atalhos do manifesto apontam para esses PNGs.
- No `manifest.json`, `background_color` passou a `#FFFFFF`.
