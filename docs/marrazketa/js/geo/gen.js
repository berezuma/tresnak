/* ============================================================
   PIEZA-SORTZAILEA (hazi batetik, beti berdina)
   Maila bakoitzak bere zailtasuna du.
   ============================================================ */

import { key, parseKey, isConnected, isHeightmap, buildSolid } from "./solid.js";
import { projectView, viewAtoms, hasLooseHalfDiagonals } from "./project.js";

export function hashStr(s){
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++){ h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
}
export function rng(seed){
  let a = hashStr(String(seed))();
  const r = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.shuffle = (arr) => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
  return r;
}

/* Mailen parametroak
   w, d, hmax: gehienezko zabalera, sakonera eta altuera
   ext:        gutxieneko neurriak [zabalera, sakonera, altuera]
   up:         zutabe bat altxatzeko probabilitatea (txikiagoa → pieza zabalagoak) */
export const GEN = {
  1: { w: 3, d: 3, hmax: 3, min: 4,  max: 7,  carve: 0, ramps: 0, chamfers: 0 },
  2: { w: 4, d: 3, hmax: 3, min: 6,  max: 11, carve: 0, ramps: 0, chamfers: 0 },
  3: { w: 5, d: 4, hmax: 4, min: 11, max: 17, carve: 2, ramps: 0, chamfers: 0, ext: [4, 3, 3], up: 0.35 },
  4: { w: 5, d: 4, hmax: 4, min: 11, max: 17, carve: 0, ramps: 3, chamfers: 1, ext: [4, 3, 3], up: 0.35 },
  5: { w: 6, d: 5, hmax: 5, min: 18, max: 28, carve: 3, ramps: 3, chamfers: 2, ext: [5, 4, 4], up: 0.33 }
};

/* Altuera-mapa lotua: zutabeak oinplanoan elkarren ondoan */
function heightmapPiece(r, P){
  const H = Array.from({ length: P.d }, () => Array(P.w).fill(0));
  let x = r.int(0, P.w - 1), y = r.int(0, P.d - 1);
  const target = r.int(P.min, P.max);
  let count = 0, guard = 0;
  const cols = [[x, y]];
  H[y][x] = 1; count = 1;
  while (count < target && guard++ < 800){
    const [cx, cy] = r.pick(cols);
    if (r() < (P.up ?? 0.45) && H[cy][cx] < P.hmax){ H[cy][cx]++; count++; continue; }
    const dir = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const nx = cx + dir[0], ny = cy + dir[1];
    if (nx < 0 || ny < 0 || nx >= P.w || ny >= P.d) continue;
    if (H[ny][nx] === 0){ cols.push([nx, ny]); }
    if (H[ny][nx] < P.hmax){ H[ny][nx]++; count++; }
  }
  const cells = new Map();
  for (let yy = 0; yy < P.d; yy++) for (let xx = 0; xx < P.w; xx++)
    for (let z = 0; z < H[yy][xx]; z++) cells.set(key(xx, yy, z), "c");
  return cells;
}

const height = (cells, x, y) => { let hgt = 0; while (cells.has(key(x, y, hgt))) hgt++; return hgt; };
const topZ = (cells, x, y) => { let t = -1; for (let z = 0; z < 10; z++) if (cells.has(key(x, y, z))) t = z; return t; };

export function generatePiece(level, seed, overrides = {}){
  const P = { ...GEN[level] || GEN[3], ...overrides };
  for (let attempt = 0; attempt < 150; attempt++){
    const r = rng(seed + "#" + attempt);
    const cells = heightmapPiece(r, P);
    if (cells.size < P.min) continue;

    /* hegalak / tunelak: goian kuboa duen kubo bat kendu */
    let carved = 0;
    for (let i = 0; i < 30 && carved < P.carve; i++){
      const ks = Array.from(cells.keys()).filter(k => { const [x, y, z] = parseKey(k); return cells.has(key(x, y, z + 1)); });
      if (!ks.length) break;
      const k = r.pick(ks);
      cells.delete(k);
      if (!isConnected(cells)){ cells.set(k, "c"); continue; }
      carved++;
    }
    if (P.carve && isHeightmap(cells)) continue;

    /* arrapalak: zutabe baten goiko kuboa ziri erdi bihurtu */
    let ramps = 0;
    const tops = r.shuffle(Array.from(cells.keys()).filter(k => { const [x, y, z] = parseKey(k); return !cells.has(key(x, y, z + 1)) && z === topZ(cells, x, y); }));
    for (const k of tops){
      if (ramps >= P.ramps) break;
      const [x, y, z] = parseKey(k);
      const opts = [];
      // x ardatzeko prisma: y norabidean igotzen da (alde altua y=ca)
      for (const ca of [0, 1]){
        const ny = y + (ca ? 1 : -1);
        const wall = topZ(cells, x, ny) >= z;
        opts.push({ s: "w0" + ca + "0", w: wall ? 3 : 1 });
      }
      for (const ca of [0, 1]){
        const nx = x + (ca ? 1 : -1);
        const wall = topZ(cells, nx, y) >= z;
        opts.push({ s: "w1" + ca + "0", w: wall ? 3 : 1 });
      }
      const tot = opts.reduce((s, o) => s + o.w, 0);
      let pick = r() * tot, shape = opts[0].s;
      for (const o of opts){ pick -= o.w; if (pick <= 0){ shape = o.s; break; } }
      const prev = cells.get(k);
      cells.set(k, shape);
      if (!isConnected(cells)){ cells.set(k, prev); continue; }
      ramps++;
    }

    /* izkina alakatuak (bertikalak): altuera 1eko zutabeetan */
    let ch = 0;
    const singles = r.shuffle(Array.from(cells.keys()).filter(k => { const [x, y, z] = parseKey(k); return z === 0 && cells.get(k) === "c" && !cells.has(key(x, y, 1)); }));
    for (const k of singles){
      if (ch >= P.chamfers) break;
      const [x, y] = parseKey(k);
      const ca = r.int(0, 1), cb = r.int(0, 1);
      // angelu zuzena beste gelaxken aldera, kanpoko izkina moztu dadin
      const nX = cells.has(key(x + (ca ? 1 : -1), y, 0)), nY = cells.has(key(x, y + (cb ? 1 : -1), 0));
      if (!nX && !nY) continue;
      const shape = "w2" + (nX ? ca : 1 - ca) + (nY ? cb : 1 - cb);
      cells.set(k, shape);
      if (!isConnected(cells)){ cells.set(k, "c"); continue; }
      ch++;
    }
    if (P.ramps && ramps === 0) continue;

    /* gutxieneko neurriak (goiko mailetan pieza handiagoak) */
    if (P.ext){
      const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      for (const k of cells.keys()){ const c = parseKey(k); for (let i = 0; i < 3; i++){ lo[i] = Math.min(lo[i], c[i]); hi[i] = Math.max(hi[i], c[i] + 1); } }
      if (P.ext.some((m, i) => hi[i] - lo[i] < m)) continue;
    }

    /* baldintzak: bistak marraz daitezke eta ez dira hutsalak */
    const solid = buildSolid(cells);
    let ok = true;
    for (const v of ["F", "T", "L", "R"]){
      const at = viewAtoms(projectView(solid, v));
      if (hasLooseHalfDiagonals(at)){ ok = false; break; }
    }
    if (!ok) continue;
    if (P.carve){
      const anyHidden = ["F", "T", "L"].some(v => projectView(solid, v).hid.length > 0);
      if (!anyHidden) continue;
    }
    return cells;
  }
  // azken aukera: kubo-eskailera sinple bat
  const c = new Map([[key(0, 0, 0), "c"], [key(1, 0, 0), "c"], [key(0, 0, 1), "c"], [key(0, 1, 0), "c"]]);
  return c;
}

/* Pieza bat aldatu (distraigarriak sortzeko): kubo bat gehitu edo kendu */
export function mutatePiece(cells, r, tries = 30){
  for (let i = 0; i < tries; i++){
    const m = new Map(cells);
    const ks = Array.from(m.keys());
    if (r() < 0.5 && ks.length > 3){
      const k = r.pick(ks);
      m.delete(k);
      if (isConnected(m)) return m;
    } else {
      const [x, y, z] = parseKey(r.pick(ks));
      const d = r.pick([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]]);
      const n = [x + d[0], y + d[1], z + d[2]];
      if (n.some(v => v < 0 || v > 5)) continue;
      const nk = key(...n);
      if (m.has(nk)) continue;
      if (n[2] > 0 && !m.has(key(n[0], n[1], n[2] - 1))) continue;
      m.set(nk, "c");
      return m;
    }
  }
  return null;
}
