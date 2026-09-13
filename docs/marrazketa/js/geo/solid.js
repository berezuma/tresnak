/* ============================================================
   PIEZAREN EREDU GEOMETRIKOA
   Pieza bat gelaxka-sare bat da (1×1×1 kuboak). Gelaxka bakoitzean:
     "c"            kubo osoa
     "w" k ca cb    ziri erdia (prisma triangeluarra): kuboa diagonal batez
                    ebakita. k = prismaren ardatza (0=x, 1=y, 2=z);
                    (ca, cb) = beste bi ardatzetan (ordena gorakorrean)
                    angelu zuzena dagoen izkina.
   Ardatzak: x = zabalera (ezkerretik eskuinera), y = sakonera
   (aurretik atzera), z = altuera.
   Barne-kalkuluetan koordenatuak BIKOIZTUTA erabiltzen dira (osoak),
   aurpegien erdiguneak ere zenbaki osoak izan daitezen.
   ============================================================ */

export const AXIS_NAMES = ["X", "Y", "Z"];
export const MAX_SIZE = 10;

export const key = (x, y, z) => x + "_" + y + "_" + z;
export const parseKey = (k) => k.split("_").map(Number);
export const others = (k) => [[1, 2], [0, 2], [0, 1]][k];

export const WEDGES = [];
for (let k = 0; k < 3; k++) for (let ca = 0; ca < 2; ca++) for (let cb = 0; cb < 2; cb++) WEDGES.push("w" + k + ca + cb);
export const SHAPES = ["c", ...WEDGES];
export const validShape = (s) => SHAPES.includes(s);

/* Gelaxka baten alde batek (k ardatza, s=0 behekoa / s=1 goikoa) zenbat
   estaltzen duen, laurden-maskara gisa. Karratua bi diagonalekin 4
   triangelutan zatitzen da: bit0=P0, bit1=P1 (p=0 / p=1 ertzaren ondokoak),
   bit2=Q0, bit3=Q1. (p, q) = others(k). */
export function sideMask(shape, k, s){
  if (shape === "c") return 15;
  const wk = +shape[1], ca = +shape[2], cb = +shape[3];
  const [a, b] = others(wk);
  if (k === wk) return (1 << ca) | (1 << (2 + cb));
  if (k === a) return s === ca ? 15 : 0;
  if (k === b) return s === cb ? 15 : 0;
  return 0;
}

/* Laurden-triangeluak (p, q) tokiko koordenatu bikoiztuetan */
const QUARTERS = [
  [[0, 0], [0, 2], [1, 1]],  // P0
  [[2, 0], [2, 2], [1, 1]],  // P1
  [[0, 0], [2, 0], [1, 1]],  // Q0
  [[0, 2], [2, 2], [1, 1]]   // Q1
];

/* Gelaxken mapa normalizatua: Map<"x_y_z", forma> */
export function toCellMap(src){
  const m = new Map();
  if (!src) return m;
  const entries = src instanceof Map ? src.entries() : Object.entries(src);
  for (const [k, v] of entries){
    if (!/^\d+_\d+_\d+$/.test(k) || !validShape(v)) continue;
    m.set(k, v);
  }
  return m;
}

export function bounds(cells){
  const b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const k of cells.keys()){
    const c = parseKey(k);
    for (let i = 0; i < 3; i++){ b.min[i] = Math.min(b.min[i], c[i]); b.max[i] = Math.max(b.max[i], c[i] + 1); }
  }
  if (!cells.size) return { min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0] };
  b.size = [0, 1, 2].map(i => b.max[i] - b.min[i]);
  return b;
}

/* Pieza jatorrira eraman (min = 0,0,0) */
export function normalizeCells(cells){
  const b = bounds(cells);
  const out = new Map();
  for (const [k, v] of cells){
    const c = parseKey(k);
    out.set(key(c[0] - b.min[0], c[1] - b.min[1], c[2] - b.min[2]), v);
  }
  return out;
}

/* ------------------------------------------------------------
   Solidoa: kanpoko triangeluak + ertz esanguratsuak
   ------------------------------------------------------------ */
export function buildSolid(cellsIn){
  const cells = cellsIn instanceof Map ? cellsIn : toCellMap(cellsIn);
  const tris = [];

  const pushTri = (pts, n) => {
    // bira-norantza normalarekin bat etor dadin (kanporantz)
    const [a, b, c] = pts;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const dot = cx * n[0] + cy * n[1] + cz * n[2];
    tris.push({ v: dot >= 0 ? [a, b, c] : [a, c, b], n });
  };

  for (const [kk, shape] of cells){
    const c = parseKey(kk);
    for (let k = 0; k < 3; k++){
      const [p, q] = others(k);
      for (let s = 0; s < 2; s++){
        const m = sideMask(shape, k, s);
        if (!m) continue;
        const nc = c.slice(); nc[k] += s ? 1 : -1;
        const ns = cells.get(key(nc[0], nc[1], nc[2]));
        const nm = ns ? sideMask(ns, k, 1 - s) : 0;
        const exposed = m & ~nm;
        if (!exposed) continue;
        const n = [0, 0, 0]; n[k] = s ? 1 : -1;
        for (let bit = 0; bit < 4; bit++){
          if (!(exposed & (1 << bit))) continue;
          const pts = QUARTERS[bit].map(([lp, lq]) => {
            const v = [0, 0, 0];
            v[k] = 2 * (c[k] + s); v[p] = 2 * c[p] + lp; v[q] = 2 * c[q] + lq;
            return v;
          });
          pushTri(pts, n);
        }
      }
    }
    if (shape[0] === "w"){
      const wk = +shape[1], ca = +shape[2], cb = +shape[3];
      const [a, b] = others(wk);
      const P = (la, lb, lk) => { const v = [0, 0, 0]; v[a] = 2 * c[a] + la; v[b] = 2 * c[b] + lb; v[wk] = 2 * c[wk] + lk; return v; };
      const P1 = (lk) => P(2 * (1 - ca), 2 * cb, lk);
      const P2 = (lk) => P(2 * ca, 2 * (1 - cb), lk);
      const M  = (lk) => P(1, 1, lk);
      const n = [0, 0, 0]; n[a] = ca === 0 ? 1 : -1; n[b] = cb === 0 ? 1 : -1;
      pushTri([P1(0), M(0), M(2)], n);
      pushTri([P1(0), M(2), P1(2)], n);
      pushTri([M(0), P2(0), P2(2)], n);
      pushTri([M(0), P2(2), M(2)], n);
    }
  }

  /* ertzak: norabide ezberdineko aurpegiak elkartzen dituztenak */
  const emap = new Map();
  for (const t of tris){
    const nk = t.n.join(",");
    for (let i = 0; i < 3; i++){
      const A = t.v[i], B = t.v[(i + 1) % 3];
      const ka = A.join(","), kb = B.join(",");
      const ek = ka < kb ? ka + "|" + kb : kb + "|" + ka;
      let e = emap.get(ek);
      if (!e){ e = { a: ka < kb ? A : B, b: ka < kb ? B : A, normals: [] }; emap.set(ek, e); }
      e.normals.push(nk);
    }
  }
  const edges = [];
  for (const e of emap.values()){
    const first = e.normals[0];
    if (e.normals.length === 1 || e.normals.some(n => n !== first)) edges.push({ a: e.a, b: e.b });
  }

  return { cells, tris, edges, bounds: bounds(cells), vertices: realVertices(edges) };
}

/* Benetako erpinak: bi ertz lerrokide baino ez dituzten puntuak kanpo */
function realVertices(edges){
  const inc = new Map();
  const add = (P, Q) => {
    const k = P.join(",");
    if (!inc.has(k)) inc.set(k, { p: P, dirs: [] });
    inc.get(k).dirs.push([Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]]);
  };
  for (const e of edges){ add(e.a, e.b); add(e.b, e.a); }
  const out = [];
  for (const { p, dirs } of inc.values()){
    if (dirs.length === 2){
      const [u, v] = dirs;
      const cx = u[1] * v[2] - u[2] * v[1], cy = u[2] * v[0] - u[0] * v[2], cz = u[0] * v[1] - u[1] * v[0];
      const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
      if (cx === 0 && cy === 0 && cz === 0 && dot < 0) continue;
    }
    out.push(p.map(x => x / 2));
  }
  return out;
}

/* ------------------------------------------------------------
   Egiaztapenak
   ------------------------------------------------------------ */

/* Gelaxkak aurpegi batez (edo haren zati batez) lotuta daude? */
export function isConnected(cells){
  if (cells.size <= 1) return true;
  const start = cells.keys().next().value;
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length){
    const kk = stack.pop();
    const c = parseKey(kk), shape = cells.get(kk);
    for (let k = 0; k < 3; k++) for (let s = 0; s < 2; s++){
      const nc = c.slice(); nc[k] += s ? 1 : -1;
      const nk = key(nc[0], nc[1], nc[2]);
      if (seen.has(nk) || !cells.has(nk)) continue;
      if (sideMask(shape, k, s) & sideMask(cells.get(nk), k, 1 - s)){ seen.add(nk); stack.push(nk); }
    }
  }
  return seen.size === cells.size;
}

/* Zutabe bakoitza lurretik hasten da eta ez du hutsunerik (hegalik gabe) */
export function isHeightmap(cells){
  const cols = new Map();
  for (const k of cells.keys()){
    const [x, y, z] = parseKey(k);
    const ck = x + "_" + y;
    if (!cols.has(ck)) cols.set(ck, []);
    cols.get(ck).push(z);
  }
  for (const zs of cols.values()){
    zs.sort((a, b) => a - b);
    if (zs.some((z, i) => z !== i)) return false;
  }
  return true;
}

export function sameCells(a, b){
  const A = normalizeCells(a), B = normalizeCells(b);
  if (A.size !== B.size) return false;
  for (const [k, v] of A) if (B.get(k) !== v) return false;
  return true;
}

/* Oinplano zenbakidua: zutabe bakoitzeko altuera */
export function heightGrid(cells){
  const b = bounds(cells);
  const g = [];
  for (let y = b.min[1]; y < b.max[1]; y++){
    const row = [];
    for (let x = b.min[0]; x < b.max[0]; x++){
      let hgt = 0;
      for (let z = 0; z < b.max[2]; z++) if (cells.has(key(x, y, z))) hgt = z + 1;
      row.push(hgt);
    }
    g.push(row);
  }
  return g;   // g[y][x], y=0 aurrealdea
}

/* Bolumena kubo-unitatetan (ziri erdia = 0,5) */
export const volume = (cells) => Array.from(cells.values()).reduce((s, v) => s + (v === "c" ? 1 : 0.5), 0);

/* STL testua (Tinkercad-en inportatzeko). unit = mm kubo bakoitzeko. */
export function toSTL(solid, name = "pieza", unit = 10){
  const f = (x) => (x * unit / 2).toFixed(3);
  const lines = ["solid " + name];
  for (const t of solid.tris){
    const n = t.n, len = Math.hypot(n[0], n[1], n[2]) || 1;
    lines.push(`facet normal ${(n[0] / len).toFixed(4)} ${(n[1] / len).toFixed(4)} ${(n[2] / len).toFixed(4)}`, "outer loop");
    for (const v of t.v) lines.push(`vertex ${f(v[0])} ${f(v[1])} ${f(v[2])}`);
    lines.push("endloop", "endfacet");
  }
  lines.push("endsolid " + name);
  return lines.join("\n");
}
