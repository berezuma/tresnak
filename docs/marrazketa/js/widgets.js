/* ============================================================
   WIDGETAK: kotak jartzeko orria (DimEditor) eta bistak
   marrazteko sarea (DrawGrid).
   ============================================================ */

import { s, sheetSVG, lineEl } from "./geo/svg.js";
import { atomKey, parseAtom } from "./geo/project.js";
import { guessDir } from "./geo/dims.js";
import { uid } from "./ui.js";

function svgPoint(svg, e){
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [p.x, -p.y];
}

/* ------------------------------------------------------------
   KOTAK JARTZEKO ORRIA
   ------------------------------------------------------------ */
export class DimEditor {
  constructor(host, opts){
    this.host = host;
    this.o = { editable: true, hidden: true, system: "E", unit: 10, dims: [], marks: {}, onAdd: () => {}, onRemove: () => {}, onUpdate: () => {}, onSelect: () => {}, ...opts };
    this.first = null;
    this.selected = null;
    this._key = (e) => {
      if (!this.selected || !this.host.isConnected) return;
      if (e.target.closest && e.target.closest("input,textarea,select")) return;
      if (e.key === "Delete" || e.key === "Backspace"){ e.preventDefault(); this.removeSelected(); }
      if (e.key === "Escape"){ this.selected = null; this.first = null; this.render(); }
    };
    document.addEventListener("keydown", this._key);
    this.render();
  }
  update(p){ Object.assign(this.o, p); if (this.selected && !this.o.dims.some(d => d.id === this.selected)) this.selected = null; this.render(); }
  destroy(){ document.removeEventListener("keydown", this._key); }

  removeSelected(){ if (!this.selected) return; const id = this.selected; this.selected = null; this.o.onSelect(null); this.o.onRemove(id); }
  flipSelected(){
    const d = this.o.dims.find(x => x.id === this.selected);
    if (d) this.o.onUpdate({ ...d, side: -d.side });
  }

  render(){
    const marks = { ...this.o.marks };
    if (this.selected) marks[this.selected] = (marks[this.selected] ? marks[this.selected] + " " : "") + "sel";
    const { svg, layout, snaps } = sheetSVG(this.o.solid, {
      system: this.o.system, hidden: this.o.hidden, dims: this.o.dims, unit: this.o.unit, marks,
      extraClass: this.o.editable ? "editing" : ""
    });
    this.svg = svg; this.layout = layout; this.snaps = snaps;
    if (this.o.editable){
      const g = s("g", { class: "sv-snaps" });
      for (const p of snaps){
        const cls = "sv-snap" + (p.hiddenOnly ? " hid" : "") + (this.first && this.first.view === p.view && this.first.u === p.u && this.first.v === p.v ? " first" : "");
        g.appendChild(s("circle", { cx: p.x, cy: -p.y, r: 0.14, class: cls }));
      }
      this.hover = s("circle", { r: 0.22, class: "sv-hover", cx: -10, cy: 10 });
      g.appendChild(this.hover);
      this.rubber = s("line", { class: "sv-rubber", x1: 0, y1: 0, x2: 0, y2: 0, visibility: "hidden" });
      g.appendChild(this.rubber);
      svg.appendChild(g);
      svg.addEventListener("pointermove", (e) => this._move(e));
      svg.addEventListener("click", (e) => this._click(e));
    }
    this.host.replaceChildren(svg);
  }

  _nearest(e){
    const [x, y] = svgPoint(this.svg, e);
    let best = null, bd = 0.55;
    for (const p of this.snaps){
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd){ bd = d; best = p; }
    }
    return { best, x, y };
  }
  _move(e){
    const { best, x, y } = this._nearest(e);
    if (best){ this.hover.setAttribute("cx", best.x); this.hover.setAttribute("cy", -best.y); }
    else { this.hover.setAttribute("cx", -10); this.hover.setAttribute("cy", 10); }
    if (this.first){
      const fx = this.first.x, fy = this.first.y;
      const tx = best ? best.x : x, ty = best ? best.y : y;
      Object.entries({ x1: fx, y1: -fy, x2: tx, y2: -ty }).forEach(([k, v]) => this.rubber.setAttribute(k, v));
      this.rubber.setAttribute("visibility", "visible");
    }
  }
  _click(e){
    const dg = e.target.closest && e.target.closest(".sv-dim");
    if (dg){
      this.selected = this.selected === dg.dataset.id ? null : dg.dataset.id;
      this.first = null;
      this.o.onSelect(this.selected);
      this.render();
      return;
    }
    const { best } = this._nearest(e);
    if (!best){
      if (this.first || this.selected){ this.first = null; this.selected = null; this.o.onSelect(null); this.render(); }
      return;
    }
    if (!this.first || this.first.view !== best.view){ this.first = best; this.selected = null; this.o.onSelect(null); this.render(); return; }
    if (this.first.u === best.u && this.first.v === best.v){ this.first = null; this.render(); return; }
    const a = [this.first.u, this.first.v], b = [best.u, best.v];
    const du = Math.abs(b[0] - a[0]), dv = Math.abs(b[1] - a[1]);
    const dir = du < 1e-6 ? "v" : dv < 1e-6 ? "h" : guessDir(a, b);
    const i = dir === "h" ? 0 : 1;
    if (Math.abs(b[i] - a[i]) < 1e-6){ this.first = best; this.render(); return; }
    const [p, q] = a[i] <= b[i] ? [a, b] : [b, a];
    const box = this.layout.views[best.view].box;
    const j = dir === "h" ? 1 : 0;
    const mid = (p[j] + q[j]) / 2;
    const center = dir === "h" ? (box.minV + box.maxV) / 2 : (box.minU + box.maxU) / 2;
    const d = { id: uid("d"), view: best.view, a: p, b: q, dir, side: mid >= center ? 1 : -1 };
    this.first = null;
    this.o.onAdd(d);
  }
}

/* ------------------------------------------------------------
   MARRAZTEKO SAREA
   Atomoak koordenatu bikoiztuetan (ikusi project.js).
   ------------------------------------------------------------ */
export class DrawGrid {
  constructor(host, opts){
    this.host = host;
    this.o = { w: 8, h: 6, hiddenAllowed: false, readOnly: false, onChange: () => {}, ...opts };
    this.vis = new Set(opts.atoms?.vis || []);
    this.hid = new Set(opts.atoms?.hid || []);
    this.mode = "vis";
    this.history = [];
    this.feedback = null;
    this.build();
  }

  get atoms(){ return { vis: new Set(this.vis), hid: new Set(this.hid) }; }
  setMode(m){ this.mode = m; this.host.dataset.mode = m; }
  setAtoms(a){ this.vis = new Set(a.vis); this.hid = new Set(a.hid); this.draw(); }

  snapshot(){ this.history.push([new Set(this.vis), new Set(this.hid)]); if (this.history.length > 80) this.history.shift(); }
  undo(){ const h = this.history.pop(); if (!h) return; [this.vis, this.hid] = h; this.feedback = null; this.draw(); this.o.onChange(this.atoms); }
  clear(){ this.snapshot(); this.vis.clear(); this.hid.clear(); this.feedback = null; this.draw(); this.o.onChange(this.atoms); }

  /* Zuzenketa erakutsi: res = compareAtoms()-en emaitza (helburuaren koordenatuetan) */
  setFeedback(res){
    this.feedback = null;
    if (res){
      let mx = Infinity, my = Infinity;
      for (const k of [...this.vis, ...this.hid]){ const a = parseAtom(k); mx = Math.min(mx, a[0], a[2]); my = Math.min(my, a[1], a[3]); }
      if (!isFinite(mx)){ mx = 2 * 2; my = 2 * 2; }
      const ox = res.absolute ? 0 : mx - res.dx, oy = res.absolute ? 0 : my - res.dy;
      const mv = (list) => list.map(k => { const a = parseAtom(k); return atomKey(a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy); });
      this.feedback = { missing: mv(res.missing), extra: mv(res.extra), wrong: mv(res.wrongType) };
    }
    this.draw();
  }

  build(){
    const { w, h } = this.o;
    const svg = this.svg = s("svg", { viewBox: `-0.6 ${-(h + 0.6)} ${w + 1.2} ${h + 1.2}`, class: "drawgrid" });
    const grid = s("g", { class: "dg-grid" });
    for (let x = 0; x <= w; x++) grid.appendChild(lineEl(x, 0, x, h, "dg-line"));
    for (let y = 0; y <= h; y++) grid.appendChild(lineEl(0, y, w, y, "dg-line"));
    for (let x = 0; x <= w; x++) for (let y = 0; y <= h; y++) grid.appendChild(s("circle", { cx: x, cy: -y, r: 0.055, class: "dg-dot" }));
    this.gLines = s("g"); this.gFeed = s("g", { class: "dg-feed" });
    this.preview = s("line", { class: "dg-preview", visibility: "hidden" });
    svg.append(grid, this.gFeed, this.gLines, this.preview);
    this.host.replaceChildren(svg);
    this.host.dataset.mode = this.mode;
    if (!this.o.readOnly) this.bind();
    this.draw();
  }

  draw(){
    const g = this.gLines;
    g.replaceChildren();
    const add = (k, cls) => { const [a, b, c, d] = parseAtom(k); g.appendChild(lineEl(a / 2, b / 2, c / 2, d / 2, cls)); };
    this.mergedDraw(this.hid, "dg-hid", g);
    this.mergedDraw(this.vis, "dg-vis", g);
    const f = this.gFeed;
    f.replaceChildren();
    if (this.feedback){
      const put = (list, cls) => list.forEach(k => { const [a, b, c, d] = parseAtom(k); f.appendChild(lineEl(a / 2, b / 2, c / 2, d / 2, cls)); });
      put(this.feedback.missing, "dg-missing");
      put(this.feedback.extra, "dg-extra");
      put(this.feedback.wrong, "dg-wrong");
    }
  }

  /* Marra etenak ondo ikusteko, atomo lerrokideak segmentu luzeetan elkartu */
  mergedDraw(set, cls, g){
    const lines = new Map();
    for (const k of set){
      const [x1, y1, x2, y2] = parseAtom(k);
      const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
      const off = dx * y1 - dy * x1;
      const lk = dx + "," + dy + "," + off;
      const t1 = dx ? x1 : y1, t2 = dx ? x2 : y2;
      if (!lines.has(lk)) lines.set(lk, { dx, dy, off, iv: [] });
      lines.get(lk).iv.push([Math.min(t1, t2), Math.max(t1, t2)]);
    }
    for (const L of lines.values()){
      L.iv.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const r of L.iv){ const last = merged[merged.length - 1]; if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r.slice()); }
      for (const [t1, t2] of merged){
        let p, q;
        if (L.dx === 0){ const x = -L.off / L.dy; p = [x, t1]; q = [x, t2]; }
        else { p = [t1, (L.off + L.dy * t1) / L.dx]; q = [t2, (L.off + L.dy * t2) / L.dx]; }
        g.appendChild(lineEl(p[0] / 2, p[1] / 2, q[0] / 2, q[1] / 2, cls));
      }
    }
  }

  bind(){
    const svg = this.svg;
    let start = null;
    const clampPt = (x, y) => [Math.max(0, Math.min(this.o.w, Math.round(x))), Math.max(0, Math.min(this.o.h, Math.round(y)))];
    svg.addEventListener("pointerdown", (e) => {
      const [x, y] = svgPoint(svg, e);
      const P = clampPt(x, y);
      start = { raw: [x, y], P, nearPt: Math.hypot(P[0] - x, P[1] - y) < 0.34, moved: false };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
      if (!start) return;
      const [x, y] = svgPoint(svg, e);
      if (Math.hypot(x - start.raw[0], y - start.raw[1]) > 0.4) start.moved = true;
      if (!start.moved || !start.nearPt) return;
      const E = this.dragEnd(start.P, clampPt(x, y));
      const pv = this.preview;
      [["x1", start.P[0]], ["y1", -start.P[1]], ["x2", E[0]], ["y2", -E[1]]].forEach(([k, v]) => pv.setAttribute(k, v));
      pv.setAttribute("visibility", "visible");
      pv.setAttribute("class", "dg-preview " + this.mode);
    });
    const finish = (e) => {
      if (!start) return;
      const st = start; start = null;
      this.preview.setAttribute("visibility", "hidden");
      const [x, y] = svgPoint(svg, e);
      if (st.moved && st.nearPt){
        const E = this.dragEnd(st.P, clampPt(x, y));
        if (E[0] === st.P[0] && E[1] === st.P[1]) return;
        this.apply(lineAtoms(st.P, E), this.mode === "erase" ? "erase" : "set");
      } else if (!st.moved){
        const seg = this.nearestSegment(x, y);
        if (seg) this.apply(seg, "toggle");
      }
    };
    svg.addEventListener("pointerup", finish);
    svg.addEventListener("pointercancel", () => { start = null; this.preview.setAttribute("visibility", "hidden"); });
  }

  /* 8 norabideetako batera mugatu */
  dragEnd(P, E){
    const dx = E[0] - P[0], dy = E[1] - P[1];
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx > 2 * ady) return [E[0], P[1]];
    if (ady > 2 * adx) return [P[0], E[1]];
    const m = Math.min(adx, ady);
    return [P[0] + Math.sign(dx) * m, P[1] + Math.sign(dy) * m];
  }

  nearestSegment(x, y){
    const { w, h } = this.o;
    const cands = [];
    const cx = Math.floor(x), cy = Math.floor(y);
    const ry = Math.round(y), rx = Math.round(x);
    if (cx >= 0 && cx < w && ry >= 0 && ry <= h) cands.push({ d: Math.abs(y - ry), atoms: lineAtoms([cx, ry], [cx + 1, ry]) });
    if (cy >= 0 && cy < h && rx >= 0 && rx <= w) cands.push({ d: Math.abs(x - rx), atoms: lineAtoms([rx, cy], [rx, cy + 1]) });
    if (cx >= 0 && cx < w && cy >= 0 && cy < h){
      const lx = x - cx, ly = y - cy;
      cands.push({ d: Math.abs(lx - ly) / Math.SQRT2, atoms: lineAtoms([cx, cy], [cx + 1, cy + 1]) });
      cands.push({ d: Math.abs(lx + ly - 1) / Math.SQRT2, atoms: lineAtoms([cx + 1, cy], [cx, cy + 1]) });
    }
    cands.sort((a, b) => a.d - b.d);
    return cands[0] && cands[0].d < 0.3 ? cands[0].atoms : null;
  }

  apply(atoms, how){
    this.snapshot();
    const mode = this.mode;
    const target = mode === "hid" ? this.hid : this.vis;
    const other = mode === "hid" ? this.vis : this.hid;
    if (how === "erase" || (how === "toggle" && mode === "erase")){
      atoms.forEach(k => { this.vis.delete(k); this.hid.delete(k); });
    } else if (how === "toggle" && atoms.every(k => target.has(k))){
      atoms.forEach(k => target.delete(k));
    } else {
      atoms.forEach(k => { other.delete(k); target.add(k); });
    }
    this.feedback = null;
    this.draw();
    this.o.onChange(this.atoms);
  }
}

/* Bi sare-punturen arteko atomoak (ardatzekiko paraleloa edo 45°) */
export function lineAtoms(P, E){
  const out = [];
  const dx = Math.sign(E[0] - P[0]), dy = Math.sign(E[1] - P[1]);
  const n = Math.max(Math.abs(E[0] - P[0]), Math.abs(E[1] - P[1]));
  const X = P[0] * 2, Y = P[1] * 2;
  if (dx === 0 || dy === 0){
    for (let i = 0; i < n; i++) out.push(atomKey(X + dx * 2 * i, Y + dy * 2 * i, X + dx * 2 * (i + 1), Y + dy * 2 * (i + 1)));
  } else {
    for (let i = 0; i < 2 * n; i++) out.push(atomKey(X + dx * i, Y + dy * i, X + dx * (i + 1), Y + dy * (i + 1)));
  }
  return out;
}
