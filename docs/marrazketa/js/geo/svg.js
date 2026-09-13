/* ============================================================
   MARRAZKIAK SVG-tan: bista bakanak, isometrikoa, eta hiru bistako
   orria (sistema europarra / amerikarra) kotekin.
   Barne-koordenatuak: unitate bat = kubo bat, Y gora. SVG-ra
   pasatzean Y alderantzikatzen da.
   ============================================================ */

import { buildSolid } from "./solid.js";
import { projectView, SYSTEM_VIEWS, VIEWS } from "./project.js";
import { layoutDims, dimLength } from "./dims.js";

const NS = "http://www.w3.org/2000/svg";
export function s(tag, attrs = {}, ...kids){
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)){
    if (v === null || v === undefined || v === false) continue;
    if (k === "text") el.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(3)) if (kid) el.appendChild(kid);
  return el;
}
const r3 = (x) => Math.round(x * 1000) / 1000;

export function lineEl(x1, y1, x2, y2, cls){
  return s("line", { x1: r3(x1), y1: r3(-y1), x2: r3(x2), y2: r3(-y2), class: cls });
}

/* Bista bateko lerroak talde batean (desplazamendua: ox, oy) */
export function segmentsGroup(pv, { hidden = true, ox = 0, oy = 0 } = {}){
  const g = s("g", { class: "sv-view" });
  if (hidden) for (const [a, b, c, d] of pv.hid) g.appendChild(lineEl(a + ox, b + oy, c + ox, d + oy, "sv-hid"));
  for (const [a, b, c, d] of pv.vis) g.appendChild(lineEl(a + ox, b + oy, c + ox, d + oy, "sv-vis"));
  return g;
}

/* Bista bakarra, bere SVG-an */
export function viewSVG(pv, { hidden = true, pad = 0.4, cls = "" } = {}){
  const { minU, maxU, minV, maxV } = pv.box;
  const w = maxU - minU + 2 * pad, hgt = maxV - minV + 2 * pad;
  const svg = s("svg", { viewBox: `${r3(minU - pad)} ${r3(-maxV - pad)} ${r3(w)} ${r3(hgt)}`, class: "sv " + cls, "data-w": w, "data-h": hgt });
  svg.style.setProperty("--u", String(w));
  svg.appendChild(segmentsGroup(pv, { hidden }));
  return svg;
}

export function isoSVG(cellsOrSolid, opts = {}){
  const solid = cellsOrSolid.tris ? cellsOrSolid : buildSolid(cellsOrSolid);
  return viewSVG(projectView(solid, "I"), { hidden: false, ...opts, cls: "sv-iso " + (opts.cls || "") });
}

/* Forma baten ikonoa (paleta) */
export function shapeIcon(shape){
  const m = new Map([["0_0_0", shape]]);
  const svg = isoSVG(m, { pad: 0.25, cls: "sv-icon" });
  return svg;
}

/* ------------------------------------------------------------
   Hiru bistako orria
   ------------------------------------------------------------ */
export const SYSTEM_NAMES = { E: "Sistema europarra (ISO-E)", A: "Sistema amerikarra (ISO-A)" };

function viewBox(b, v){
  const [x0, y0, z0] = b.min, [x1, y1, z1] = b.max;
  switch (v){
    case "F": return { minU: x0, maxU: x1, minV: z0, maxV: z1 };
    case "T": return { minU: x0, maxU: x1, minV: y0, maxV: y1 };
    case "L": return { minU: -y1, maxU: -y0, minV: z0, maxV: z1 };
    case "R": return { minU: y0, maxU: y1, minV: z0, maxV: z1 };
  }
}

const DIM = { base: 0.85, step: 0.8, over: 0.22, gap: 0.12, arrow: 0.3, arrowW: 0.09, font: 0.42 };

export function sheetLayout(solid, { system = "E", dims = [] } = {}){
  const b = solid.bounds;
  const ids = SYSTEM_VIEWS[system];
  const levels = layoutDims(dims);
  const maxLv = dims.reduce((m, d) => Math.max(m, (levels.get(d.id) || 0) + 1), 0);
  const G = Math.max(2.2, DIM.base + maxLv * DIM.step + 0.9);
  const M = G;
  const Wx = b.size[0], Dy = b.size[1], Hz = b.size[2];
  const box = {}; ids.forEach(v => box[v] = viewBox(b, v));
  const off = {};
  if (system === "E"){
    off.T = [M - box.T.minU, M - box.T.minV];
    off.F = [M - box.F.minU, M + Dy + G - box.F.minV];
    off.L = [M + Wx + G - box.L.minU, off.F[1]];
  } else {
    off.F = [M - box.F.minU, M - box.F.minV];
    off.T = [M - box.T.minU, M + Hz + G - box.T.minV];
    off.R = [M + Wx + G - box.R.minU, off.F[1]];
  }
  const width = 2 * M + Wx + G + Dy;
  const height = 2 * M + Dy + G + Hz;
  const views = {};
  for (const v of ids) views[v] = { id: v, pv: projectView(solid, v), box: box[v], ox: off[v][0], oy: off[v][1] };
  return { system, views, width, height, levels, gap: G };
}

/* Orria marraztu. Itzultzen du { svg, layout, snaps }.
   snaps: [{view, u, v, x, y, hiddenOnly}] (x,y orri-koordenatuetan, Y gora) */
export function sheetSVG(solid, { system = "E", hidden = true, dims = [], unit = 10, labels = true, marks = {}, extraClass = "" } = {}){
  const L = sheetLayout(solid, { system, dims });
  const svg = s("svg", { viewBox: `0 ${r3(-L.height)} ${r3(L.width)} ${r3(L.height)}`, class: "sv sv-sheet " + extraClass });
  svg.style.setProperty("--u", String(L.width));
  const gViews = s("g"), gDims = s("g", { class: "sv-dims" }), gLabels = s("g", { class: "sv-labels" });
  svg.append(gViews, gDims, gLabels);

  const snaps = [];
  for (const V of Object.values(L.views)){
    gViews.appendChild(segmentsGroup(V.pv, { hidden, ox: V.ox, oy: V.oy }));
    const pts = new Map();
    const add = (u, v, hid) => {
      const k = r3(u) + "," + r3(v);
      const cur = pts.get(k);
      if (!cur) pts.set(k, { u: r3(u), v: r3(v), hiddenOnly: hid });
      else if (!hid) cur.hiddenOnly = false;
    };
    V.pv.vis.forEach(([a, b, c, d]) => { add(a, b, false); add(c, d, false); });
    if (hidden) V.pv.hid.forEach(([a, b, c, d]) => { add(a, b, true); add(c, d, true); });
    for (const p of pts.values()) snaps.push({ view: V.id, ...p, x: p.u + V.ox, y: p.v + V.oy });
    if (labels){
      gLabels.appendChild(s("text", { x: r3(V.box.minU + V.ox), y: r3(-(V.box.maxV + V.oy) - 0.35), class: "sv-label", text: VIEWS[V.id].name.toUpperCase() }));
    }
  }

  for (const d of dims){
    const V = L.views[d.view];
    if (!V) continue;
    const lv = L.levels.get(d.id) || 0;
    gDims.appendChild(dimGroup(d, V, lv, unit, marks[d.id]));
  }
  return { svg, layout: L, snaps };
}

function dimGroup(d, V, lv, unit, mark){
  const g = s("g", { class: "sv-dim" + (mark ? " " + mark : ""), "data-id": d.id });
  const A = [d.a[0] + V.ox, d.a[1] + V.oy], B = [d.b[0] + V.ox, d.b[1] + V.oy];
  const bx = { minX: V.box.minU + V.ox, maxX: V.box.maxU + V.ox, minY: V.box.minV + V.oy, maxY: V.box.maxV + V.oy };
  const dist = DIM.base + lv * DIM.step;
  const value = String(Math.round(dimLength(d) * unit * 10) / 10);
  if (d.dir === "h"){
    const y = d.side > 0 ? bx.maxY + dist : bx.minY - dist;
    const [x1, x2] = [Math.min(A[0], B[0]), Math.max(A[0], B[0])];
    const sg = d.side > 0 ? 1 : -1;
    for (const P of [A, B]){
      g.appendChild(lineEl(P[0], P[1] + sg * DIM.gap, P[0], y + sg * DIM.over, "sv-ext"));
    }
    g.appendChild(lineEl(x1, y, x2, y, "sv-dline"));
    g.appendChild(arrow(x1, y, -1, 0)); g.appendChild(arrow(x2, y, 1, 0));
    g.appendChild(s("text", { x: r3((x1 + x2) / 2), y: r3(-(y + 0.14)), class: "sv-dtext", "text-anchor": "middle", text: value }));
    g.appendChild(s("rect", { x: r3(x1), y: r3(-(y + 0.6)), width: r3(Math.max(x2 - x1, 0.3)), height: 0.9, class: "sv-dhit" }));
  } else {
    const x = d.side > 0 ? bx.maxX + dist : bx.minX - dist;
    const [y1, y2] = [Math.min(A[1], B[1]), Math.max(A[1], B[1])];
    const sg = d.side > 0 ? 1 : -1;
    for (const P of [A, B]){
      g.appendChild(lineEl(P[0] + sg * DIM.gap, P[1], x + sg * DIM.over, P[1], "sv-ext"));
    }
    g.appendChild(lineEl(x, y1, x, y2, "sv-dline"));
    g.appendChild(arrow(x, y1, 0, -1)); g.appendChild(arrow(x, y2, 0, 1));
    const tx = x - 0.14, ty = (y1 + y2) / 2;
    g.appendChild(s("text", { x: r3(tx), y: r3(-ty), class: "sv-dtext", "text-anchor": "middle", transform: `rotate(-90 ${r3(tx)} ${r3(-ty)})`, text: value }));
    g.appendChild(s("rect", { x: r3(x - 0.6), y: r3(-y2), width: 0.9, height: r3(Math.max(y2 - y1, 0.3)), class: "sv-dhit" }));
  }
  return g;
}

/* gezi betea: (x,y) puntan, (dx,dy) norabidean begira */
function arrow(x, y, dx, dy){
  const L = DIM.arrow, W = DIM.arrowW;
  const bx = x - dx * L, by = y - dy * L;
  const px = -dy * W, py = dx * W;
  const pts = [[x, y], [bx + px, by + py], [bx - px, by - py]].map(([a, b]) => r3(a) + "," + r3(-b)).join(" ");
  return s("polygon", { points: pts, class: "sv-arrow" });
}

/* SVG deskargatzeko (koloreak finko) */
export function standaloneSVG(svg){
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", NS);
  const style = document.createElementNS(NS, "style");
  style.textContent = `
    .sv-vis{stroke:#0c1723;stroke-width:.07;stroke-linecap:round;fill:none}
    .sv-hid{stroke:#0c1723;stroke-width:.04;stroke-dasharray:.2 .13;fill:none}
    .sv-ext,.sv-dline{stroke:#2a78d6;stroke-width:.025;fill:none}
    .sv-arrow{fill:#2a78d6}
    .sv-dtext{fill:#315eff;font:700 .44px Lato,Arial,sans-serif}
    .sv-label{fill:#666666;font:700 .32px Lato,Arial,sans-serif}
    .sv-dhit,.sv-snap,.sv-grid{display:none}`;
  clone.insertBefore(style, clone.firstChild);
  const vb = clone.getAttribute("viewBox").split(" ").map(Number);
  clone.setAttribute("width", Math.round(vb[2] * 10) + "mm");
  clone.setAttribute("height", Math.round(vb[3] * 10) + "mm");
  return new XMLSerializer().serializeToString(clone);
}
