// Serie-paralelo zirkuituak zuhaitz gisa: marraztu (SVG testua), ebatzi eta urratsez urrats sinplifikatu.
//   hostoa:   { t: 'R', izena: 'R1', R: 10 }
//   seriea:   { t: 'S', ume: [...] }
//   paraleloa:{ t: 'P', ume: [...] }
import { fmt, esc } from './util.js';

export const R = (izena, R) => ({ t: 'R', izena, R });
export const Sr = (...ume) => ({ t: 'S', ume });
export const Pr = (...ume) => ({ t: 'P', ume });

export function baliokidea(n) {
  if (n.t === 'R') return n.R;
  if (n.t === 'S') return n.ume.reduce((s, u) => s + baliokidea(u), 0);
  return 1 / n.ume.reduce((s, u) => s + 1 / baliokidea(u), 0);
}

// Hosto bakoitzaren tentsioa eta korrontea, adar osoaren tentsioa U bada
export function ebatzi(n, U, out = {}) {
  if (n.t === 'R') { out[n.izena] = { V: U, I: U / n.R, R: n.R }; return out; }
  if (n.t === 'S') {
    const I = U / baliokidea(n);
    n.ume.forEach(u => ebatzi(u, I * baliokidea(u), out));
  } else {
    n.ume.forEach(u => ebatzi(u, U, out));
  }
  return out;
}

export const hostoak = n => n.t === 'R' ? [n] : n.ume.flatMap(hostoak);

// Formula testuan: R1 + (R2 ∥ R3)
export function formula(n, top = true) {
  if (n.t === 'R') return n.izena;
  const s = n.ume.map(u => formula(u, false)).join(n.t === 'S' ? ' + ' : ' ∥ ');
  return top ? s : `(${s})`;
}

// Sinplifikazio-urrats bat: umeak hosto guztiak dituen talde sakonena → erresistentzia baliokide bakarra
export function urratsa(n) {
  if (n.t === 'R') return null;
  if (n.ume.every(u => u.t === 'R')) {
    const izena = 'R' + n.ume.map(u => u.izena.replace(/^R/, '')).join('');
    return { zuhaitza: { t: 'R', izena, R: baliokidea(n), berria: true }, taldea: n, izena };
  }
  for (let i = 0; i < n.ume.length; i++) {
    const r = urratsa(n.ume[i]);
    if (r) {
      const ume = n.ume.slice();
      ume[i] = r.zuhaitza;
      // talde bereko umeak berdintzen dira (S barruan S → zabaldu)
      const flat = ume.flatMap(u => u.t === n.t ? u.ume : [u]);
      return { ...r, zuhaitza: flat.length === 1 ? flat[0] : { t: n.t, ume: flat } };
    }
  }
  return null;
}

// Talde baten erresistentzia baliokidearen kalkulua, testuan
export function taldeTestua(izena, g) {
  const names = g.ume.map(u => u.izena), vals = g.ume.map(u => fmt(u.R));
  const Rq = baliokidea(g);
  if (g.t === 'S') return `${izena} = ${names.join(' + ')} = ${vals.join(' + ')} = ${fmt(Rq)} Ω`;
  if (g.ume.length === 2) return `${izena} = ${names[0]} · ${names[1]} / (${names[0]} + ${names[1]}) = ${vals[0]} · ${vals[1]} / (${vals[0]} + ${vals[1]}) = ${fmt(Rq)} Ω`;
  return `1/${izena} = ${names.map(n => '1/' + n).join(' + ')} = ${vals.map(v => '1/' + v).join(' + ')} → ${izena} = ${fmt(Rq)} Ω`;
}

// Sinplifikazio osoa: urrats bakoitzaren testua eta zuhaitza
export function murrizketa(tree) {
  const urratsak = [];
  let t = tree, r;
  while ((r = urratsa(t))) {
    urratsak.push({ testua: taldeTestua(r.izena, r.taldea), zuhaitza: r.zuhaitza, taldea: r.taldea, izena: r.izena });
    t = r.zuhaitza;
  }
  return urratsak;
}

// ---------- marrazkia ----------
const U = 92, V = 64;

function size(n) {
  if (n.t === 'R') return { w: 1, h: 1 };
  const s = n.ume.map(size);
  if (n.t === 'S') return { w: s.reduce((a, b) => a + b.w, 0), h: Math.max(...s.map(b => b.h)) };
  return { w: Math.max(...s.map(b => b.w)) + 0.4, h: s.reduce((a, b) => a + b.h, 0) };
}

// Marraztu `n` (x, y)-tik (x + w·U, y)-raino. Itzuli: SVG testua
function draw(n, x, y, w, o) {
  let s = '';
  const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  if (n.t === 'R') {
    const cx = x + w * U / 2;
    s += line(x, y, cx - 22, y) + line(cx + 22, y, x + w * U, y);
    const hl = o.nabarmendu?.includes(n.izena);
    s += `<rect x="${cx - 22}" y="${y - 8}" width="44" height="16" fill="${n.berria ? 'var(--chip)' : 'var(--sheet)'}" ${hl ? 'stroke="var(--s1)" stroke-width="3"' : ''}/>`;
    o.labels.push(`<text x="${cx}" y="${y - 15}" text-anchor="middle" font-size="14" font-weight="700">${esc(n.izena)}${o.balioak ? ` = ${fmt(n.R)} Ω` : ''}</text>`);
    if (o.emaitzak?.[n.izena]) {
      const e = o.emaitzak[n.izena];
      o.labels.push(`<text x="${cx}" y="${y + 24}" text-anchor="middle" font-size="12.5" fill="var(--s1)">${fmt(e.V)} V · ${fmt(e.I, 3)} A</text>`);
    }
    return s;
  }
  if (n.t === 'S') {
    let cx = x;
    n.ume.forEach((u, i) => {
      const sw = size(u).w;
      const last = i === n.ume.length - 1;
      const ww = last ? (x + w * U - cx) / U : sw;
      s += draw(u, cx, y, ww, o);
      cx += ww * U;
    });
    return s;
  }
  // paraleloa: errailak x + 0.2U eta x + (w − 0.2)U
  const xl = x + 0.2 * U, xr = x + (w - 0.2) * U;
  s += line(x, y, xl, y) + line(xr, y, x + w * U, y);
  let cy = y;
  const ys = [];
  n.ume.forEach(u => {
    ys.push(cy);
    s += draw(u, xl, cy, (xr - xl) / U, o);
    cy += size(u).h * V;
  });
  s += line(xl, y, xl, ys[ys.length - 1]) + line(xr, y, xr, ys[ys.length - 1]);
  o.dots.push([xl, y], [xr, y]);
  return s;
}

// Zirkuitu osoa: zuhaitza goian, pila ezkerrean
export function eskemaSVG(tree, { E, balioak = true, emaitzak = null, nabarmendu = null, izenburua = '' } = {}) {
  const o = { labels: [], dots: [], balioak, emaitzak, nabarmendu };
  const sz = size(tree);
  const x0 = 60, y0 = 44;
  const W = Math.max(sz.w, 2) * U;
  const yb = y0 + Math.max(sz.h, 1.4) * V + 10;
  let s = draw(tree, x0, y0, W / U, o);
  const mid = (y0 + yb) / 2;
  s += `<line x1="${x0 + W}" y1="${y0}" x2="${x0 + W}" y2="${yb}"/><line x1="${x0}" y1="${yb}" x2="${x0 + W}" y2="${yb}"/>`;
  s += `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${mid - 6}"/><line x1="${x0}" y1="${mid + 6}" x2="${x0}" y2="${yb}"/>`;
  s += `<line x1="${x0 - 18}" y1="${mid - 6}" x2="${x0 + 18}" y2="${mid - 6}"/><line x1="${x0 - 9}" y1="${mid + 6}" x2="${x0 + 9}" y2="${mid + 6}" stroke-width="6"/>`;
  if (E !== undefined) o.labels.push(`<text x="${x0 - 24}" y="${mid + 5}" text-anchor="end" font-size="14" font-weight="700">${fmt(E)} V</text>`);
  const w = x0 + W + 30, h = yb + 20;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(izenburua || 'Zirkuitu-eskema: ' + formula(tree))}">
    <g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">${s}</g>
    ${o.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="var(--ink)"/>`).join('')}
    <g fill="var(--ink)" font-family="Lato, system-ui, sans-serif">${o.labels.join('')}</g>
  </svg>`;
}

// ---------- Kirchhoff-en irudiak ----------
const FONT = 'font-family="Lato, system-ui, sans-serif"';
const lbl = (v, u) => typeof v === 'number' ? `${fmt(v)} ${u}` : v;
const tri = (x, y, dir, col = 'var(--s1)') => {
  const d = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[dir];
  const px = -d[1], py = d[0];
  return `<path d="M${x + d[0] * 8} ${y + d[1] * 8} L${x - d[0] * 6 + px * 6} ${y - d[1] * 6 + py * 6} L${x - d[0] * 6 - px * 6} ${y - d[1] * 6 - py * 6} Z" fill="${col}"/>`;
};
// Pila bertikala (+ goian) edo horizontala (+ ezkerrean), (x, y) erdian
const pilaIk = (x, y, bertikala, plusBehean = false) => {
  const s = plusBehean ? -1 : 1;
  return bertikala
    ? `<line x1="${x - 18}" y1="${y - 7 * s}" x2="${x + 18}" y2="${y - 7 * s}" stroke="var(--ink)" stroke-width="2.5"/><line x1="${x - 9}" y1="${y + 7 * s}" x2="${x + 9}" y2="${y + 7 * s}" stroke="var(--ink)" stroke-width="6"/><text x="${x + 24}" y="${y - 10 * s + 4}" font-size="15" font-weight="700" fill="var(--s4)" ${FONT}>+</text>`
    : `<line x1="${x - 7 * s}" y1="${y - 18}" x2="${x - 7 * s}" y2="${y + 18}" stroke="var(--ink)" stroke-width="2.5"/><line x1="${x + 7 * s}" y1="${y - 9}" x2="${x + 7 * s}" y2="${y + 9}" stroke="var(--ink)" stroke-width="6"/><text x="${x - 12 * s - 4}" y="${y - 20}" font-size="15" font-weight="700" fill="var(--s4)" ${FONT}>+</text>`;
};
// Erloju-orratzen noranzkoko gezi zirkularra
const arku = (cx, cy, r, izena, col) => {
  const a0 = -Math.PI * 2 / 3, x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), ex = cx - r, ey = cy;
  return `<path d="M${x0} ${y0} A${r} ${r} 0 1 1 ${ex} ${ey}" fill="none" stroke="${col}" stroke-width="2.5"/>
    <path d="M${ex - 6} ${ey + 9} L${ex} ${ey} L${ex + 6} ${ey + 9}" fill="none" stroke="${col}" stroke-width="2.5"/>
    <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="17" font-weight="700" fill="${col}" ${FONT}>${izena}</text>`;
};

// Bi sareko zirkuitua: E₁ ezkerrean, R₁ goian ezkerrean, R₂ erdian, R₃ goian eskuinean, E₂ eskuinean (+ goian biak).
// adarrak: { I1 (gora E₁-etik), I2 (behera R₂-tik), I3 (eskuinera R₃-tik) } — zenbakiak (zeinuarekin) edo testua
export function bisareSVG({ E1 = 'E₁', E2 = 'E₂', R1 = 'R₁', R2 = 'R₂', R3 = 'R₃', sareak = false, adarrak = null } = {}) {
  const xL = 110, xM = 290, xR = 470, yT = 44, yB = 214, cy = 129;
  const c1 = (xL + xM) / 2, c3 = (xM + xR) / 2;
  const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  let w = L(xL, yT, xL, cy - 7) + L(xL, cy + 7, xL, yB) + L(xR, yT, xR, cy - 7) + L(xR, cy + 7, xR, yB) + L(xL, yB, xR, yB);
  w += L(xL, yT, c1 - 27, yT) + L(c1 + 27, yT, xM, yT) + L(xM, yT, c3 - 27, yT) + L(c3 + 27, yT, xR, yT);
  w += L(xM, yT, xM, cy - 27) + L(xM, cy + 27, xM, yB);
  let s = `<g stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round">${w}</g>
    <rect x="${c1 - 27}" y="${yT - 8}" width="54" height="16" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <rect x="${c3 - 27}" y="${yT - 8}" width="54" height="16" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <rect x="${xM - 8}" y="${cy - 27}" width="16" height="54" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    ${pilaIk(xL, cy, true)}${pilaIk(xR, cy, true)}
    <circle cx="${xM}" cy="${yT}" r="4.5" fill="var(--ink)"/><circle cx="${xM}" cy="${yB}" r="4.5" fill="var(--ink)"/>
    <g font-size="14.5" font-weight="700" fill="var(--ink)" ${FONT}>
      <text x="${xL - 26}" y="${cy + 5}" text-anchor="end">E₁ = ${esc(lbl(E1, 'V'))}</text>
      <text x="${xR + 30}" y="${cy + 5}">E₂ = ${esc(lbl(E2, 'V'))}</text>
      <text x="${c1}" y="${yT - 16}" text-anchor="middle">R₁ = ${esc(lbl(R1, 'Ω'))}</text>
      <text x="${c3}" y="${yT - 16}" text-anchor="middle">R₃ = ${esc(lbl(R3, 'Ω'))}</text>
      <text x="${xM + 16}" y="${cy + 5}">R₂ = ${esc(lbl(R2, 'Ω'))}</text>
    </g>`;
  if (sareak) s += arku(c1, cy + 8, 34, 'J₁', 'var(--s3)') + arku(c3 + 10, cy + 8, 34, 'J₂', 'var(--s3)');
  if (adarrak) {
    const A = (v, pos, neg, x, y, lx, ly, anchor, izena) => {
      if (v === undefined) return '';
      const num = typeof v === 'number';
      return tri(x, y, num && v < 0 ? neg : pos) + `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="13.5" font-weight="700" fill="var(--s1)" ${FONT}>${izena} = ${num ? fmt(Math.abs(v), 3) + ' A' : esc(v)}</text>`;
    };
    s += A(adarrak.I1, 'u', 'd', xL, 82, xL - 14, 86, 'end', 'I₁');
    s += A(adarrak.I2, 'd', 'u', xM, cy + 50, xM + 16, cy + 55, 'start', 'I₂');
    s += A(adarrak.I3, 'r', 'l', 425, yT, 425, yT + 26, 'middle', 'I₃');
  }
  return `<svg viewBox="0 0 600 240" role="img" aria-label="Bi sareko zirkuitua: bi pila eta hiru erresistentzia">${s}</svg>`;
}

// Nodo bat eta bertako adarrak: [{ izena, testua, sartu: true | false | null }]
export function nodoSVG(adarrak) {
  const cx = 170, cy = 122, Lr = 80, n = adarrak.length;
  let s = '';
  adarrak.forEach((a, i) => {
    const ang = Math.PI + i * 2 * Math.PI / n;
    const ex = cx + Lr * Math.cos(ang), ey = cy + Lr * Math.sin(ang);
    s += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="var(--ink)" stroke-width="2.5"/>`;
    if (a.sartu !== null && a.sartu !== undefined) {
      const mx = cx + 0.55 * Lr * Math.cos(ang), my = cy + 0.55 * Lr * Math.sin(ang);
      const dir = a.sartu ? ang + Math.PI : ang;
      const dx = Math.cos(dir), dy = Math.sin(dir), px = -dy, py = dx;
      s += `<path d="M${mx + dx * 8} ${my + dy * 8} L${mx - dx * 6 + px * 6} ${my - dy * 6 + py * 6} L${mx - dx * 6 - px * 6} ${my - dy * 6 - py * 6} Z" fill="var(--s1)"/>`;
    }
    const lx = cx + (Lr + 16) * Math.cos(ang), ly = cy + (Lr + 16) * Math.sin(ang) + 5;
    const anchor = Math.cos(ang) > 0.3 ? 'start' : Math.cos(ang) < -0.3 ? 'end' : 'middle';
    s += `<text x="${lx}" y="${ly + (Math.abs(Math.cos(ang)) <= 0.3 ? Math.sign(Math.sin(ang)) * 6 : 0)}" text-anchor="${anchor}" font-size="14.5" font-weight="700" fill="${a.testua === '?' ? 'var(--s4)' : 'var(--ink)'}" ${FONT}>${esc(a.izena)} = ${esc(a.testua)}</text>`;
  });
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="var(--ink)"/>`;
  return `<svg viewBox="0 0 340 244" role="img" aria-label="Nodo bat eta bertara lotutako adarrak">${s}</svg>`;
}

// Begizta bat: [{ mota: 'E' | 'R', izena, testua, plusBehean? }] — ezkerra, goia, eskuina, behea
export function begiztaSVG(elementuak) {
  const x1 = 110, x2 = 330, y1 = 50, y2 = 196, cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const sides = [
    { x: x1, y: cy, v: true, a: [x1, y2, x1, y1] }, { x: cx, y: y1, v: false, a: [x1, y1, x2, y1] },
    { x: x2, y: cy, v: true, a: [x2, y1, x2, y2] }, { x: cx, y: y2, v: false, a: [x2, y2, x1, y2] }
  ];
  let s = '', lines = '';
  sides.forEach((sd, i) => {
    const el = elementuak[i];
    const [ax, ay, bx, by] = sd.a;
    if (!el) { lines += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"/>`; return; }
    const g = el.mota === 'R' ? 27 : 7;
    if (sd.v) lines += `<line x1="${sd.x}" y1="${y1}" x2="${sd.x}" y2="${cy - g}"/><line x1="${sd.x}" y1="${cy + g}" x2="${sd.x}" y2="${y2}"/>`;
    else lines += `<line x1="${x1}" y1="${sd.y}" x2="${cx - g}" y2="${sd.y}"/><line x1="${cx + g}" y1="${sd.y}" x2="${x2}" y2="${sd.y}"/>`;
    if (el.mota === 'R') s += sd.v ? `<rect x="${sd.x - 8}" y="${cy - 27}" width="16" height="54" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>` : `<rect x="${cx - 27}" y="${sd.y - 8}" width="54" height="16" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>`;
    else s += pilaIk(sd.x, sd.y, sd.v, el.plusBehean);
    const txt = `${el.izena} = ${el.testua}`, col = el.testua === '?' ? 'var(--s4)' : 'var(--ink)';
    const pos = [[x1 - 28, cy + 5, 'end'], [cx, y1 - 16, 'middle'], [x2 + (el.mota === 'E' ? 44 : 28), cy + 5, 'start'], [cx, y2 + 30, 'middle']][i];
    s += `<text x="${pos[0]}" y="${pos[1]}" text-anchor="${pos[2]}" font-size="14.5" font-weight="700" fill="${col}" ${FONT}>${esc(txt)}</text>`;
  });
  s = `<g stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round">${lines}</g>` + s +
    arku(cx, cy + 6, 30, '', 'var(--s3)') + `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="11.5" fill="var(--s3)" font-weight="700" ${FONT}>I</text>`;
  return `<svg viewBox="0 0 440 240" role="img" aria-label="Begizta itxi bat: sorgailuak eta erresistentziak">${s}</svg>`;
}

// ---------- erresistentzien kolore-kodea ----------
export const KOLOREAK = [
  ['beltza', '#1f1d1a'], ['marroia', '#8b5a2b'], ['gorria', '#d63a2f'], ['laranja', '#f08a24'], ['horia', '#f2d024'],
  ['berdea', '#2e9e4f'], ['urdina', '#2f6fd6'], ['morea', '#8a4fc9'], ['grisa', '#8a8a8a'], ['zuria', '#f4f4f4']
];
export const TOLERANTZIAK = { urrea: ['#c9a13b', 5], zilarra: ['#b9bcc2', 10], marroia: ['#8b5a2b', 1] };

// [d1, d2, biderkatzailea (−1 = urrea ×0,1), tolerantzia-izena]
export function erresistentziaSVG([d1, d2, m, tol = 'urrea'], zabalera = 300) {
  const band = i => i === -1 ? TOLERANTZIAK.urrea[0] : KOLOREAK[i][1];
  const bx = [110, 140, 170, 224];
  const cols = [band(d1), band(d2), band(m), TOLERANTZIAK[tol][0]];
  return `<svg viewBox="0 0 330 90" width="${zabalera}" role="img" aria-label="Erresistentzia koloreekin">
    <line x1="10" y1="45" x2="320" y2="45" stroke="var(--ink3)" stroke-width="4"/>
    <rect x="90" y="18" width="150" height="54" rx="22" fill="#e8d3a8" stroke="var(--ink)" stroke-width="2"/>
    ${bx.map((x, i) => `<rect x="${x}" y="18" width="${i === 3 ? 12 : 14}" height="54" fill="${cols[i]}" stroke="rgba(0,0,0,.25)"/>`).join('')}
  </svg>`;
}
