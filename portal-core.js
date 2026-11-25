/* Courinvest Hub v563 — controle financeiro (Meuvista) e projeção do Painel do Cliente.
   v563: subcategorias por orçamento (orçado × realizado, estouro) e patrimônio por instituição.
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

  /* v563: total por orçamento › categoria (só o nome da categoria do Meuvista e a soma; nada de descrição). */
  function somarSub(mapa, orc, cat, valor) {
    var o = (redigir(orc) || "Despesa não Categorizada").slice(0, 60);
    var c = (redigir(cat) || "Sem subcategoria").slice(0, 60);
    if (!mapa[o]) mapa[o] = {};
    mapa[o][c] = round2((mapa[o][c] || 0) + valor);
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
    var acc = { receitas: 0, despesas: 0, aportesDespesa: 0, aportesNeutro: 0, qtdReceitas: 0, qtdDespesas: 0, qtdNeutros: 0, qtdIgnorados: 0, fora: 0, subcategorias: {} };
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
        somarSub(acc.subcategorias, orc, cat, abs);
      } else if (valor < 0) {
        acc.despesas = round2(acc.despesas + abs);
        acc.qtdDespesas++;
        somarSub(acc.subcategorias, orc, cat, abs);
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
    var ultimaCat = null;
    parsed.forEach(function (p) {
      if (!p.nome) return;
      if (temNivelOrc && p.nivel && p.nivel !== "orcamento") {
        /* v563: linha de nível Categoria logo abaixo de um orçamento vira subcategoria com orçado e realizado. */
        if (ultimaCat && /categoria/.test(p.nivel)) {
          ultimaCat.subcategorias = ultimaCat.subcategorias || [];
          ultimaCat.subcategorias.push({ nome: redigir(p.nome).slice(0, 60) || "Subcategoria", estimado: p.estimado, realizado: p.realizado || 0 });
        }
        return;
      }
      ultimaCat = null;
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
      ultimaCat = { nome: redigir(p.nome).slice(0, 60) || "Categoria", estimado: est, realizado: rea };
      cats.push(ultimaCat);
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

  function estouro(estimado, realizado) {
    if (estimado == null || !(estimado > 0)) return 0;
    var d = round2((realizado || 0) - estimado);
    return d > 0.009 ? d : 0;
  }

  /* v563: junta as subcategorias do orçamento (com orçado) e as do extrato (realizado por categoria).
     Se o orçamento trouxe a subcategoria, o realizado dele vale; o extrato completa o que faltar. */
  function detalharCategorias(m) {
    m = m || {};
    var doExtrato = (m.extrato && m.extrato.subcategorias) || {};
    var usados = {};
    var lista = (m.categorias || []).map(function (c) {
      var nome = (redigir(c.nome) || "Categoria").slice(0, 60);
      var est = c.estimado == null ? null : round2(c.estimado);
      var rea = round2(c.realizado || 0);
      var porNome = {};
      var subs = [];
      (c.subcategorias || []).forEach(function (s) {
        var n = (redigir(s.nome) || "Subcategoria").slice(0, 60);
        var item = { nome: n, estimado: s.estimado == null ? null : round2(s.estimado), realizado: round2(s.realizado || 0) };
        porNome[fold(n)] = item;
        subs.push(item);
      });
      var chaveEx = null;
      Object.keys(doExtrato).forEach(function (k) { if (fold(k) === fold(nome)) chaveEx = k; });
      if (chaveEx) {
        usados[chaveEx] = 1;
        Object.keys(doExtrato[chaveEx]).forEach(function (sn) {
          var f = fold(sn);
          if (porNome[f]) return;
          var item = { nome: sn, estimado: null, realizado: round2(doExtrato[chaveEx][sn]) };
          porNome[f] = item;
          subs.push(item);
        });
      }
      subs.forEach(function (s) { s.estourou = estouro(s.estimado, s.realizado); });
      subs.sort(function (a, b) { return (b.estourou > 0) - (a.estourou > 0) || (b.realizado || 0) - (a.realizado || 0); });
      subs = subs.filter(function (s) { return (s.realizado || 0) > 0 || (s.estimado || 0) > 0; });
      return { nome: nome, estimado: est, realizado: rea, estourou: estouro(est, rea), subcategorias: subs };
    });
    return lista;
  }

  /* v563: a taxa da Courinvest nunca aparece no painel do cliente (pedido do Igor).
     A subcategoria some e o valor dela sai do realizado da categoria. O orçado da categoria
     perde a mesma quantia (até zero), para não sobrar um "Resta" que é a própria taxa.
     Categoria que fica sem nada (só tinha a taxa) sai da lista. Os totais do mês não mudam,
     então receitas, despesas, saldo e a sugestão de aporte continuam batendo com o Meuvista. */
  function ehTaxaCourinvest(nome) {
    return /couri?invest/.test(fold(nome).replace(/[^a-z]/g, ""));
  }

  function semTaxaCourinvest(cats) {
    return (cats || []).filter(function (c) { return !ehTaxaCourinvest(c.nome); }).map(function (c) {
      var taxa = 0;
      var subs = (c.subcategorias || []).filter(function (s) {
        if (!ehTaxaCourinvest(s.nome)) return true;
        taxa = round2(taxa + (s.realizado || 0));
        return false;
      });
      if (!taxa && subs.length === (c.subcategorias || []).length) return c;
      var rea = round2(Math.max(0, (c.realizado || 0) - taxa));
      var est = c.estimado == null ? null : round2(Math.max(0, c.estimado - taxa));
      return { nome: c.nome, estimado: est, realizado: rea, estourou: estouro(est, rea), subcategorias: subs, _semTaxa: true };
    }).filter(function (c) {
      if (!c._semTaxa) return true;
      return (c.realizado || 0) > 0.009 || c.subcategorias.length > 0;
    }).map(function (c) { delete c._semTaxa; return c; });
  }

  function mesParaPortal(m, aportesHub) {
    m = m || {};
    var cats = semTaxaCourinvest(detalharCategorias(m));
    var contas = (m.contasPrevistas || []).map(function (x) {
      var rot = redigir(x.rotulo) || "Conta prevista";
      if (ehTaxaCourinvest(rot)) rot = "Conta prevista";
      return { rotulo: rot.slice(0, 80), valor: round2(x.valor || 0) };
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

  /* v563: patrimônio por instituição (campo inst da importação do Gorila), com os ativos de cada uma.
     Posição no exterior ganha a marca "exterior" ao lado da instituição (ex.: Inter · exterior). */
  function nomeInstituicao(a) {
    var raw = String((a && (a.inst || a.instituicao || a.corretora)) || "").trim();
    var nome = redigir(raw).slice(0, 40);
    if (!nome || fold(nome) === "diversos") nome = "Outras";
    var ext = TP_MACRO[a.tp] === "ext" || /exterior/.test(fold(a._gClasse || ""));
    if (ext && fold(nome).indexOf("exterior") < 0 && fold(nome) !== "avenue") nome = nome + " · exterior";
    return nome;
  }

  function instituicoesDeAtivos(ativos) {
    var grupos = {};
    var total = 0;
    (ativos || []).forEach(function (a) {
      if (!a || a._liquidado) return;
      if (/^portfolio total$/.test(fold(a.tk || ""))) return;
      var v = +a.posR || ((+a.qtd || 0) * (+a.pa || 0)) || 0;
      if (!(v > 0)) return;
      v = round2(v);
      var nome = nomeInstituicao(a);
      if (!grupos[nome]) grupos[nome] = { nome: nome, valor: 0, ativos: [] };
      grupos[nome].valor = round2(grupos[nome].valor + v);
      grupos[nome].ativos.push({
        nome: (redigir(a.nm || a.nome || a.tk || "Ativo").replace(/\s+-\s*$/, "").slice(0, 70) || "Ativo"),
        classe: MACRO_LBL[TP_MACRO[a.tp] || "outros"],
        valor: v
      });
      total = round2(total + v);
    });
    return Object.keys(grupos).map(function (k) {
      var g = grupos[k];
      g.pct = total ? Math.round(g.valor / total * 1000) / 10 : 0;
      g.ativos.sort(function (x, y) { return y.valor - x.valor; });
      g.ativos.forEach(function (x) { x.pct = g.valor ? Math.round(x.valor / g.valor * 1000) / 10 : 0; });
      g.qtd = g.ativos.length;
      return g;
    }).sort(function (x, y) { return y.valor - x.valor; });
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

  function chaveAtivo(a) {
    if (!a) return "";
    var tk = fold(a.tk || "");
    var nm = fold(a.nm || a.nome || "");
    if (tk && tk.length <= 12 && tk.indexOf(" ") < 0) return tk;
    return nm || tk;
  }

  function linksDoObjetivo(obj) {
    obj = obj || {};
    if (Array.isArray(obj.alocacoes) && obj.alocacoes.length) {
      return obj.alocacoes.map(function (l) {
        var pct = +l.pct;
        if (!isFinite(pct)) pct = 0;
        pct = Math.max(0, Math.min(100, pct));
        return {
          chave: fold(l.chave || l.tk || l.nome),
          tk: String(l.tk || ""),
          nome: String(l.nome || l.tk || "Ativo"),
          pct: round2(pct)
        };
      }).filter(function (l) { return l.chave && l.pct > 0; });
    }
    return (obj.ativosVinculados || []).map(function (tk) {
      return { chave: fold(tk), tk: String(tk), nome: String(tk), pct: 100 };
    }).filter(function (l) { return l.chave; });
  }

  function valorPosicao(a) {
    if (!a) return 0;
    var v = +a.posR;
    if (!(v > 0)) v = +a.valor;
    if (!(v > 0)) v = +a.vA;
    if (!(v > 0)) v = (+a.qtd || 0) * (+a.pa || 0);
    return round2(v > 0 ? v : 0);
  }

  function acharAtivo(ativos, link) {
    var chaves = {};
    [link.chave, link.tk, link.nome].forEach(function (x) { var f = fold(x); if (f) chaves[f] = 1; });
    var lista = ativos || [];
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      var candidatos = [chaveAtivo(a), fold(a.tk), fold(a.nm || a.nome)];
      for (var j = 0; j < candidatos.length; j++) {
        if (candidatos[j] && chaves[candidatos[j]]) return a;
      }
    }
    return null;
  }

  function mesesDoObjetivo(obj, hoje) {
    if (!obj || obj.semPrazo) return null;
    if (!(obj.dataAlvo) && !(+obj.prazoMeses > 0)) return null;
    if (obj.dataAlvo) {
      var bruto = String(obj.dataAlvo).slice(0, 10);
      var d = new Date(bruto + "T12:00:00");
      if (isNaN(d.getTime())) return null;
      var m = (d.getFullYear() - hoje.getFullYear()) * 12 + (d.getMonth() - hoje.getMonth());
      return Math.max(1, m);
    }
    return Math.max(1, Math.round(+obj.prazoMeses));
  }

  function aporteComTaxa(falta, atual, alvo, meses, taxaPct) {
    var r = (+taxaPct || 0) / 100;
    if (!(r > 0) || !(meses > 0) || !(falta > 0)) return null;
    var cresce = round2((+atual || 0) * Math.pow(1 + r, meses));
    var buraco = round2((+alvo || 0) - cresce);
    if (buraco <= 0) return 0;
    var fator = (Math.pow(1 + r, meses) - 1) / r;
    if (!(fator > 0)) return null;
    return round2(buraco / fator);
  }

  function avaliarObjetivo(obj, ativos, opts) {
    opts = opts || {};
    obj = obj || {};
    var hoje = opts.hoje ? new Date(opts.hoje) : new Date();
    var links = obj.modo === "manual" ? [] : linksDoObjetivo(obj);
    var atual = 0;
    var vinculos = [];
    if (obj.modo === "manual") atual = round2(+obj.acumuladoManual || 0);
    else links.forEach(function (l) {
      var a = acharAtivo(ativos, l);
      var cheio = a ? valorPosicao(a) : 0;
      var parte = round2(cheio * l.pct / 100);
      atual = round2(atual + parte);
      vinculos.push({
        nome: (redigir(a ? (a.nm || a.nome || a.tk) : l.nome).slice(0, 80) || "Ativo"),
        pct: l.pct,
        valor: parte,
        ausente: !a
      });
    });
    var alvo = round2(+obj.alvo || 0);
    var falta = round2(Math.max(0, alvo - atual));
    var progresso = alvo > 0 ? Math.round(Math.min(100, atual / alvo * 100) * 10) / 10 : 0;
    var meses = mesesDoObjetivo(obj, hoje);
    var semPrazo = meses == null;
    var aporte = !semPrazo && falta > 0 ? round2(falta / meses) : 0;
    var taxa = opts.taxaMensal != null ? +opts.taxaMensal : 0;
    var cor = /^#[0-9A-Fa-f]{6}$/.test(obj.cor || "") ? obj.cor : "#0F766E";
    return {
      id: String(obj.id || ""),
      nome: (redigir(obj.nome || "Objetivo").slice(0, 80) || "Objetivo"),
      icone: String(obj.icone || "🎯").slice(0, 4),
      cor: cor,
      prioridade: +obj.prioridade > 0 ? Math.round(+obj.prioridade) : 99,
      alvo: alvo,
      atual: atual,
      falta: falta,
      progresso: progresso,
      semPrazo: semPrazo,
      mesesRestantes: meses,
      aporteMensal: aporte,
      aporteComTaxa: aporteComTaxa(falta, atual, alvo, meses, taxa),
      taxaMensal: taxa > 0 ? round2(taxa) : null,
      vinculos: vinculos,
      reserva: fold(obj.nome || "").indexOf("reserva de emerg") >= 0
    };
  }

  function pctComprometido(objetivos, chave, ignorarId) {
    var alvo = fold(chave);
    if (!alvo) return 0;
    var s = 0;
    (objetivos || []).forEach(function (o) {
      if (ignorarId && o && o.id === ignorarId) return;
      linksDoObjetivo(o).forEach(function (l) {
        if (l.chave === alvo || fold(l.tk) === alvo || fold(l.nome) === alvo) s += l.pct;
      });
    });
    return round2(s);
  }

  function mediaDespesas(meses) {
    var vals = [];
    Object.keys(meses || {}).forEach(function (ym) {
      var d = meses[ym] && meses[ym].despesas && meses[ym].despesas.realizado;
      if (d > 0) vals.push(d);
    });
    if (!vals.length) return null;
    return round2(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
  }

  function sugerirAlvoReserva(media, nMeses) {
    var n = +nMeses > 0 ? +nMeses : 6;
    if (media == null) return null;
    return round2(media * n);
  }

  function dividirAporte(sugerido, avaliados) {
    var caixa = round2(Math.max(0, +sugerido || 0));
    var lista = (avaliados || []).slice().sort(function (a, b) {
      return (a.prioridade || 99) - (b.prioridade || 99) || String(a.nome).localeCompare(String(b.nome), "pt-BR");
    });
    var precisa = 0;
    lista.forEach(function (g) { if (!g.semPrazo && g.aporteMensal > 0) precisa = round2(precisa + g.aporteMensal); });
    var restante = caixa;
    var partes = lista.map(function (g) {
      var quer = !g.semPrazo && g.aporteMensal > 0 ? g.aporteMensal : 0;
      var vai = round2(Math.min(quer, restante));
      restante = round2(Math.max(0, restante - vai));
      return { nome: g.nome, prioridade: g.prioridade, precisa: quer, nesteMes: vai, semPrazo: !!g.semPrazo };
    });
    return { sugerido: caixa, precisa: precisa, sobra: restante, partes: partes, cobre: caixa + 0.009 >= precisa };
  }

  function avaliarObjetivos(cliente, opts) {
    opts = opts || {};
    var c = cliente || {};
    var taxa = opts.taxaMensal != null ? opts.taxaMensal : ((c.controleFinanceiro && c.controleFinanceiro.taxaMensalEstimada) || 0);
    var ativos = opts.ativos || c._ativosImport || [];
    return (c.objetivos || []).map(function (o) { return avaliarObjetivo(o, ativos, { taxaMensal: taxa, hoje: opts.hoje }); })
      .sort(function (a, b) { return a.prioridade - b.prioridade || a.nome.localeCompare(b.nome, "pt-BR"); });
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
        alocacao: extra.alocacao || alocacaoDeAtivos(c._ativosImport),
        porInstituicao: extra.porInstituicao || instituicoesDeAtivos(c._ativosImport)
      },
      reservaMinima: round2(Math.max(0, +cf.reservaMinima || 0)),
      taxaMensalEstimada: round2(Math.max(0, +cf.taxaMensalEstimada || 0)),
      meses: meses,
      objetivos: avaliarObjetivos(c),
      formulaAporteObjetivo: "aporte mensal sem rendimento = (valor-alvo − valor atual) ÷ meses restantes"
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
    instituicoesDeAtivos: instituicoesDeAtivos,
    detalharCategorias: detalharCategorias,
    semTaxaCourinvest: semTaxaCourinvest,
    aportesHubNoMes: aportesHubNoMes,
    projetarPortal: projetarPortal,
    chaveAtivo: chaveAtivo,
    linksDoObjetivo: linksDoObjetivo,
    avaliarObjetivo: avaliarObjetivo,
    avaliarObjetivos: avaliarObjetivos,
    pctComprometido: pctComprometido,
    mediaDespesas: mediaDespesas,
    sugerirAlvoReserva: sugerirAlvoReserva,
    dividirAporte: dividirAporte,
    rotuloMes: rotuloMes,
    contemDocumento: contemDocumento,
    FORMULA: "saldo realizado do mês − despesas do orçamento que ainda não foram lançadas − contas previstas até o fim do mês − reserva mínima − transferências neutras para investimento. O resultado negativo vira zero. Receita que ainda não entrou não entra na conta."
  };
});
