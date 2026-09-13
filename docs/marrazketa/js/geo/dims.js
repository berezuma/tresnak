/* ============================================================
   AKOTAZIOA
   Kota bat: { id, view:"F"|"T"|"L"|"R", a:[u,v], b:[u,v], dir:"h"|"v", side:1|-1 }
   Zuzentzailea ardatzka lan egiten du: ardatz bakoitzean piezaren
   erpinen koordenatu ezberdinak "nodoak" dira eta kota bakoitza bi
   nodo lotzen dituen "ertza". Pieza guztiz zehaztuta dago nodo guztiak
   lotuta badaude; ziklo bat badago, kota bat soberan dago (kate itxia).
   ============================================================ */

export const AXIS_LABEL = [
  { name: "zabalera", letter: "X" },
  { name: "sakonera", letter: "Y" },
  { name: "altuera",  letter: "Z" }
];

/* bista + norabidea → ardatz erreala eta u/v-tik koordenatura bihurtzeko zeinua */
const MAP = {
  F: { h: [0, 1],  v: [2, 1] },
  T: { h: [0, 1],  v: [1, 1] },
  L: { h: [1, -1], v: [2, 1] },
  R: { h: [1, 1],  v: [2, 1] }
};

export const dimAxis = (d) => MAP[d.view]?.[d.dir]?.[0];
export const dimLength = (d) => Math.abs(d.dir === "h" ? d.b[0] - d.a[0] : d.b[1] - d.a[1]);
const coordOf = (d, p) => { const [ax, sg] = MAP[d.view][d.dir]; return +(sg * (d.dir === "h" ? p[0] : p[1])).toFixed(3); };

/* Bi puntutatik kota-norabidea asmatu */
export function guessDir(a, b){
  const du = Math.abs(b[0] - a[0]), dv = Math.abs(b[1] - a[1]);
  return du >= dv ? "h" : "v";
}

class DSU {
  constructor(){ this.p = new Map(); }
  find(x){ if (!this.p.has(x)) this.p.set(x, x); let r = x; while (this.p.get(r) !== r) r = this.p.get(r); this.p.set(x, r); return r; }
  union(a, b){ const ra = this.find(a), rb = this.find(b); if (ra === rb) return false; this.p.set(ra, rb); return true; }
}

/* solid: buildSolid()-en emaitza. hiddenPts (aukerakoa): bistaka, ezkutuko
   ertzetan bakarrik dauden puntuen multzoa ("u,v"). unit: mm kuboko. */
export function checkDims(solid, dims, { unit = 10, hiddenPts = null } = {}){
  const issues = [];   // {kind:"missing"|"dup"|"cycle"|"hidden"|"tip", text, ids:[]}
  const coords = [new Set(), new Set(), new Set()];
  for (const v of solid.vertices) for (let i = 0; i < 3; i++) coords[i].add(+v[i].toFixed(3));

  const perAxis = [[], [], []];
  const fmt = (n) => String(Math.round(n * unit * 100) / 100);

  for (const d of dims){
    if (!MAP[d.view]) continue;
    const len = dimLength(d);
    if (len < 1e-6){ issues.push({ kind: "zero", text: "Luzera zero duen kota bat dago.", ids: [d.id] }); continue; }
    const ax = dimAxis(d);
    const c1 = coordOf(d, d.a), c2 = coordOf(d, d.b);
    perAxis[ax].push({ d, c1: Math.min(c1, c2), c2: Math.max(c1, c2) });
    if (hiddenPts && hiddenPts[d.view]){
      const hp = hiddenPts[d.view];
      if (hp.has(d.a.join(",")) || hp.has(d.b.join(",")))
        issues.push({ kind: "hidden", text: "Kota bat ezkutuko ertz batean dago (" + fmt(len) + "). Saiatu ertz ikusgaiak akotatzen beste bista batean.", ids: [d.id] });
    }
  }

  let totalNeeded = 0, totalOk = 0;
  const axes = [];
  for (let ax = 0; ax < 3; ax++){
    const nodes = Array.from(coords[ax]).sort((a, b) => a - b);
    if (nodes.length < 2) continue;
    const dsu = new DSU();
    nodes.forEach(n => dsu.find(n));
    const seenPairs = new Map();
    let used = 0;
    for (const it of perAxis[ax]){
      const pk = it.c1 + "|" + it.c2;
      if (seenPairs.has(pk)){
        issues.push({ kind: "dup", text: AXIS_LABEL[ax].name + ": " + fmt(it.c2 - it.c1) + " neurria bi aldiz dago akotatuta. Kota bakoitza behin bakarrik jarri behar da.", ids: [it.d.id, seenPairs.get(pk)] });
        continue;
      }
      seenPairs.set(pk, it.d.id);
      if (!dsu.union(it.c1, it.c2)){
        issues.push({ kind: "cycle", text: AXIS_LABEL[ax].name + ": " + fmt(it.c2 - it.c1) + " kota soberan dago (kate itxia): beste koten batuketatik atera daiteke.", ids: [it.d.id] });
      } else used++;
    }
    const need = nodes.length - 1;
    totalNeeded += need;
    totalOk += used;
    /* falta direnak: ondoz ondoko nodoak, lotu gabeak */
    const roots = new Set(nodes.map(n => dsu.find(n)));
    if (roots.size > 1){
      const gaps = [];
      for (let i = 0; i < nodes.length - 1; i++){
        const left = new Set(), right = new Set();
        nodes.slice(0, i + 1).forEach(n => left.add(dsu.find(n)));
        nodes.slice(i + 1).forEach(n => right.add(dsu.find(n)));
        if (![...left].some(r => right.has(r))) gaps.push([nodes[i], nodes[i + 1]]);
      }
      const missing = roots.size - 1;
      issues.push({ kind: "missing",
        text: AXIS_LABEL[ax].name + " (" + AXIS_LABEL[ax].letter + "): " + missing + " kota falta " + (missing === 1 ? "da" : "dira") +
          ". Ez dago zehaztuta " + gaps.slice(0, 3).map(([a, b]) => fmt(a - nodes[0]) + "–" + fmt(b - nodes[0])).join(", ") + " tartea.",
        ids: [] });
    }
    const hasOverall = perAxis[ax].some(it => Math.abs(it.c1 - nodes[0]) < 1e-6 && Math.abs(it.c2 - nodes[nodes.length - 1]) < 1e-6);
    if (!hasOverall && nodes.length > 2)
      issues.push({ kind: "tip", text: "Aholkua: " + AXIS_LABEL[ax].name + "ren neurri orokorra (" + fmt(nodes[nodes.length - 1] - nodes[0]) + ") akotatzea komeni da.", ids: [] });
    axes.push({ ax, nodes, used, need });
  }

  const errors = issues.filter(i => i.kind === "missing" || i.kind === "dup" || i.kind === "cycle" || i.kind === "zero").length;
  const extras = issues.filter(i => i.kind === "dup" || i.kind === "cycle").length;
  const score = totalNeeded ? Math.max(0, Math.round(100 * (totalOk - extras * 0.5) / totalNeeded)) : 0;
  return { issues, axes, score, perfect: errors === 0 && totalOk === totalNeeded, totalNeeded, totalOk };
}

/* Kotak mailatan antolatu (bista + norabide + alde bakoitzean, laburrenak barnean) */
export function layoutDims(dims){
  const groups = new Map();
  for (const d of dims){
    const g = d.view + d.dir + d.side;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(d);
  }
  const level = new Map();
  for (const list of groups.values()){
    const iv = (d) => { const i = d.dir === "h" ? 0 : 1; return [Math.min(d.a[i], d.b[i]), Math.max(d.a[i], d.b[i])]; };
    const sorted = list.slice().sort((p, q) => (iv(p)[1] - iv(p)[0]) - (iv(q)[1] - iv(q)[0]));
    const rows = [];
    for (const d of sorted){
      const [s, e] = iv(d);
      let lv = 0;
      while (rows[lv] && rows[lv].some(([a, b]) => s < b - 1e-6 && e > a + 1e-6)) lv++;
      (rows[lv] = rows[lv] || []).push([s, e]);
      level.set(d.id, lv);
    }
  }
  return level;
}
