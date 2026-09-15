// Ate logikoen ikurrak (ANSI forma bereizgarriak) eta zirkuitu logiko txikien marrazkia, SVG testu gisa.
// Zirkuitua:
//   { sarrerak: ['A', 'B'…], ezeztuak?: ['B'] (B̅ busa ere marraztu, EZ ate batekin),
//     ateak: [{ id, mota, x, y, sar: ['A', 'B!', 'g1', { bus: 'A!', y }] }]   (ordena topologikoan)
//     irteerak: [{ izena, src, y? }], w, h }
// Sarrera bakoitza goiko bus bertikal bat da; ateen sarrerak busetik horizontalki hartzen dira.
import { esc } from '../util.js';

export const ATEAK = {
  EZ: { izena: 'EZ', en: 'NOT', n: 1, f: v => !v[0] },
  ETA: { izena: 'ETA', en: 'AND', n: 2, f: v => v.every(Boolean) },
  EDO: { izena: 'EDO', en: 'OR', n: 2, f: v => v.some(Boolean) },
  EZETA: { izena: 'EZ-ETA', en: 'NAND', n: 2, f: v => !v.every(Boolean) },
  EZEDO: { izena: 'EZ-EDO', en: 'NOR', n: 2, f: v => !v.some(Boolean) },
  EDOB: { izena: 'EDO-B', en: 'XOR', n: 2, f: v => v.filter(Boolean).length % 2 === 1 }
};

// Aldagai ezeztatua HTMLn eta SVGn (goiko marra)
export const ezH = s => `<span class="ez">${esc(s)}</span>`;
export const ezS = s => `<tspan text-decoration="overline">${esc(s)}</tspan>`;

const GW = 66;

// Ate bat: (x, y) ezkerreko ertza eta erdiko altuera. Itzuli: { svg, sar: [[x, y]…], irt: [x, y] }
export function atea(mota, x, y, n = 2, cls = '', etiketa = true) {
  const bubble = mota === 'EZ' || mota === 'EZETA' || mota === 'EZEDO';
  const H = mota === 'EZ' ? 36 : Math.max(44, 18 * n + 8);
  const B = bubble ? GW - 10 : GW;
  const yt = y - H / 2, yb = y + H / 2;
  const tartea = n === 1 ? 0 : Math.min(26, (H - 16) / (n - 1));
  const pinY = Array.from({ length: n }, (_, i) => y + (i - (n - 1) / 2) * tartea);
  let d, pinX = () => x, ox;
  if (mota === 'EZ') {
    d = `M${x} ${yt} L${x + B} ${y} L${x} ${yb} Z`;
    ox = x + B;
  } else if (mota === 'ETA' || mota === 'EZETA') {
    const L = B - H / 2;
    d = `M${x} ${yt} H${x + L} A${H / 2} ${H / 2} 0 0 1 ${x + L} ${yb} H${x} Z`;
    ox = x + B;
  } else {
    const s = mota === 'EDOB' ? 9 : 0, c = 14, bx = x + s, bw = B - s;
    d = `M${bx} ${yt} Q${bx + 0.55 * bw} ${yt} ${bx + bw} ${y} Q${bx + 0.55 * bw} ${yb} ${bx} ${yb} Q${bx + c} ${y} ${bx} ${yt} Z`;
    if (s) d += ` M${x} ${yt} Q${x + c} ${y} ${x} ${yb}`;
    pinX = py => { const t = (py - yt) / H; return x + 2 * t * (1 - t) * c; };
    ox = x + B;
  }
  let svg = `<path class="lg-atea ${cls}" d="${d}"/>`;
  if (bubble) svg += `<circle class="lg-atea ${cls}" cx="${ox + 5}" cy="${y}" r="5"/>`;
  if (etiketa) svg += `<text class="lg-izena" x="${x + B / 2}" y="${yb + 15}" text-anchor="middle">${ATEAK[mota].izena}</text>`;
  return { svg, sar: pinY.map(py => [pinX(py), py]), irt: [bubble ? ox + 10 : ox, y] };
}

// Balioak kalkulatu: sarrerak { A: true… } → { A, 'A!', g1… }
export function ebaluatu(Z, sarrerak) {
  const bal = {};
  Z.sarrerak.forEach(s => { bal[s] = !!sarrerak[s]; bal[s + '!'] = !sarrerak[s]; });
  const irakurri = src => typeof src === 'object' ? bal[src.bus] : bal[src];
  Z.ateak.forEach(g => { bal[g.id] = ATEAK[g.mota].f(g.sar.map(irakurri)); });
  Z.irteerak.forEach(o => { bal['Q:' + o.izena] = irakurri(o.src); });
  return bal;
}

const hari = (pts, on) => `<polyline class="lg-h${on ? ' on' : ''}" points="${pts.map(p => p.map(v => Math.round(v * 10) / 10).join(',')).join(' ')}"/>`;

export function zirkuituaSVG(Z, bal, { izenburua = 'Zirkuitu logikoa', etiketak = {} } = {}) {
  const ez = new Set(Z.ezeztuak || []);
  const BUS0 = 40, BUSD = ez.size ? 64 : 46, NEGD = 30, Y0 = 56;
  const busX = {};
  Z.sarrerak.forEach((s, i) => {
    busX[s] = BUS0 + i * BUSD;
    if (ez.has(s)) busX[s + '!'] = BUS0 + i * BUSD + NEGD;
  });
  const busEnd = {};
  const gates = {};
  let gSvg = '', wires = '', dots = '', vals = '';
  Z.ateak.forEach(g => {
    gates[g.id] = atea(g.mota, g.x, g.y, g.sar.length, bal[g.id] ? 'on' : '', Z.etiketak !== false);
    gSvg += gates[g.id].svg;
  });
  const lotu = (src, px, py, mx) => {
    const bus = typeof src === 'object' ? src.bus : src in busX ? src : null;
    if (bus) {
      const on = bal[bus];
      const ry = typeof src === 'object' ? src.y : py;
      wires += ry === py ? hari([[busX[bus], py], [px, py]], on) : hari([[busX[bus], ry], [mx, ry], [mx, py], [px, py]], on);
      dots += `<circle class="lg-dot${on ? ' on' : ''}" cx="${busX[bus]}" cy="${ry}" r="3.5"/>`;
      busEnd[bus] = Math.max(busEnd[bus] || 0, ry);
      return;
    }
    const [ox, oy] = gates[src].irt, on = bal[src];
    wires += Math.abs(oy - py) < 0.5 ? hari([[ox, oy], [px, py]], on) : hari([[ox, oy], [mx, oy], [mx, py], [px, py]], on);
  };
  Z.ateak.forEach(g => {
    const n = g.sar.length;
    g.sar.forEach((src, i) => {
      const [px, py] = gates[g.id].sar[i];
      const mx = g.mx?.[i] ?? px - 18 - Math.abs(i - (n - 1) / 2) * 9;
      lotu(src, px, py, mx);
    });
  });
  Z.ateak.forEach(g => {
    const [ox, oy] = gates[g.id].irt;
    vals += `<text class="lg-bal${bal[g.id] ? ' on' : ''}" x="${ox + 5}" y="${oy - 7}">${bal[g.id] ? 1 : 0}</text>`;
  });

  // irteerak: lanparak eskuinean
  const LX = Z.w - 74;
  let lamps = '';
  Z.irteerak.forEach(o => {
    const on = bal['Q:' + o.izena];
    const y = o.y ?? (typeof o.src === 'object' ? o.src.y : gates[o.src]?.irt[1] ?? 120);
    lotu(o.src, LX - 13, y, LX - 30);
    lamps += `<g class="lg-lanpara${on ? ' on' : ''}"><circle cx="${LX}" cy="${y}" r="13"/><path d="M${LX - 6} ${y - 6} L${LX + 6} ${y + 6} M${LX + 6} ${y - 6} L${LX - 6} ${y + 6}"/></g>
      <text class="lg-irt" x="${LX + 20}" y="${y + 5}">${o.html || esc(o.izena)} = ${on ? 1 : 0}</text>`;
  });

  // busak
  let buses = '';
  Z.sarrerak.forEach(s => {
    const x = busX[s], on = bal[s];
    const end = Math.max(busEnd[s] || 0, ez.has(s) ? 66 : Y0 + 20);
    buses += hari([[x, Y0], [x, end]], on);
    buses += `<g class="lg-in${on ? ' on' : ''}" data-in="${esc(s)}" role="button" tabindex="0" aria-pressed="${on}" aria-label="${esc(etiketak[s] || s)} sarrera: ${on ? 1 : 0}">
      <rect x="${x - 15}" y="${Y0 - 36}" width="30" height="30" rx="5"/><text x="${x}" y="${Y0 - 15}" text-anchor="middle">${on ? 1 : 0}</text></g>
      <text class="lg-sar" x="${x}" y="${Y0 - 43}" text-anchor="middle">${esc(s)}</text>`;
    if (ez.has(s)) {
      const nx = busX[s + '!'], non = bal[s + '!'];
      buses += hari([[x, 66], [nx, 66], [nx, 70]], on) + `<circle class="lg-dot${on ? ' on' : ''}" cx="${x}" cy="66" r="3.5"/>`;
      buses += `<path class="lg-atea${non ? ' on' : ''}" d="M${nx - 9} 70 L${nx + 9} 70 L${nx} 88 Z"/><circle class="lg-atea${non ? ' on' : ''}" cx="${nx}" cy="92" r="4"/>`;
      buses += hari([[nx, 96], [nx, Math.max(busEnd[s + '!'] || 0, 110)]], non);
      buses += `<text class="lg-sar sm" x="${nx + 7}" y="112">${ezS(s)}</text>`;
    }
  });

  return `<svg viewBox="0 0 ${Z.w} ${Z.h}" role="img" aria-label="${esc(izenburua)}">
    <g class="lg">${buses}${wires}${dots}${gSvg}${vals}${lamps}</g></svg>`;
}

// Egia-taula: errenkada guztiak, sarrera-konbinazio bakoitzeko
export function konbinazioak(sarrerak) {
  const n = sarrerak.length;
  return Array.from({ length: 2 ** n }, (_, k) => Object.fromEntries(sarrerak.map((s, i) => [s, !!(k >> (n - 1 - i) & 1)])));
}
