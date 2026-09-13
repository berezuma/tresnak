/* ============================================================
   GANTT DIAGRAMAREN EDITOREA
   - Atazak barra gisa: arrastatuz mugitu eta tamaina aldatu
   - Mugarriak, aurrerapena, arduraduna, kolorea, mendekotasunak
   - Denbora errealean gordetzen da eta taldekideen artean sinkronizatzen
   ============================================================ */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import {
  h, qs, qsa, clear, toast, modal, field, confirmBox, uid, debounce, download, param,
  parseYMD, ymd, addDays, diffDays, todayUTC, fmtDate, fmtDateLong, isWeekend,
  MONTHS, MONTHS_S, DAY
} from "./ui.js";
import * as S from "./store.js";

const app = qs("#app");
const PID = param("p");

const ZOOMS = { egunak:{w:34, label:"Egunak"}, asteak:{w:14, label:"Asteak"}, hilabeteak:{w:6, label:"Hilabeteak"} };
const COLORS = ["s1","s2","s3","s4","s5","s6"];
/* Etiketa-zutabearen zabalera benetako elementutik neurtzen da
   (pantaila txikietan CSSak aldatzen baitu) */
const LABW = () => {
  const el = qs(".g-head-label") || qs(".g-cell");
  return el ? Math.round(el.getBoundingClientRect().width) : 300;
};

let USER = null, PROJ = null;
let state = { tasks: [] };
let zoom = localStorage.getItem("gantt.zoom") || "egunak";
let selected = null;
let dragging = false;
let dirty = false;
let firstPaint = true;
let unwatch = null;

/* ===================== ABIARAZTEA ===================== */
(async () => {
  USER = await requireAuth();
  if (!PID){ location.replace("index.html"); return; }
  renderHeader(USER, "index.html");
  try { PROJ = await S.getProject(PID); }
  catch(e){ fatal(errMessage(e)); return; }

  buildShell();

  unwatch = S.watchData(PID, "gantt", (data, pending) => {
    if (!data) { state = { tasks: [] }; render(); return; }
    if (pending || dragging || dirty) return;          // norberaren aldaketak ez zapaldu
    state = normalize(data);
    render();
  }, err => toast(errMessage(err), "err"));
})();

function fatal(msg){
  app.className = "";
  clear(app).appendChild(h("div",{class:"wrap"},
    h("div",{class:"notice err", style:{marginTop:"30px"}, text:msg},),
    h("p",{}, h("a",{href:"index.html"}, "← Proiektuetara itzuli"))));
}

function normalize(d){
  const tasks = (d.tasks || []).map(t => ({
    id: t.id || uid("t"),
    name: t.name || "Ataza berria",
    start: t.start || ymd(todayUTC()),
    days: Math.max(1, parseInt(t.days) || 1),
    progress: Math.min(100, Math.max(0, parseInt(t.progress) || 0)),
    color: COLORS.includes(t.color) ? t.color : "s1",
    assignee: t.assignee || "",
    milestone: !!t.milestone,
    deps: Array.isArray(t.deps) ? t.deps : [],
    notes: t.notes || ""
  }));
  return { tasks };
}

/* ===================== GORDETZEA ===================== */
const setSaveState = (cls, txt) => { const e = qs("#savestate"); if (e){ e.className = "save-state " + cls; e.textContent = txt; } };

const flush = async () => {
  try{
    setSaveState("saving", "gordetzen…");
    await S.saveData(PID, "gantt", { tasks: state.tasks }, USER);
    dirty = false;
    setSaveState("saved", "gordeta ✓");
  } catch(e){
    setSaveState("err", "ez da gorde!");
    toast(errMessage(e), "err");
  }
};
const saveSoon = debounce(flush, 700);

function change(){ dirty = true; setSaveState("saving", "aldaketak…"); saveSoon(); render(); }
window.addEventListener("beforeunload", (e) => { if (dirty){ saveSoon.flush(); } });

/* ===================== EGITURA ===================== */
function buildShell(){
  app.className = "";
  clear(app);
  app.appendChild(h("div",{class:"wrap-wide", style:{paddingBottom:"20px"}},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"GANTT"}),
      h("span",{class:"tb-name", text:PROJ.name}),
      PROJ.teamId ? h("span",{class:"tag team", text:"taldea "+PROJ.teamId}) : h("span",{class:"tag solo", text:"bakarka"}),
      h("span",{class:"spacer"}),
      h("span",{class:"save-state", id:"savestate", text:""}),
      h("a",{class:"btn sm", href:"kanban.html?p="+PID}, "Kanban →"),
      h("a",{class:"btn sm", href:"index.html"}, "Proiektuak")
    ),
    h("div",{class:"row no-print", style:{marginTop:"12px"}},
      h("button",{class:"btn primary", onclick:()=>addTask()}, "+ Ataza"),
      h("button",{class:"btn", onclick:()=>addTask(true)}, "+ Mugarria"),
      h("span",{style:{width:"8px"}}),
      h("span",{class:"seg", id:"zoomseg"}, Object.entries(ZOOMS).map(([k,v]) =>
        h("button",{class: zoom===k?"on":"", onclick:()=>{ zoom=k; localStorage.setItem("gantt.zoom",k); render(); }}, v.label))),
      h("button",{class:"btn sm", onclick:scrollToToday}, "Gaur"),
      h("span",{class:"spacer"}),
      h("button",{class:"btn sm", onclick:exportCSV}, "CSV"),
      h("button",{class:"btn sm", onclick:()=>window.print()}, "Inprimatu / PDF")
    ),
    h("div",{class:"g-shell", id:"shell"}, h("div",{class:"g-inner", id:"inner"})),
    h("div",{class:"g-legend no-print", id:"legend"})
  ));
}

/* ===================== MARRAZKETA ===================== */
function range(){
  const ts = state.tasks;
  let min = Infinity, max = -Infinity;
  ts.forEach(t => {
    const s = parseYMD(t.start) ?? todayUTC();
    const e = s + (t.milestone ? 0 : (t.days-1)*DAY);
    if (s < min) min = s;
    if (e > max) max = e;
  });
  const today = todayUTC();
  if (!ts.length){ min = today; max = addDays(today, 20); }
  min = Math.min(min, today); max = Math.max(max, today);
  let start = addDays(min, -3);
  // astelehenera lerrokatu (asteen zutabeak garbi ikusteko)
  const wd = new Date(start).getUTCDay();
  start = addDays(start, -((wd + 6) % 7));
  let end = addDays(max, 6);
  const n = Math.max(21, diffDays(start, end) + 1);
  return { start, n };
}

function render(){
  const inner = qs("#inner"); if (!inner) return;
  const shell = qs("#shell");
  const keepX = shell.scrollLeft, keepY = shell.scrollTop;
  const rng = range();
  const start = rng.start;
  const dayW = ZOOMS[zoom].w;
  // eskuragarri dagoen zabalera bete, hutsunerik gera ez dadin
  const avail = Math.max(300, shell.clientWidth - LABW() - 2);
  const n = Math.max(rng.n, Math.ceil(avail / dayW));
  const totalW = n * dayW;
  const today = todayUTC();

  clear(inner);
  inner.appendChild(buildHead(start, n, dayW, totalW));

  const rows = h("div",{class:"g-rows", id:"rows"});
  state.tasks.forEach((t, i) => rows.appendChild(buildRow(t, i, start, n, dayW, totalW, today)));
  if (!state.tasks.length){
    rows.appendChild(h("div",{style:{padding:"38px 20px", textAlign:"center", color:"var(--ink2)"}},
      h("p",{style:{margin:"0 0 10px"}, text:"Ez dago atazarik oraindik."}),
      h("button",{class:"btn primary", onclick:()=>addTask()}, "+ Lehen ataza gehitu")));
  }
  inner.appendChild(rows);
  drawDeps(rows, start, dayW, totalW);
  renderLegend();

  qsa("#zoomseg button").forEach((b,i) => b.classList.toggle("on", Object.keys(ZOOMS)[i] === zoom));

  if (firstPaint){ firstPaint = false; setTimeout(scrollToToday, 30); }
  else { shell.scrollLeft = keepX; shell.scrollTop = keepY; }
}

function buildHead(start, n, dayW, totalW){
  const months = h("div",{class:"g-months"});
  const days = h("div",{class:"g-days", style:{width:totalW+"px"}});
  const today = todayUTC();
  let mStart = 0;
  for (let i=0; i<=n; i++){
    const cur = addDays(start, i);
    const prev = addDays(start, i-1);
    const isLast = i === n;
    if (isLast || new Date(cur).getUTCMonth() !== new Date(prev).getUTCMonth()){
      if (i > 0){
        const d = new Date(addDays(start, mStart));
        const w = (i - mStart) * dayW;
        months.appendChild(h("div",{class:"g-month", style:{width:w+"px"},
          text: w > 78 ? MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear() : (w > 34 ? MONTHS_S[d.getUTCMonth()] : "")}));
      }
      mStart = i;
    }
    if (isLast) break;
    const wd = new Date(cur).getUTCDay();
    const cls = ["g-day"];
    if (isWeekend(cur)) cls.push("we");
    if (cur === today) cls.push("today");
    if (wd === 1) cls.push("wk");
    days.appendChild(h("div",{class:cls.join(" "), style:{width:dayW+"px"},
      title: fmtDateLong(cur),
      text: dayW >= 13 ? String(new Date(cur).getUTCDate()) : ""}));
  }
  months.style.width = totalW + "px";
  return h("div",{class:"g-head"},
    h("div",{class:"g-head-label"}, "Atazak"),
    h("div",{class:"g-head-time", style:{width:totalW+"px"}}, months, days));
}

function buildRow(t, i, start, n, dayW, totalW, today){
  const s = parseYMD(t.start) ?? today;
  const x = diffDays(start, s) * dayW;
  const w = Math.max(dayW, t.days * dayW);

  const name = h("input",{class:"inline-in g-name", value:t.name, maxlength:"90",
    oninput:(e)=>{ t.name = e.target.value; dirty = true; saveSoon(); updateBarLabel(t); },
    onkeydown:(e)=>{ if(e.key==="Enter"){ e.preventDefault(); e.target.blur(); addTask(false, i+1); } }});

  const cell = h("div",{class:"g-cell"},
    h("span",{class:"g-num", text:String(i+1)}),
    h("span",{class:"g-dot", style:{background:"var(--"+t.color+")"}}),
    name,
    h("span",{class:"g-mini"},
      h("button",{title:"Gora",  onclick:()=>move(i,-1)}, "▲"),
      h("button",{title:"Behera",onclick:()=>move(i, 1)}, "▼"),
      h("button",{title:"Editatu", onclick:()=>editTask(t)}, "⋯"),
      h("button",{title:"Ezabatu", onclick:()=>delTask(t)}, "✕"))
  );

  const track = h("div",{class:"g-track", style:{width:totalW+"px"}}, gridLayer(start, n, dayW, today));

  if (t.milestone){
    const ms = h("div",{class:"g-ms", style:{left:(x + dayW/2 - 8)+"px", "--bar":"var(--"+t.color+")"},
      title:t.name+" — "+fmtDateLong(s), onpointerdown:(e)=>startDrag(e, t, "move", dayW)});
    track.appendChild(ms);
    track.appendChild(h("div",{class:"g-ms-lbl", style:{left:(x + dayW/2 + 12)+"px"}, text:t.name}));
  } else {
    const late = isLate(t);
    const bar = h("div",{class:"g-bar"+(t.progress>=100?" done":"")+(late?" late":""),
      style:{left:x+"px", width:w+"px", "--bar":"var(--"+t.color+")"},
      dataset:{id:t.id},
      title: t.name + " — " + fmtDateLong(s) + " → " + fmtDateLong(addDays(s,(t.days-1)*DAY)) + " (" + t.days + " egun, %" + t.progress + ")",
      ondblclick:()=>editTask(t),
      onpointerdown:(e)=>{ if (e.target.classList.contains("hnd")) return; startDrag(e, t, "move", dayW); }},
      h("div",{class:"fill", style:{width:t.progress+"%"}}),
      h("div",{class:"lbl", text: w > 54 ? (t.progress ? t.name+" · %"+t.progress : t.name) : ""}),
      h("div",{class:"hnd l", onpointerdown:(e)=>startDrag(e, t, "left", dayW)}),
      h("div",{class:"hnd r", onpointerdown:(e)=>startDrag(e, t, "right", dayW)})
    );
    track.appendChild(bar);
    if (w <= 54) track.appendChild(h("div",{class:"g-outside", style:{left:(x+w+7)+"px"}, text:t.name}));
  }

  const row = h("div",{class:"g-row"+(selected===t.id?" sel":""), dataset:{row:String(i)},
    onclick:()=>{ selected = t.id; qsa(".g-row").forEach(r => r.classList.toggle("sel", r.dataset.row===String(i))); }},
    cell, track);
  return row;
}

function gridLayer(start, n, dayW, today){
  const layer = h("div",{class:"g-grid"});
  for (let i=0; i<n; i++){
    const d = addDays(start, i);
    const wd = new Date(d).getUTCDay();
    if (isWeekend(d) && dayW >= 6)
      layer.appendChild(h("div",{class:"g-we", style:{left:(i*dayW)+"px", width:dayW+"px"}}));
    if (wd === 1 || dayW >= 20)
      layer.appendChild(h("div",{class:"g-vline"+(wd===1?" wk":""), style:{left:(i*dayW)+"px"}}));
    if (d === today)
      layer.appendChild(h("div",{class:"g-today", style:{left:(i*dayW)+"px"}}));
  }
  return layer;
}

function updateBarLabel(t){
  const bar = qs('.g-bar[data-id="'+t.id+'"]');
  if (bar) { const l = bar.querySelector(".lbl"); if (l && l.textContent) l.textContent = t.progress ? t.name+" · %"+t.progress : t.name; }
}

function isLate(t){
  const s = parseYMD(t.start); if (s === null) return false;
  const end = addDays(s, (t.days-1)*DAY);
  return t.progress < 100 && end < todayUTC();
}

function renderLegend(){
  const box = clear(qs("#legend"));
  const used = [...new Set(state.tasks.map(t=>t.color))];
  box.appendChild(h("span",{class:"eyebrow", text:"Oharra"}));
  box.appendChild(h("span",{html:"<i style='background:var(--s1)'></i>barra = ataza · zabalera = iraupena"}));
  box.appendChild(h("span",{html:"<i style='background:var(--s2);transform:rotate(45deg)'></i>erronbo = mugarria"}));
  box.appendChild(h("span",{html:"<i style='background:var(--danger)'></i>gorria = atzeratuta"}));
  box.appendChild(h("span",{text:"Barra arrastatu = mugitu · ertzak arrastatu = iraupena · klik bikoitza = editatu"}));
}

/* ===================== MENDEKOTASUNAK ===================== */
function drawDeps(rows, start, dayW, totalW){
  const idx = new Map(state.tasks.map((t,i) => [t.id, i]));
  const rowH = qs(".g-row")?.getBoundingClientRect().height || 36;
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("class","g-deps");
  svg.setAttribute("width", totalW);
  svg.setAttribute("height", state.tasks.length * rowH);
  svg.style.left = LABW() + "px";

  let any = false;
  state.tasks.forEach((t, i) => {
    (t.deps||[]).forEach(depId => {
      const j = idx.get(depId); if (j === undefined) return;
      const p = state.tasks[j];
      const ps = parseYMD(p.start), ts = parseYMD(t.start);
      if (ps === null || ts === null) return;
      const px = (diffDays(start, ps) + (p.milestone ? .5 : p.days)) * dayW;
      const py = j*rowH + rowH/2;
      const tx = diffDays(start, ts) * dayW + (t.milestone ? dayW/2 - 8 : 0);
      const ty = i*rowH + rowH/2;
      const bad = tx < px - 1;
      const mx = bad ? px + 10 : Math.max(px + 8, tx - 10);
      const d = "M"+px+","+py+" H"+mx+" V"+ty+" H"+tx;
      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d", d);
      if (bad) path.setAttribute("class","bad");
      svg.appendChild(path);
      const ar = document.createElementNS("http://www.w3.org/2000/svg","polygon");
      ar.setAttribute("points", (tx)+","+ty+" "+(tx-6)+","+(ty-4)+" "+(tx-6)+","+(ty+4));
      if (bad) ar.setAttribute("class","bad");
      svg.appendChild(ar);
      any = true;
    });
  });
  if (any) rows.insertBefore(svg, rows.firstChild);
}

/* ===================== ARRASTATZEA ===================== */
function startDrag(e, t, mode, dayW){
  if (e.button !== 0) return;
  e.preventDefault(); e.stopPropagation();
  const el = e.currentTarget.closest(".g-bar") || e.currentTarget;
  const x0 = e.clientX;
  const s0 = parseYMD(t.start) ?? todayUTC();
  const d0 = t.days;
  const left0 = parseFloat(el.style.left);
  const w0 = mode === "move" ? 0 : el.offsetWidth;
  dragging = true;
  el.setPointerCapture?.(e.pointerId);

  const ghost = h("div",{class:"g-drag-ghost"});
  document.body.appendChild(ghost);

  const onMove = (ev) => {
    const dd = Math.round((ev.clientX - x0) / dayW);
    let ns = s0, nd = d0;
    if (mode === "move") ns = addDays(s0, dd);
    else if (mode === "right") nd = Math.max(1, d0 + dd);
    else { const k = Math.min(dd, d0 - 1); ns = addDays(s0, k); nd = d0 - k; }

    if (mode === "move") el.style.left = (left0 + dd*dayW) + "px";
    else if (mode === "right") el.style.width = Math.max(dayW, w0 + dd*dayW) + "px";
    else { const k = Math.min(dd, d0-1); el.style.left = (left0 + k*dayW)+"px"; el.style.width = ((d0-k)*dayW)+"px"; }

    ghost.textContent = t.milestone
      ? fmtDate(ns)
      : fmtDate(ns) + " → " + fmtDate(addDays(ns,(nd-1)*DAY)) + "  ·  " + nd + " egun";
    ghost.style.left = (ev.clientX + 14) + "px";
    ghost.style.top  = (ev.clientY - 26) + "px";
    onMove.res = { ns, nd };
  };
  const onUp = () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    ghost.remove();
    dragging = false;
    const r = onMove.res;
    if (r && (ymd(r.ns) !== t.start || r.nd !== t.days)){
      t.start = ymd(r.ns); t.days = r.nd;
      change();
    } else render();
  };
  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onUp);
}

/* ===================== ATAZEN ERAGIKETAK ===================== */
function addTask(milestone=false, at=null){
  const last = state.tasks[state.tasks.length-1];
  const start = last ? ymd(addDays(parseYMD(last.start) ?? todayUTC(), last.milestone ? 1 : last.days)) : ymd(todayUTC());
  const t = {
    id: uid("t"), name: milestone ? "Mugarria" : "Ataza berria",
    start, days: milestone ? 1 : 3, progress: 0,
    color: COLORS[state.tasks.length % COLORS.length], assignee: "", milestone, deps: [], notes: ""
  };
  if (at === null) state.tasks.push(t); else state.tasks.splice(at, 0, t);
  selected = t.id;
  change();
  setTimeout(() => {
    const i = state.tasks.indexOf(t);
    const inp = qsa(".g-row")[i]?.querySelector(".g-name");
    if (inp){ inp.focus(); inp.select(); }
  }, 40);
}

function move(i, dir){
  const j = i + dir;
  if (j < 0 || j >= state.tasks.length) return;
  const [t] = state.tasks.splice(i,1);
  state.tasks.splice(j,0,t);
  change();
}

async function delTask(t){
  if (!(await confirmBox("Ataza ezabatu?", "\""+t.name+"\" ezabatuko da.", "Ezabatu"))) return;
  state.tasks = state.tasks.filter(x => x.id !== t.id);
  state.tasks.forEach(x => x.deps = (x.deps||[]).filter(d => d !== t.id));
  change();
}

function editTask(t){
  const name = h("input",{type:"text", value:t.name, required:true, maxlength:"90"});
  const start = h("input",{type:"date", value:t.start});
  const days = h("input",{type:"number", min:"1", max:"400", value:t.days, disabled: t.milestone});
  const end = h("input",{type:"date", value: ymd(addDays(parseYMD(t.start) ?? todayUTC(), (t.days-1)*DAY)), disabled: t.milestone});
  const prog = h("input",{type:"range", min:"0", max:"100", step:"5", value:t.progress});
  const progOut = h("span",{class:"mono", style:{minWidth:"46px", display:"inline-block"}, text:"%"+t.progress});
  const who = h("input",{type:"text", value:t.assignee, maxlength:"40", placeholder:"Nor arduratzen da?"});
  const ms = h("input",{type:"checkbox", checked:t.milestone});
  const notes = h("textarea",{maxlength:"500", placeholder:"Oharrak (aukerakoa)"}, t.notes||"");

  const sync = (src) => {
    const s = parseYMD(start.value); if (s === null) return;
    if (src === "end"){
      const e2 = parseYMD(end.value);
      if (e2 !== null) days.value = Math.max(1, diffDays(s, e2) + 1);
    } else {
      end.value = ymd(addDays(s, (Math.max(1, +days.value||1) - 1)*DAY));
    }
  };
  start.oninput = () => sync("start");
  days.oninput  = () => sync("start");
  end.oninput   = () => sync("end");
  prog.oninput  = () => progOut.textContent = "%"+prog.value;
  ms.onchange   = () => { days.disabled = end.disabled = ms.checked; };

  const swatches = h("div",{class:"swatches"}, COLORS.map(c =>
    h("button",{type:"button", class: t.color===c?"on":"", style:{background:"var(--"+c+")"},
      onclick:(e)=>{ t.color = c; qsa(".swatches button").forEach(b=>b.classList.remove("on")); e.currentTarget.classList.add("on"); }})));

  const others = state.tasks.filter(x => x.id !== t.id);
  const depBox = h("div",{class:"dep-list"}, others.length
    ? others.map(x => h("label",{}, h("input",{type:"checkbox", value:x.id, checked:(t.deps||[]).includes(x.id)}), x.name))
    : [h("span",{class:"muted", style:{fontSize:"13px"}, text:"Ez dago beste atazarik."})]);

  modal({
    title: "Ataza editatu", wide:true,
    body: [
      field("Izena", name),
      h("div",{class:"grid", style:{gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px"}},
        field("Hasiera", start), field("Iraupena (egunak)", days), field("Amaiera", end)),
      field("Arduraduna", who),
      h("label",{class:"field"}, "Aurrerapena",
        h("div",{class:"row"}, prog, progOut)),
      h("label",{class:"field"}, "Kolorea", swatches),
      h("label",{class:"row", style:{gap:"8px", fontSize:"13.5px"}}, ms, "Mugarria da (data bakarra, iraupenik gabe)"),
      h("label",{class:"field"}, "Honen ondoren (mendekotasunak)", depBox),
      field("Oharrak", notes)
    ],
    onOk: () => {
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      if (parseYMD(start.value) === null) throw new Error("Hasiera-data ez da zuzena.");
      t.name = name.value.trim();
      t.start = start.value;
      t.milestone = ms.checked;
      t.days = t.milestone ? 1 : Math.max(1, parseInt(days.value)||1);
      t.progress = parseInt(prog.value)||0;
      t.assignee = who.value.trim();
      t.notes = notes.value.trim();
      t.deps = Array.from(depBox.querySelectorAll("input:checked")).map(i => i.value);
      change();
      toast("Eguneratuta","ok");
    }
  });
}

let rsz;
window.addEventListener("resize", () => { clearTimeout(rsz); rsz = setTimeout(render, 180); });

/* ===================== TRESNAK ===================== */
function scrollToToday(){
  const shell = qs("#shell"); if (!shell) return;
  const { start } = range();
  const x = diffDays(start, todayUTC()) * ZOOMS[zoom].w;
  shell.scrollTo({ left: Math.max(0, x - shell.clientWidth/3), behavior:"smooth" });
}

function exportCSV(){
  const rows = [["#","Ataza","Hasiera","Amaiera","Egunak","Aurrerapena","Arduraduna","Mota","Oharrak"]];
  state.tasks.forEach((t,i) => {
    const s = parseYMD(t.start) ?? todayUTC();
    rows.push([ i+1, t.name, t.start, ymd(addDays(s,(t.days-1)*DAY)), t.milestone?"":t.days,
      t.progress+"%", t.assignee, t.milestone?"mugarria":"ataza", (t.notes||"").replace(/\n/g," ") ]);
  });
  const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(";")).join("\r\n");
  download(slug(PROJ.name)+"-gantt.csv", "﻿"+csv, "text/csv;charset=utf-8");
}
const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "proiektua";
