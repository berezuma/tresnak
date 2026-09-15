// Blokeen exekutatzailea: Blockly-ren JSON serializazioa zuzenean interpretatzen du (eval-ik gabe),
// eta horregatik Node-n ere proba daiteke. Hari bakoitza sorgailu (generator) bat da; blokeek hau ematen dute:
//   { mota: 'blokea', id }  bloke bat exekutatzera doa (nabarmendu; urratsez urrats, hemen gelditu)
//   { mota: 'itxaron', ms } ekintza batek denbora behar du (robotaren mugimendua, pausa bat)
//   { mota: 'tick' }        begizta baten itzulia (beste hariei txanda uzteko)
// Gailu bakoitzak (robota, Micro:bit, kontsola) bere blokeak eta "txapelak" (hat) gehitzen ditu.

export class ProgramaErrorea extends Error {
  // mota: 'errorea' (programa gaizki), 'hutsik' (pieza bat falta), 'muga' (ez da amaitzen), 'huts' (zeregina ez da bete)
  constructor(mezua, id = null, mota = 'errorea') { super(mezua); this.id = id; this.mota = mota; }
}

const TICK = { mota: 'tick' };
export const zenbakia = v => typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : (isFinite(parseFloat(v)) ? parseFloat(v) : 0);
const desgaituta = b => b.enabled === false || (Array.isArray(b.disabledReasons) && b.disabledReasons.length > 0);
export const fmtBalioa = v => typeof v === 'number'
  ? String(Number(v.toFixed(4))).replace('.', ',')
  : typeof v === 'boolean' ? (v ? 'egia' : 'gezurra') : String(v);

export const OINARRIZKOAK = {
  // ---------- balioak ----------
  math_number: { balioa: (x, b) => zenbakia(b.fields?.NUM) },
  logika_boolear: { balioa: (x, b) => b.fields?.BOOL !== 'GEZURRA' },
  logika_ez: { balioa: (x, b) => !x.egia(b, 'BOOL') },
  logika_eta_edo: { balioa: (x, b) => b.fields?.OP === 'EDO' ? (x.egia(b, 'A') || x.egia(b, 'B')) : (x.egia(b, 'A') && x.egia(b, 'B')) },
  logika_konparatu: {
    balioa(x, b) {
      const A = x.balioa(b, 'A'), B = x.balioa(b, 'B');
      const num = typeof A !== 'string' && typeof B !== 'string';
      const a = num ? zenbakia(A) : String(A), c = num ? zenbakia(B) : String(B);
      const berdin = num ? Math.abs(a - c) < 1e-9 : a === c;
      switch (b.fields?.OP) {
        case 'NEQ': return !berdin;
        case 'LT': return !berdin && a < c;
        case 'LTE': return berdin || a < c;
        case 'GT': return !berdin && a > c;
        case 'GTE': return berdin || a > c;
        default: return berdin;
      }
    }
  },
  mate_eragiketa: {
    balioa(x, b) {
      const a = zenbakia(x.balioa(b, 'A')), c = zenbakia(x.balioa(b, 'B'));
      switch (b.fields?.OP) {
        case 'KEN': return a - c;
        case 'BIDER': return a * c;
        case 'ZATI':
          if (c === 0) throw new ProgramaErrorea('Ezin da zeroz zatitu.', b.id);
          return a / c;
        case 'HONDARRA':
          if (c === 0) throw new ProgramaErrorea('Ezin da zeroz zatitu (mod).', b.id);
          return a % c;
        default: return a + c;
      }
    }
  },
  mate_ausazkoa: {
    balioa(x, b) {
      let a = Math.round(zenbakia(x.balioa(b, 'A'))), c = Math.round(zenbakia(x.balioa(b, 'B')));
      if (a > c) [a, c] = [c, a];
      return a + Math.floor(x.ausazkoa() * (c - a + 1));
    }
  },
  testua: { balioa: (x, b) => String(b.fields?.TEXT ?? '') },
  testu_lotu: { balioa: (x, b) => fmtBalioa(x.balioa(b, 'A')) + fmtBalioa(x.balioa(b, 'B')) },
  variables_get: { balioa: (x, b) => x.aldagaia(b) },

  // ---------- aginduak ----------
  variables_set: { *agindua(x, b) { x.ezarri(b, x.balioa(b, 'VALUE')); } },
  math_change: { *agindua(x, b) { x.ezarri(b, zenbakia(x.aldagaia(b)) + zenbakia(x.balioa(b, 'DELTA'))); } },
  kontrol_errepikatu: {
    *agindua(x, b) {
      const n = Math.floor(zenbakia(x.balioa(b, 'TIMES')));
      for (let i = 0; i < n; i++) { yield* x.pila(b, 'DO'); yield TICK; }
    }
  },
  kontrol_bitartean: { *agindua(x, b) { while (x.egia(b, 'BALDINTZA')) { yield* x.pila(b, 'DO'); yield TICK; } } },
  kontrol_arte: { *agindua(x, b) { while (!x.egia(b, 'BALDINTZA')) { yield* x.pila(b, 'DO'); yield TICK; } } },
  kontrol_betiko: { *agindua(x, b) { for (;;) { yield* x.pila(b, 'DO'); yield TICK; } } },
  kontrol_baldin: { *agindua(x, b) { if (x.egia(b, 'BALDINTZA')) yield* x.pila(b, 'DO'); } },
  kontrol_baldin_bestela: {
    *agindua(x, b) {
      if (x.egia(b, 'BALDINTZA')) yield* x.pila(b, 'DO');
      else yield* x.pila(b, 'BESTELA');
    }
  },
  kontrol_itxaron: { *agindua(x, b) { yield { mota: 'itxaron', ms: Math.max(0, zenbakia(x.balioa(b, 'MS'))) }; } }
};

export class Exekutatzailea {
  // blokeak: gailuaren blokeak { mota: { balioa(x, b) } | { *agindua(x, b) } }
  // hatak:   { mota: 'hasiera' | 'betiko' | (b) => 'gertaera:izena' }
  // muga:    gehienezko urratsak (begizta amaigabeak atzemateko)
  constructor({ blokeak = {}, hatak = {}, muga = Infinity, mugaMezua, ausazkoa = Math.random, gailua = null } = {}) {
    this.blokeak = { ...OINARRIZKOAK, ...blokeak };
    this.hatak = { ekitaldia_hasi: 'hasiera', ...hatak };
    this.muga = muga;
    this.mugaMezua = mugaMezua || 'Programak ez du amaierarik: begizta batek ez al du inoiz amaitzen?';
    this.ausazkoa = ausazkoa;
    this.gailua = gailua;
    this.entzuleak = {};
    this.goikoak = [];
    this.izenak = new Map();
    this.garbitu();
  }

  on(izena, cb) { (this.entzuleak[izena] ||= []).push(cb); return this; }
  emit(izena, ...args) { (this.entzuleak[izena] || []).forEach(cb => cb(...args)); }

  garbitu() {
    this.hariak = [];
    this.ordua = 0;
    this.urratsak = 0;
    this.egoera = 'geldi';
    this.aldagaiak = new Map();
    this.azkena = null;
    this.pausaka = false;
    this.betikoakHasita = false;
  }

  kargatu(json) {
    this.garbitu();
    this.izenak = new Map((json?.variables || []).map(v => [v.id, v.name]));
    this.goikoak = (json?.blocks?.blocks || []).filter(b => !desgaituta(b));
    return this;
  }

  hatMota(b) {
    const f = this.hatak[b.type];
    return f ? (typeof f === 'function' ? f(b) : f) : null;
  }
  txapelak(mota) { return this.goikoak.filter(b => this.hatMota(b) === mota); }
  entzuten() { return this.goikoak.some(b => String(this.hatMota(b)).startsWith('gertaera:')); }

  hasi({ pausaka = false } = {}) {
    const izenak = this.izenak, goikoak = this.goikoak;
    this.garbitu();
    this.izenak = izenak;
    this.goikoak = goikoak;
    this.pausaka = pausaka;
    this.egoera = 'martxan';
    this.emit('egoera', this.egoera);
    for (const b of this.txapelak('hasiera')) this.sortuHaria(b);
    this.egiaztatuAmaiera();
  }

  sortuHaria(top, betiko = false) {
    const x = this;
    const gen = (function* () {
      do {
        yield* x.pila(top, 'DO');
        if (betiko) yield { mota: 'itxaron', ms: 20 };
      } while (betiko);
    })();
    const h = { top, gen, esnatu: this.ordua, pausan: false, amaituta: false, mota: this.hatMota(top) };
    this.hariak.push(h);
    return h;
  }

  gertaera(izena) {
    if (this.egoera !== 'martxan') return;
    for (const b of this.txapelak('gertaera:' + izena)) {
      if (!this.hariak.some(h => h.top === b)) this.sortuHaria(b);
    }
  }

  gelditu() {
    if (this.egoera === 'geldi') return;
    this.hariak = [];
    this.egoera = 'geldi';
    this.emit('egoera', this.egoera);
  }
  urratsa() { for (const h of this.hariak) h.pausan = false; }
  jarraitu() { this.pausaka = false; this.urratsa(); }
  pausatu() { this.pausaka = true; }
  zain() { return this.hariak.some(h => h.pausan); }

  // Denbora aurreratu (ms) eta hariak exekutatu, itxaron edo pausatu arte
  aurreratu(dt = 0) {
    if (this.egoera !== 'martxan') return;
    this.ordua += dt;
    let aurrekontua = 20000;
    try {
      for (const h of this.hariak.slice()) {
        let tick = 0;
        while (!h.amaituta && !h.pausan && h.esnatu <= this.ordua && aurrekontua-- > 0) {
          const { value, done } = h.gen.next();
          if (this.egoera !== 'martxan') return;
          if (done) { h.amaituta = true; break; }
          if (value.mota === 'itxaron') {
            h.esnatu = Math.max(h.esnatu, this.ordua - dt) + value.ms;
            continue;
          }
          if (++this.urratsak > this.muga) throw new ProgramaErrorea(this.mugaMezua, this.azkena, 'muga');
          if (value.mota === 'blokea') {
            this.azkena = value.id;
            this.emit('blokea', value.id);
            if (this.pausaka) h.pausan = true;
          } else if (++tick >= 50) break;
        }
      }
    } catch (err) {
      const e = err instanceof ProgramaErrorea ? err : new ProgramaErrorea('Barne-errorea: ' + err.message, this.azkena);
      if (!(err instanceof ProgramaErrorea)) console.error(err);
      if (!e.id) e.id = this.azkena;
      this.hariak = [];
      this.egoera = 'errorea';
      this.emit('errorea', e);
      this.emit('egoera', this.egoera);
      return;
    }
    this.egiaztatuAmaiera();
  }

  // Denbora-mugarik gabe amaierara arte (probetan eta kontsolan)
  exekutatuOsorik(pausua = 1000) {
    this.hasi();
    let n = 0;
    while (this.egoera === 'martxan' && n++ < 1e6) {
      if (this.hariak.length === 0) break;
      const esnatu = Math.min(...this.hariak.map(h => h.esnatu));
      this.aurreratu(Math.max(0, Math.min(pausua, esnatu - this.ordua)));
    }
    return this.egoera;
  }

  egiaztatuAmaiera() {
    this.hariak = this.hariak.filter(h => !h.amaituta);
    if (this.egoera !== 'martxan') return;
    if (!this.betikoakHasita && !this.hariak.some(h => h.mota === 'hasiera')) {
      this.betikoakHasita = true;
      for (const b of this.txapelak('betiko')) this.sortuHaria(b, true);
    }
    if (!this.hariak.length && !this.entzuten()) {
      this.egoera = 'amaituta';
      this.emit('egoera', this.egoera);
    }
  }

  // ---------- blokeek erabiltzen dituzten laguntzaileak ----------
  *pila(b, izena) {
    let c = b.inputs?.[izena]?.block;
    while (c) {
      if (!desgaituta(c)) yield* this.agindua(c);
      c = c.next?.block;
    }
  }
  *agindua(c) {
    const def = this.blokeak[c.type];
    if (!def?.agindua) throw new ProgramaErrorea('Bloke hau ez da agindu bat: ezin da hemen jarri.', c.id);
    yield { mota: 'blokea', id: c.id };
    yield* def.agindua(this, c);
  }
  balioa(b, izena) {
    const inp = b.inputs?.[izena], c = inp?.block || inp?.shadow;
    if (!c) throw new ProgramaErrorea('Bloke honi hutsune bat falta zaio: jarri bertan balio bat edo baldintza bat.', b.id, 'hutsik');
    const def = this.blokeak[c.type];
    if (!def?.balioa) throw new ProgramaErrorea('Bloke hau ezin da hutsune horretan erabili.', c.id);
    return def.balioa(this, c);
  }
  egia(b, izena) {
    const v = this.balioa(b, izena);
    return typeof v === 'boolean' ? v : zenbakia(v) !== 0;
  }
  aldagaiId(b) { const f = b.fields?.VAR; return f && typeof f === 'object' ? f.id : f; }
  aldagaia(b) {
    const id = this.aldagaiId(b);
    return this.aldagaiak.has(id) ? this.aldagaiak.get(id) : 0;
  }
  ezarri(b, v) {
    const id = this.aldagaiId(b);
    this.aldagaiak.set(id, v);
    this.emit('aldagaia', this.izenak.get(id) || id, v);
  }
  // [izena, balioa] bikoteak (balioa undefined oraindik ez bada ezarri)
  aldagaiZerrenda() {
    return [...this.izenak].map(([id, izena]) => [izena, this.aldagaiak.get(id)]);
  }
}
