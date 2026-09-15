// Robot-sareta: robot bat sareta batean programatu, txartelekin (hasiberriak) edo blokeekin (Blockly).
// Puzzle bakoitzak blokeak mugatzen ditu. Aldaerak baditu (izarrak ausaz, helmuga lekuz aldatuta),
// programa aldaera guztiekin egiaztatzen da: kasu bakarrean asmatzea ez da nahikoa.
// Aukerak: modua ('blokeak' | 'txartelak'), puzleak [id], libre (sareta editagarria), gorde (gakoa), maila
import { esc, slider, irakurri, gorde } from '../util.js';
import { Exekutatzailea, ProgramaErrorea } from '../blokeak/exekutatzailea.js';
import * as E from '../blokeak/eraiki.js';

const C = 56;
const NORAK = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 0 iparra, 1 ekialdea, 2 hegoa, 3 mendebaldea
const DIR = { N: 0, E: 1, S: 2, W: 3 };
const MS = 420;
const ABIADURAK = [0.35, 0.6, 1, 1.8, 3.5];

// Mapak: # horma · . lurra · R robota · r robota margotzeko lauki batean · H helmuga · * izarra
//        M margotzeko laukia · ? izarra ausaz (aldaerak) · h helmuga izan daitekeen laukia (aldaerak)
export const PUZLEAK = {
  // ---------- txartelak ----------
  t1: { modua: 'txartelak', maila: 1, izena: 'Lehen urratsak', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu'],
    mapa: ['#######', '#R...H#', '#######'],
    azalpena: 'Eraman robota banderaraino. Sakatu txartelak programa osatzeko, eta gero <b>▶ Exekutatu</b>.',
    pista: 'Zenbatu laukiak: robotak zenbat aldiz egin behar du aurrera?' },
  t2: { modua: 'txartelak', maila: 1, izena: 'Izkina', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu'],
    mapa: ['######', '#R..##', '###.##', '###H##', '######'],
    azalpena: 'Oraingoan bidea okertu egiten da. Biratzean robota ez da mugitzen: norabidea bakarrik aldatzen du.',
    pista: 'Jarri zeure burua robotaren lekuan: begira dagoen aldetik, eskuinera ala ezkerrera biratu behar du?' },
  t3: { modua: 'txartelak', maila: 1, izena: 'Eskailera', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu'],
    mapa: ['#######', '#R.####', '##..###', '###..##', '####.H#', '#######'],
    azalpena: 'Eskailera bat jaitsi behar da. Programa osatu baino lehen, bilatu <b>patroia</b>: zer errepikatzen da?',
    pista: 'Maila bakoitzean gauza bera: aurrera, eskuinera biratu, aurrera, ezkerrera biratu.' },
  t4: { modua: 'txartelak', maila: 1, izena: 'Izarrak bildu', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu', 'r_hartu'],
    mapa: ['#######', '#R*.###', '###.###', '###*.H#', '#######'],
    azalpena: 'Hartu bi izarrak eta iritsi helmugara. <b>Deskonposatu</b> problema: lehenik lehen izarra, gero bigarrena, eta azkenik helmuga.',
    pista: 'Izar baten gainean zaudenean erabili «hartu» txartela.' },

  // ---------- blokeak ----------
  b1: { modua: 'blokeak', maila: 1, izena: 'Sekuentzia', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu'],
    mapa: ['#######', '#R..###', '###.###', '###...#', '#####H#', '#######'],
    azalpena: 'Arrastatu blokeak «hasieran» blokearen barrura, ordenan. Programa goitik behera exekutatzen da.',
    pista: 'Bi aurrera, eskuinera, bi aurrera, ezkerrera, bi aurrera, eskuinera eta aurrera.' },
  b2: { modua: 'blokeak', maila: 1, izena: 'Errepikatu', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu', 'kontrol_errepikatu'], max: 2,
    mapa: ['###########', '#R.......H#', '###########'],
    azalpena: 'Korridore luze bat. Idatzi programa <b>bi bloke</b> bakarrik erabilita.',
    pista: 'Jarri «aurrera egin» blokea «errepikatu» blokearen barruan, eta idatzi zenbat aldiz.' },
  b3: { modua: 'blokeak', maila: 1, izena: 'Karratua margotu', norabidea: 'E', blokeak: ['r_margotu', 'r_aurrera', 'r_biratu', 'kontrol_errepikatu'], max: 5, helburua: 'margotu',
    mapa: ['######', '#rMMM#', '#M..M#', '#M..M#', '#MMMM#', '######'],
    azalpena: 'Margotu karratuaren ertza, marratutako lauki guztiak eta horiek bakarrik. Gehienez <b>5 bloke</b>.',
    pista: 'Alde bakoitzean: 3 aldiz (margotu eta aurrera), eta gero eskuinera biratu. Hori 4 aldiz: begizta baten barruan beste begizta bat.' },
  b4: { modua: 'blokeak', maila: 1, izena: 'Eskailera luzea', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu', 'kontrol_errepikatu'], max: 6,
    mapa: ['#########', '#R.######', '##..#####', '###..####', '####..###', '#####..##', '######.H#', '#########'],
    azalpena: 'Eskailera honek bost maila ditu. Bilatu patroia eta errepikatu. Gehienez <b>6 bloke</b>.',
    pista: 'Maila bat: aurrera, eskuinera, aurrera, ezkerrera. Bost aldiz, eta amaieran beste urrats bat.' },
  b5: { modua: 'blokeak', maila: 1, izena: 'Helmuga ezezaguna', norabidea: 'E', blokeak: ['r_aurrera', 'kontrol_errepikatu', 'kontrol_arte', 'r_helmugan'], max: 3,
    mapa: ['############', '#R.hhhhhhh.#', '############'],
    azalpena: 'Helmuga leku desberdinean agertzen da aldi bakoitzean. Programak <b>kasu guztietan</b> balio behar du.',
    pista: 'Ezin da jakin zenbat aldiz errepikatu. Erabili «errepikatu … arte» eta «helmugan nago» sentsorea.' },
  b6: { modua: 'blokeak', maila: 1, izena: 'Izarrak ausaz', norabidea: 'E', blokeak: ['r_aurrera', 'r_hartu', 'kontrol_arte', 'kontrol_baldin', 'r_helmugan', 'r_izarra'], max: 6,
    mapa: ['##########', '#R?.??.?H#', '##########'],
    azalpena: 'Izarrak ausaz agertzen dira. Hartu dauden guztiak eta iritsi helmugara. Izarrik ez dagoen lauki batean «hartu» eginez gero, errorea!',
    pista: 'Lauki bakoitzean: baldin izarra hemen bada, hartu. Gero aurrera. Hori helmugara iritsi arte.' },
  b7: { modua: 'blokeak', maila: 2, izena: 'Labirintoa', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu', 'kontrol_arte', 'kontrol_baldin', 'kontrol_baldin_bestela', 'r_bidea', 'r_helmugan'],
    aldaerak: [
      ['#########', '#R..#...#', '###.#.#.#', '#...#.#.#', '#.#.#.#.#', '#.#...#H#', '#########'],
      ['#########', '#R....#H#', '####.##.#', '#....#..#', '#.####.##', '#......##', '#########']
    ],
    azalpena: 'Programa bakar batek bi labirintoetatik irten behar du. Robotak ez daki mapa: sentsoreak bakarrik ditu.',
    pista: '«Eskuineko eskuaren araua»: eskuinean bidea libre badago, biratu eskuinera eta aurrera; bestela, aurrean libre badago, aurrera; bestela, biratu ezkerrera.' },

  // ---------- arazketa: programa okerrak ----------
  a1: { modua: 'blokeak', maila: 1, izena: 'Bira okerra', norabidea: 'E', blokeak: ['r_aurrera', 'r_biratu'],
    mapa: ['######', '#R..##', '###.##', '###H##', '######'],
    programa: () => E.programa([E.hasieran([E.aurrera(), E.aurrera(), E.biratu('EZK'), E.aurrera(), E.aurrera()], { deletable: false })]),
    azalpena: 'Programa honek robota helmugara eraman beharko luke, baina ez du lortzen. Exekutatu <b>urratsez urrats</b>, aurkitu akatsa eta konpondu.',
    pista: 'Begiratu zein blokeren ondoren joaten den robota hormaren kontra.' },
  a2: { modua: 'blokeak', maila: 1, izena: 'Bat gehiegi', norabidea: 'E', blokeak: ['r_aurrera', 'kontrol_errepikatu'],
    mapa: ['#########', '#R.....H#', '#########'],
    programa: () => E.programa([E.hasieran([E.errepikatu(7, [E.aurrera()])], { deletable: false })]),
    azalpena: 'Akats oso ohikoa: begizta batek behar baino itzuli bat gehiago (edo gutxiago) egiten du. Zenbatu ondo.',
    pista: 'Robota 1. laukian dago eta helmuga 7.ean: zenbat urrats dira?' },
  a3: { modua: 'blokeak', maila: 1, izena: 'Karratu irekia', norabidea: 'E', blokeak: ['r_margotu', 'r_aurrera', 'r_biratu', 'kontrol_errepikatu'], helburua: 'margotu',
    mapa: ['######', '#rMMM#', '#M..M#', '#M..M#', '#MMMM#', '######'],
    programa: () => E.programa([E.hasieran([E.errepikatu(3, [E.errepikatu(3, [E.margotu(), E.aurrera()]), E.biratu('ESK')])], { deletable: false })]),
    azalpena: 'Karratua margotzeko programa da, baina alde bat falta da. Programak ez du errorerik ematen: emaitza da okerra. Horrelako akatsak zailagoak dira aurkitzen.',
    pista: 'Karratu batek zenbat alde ditu?' },
  a4: { modua: 'blokeak', maila: 1, izena: 'Izarrik ez', norabidea: 'E', blokeak: ['r_aurrera', 'r_hartu', 'kontrol_arte', 'kontrol_baldin', 'r_helmugan', 'r_izarra'],
    mapa: ['#########', '#R*.*.*H#', '#########'],
    programa: () => E.programa([E.hasieran([E.arte(E.helmugan(), [E.hartu(), E.aurrera()])], { deletable: false })]),
    azalpena: 'Programa honek izar guztiak hartu nahi ditu, baina lehen urratsean gelditzen da. Zergatik?',
    pista: 'Robota hasten den laukian ez dago izarrik. «hartu» egin aurretik, begiratu izarrik dagoen.' },

  // ---------- sareta librea (laborategia) ----------
  libre: { modua: 'blokeak', maila: 1, izena: 'Sareta librea', norabidea: 'E', blokeak: null,
    mapa: ['##########', '#R.......#', '#........#', '#...*....#', '#........#', '#.......H#', '##########'] }
};

// Aldaera guztiak: '?' laukien konbinazio guztiak eta 'h' laukietako helmuga bakoitza
export function aldaerak(p) {
  const out = [];
  for (const mapa of p.aldaerak || [p.mapa]) {
    const galde = [], hk = [];
    mapa.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '?') galde.push([x, y]); if (ch === 'h') hk.push([x, y]); }));
    for (const hpos of hk.length ? hk : [null]) {
      for (let mask = 0; mask < (1 << galde.length); mask++) {
        const m = mapa.map(r => [...r]);
        galde.forEach(([x, y], i) => { m[y][x] = (mask >> i) & 1 ? '*' : '.'; });
        hk.forEach(([x, y]) => { m[y][x] = hpos[0] === x && hpos[1] === y ? 'H' : '.'; });
        out.push(m.map(r => r.join('')));
      }
    }
  }
  return out;
}

export function sortuMundua(mapa, norabidea = 'E') {
  const H = mapa.length, W = mapa[0].length;
  const horma = (x, y) => x < 0 || y < 0 || x >= W || y >= H || mapa[y][x] === '#';
  const izarrak = new Set(), helburuak = new Set(), margoak = new Set();
  let helmuga = null;
  const r = { x: 1, y: 1, dir: DIR[norabidea] ?? 1 };
  mapa.forEach((row, y) => [...row].forEach((ch, x) => {
    const k = x + ',' + y;
    if (ch === '*') izarrak.add(k);
    if (ch === 'M' || ch === 'r') helburuak.add(k);
    if (ch === 'H') helmuga = k;
    if (ch === 'R' || ch === 'r') { r.x = x; r.y = y; }
  }));
  let ang = (r.dir - 1) * 90, anim = null;
  const w = {
    mapa, W, H, r, izarrak, helburuak, margoak, horma, onAldaketa: null,
    get helmuga() { return helmuga; },
    aurrera(t, dur) {
      const [dx, dy] = NORAK[r.dir], nx = r.x + dx, ny = r.y + dy;
      if (horma(nx, ny)) {
        anim = { x0: r.x, y0: r.y, x1: r.x + dx * 0.28, y1: r.y + dy * 0.28, a0: ang, a1: ang, t0: t, dur: dur * 0.8, bump: true };
        return false;
      }
      anim = { x0: r.x, y0: r.y, x1: nx, y1: ny, a0: ang, a1: ang, t0: t, dur };
      r.x = nx; r.y = ny;
      return true;
    },
    biratu(s, t, dur) {
      anim = { x0: r.x, y0: r.y, x1: r.x, y1: r.y, a0: ang, a1: ang + 90 * s, t0: t, dur };
      ang += 90 * s;
      r.dir = (r.dir + s + 4) % 4;
    },
    margotu() { margoak.add(r.x + ',' + r.y); w.onAldaketa?.(); },
    hartu() {
      const k = r.x + ',' + r.y;
      if (!izarrak.has(k)) return false;
      izarrak.delete(k);
      w.onAldaketa?.();
      return true;
    },
    libre(nora) {
      const d = (r.dir + (nora === 'EZK' ? 3 : nora === 'ESK' ? 1 : 0)) % 4;
      return !horma(r.x + NORAK[d][0], r.y + NORAK[d][1]);
    },
    helmugan: () => helmuga === r.x + ',' + r.y,
    izarraHemen: () => izarrak.has(r.x + ',' + r.y),
    kokapena(t) {
      if (!anim || !anim.dur) return { x: r.x, y: r.y, a: ang };
      let k = Math.min(1, Math.max(0, (t - anim.t0) / anim.dur));
      if (anim.bump) k = k < 0.5 ? k * 2 : 2 - k * 2;
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      return { x: anim.x0 + (anim.x1 - anim.x0) * e, y: anim.y0 + (anim.y1 - anim.y0) * e, a: anim.a0 + (anim.a1 - anim.a0) * e };
    }
  };
  return w;
}

export function robotBlokeak(mundua, ms = MS) {
  return {
    r_aurrera: {
      *agindua(x, b) {
        if (!mundua().aurrera(x.ordua, ms)) {
          yield { mota: 'itxaron', ms: ms * 0.8 };
          throw new ProgramaErrorea('Kontuz! Robota hormaren kontra joan da.', b.id, 'huts');
        }
        yield { mota: 'itxaron', ms };
      }
    },
    r_biratu: { *agindua(x, b) { mundua().biratu(b.fields?.NORA === 'EZK' ? -1 : 1, x.ordua, ms * 0.7); yield { mota: 'itxaron', ms: ms * 0.7 }; } },
    r_margotu: { *agindua() { mundua().margotu(); yield { mota: 'itxaron', ms: ms * 0.4 }; } },
    r_hartu: {
      *agindua(x, b) {
        if (!mundua().hartu()) throw new ProgramaErrorea('Lauki honetan ez dago izarrik: ezin da hartu.', b.id, 'huts');
        yield { mota: 'itxaron', ms: ms * 0.4 };
      }
    },
    r_bidea: { balioa: (x, b) => mundua().libre(b.fields?.NORA || 'AURRE') },
    r_helmugan: { balioa: () => mundua().helmugan() },
    r_izarra: { balioa: () => mundua().izarraHemen() }
  };
}

export function ebaluatu(w, p) {
  if (p.helburua === 'margotu') {
    const falta = [...w.helburuak].filter(k => !w.margoak.has(k)).length;
    const soberan = [...w.margoak].filter(k => !w.helburuak.has(k)).length;
    if (falta) return { ondo: false, mezua: falta === 1 ? 'Lauki bat margotu gabe geratu da.' : `${falta} lauki margotu gabe geratu dira.` };
    if (soberan) return { ondo: false, mezua: `Margotu behar ez ziren laukiak margotu dira (${soberan}).` };
    return { ondo: true };
  }
  const iz = w.izarrak.size;
  if (w.helmuga && !w.helmugan()) return { ondo: false, mezua: 'Programa amaitu da, baina robota ez dago helmugan.' + (iz ? ` Gainera, ${iz === 1 ? 'izar bat' : iz + ' izar'} hartu gabe.` : '') };
  if (iz) return { ondo: false, mezua: iz === 1 ? 'Helmugan zaude, baina izar bat hartu gabe geratu da.' : `Helmugan zaude, baina ${iz} izar hartu gabe geratu dira.` };
  return { ondo: true };
}

// Programa aldaera batean animaziorik gabe exekutatu eta ebaluatu
export function probatu(json, p, mapa) {
  const w = sortuMundua(mapa, p.norabidea);
  const ex = new Exekutatzailea({ blokeak: robotBlokeak(() => w, 0), muga: 5000 });
  let err = null;
  ex.on('errorea', e => { err = e; });
  ex.kargatu(json);
  const eg = ex.exekutatuOsorik();
  if (eg === 'errorea') return { ondo: false, mezua: err?.message };
  return ebaluatu(w, p);
}

export function blokeKopurua(json) {
  let n = 0;
  const walk = b => {
    if (!b) return;
    n++;
    Object.values(b.inputs || {}).forEach(i => walk(i.block));
    walk(b.next?.block);
  };
  (json?.blocks?.blocks || []).filter(b => b.type === 'ekitaldia_hasi').forEach(t => walk(t.inputs?.DO?.block));
  return n;
}
const txapelaDu = json => (json?.blocks?.blocks || []).some(b => b.type === 'ekitaldia_hasi' && b.inputs?.DO?.block);

function izarra(cx, cy, R) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R;
    pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
  }
  return `<polygon class="rb-izarra" points="${pts.join(' ')}"/>`;
}
const ROBOTA = `<g class="rb-robota">
  <rect x="-15" y="-20" width="30" height="7" rx="2" class="rb-gurpila"/><rect x="-15" y="13" width="30" height="7" rx="2" class="rb-gurpila"/>
  <rect x="-18" y="-15" width="36" height="30" rx="7" class="rb-gorputza"/>
  <circle cx="7" cy="-6.5" r="3.8" class="rb-begia"/><circle cx="7" cy="6.5" r="3.8" class="rb-begia"/>
  <path d="M18 -6 L25 0 L18 6 Z" class="rb-muturra"/></g>`;

const TXARTELAK = {
  r_aurrera: { ikurra: '↑', izena: 'aurrera' },
  EZK: { ikurra: '↺', izena: 'ezkerrera' },
  ESK: { ikurra: '↻', izena: 'eskuinera' },
  r_hartu: { ikurra: '★', izena: 'hartu' }
};

export default function mount(box, opts = {}) {
  const modua = opts.modua || 'blokeak';
  const libre = !!opts.libre;
  const P = 'rb' + Math.random().toString(36).slice(2, 7);
  const zerrenda = libre ? ['libre'] : (opts.puzleak || Object.keys(PUZLEAK).filter(k => PUZLEAK[k].modua === modua && k !== 'libre' && !k.startsWith('a')));
  const GAKOA = opts.gorde || 'robotika:sareta:v1';
  const egoera = { ebatziak: [], programak: {}, libreMapa: null, ...irakurri(GAKOA, {}) };
  let pid = zerrenda.find(k => !egoera.ebatziak.includes(k)) || zerrenda[0];
  let p = PUZLEAK[pid];
  let libreMapa = egoera.libreMapa || PUZLEAK.libre.mapa;
  let w = null, ex = null, erabilia = false, raf = 0, last = 0, ed = null, txartelak = [], hilda = false, gordeT = 0;
  let editaTresna = '#';

  box.innerHTML = `
    <div class="sim rb">
      ${libre ? '' : `<div class="rb-head"><span class="rb-head-l">${modua === 'txartelak' ? 'Erronkak' : 'Puzzleak'}</span><div class="rb-puzleak" id="${P}-pz" role="group" aria-label="Puzzleak"></div></div>`}
      <div class="rb-body">
        <div class="rb-kodea">
          <div class="rb-brief" id="${P}-brief"></div>
          <div id="${P}-ed" class="${modua === 'txartelak' ? 'rb-txartelak' : 'rb-editorea'}"></div>
        </div>
        <div class="rb-mundua">
          <div class="rb-stage"><svg id="${P}-svg" role="img" aria-label="Robotaren sareta"></svg></div>
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Exekutatu</button>
              <button class="btn sm" id="${P}-step" title="Bloke bat exekutatu eta gelditu">Urratsa</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <div id="${P}-speed"></div>
            ${libre ? `<div class="rb-edit"><span class="an-h">Aldatu sareta (sakatu lauki bat)</span>
              <div class="seg" role="group" aria-label="Sareta aldatzeko tresna">
                ${[['#', 'Horma'], ['*', 'Izarra'], ['H', 'Helmuga'], ['M', 'Margotzeko'], ['R', 'Robota'], ['.', 'Garbitu']].map(([k, t]) => `<button data-t="${k}" class="${k === '#' ? 'active' : ''}" aria-pressed="${k === '#'}">${t}</button>`).join('')}
              </div>
              <div class="pills"><button class="btn sm ghost" id="${P}-dir">Robota biratu ↻</button><button class="btn sm ghost" id="${P}-hustu">Sareta hutsa</button></div></div>` : ''}
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
            <p class="rb-count" id="${P}-count"></p>
          </div>
        </div>
      </div>
    </div>`;

  const $ = s => box.querySelector(s);
  const svg = $(`#${P}-svg`);
  const sAbiadura = slider($(`#${P}-speed`), { id: P + '-sp', label: 'Abiadura', min: 1, max: 5, step: 1, value: 3, format: v => ['oso motela', 'motela', 'ertaina', 'azkarra', 'oso azkarra'][v - 1] });
  let norabideLibre = egoera.libreNorabidea || 'E';

  function mezua(testua, mota = '') {
    const el = $(`#${P}-msg`);
    el.className = 'rb-msg' + (mota ? ' ' + mota : '');
    el.textContent = testua;
  }
  function gordeEgoera() { gorde(GAKOA, egoera); }

  // ---------- mundua ----------
  function berrezarri() {
    gelditu();
    const alds = libre ? [libreMapa] : aldaerak(p);
    const mapa = alds[Math.floor(Math.random() * alds.length)];
    w = sortuMundua(mapa, libre ? norabideLibre : p.norabidea);
    w.onAldaketa = dinamikoa;
    ex = null;
    erabilia = false;
    marraztuMundua();
    nabarmendu(null);
    mezua(alds.length > 1 ? `Puzzle honek ${alds.length} aldaera ditu: programa guztiekin probatuko da.` : '');
    botoiak();
  }

  function marraztuMundua() {
    svg.setAttribute('viewBox', `0 0 ${w.W * C} ${w.H * C}`);
    let s = '';
    for (let y = 0; y < w.H; y++) {
      for (let x = 0; x < w.W; x++) {
        const k = w.mapa[y][x] === '#' ? 'rb-horma' : 'rb-lurra';
        s += `<rect class="${k}" x="${x * C}" y="${y * C}" width="${C}" height="${C}" data-x="${x}" data-y="${y}"/>`;
      }
    }
    s += `<g id="${P}-din" pointer-events="none"></g><g id="${P}-rob" pointer-events="none">${ROBOTA}</g>`;
    svg.innerHTML = s;
    dinamikoa();
    marraztuRobota();
  }
  function dinamikoa() {
    const din = svg.querySelector(`#${P}-din`);
    if (!din) return;
    const xy = k => k.split(',').map(Number);
    let s = '';
    if (w.helmuga) {
      const [x, y] = xy(w.helmuga), X = x * C, Y = y * C;
      s += `<rect class="rb-helmuga" x="${X + 2}" y="${Y + 2}" width="${C - 4}" height="${C - 4}"/>
        <line class="rb-makila" x1="${X + 19}" y1="${Y + 11}" x2="${X + 19}" y2="${Y + 46}"/><path class="rb-bandera" d="M${X + 19} ${Y + 11} L${X + 43} ${Y + 19} L${X + 19} ${Y + 27} Z"/>`;
    }
    w.helburuak.forEach(k => { const [x, y] = xy(k); s += `<rect class="rb-helb" x="${x * C + 6}" y="${y * C + 6}" width="${C - 12}" height="${C - 12}"/>`; });
    w.margoak.forEach(k => { const [x, y] = xy(k); s += `<rect class="rb-margo${libre || w.helburuak.has(k) ? '' : ' soberan'}" x="${x * C + 3}" y="${y * C + 3}" width="${C - 6}" height="${C - 6}"/>`; });
    w.izarrak.forEach(k => { const [x, y] = xy(k); s += izarra(x * C + C / 2, y * C + C / 2, 16); });
    din.innerHTML = s;
  }
  function marraztuRobota() {
    const g = svg.querySelector(`#${P}-rob`);
    if (!g || !w) return;
    const k = w.kokapena(ex ? ex.ordua : 0);
    g.setAttribute('transform', `translate(${((k.x + 0.5) * C).toFixed(1)} ${((k.y + 0.5) * C).toFixed(1)}) rotate(${k.a.toFixed(1)})`);
  }

  // ---------- programa ----------
  function programaJson() {
    if (modua === 'txartelak') {
      return E.programa([{ type: 'ekitaldia_hasi', id: 'hasi', inputs: txartelak.length ? { DO: { block: E.kate(txartelak.map((t, i) => t === 'EZK' || t === 'ESK' ? { type: 'r_biratu', id: 'k' + i, fields: { NORA: t } } : { type: t, id: 'k' + i })) } } : undefined }]);
    }
    return ed ? ed.json() : null;
  }
  function hasierakoa() {
    return p.programa ? p.programa() : E.programa([E.hasieran([], { deletable: false })]);
  }
  function nabarmendu(id) {
    if (modua === 'txartelak') {
      box.querySelectorAll('.rb-txartela').forEach(el => el.classList.toggle('on', el.dataset.id === id));
    } else ed?.nabarmendu(id);
  }
  function markatuErrorea(id) {
    if (modua === 'txartelak') box.querySelectorAll('.rb-txartela').forEach(el => el.classList.toggle('err', el.dataset.id === id));
    else ed?.errorea(id);
  }
  function kontagailua() {
    const el = $(`#${P}-count`);
    if (libre) { el.textContent = ''; return; }
    const n = modua === 'txartelak' ? txartelak.length : blokeKopurua(programaJson());
    el.innerHTML = modua === 'txartelak' ? `Txartelak: <b>${n}</b>` : `Blokeak: <b>${n}</b>${p.max ? ` / ${p.max} gehienez` : ''}`;
    el.classList.toggle('over', !!p.max && n > p.max);
  }
  function aldatuta() {
    kontagailua();
    clearTimeout(gordeT);
    gordeT = setTimeout(() => {
      if (hilda) return;
      egoera.programak[pid] = modua === 'txartelak' ? txartelak.slice() : programaJson();
      gordeEgoera();
    }, 400);
  }

  // ---------- exekuzioa ----------
  function prestatu(pausaka) {
    const json = programaJson();
    if (!json) return false;
    if (!txapelaDu(json)) {
      mezua(modua === 'txartelak' ? 'Gehitu txartelak programari.' : 'Jarri blokeak «hasieran» blokearen barruan.', 'err');
      return false;
    }
    if (erabilia) berrezarri();
    markatuErrorea(null);
    ex = new Exekutatzailea({ blokeak: robotBlokeak(() => w), muga: 3000, mugaMezua: 'Robota ez da inoiz gelditzen: begizta batek ez al du amaierarik?' });
    ex.on('blokea', nabarmendu);
    ex.on('errorea', e => { mezua(e.message, 'err'); markatuErrorea(e.id); nabarmendu(null); });
    ex.on('egoera', eg => { if (eg === 'amaituta') amaitu(json); botoiak(); });
    ex.kargatu(json);
    erabilia = true;
    mezua(pausaka ? 'Urratsez urrats: sakatu «Urratsa» hurrengo blokerako.' : '');
    ex.hasi({ pausaka });
    ex.aurreratu(0);
    begizta();
    return true;
  }
  function begizta() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const frame = now => {
      if (hilda) return;
      const dt = Math.min(now - last, 100);
      last = now;
      if (ex && ex.egoera === 'martxan') ex.aurreratu(dt * ABIADURAK[sAbiadura.value - 1]);
      marraztuRobota();
      if (ex && ex.egoera === 'martxan') raf = requestAnimationFrame(frame);
      else raf = 0;
    };
    raf = requestAnimationFrame(frame);
  }
  function gelditu() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (ex && ex.egoera === 'martxan') ex.gelditu();
  }
  function amaitu(json) {
    nabarmendu(null);
    if (libre) {
      mezua(w.helmuga && w.helmugan() ? 'Helmugan! ✓' : 'Programa amaitu da.', w.helmuga && w.helmugan() ? 'ok' : '');
      return;
    }
    const e = ebaluatu(w, p);
    if (!e.ondo) { mezua(e.mezua, 'err'); return; }
    const alds = aldaerak(p);
    if (alds.length > 1 && alds.some(a => !probatu(json, p, a).ondo)) {
      mezua('Oraingoan lortu duzu, baina programak ez du kasu guztietan balio: izarrak edo helmuga beste leku batean daudenean huts egiten du. Berrezarri eta probatu berriro.', 'err');
      return;
    }
    const n = modua === 'txartelak' ? txartelak.length : blokeKopurua(json);
    if (p.max && n > p.max) {
      mezua(`Helburua lortu duzu, baina ${n} bloke erabili dituzu. Saiatu ${p.max} bloke edo gutxiagorekin.`, 'warn');
      return;
    }
    mezua(alds.length > 1 ? `Bikain! Programak ${alds.length} kasuetan funtzionatzen du. ✓` : 'Bikain! Lortu duzu. ✓', 'ok');
    if (!egoera.ebatziak.includes(pid)) {
      egoera.ebatziak.push(pid);
      gordeEgoera();
      puzzleBotoiak();
      opts.onEbatzi?.(pid);
    }
  }
  function botoiak() {
    const martxan = ex && ex.egoera === 'martxan';
    const run = $(`#${P}-run`);
    run.textContent = martxan && !ex.pausaka ? '■ Gelditu' : martxan ? '▶ Jarraitu' : '▶ Exekutatu';
    run.classList.toggle('primary', !(martxan && !ex.pausaka));
  }

  $(`#${P}-run`).addEventListener('click', () => {
    if (ex && ex.egoera === 'martxan') {
      if (ex.pausaka) { ex.jarraitu(); mezua(''); } else { gelditu(); mezua('Geldituta.'); nabarmendu(null); }
      botoiak();
      return;
    }
    prestatu(false);
    botoiak();
  });
  $(`#${P}-step`).addEventListener('click', () => {
    if (ex && ex.egoera === 'martxan') {
      if (!ex.pausaka) { ex.pausatu(); mezua('Urratsez urrats: sakatu «Urratsa» hurrengo blokerako.'); } else ex.urratsa();
      botoiak();
      return;
    }
    prestatu(true);
    botoiak();
  });
  $(`#${P}-reset`).addEventListener('click', () => { berrezarri(); });

  // ---------- puzzleak ----------
  function puzzleBotoiak() {
    const pz = $(`#${P}-pz`);
    if (!pz) return;
    pz.innerHTML = zerrenda.map((k, i) => {
      const q = PUZLEAK[k], on = k === pid, done = egoera.ebatziak.includes(k);
      return `<button class="rb-pz${on ? ' on' : ''}${done ? ' done' : ''}" data-p="${k}" aria-pressed="${on}" title="${esc(q.izena)}${done ? ' (eginda)' : ''}">${i + 1}${done ? '<span aria-hidden="true">✓</span>' : ''}</button>`;
    }).join('');
    pz.querySelectorAll('[data-p]').forEach(bt => bt.addEventListener('click', () => aukeratu(bt.dataset.p)));
  }
  function brief() {
    const i = zerrenda.indexOf(pid) + 1;
    $(`#${P}-brief`).innerHTML = libre
      ? `<p class="rb-azal">Aldatu sareta eskuineko tresnekin eta programatu robota blokeekin. Zure programa eta sareta nabigatzaile honetan gordetzen dira.</p>`
      : `<h4>${i}. ${esc(p.izena)}${p.maila > 1 ? ` <span class="lvl lvl-${p.maila}">${p.maila === 2 ? 'DBH 3-4' : 'Batx.'}</span>` : ''}</h4>
         <p class="rb-azal">${p.azalpena}</p>
         ${p.pista ? `<details class="rb-pista"><summary>Pista</summary><p>${p.pista}</p></details>` : ''}`;
  }
  function aukeratu(k) {
    if (k === pid && w) return;
    gelditu();
    pid = k;
    p = PUZLEAK[k];
    brief();
    puzzleBotoiak();
    kargatuPrograma();
    berrezarri();
    kontagailua();
  }
  function kargatuPrograma() {
    const gordea = egoera.programak[pid];
    if (modua === 'txartelak') {
      txartelak = Array.isArray(gordea) ? gordea.filter(t => t in TXARTELAK && (t !== 'r_hartu' || p.blokeak.includes('r_hartu'))) : [];
      txartelakMarraztu();
    } else if (ed) {
      ed.tresnak(p.blokeak ? p.blokeak : 'robota');
      ed.kargatu(gordea && gordea.blocks ? gordea : hasierakoa());
    }
  }

  // ---------- txartelak ----------
  function txartelakMarraztu() {
    const el = $(`#${P}-ed`);
    const aukerak = ['r_aurrera', 'EZK', 'ESK', ...(p.blokeak.includes('r_hartu') ? ['r_hartu'] : [])];
    el.innerHTML = `
      <div class="rb-paleta" role="group" aria-label="Txartelak gehitu">
        ${aukerak.map(t => `<button class="rb-tx-btn" data-t="${t}"><b aria-hidden="true">${TXARTELAK[t].ikurra}</b>${TXARTELAK[t].izena}</button>`).join('')}
      </div>
      <ol class="rb-sekuentzia" aria-label="Programa">
        ${txartelak.map((t, i) => `<li><button class="rb-txartela" data-id="k${i}" data-i="${i}" title="${TXARTELAK[t].izena} (sakatu kentzeko)" aria-label="${i + 1}. ${TXARTELAK[t].izena}, kendu">${TXARTELAK[t].ikurra}</button></li>`).join('') || '<li class="rb-hutsik">Programa hutsik dago</li>'}
      </ol>
      <div class="pills"><button class="btn sm ghost" id="${P}-back">⌫ Kendu azkena</button><button class="btn sm ghost" id="${P}-clear">Garbitu dena</button></div>`;
    el.querySelectorAll('[data-t]').forEach(bt => bt.addEventListener('click', () => {
      if (txartelak.length >= 40) return;
      txartelak.push(bt.dataset.t);
      aldatuTxartelak();
    }));
    el.querySelectorAll('[data-i]').forEach(bt => bt.addEventListener('click', () => { txartelak.splice(+bt.dataset.i, 1); aldatuTxartelak(); }));
    el.querySelector(`#${P}-back`).addEventListener('click', () => { txartelak.pop(); aldatuTxartelak(); });
    el.querySelector(`#${P}-clear`).addEventListener('click', () => { txartelak = []; aldatuTxartelak(); });
  }
  function aldatuTxartelak() {
    if (ex && ex.egoera === 'martxan') gelditu();
    txartelakMarraztu();
    aldatuta();
  }

  // ---------- sareta librea ----------
  if (libre) {
    box.querySelectorAll('.rb-edit [data-t]').forEach(bt => bt.addEventListener('click', () => {
      editaTresna = bt.dataset.t;
      box.querySelectorAll('.rb-edit [data-t]').forEach(x => { x.classList.toggle('active', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    }));
    svg.addEventListener('click', e => {
      const cell = e.target.closest('[data-x]');
      if (!cell) return;
      const x = +cell.dataset.x, y = +cell.dataset.y;
      if (x === 0 || y === 0 || x === w.W - 1 || y === w.H - 1) return; // ertzeko hormak finkoak
      const m = libreMapa.map(r => [...r]);
      if (editaTresna === 'R' || editaTresna === 'H') m.forEach(r => r.forEach((ch, i) => { if (ch === editaTresna) r[i] = '.'; }));
      if (m[y][x] === 'R' && editaTresna !== 'R') return; // robota ez da ezabatzen
      m[y][x] = editaTresna;
      libreMapa = m.map(r => r.join(''));
      egoera.libreMapa = libreMapa;
      gordeEgoera();
      berrezarri();
    });
    $(`#${P}-dir`).addEventListener('click', () => {
      norabideLibre = 'NESW'[('NESW'.indexOf(norabideLibre) + 1) % 4];
      egoera.libreNorabidea = norabideLibre;
      gordeEgoera();
      berrezarri();
    });
    $(`#${P}-hustu`).addEventListener('click', () => {
      libreMapa = PUZLEAK.libre.mapa.map((r, y) => y === 0 || y === PUZLEAK.libre.mapa.length - 1 ? r : '#' + '.'.repeat(r.length - 2) + '#');
      libreMapa[1] = '#R' + libreMapa[1].slice(2);
      egoera.libreMapa = libreMapa;
      gordeEgoera();
      berrezarri();
    });
  }

  // ---------- hasi ----------
  brief();
  puzzleBotoiak();
  berrezarri();
  if (modua === 'txartelak') {
    kargatuPrograma();
    kontagailua();
  } else {
    $(`#${P}-ed`).innerHTML = '<div class="rb-kargatzen">Blokeak kargatzen…</div>';
    import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
      tresnak: p.blokeak || 'robota',
      json: (egoera.programak[pid]?.blocks ? egoera.programak[pid] : hasierakoa()),
      onAldaketa: () => { if (ex && ex.egoera === 'martxan') { gelditu(); nabarmendu(null); botoiak(); } aldatuta(); }
    })).then(editorea => {
      if (hilda) { editorea.dispose(); return; }
      ed = editorea;
      kontagailua();
    }).catch(err => {
      console.error(err);
      $(`#${P}-ed`).innerHTML = '<div class="notice err">Bloke-editorea ezin izan da kargatu. Freskatu orria.</div>';
    });
  }

  return () => {
    hilda = true;
    gelditu();
    clearTimeout(gordeT);
    if (egoera && ed) { egoera.programak[pid] = ed.json(); gordeEgoera(); }
    ed?.dispose();
  };
}
