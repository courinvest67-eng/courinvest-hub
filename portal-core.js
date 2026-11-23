/* Courinvest Hub v561 — controle financeiro (Meuvista) e projeção do Painel do Cliente.
   Sem DOM, sem Firebase e sem rede. Não guarda descrição de lançamento. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PortalCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  function round2(n) {
    var x = +n;
    if (!isFinite(x)) return 0;
    return Math.round(x * 100) / 100;
  }

  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function headerKey(s) {
    return fold(s).replace(/[^a-z0-9]+/g, " ").trim();
  }

  /* CPF, CNPJ e sequências longas de dígitos saem de qualquer texto que o painel possa ler. */
  function redigir(s) {
    return String(s || "")
      .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, "")
      .replace(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g, "")
      .replace(/\d{5,}/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function parseCsv(texto) {
    var s = String(texto || "").replace(/^\uFEFF/, "");
    var rows = [];
    var row = [];
    var cur = "";
    var q = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (q) {
        if (ch === '"') {
          if (s.charAt(i + 1) === '"') { cur += '"'; i++; }
          else q = false;
        } else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ";") { row.push(cur); cur = ""; }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (ch !== "\r") cur += ch;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); });
  }

  function numPt(v) {
    if (v == null) return null;
    var s = String(v).trim();
    if (!s || s === "-" || s === "—" || fold(s) === "null") return null;
    s = s.replace(/r\$\s*/i, "").replace(/\s/g, "").replace(/%/g, "");
    if (s.indexOf(",") >= 0) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    var n = +s;
    return isFinite(n) ? round2(n) : null;
  }

  function isoData(v) {
    var s = String(v || "").trim();
    var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return m[3] + "-" + m[2] + "-" + m[1];
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + "-" + m[2] + "-" + m[3];
    return "";
  }

  function ymDe(iso) { return iso && iso.length >= 7 ? iso.slice(0, 7) : ""; }

  function sim(v) {
    var t = fold(v);
    return t === "sim" || t === "s" || t === "true" || t === "1" || t === "yes";
  }

  function acaoMarcada(v) {
    var t = fold(v);
    if (!t || t === "-" || t === "—" || t === "nao" || t === "n" || t === "false" || t === "0") return false;
    return true;
  }

  function indexar(headers) {
    var map = {};
    headers.forEach(function (h, i) { map[headerKey(h)] = i; });
    return map;
  }

  function cel(row, map, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (map[keys[i]] != null) return row[map[keys[i]]];
    }
    return "";
  }

  function pareceAporte(orcamento, categoria) {
    var blob = fold(orcamento + " " + categoria);
    if (!blob) return false;
    if (/courinvest|servicos financeiros|tarifa bancaria|impostos?\b/.test(blob)) return false;
    if (/aplicativos?\b/.test(blob) && !/aplicacao/.test(blob)) {
      blob = blob.replace(/aplicativos?\b/g, "");
    }
    return /investiment|aplicacao|\baporte\b|previdencia|tesouro|corretora/.test(blob);
  }

  function mesVazio(ym) {
    return {
      ym: ym,
      fonte: "Meuvista",
      atualizadoEm: null,
      receitas: { estimado: null, realizado: 0 },
      despesas: { estimado: null, realizado: 0 },
      saldoRealizado: 0,
      saldoEstimado: null,
      categorias: [],
      contasPrevistas: [],
      aportesDespesa: 0,
      aportesNeutro: 0,
      aportesHub: 0,
      qtdReceitas: 0,
      qtdDespesas: 0,
      qtdNeutros: 0,
      qtdIgnorados: 0,
      extrato: null,
      orcamento: null,
      divergencia: null
    };
  }

  function recomputar(mes) {
    var ex = mes.extrato;
    var orc = mes.orcamento;
    if (orc) {
      mes.receitas = { estimado: orc.receitas.estimado, realizado: orc.receitas.realizado };
      mes.despesas = { estimado: orc.despesas.estimado, realizado: orc.despesas.realizado };
      mes.categorias = orc.categorias || [];
    } else if (ex) {
      mes.receitas = { estimado: mes.receitas && mes.receitas.estimado != null ? mes.receitas.estimado : null, realizado: ex.receitas };
      mes.despesas = { estimado: mes.despesas && mes.despesas.estimado != null ? mes.despesas.estimado : null, realizado: ex.despesas };
    }
    if (ex) {
      mes.aportesDespesa = ex.aportesDespesa;
      mes.aportesNeutro = ex.aportesNeutro;
      mes.qtdReceitas = ex.qtdReceitas;
      mes.qtdDespesas = ex.qtdDespesas;
      mes.qtdNeutros = ex.qtdNeutros;
      mes.qtdIgnorados = ex.qtdIgnorados;
    }
    var rr = mes.receitas.realizado || 0;
    var dr = mes.despesas.realizado || 0;
    mes.saldoRealizado = round2(rr - dr);
    if (mes.receitas.estimado != null && mes.despesas.estimado != null) mes.saldoEstimado = round2(mes.receitas.estimado - mes.despesas.estimado);
    else mes.saldoEstimado = null;
    mes.divergencia = null;
    if (ex && orc) {
      var dRec = round2(ex.receitas - (orc.receitas.realizado || 0));
      var dDes = round2(ex.despesas - (orc.despesas.realizado || 0));
      if (Math.abs(dRec) > 0.05 || Math.abs(dDes) > 0.05) {
        mes.divergencia = {
          receitasExtrato: ex.receitas,
          despesasExtrato: ex.despesas,
          receitasOrcamento: orc.receitas.realizado || 0,
          despesasOrcamento: orc.despesas.realizado || 0
        };
      }
    }
    return mes;
  }

  function aplicarExtrato(mes, texto, ymAlvo) {
    var base = Object.assign(mesVazio(ymAlvo), mes || {});
    base.ym = ymAlvo;
    base.contasPrevistas = (mes && mes.contasPrevistas) || base.contasPrevistas || [];
    base.orcamento = (mes && mes.orcamento) || null;
    var avisos = [];
    if (String(texto || "").indexOf(";") < 0) {
      return { mes: base, avisos: ["O extrato não está separado por ponto e vírgula. Exporte o CSV do Meuvista."] };
    }
    var rows = parseCsv(texto);
    if (!rows.length) return { mes: base, avisos: ["Extrato vazio."] };
    var map = indexar(rows[0]);
    if (map.valor == null || map.tipo == null) {
      return { mes: base, avisos: ["Não achei as colunas Valor e Tipo. Use o extrato CSV do Meuvista."] };
    }
    var acc = { receitas: 0, despesas: 0, aportesDespesa: 0, aportesNeutro: 0, qtdReceitas: 0, qtdDespesas: 0, qtdNeutros: 0, qtdIgnorados: 0, fora: 0 };
    var porYm = {};
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (acaoMarcada(cel(row, map, ["duplicate action", "duplicateaction"])) || acaoMarcada(cel(row, map, ["delete action", "deleteaction"]))) {
        acc.qtdIgnorados++;
        continue;
      }
      var iso = isoData(cel(row, map, ["data"]));
      var ym = ymDe(iso);
      var descFold = fold(cel(row, map, ["descricao", "descricao "]));
      if (!iso && (descFold === "receitas" || descFold === "despesas" || descFold === "saldo final" || descFold === "saldo")) {
        continue;
      }
      if (ym) porYm[ym] = (porYm[ym] || 0) + 1;
      if (ymAlvo && ym && ym !== ymAlvo) { acc.fora++; continue; }
      var valor = numPt(cel(row, map, ["valor"]));
      if (valor == null) continue;
      var tipo = fold(cel(row, map, ["tipo"]));
      var neutro = sim(cel(row, map, ["neutro"]));
      var orc = cel(row, map, ["orcamento"]);
      var cat = cel(row, map, ["categoria"]);
      var aporte = pareceAporte(orc, cat);
      var abs = round2(Math.abs(valor));
      if (neutro) {
        acc.qtdNeutros++;
        if (aporte) acc.aportesNeutro = round2(acc.aportesNeutro + abs);
        continue;
      }
      if (tipo.indexOf("receita") >= 0) {
        acc.receitas = round2(acc.receitas + abs);
        acc.qtdReceitas++;
      } else if (tipo.indexOf("despesa") >= 0) {
        acc.despesas = round2(acc.despesas + abs);
        acc.qtdDespesas++;
        if (aporte) acc.aportesDespesa = round2(acc.aportesDespesa + abs);
      } else if (valor < 0) {
        acc.despesas = round2(acc.despesas + abs);
        acc.qtdDespesas++;
      } else {
        acc.qtdIgnorados++;
      }
    }
    if (!ymAlvo) {
      var melhor = "";
      var n = 0;
      Object.keys(porYm).forEach(function (k) { if (porYm[k] > n) { n = porYm[k]; melhor = k; } });
      if (melhor) return aplicarExtrato(mes, texto, melhor);
    }
    base.extrato = acc;
    base.atualizadoEm = new Date().toISOString();
    base.fonte = "Meuvista";
    recomputar(base);
    if (acc.fora) avisos.push(acc.fora + " lançamentos de outro mês ficaram de fora de " + ymAlvo + ".");
    if (acc.qtdIgnorados) avisos.push(acc.qtdIgnorados + " linhas ignoradas (duplicata, exclusão ou sem tipo).");
    if (!acc.qtdReceitas && !acc.qtdDespesas) avisos.push("Nenhuma receita ou despesa entrou na soma. Confira Neutro, Tipo e o mês.");
    return { mes: base, avisos: avisos, ym: ymAlvo };
  }

  function aplicarOrcamento(mes, texto, ymAlvo) {
    var base = Object.assign(mesVazio(ymAlvo), mes || {});
    base.ym = ymAlvo;
    base.contasPrevistas = (mes && mes.contasPrevistas) || [];
    base.extrato = (mes && mes.extrato) || null;
    var avisos = [];
    if (String(texto || "").indexOf(";") < 0) {
      return { mes: base, avisos: ["O orçamento não está separado por ponto e vírgula. Exporte o CSV do Meuvista."] };
    }
    var rows = parseCsv(texto);
    if (!rows.length) return { mes: base, avisos: ["Orçamento vazio."] };
    var map = indexar(rows[0]);
    if (map.orcamento == null || (map.estimado == null && map["realizado mensal"] == null && map.realizado == null)) {
      return { mes: base, avisos: ["Não achei as colunas Orçamento e Estimado/Realizado. Use o CSV de orçamento do Meuvista."] };
    }
    var parsed = [];
    var temNivelOrc = false;
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var nivel = fold(cel(row, map, ["nivel"]));
      if (nivel === "orcamento") temNivelOrc = true;
      parsed.push({
        nivel: nivel,
        nome: String(cel(row, map, ["orcamento"]) || "").trim(),
        estimado: numPt(cel(row, map, ["estimado"])),
        realizado: numPt(cel(row, map, ["realizado mensal", "realizado", "total"]))
      });
    }
    var recE = null, recR = 0, desE = 0, desR = 0, temDesE = false;
    var cats = [];
    parsed.forEach(function (p) {
      if (!p.nome) return;
      if (temNivelOrc && p.nivel && p.nivel !== "orcamento") return;
      var nomeF = fold(p.nome);
      if (nomeF === "receita" || nomeF === "receitas") {
        recE = p.estimado;
        recR = p.realizado || 0;
        return;
      }
      var est = p.estimado;
      var rea = p.realizado || 0;
      if (est != null) { desE = round2(desE + est); temDesE = true; }
      desR = round2(desR + rea);
      cats.push({ nome: redigir(p.nome).slice(0, 60) || "Categoria", estimado: est, realizado: rea });
    });
    cats.sort(function (a, b) { return (b.realizado || 0) - (a.realizado || 0); });
    base.orcamento = {
      receitas: { estimado: recE, realizado: recR },
      despesas: { estimado: temDesE ? desE : null, realizado: desR },
      categorias: cats
    };
    base.atualizadoEm = new Date().toISOString();
    base.fonte = "Meuvista";
    recomputar(base);
    if (recE == null && !cats.length) avisos.push("Nenhuma categoria de orçamento foi lida.");
    return { mes: base, avisos: avisos, ym: ymAlvo };
  }

  function calcularAporte(mes, reservaMinima) {
    mes = mes || {};
    var rec = mes.receitas || {};
    var desp = mes.despesas || {};
    var saldo = round2((+rec.realizado || 0) - (+desp.realizado || 0));
    var ainda = desp.estimado == null ? null : round2(Math.max(0, (+desp.estimado || 0) - (+desp.realizado || 0)));
    var contas = round2((mes.contasPrevistas || []).reduce(function (s, x) { return s + (+x.valor || 0); }, 0));
    var reserva = round2(Math.max(0, +reservaMinima || 0));
    var neutro = round2(+mes.aportesNeutro || 0);
    var bruto = round2(saldo - (ainda == null ? 0 : ainda) - contas - reserva - neutro);
    return {
      saldoRealizado: saldo,
      despesasAinda: ainda,
      contasPrevistas: contas,
      reservaMinima: reserva,
      aportesNeutro: neutro,
      aportesDespesa: round2(+mes.aportesDespesa || 0),
      aportesHub: round2(+mes.aportesHub || 0),
      sugerido: bruto > 0 ? bruto : 0,
      bruto: bruto,
      semOrcamento: desp.estimado == null
    };
  }

  function topCategorias(cats, n) {
    var lista = (cats || []).slice().sort(function (a, b) { return (b.realizado || 0) - (a.realizado || 0); });
    var top = lista.slice(0, n || 6);
    var resto = lista.slice(n || 6);
    var outras = null;
    if (resto.length) {
      outras = {
        qtd: resto.length,
        estimado: round2(resto.reduce(function (s, c) { return s + (c.estimado || 0); }, 0)),
        realizado: round2(resto.reduce(function (s, c) { return s + (c.realizado || 0); }, 0))
      };
    }
    return { top: top, outras: outras };
  }

  function mesParaPortal(m, aportesHub) {
    m = m || {};
    var cats = (m.categorias || []).map(function (c) {
      return {
        nome: (redigir(c.nome) || "Categoria").slice(0, 60),
        estimado: c.estimado == null ? null : round2(c.estimado),
        realizado: round2(c.realizado || 0)
      };
    });
    var contas = (m.contasPrevistas || []).map(function (x) {
      return { rotulo: (redigir(x.rotulo) || "Conta prevista").slice(0, 80), valor: round2(x.valor || 0) };
    }).filter(function (x) { return x.valor > 0; });
    var receitas = m.receitas || {};
    var despesas = m.despesas || {};
    return {
      ym: m.ym || "",
      fonte: "Meuvista",
      atualizadoEm: m.atualizadoEm || null,
      receitas: { estimado: receitas.estimado == null ? null : round2(receitas.estimado), realizado: round2(receitas.realizado || 0) },
      despesas: { estimado: despesas.estimado == null ? null : round2(despesas.estimado), realizado: round2(despesas.realizado || 0) },
      saldoRealizado: round2(m.saldoRealizado || 0),
      saldoEstimado: m.saldoEstimado == null ? null : round2(m.saldoEstimado),
      categorias: cats,
      contasPrevistas: contas,
      aportesDespesa: round2(m.aportesDespesa || 0),
      aportesNeutro: round2(m.aportesNeutro || 0),
      aportesHub: round2(aportesHub != null ? aportesHub : m.aportesHub || 0)
    };
  }

  var TP_MACRO = { cdb: "rf", lci: "rf", lca: "rf", lc: "rf", cri: "rf", cra: "rf", tesouro: "rf", deb: "rf", debi: "rf", fundo_rf: "rf", fundo_mm: "rf", fundo_camb: "rf", coe: "rf", poupanca: "rf", acao: "rv", fii: "rv", fiagro: "rv", fip: "rv", etf_br: "rv", bdr: "rv", fundo_acoes: "rv", ouro: "rv", fundo_infra: "rv", stock_us: "ext", etf_int: "ext", etf_eu: "ext", reit: "ext", bond_intl: "ext", fundo_mm_intl: "ext", caixa: "caixa", cripto: "cripto", prev: "prev" };
  var MACRO_LBL = { rf: "Renda Fixa", rv: "Renda Variável", ext: "Exterior", prev: "Previdência", caixa: "Caixa", cripto: "Cripto", outros: "Outros" };
  var MACRO_ORDEM = ["rf", "rv", "ext", "prev", "caixa", "cripto", "outros"];

  function alocacaoDeAtivos(ativos) {
    var buckets = {};
    var total = 0;
    (ativos || []).forEach(function (a) {
      if (!a) return;
      var v = +a.posR || ((+a.qtd || 0) * (+a.pa || 0)) || 0;
      if (!(v > 0)) return;
      var mk = TP_MACRO[a.tp] || "outros";
      buckets[mk] = round2((buckets[mk] || 0) + v);
      total = round2(total + v);
    });
    return MACRO_ORDEM.filter(function (k) { return buckets[k] > 0; }).map(function (k) {
      return { nome: MACRO_LBL[k], valor: buckets[k], pct: total ? Math.round(buckets[k] / total * 1000) / 10 : 0 };
    });
  }

  function aportesHubNoMes(cliente, ym) {
    var s = 0;
    var movs = (cliente && cliente.movimentacoes) || [];
    movs.forEach(function (m) {
      if (!m || m.tipo !== "aporte") return;
      if (String(m.data || "").slice(0, 7) !== ym) return;
      s = round2(s + (+m.valor || 0));
    });
    return s;
  }

  function projetarPortal(cliente, extra) {
    extra = extra || {};
    var c = cliente || {};
    var cf = c.controleFinanceiro || {};
    var email = String(c.emailAcesso || "").trim().toLowerCase();
    var meses = {};
    Object.keys(cf.meses || {}).sort().forEach(function (ym) {
      var hub = extra.aportesHubPorMes && extra.aportesHubPorMes[ym] != null ? extra.aportesHubPorMes[ym] : aportesHubNoMes(c, ym);
      meses[ym] = mesParaPortal(cf.meses[ym], hub);
    });
    var pat = extra.patrimonioTotal != null ? round2(extra.patrimonioTotal) : round2(c.patGorila || c.pat || 0);
    var rent = extra.rent || null;
    var dados = extra.dadosAte || null;
    return {
      acessoAtivo: !!(c.acessoClienteAtivo && email),
      email: email,
      clientId: String(c.id || ""),
      nome: redigir(c.nome || "Cliente").slice(0, 80) || "Cliente",
      atualizadoEm: extra.atualizadoEm || new Date().toISOString(),
      patrimonio: {
        total: pat,
        dadosAte: dados && dados.iso ? String(dados.iso).slice(0, 10) : null,
        fonte: dados && dados.fonte ? String(dados.fonte).slice(0, 40) : null,
        rentMesPct: rent && rent.gorila && typeof rent.v === "number" ? round2(rent.v) : null,
        rentEstimado: !!(rent && rent.estimado),
        alocacao: extra.alocacao || alocacaoDeAtivos(c._ativosImport)
      },
      reservaMinima: round2(Math.max(0, +cf.reservaMinima || 0)),
      meses: meses
    };
  }

  function rotuloMes(ym) {
    var p = String(ym || "").split("-");
    var i = +p[1] - 1;
    if (!p[0] || i < 0 || i > 11) return ym || "";
    return MESES[i] + "/" + p[0];
  }

  function contemDocumento(valor) {
    var s = JSON.stringify(valor);
    if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(s)) return true;
    if (/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(s)) return true;
    return false;
  }

  return {
    round2: round2,
    fold: fold,
    redigir: redigir,
    parseCsv: parseCsv,
    numPt: numPt,
    mesVazio: mesVazio,
    aplicarExtrato: aplicarExtrato,
    aplicarOrcamento: aplicarOrcamento,
    calcularAporte: calcularAporte,
    topCategorias: topCategorias,
    mesParaPortal: mesParaPortal,
    alocacaoDeAtivos: alocacaoDeAtivos,
    aportesHubNoMes: aportesHubNoMes,
    projetarPortal: projetarPortal,
    rotuloMes: rotuloMes,
    contemDocumento: contemDocumento,
    FORMULA: "saldo realizado do mês − despesas do orçamento que ainda não foram lançadas − contas previstas até o fim do mês − reserva mínima − transferências neutras para investimento. O resultado negativo vira zero. Receita que ainda não entrou não entra na conta."
  };
});
