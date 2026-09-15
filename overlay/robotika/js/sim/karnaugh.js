// Diseinu logikoa: egia-taulatik adierazpen sinplifikatura (Karnaugh-en mapa, Quine-McCluskey) eta zirkuitura;
// eta RS biegonkorra (memoria-zelula bat EZ-EDO ateekin).
// Aukerak: modua ('diseinua' | 'biegonkorra'), adibidea, libre, gorde (gakoa), maila
import { esc, irakurri, gorde } from '../util.js';
import { ezH, ezS, atea, zirkuituaSVG, ebaluatu, konbinazioak } from './logika-marrazkia.js';

const IZENAK = ['A', 'B', 'C', 'D'];
const KOLOREAK = ['var(--s1)', 'var(--s3)', 'var(--s4)', 'var(--s2)', 'var(--s5)', 'var(--s6)', 'var(--danger)', 'var(--ink2)'];
const GRAY = [0, 1, 3, 2];

export const ADIBIDEAK = {
  alarma: { izena: 'Etxeko alarma', n: 3, bat: [3, 5, 7], azalpena: 'A: atea irekita · B: leihoa irekita · C: alarma aktibatuta. Alarmak jotzen du (A EDO B) ETA C denean.' },
  bozketa: { izena: 'Bozketa (gehiengoa)', n: 3, bat: [3, 5, 6, 7], azalpena: 'Hiru epaile: argia pizten da gutxienez bik «bai» esaten badute.' },
  berotegia: { izena: 'Berotegiko haizagailua', n: 3, bat: [2, 4, 5, 6, 7], azalpena: 'A: tenperatura altua · B: hezetasun altua · C: euria ari du. Haizagailua pizten da A denean, EDO B ETA EZ C denean.' },
  segmentua: { izena: '7 segmentuko pantaila (a segmentua)', n: 4, bat: [0, 2, 3, 5, 6, 7, 8, 9], x: [10, 11, 12, 13, 14, 15], azalpena: 'ABCD zifra hamartar bat da bitarrez (0–9). Goiko «a» segmentua 0, 2, 3, 5, 6, 7, 8 eta 9 zifretan pizten da. 10–15 konbinazioak ez dira inoiz gertatzen: berdin dio (X), eta taldeak handitzeko erabil daitezke.' },
  paritatea: { izena: 'Paritate-bita', n: 4, bat: [1, 2, 4, 7, 8, 11, 13, 14], azalpena: '1eko kopurua bakoitia denean Q = 1. Mapak xake-taula dirudi: ezin da ezer taldekatu. Horrelakoetan EDO-B ateak erabiltzen dira.' },
  hutsa2: { izena: 'Hutsa: 2 aldagai', n: 2, bat: [], azalpena: 'Sakatu Q zutabeko gelaxkak (edo mapakoak) 0, 1 eta X artean aldatzeko.' },
  hutsa3: { izena: 'Hutsa: 3 aldagai', n: 3, bat: [], azalpena: 'Sakatu Q zutabeko gelaxkak (edo mapakoak) 0, 1 eta X artean aldatzeko.' },
  hutsa4: { izena: 'Hutsa: 4 aldagai', n: 4, bat: [], azalpena: 'Sakatu Q zutabeko gelaxkak (edo mapakoak) 0, 1 eta X artean aldatzeko.' }
};

// ---------- sinplifikazioa (Quine-McCluskey + estaldura minimoa) ----------
const popc = x => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
export const estaltzen = (t, k) => (k & ~t.m) === t.v;
export const literalak = (n, t) => n - popc(t.m);

export function sinplifikatu(n, bat, x = []) {
  const osoa = 2 ** n;
  const batS = [...new Set(bat)].sort((a, b) => a - b);
  if (!batS.length) return { terminoak: [], konstantea: 0 };
  const denak = [...new Set([...batS, ...x])];
  if (denak.length === osoa) return { terminoak: [{ v: 0, m: osoa - 1 }], konstantea: 1 };
  let multzoa = denak.map(k => ({ v: k, m: 0 }));
  const primeak = [], gakoa = t => t.v + ':' + t.m;
  while (multzoa.length) {
    const hurrengoa = new Map(), erabiliak = new Set();
    for (let i = 0; i < multzoa.length; i++) for (let j = i + 1; j < multzoa.length; j++) {
      const a = multzoa[i], b = multzoa[j];
      if (a.m !== b.m) continue;
      const d = a.v ^ b.v;
      if (popc(d) !== 1) continue;
      const t = { v: a.v & ~d, m: a.m | d };
      hurrengoa.set(gakoa(t), t);
      erabiliak.add(i); erabiliak.add(j);
    }
    multzoa.forEach((t, i) => { if (!erabiliak.has(i) && !primeak.some(p => gakoa(p) === gakoa(t))) primeak.push(t); });
    multzoa = [...hurrengoa.values()];
  }
  const P = primeak.filter(p => batS.some(k => estaltzen(p, k)));
  const ess = new Set();
  batS.forEach(k => { const c = P.filter(p => estaltzen(p, k)); if (c.length === 1) ess.add(c[0]); });
  const falta = batS.filter(k => ![...ess].some(p => estaltzen(p, k)));
  const R = P.filter(p => !ess.has(p));
  let extra = [];
  if (falta.length) {
    if (R.length <= 16) {
      let onena = null;
      for (let mask = 1; mask < 2 ** R.length; mask++) {
        const auk = R.filter((_, i) => mask >> i & 1);
        if (onena && auk.length > onena.auk.length) continue;
        if (!falta.every(k => auk.some(p => estaltzen(p, k)))) continue;
        const lit = auk.reduce((s, p) => s + literalak(n, p), 0);
        if (!onena || auk.length < onena.auk.length || lit < onena.lit) onena = { auk, lit };
      }
      extra = onena.auk;
    } else {
      const geratzen = new Set(falta);
      while (geratzen.size) {
        const p = R.reduce((a, b) => [...geratzen].filter(k => estaltzen(b, k)).length > [...geratzen].filter(k => estaltzen(a, k)).length ? b : a);
        extra.push(p);
        [...geratzen].forEach(k => { if (estaltzen(p, k)) geratzen.delete(k); });
      }
    }
  }
  const gakoL = t => lits(n, t).join(' ');
  const terminoak = [...ess, ...extra].sort((a, b) => literalak(n, a) - literalak(n, b) || (gakoL(a) < gakoL(b) ? -1 : 1));
  return { terminoak, konstantea: null };
}

export function lits(n, t) {
  return IZENAK.slice(0, n).map((s, i) => { const b = 1 << (n - 1 - i); return t.m & b ? null : t.v & b ? s : s + '!'; }).filter(Boolean);
}
const litH = l => l.endsWith('!') ? ezH(l[0]) : esc(l);
export function terminoHTML(n, t) { const l = lits(n, t); return l.length ? l.map(litH).join('·') : '1'; }
export function adierazpenaHTML(n, S) {
  if (S.konstantea !== null) return `Q = ${S.konstantea}`;
  return 'Q = ' + S.terminoak.map((t, j) => `<span class="kn-t" style="--c:${KOLOREAK[j % KOLOREAK.length]}">${terminoHTML(n, t)}</span>`).join(' + ');
}

// Bi mailako zirkuitua (ETA ateak + EDO atea) adierazpen sinplifikatutik
function zirkuituaEraiki(n, S) {
  const sar = IZENAK.slice(0, n);
  const T = S.terminoak.map(t => lits(n, t));
  const ezeztuak = sar.filter(s => T.some(l => l.includes(s + '!')));
  const BUSD = ezeztuak.length ? 64 : 46;
  const XA = 40 + (n - 1) * BUSD + (ezeztuak.length ? 30 : 0) + 64;
  const XO = XA + 150;
  const ateak = [], srcs = [];
  let cur = 130;
  T.forEach((l, i) => {
    const H = l.length >= 2 ? Math.max(44, 18 * l.length + 8) : 24;
    const y = cur + H / 2;
    if (l.length >= 2) { ateak.push({ id: 't' + i, mota: 'ETA', x: XA, y, sar: l }); srcs.push('t' + i); }
    else srcs.push({ bus: l[0], y });
    cur += H + 30;
  });
  let irteera = srcs[0];
  if (srcs.length >= 2) {
    const ys = srcs.map(s => typeof s === 'object' ? s.y : ateak.find(g => g.id === s).y);
    ateak.push({ id: 'o', mota: 'EDO', x: XO, y: (Math.min(...ys) + Math.max(...ys)) / 2, sar: srcs });
    irteera = 'o';
  }
  const w = (srcs.length >= 2 ? XO : XA) + 66 + 150;
  return { sarrerak: sar, ezeztuak, ateak, irteerak: [{ izena: 'Q', src: irteera }], w: Math.max(w, 520), h: Math.max(cur, 220) };
}

export default function mount(box, opts = {}) {
  const P = 'kn' + Math.random().toString(36).slice(2, 7);
  const GAKOA = opts.gorde || null;
  const gordeta = GAKOA ? irakurri(GAKOA, null) : null;
  let modua = opts.modua === 'biegonkorra' ? 'biegonkorra' : 'diseinua';
  let aid = ADIBIDEAK[opts.adibidea] ? opts.adibidea : opts.libre ? 'hutsa3' : 'alarma';
  let n, Q; // Q[k]: 0 | 1 | 'X'
  function kargatu(id) {
    const A = ADIBIDEAK[id];
    aid = id;
    n = A.n;
    Q = Array.from({ length: 2 ** n }, (_, k) => A.bat.includes(k) ? 1 : A.x?.includes(k) ? 'X' : 0);
  }
  if (gordeta?.Q?.length && [4, 8, 16].includes(gordeta.Q.length)) { aid = gordeta.aid in ADIBIDEAK ? gordeta.aid : 'hutsa3'; n = Math.log2(gordeta.Q.length); Q = gordeta.Q; }
  else kargatu(aid);
  let sarrerak = {};
  // biegonkorra
  let S = false, R = false, q = false, qn = true, historia = [{ S: false, R: false, q: false, qn: true }];

  box.innerHTML = `
    <div class="sim kns">
      <div class="kn-modua"><div class="seg" role="group" aria-label="Modua"><button data-modua="diseinua">Egia-taulatik zirkuitura</button><button data-modua="biegonkorra">RS biegonkorra</button></div></div>
      <div class="sim-body" id="${P}-dis">
        <div class="sim-stage kn-stage">
          <div class="kn-mapa-w"><h4 class="fd-h">Karnaugh-en mapa</h4><div id="${P}-mapa"></div></div>
          <div class="kn-zirk" id="${P}-zirk"></div>
        </div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Aldagai kopurua"><button data-n="2">2 aldagai</button><button data-n="3">3 aldagai</button><button data-n="4">4 aldagai</button></div>
          <label class="fd-hautatu" for="${P}-adib">Adibidea
            <select id="${P}-adib">${Object.entries(ADIBIDEAK).map(([k, a]) => `<option value="${k}">${esc(a.izena)}</option>`).join('')}</select>
          </label>
          <p class="lab-hint" id="${P}-desk"></p>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <div><h4 class="fd-h">Egia-taula</h4><div class="table-scroll lg-taula-w"><table class="lg-taula kn-taula" id="${P}-taula"></table></div></div>
        </div>
      </div>
      <div class="sim-body" id="${P}-rs" hidden>
        <div class="sim-stage" id="${P}-rs-stage"></div>
        <div class="sim-panel">
          <p class="lab-hint">Bi EZ-EDO ate, bakoitzaren irteera bestearen sarrerara lotuta. Zirkuituak <b>gogoratu</b> egiten du: S eta R 0ra itzultzean, Q-k bere balioari eusten dio. Motor baten martxa (S) eta geldi (R) botoiak dira.</p>
          <div class="pills">
            <button class="btn" id="${P}-S" aria-pressed="false">S = 0 · Martxa</button>
            <button class="btn" id="${P}-R" aria-pressed="false">R = 0 · Geldi</button>
          </div>
          <div class="readouts" id="${P}-rs-read" aria-live="polite"></div>
          <div class="table-scroll lg-taula-w"><table class="lg-taula" id="${P}-rs-taula"></table></div>
        </div>
      </div>
      <div class="sim-foot" id="${P}-foot"></div>
    </div>`;
  const $ = s => box.querySelector(s);

  function gordeEgoera() { if (GAKOA) gorde(GAKOA, { aid, Q }); }

  // ---------- diseinua ----------
  function marraztuDiseinua() {
    const bat = Q.flatMap((v, k) => v === 1 ? [k] : []), x = Q.flatMap((v, k) => v === 'X' ? [k] : []);
    const Sm = sinplifikatu(n, bat, x);
    const sar = IZENAK.slice(0, n);
    sar.forEach(s => { sarrerak[s] = !!sarrerak[s]; });
    const uneK = sar.reduce((k, s) => k * 2 + (sarrerak[s] ? 1 : 0), 0);

    box.querySelectorAll('[data-n]').forEach(b => { b.classList.toggle('active', +b.dataset.n === n); b.setAttribute('aria-pressed', String(+b.dataset.n === n)); });
    $(`#${P}-adib`).value = aid;
    $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena || '';

    // egia-taula
    $(`#${P}-taula`).innerHTML = `<thead><tr><th class="dim">m</th>${sar.map(s => `<th>${s}</th>`).join('')}<th class="q">Q</th></tr></thead><tbody>${
      konbinazioak(sar).map((r, k) => `<tr class="${k === uneK ? 'on' : ''}"><td class="dim">${k}</td>${sar.map(s => `<td>${r[s] ? 1 : 0}</td>`).join('')}<td class="q"><button class="kn-q${Q[k] === 1 ? ' bat' : Q[k] === 'X' ? ' x' : ''}" data-k="${k}" aria-label="Q, m${k}: ${Q[k]}">${Q[k]}</button></td></tr>`).join('')
    }</tbody>`;

    // mapa
    const errV = n === 2 ? 1 : n === 3 ? 1 : 2, zutV = n - errV;
    const errak = errV === 1 ? [0, 1] : GRAY, zutak = zutV === 1 ? [0, 1] : GRAY;
    const bitak = (v, b) => v.toString(2).padStart(b, '0');
    const errIz = sar.slice(0, errV).join(''), zutIz = sar.slice(errV).join('');
    let mapa = `<table class="kn-mapa"><thead><tr><th class="kn-izk"><span>${errIz}</span><span>${zutIz}</span></th>${zutak.map(c => `<th>${bitak(c, zutV)}</th>`).join('')}</tr></thead><tbody>`;
    errak.forEach(r => {
      mapa += `<tr><th>${bitak(r, errV)}</th>`;
      zutak.forEach(c => {
        const k = (r << zutV) | c;
        const taldeak = Sm.konstantea === null ? Sm.terminoak.map((t, j) => estaltzen(t, k) ? `<i class="kn-g" style="--c:${KOLOREAK[j % KOLOREAK.length]};--j:${j}"></i>` : '').join('') : '';
        mapa += `<td class="${k === uneK ? 'on' : ''}"><button class="kn-q${Q[k] === 1 ? ' bat' : Q[k] === 'X' ? ' x' : ''}" data-k="${k}" aria-label="m${k}: ${Q[k]}">${Q[k]}</button><small>m${k}</small>${taldeak}</td>`;
      });
      mapa += '</tr>';
    });
    $(`#${P}-mapa`).innerHTML = mapa + '</tbody></table>';

    // zirkuitua
    const zk = $(`#${P}-zirk`);
    if (Sm.konstantea !== null) {
      zk.innerHTML = `<p class="kn-konst">Q = ${Sm.konstantea} beti: ez da aterik behar${Sm.konstantea ? ' (irteera tentsiora lotuta)' : ' (irteera lurrera lotuta)'}.</p>`;
    } else {
      const Z = zirkuituaEraiki(n, Sm);
      const bal = ebaluatu(Z, sarrerak);
      zk.innerHTML = zirkuituaSVG(Z, bal, { izenburua: 'Zirkuitu sinplifikatua' });
    }

    // kostua
    const mint = bat.length;
    const kanAte = mint >= 2 ? mint + 1 : mint;
    const kanSar = mint * n + (mint >= 2 ? mint : 0);
    const T = Sm.terminoak.map(t => lits(n, t));
    const sinAte = Sm.konstantea !== null ? 0 : T.filter(l => l.length >= 2).length + (T.length >= 2 ? 1 : 0);
    const sinSar = Sm.konstantea !== null ? 0 : T.reduce((s, l) => s + (l.length >= 2 ? l.length : 0), 0) + (T.length >= 2 ? T.length : 0);
    $(`#${P}-read`).innerHTML = `
      <div><span>Forma kanonikoa</span><b>${mint ? `Σm(${bat.join(', ')})` : '—'}</b></div>
      ${x.length ? `<div><span>Berdin dio (X)</span><b>${x.join(', ')}</b></div>` : ''}
      <div class="hi kn-adier"><span>Sinplifikatuta</span><b>${adierazpenaHTML(n, Sm)}</b></div>
      <div><span>ETA/EDO ateak (sarrerak)</span><b>${kanAte} (${kanSar}) → ${sinAte} (${sinSar})</b></div>`;
    $(`#${P}-foot`).innerHTML = `<span>Mapako gelaxka auzokideek bit bakar batean desberdintzen dira (Gray kodea): ertzak ere auzokideak dira.</span><span>Sakatu zirkuituaren sarrerak (0/1) konbinazio bat probatzeko.</span>`;
  }

  // ---------- RS biegonkorra ----------
  function rsKalkulatu() {
    if (S && R) { q = false; qn = false; }
    else if (S) { q = true; qn = false; }
    else if (R) { q = false; qn = true; }
    else if (q === qn) { const azkena = [...historia].reverse().find(h => h.q !== h.qn); q = azkena ? azkena.q : false; qn = !q; }
    historia.push({ S, R, q, qn });
    if (historia.length > 16) historia.shift();
  }
  function marraztuRS() {
    const g1 = atea('EZEDO', 250, 90, 2, q ? 'on' : '', true), g2 = atea('EZEDO', 250, 210, 2, qn ? 'on' : '', true);
    const H = (pts, on) => `<polyline class="lg-h${on ? ' on' : ''}" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
    const [q1x, q1y] = g1.irt, [q2x, q2y] = g2.irt;
    let s = '';
    s += H([[96, g1.sar[0][1]], g1.sar[0]], R);
    s += H([[96, g2.sar[1][1]], g2.sar[1]], S);
    s += H([[q1x, q1y], [520, q1y]], q) + H([[370, q1y], [370, 140], [200, 140], [200, g2.sar[0][1]], g2.sar[0]], q);
    s += H([[q2x, q2y], [520, q2y]], qn) + H([[390, q2y], [390, 160], [220, 160], [220, g1.sar[1][1]], g1.sar[1]], qn);
    s += `<circle class="lg-dot${q ? ' on' : ''}" cx="370" cy="${q1y}" r="3.5"/><circle class="lg-dot${qn ? ' on' : ''}" cx="390" cy="${q2y}" r="3.5"/>`;
    s += g1.svg + g2.svg;
    const inBox = (x, y, izena, on, id) => `<g class="lg-in${on ? ' on' : ''}" data-rs="${id}" role="button" tabindex="0" aria-pressed="${on}" aria-label="${izena}: ${on ? 1 : 0}"><rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="5"/><text x="${x}" y="${y + 6}" text-anchor="middle">${on ? 1 : 0}</text></g><text class="lg-sar" x="${x}" y="${y - 22}" text-anchor="middle">${izena}</text>`;
    s += inBox(80, g1.sar[0][1], 'R', R, 'R') + inBox(80, g2.sar[1][1], 'S', S, 'S');
    const lamp = (y, on, label) => `<g class="lg-lanpara${on ? ' on' : ''}"><circle cx="534" cy="${y}" r="13"/><path d="M528 ${y - 6} L540 ${y + 6} M540 ${y - 6} L528 ${y + 6}"/></g><text class="lg-irt" x="556" y="${y + 5}">${label} = ${on ? 1 : 0}</text>`;
    s += lamp(q1y, q, 'Q') + lamp(q2y, qn, ezS('Q'));
    s += `<g class="kn-motor${q ? ' on' : ''}" transform="translate(470 40)"><circle r="17"/><text y="5" text-anchor="middle">M</text></g><text class="lg-izena" x="440" y="44" text-anchor="end">${q ? 'motorra martxan' : 'motorra geldi'}</text>`;
    // denbora-diagrama
    const X0 = 70, X1 = 600, dx = (X1 - X0) / 16;
    const seinalea = (izena, y, f) => {
      let d = '';
      historia.forEach((h, i) => { const yy = f(h) ? y - 16 : y; d += (i ? ` L${X0 + i * dx} ${yy}` : `M${X0} ${yy}`) + ` L${X0 + (i + 1) * dx} ${yy}`; });
      return `<text class="lg-sar" x="${X0 - 12}" y="${y - 2}" text-anchor="end">${izena}</text><line class="kn-ax" x1="${X0}" y1="${y}" x2="${X1}" y2="${y}"/><path class="kn-uhin" d="${d}"/>`;
    };
    s += `<text class="fd-h-svg" x="${X0}" y="276">Denbora-diagrama (aldaketa bakoitza, ezkerretik eskuinera)</text>`;
    s += seinalea('S', 312, h => h.S) + seinalea('R', 344, h => h.R) + seinalea('Q', 376, h => h.q);
    $(`#${P}-rs-stage`).innerHTML = `<svg viewBox="0 0 640 392" role="img" aria-label="RS biegonkorra EZ-EDO ateekin: S = ${S ? 1 : 0}, R = ${R ? 1 : 0}, Q = ${q ? 1 : 0}"><g class="lg">${s}</g></svg>`;

    const debekatua = S && R;
    $(`#${P}-S`).textContent = `S = ${S ? 1 : 0} · Martxa`;
    $(`#${P}-R`).textContent = `R = ${R ? 1 : 0} · Geldi`;
    $(`#${P}-S`).setAttribute('aria-pressed', String(S));
    $(`#${P}-R`).setAttribute('aria-pressed', String(R));
    $(`#${P}-S`).classList.toggle('primary', S);
    $(`#${P}-R`).classList.toggle('primary', R);
    $(`#${P}-rs-read`).innerHTML = `
      <div class="hi"><span>Q</span><b>${q ? 1 : 0}</b></div>
      <div><span>${ezH('Q')}</span><b>${qn ? 1 : 0}</b></div>
      <div><span>Egoera</span><b>${debekatua ? 'debekatua: Q = Q̅ = 0' : S ? 'ezarri (set)' : R ? 'berrezarri (reset)' : 'memoria: aurreko balioa'}</b></div>`;
    const errenk = [['0', '0', 'Q (aurrekoa)', 'memoria'], ['1', '0', '1', 'ezarri'], ['0', '1', '0', 'berrezarri'], ['1', '1', '—', 'debekatua']];
    const une = debekatua ? 3 : S ? 1 : R ? 2 : 0;
    $(`#${P}-rs-taula`).innerHTML = `<thead><tr><th>S</th><th>R</th><th class="q">Q</th><th>Egoera</th></tr></thead><tbody>${errenk.map((r, i) => `<tr class="${i === une ? 'on' : ''}"><td>${r[0]}</td><td>${r[1]}</td><td class="q">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>`;
    $(`#${P}-foot`).innerHTML = debekatua ? '<span style="color:var(--danger);font-weight:700">S = R = 1 debekatua da: Q eta Q̅ biak 0 dira, eta biak 0ra itzultzean ezin da jakin zein geratuko den.</span>' : '<span>Sakatu S, gero askatu (0): Q = 1 geratzen da. Sakatu R, eta askatu: Q = 0.</span>';
  }

  function marraztu() {
    box.querySelectorAll('[data-modua]').forEach(b => { b.classList.toggle('active', b.dataset.modua === modua); b.setAttribute('aria-pressed', String(b.dataset.modua === modua)); });
    $(`#${P}-dis`).hidden = modua !== 'diseinua';
    $(`#${P}-rs`).hidden = modua !== 'biegonkorra';
    if (modua === 'diseinua') marraztuDiseinua(); else marraztuRS();
  }

  box.addEventListener('click', e => {
    const q0 = e.target.closest('.kn-q');
    if (q0) {
      const k = +q0.dataset.k;
      Q[k] = Q[k] === 0 ? 1 : Q[k] === 1 ? 'X' : 0;
      gordeEgoera();
      marraztu();
      box.querySelector(`${q0.closest('.kn-mapa') ? '.kn-mapa' : '.kn-taula'} .kn-q[data-k="${k}"]`)?.focus({ preventScroll: true });
      return;
    }
    const inp = e.target.closest('[data-in]');
    if (inp) { sarrerak[inp.dataset.in] = !sarrerak[inp.dataset.in]; marraztu(); box.querySelector(`[data-in="${inp.dataset.in}"]`)?.focus({ preventScroll: true }); return; }
    const rs = e.target.closest('[data-rs]');
    if (rs) { if (rs.dataset.rs === 'S') S = !S; else R = !R; rsKalkulatu(); marraztu(); box.querySelector(`[data-rs="${rs.dataset.rs}"]`)?.focus({ preventScroll: true }); }
  });
  box.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('[data-in], [data-rs]');
    if (!t) return;
    e.preventDefault();
    t.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  box.querySelectorAll('[data-modua]').forEach(b => b.addEventListener('click', () => { modua = b.dataset.modua; marraztu(); }));
  box.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
    if (+b.dataset.n === n) return;
    kargatu('hutsa' + b.dataset.n);
    sarrerak = {};
    gordeEgoera();
    marraztu();
  }));
  $(`#${P}-adib`).addEventListener('change', e => { kargatu(e.target.value); sarrerak = {}; gordeEgoera(); marraztu(); });
  $(`#${P}-S`).addEventListener('click', () => { S = !S; rsKalkulatu(); marraztu(); });
  $(`#${P}-R`).addEventListener('click', () => { R = !R; rsKalkulatu(); marraztu(); });

  marraztu();
}
