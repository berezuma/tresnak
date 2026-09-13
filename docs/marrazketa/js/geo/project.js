/* ============================================================
   PROIEKZIOAK: pieza baten bistak (ertz ikusgaiak + ezkutukoak)
   Bista bakoitzak (u, v, sakonera) ematen du; u eskuinera, v gora,
   sakonera txikiagoa = behatzailetik hurbilago.
   Sistema europarra (ISO-E, lehen diedroa) lehenetsita.
   ============================================================ */

import { buildSolid } from "./solid.js";

export const VIEWS = {
  F: { name: "Altxaera",          short: "Altxaera",   p: (x, y, z) => [x, z, y] },
  T: { name: "Oinplanoa",         short: "Oinplanoa",  p: (x, y, z) => [x, y, -z] },
  L: { name: "Ezkerreko profila", short: "Ezk. profila", p: (x, y, z) => [-y, z, x] },
  R: { name: "Eskuineko profila", short: "Esk. profila", p: (x, y, z) => [y, z, -x] },
  B: { name: "Beheko bista",      short: "Behetik",    p: (x, y, z) => [x, -y, z] },
  K: { name: "Atzeko bista",      short: "Atzetik",    p: (x, y, z) => [-x, z, -y] },
  /* Isometrikoa, koordenatu "osoetan": pantailan U = u·cos30°, V = v/2 */
  I: { name: "Perspektiba isometrikoa", short: "Isometrikoa", p: (x, y, z) => [x - y, x + y + 2 * z, x + y - z], iso: true }
};

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ [a, b] = [b, a % b]; } return a; };

/* Bista bat kalkulatu. Emaitza unitate errealetan (kubo = 1).
   { vis:[[u1,v1,u2,v2]…], hid:[…], box:{minU,maxU,minV,maxV} } */
export function projectView(solidOrCells, viewId){
  const solid = solidOrCells.tris ? solidOrCells : buildSolid(solidOrCells);
  const V = VIEWS[viewId];
  const P = (pt) => V.p(pt[0], pt[1], pt[2]);
  const N = V.iso ? 24 : 8;

  const occ = [];
  for (const t of solid.tris){
    const a = P(t.v[0]), b = P(t.v[1]), c = P(t.v[2]);
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(area) < 1e-9) continue;
    occ.push({ a, b, c, area,
      minU: Math.min(a[0], b[0], c[0]), maxU: Math.max(a[0], b[0], c[0]),
      minV: Math.min(a[1], b[1], c[1]), maxV: Math.max(a[1], b[1], c[1]) });
  }

  const hidden = (u, v, d) => {
    for (const o of occ){
      if (u < o.minU || u > o.maxU || v < o.minV || v > o.maxV) continue;
      const { a, b, c, area } = o;
      const w0 = ((b[0] - u) * (c[1] - v) - (b[1] - v) * (c[0] - u)) / area;
      const w1 = ((c[0] - u) * (a[1] - v) - (c[1] - v) * (a[0] - u)) / area;
      const w2 = 1 - w0 - w1;
      /* Ertza barne: aurpegiak triangelu txikitan zatituta daude, eta haien
         arteko mugak ez dira benetako ertzak. Benetako ertz bat bada,
         aurreko ertz ikusgaiak berak estaltzen du ezkutukoa gero. */
      const E = -1e-9;
      if (w0 < E || w1 < E || w2 < E) continue;
      const depth = w0 * a[2] + w1 * b[2] + w2 * c[2];
      if (depth < d - 1e-6) return true;
    }
    return false;
  };

  /* lerro bakoitzeko tarteak (koordenatuak N·2 eskalan, osoak) */
  const lines = new Map();
  const addPiece = (x1, y1, x2, y2, isHidden) => {
    let dx = x2 - x1, dy = y2 - y1;
    const g = gcd(dx, dy) || 1;
    dx /= g; dy /= g;
    if (dx < 0 || (dx === 0 && dy < 0)){ dx = -dx; dy = -dy; }
    const off = dx * y1 - dy * x1;
    const t1 = x1 * dx + y1 * dy, t2 = x2 * dx + y2 * dy;
    const lk = dx + "," + dy + "," + off;
    let L = lines.get(lk);
    if (!L){ L = { dx, dy, off, vis: [], hid: [] }; lines.set(lk, L); }
    (isHidden ? L.hid : L.vis).push([Math.min(t1, t2), Math.max(t1, t2)]);
  };

  for (const e of solid.edges){
    const A = P(e.a), B = P(e.b);
    if (A[0] === B[0] && A[1] === B[1]) continue;
    for (let i = 0; i < N; i++){
      const t = (i + 0.5) / N;
      const u = A[0] + (B[0] - A[0]) * t, v = A[1] + (B[1] - A[1]) * t, d = A[2] + (B[2] - A[2]) * t;
      const hdn = hidden(u, v, d);
      addPiece(A[0] * N + (B[0] - A[0]) * i, A[1] * N + (B[1] - A[1]) * i,
               A[0] * N + (B[0] - A[0]) * (i + 1), A[1] * N + (B[1] - A[1]) * (i + 1), hdn);
    }
  }

  const merge = (iv) => {
    iv.sort((p, q) => p[0] - q[0]);
    const out = [];
    for (const r of iv){
      const last = out[out.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else out.push([r[0], r[1]]);
    }
    return out;
  };
  const subtract = (iv, cut) => {
    let res = iv;
    for (const [c0, c1] of cut){
      const next = [];
      for (const [a, b] of res){
        if (c1 <= a || c0 >= b){ next.push([a, b]); continue; }
        if (c0 > a) next.push([a, c0]);
        if (c1 < b) next.push([c1, b]);
      }
      res = next;
    }
    return res;
  };

  const scale = 2 * N;
  const sx = V.iso ? Math.sqrt(3) / 2 : 1, sy = V.iso ? 0.5 : 1;
  const toReal = (L, t) => {
    const d2 = L.dx * L.dx + L.dy * L.dy;
    const x = (t * L.dx - L.off * L.dy) / d2;
    const y = (t * L.dy + L.off * L.dx) / d2;
    return [x / scale * sx, y / scale * sy];
  };
  const vis = [], hid = [];
  const box = { minU: Infinity, maxU: -Infinity, minV: Infinity, maxV: -Infinity };
  const grow = (p) => { box.minU = Math.min(box.minU, p[0]); box.maxU = Math.max(box.maxU, p[0]); box.minV = Math.min(box.minV, p[1]); box.maxV = Math.max(box.maxV, p[1]); };
  for (const L of lines.values()){
    const mv = merge(L.vis);
    const mh = subtract(merge(L.hid), mv);
    for (const [t1, t2] of mv){ const p = toReal(L, t1), q = toReal(L, t2); vis.push([p[0], p[1], q[0], q[1]]); grow(p); grow(q); }
    for (const [t1, t2] of mh){ if (t2 - t1 < 1e-9) continue; const p = toReal(L, t1), q = toReal(L, t2); hid.push([p[0], p[1], q[0], q[1]]); grow(p); grow(q); }
  }
  if (!isFinite(box.minU)) Object.assign(box, { minU: 0, maxU: 0, minV: 0, maxV: 0 });
  return { view: viewId, vis, hid, box };
}

/* Ohiko hiru bistak sistema bakoitzean */
export const SYSTEM_VIEWS = { E: ["F", "T", "L"], A: ["F", "T", "R"] };

/* ------------------------------------------------------------
   "Atomoak": marrazketa-ariketetarako segmentu txikiak.
   Ardatzekiko paraleloak: unitate bateko zatiak.
   Diagonalak: unitate-karratuaren diagonal erdiak.
   Gakoak koordenatu bikoiztuetan: "x1,y1,x2,y2".
   ------------------------------------------------------------ */
export function atomsOf(segs){
  const out = new Set();
  for (const [u1, v1, u2, v2] of segs){
    const X1 = Math.round(u1 * 2), Y1 = Math.round(v1 * 2), X2 = Math.round(u2 * 2), Y2 = Math.round(v2 * 2);
    const dx = X2 - X1, dy = Y2 - Y1;
    let steps, sx, sy;
    if (dx === 0 || dy === 0){ steps = Math.max(Math.abs(dx), Math.abs(dy)) / 2; sx = Math.sign(dx) * 2; sy = Math.sign(dy) * 2; }
    else if (Math.abs(dx) === Math.abs(dy)){ steps = Math.abs(dx); sx = Math.sign(dx); sy = Math.sign(dy); }
    else { out.add(atomKey(X1, Y1, X2, Y2)); continue; }
    for (let i = 0; i < steps; i++) out.add(atomKey(X1 + sx * i, Y1 + sy * i, X1 + sx * (i + 1), Y1 + sy * (i + 1)));
  }
  return out;
}
export function atomKey(x1, y1, x2, y2){
  return (x1 < x2 || (x1 === x2 && y1 < y2)) ? x1 + "," + y1 + "," + x2 + "," + y2 : x2 + "," + y2 + "," + x1 + "," + y1;
}
export const parseAtom = (k) => k.split(",").map(Number);

/* Bista baten atomoak, ikusgaiak eta ezkutukoak, jatorrira eramanda */
export function viewAtoms(pv, withHidden = true){
  const vis = atomsOf(pv.vis);
  const hid = withHidden ? atomsOf(pv.hid) : new Set();
  for (const k of vis) hid.delete(k);
  return shiftAtoms({ vis, hid });
}

export function shiftAtoms({ vis, hid }, dx = null, dy = null){
  if (dx === null){
    let mx = Infinity, my = Infinity;
    for (const k of [...vis, ...hid]){ const a = parseAtom(k); mx = Math.min(mx, a[0], a[2]); my = Math.min(my, a[1], a[3]); }
    if (!isFinite(mx)){ mx = 0; my = 0; }
    dx = -mx; dy = -my;
  }
  const mv = (set) => new Set(Array.from(set, k => { const a = parseAtom(k); return atomKey(a[0] + dx, a[1] + dy, a[2] + dx, a[3] + dy); }));
  return { vis: mv(vis), hid: mv(hid) };
}

/* Diagonal-erdi bakartiak dauden (marrazketa-sarean ezin direnak marraztu) */
export function hasLooseHalfDiagonals(atoms){
  const all = new Set([...atoms.vis, ...atoms.hid]);
  for (const k of all){
    const [x1, y1, x2, y2] = parseAtom(k);
    if (x1 === x2 || y1 === y2) continue;
    const odd = (x1 % 2 !== 0) ? [x1, y1] : [x2, y2];   // erdigunea
    const end = (x1 % 2 !== 0) ? [x2, y2] : [x1, y1];
    const other = [2 * odd[0] - end[0], 2 * odd[1] - end[1]];
    const pk = atomKey(odd[0], odd[1], other[0], other[1]);
    const sameType = atoms.vis.has(k) ? atoms.vis.has(pk) : atoms.hid.has(pk);
    if (!sameType) return true;
  }
  return false;
}

/* Bi marrazki alderatu. Ikaslearen marrazkia desplazatuta egon daiteke:
   lerrokatze onena bilatzen da. */
export function compareAtoms(target, answer, { hidden = true, align = true } = {}){
  const T = target;
  /* align:false → sarea piezaren neurrikoa da: marrazkia bere tokian alderatzen da */
  if (!align) return { ...scoreAtoms(T, answer, hidden), dx: 0, dy: 0, absolute: true };
  const baseA = shiftAtoms(answer);
  let best = null;
  for (let dx = -8; dx <= 8; dx += 2) for (let dy = -8; dy <= 8; dy += 2){
    const A = shiftAtoms(baseA, dx, dy);
    const r = scoreAtoms(T, A, hidden);
    if (!best || r.good > best.good || (r.good === best.good && r.bad < best.bad)) best = { ...r, dx, dy };
  }
  return best;
}

function scoreAtoms(T, A, hidden){
  const missing = [], extra = [], wrongType = [];
  let good = 0;
  const tv = T.vis, th = hidden ? T.hid : new Set();
  const av = A.vis, ah = hidden ? A.hid : new Set(Array.from(A.hid).filter(k => !A.vis.has(k)));
  for (const k of tv){ if (av.has(k)) good++; else if (ah.has(k)) wrongType.push(k); else missing.push(k); }
  for (const k of th){ if (ah.has(k)) good++; else if (av.has(k)) wrongType.push(k); else missing.push(k); }
  for (const k of av) if (!tv.has(k) && !th.has(k)) extra.push(k);
  if (hidden) for (const k of ah) if (!tv.has(k) && !th.has(k)) extra.push(k);
  const total = tv.size + th.size;
  const bad = missing.length + extra.length + wrongType.length;
  const score = total ? Math.max(0, Math.round(100 * (good - extra.length * 0.5) / total)) : 0;
  return { good, bad, total, missing, extra, wrongType, score, perfect: bad === 0 };
}

export function sameAtoms(a, b){
  if (a.vis.size !== b.vis.size || a.hid.size !== b.hid.size) return false;
  for (const k of a.vis) if (!b.vis.has(k)) return false;
  for (const k of a.hid) if (!b.hid.has(k)) return false;
  return true;
}

/* Bi piezak bista berdinak dituzte? (eraiki ariketak zuzentzeko) */
export function sameViews(cellsA, cellsB, views = ["F", "T", "L"], hidden = true){
  const sA = buildSolid(cellsA), sB = buildSolid(cellsB);
  const diff = [];
  for (const v of views){
    const a = viewAtoms(projectView(sA, v), hidden), b = viewAtoms(projectView(sB, v), hidden);
    if (!sameAtoms(a, b)) diff.push(v);
  }
  return diff;
}
