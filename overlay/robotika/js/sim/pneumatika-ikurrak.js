// Ikur pneumatikoak (ISO 1219, sinplifikatuta), SVG testu gisa: balbulak, zilindroak, iturria, ihesa eta lerroak.
// Balbuletan kutxak lerratu egiten dira: aktibo dagoen kutxa beti portu finkoen gainean dago (FluidSIM-en bezala).
// Kutxen ordena: ezkerrekoa = eragindako posizioa (1), eskuinekoa = atseden-posizioa (0).

export const BH = 46;
const BW = { '32': 60, '52': 84 };
// portua: [x kutxan, 0 goian | 1 behean]
const PORTUAK = { '32': { A: [20, 0], P: [20, 1], R: [44, 1] }, '52': { 4: [22, 0], 2: [62, 0], 5: [12, 1], 1: [42, 1], 3: [72, 1] } };
const KUTXAK = {
  '32': [{ bideak: [['A', 'R']], itxiak: ['P'] }, { bideak: [['P', 'A']], itxiak: ['R'] }],
  '52': [{ bideak: [['1', '2'], ['4', '5']], itxiak: ['3'] }, { bideak: [['1', '4'], ['2', '3']], itxiak: ['5'] }]
};
const SARRERA = { '32': 'P', '52': '1' };
const r1 = v => Math.round(v * 10) / 10;

export const lerroa = (pts, on = false, pilotua = false) =>
  `<polyline class="pn-l${on ? ' on' : ''}${pilotua ? ' pil' : ''}" points="${pts.map(p => p.map(r1).join(',')).join(' ')}"/>`;

export const testua = (x, y, s, cls = 'pn-lab', anchor = 'middle') => `<text class="${cls}" x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}">${s}</text>`;

// Presio-iturria portuaren azpian
export function iturria([x, y]) {
  return `<g class="pn-iturria"><line class="pn-l on" x1="${x}" y1="${y}" x2="${x}" y2="${y + 8}"/><circle cx="${x}" cy="${y + 17}" r="9"/><path d="M${x - 5} ${y + 21} L${x + 5} ${y + 21} L${x} ${y + 12} Z"/></g>`;
}
// Ihesa (kanpora) portuaren azpian
export function ihesa([x, y]) {
  return `<g class="pn-ihesa"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 6}"/><path d="M${x - 6} ${y + 6} H${x + 6} L${x} ${y + 15} Z"/></g>`;
}

// Balbula: sx = kutxa aktiboaren ezkerreko ertza (portu finkoak), y = goiko ertza.
// ezk: 'botoia' | 'palanka' | 'pilotua' · esk: 'malgukia' | 'pilotua' | 'enkliketa'
export function balbula({ sx, y, mota, pos, ezk = 'botoia', esk = 'malgukia', pilotuak = {}, gatazka = false, presioa = true }) {
  const bw = BW[mota], bl = sx - (pos ? 0 : bw), br = bl + 2 * bw, ym = y + BH / 2;
  const px = (k, box) => bl + box * bw + PORTUAK[mota][k][0];
  const py = k => y + PORTUAK[mota][k][1] * BH;
  let s = '';
  [1, 0].forEach((konf, box) => {
    const K = KUTXAK[mota][konf], aktiboa = konf === pos;
    s += `<rect class="pn-kutxa${aktiboa ? ' on' : ''}" x="${bl + box * bw}" y="${y}" width="${bw}" height="${BH}"/>`;
    K.bideak.forEach(([a, b]) => {
      const on = aktiboa && presioa && a === SARRERA[mota];
      const x1 = px(a, box), y1 = py(a), x2 = px(b, box), y2 = py(b);
      const ang = Math.atan2(y2 - y1, x2 - x1), c = Math.cos(ang), sn = Math.sin(ang);
      const ex = x2 - c * 4, ey = y2 - sn * 4;
      s += `<g class="pn-gezia${on ? ' on' : ''}"><line x1="${r1(x1 + c * 4)}" y1="${r1(y1 + sn * 4)}" x2="${r1(ex - c * 6)}" y2="${r1(ey - sn * 6)}"/>
        <path d="M${r1(ex)} ${r1(ey)} L${r1(ex - 9 * Math.cos(ang - 0.38))} ${r1(ey - 9 * Math.sin(ang - 0.38))} L${r1(ex - 9 * Math.cos(ang + 0.38))} ${r1(ey - 9 * Math.sin(ang + 0.38))} Z"/></g>`;
    });
    K.itxiak.forEach(k => {
      const x = px(k, box), yy = py(k), d = PORTUAK[mota][k][1] ? -1 : 1;
      s += `<path class="pn-itxi" d="M${x} ${yy} V${yy + 10 * d} M${x - 6} ${yy + 10 * d} H${x + 6}"/>`;
    });
  });
  const ak = (m, d) => {
    const x0 = d < 0 ? bl : br;
    switch (m) {
      case 'botoia': return `<path class="pn-akt" d="M${x0} ${ym} H${x0 + 12 * d} M${x0 + 12 * d} ${ym - 9} V${ym + 9} M${x0 + 12 * d} ${ym - 9} A9 9 0 0 ${d < 0 ? 0 : 1} ${x0 + 12 * d} ${ym + 9}"/>`;
      case 'palanka': return `<path class="pn-akt" d="M${x0} ${ym} H${x0 + 10 * d} L${x0 + 24 * d} ${ym - 16}"/><circle class="pn-akt" cx="${x0 + 24 * d}" cy="${ym - 16}" r="3"/>`;
      case 'malgukia': return `<path class="pn-akt" d="M${x0} ${ym} l${4 * d} -8 l${6 * d} 16 l${6 * d} -16 l${6 * d} 16 l${4 * d} -8"/>`;
      case 'enkliketa': return `<path class="pn-akt" d="M${x0} ${ym} H${x0 + 8 * d} M${x0 + 8 * d} ${ym - 10} V${ym + 10} M${x0 + 12 * d} ${ym - 10} l${6 * d} 5 l${-6 * d} 5 l${6 * d} 5 l${-6 * d} 5"/>`;
      case 'pilotua': {
        const on = d < 0 ? pilotuak.ezk : pilotuak.esk;
        const xr = d < 0 ? x0 - 18 : x0;
        const tri = d < 0 ? `M${x0 - 14} ${ym - 6} L${x0 - 14} ${ym + 6} L${x0 - 3} ${ym} Z` : `M${x0 + 14} ${ym - 6} L${x0 + 14} ${ym + 6} L${x0 + 3} ${ym} Z`;
        return `<rect class="pn-pil${on ? ' on' : ''}${gatazka && on ? ' err' : ''}" x="${xr}" y="${ym - 9}" width="18" height="18"/><path class="pn-piltri${on ? ' on' : ''}" d="${tri}"/>`;
      }
      default: return '';
    }
  };
  s += ak(ezk, -1) + ak(esk, 1);
  return {
    svg: `<g class="pn-balbula">${s}</g>`,
    portua: k => [sx + PORTUAK[mota][k][0], y + PORTUAK[mota][k][1] * BH],
    pilEzk: [bl - 18, ym], pilEsk: [br + 18, ym], bl, br, ym
  };
}

// Zilindro horizontala (zurtoina eskuinera). pos: 0 (atzean) – 1 (aurrean)
export function zilindroa({ x, y, L = 220, pos = 0, bakuna = false, aurre = false, atze = false, karga = null }) {
  const S = L - 34, px = x + 10 + pos * S, rodEnd = px + L + 4;
  let s = `<rect class="pn-ganbera${aurre ? ' on' : ''}" x="${r1(x)}" y="${y}" width="${r1(px - x)}" height="40"/>
    <rect class="pn-ganbera${atze ? ' on' : ''}" x="${r1(px + 8)}" y="${y}" width="${r1(x + L - px - 8)}" height="40"/>`;
  if (bakuna) {
    const w = x + L - px - 8, n = 8;
    s += `<polyline class="pn-malguki" points="${Array.from({ length: n + 1 }, (_, i) => `${r1(px + 8 + i * w / n)},${i % 2 ? y + 6 : y + 34}`).join(' ')}"/>`;
  }
  s += `<rect class="pn-gorputza" x="${x}" y="${y}" width="${L}" height="40"/>
    <rect class="pn-zurtoina" x="${r1(px + 8)}" y="${y + 16}" width="${r1(rodEnd - px - 8)}" height="8"/>
    <rect class="pn-enboloa" x="${r1(px)}" y="${y + 2}" width="8" height="36"/>`;
  if (bakuna) s += `<path class="pn-akt" d="M${x + L - 14} ${y} V${y - 7} M${x + L - 20} ${y - 7} H${x + L - 8}"/>`;
  if (karga !== null) s += `<rect class="pn-karga" x="${r1(rodEnd)}" y="${y - 8}" width="46" height="56"/><text class="pn-lab" x="${r1(rodEnd + 23)}" y="${y + 25}" text-anchor="middle">${karga}</text>`;
  else s += `<rect class="pn-enboloa" x="${r1(rodEnd)}" y="${y + 8}" width="6" height="24"/>`;
  return { svg: `<g>${s}</g>`, aurre: [x + 14, y + 40], atze: [x + L - 14, y + 40], rodEnd };
}

// Zilindro bertikala (zurtoina gora), sekuentzietarako
export function zilindroaB({ x, yb, L = 130, pos = 0, aurre = false, atze = false, izena = '' }) {
  const S = L - 34, top = yb - L;
  const pyAt = p => yb - 18 - p * S;
  const py = pyAt(pos), rodTop = py - L + 4;
  let s = `<rect class="pn-ganbera${aurre ? ' on' : ''}" x="${x - 22}" y="${r1(py + 8)}" width="44" height="${r1(yb - py - 8)}"/>
    <rect class="pn-ganbera${atze ? ' on' : ''}" x="${x - 22}" y="${top}" width="44" height="${r1(py - top)}"/>
    <rect class="pn-gorputza" x="${x - 22}" y="${top}" width="44" height="${L}"/>
    <rect class="pn-zurtoina" x="${x - 4}" y="${r1(rodTop)}" width="8" height="${r1(py - rodTop)}"/>
    <rect class="pn-enboloa" x="${x - 12}" y="${r1(rodTop - 6)}" width="24" height="6"/>
    <rect class="pn-enboloa" x="${x - 20}" y="${r1(py)}" width="40" height="8"/>`;
  if (izena) s += `<text class="pn-izena" x="${x - 34}" y="${top + L / 2 + 8}" text-anchor="end">${izena}</text>`;
  return { svg: `<g>${s}</g>`, aurre: [x - 12, yb], atze: [x + 22, top + 12], rodTop, rodTop0: pyAt(0) - L + 4, rodTop1: pyAt(1) - L + 4 };
}

// Ibilbide-amaierako detektagailua (rola), zurtoinaren ondoan
export function muga(x, y, izena, on) {
  return `<g class="pn-muga${on ? ' on' : ''}"><path d="M${x + 5} ${y} l12 -9"/><circle cx="${x}" cy="${y}" r="5"/></g><text class="pn-lab${on ? ' on' : ''}" x="${x + 21}" y="${y + 1}" text-anchor="start">${izena}</text>`;
}

// ETA (bi presiokoa) eta EDO (hautagailua) balbulak: (x, y) erdian; sarrerak ezker/eskuin, irteera goian
export function logikaBalbula(mota, x, y, { a, b }) {
  const q = mota === 'eta' ? a && b : a || b;
  let s = `<rect class="pn-kutxa${q ? ' on' : ''}" x="${x - 24}" y="${y - 12}" width="48" height="24"/>`;
  if (mota === 'edo') {
    const bx = a && !b ? x + 11 : b && !a ? x - 11 : x;
    s += `<path class="pn-akt" d="M${x - 20} ${y - 8} L${x - 14} ${y} L${x - 20} ${y + 8} M${x + 20} ${y - 8} L${x + 14} ${y} L${x + 20} ${y + 8}"/><circle class="pn-bola" cx="${bx}" cy="${y}" r="6"/>`;
  } else {
    const d = a && !b ? 6 : b && !a ? -6 : 0;
    s += `<path class="pn-akt" d="M${x - 17 + d} ${y - 7} V${y + 7} M${x + 17 + d} ${y - 7} V${y + 7} M${x - 17 + d} ${y} H${x + 17 + d}"/>`;
  }
  s += `<text class="pn-lab" x="${x}" y="${y + 30}" text-anchor="middle">${mota === 'eta' ? 'ETA balbula' : 'EDO balbula'}</text>`;
  return { svg: `<g>${s}</g>`, a: [x - 24, y], b: [x + 24, y], q: [x, y - 12], irteera: q };
}
