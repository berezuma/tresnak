/* ============================================================
   ARIKETA BATEN INTERFAZEA (Firebase gabe: emaitza onResult-era)
   ============================================================ */

import { h } from "./ui.js";
import { PieceViewer } from "./geo/viewer3d.js";
import { buildSolid, sameCells, heightGrid, bounds, normalizeCells, volume } from "./geo/solid.js";
import { projectView, compareAtoms, sameViews, viewAtoms, parseAtom, VIEWS } from "./geo/project.js";
import { s, isoSVG, sheetSVG, segmentsGroup, shapeIcon } from "./geo/svg.js";
import { checkDims } from "./geo/dims.js";
import { DimEditor, DrawGrid } from "./widgets.js";
import { TYPES } from "./levels.js";
import { SHAPE_NAMES } from "./editor-ui.js";
import { UNIT_MM } from "./config.js";

const VIEW_ASK = {
  F: "<b class='vF'>aurretik</b> (altxaera)",
  T: "<b class='vT'>goitik</b> (oinplanoa)",
  L: "<b class='vL'>ezkerretik</b> (ezkerreko profila)"
};

export function renderExercise(root, ex, { onResult = async () => {}, onNext = null, progress = null } = {}){
  const cleanup = [];
  const T = TYPES[ex.type];
  const prog = h("span", { class: "tb-meta" });
  const setProg = (p) => { prog.textContent = p ? ((p.done ? "eginda ✓ · " : "") + "onena %" + (p.best || 0) + " · " + (p.tries || 0) + " saiakera") : "saiakerarik ez"; };
  setProg(progress);

  const task = h("div", { class: "notice ex-task", style: { marginTop: "12px" } });
  const grid = h("div", { class: "ex-grid" });
  const fb = h("div", { class: "feedback", hidden: true });
  root.replaceChildren(
    h("div", { class: "titleblock" },
      h("span", { class: "tb-id", text: ex.levelInfo.code + " · " + T.short }),
      h("span", { class: "tb-name", text: ex.pieceName ? T.title + " — " + ex.pieceName : T.title + " · " + ex.i }),
      h("span", { class: "spacer" }), prog),
    task, grid, fb,
    h("details", { style: { margin: "16px 0 30px" } },
      h("summary", { class: "eyebrow", style: { cursor: "pointer" }, text: "Gogoratu — " + ex.levelInfo.title }),
      h("div", { class: "theory", style: { marginTop: "10px" } },
        ex.levelInfo.theory.map(t => h("article", {}, h("h4", { text: t.h }), h("p", { html: t.p }))))));

  /* ---------- laguntzaileak ---------- */
  const viewer = (host, opts) => { const v = new PieceViewer(host, opts); cleanup.push(() => v.dispose()); return v; };

  async function result(score, text, { done = score >= 100, retry = null } = {}){
    fb.hidden = false;
    fb.className = "feedback " + (score >= 100 ? "ok" : score >= 50 ? "mid" : "bad");
    /* replaceChildren/append ez dituzte null-ak baztertzen ("null" testua idazten dute) */
    fb.replaceChildren(...[
      h("span", { class: "big", text: "%" + score }),
      h("div", { style: { flex: "1 1 260px" } }, h("div", { html: text })),
      retry ? h("button", { class: "btn", onclick: retry }, "Berriro saiatu") : null,
      done && onNext ? h("button", { class: "btn primary", onclick: onNext }, "Hurrengo ariketa →") : null
    ].filter(Boolean));
    try { const p = await onResult(score, { solved: done }); if (p) setProg(p); } catch(e){ /* onResult-ek erakusten du */ }
  }

  function pieceViewer(host, cells, { colors = true, hint = true } = {}){
    const b = bounds(cells);
    const v = viewer(host, { editable: false, colors, size: { x: Math.max(b.max[0], 1), y: Math.max(b.max[1], 1), z: Math.max(b.max[2], 1) } });
    v.setCells(cells); v.frameCells();
    host.append(
      hint ? h("div", { class: "v3d-hint", text: "arrastatu pieza biratzeko" }) : "",
      h("div", { class: "v3d-bar" },
        h("button", { class: "btn sm", onclick: () => v.setView("I") }, "Hasierako ikuspegia"),
        h("span", { class: "spacer" }),
        h("button", { class: "btn sm" + (colors ? " primary" : ""), onclick: (e) => { v.setColors(!v.opts.colors); e.currentTarget.classList.toggle("primary", v.opts.colors); } }, "Koloreak")));
    return v;
  }

  /* Aukera anitzekoa: lehen saiakeran %100, bigarrenean %50 */
  function choice(items, onDone){
    let tries = 0, finished = false;
    const box = h("div", { class: "options" });
    items.forEach((it, i) => {
      const b = h("button", { class: "option", type: "button" }, h("span", { class: "opt-l", text: "ABCD"[i] }), it.el);
      b.onclick = () => {
        if (finished || b.disabled) return;
        tries++;
        if (it.correct){
          b.classList.add("right"); finished = true;
          box.querySelectorAll("button").forEach(x => x.disabled = true);
          onDone(tries === 1 ? 100 : tries === 2 ? 50 : 0, tries);
        } else {
          b.classList.add("wrong"); b.disabled = true;
        }
      };
      box.append(b);
    });
    return box;
  }

  function sameScale(pvs, hidden, pad = 0.35){
    const W = Math.max(...pvs.map(p => p.box.maxU - p.box.minU)) + 2 * pad;
    const H = Math.max(...pvs.map(p => p.box.maxV - p.box.minV)) + 2 * pad;
    return pvs.map(pv => {
      const cu = (pv.box.minU + pv.box.maxU) / 2, cv = (pv.box.minV + pv.box.maxV) / 2;
      const svg = s("svg", { viewBox: `${cu - W / 2} ${-cv - H / 2} ${W} ${H}`, class: "sv" });
      svg.appendChild(segmentsGroup(pv, { hidden }));
      return svg;
    });
  }

  const sheetBox = (solid, hidden, title = "Bistak (sistema europarra)") =>
    h("section", { class: "sheet" }, h("div", { class: "sheet-head" }, h("span", { class: "eyebrow", text: title })),
      h("div", { class: "sheet-body" }, sheetSVG(solid, { hidden, labels: true }).svg));

  /* ---------- motak ---------- */
  switch (ex.type){

    case "aukeratu": {
      task.innerHTML = "Nola ikusten da pieza hau " + VIEW_ASK[ex.view] + "? Biratu pieza eta aukeratu bista zuzena." +
        (ex.hidden ? " Kontuan hartu <b>ezkutuko ertzak</b> (marra etenak)." : "");
      const host = h("div", { class: "v3d" });
      grid.append(host);
      pieceViewer(host, ex.cells, { colors: ex.level <= 2 });
      const svgs = sameScale(ex.options.map(o => o.pv), ex.hidden);
      grid.append(h("div", {}, choice(ex.options.map((o, i) => ({ el: svgs[i], correct: o.correct })), (score, tries) =>
        result(score, tries === 1 ? "Oso ondo! Lehen saiakeran asmatu duzu." : "Zuzena da, baina " + tries + " saiakera behar izan dituzu.", { done: true }))));
      break;
    }

    case "isometrikoa": {
      task.innerHTML = "Hiru bista hauek pieza bakar batenak dira. Zein da pieza?";
      grid.append(sheetBox(ex.solid, ex.hidden));
      const items = ex.options.map(o => ({ el: isoSVG(o.cells, { pad: 0.3 }), correct: o.correct }));
      grid.append(h("div", {}, choice(items, (score, tries) =>
        result(score, tries === 1 ? "Bikain! Bistak ondo irakurri dituzu." : "Zuzena. Hurrengoan, alderatu bista bakoitza aukerarekin banan-banan.", { done: true }))));
      break;
    }

    case "zenbakiak": {
      task.innerHTML = "Oinplano zenbakidua: lauki bakoitzeko zenbakiak zutabe horretan zenbat <b>kubo</b> dauden adierazten du. Eraiki pieza 3Dn eta sakatu <b>Egiaztatu</b>.";
      const g = ex.grid, rows = g.length, cols = g[0].length;
      const hsvg = s("svg", { viewBox: `-0.2 ${-(rows + 0.2)} ${cols + 0.4} ${rows + 1}`, class: "hgrid" });
      g.forEach((row, y) => row.forEach((val, x) => {
        hsvg.append(s("rect", { x, y: -(y + 1), width: 1, height: 1, class: val ? "" : "zero" }));
        if (val) hsvg.append(s("text", { x: x + 0.5, y: -(y + 0.5) + 0.18, "text-anchor": "middle", text: String(val) }));
      }));
      hsvg.append(s("text", { x: cols / 2, y: 0.55, "text-anchor": "middle", class: "front", text: "▲ AURREA" }));
      grid.append(h("section", { class: "sheet" }, h("div", { class: "sheet-head" }, h("span", { class: "eyebrow vT", text: "Oinplano zenbakidua (goitik ikusita)" })),
        h("div", { style: { padding: "20px" } }, hsvg)));
      const col = h("section", { class: "sheet panel" });
      const host = h("div", { class: "v3d" });
      const b = bounds(ex.cells);
      const size = { x: b.size[0] + 2, y: b.size[1] + 2, z: b.size[2] + 1 };
      const built = new Map();
      const v = viewer(host, { editable: true, size, onPick: (hit) => {
        const k = hit.cell.join("_");
        if (hit.type === "add") built.set(k, "c"); else built.delete(k);
        v.setCells(built); fb.hidden = true;
      }});
      v.setTool("add");
      const tools = h("span", { class: "seg" },
        h("button", { class: "on", onclick: (e) => { v.setTool("add"); mark(e); } }, "Gehitu"),
        h("button", { onclick: (e) => { v.setTool("remove"); mark(e); } }, "Kendu"),
        h("button", { onclick: (e) => { v.setTool("orbit"); mark(e); } }, "Biratu"));
      const mark = (e) => tools.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === e.currentTarget));
      col.append(h("div", { class: "sheet-head" }, tools, h("span", { class: "spacer" }),
        h("button", { class: "btn sm", onclick: () => { built.clear(); v.setCells(built); } }, "Hustu"),
        h("button", { class: "btn primary", onclick: () => {
          if (!built.size){ result(0, "Oraindik ez duzu kuborik jarri.", { done: false }); return; }
          if (sameCells(built, ex.cells)) { result(100, "Zuzena! Pieza zenbakiekin bat dator."); return; }
          const want = volume(ex.cells), have = volume(built);
          const bg = heightGrid(normalizeCells(built));
          const same = bg.length === g.length && bg[0].length === g[0].length;
          let wrong = 0;
          if (same) g.forEach((row, y) => row.forEach((val, x) => { if (bg[y][x] !== val) wrong++; }));
          const score = same ? Math.max(0, Math.round(100 * (1 - wrong / (rows * cols)))) - 10 : 0;
          result(Math.max(0, Math.min(90, score)),
            (have !== want ? "Zure piezak <b>" + have + "</b> kubo ditu; <b>" + want + "</b> behar dira. " : "") +
            (same ? wrong + " zutabek ez dute altuera zuzena." : "Piezaren oinplanoak ez du forma bera. Begiratu «AURREA» nora dagoen.") +
            (built.size && Array.from(built.keys()).some(k => { const [x, y, z] = k.split("_").map(Number); return z > 0 && !built.has(x + "_" + y + "_" + (z - 1)); }) ? " Kontuz: kubo batzuk airean daude." : ""),
            { done: false });
        }}, "Egiaztatu")));
      col.append(host);
      grid.append(col);
      break;
    }

    case "marraztu": {
      const vname = VIEWS[ex.view].name.toLowerCase();
      task.innerHTML = "Marraztu piezaren <b>" + vname + "</b>: nola ikusten den " + VIEW_ASK[ex.view] + ". " +
        (ex.hidden ? "Marraztu ertz ikusgaiak <b>marra jarraituz</b> eta ezkutukoak <b>marra etenez</b>." : "Ertz ikusgaiak bakarrik.") +
        " <span class='muted'>Arrastatu puntu batetik bestera lerro bat marrazteko; klik lerro batean kentzeko.</span>";
      const host = h("div", { class: "v3d" });
      grid.append(host);
      pieceViewer(host, ex.cells, { colors: ex.level <= 2 });
      let tw = 0, th = 0;
      for (const k of [...ex.target.vis, ...ex.target.hid]){ const a = parseAtom(k); tw = Math.max(tw, a[0], a[2]); th = Math.max(th, a[1], a[3]); }
      /* Sarea bistaren neurri berekoa: 3×3 bista → 3×3 sarea */
      const W = tw / 2, H = th / 2;
      const dhost = h("div", { class: "drawhost" });
      const dg = new DrawGrid(dhost, { w: W, h: H, hiddenAllowed: ex.hidden, onChange: () => { fb.hidden = true; } });
      Object.assign(dhost.querySelector("svg").style, { maxWidth: Math.round((W + 1.2) * 90) + "px", margin: "0 auto" });
      const modes = [["vis", "━ Ertz ikusgaia"]].concat(ex.hidden ? [["hid", "┅ Ezkutuko ertza"]] : []).concat([["erase", "Borragoma"]]);
      const modeSeg = h("span", { class: "seg" }, modes.map(([m, label]) =>
        h("button", { class: m === "vis" ? "on" : "", onclick: (e) => { dg.setMode(m); modeSeg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === e.currentTarget)); } }, label)));
      const legend = h("div", { class: "legend", hidden: true },
        h("span", {}, h("i", { class: "m" }), "falta da"), h("span", {}, h("i", { class: "x" }), "soberan"), ex.hidden ? h("span", {}, h("i", { class: "w" }), "marra mota okerra") : null);
      grid.append(h("section", { class: "sheet panel" },
        h("div", { class: "sheet-head" }, modeSeg, h("span", { class: "spacer" }),
          h("button", { class: "btn sm", onclick: () => dg.undo() }, "↶"),
          h("button", { class: "btn sm", onclick: () => { dg.clear(); legend.hidden = true; } }, "Garbitu"),
          h("button", { class: "btn primary", onclick: () => {
            const ans = dg.atoms;
            if (!ans.vis.size && !ans.hid.size){ result(0, "Sarea hutsik dago.", { done: false }); return; }
            const r = compareAtoms(ex.target, ans, { hidden: ex.hidden });
            dg.setFeedback(r.perfect ? null : r);
            legend.hidden = r.perfect;
            const parts = [];
            if (r.missing.length) parts.push("<b>" + r.missing.length + "</b> zati falta");
            if (r.extra.length) parts.push("<b>" + r.extra.length + "</b> zati soberan");
            if (r.wrongType.length) parts.push("<b>" + r.wrongType.length + "</b> zatitan marra mota okerra");
            result(r.perfect ? 100 : Math.min(r.score, 95), r.perfect ? "Bista zuzena! ✓" : parts.join(", ") + ". Koloreek non dagoen erakusten dute.", { done: r.perfect });
          }}, "Egiaztatu")),
        dhost, legend));
      break;
    }

    case "eraiki": {
      task.innerHTML = "Eraiki bista hauei dagokien pieza. " + (ex.hidden ? "Marra etenek <b>ezkutuko ertzak</b> adierazten dituzte. " : "") +
        "Bistak berdinak badira, ontzat emango da (pieza bat baino gehiago egon daitezke).";
      grid.append(sheetBox(ex.solid, ex.hidden));
      const col = h("section", { class: "sheet panel" });
      const host = h("div", { class: "v3d" });
      const b = bounds(ex.cells);
      const size = { x: b.size[0] + 2, y: b.size[1] + 2, z: b.size[2] + 1 };
      const built = new Map();
      const hasW = Array.from(ex.cells.values()).some(v => v !== "c");
      let shape = "c";
      const mine = h("div", { hidden: true });
      const v = viewer(host, { editable: true, size, onPick: (hit) => {
        const k = hit.cell.join("_");
        if (hit.type === "add" || hit.type === "replace") built.set(k, shape); else built.delete(k);
        v.setCells(built); fb.hidden = true; mine.hidden = true;
      }});
      v.setTool("add");
      const TOOLS = [["add", "Gehitu"], ["remove", "Kendu"]].concat(hasW ? [["replace", "Forma"]] : []).concat([["orbit", "Biratu"]]);
      const tools = h("span", { class: "seg" }, TOOLS.map(([t, l]) => h("button", { class: t === "add" ? "on" : "", onclick: (e) => { v.setTool(t); tools.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === e.currentTarget)); } }, l)));
      const pal = hasW ? h("div", { class: "palette" }, ["c", "w000", "w010", "w100", "w110", "w001", "w011", "w101", "w111", "w200", "w210", "w201", "w211"].map(sh =>
        h("button", { class: sh === "c" ? "on" : "", title: SHAPE_NAMES[sh], onclick: (e) => { shape = sh; pal.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === e.currentTarget)); } }, shapeIcon(sh)))) : null;
      col.append(h("div", { class: "sheet-head" }, tools, h("span", { class: "spacer" }),
        h("button", { class: "btn sm", onclick: () => { built.clear(); v.setCells(built); mine.hidden = true; } }, "Hustu"),
        h("button", { class: "btn primary", onclick: () => {
          if (!built.size){ result(0, "Oraindik ez duzu ezer eraiki.", { done: false }); return; }
          const diff = sameViews(built, ex.cells, ["F", "T", "L"], ex.hidden);
          if (!diff.length){ mine.hidden = true; result(100, "Zure piezaren hiru bistak ereduaren berdinak dira. ✓"); return; }
          mine.hidden = false;
          mine.replaceChildren(sheetBox(buildSolid(built), ex.hidden, "Zure piezaren bistak — alderatu"));
          result(Math.round(100 * (3 - diff.length) / 3 * 0.9),
            "Bista hauek ez datoz bat: <b>" + diff.map(d => VIEWS[d].name).join(", ") + "</b>. Behean zure piezaren bistak dituzu alderatzeko.", { done: false });
        }}, "Egiaztatu")));
      if (pal) col.append(pal);
      col.append(host, mine);
      grid.append(col);
      break;
    }

    case "akotatu": {
      task.innerHTML = "Akotatu pieza: jarri <b>behar diren kota guztiak</b>, bat ere ez soberan. Egin klik <b>bi erpinetan</b> bista berean kota bat jartzeko. Kubo bakoitzak " + UNIT_MM + " mm ditu.";
      grid.style.gridTemplateColumns = "minmax(0, 1.7fr) minmax(0, 1fr)";
      const dims = [];
      let marks = {};
      const sheetHost = h("div", { class: "sheet-body" });
      const issues = h("div", { class: "issues" });
      const del = h("button", { class: "btn sm", disabled: true, onclick: () => ed.removeSelected() }, "Kota ezabatu");
      const flip = h("button", { class: "btn sm", disabled: true, onclick: () => ed.flipSelected() }, "Beste aldera");
      const redraw = () => ed.update({ dims: dims.slice(), marks });
      const ed = new DimEditor(sheetHost, {
        solid: ex.solid, hidden: true, unit: UNIT_MM, dims: [],
        onAdd: (d) => { dims.push(d); marks = {}; fb.hidden = true; redraw(); },
        onRemove: (id) => { const i = dims.findIndex(x => x.id === id); if (i >= 0) dims.splice(i, 1); marks = {}; redraw(); },
        onUpdate: (d) => { const i = dims.findIndex(x => x.id === d.id); if (i >= 0) dims[i] = d; redraw(); },
        onSelect: (id) => { del.disabled = flip.disabled = !id; }
      });
      cleanup.push(() => ed.destroy());
      const host3d = h("div", { class: "v3d", style: { height: "260px", minHeight: "220px" } });
      grid.append(
        h("section", { class: "sheet" }, h("div", { class: "sheet-head" },
          h("span", { class: "eyebrow", text: "Bistak" }), h("span", { class: "spacer" }), del, flip,
          h("button", { class: "btn sm", onclick: () => { dims.length = 0; marks = {}; redraw(); issues.replaceChildren(); } }, "Dena kendu")), sheetHost),
        h("div", { class: "stack", style: { gap: "10px" } },
          host3d,
          h("button", { class: "btn primary", onclick: () => {
            const hiddenPts = {};
            for (const p of ed.snaps) if (p.hiddenOnly) (hiddenPts[p.view] = hiddenPts[p.view] || new Set()).add(p.u + "," + p.v);
            const r = checkDims(ex.solid, dims, { unit: UNIT_MM, hiddenPts });
            marks = {};
            r.issues.forEach(i => { if (["dup", "cycle", "zero", "hidden"].includes(i.kind)) i.ids.forEach(id => marks[id] = "bad"); });
            redraw();
            issues.replaceChildren(...r.issues.map(i => h("div", { class: "issue " + i.kind, text: i.text })));
            const penalty = r.issues.filter(i => i.kind === "hidden").length * 5;
            const score = r.perfect ? Math.max(80, 100 - penalty) : Math.min(95, r.score);
            result(score, r.perfect ? (penalty ? "Akotazioa osoa da, baina begiratu oharrak." : "Akotazio osoa eta garbia! ✓") :
              "<b>" + r.totalOk + " / " + r.totalNeeded + "</b> kota beharrezko jarri dituzu. Irakurri azpiko oharrak.", { done: r.perfect });
          }}, "Egiaztatu akotazioa"),
          issues,
          h("div", { class: "notice", style: { fontSize: "13px" }, html:
            "<b>Arauak:</b> neurri bakoitza behin · kate itxirik ez · neurri orokorrak · kotak piezatik kanpo · ez akotatu ezkutuko ertzik." })));
      pieceViewer(host3d, ex.cells, { colors: false, hint: false });
      break;
    }

    case "sistema": {
      const name = ex.ask === "E" ? "europarrean (ISO-E)" : "amerikarrean (ISO-A)";
      task.innerHTML = "Zein orritan daude bistak ondo kokatuta <b>sistema " + name + "</b>? Biratu pieza bisten norabideak ulertzeko.";
      const host = h("div", { class: "v3d" });
      grid.append(host);
      pieceViewer(host, ex.cells, { colors: true });
      const items = ex.options.map(o => ({ el: placedSheet(ex.solid, o.place, ex.hidden), correct: o.correct }));
      grid.append(h("div", {}, choice(items, (score, tries) => result(score, ex.ask === "E"
        ? "Sistema europarrean oinplanoa altxaeraren <b>azpian</b> dago eta ezkerreko profila <b>eskuinean</b>."
        : "Sistema amerikarrean oinplanoa altxaeraren <b>gainean</b> dago eta eskuineko profila <b>eskuinean</b>.", { done: true }))));
      break;
    }
  }

  return () => cleanup.forEach(f => { try { f(); } catch(e){} });
}

/* Bistak lauki-sare batean kokatuta (sistema-ariketarako) */
function placedSheet(solid, place, hidden){
  const G = 1.4, M = 0.7;
  const pvs = {};
  for (const v of Object.keys(place)) pvs[v] = projectView(solid, v);
  const colW = [0, 0], rowH = [0, 0];
  for (const [v, [c, r]] of Object.entries(place)){
    const b = pvs[v].box;
    colW[c] = Math.max(colW[c], b.maxU - b.minU);
    rowH[r] = Math.max(rowH[r], b.maxV - b.minV);
  }
  const W = 2 * M + colW[0] + G + colW[1];
  const H = 2 * M + rowH[0] + G + rowH[1];
  const svg = s("svg", { viewBox: `0 ${-H} ${W} ${H}`, class: "sv" });
  for (const [v, [c, r]] of Object.entries(place)){
    const b = pvs[v].box;
    const x = M + (c ? colW[0] + G : 0);
    const topFromTop = M + (r ? rowH[0] + G : 0);
    const ox = x - b.minU;
    const oy = (H - topFromTop) - b.maxV;
    svg.appendChild(segmentsGroup(pvs[v], { hidden, ox, oy }));
  }
  return svg;
}
