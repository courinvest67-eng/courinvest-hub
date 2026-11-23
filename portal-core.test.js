/* Teste do importador Meuvista (v561). Só dados sintéticos. */
var PC = require("./portal-core.js");
var falhas = 0;
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

if (falhas) {
  console.error(falhas + " falha(s)");
  process.exit(1);
}
console.log("tudo certo");
