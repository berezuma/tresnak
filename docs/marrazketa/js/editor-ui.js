/* ============================================================
   PIEZA-EDITOREA
   Ezkerrean 3D eraikitzailea, eskuinean bistak (kotekin) denbora
   errealean. Datuak "backend" baten bidez gordetzen dira:
     { patchCells(patch), patchDims(patch), update(patch), subscribe(cb) }
   (Firestore pieza.js-en; memorian proba.html-en)
   ============================================================ */

import { h, toast, modal, field, confirmBox, download } from "./ui.js";
import { PieceViewer } from "./geo/viewer3d.js";
import { buildSolid, toCellMap, key, SHAPES, toSTL, volume, MAX_SIZE, isHeightmap, isConnected } from "./geo/solid.js";
import { projectView, VIEWS } from "./geo/project.js";
import { isoSVG, shapeIcon, standaloneSVG } from "./geo/svg.js";
import { checkDims } from "./geo/dims.js";
import { DimEditor } from "./widgets.js";
import { DEFAULT_SIZE, UNIT_MM } from "./config.js";
import { LEVELS, TYPES } from "./levels.js";

export const SHAPE_NAMES = {
  c: "Kuboa",
  w000: "Malda: goian atzera", w010: "Malda: goian aurrera", w001: "Malda alderantzizkoa (aurrean)", w011: "Malda alderantzizkoa (atzean)",
  w100: "Malda: altua ezkerrean", w110: "Malda: altua eskuinean", w101: "Malda alderantzizkoa (ezkerrean)", w111: "Malda alderantzizkoa (eskuinean)",
  w200: "Izkina moztua (atzean-eskuinean)", w210: "Izkina moztua (atzean-ezkerrean)", w201: "Izkina moztua (aurrean-eskuinean)", w211: "Izkina moztua (aurrean-ezkerrean)"
};

const sameMap = (a, b) => a.size === b.size && Array.from(a).every(([k, v]) => b.get(k) === v);

export function mountEditor(root, piece, backend, { isAdmin = false, backHref = "index.html", teamLabel = null } = {}){
  let cells = toCellMap(piece.cells);
  let dims = { ...(piece.dims || {}) };
  let meta = piece;
  let size = { ...DEFAULT_SIZE, ...(piece.size || {}) };
  const unit = piece.unit || UNIT_MM;
  const st = { tool: cells.size ? "orbit" : "add", shape: "c", system: "E", hidden: true, tab: "bistak" };
  const undo = [], redo = [];
  let selectedDim = null;
  let lastIssues = null;

  /* ---------- gordetzea ---------- */
  const saveEl = h("span", { class: "save-state" });
  let pending = 0;
  const save = (p) => {
    pending++;
    saveEl.className = "save-state saving"; saveEl.textContent = "gordetzen…";
    Promise.resolve(p).then(() => {
      if (--pending === 0){ saveEl.className = "save-state saved"; saveEl.textContent = "gordeta ✓"; }
    }, (e) => {
      pending--;
      saveEl.className = "save-state err"; saveEl.textContent = "ez da gorde!";
      toast(e.message || "Errorea gordetzean", "err");
    });
  };

  /* ---------- goiburua ---------- */
  const nameEl = h("span", { class: "tb-name", text: piece.name });
  const countEl = h("span", { class: "tb-meta" });
  const pubTag = h("span", { class: "tag", hidden: !piece.isExercise, text: "ariketa" });

  /* ---------- tresna-barra ---------- */
  const TOOLS = [["orbit", "Biratu"], ["add", "Gehitu"], ["remove", "Kendu"], ["replace", "Forma aldatu"]];
  const toolSeg = h("span", { class: "seg" }, TOOLS.map(([id, label]) =>
    h("button", { type: "button", "data-t": id, onclick: () => setTool(id) }, label)));
  const palette = h("div", { class: "palette", title: "Gehitzeko forma" }, SHAPES.map(sh =>
    h("button", { type: "button", "data-s": sh, title: SHAPE_NAMES[sh] || sh, onclick: () => setShape(sh) }, shapeIcon(sh))));
  const undoBtn = h("button", { class: "btn sm", title: "Desegin (Ctrl+Z)", onclick: () => doUndo() }, "↶ Desegin");
  const redoBtn = h("button", { class: "btn sm", title: "Berregin (Ctrl+Y)", onclick: () => doRedo() }, "↷");
  const toolNote = h("span", { class: "tool-note" });

  const toolbar = h("div", { class: "toolbar no-print" },
    toolSeg, palette, undoBtn, redoBtn,
    h("span", { class: "spacer" }),
    h("button", { class: "btn sm", onclick: sizeDialog }, "Lan-eremua"),
    h("button", { class: "btn sm danger", onclick: clearAll }, "Hustu"));

  /* ---------- 3D ---------- */
  const v3dHost = h("div", { class: "v3d" });
  /* Bista-botoiak: altxaera/oinplanoa/profila → proiekzio ortogonala eta
     ezkutuko ertzak marra etenez (marrazkiarekin bat etor dadin). 3D → perspektiba. */
  const pickView = (v) => {
    const plane = v !== "I";
    viewer.setOrtho(plane);
    viewer.setHiddenEdges(plane);
    orthoBtn.classList.toggle("primary", plane);
    hidBtn.classList.toggle("primary", plane);
    setView(v);
  };
  const viewSeg = h("span", { class: "seg views" }, [["I", "3D"], ["F", "Altxaera"], ["T", "Oinplanoa"], ["L", "Ezk. profila"]].map(([v, label]) =>
    h("button", { type: "button", "data-v": v, onclick: () => pickView(v) }, label)));
  const orthoBtn = h("button", { class: "btn sm", type: "button", title: "Proiekzio ortogonala: bistak nola sortzen diren ikusteko", onclick: () => { viewer.setOrtho(!viewer.isOrtho); orthoBtn.classList.toggle("primary", viewer.isOrtho); } }, "Ortogonala");
  const hidBtn = h("button", { class: "btn sm", type: "button", title: "Ezkutuko ertzak marra etenez", onclick: () => { viewer.setHiddenEdges(!viewer.opts.hiddenEdges); hidBtn.classList.toggle("primary", viewer.opts.hiddenEdges); } }, "┅ Ezkutukoak");
  const colorBtn = h("button", { class: "btn sm primary", type: "button", title: "Aurpegien koloreak bistekin lotuta", onclick: () => { viewer.setColors(!viewer.opts.colors); colorBtn.classList.toggle("primary", viewer.opts.colors); } }, "Koloreak");
  v3dHost.append(
    h("div", { class: "v3d-hint", html: "arrastatu: biratu · gurpila: zooma · eskuineko botoia: mugitu" }),
    h("div", { class: "v3d-bar" }, viewSeg, h("span", { class: "spacer" }), orthoBtn, hidBtn, colorBtn));

  /* ---------- orria ---------- */
  const tabSeg = h("span", { class: "seg" },
    h("button", { type: "button", "data-tab": "bistak", onclick: () => { st.tab = "bistak"; renderSheet(); } }, "Bistak"),
    h("button", { type: "button", "data-tab": "iso", onclick: () => { st.tab = "iso"; renderSheet(); } }, "Isometrikoa"));
  const sysSeg = h("span", { class: "seg" },
    h("button", { type: "button", "data-sys": "E", title: "Sistema europarra", onclick: () => { st.system = "E"; renderSheet(); } }, "ISO-E"),
    h("button", { type: "button", "data-sys": "A", title: "Sistema amerikarra", onclick: () => { st.system = "A"; renderSheet(); } }, "ISO-A"));
  const hidChk = h("input", { type: "checkbox", checked: true, onchange: () => { st.hidden = hidChk.checked; renderSheet(); } });
  const delDimBtn = h("button", { class: "btn sm", disabled: true, onclick: () => dimEd?.removeSelected() }, "Kota ezabatu");
  const flipDimBtn = h("button", { class: "btn sm", disabled: true, onclick: () => dimEd?.flipSelected() }, "Beste aldera");
  const checkBtn = h("button", { class: "btn sm primary", onclick: runCheck }, "Egiaztatu kotak");
  const sheetHost = h("div", { class: "sheet-body" });
  const issuesEl = h("div", { class: "issues" });
  const staleEl = h("div", { hidden: true, class: "notice", style: { marginTop: "8px", fontSize: "13px" } });
  const dimTools = h("div", { class: "row", style: { gap: "6px", marginTop: "8px" } },
    h("span", { class: "tool-note", html: "Kota bat jartzeko: <b>klik bi erpinetan</b> bista berean. Kota bat hautatzeko: klik haren gainean." }),
    h("span", { class: "spacer" }), delDimBtn, flipDimBtn, checkBtn);
  const sheet = h("section", { class: "sheet" },
    h("div", { class: "sheet-head" }, tabSeg, sysSeg, h("label", { class: "row", style: { gap: "5px", fontSize: "12.5px" } }, hidChk, "Ezkutuko ertzak")),
    sheetHost, dimTools, staleEl, issuesEl);

  root.replaceChildren(
    h("div", { class: "titleblock" },
      h("span", { class: "tb-id", text: "PIEZA" }), nameEl, teamLabel, pubTag,
      h("span", { class: "spacer" }), countEl, saveEl,
      isAdmin ? h("button", { class: "btn sm", onclick: publishDialog }, "Ariketa gisa…") : null,
      h("button", { class: "btn sm", onclick: exportDialog }, "Esportatu"),
      h("a", { class: "btn sm", href: backHref }, "← Hasiera")),
    toolbar,
    h("div", { class: "editor" }, v3dHost, sheet));

  const viewer = new PieceViewer(v3dHost, { editable: true, size, onPick });
  let dimEd = null;

  /* ---------- ekintzak ---------- */
  function setTool(t){
    st.tool = t; viewer.setTool(t);
    toolSeg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
    palette.style.opacity = (t === "add" || t === "replace") ? "1" : ".45";
    toolNote.textContent = { orbit: "", add: "Klik aurpegi batean ondoan forma bat gehitzeko.", remove: "Klik gelaxka batean kentzeko.", replace: "Klik gelaxka batean forma aldatzeko." }[t];
  }
  function setShape(sh){
    st.shape = sh; viewer.setShape(sh);
    palette.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.s === sh));
    if (st.tool === "orbit" || st.tool === "remove") setTool("add");
  }
  function setView(v){
    viewer.setView(v);
    viewSeg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  }

  function onPick(hit){
    const k = key(...hit.cell);
    if (hit.type === "add"){
      if (cells.size >= 1000){ toast("Gehienez 1000 gelaxka.", "err"); return; }
      applyPatch({ [k]: st.shape });
    }
    else if (hit.type === "remove") applyPatch({ [k]: null });
    else if (hit.type === "replace" && cells.get(k) !== st.shape) applyPatch({ [k]: st.shape });
  }

  function applyPatch(patch, record = true){
    const before = {};
    for (const k of Object.keys(patch)) before[k] = cells.get(k) || null;
    for (const [k, v] of Object.entries(patch)) v ? cells.set(k, v) : cells.delete(k);
    if (record){ undo.push({ before, after: patch }); redo.length = 0; }
    cellsChanged();
    save(backend.patchCells(patch));
  }
  function doUndo(){ const op = undo.pop(); if (!op) return; redo.push(op); applyPatch(op.before, false); }
  function doRedo(){ const op = redo.pop(); if (!op) return; undo.push(op); applyPatch(op.after, false); }

  async function clearAll(){
    if (!cells.size) return;
    if (!(await confirmBox("Pieza hustu?", "Gelaxka eta kota guztiak kenduko dira. Desegin daiteke (↶).", "Hustu"))) return;
    const patch = {};
    for (const k of cells.keys()) patch[k] = null;
    applyPatch(patch);
  }

  function sizeDialog(){
    const inp = (ax) => h("input", { type: "number", min: "1", max: String(MAX_SIZE), value: String(size[ax]) });
    const x = inp("x"), y = inp("y"), z = inp("z");
    modal({ title: "Lan-eremua", body: [
      h("div", { class: "row" }, field("Zabalera (X)", x), field("Sakonera (Y)", y), field("Altuera (Z)", z)),
      h("p", { class: "muted", style: { fontSize: "13px", margin: 0 }, text: "Kubo kopurua ardatz bakoitzean (gehienez " + MAX_SIZE + ")." })
    ], onOk: () => {
      const clamp = (el) => Math.max(1, Math.min(MAX_SIZE, parseInt(el.value) || 1));
      size = { x: clamp(x), y: clamp(y), z: clamp(z) };
      viewer.setWorkspace(size);
      save(backend.update({ size }));
    }});
  }

  /* ---------- marrazkia ---------- */
  function cellsChanged(){
    viewer.setCells(cells);
    lastIssues = null;
    renderSheet();
  }

  function validDims(solid){
    const pts = {};
    const list = [], stale = [];
    for (const d of Object.values(dims)){
      if (!VIEWS[d.view] || !Array.isArray(d.a) || !Array.isArray(d.b)) continue;
      if (!pts[d.view]){
        const pv = projectView(solid, d.view);
        const set = new Set();
        const r3 = (x) => Math.round(x * 1000) / 1000;
        for (const [a, b, c, e] of [...pv.vis, ...pv.hid]){ set.add(r3(a) + "," + r3(b)); set.add(r3(c) + "," + r3(e)); }
        pts[d.view] = set;
      }
      if (pts[d.view].has(d.a.join(",")) && pts[d.view].has(d.b.join(","))) list.push(d); else stale.push(d);
    }
    return { list, stale };
  }

  function renderSheet(){
    tabSeg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.tab === st.tab));
    sysSeg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.sys === st.system));
    const vol = volume(cells);
    countEl.textContent = cells.size ? (vol + " kubo" + (isConnected(cells) ? "" : " · ⚠ zati solteak")) : "hutsik";
    undoBtn.disabled = !undo.length; redoBtn.disabled = !redo.length;
    sysSeg.hidden = st.tab !== "bistak";
    dimTools.hidden = st.tab !== "bistak";

    if (!cells.size){
      dimEd?.destroy(); dimEd = null;
      sheetHost.replaceChildren(h("div", { class: "empty", style: { border: 0 } },
        h("h3", { text: "Pieza hutsik dago" }),
        h("p", { text: "Aukeratu «Gehitu» tresna eta egin klik sarean lehen kuboa jartzeko." })));
      issuesEl.replaceChildren(); staleEl.hidden = true;
      return;
    }
    const solid = buildSolid(cells);
    if (st.tab === "iso"){
      dimEd?.destroy(); dimEd = null;
      sheetHost.replaceChildren(h("div", { style: { maxWidth: "520px", margin: "0 auto", padding: "10px" } }, isoSVG(solid, { pad: 0.6 })));
      issuesEl.replaceChildren(); staleEl.hidden = true;
      return;
    }
    const { list, stale } = validDims(solid);
    const marks = {};
    if (lastIssues) lastIssues.forEach(i => { if (["dup", "cycle", "zero"].includes(i.kind)) i.ids.forEach(id => marks[id] = "bad"); });
    const opts = { solid, system: st.system, hidden: st.hidden, unit, dims: list, marks };
    if (!dimEd){
      dimEd = new DimEditor(sheetHost, {
        ...opts,
        onAdd: (d) => { dims[d.id] = d; lastIssues = null; renderSheet(); save(backend.patchDims({ [d.id]: d })); },
        onRemove: (id) => { delete dims[id]; lastIssues = null; renderSheet(); save(backend.patchDims({ [id]: null })); },
        onUpdate: (d) => { dims[d.id] = d; renderSheet(); save(backend.patchDims({ [d.id]: d })); },
        onSelect: (id) => { selectedDim = id; delDimBtn.disabled = flipDimBtn.disabled = !id; }
      });
    } else dimEd.update(opts);
    if (stale.length){
      staleEl.hidden = false;
      staleEl.replaceChildren(
        h("span", { text: stale.length + " kota ez dator bat piezarekin (pieza aldatu delako). " }),
        h("button", { class: "btn sm", onclick: () => {
          const patch = {}; stale.forEach(d => { patch[d.id] = null; delete dims[d.id]; });
          renderSheet(); save(backend.patchDims(patch));
        }}, "Kendu"));
    } else staleEl.hidden = true;
    if (!lastIssues) issuesEl.replaceChildren();
  }

  function runCheck(){
    const solid = buildSolid(cells);
    const { list } = validDims(solid);
    const hiddenPts = {};
    for (const p of dimEd?.snaps || []) if (p.hiddenOnly) (hiddenPts[p.view] = hiddenPts[p.view] || new Set()).add(p.u + "," + p.v);
    const res = checkDims(solid, list, { unit, hiddenPts });
    lastIssues = res.issues;
    renderSheet();
    issuesEl.replaceChildren(
      res.perfect ? h("div", { class: "issue ok", text: "Akotazioa osoa da: neurri guztiak zehaztuta, bat ere ez soberan. ✓" })
                  : h("div", { class: "issue", html: "<b>" + res.totalOk + " / " + res.totalNeeded + "</b> kota beharrezko jarrita." }),
      ...res.issues.map(i => h("div", { class: "issue " + i.kind, text: i.text })));
  }

  /* ---------- esportatu / argitaratu ---------- */
  function exportDialog(){
    const fname = (meta.name || "pieza").replace(/[^\w\-áéíóúñ ]+/gi, "").trim().replace(/\s+/g, "-") || "pieza";
    modal({ title: "Esportatu", okText: "Itxi", cancelText: "Utzi", body: [
      h("div", { class: "stack", style: { gap: "8px" } },
        h("button", { class: "btn", type: "button", onclick: () => { if (!cells.size) return; download(fname + ".stl", toSTL(buildSolid(cells), fname, unit), "model/stl"); } },
          "STL — 3D modeloa (Tinkercad-en inportatzeko)"),
        h("button", { class: "btn", type: "button", onclick: () => { const svg = sheetHost.querySelector("svg"); if (svg) download(fname + "-bistak.svg", standaloneSVG(svg), "image/svg+xml"); } },
          "SVG — bistak edo isometrikoa (orain ikusten dena)"),
        h("button", { class: "btn", type: "button", onclick: () => { const a = document.createElement("a"); a.href = viewer.snapshot(); a.download = fname + "-3d.png"; document.body.appendChild(a); a.click(); a.remove(); } },
          "PNG — 3D irudia"),
        h("button", { class: "btn", type: "button", onclick: () => window.print() }, "Inprimatu / PDF"))
    ], onOk: () => {} });
  }

  function publishDialog(){
    const lvl = h("select", {}, LEVELS.map(L => h("option", { value: String(L.n), selected: (meta.exercise?.level || 3) === L.n }, L.code + " — " + L.title)));
    const avail = ["aukeratu", "isometrikoa", "marraztu", "eraiki", "akotatu"].concat(isHeightmap(cells) ? ["zenbakiak"] : []);
    const cur = new Set(meta.exercise?.types || ["marraztu", "eraiki"]);
    const boxes = avail.map(t => { const c = h("input", { type: "checkbox", value: t, checked: cur.has(t) }); return h("label", { class: "row", style: { gap: "6px", fontSize: "13.5px" } }, c, TYPES[t].title + " — ", h("span", { class: "muted", text: TYPES[t].desc })); });
    const on = h("input", { type: "checkbox", checked: meta.isExercise !== false });
    modal({ title: "Ariketa gisa argitaratu", okText: "Gorde", body: [
      h("label", { class: "row", style: { gap: "6px", fontWeight: 600 } }, on, "Ikasle guztiek ariketa hau ikusiko dute"),
      field("Maila", lvl),
      h("div", { class: "eyebrow", text: "Ariketa motak" }),
      h("div", { class: "stack", style: { gap: "6px" } }, boxes),
      h("p", { class: "muted", style: { fontSize: "12.5px", margin: 0 }, text: "Ariketak piezaren UNEKO egoerarekin sortzen dira. Argitaratu ondoren pieza aldatzen baduzu, ariketa ere aldatuko da." })
    ], onOk: async () => {
      const types = boxes.map(b => b.querySelector("input")).filter(c => c.checked).map(c => c.value);
      if (on.checked && !types.length) throw new Error("Aukeratu gutxienez ariketa mota bat.");
      if (on.checked && !cells.size) throw new Error("Pieza hutsik dago.");
      const patch = on.checked ? { isExercise: true, exercise: { level: +lvl.value, types } } : { isExercise: false, exercise: null };
      await backend.update(patch);
      meta = { ...meta, ...patch };
      pubTag.hidden = !meta.isExercise;
      toast(on.checked ? "Argitaratuta: Ariketak orrian agertuko da" : "Ariketa kenduta", "ok");
    }});
  }

  /* ---------- teklatua ---------- */
  const onKey = (e) => {
    if (e.target.closest && e.target.closest("input,textarea,select")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey){ e.preventDefault(); doUndo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))){ e.preventDefault(); doRedo(); }
  };
  document.addEventListener("keydown", onKey);

  /* ---------- denbora errealean ---------- */
  const unsub = backend.subscribe((p) => {
    if (!p){ toast("Pieza ezabatu egin da.", "err"); return; }
    meta = p;
    nameEl.textContent = p.name;
    pubTag.hidden = !p.isExercise;
    const nc = toCellMap(p.cells);
    const cellsDiff = !sameMap(nc, cells);
    if (cellsDiff){ cells = nc; viewer.setCells(cells); lastIssues = null; }
    dims = { ...(p.dims || {}) };
    const ns = { ...DEFAULT_SIZE, ...(p.size || {}) };
    if (ns.x !== size.x || ns.y !== size.y || ns.z !== size.z){ size = ns; viewer.setWorkspace(size); }
    renderSheet();
  });

  setTool(st.tool); setShape("c"); if (!cells.size) setTool("add");
  setView("I");
  viewer.setCells(cells);
  renderSheet();

  return () => { unsub && unsub(); document.removeEventListener("keydown", onKey); dimEd?.destroy(); viewer.dispose(); };
}
