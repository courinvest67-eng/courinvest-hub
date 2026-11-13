# Courinvest Hub v556

Versão do service worker: `556`.

## Cobrança do híbrido

- O modo principal do híbrido passa a se chamar “Fee fixo até o limite, depois % do patrimônio”. É o automático de antes (`servicoPrincipal` vazio).
- No modal de serviço ficam o fee fixo mensal (`feeFixo`) e o limite de patrimônio deste cliente (`txRegressivaThreshold`). O padrão do limite continua R$ 200.000 quando o campo não existe. O mesmo limite aparece em Particularidades.
- Abaixo do limite, cobra só o fee fixo. Ao atingir, cobra a tabela variável daquele cliente, sobre o patrimônio total (não é alíquota marginal). Sem `tabelaFee` gravado, continua a tabela de 2 faixas que já existia.
- Tabelas: `padrao2` (0,15% a.m. até R$ 1 milhão e 0,10% acima) e `gp4` (0,175% até R$ 600 mil, 0,15% até R$ 1,5 milhão, 0,125% até R$ 3 milhões e 0,10% acima). O seletor fica na cobrança do híbrido e também no GP com taxa regressiva, em Particularidades.
- O texto diz, por exemplo, “Hoje: fee fixo R$ 430 · patrimônio R$ X de R$ 300.000 (faltam R$ Y para virar % do patrimônio) · depois: Padrão (2 faixas)” ou “Hoje: 0,15% a.m. sobre R$ X = R$ Z · Padrão (2 faixas)”.
- “Sempre fee fixo” e “Sempre % do patrimônio” continuam como escolha manual.
- O card Receita da consultoria, na Visão Geral do cliente híbrido, repete essa frase. Continua uma cobrança só, e as listas de GP/GF seguem o serviço que está sendo cobrado hoje.
