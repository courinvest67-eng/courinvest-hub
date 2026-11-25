/* Teste do importador Meuvista (v561). Só dados sintéticos. */
var PC = require("./portal-core.js");
var falhas = 0;
function round2t(n) { return Math.round(n * 100) / 100; }
function eq(nome, a, b) {
  if (Math.abs(a - b) > 0.001) {
    falhas++;
    console.error("FALHOU " + nome + ": " + a + " != " + b);
  } else console.log("ok " + nome + " = " + a);
}
function truth(nome, cond) {
  if (!cond) { falhas++; console.error("FALHOU " + nome); }
  else console.log("ok " + nome);
}

var extratoSint = [
  "Data;Descrição;Parcela;Valor;Meio de Pagamento;Orçamento;Categoria;Vencimento;Parcelado;Tipo;Origem;Neutro;duplicate-action;delete-action",
  "01/11/2026;Salario de 111.222.333-44;;1.000,50;Banco;Receita;Salário;-;Não;Receita;Manual;Não;-;-",
  "02/11/2026;Mercado;;200,00;Cartão;Alimentação;Supermercado;-;Não;Despesa;Manual;Não;-;-",
  "03/11/2026;Aplicacao tesouro;;50,00;Banco;Investimentos;Aporte;-;Não;Despesa;Manual;Sim;-;-",
  "04/11/2026;Linha duplicada;;999,00;Banco;Lazer;Passeio;-;Não;Despesa;Manual;Não;ignorar;-",
  "05/11/2026;Apple;;19,90;Cartão;Comunicação;Aplicativos;-;Não;Despesa;Manual;Não;-;-",
  "01/12/2026;Outro mês;;10,00;Banco;Receita;Extra;-;Não;Receita;Manual;Não;-;-"
].join("\n");
var orcSint = [
  "Nível;Orçamento;Estimado;Realizado Mensal;Quantidade Lançamentos;Total;% Estimativa;% Realizado Tipo",
  "Orçamento;Receita;1.000,00;1.000,50;1;1.000,50;100%;100%",
  "Orçamento;Alimentação;300,00;200,00;1;200,00;66%;50%",
  "Orçamento;Comunicação;20,00;19,90;1;19,90;99%;5%",
  "Categoria;Supermercado;999,00;999,00;1;999,00;100%;100%"
].join("\n");

var r1 = PC.aplicarExtrato(PC.mesVazio("2026-11"), extratoSint, "2026-11");
eq("sint receita", r1.mes.receitas.realizado, 1000.5);
eq("sint despesa só extrato", r1.mes.despesas.realizado, 219.9);
eq("sint neutro aporte", r1.mes.aportesNeutro, 50);
eq("sint ignorados", r1.mes.qtdIgnorados, 1);
truth("sint avisa outro mês", r1.avisos.join(" ").indexOf("outro mês") >= 0);
var r2 = PC.aplicarOrcamento(r1.mes, orcSint, "2026-11");
eq("sint receita orc", r2.mes.receitas.realizado, 1000.5);
eq("sint receita est", r2.mes.receitas.estimado, 1000);
eq("sint despesa orc", r2.mes.despesas.realizado, 219.9);
eq("sint despesa est", r2.mes.despesas.estimado, 320);
eq("sint saldo", r2.mes.saldoRealizado, 780.6);
eq("sint saldo est", r2.mes.saldoEstimado, 680);
truth("categoria filha não duplica", r2.mes.categorias.length === 2);
r2.mes.contasPrevistas = [{ rotulo: "IPVA de 111.222.333-44", valor: 100 }];
var ap = PC.calcularAporte(r2.mes, 30);
eq("sint ainda", ap.despesasAinda, 100.1);
eq("sint sugerido", ap.sugerido, 500.5);
var portalMes = PC.mesParaPortal(r2.mes, 0);
truth("portal sem cpf", !PC.contemDocumento(portalMes));
truth("portal sem descricao", JSON.stringify(portalMes).indexOf("Salario") < 0 && JSON.stringify(portalMes).indexOf("descricao") < 0);
truth("conta redigida", portalMes.contasPrevistas[0].rotulo.indexOf("111") < 0);

var portal = PC.projetarPortal({
  id: "c1", nome: "Pessoa Teste", cpf: "123.456.789-00", txGestao: 0.5, feeFixo: 900,
  emailAcesso: "pessoa@example.com", acessoClienteAtivo: true,
  patGorila: 1000,
  _ativosImport: [{ tp: "cdb", posR: 600 }, { tp: "acao", posR: 400 }],
  controleFinanceiro: { reservaMinima: 30, meses: { "2026-11": r2.mes } },
  fin: { entradas: [{ valor: 900 }] }
});
truth("portal sem cpf do cliente", JSON.stringify(portal).indexOf("123.456.789-00") < 0);
truth("portal sem fee", JSON.stringify(portal).indexOf("txGestao") < 0 && JSON.stringify(portal).indexOf("feeFixo") < 0);
truth("portal sem financeiro da empresa", JSON.stringify(portal).indexOf("entradas") < 0);
eq("alocacao rf", portal.patrimonio.alocacao[0].pct, 60);
truth("acesso ativo", portal.acessoAtivo === true);

var ativosDemo = [
  { tk: "CDB BTG 110% CDI", nm: "CDB BTG 110% CDI", posR: 80000 },
  { tk: "TESOURO SELIC 2029", nm: "Tesouro Selic 2029", posR: 150000 },
  { tk: "HGLG11", nm: "CSHG Logística", posR: 45000 }
];
var reserva = {
  id: "r1", nome: "Reserva de emergência", alvo: 120000, semPrazo: true, prioridade: 1, modo: "ativos",
  alocacoes: [
    { chave: "cdb btg 110% cdi", tk: "CDB BTG 110% CDI", nome: "CDB BTG 110% CDI", pct: 100 },
    { chave: "lci antiga", tk: "LCI ANTIGA", nome: "LCI Antiga", pct: 100 }
  ]
};
var viagem = {
  id: "v1", nome: "Viagem", alvo: 120000, prioridade: 2, modo: "ativos", dataAlvo: "2028-11-23",
  alocacoes: [{ chave: "tesouro selic 2029", tk: "TESOURO SELIC 2029", nome: "Tesouro Selic 2029", pct: 50 }]
};
var avR = PC.avaliarObjetivo(reserva, ativosDemo, { hoje: new Date("2026-11-23T12:00:00") });
eq("reserva progresso", avR.progresso, 66.7);
eq("reserva atual", avR.atual, 80000);
eq("reserva falta", avR.falta, 40000);
truth("reserva sem prazo", avR.semPrazo && avR.aporteMensal === 0);
truth("lci ausente", avR.vinculos.some(function (v) { return v.ausente && v.nome.indexOf("LCI") >= 0; }));
var avV = PC.avaliarObjetivo(viagem, ativosDemo, { hoje: new Date("2026-11-23T12:00:00"), taxaMensal: 0.9 });
eq("viagem atual 50%", avV.atual, 75000);
eq("viagem meses", avV.mesesRestantes, 24);
eq("viagem aporte simples", avV.aporteMensal, 1875);
truth("viagem com taxa menor que o simples", avV.aporteComTaxa > 0 && avV.aporteComTaxa < avV.aporteMensal);
eq("pct usado no tesouro", PC.pctComprometido([reserva, viagem], "tesouro selic 2029", "v1"), 0);
eq("pct usado ignorando a viagem", PC.pctComprometido([reserva, viagem], "tesouro selic 2029", "r1"), 50);
var antigo = { id: "old", modo: "ativos", nome: "Caixa", alvo: 10000, dataAlvo: "2027-11-23", ativosVinculados: ["HGLG11"] };
eq("legado 100%", PC.avaliarObjetivo(antigo, ativosDemo, { hoje: new Date("2026-11-23T12:00:00") }).atual, 45000);
eq("media despesas", PC.mediaDespesas({ a: { despesas: { realizado: 1000 } }, b: { despesas: { realizado: 3000 } } }), 2000);
eq("reserva 6 meses", PC.sugerirAlvoReserva(2000, 6), 12000);
eq("reserva default 6", PC.sugerirAlvoReserva(2000, 0), 12000);
var div = PC.dividirAporte(1500, [
  { nome: "A", prioridade: 1, semPrazo: false, aporteMensal: 1000 },
  { nome: "B", prioridade: 2, semPrazo: false, aporteMensal: 2000 },
  { nome: "C", prioridade: 3, semPrazo: true, aporteMensal: 0 }
]);
eq("divisao A", div.partes[0].nesteMes, 1000);
eq("divisao B", div.partes[1].nesteMes, 500);
eq("divisao precisa", div.precisa, 3000);
truth("divisao nao cobre", div.cobre === false);
var comMeta = PC.projetarPortal({
  id: "c1", nome: "Pessoa Teste", cpf: "123.456.789-00",
  emailAcesso: "pessoa@example.com", acessoClienteAtivo: true,
  _ativosImport: ativosDemo, objetivos: [reserva, viagem],
  controleFinanceiro: { taxaMensalEstimada: 0.9, reservaMinima: 0, meses: {} }
});
truth("portal tem objetivo", comMeta.objetivos.length === 2 && comMeta.objetivos[0].nome.indexOf("Reserva") >= 0);
truth("portal sem cpf no objetivo", !PC.contemDocumento(comMeta.objetivos));
truth("portal sem instituicao", JSON.stringify(comMeta.objetivos).indexOf("BTG Pactual") < 0);

/* v563: subcategorias e estouro, patrimônio por instituição. */
var ext563 = [
  "Data;Descrição;Parcela;Valor;Meio de Pagamento;Orçamento;Categoria;Vencimento;Parcelado;Tipo;Origem;Neutro;duplicate-action;delete-action",
  "02/11/2026;Aluguel de 111.222.333-44;;2.000,00;Banco;Moradia;Aluguel;-;Não;Despesa;Manual;Não;-;-",
  "03/11/2026;Luz;;300,00;Banco;Moradia;Energia;-;Não;Despesa;Manual;Não;-;-",
  "04/11/2026;Luz 2;;50,00;Banco;Moradia;Energia;-;Não;Despesa;Manual;Não;-;-",
  "05/11/2026;Mercado;;400,00;Cartão;Alimentação;Supermercado;-;Não;Despesa;Manual;Não;-;-"
].join("\n");
var orc563 = [
  "\"Nível\";\"Orçamento\";\"Estimado\";\"Realizado Mensal\"",
  "\"Orçamento\";\"Moradia\";\"2.200,00\";\"2.350,00\"",
  "\"Categoria\";\"Aluguel\";\"2.000,00\";\"2.000,00\"",
  "\"Categoria\";\"Energia\";\"200,00\";\"350,00\"",
  "\"Orçamento\";\"Alimentação\";\"500,00\";\"400,00\""
].join("\n");
var m563 = PC.aplicarExtrato(null, ext563, "2026-11").mes;
eq("sub extrato energia", m563.extrato.subcategorias.Moradia.Energia, 350);
truth("sub extrato sem descricao", JSON.stringify(m563.extrato).indexOf("Luz") < 0 && !PC.contemDocumento(m563.extrato));
m563 = PC.aplicarOrcamento(m563, orc563, "2026-11").mes;
var det = PC.detalharCategorias(m563);
var mor = det.filter(function (c) { return c.nome === "Moradia"; })[0];
eq("moradia estourou", mor.estourou, 150);
eq("energia estourou", mor.subcategorias[0].estourou, 150);
truth("energia primeiro", mor.subcategorias[0].nome === "Energia");
eq("aluguel nao estourou", mor.subcategorias[1].estourou, 0);
var soEx = PC.detalharCategorias(PC.aplicarOrcamento(PC.aplicarExtrato(null, ext563, "2026-11").mes, "\"Nível\";\"Orçamento\";\"Estimado\";\"Realizado Mensal\"\n\"Orçamento\";\"Moradia\";\"2.200,00\";\"2.350,00\"", "2026-11").mes);
truth("sub do extrato sem orcado", soEx[0].subcategorias.length === 2 && soEx[0].subcategorias[0].estimado === null && soEx[0].subcategorias[0].realizado === 2000);
var porInst = PC.instituicoesDeAtivos([
  { tk: "CDB X", nm: "CDB X", tp: "cdb", inst: "Genial", posR: 100000 },
  { tk: "IAU", nm: "IAU", tp: "etf_int", inst: "Inter", posR: 50000, _gClasse: "Investimento No Exterior" },
  { tk: "CDB Y", nm: "CDB Y", tp: "cdb", inst: "Inter", posR: 25000 },
  { tk: "Fundo", nm: "FUNDO RF - 51.253.495/0001-00", tp: "fundo_rf", inst: "Genial", posR: 25000 },
  { tk: "ZERO", nm: "ZERO", tp: "acao", inst: "Genial", posR: 0 }
]);
truth("instituicao genial primeiro", porInst[0].nome === "Genial" && porInst[0].valor === 125000 && porInst[0].qtd === 2);
truth("inter exterior separado", porInst[1].nome === "Inter · exterior" && porInst[2].nome === "Inter");
eq("pct genial", porInst[0].pct, 62.5);
truth("instituicao sem cnpj", !PC.contemDocumento(porInst));

/* v563: taxa da Courinvest fora do painel do cliente. */
var mTaxa = {
  ym: "2026-11",
  receitas: { estimado: 1000, realizado: 1000 }, despesas: { estimado: 900, realizado: 800 },
  categorias: [
    { nome: "Serviços Financeiros", estimado: 600, realizado: 622.1, subcategorias: [
      { nome: "CourInvest", estimado: null, realizado: 522.1 }, { nome: "Tarifa bancária", estimado: null, realizado: 100 } ] },
    { nome: "Consultoria", estimado: 300, realizado: 300, subcategorias: [ { nome: "Couri Invest", estimado: null, realizado: 300 } ] },
    { nome: "Courinvest", estimado: 100, realizado: 100 },
    { nome: "Moradia", estimado: 100, realizado: 50 }
  ],
  contasPrevistas: [ { rotulo: "Fee Courinvest dezembro", valor: 522.1 } ]
};
var pTaxa = PC.mesParaPortal(mTaxa, 0);
var jTaxa = JSON.stringify(pTaxa);
truth("taxa nao aparece no painel", !/couri?\s*-?\s*invest/i.test(jTaxa) && !/couriinvest|courinvest/.test(PC.fold(jTaxa).replace(/[^a-z]/g, "")));
truth("taxa nao aparece pelo valor nas categorias", JSON.stringify(pTaxa.categorias).indexOf("522.1") < 0);
truth("conta prevista da taxa some", pTaxa.contasPrevistas.length === 0);
var sf = pTaxa.categorias.filter(function (c) { return c.nome === "Serviços Financeiros"; })[0];
eq("servicos financeiros sem a taxa", sf.realizado, 100);
eq("orcado sem a taxa", sf.estimado, 77.9);
truth("categoria so com a taxa some", pTaxa.categorias.every(function (c) { return c.nome !== "Consultoria"; }));
/* t115u: a taxa sai também dos totais do painel. Tirado: 522,10 + 300 + 100 do realizado; 522,10 + 300 + 100 do orçado. */
eq("despesas do painel sem a taxa", pTaxa.despesas.realizado, 0);
truth("taxa nao aparece em lugar nenhum pelo valor", jTaxa.indexOf("522.1") < 0);
var mTaxa2 = {
  ym: "2026-11",
  receitas: { estimado: 10000, realizado: 11100 }, despesas: { estimado: 9000, realizado: 8000 },
  saldoRealizado: 3000,
  categorias: [
    { nome: "Serviços Financeiros", estimado: 480, realizado: 522.1, subcategorias: [ { nome: "CourInvest", estimado: null, realizado: 522.1 } ] },
    { nome: "Moradia", estimado: 8520, realizado: 7477.9 }
  ],
  contasPrevistas: [ { rotulo: "Taxa Courinvest", valor: 522.1 }, { rotulo: "IPTU", valor: 100 } ]
};
var p2 = PC.mesParaPortal(mTaxa2, 0);
eq("despesas realizadas sem a taxa", p2.despesas.realizado, 7477.9);
eq("despesas orcadas sem a taxa", p2.despesas.estimado, 8520);
eq("saldo sobe pela taxa", p2.saldoRealizado, 3622.1);
eq("saldo estimado coerente", p2.saldoEstimado, 1480);
truth("so a conta da taxa sai", p2.contasPrevistas.length === 1 && p2.contasPrevistas[0].rotulo === "IPTU");
var c2 = PC.calcularAporte(p2, 0);
eq("aporte coerente com o painel", c2.sugerido, round2t(3622.1 - (8520 - 7477.9) - 100));
truth("painel inteiro sem a taxa", JSON.stringify(p2).indexOf("522.1") < 0 && !/couri?\s*invest/i.test(JSON.stringify(p2)));
var hubIntacto = PC.calcularAporte(mTaxa2, 0);
eq("hub segue com a taxa", hubIntacto.contasPrevistas, 622.1);

if (falhas) {
  console.error(falhas + " falha(s)");
  process.exit(1);
}
console.log("tudo certo");
