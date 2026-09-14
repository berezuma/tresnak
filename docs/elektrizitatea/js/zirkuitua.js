// Korronte zuzeneko zirkuituen ebazlea — analisi nodal aldatua (MNA).
// Osagai bakoitza bi nodoren artean dago (a → b). Pilak: + borna b-n (alderantziz: a-n).
// Emaitza: nodo bakoitzaren potentziala eta osagai bakoitzeko korrontea (a → b positibo).

export const R_KABLE = 1e-4;     // kable, amperimetro eta etengailu itxien erresistentzia (Ω)
export const R_VOLT = 1e7;        // voltimetroaren barne-erresistentzia (Ω)
const GMIN = 1e-9;                // nodo "flotatzaileak" lurrera lotzeko konduktantzia txikia

export const BONBILLAK = [
  { id: '6V3W', izena: '6 V · 3 W', Vn: 6, Pn: 3 },
  { id: '12V6W', izena: '12 V · 6 W', Vn: 12, Pn: 6 },
  { id: '4V5', izena: '4,5 V · 0,9 W', Vn: 4.5, Pn: 0.9 }
];
export const bonbilla = c => BONBILLAK.find(b => b.id === c.bonbilla) || BONBILLAK[0];
const funditzeMuga = 4;           // bonbilla: potentzia nominalaren 4 halako → fundituta

// Osagaiaren erresistentzia; null = ez du korronterik eroaten (irekita edo fundituta)
export function erresistentzia(c) {
  switch (c.mota) {
    case 'kablea': case 'amperimetroa': return R_KABLE;
    case 'etengailua': return c.itxita ? R_KABLE : null;
    case 'erresistentzia': return c.balioa;
    case 'bonbilla': { if (c.fundituta) return null; const b = bonbilla(c); return b.Vn * b.Vn / b.Pn; }
    case 'fusiblea': return c.fundituta ? null : R_KABLE;
    case 'voltimetroa': return R_VOLT;
    default: return null;
  }
}

// Gauss-en ezabapena pibote partzialarekin. A: n×n, z: n. null singularra bada.
function solveLinear(A, z) {
  const n = z.length;
  for (let col = 0; col < n; col++) {
    let piv = col, best = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > best) { best = Math.abs(A[r][col]); piv = r; }
    if (best < 1e-14) return null;
    if (piv !== col) { [A[col], A[piv]] = [A[piv], A[col]]; [z[col], z[piv]] = [z[piv], z[col]]; }
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / A[col][col];
      if (f === 0) continue;
      for (let k = col; k < n; k++) A[r][k] -= f * A[col][k];
      z[r] -= f * z[col];
    }
  }
  const x = new Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = z[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return x;
}

// Behin ebatzi (funditzeak kontuan hartu gabe)
function solveOnce(osagaiak) {
  const nodes = new Map();
  const idx = key => { if (!nodes.has(key)) nodes.set(key, nodes.size); return nodes.get(key); };
  osagaiak.forEach(c => { idx(c.a); idx(c.b); });
  const pilak = osagaiak.filter(c => c.mota === 'pila');
  // Erreferentzia (0 V): lehen pilaren borna negatiboa
  const ref = pilak.length ? (pilak[0].alderantziz ? pilak[0].b : pilak[0].a) : osagaiak[0]?.a;
  const N = nodes.size;
  if (!N) return { ondo: true, V: new Map(), I: new Map() };
  const refI = nodes.get(ref);
  // aldagaiak: nodoen potentzialak (erreferentzia kenduta) + pila bakoitzeko korrontea
  const col = i => (i < refI ? i : i - 1);
  const n = N - 1 + pilak.length;
  const A = Array.from({ length: n }, () => new Float64Array(n));
  const z = new Float64Array(n);
  const addG = (i, j, g) => {
    if (i !== refI) A[col(i)][col(i)] += g;
    if (j !== refI) A[col(j)][col(j)] += g;
    if (i !== refI && j !== refI) { A[col(i)][col(j)] -= g; A[col(j)][col(i)] -= g; }
  };
  for (let i = 0; i < N; i++) if (i !== refI) A[col(i)][col(i)] += GMIN;
  osagaiak.forEach(c => {
    if (c.mota === 'pila') return;
    const R = erresistentzia(c);
    if (R === null) return;
    addG(nodes.get(c.a), nodes.get(c.b), 1 / R);
  });
  pilak.forEach((p, k) => {
    const row = N - 1 + k;
    // j: pilaren barnean negatibotik positibora doan korrontea
    const neg = nodes.get(p.alderantziz ? p.b : p.a), pos = nodes.get(p.alderantziz ? p.a : p.b);
    if (neg !== refI) { A[col(neg)][row] += 1; A[row][col(neg)] -= 1; }
    if (pos !== refI) { A[col(pos)][row] -= 1; A[row][col(pos)] += 1; }
    A[row][row] += p.r || 0;            // V+ − V− = E − r·j
    z[row] = p.balioa;
  });
  const x = solveLinear(A.map(r => Array.from(r)), Array.from(z));
  if (!x) return { ondo: false };
  const V = new Map();
  nodes.forEach((i, key) => V.set(key, i === refI ? 0 : x[col(i)]));
  const I = new Map();
  osagaiak.forEach(c => {
    if (c.mota === 'pila') return;
    const R = erresistentzia(c);
    I.set(c.id, R === null ? 0 : (V.get(c.a) - V.get(c.b)) / R);
  });
  pilak.forEach((p, k) => {
    const j = x[N - 1 + k];
    I.set(p.id, p.alderantziz ? -j : j);   // a → b noranzkoan
  });
  return { ondo: true, V, I };
}

// Ebatzi, bonbilla eta fusibleen funditzeak kontuan hartuta (osagaien `fundituta` aldatzen du)
export function ebatzi(osagaiak) {
  let res, berriak = [];
  for (let iter = 0; iter < 20; iter++) {
    res = solveOnce(osagaiak);
    if (!res.ondo) return { ondo: false, funditu: berriak };
    const orain = [];
    // zirkuitulaburrean fusibleak bakarrik funditzen dira (babesa); bonbillak ez, ia tentsiorik ez dutelako
    const laburra = osagaiak.some(c => c.mota === 'pila' && Math.abs(res.I.get(c.id)) * 0.1 > Math.max(c.balioa, 0.5));
    let max = null, maxRatio = 1;
    osagaiak.forEach(c => {
      const i = Math.abs(res.I.get(c.id) || 0);
      if (c.mota === 'bonbilla' && !c.fundituta && !laburra) {
        const b = bonbilla(c), R = b.Vn * b.Vn / b.Pn, ratio = i * i * R / (b.Pn * funditzeMuga);
        if (ratio > maxRatio) { maxRatio = ratio; max = c; }
      }
      if (c.mota === 'fusiblea' && !c.fundituta) {
        const ratio = i / c.balioa;
        if (ratio > maxRatio) { maxRatio = ratio; max = c; }
      }
    });
    if (!max) break;
    // okerren dagoena bakarrik funditzen da, eta berriro ebazten da (errealitatean bezala)
    max.fundituta = true;
    orain.push(max.id);
    berriak = berriak.concat(orain);
  }
  const laburrak = osagaiak.filter(c => c.mota === 'pila' && Math.abs(res.I.get(c.id)) * 0.1 > Math.max(c.balioa, 0.5)).map(c => c.id);
  return { ...res, funditu: berriak, zirkuitulaburra: laburrak.length > 0, laburrak };
}

// Osagai baten tentsioa (a − b), korrontea (a → b) eta potentzia (xurgatua, positiboa)
export function neurketa(c, res) {
  const Va = res.V.get(c.a) ?? 0, Vb = res.V.get(c.b) ?? 0, I = res.I.get(c.id) ?? 0;
  const U = Va - Vb;
  return { U, I, P: U * I };
}

// Bonbillaren distira: potentzia / potentzia nominala
export function distira(c, res) {
  if (c.fundituta) return 0;
  const { P } = neurketa(c, res);
  return Math.max(0, P) / bonbilla(c).Pn;
}
