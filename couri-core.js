/* Couri Mile$ — núcleo financeiro e de validação.
   Sem DOM, sem Firebase e sem rede. O HTML do app delega para cá. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CouriCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var TYPES = { compra: 1, venda: 1, uso: 1, transferencia: 1 };
  var ROLES = { out: 1, in: 1, boomerang: 1 };

  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function round2(v) {
    return Math.round(num(v) * 100) / 100;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function transferRole(tx) {
    if (!tx || tx.type !== 'transferencia') return null;
    if (ROLES[tx.transferRole]) return tx.transferRole;
    if (tx.isBoomerang === true) return 'boomerang';
    var desc = String(tx.description || '');
    if (desc.charAt(0) === '\u2197') return 'out';
    if (desc.charAt(0) === '\u2199') return 'in';
    if (desc.charAt(0) === '\u21a9') return 'boomerang';
    var low = desc.toLowerCase();
    if (low.indexOf('bumerangue') !== -1) return 'boomerang';
    if (low.indexOf('saída') !== -1 || low.indexOf('saida') !== -1) return 'out';
    if (low.indexOf('entrada') !== -1) return 'in';
    return null;
  }

  function migrateTransaction(tx) {
    if (!tx || typeof tx !== 'object') return tx;
    if (!Number.isFinite(Number(tx.id))) tx.id = Date.now() + Math.floor(Math.random() * 1000000);
    else tx.id = Number(tx.id);
    tx.miles = Math.max(0, Math.round(num(tx.miles)));
    tx.cost = Math.max(0, round2(tx.cost));
    tx.savedValue = Math.max(0, round2(tx.savedValue));
    if (typeof tx.description !== 'string') tx.description = tx.description == null ? '' : String(tx.description);
    tx.description = tx.description.slice(0, 500);
    if (tx.type === 'transferencia') {
      var role = transferRole(tx);
      if (role && !ROLES[tx.transferRole]) tx.transferRole = role;
      if (tx.transferRole === 'boomerang') tx.isBoomerang = true;
    }
    return tx;
  }

  function replayLedger(transactions, programIds) {
    var bals = {};
    (programIds || []).forEach(function (id) { bals[id] = 0; });
    var list = (transactions || []).map(function (tx, index) { return { tx: tx, index: index }; });
    list.sort(function (a, b) {
      var da = String(a.tx.date || '');
      var db = String(b.tx.date || '');
      if (da !== db) return da < db ? -1 : 1;
      var ia = Number(a.tx.id);
      var ib = Number(b.tx.id);
      if (Number.isFinite(ia) && Number.isFinite(ib) && ia !== ib) return ia - ib;
      return a.index - b.index;
    });
    list.forEach(function (item) {
      var tx = item.tx;
      var id = tx.program;
      if (!id) return;
      if (bals[id] === undefined) bals[id] = 0;
      var miles = num(tx.miles);
      if (tx.type === 'compra') bals[id] += miles;
      else if (tx.type === 'venda' || tx.type === 'uso') bals[id] -= miles;
      else if (tx.type === 'transferencia') {
        var role = transferRole(tx);
        if (role === 'out') bals[id] -= miles;
        else if (role === 'in' || role === 'boomerang') bals[id] += miles;
      }
    });
    return bals;
  }

  function ensureAdjustments(state, programIds) {
    if (state.balanceAdjustments && typeof state.balanceAdjustments === 'object') return state.balanceAdjustments;
    var ledger = replayLedger(state.transactions, programIds);
    state.balanceAdjustments = {};
    (programIds || []).forEach(function (id) {
      var delta = num(state.balances && state.balances[id]) - num(ledger[id]);
      if (delta !== 0) state.balanceAdjustments[id] = delta;
    });
    return state.balanceAdjustments;
  }

  function applyLedgerWithAdjustments(state, programIds) {
    ensureAdjustments(state, programIds);
    var ledger = replayLedger(state.transactions, programIds);
    if (!state.balances || typeof state.balances !== 'object') state.balances = {};
    (programIds || []).forEach(function (id) {
      state.balances[id] = num(ledger[id]) + num(state.balanceAdjustments[id]);
    });
    return state.balances;
  }

  function deleteTransaction(state, id, programIds) {
    ensureAdjustments(state, programIds);
    state.transactions = (state.transactions || []).filter(function (tx) { return tx.id !== id; });
    return applyLedgerWithAdjustments(state, programIds);
  }

  function programAcquisition(state, progId) {
    var txs = (state.transactions || []).filter(function (t) { return t.program === progId; });
    var spentBuy = 0;
    var spentIn = 0;
    var milesBuy = 0;
    var milesIn = 0;
    var milesBoom = 0;
    txs.forEach(function (t) {
      if (t.type === 'compra') {
        spentBuy += num(t.cost);
        milesBuy += num(t.miles);
      } else if (t.type === 'transferencia') {
        var role = transferRole(t);
        if (role === 'in') {
          milesIn += num(t.miles);
          if (num(t.cost) > 0) spentIn += num(t.cost);
        } else if (role === 'boomerang') milesBoom += num(t.miles);
      }
    });
    var totalMilesAcquired = milesBuy + milesIn + milesBoom;
    var totalSpentOriginal = spentBuy + spentIn;
    var avgCostPerMile = totalMilesAcquired > 0 ? totalSpentOriginal / totalMilesAcquired : 0;
    var avgCostPerK = avgCostPerMile * 1000;
    var currentBalance = num(state.balances && state.balances[progId]);
    return {
      totalSpent: Math.max(0, round2(avgCostPerMile * Math.max(0, currentBalance))),
      totalMiles: totalMilesAcquired,
      avgCostPerMile: currentBalance > 0 ? avgCostPerMile : 0,
      avgCostPerK: currentBalance > 0 ? avgCostPerK : 0,
      currentBalance: currentBalance,
      historicCPK: avgCostPerK
    };
  }

  function originCostPerMile(state, progId) {
    return programAcquisition(state, progId).historicCPK / 1000;
  }

  function cashSpent(txs) {
    return (txs || []).reduce(function (sum, t) {
      return t.type === 'compra' ? sum + num(t.cost) : sum;
    }, 0);
  }

  function consolidatedAcquiredMiles(txs) {
    var miles = 0;
    (txs || []).forEach(function (t) {
      var m = num(t.miles);
      if (t.type === 'compra') miles += m;
      else if (t.type === 'transferencia') {
        var role = transferRole(t);
        if (role === 'out') miles -= m;
        else if (role === 'in' || role === 'boomerang') miles += m;
      }
    });
    return Math.max(0, miles);
  }

  function consolidatedAvgCostPerK(txs) {
    var miles = consolidatedAcquiredMiles(txs);
    if (miles <= 0) return 0;
    return (cashSpent(txs) / miles) * 1000;
  }

  function fingerprint(tx) {
    var role = transferRole(tx) || '';
    var desc = String(tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ');
    var val = tx.type === 'uso' ? num(tx.savedValue) : num(tx.cost);
    return [
      tx.program || '',
      String(tx.date || '').slice(0, 10),
      tx.type || '',
      role,
      String(Math.round(num(tx.miles))),
      val.toFixed(2),
      desc
    ].join('|');
  }

  function parseBonus(raw) {
    if (raw === '' || raw == null) return 0;
    var s = String(raw).trim().replace('%', '');
    if (!s || s.toLowerCase() === 'none') return 0;
    var v = parseFloat(s.replace(',', '.'));
    if (!Number.isFinite(v) || v <= 0) return 0;
    var pct = v <= 3 ? v * 100 : v;
    return Math.max(0, Math.min(300, Math.round(pct)));
  }

  function parseFlexDate(str) {
    if (str == null || str === '') return null;
    if (str instanceof Date) {
      if (isNaN(str.getTime())) return null;
      return str.toISOString().slice(0, 10);
    }
    if (typeof str === 'number' && str > 20000 && str < 80000) {
      var ms = Date.UTC(1970, 0, 1) + Math.round(str - 25569) * 86400000;
      var asDate = new Date(ms);
      if (!isNaN(asDate.getTime())) return asDate.toISOString().slice(0, 10);
    }
    var s = String(str).trim();
    var iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return iso[1] + '-' + iso[2].padStart(2, '0') + '-' + iso[3].padStart(2, '0');
    var br = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (br) {
      var y = br[3].length === 2 ? '20' + br[3] : br[3];
      return y + '-' + br[2].padStart(2, '0') + '-' + br[1].padStart(2, '0');
    }
    return null;
  }

  function dateClamped(year, monthIndex, day) {
    var last = new Date(year, monthIndex + 1, 0).getDate();
    return new Date(year, monthIndex, Math.min(Math.max(1, day), last));
  }

  function addMonthsClamped(date, count, day) {
    var total = date.getMonth() + count;
    var year = date.getFullYear() + Math.floor(total / 12);
    var month = ((total % 12) + 12) % 12;
    return dateClamped(year, month, day);
  }

  function parseISODate(s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return new Date(NaN);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function formatISODate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function recurringDates(r, now) {
    var day = Math.min(31, Math.max(1, parseInt(r.day, 10) || 1));
    var start = parseISODate(r.startDate || '2025-01-01');
    if (isNaN(start.getTime())) start = parseISODate('2025-01-01');
    var cursor;
    if (r.lastProcessed) {
      var last = parseISODate(r.lastProcessed);
      if (isNaN(last.getTime())) return [];
      cursor = addMonthsClamped(last, 1, day);
    } else {
      cursor = dateClamped(start.getFullYear(), start.getMonth(), day);
      if (cursor < start) cursor = addMonthsClamped(cursor, 1, day);
    }
    var out = [];
    var guard = 0;
    while (cursor <= now && guard < 240) {
      out.push(formatISODate(cursor));
      cursor = addMonthsClamped(cursor, 1, day);
      guard++;
    }
    return out;
  }

  function nextRecurringDate(r, now) {
    var day = Math.min(31, Math.max(1, parseInt(r.day, 10) || 1));
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var candidate = dateClamped(today.getFullYear(), today.getMonth(), day);
    if (candidate <= today) candidate = addMonthsClamped(candidate, 1, day);
    return formatISODate(candidate);
  }

  function shouldWriteCloud(loadStatus) {
    return loadStatus === 'ok' || loadStatus === 'empty';
  }

  function storageKey(uid) {
    return uid ? 'miles-control:uid:' + uid : 'miles-control:offline';
  }

  function adminFromClientEmail() {
    return false;
  }

  function validateEntry(entry, balances) {
    var errors = [];
    var miles = num(entry.miles);
    if (!(miles > 0) || Math.round(miles) !== miles) errors.push('Informe uma quantidade inteira de milhas maior que zero.');
    if (num(entry.cost) < 0 || num(entry.savedValue) < 0) errors.push('Valor não pode ser negativo.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date || ''))) errors.push('Data inválida.');
    if (!TYPES[entry.type]) errors.push('Tipo de lançamento inválido.');
    var available = num(balances && balances[entry.program]);
    if ((entry.type === 'venda' || entry.type === 'uso' || entry.transferRole === 'out') && miles > available) {
      errors.push('Saldo insuficiente.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function sanitizeCloudState(data, programIds, defaultMarket) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'Documento inválido.' };
    var ids = programIds || [];
    var state = {
      transactions: [],
      balances: {},
      marketValues: JSON.parse(JSON.stringify(defaultMarket || {})),
      recurring: [],
      balanceAdjustments: {},
      schemaVersion: 2
    };
    if (Array.isArray(data.transactions)) {
      data.transactions.forEach(function (t) {
        if (!t || typeof t !== 'object' || ids.indexOf(t.program) === -1) return;
        if (!TYPES[t.type]) return;
        var tx = {
          id: Number.isFinite(Number(t.id)) ? Number(t.id) : Date.now() + Math.floor(Math.random() * 1000000),
          date: /^\d{4}-\d{2}-\d{2}/.test(String(t.date || '')) ? String(t.date).slice(0, 10) : '2026-01-01',
          program: t.program,
          type: t.type,
          miles: Math.max(0, Math.round(num(t.miles))),
          cost: Math.max(0, round2(t.cost)),
          savedValue: Math.max(0, round2(t.savedValue)),
          description: String(t.description || '').slice(0, 500),
          costPerK: num(t.costPerK)
        };
        ['transferTo', 'transferFrom', 'transferRole', 'transferMode', 'transferLinkedMiles', 'transferredCost', 'isBoomerang', 'isOrganic', 'acumuloOrigin', 'usoType', 'usoCostTotal', 'usoCostPerK', 'acquisitionCost', 'saleProfit', 'imported', 'isRecurring'].forEach(function (key) {
          if (t[key] !== undefined) tx[key] = t[key];
        });
        migrateTransaction(tx);
        state.transactions.push(tx);
      });
    }
    ids.forEach(function (id) {
      state.balances[id] = num(data.balances && data.balances[id]);
    });
    if (data.marketValues && typeof data.marketValues === 'object') {
      ids.forEach(function (id) {
        var mv = data.marketValues[id];
        if (!mv || typeof mv !== 'object') return;
        var base = state.marketValues[id] || {};
        state.marketValues[id] = {
          perK: num(mv.perK != null ? mv.perK : base.perK),
          currency: mv.currency === 'EUR' || mv.currency === 'USD' || mv.currency === 'BRL' ? mv.currency : (base.currency || 'BRL'),
          label: String(mv.label != null ? mv.label : (base.label || '')).slice(0, 80),
          note: String(mv.note != null ? mv.note : (base.note || '')).slice(0, 180)
        };
        if (mv.euroRate != null) state.marketValues[id].euroRate = num(mv.euroRate);
        if (mv.usdRate != null) state.marketValues[id].usdRate = num(mv.usdRate);
      });
    }
    if (Array.isArray(data.recurring)) {
      data.recurring.forEach(function (r) {
        if (!r || ids.indexOf(r.program) === -1) return;
        state.recurring.push({
          program: r.program,
          day: Math.min(31, Math.max(1, parseInt(r.day, 10) || 1)),
          miles: Math.max(0, Math.round(num(r.miles))),
          cost: Math.max(0, round2(r.cost)),
          description: String(r.description || 'Recorrente').slice(0, 200),
          startDate: /^\d{4}-\d{2}-\d{2}/.test(String(r.startDate || '')) ? String(r.startDate).slice(0, 10) : '2025-01-01',
          active: r.active !== false,
          lastProcessed: /^\d{4}-\d{2}-\d{2}/.test(String(r.lastProcessed || '')) ? String(r.lastProcessed).slice(0, 10) : null
        });
      });
    }
    if (data.balanceAdjustments && typeof data.balanceAdjustments === 'object') {
      ids.forEach(function (id) {
        if (data.balanceAdjustments[id] !== undefined) state.balanceAdjustments[id] = num(data.balanceAdjustments[id]);
      });
    } else {
      var ledger = replayLedger(state.transactions, ids);
      ids.forEach(function (id) {
        var delta = num(state.balances[id]) - num(ledger[id]);
        if (delta !== 0) state.balanceAdjustments[id] = delta;
      });
    }
    return { ok: true, state: state };
  }

  return {
    num: num,
    round2: round2,
    escapeHtml: escapeHtml,
    transferRole: transferRole,
    migrateTransaction: migrateTransaction,
    replayLedger: replayLedger,
    ensureAdjustments: ensureAdjustments,
    applyLedgerWithAdjustments: applyLedgerWithAdjustments,
    deleteTransaction: deleteTransaction,
    programAcquisition: programAcquisition,
    originCostPerMile: originCostPerMile,
    cashSpent: cashSpent,
    consolidatedAcquiredMiles: consolidatedAcquiredMiles,
    consolidatedAvgCostPerK: consolidatedAvgCostPerK,
    fingerprint: fingerprint,
    parseBonus: parseBonus,
    parseFlexDate: parseFlexDate,
    dateClamped: dateClamped,
    recurringDates: recurringDates,
    nextRecurringDate: nextRecurringDate,
    formatISODate: formatISODate,
    shouldWriteCloud: shouldWriteCloud,
    storageKey: storageKey,
    adminFromClientEmail: adminFromClientEmail,
    validateEntry: validateEntry,
    sanitizeCloudState: sanitizeCloudState
  };
});
