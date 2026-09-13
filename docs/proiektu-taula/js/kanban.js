/* ============================================================
   KANBAN TAULA
   - Zutabeak konfiguragarriak (izena, kolorea, WIP muga)
   - Txartelak arrastatuz mugitzen dira (edo ←/→ botoiekin mugikorrean)
   - Denbora errealean sinkronizatzen da taldekideen artean
   ============================================================ */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import {
  h, qs, qsa, clear, toast, modal, field, confirmBox, uid, debounce, download, param,
  parseYMD, ymd, todayUTC, fmtDate, fmtDateLong, addDays, diffDays, DAY
} from "./ui.js";
import * as S from "./store.js";
import { getDoc } from "./firebase.js";

const app = qs("#app");
const PID = param("p");
const COLORS = ["s1","s2","s3","s4","s5","s6"];
const PRIOS = { baxua:{label:"Baxua", color:"var(--ink3)"}, ertaina:{label:"Ertaina", color:"var(--s1)"}, altua:{label:"Altua", color:"var(--danger)"} };

let USER = null, PROJ = null;
let state = { columns: [], cards: [] };
let dirty = false, dragId = null;
let filterWho = "", filterText = "";

/* ===================== ABIARAZTEA ===================== */
(async () => {
  USER = await requireAuth();
  if (!PID){ location.replace("index.html"); return; }
  renderHeader(USER, "index.html");
  try { PROJ = await S.getProject(PID); }
  catch(e){
    app.className = "";
    clear(app).appendChild(h("div",{class:"wrap"},
      h("div",{class:"notice err", style:{marginTop:"30px"}, text:errMessage(e)}),
      h("p",{}, h("a",{href:"index.html"}, "← Proiektuetara itzuli"))));
    return;
  }
  buildShell();
  S.watchData(PID, "kanban", (data, pending) => {
    if (!data){ state = { columns: S.defaultColumns(), cards: [] }; render(); return; }
    if (pending || dirty || dragId) return;
    state = normalize(data);
    render();
  }, err => toast(errMessage(err), "err"));
})();

function normalize(d){
  const columns = (d.columns && d.columns.length ? d.columns : S.defaultColumns()).map(c => ({
    id: c.id || uid("c"), name: c.name || "Zutabea",
    color: COLORS.includes(c.color) ? c.color : "s1",
    wip: parseInt(c.wip) || 0
  }));
  const ids = new Set(columns.map(c => c.id));
  const cards = (d.cards || []).map(c => ({
    id: c.id || uid("k"),
    colId: ids.has(c.colId) ? c.colId : columns[0].id,
    title: c.title || "(izenik gabe)",
    desc: c.desc || "",
    assignee: c.assignee || "",
    due: c.due || "",
    priority: PRIOS[c.priority] ? c.priority : "ertaina",
    createdAt: c.createdAt || Date.now()
  }));
  return { columns, cards };
}

/* ===================== GORDETZEA ===================== */
const setSaveState = (cls, txt) => { const e = qs("#savestate"); if (e){ e.className = "save-state "+cls; e.textContent = txt; } };
const flush = async () => {
  try{
    setSaveState("saving","gordetzen…");
    await S.saveData(PID, "kanban", { columns: state.columns, cards: state.cards }, USER);
    dirty = false; setSaveState("saved","gordeta ✓");
  } catch(e){ setSaveState("err","ez da gorde!"); toast(errMessage(e),"err"); }
};
const saveSoon = debounce(flush, 600);
function change(){ dirty = true; setSaveState("saving","aldaketak…"); saveSoon(); render(); }

/* ===================== EGITURA ===================== */
function buildShell(){
  app.className = "";
  clear(app);
  app.appendChild(h("div",{class:"wrap-wide", style:{paddingBottom:"10px"}},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"KANBAN"}),
      h("span",{class:"tb-name", text:PROJ.name}),
      PROJ.teamId ? h("span",{class:"tag team", text:"taldea "+PROJ.teamId}) : h("span",{class:"tag solo", text:"bakarka"}),
      h("span",{class:"spacer"}),
      h("span",{class:"save-state", id:"savestate"}),
      h("a",{class:"btn sm", href:"gantt.html?p="+PID}, "← Gantt"),
      h("a",{class:"btn sm", href:"index.html"}, "Proiektuak")
    ),
    h("div",{class:"row no-print", style:{marginTop:"12px"}},
      h("input",{type:"search", placeholder:"Bilatu txartelak…", style:{maxWidth:"220px"},
        oninput:(e)=>{ filterText = e.target.value.toLowerCase(); render(); }}),
      h("select",{id:"whofilter", style:{maxWidth:"190px"}, onchange:(e)=>{ filterWho = e.target.value; render(); }}),
      h("span",{class:"spacer"}),
      h("button",{class:"btn sm", onclick:importFromGantt}, "Gantt-etik inportatu"),
      h("button",{class:"btn sm", onclick:exportCSV}, "CSV"),
      h("button",{class:"btn sm", onclick:()=>window.print()}, "Inprimatu")
    ),
    h("div",{class:"k-stats", id:"stats", style:{marginTop:"10px"}}),
    h("div",{class:"k-board", id:"board"})
  ));
}

/* ===================== MARRAZKETA ===================== */
function visible(c){
  if (filterWho && c.assignee !== filterWho) return false;
  if (filterText && !(c.title+" "+c.desc+" "+c.assignee).toLowerCase().includes(filterText)) return false;
  return true;
}

function render(){
  const board = qs("#board"); if (!board) return;
  const sx = board.scrollLeft;
  clear(board);

  state.columns.forEach((col, ci) => board.appendChild(buildColumn(col, ci)));
  board.appendChild(h("button",{class:"k-addcol", onclick:addColumn}, "+ Zutabe berria"));
  board.scrollLeft = sx;

  renderStats();
  renderWhoFilter();
}

function buildColumn(col, ci){
  const cards = state.cards.filter(c => c.colId === col.id);
  const shown = cards.filter(visible);
  const over = col.wip > 0 && cards.length > col.wip;

  const body = h("div",{class:"k-col-body", dataset:{col:col.id}});
  if (!shown.length) body.appendChild(h("div",{class:"k-empty", text: cards.length ? "(iragazkiak ezkutatuta)" : "Hutsik"}));
  shown.forEach(c => body.appendChild(buildCard(c, ci)));

  const el = h("section",{class:"k-col", style:{"--col":"var(--"+col.color+")"}, dataset:{col:col.id}},
    h("header",{class:"k-col-head"},
      h("h3",{text:col.name}),
      h("span",{class:"k-count"+(over?" over":""), text: col.wip ? cards.length+"/"+col.wip : String(cards.length)}),
      h("button",{class:"btn icon ghost sm", title:"Zutabearen aukerak", onclick:()=>columnMenu(col, ci)}, "⋯")),
    body,
    h("div",{class:"k-col-foot"}, h("button",{onclick:()=>editCard(null, col.id)}, "+ Txartela gehitu"))
  );

  body.addEventListener("dragover", (e) => {
    if (!dragId) return;
    e.preventDefault();
    el.classList.add("over");
    showPlaceholder(body, e.clientY);
  });
  body.addEventListener("dragleave", (e) => {
    if (!body.contains(e.relatedTarget)) { el.classList.remove("over"); qs(".k-ph")?.remove(); }
  });
  body.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("over");
    dropCard(col.id, body);
  });
  return el;
}

function buildCard(c, ci){
  const due = parseYMD(c.due);
  const today = todayUTC();
  const isDoneCol = ci === state.columns.length - 1;
  let dueCls = "";
  if (due !== null && !isDoneCol){
    if (due < today) dueCls = "late";
    else if (diffDays(today, due) <= 2) dueCls = "soon";
  }
  const el = h("article",{class:"k-card", draggable:"true", dataset:{id:c.id},
      style:{"--pri": PRIOS[c.priority].color},
      onclick:(e)=>{ if (!e.target.closest(".k-move")) editCard(c); }},
    h("div",{class:"k-move no-print"},
      ci > 0 ? h("button",{title:"Ezkerrera", onclick:(e)=>{ e.stopPropagation(); moveCard(c, -1); }}, "‹") : null,
      ci < state.columns.length-1 ? h("button",{title:"Eskuinera", onclick:(e)=>{ e.stopPropagation(); moveCard(c, 1); }}, "›") : null),
    h("h4",{text:c.title}),
    c.desc ? h("p",{class:"k-desc", text:c.desc}) : null,
    h("div",{class:"k-meta"},
      c.assignee ? h("span",{class:"k-who", text:c.assignee}) : null,
      due !== null ? h("span",{class:"k-due "+dueCls, title:fmtDateLong(due), text:"⏱ "+fmtDate(due)}) : null,
      c.priority === "altua" ? h("span",{class:"k-who", style:{color:"var(--danger)", borderColor:"var(--danger)"}, text:"altua"}) : null)
  );
  el.addEventListener("dragstart", (e) => {
    dragId = c.id; el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", c.id);
  });
  el.addEventListener("dragend", () => {
    dragId = null; el.classList.remove("dragging"); qs(".k-ph")?.remove();
    qsa(".k-col").forEach(x => x.classList.remove("over"));
  });
  return el;
}

function showPlaceholder(body, y){
  qs(".k-ph")?.remove();
  const ph = h("div",{class:"k-ph"});
  const cards = qsa(".k-card:not(.dragging)", body);
  const after = cards.find(el => y < el.getBoundingClientRect().top + el.offsetHeight/2);
  if (after) body.insertBefore(ph, after); else body.appendChild(ph);
}

function dropCard(colId, body){
  const id = dragId; dragId = null;
  const ph = qs(".k-ph");
  if (!id){ ph?.remove(); return; }
  const card = state.cards.find(c => c.id === id);
  if (!card){ ph?.remove(); return; }

  // zein txartelen aurrean utzi den kalkulatu
  let beforeId = null;
  if (ph){
    let n = ph.nextElementSibling;
    while (n && !n.classList.contains("k-card")) n = n.nextElementSibling;
    beforeId = n ? n.dataset.id : null;
    ph.remove();
  }
  state.cards = state.cards.filter(c => c.id !== id);
  card.colId = colId;
  const at = beforeId ? state.cards.findIndex(c => c.id === beforeId) : -1;
  if (at >= 0) state.cards.splice(at, 0, card); else state.cards.push(card);
  change();
}

function moveCard(c, dir){
  const i = state.columns.findIndex(x => x.id === c.colId);
  const j = i + dir;
  if (j < 0 || j >= state.columns.length) return;
  c.colId = state.columns[j].id;
  change();
}

function renderStats(){
  const box = clear(qs("#stats"));
  const total = state.cards.length;
  const last = state.columns[state.columns.length-1];
  const done = last ? state.cards.filter(c => c.colId === last.id).length : 0;
  const late = state.cards.filter(c => { const d = parseYMD(c.due); return d !== null && d < todayUTC() && c.colId !== last?.id; }).length;
  const pct = total ? Math.round(done/total*100) : 0;
  box.appendChild(h("span",{html:"Txartelak: <b>"+total+"</b>"}));
  box.appendChild(h("span",{html:"Bukatuta: <b>"+done+"</b> (%"+pct+")"}));
  if (late) box.appendChild(h("span",{style:{color:"var(--danger)"}, html:"Epez kanpo: <b>"+late+"</b>"}));
  box.appendChild(h("span",{html:"Zutabeak: <b>"+state.columns.length+"</b>"}));
}

function renderWhoFilter(){
  const sel = qs("#whofilter"); if (!sel) return;
  const who = [...new Set(state.cards.map(c => c.assignee).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"eu"));
  const cur = filterWho;
  clear(sel);
  sel.appendChild(h("option",{value:""}, "Arduradun guztiak"));
  who.forEach(w => sel.appendChild(h("option",{value:w}, w)));
  sel.value = who.includes(cur) ? cur : "";
  if (sel.value !== cur) filterWho = sel.value;
}

/* ===================== TXARTELAK ===================== */
function editCard(card, colId){
  const isNew = !card;
  const c = card || { id: uid("k"), colId, title:"", desc:"", assignee:"", due:"", priority:"ertaina", createdAt: Date.now() };

  const title = h("input",{type:"text", value:c.title, required:true, maxlength:"120", placeholder:"Zer egin behar da?"});
  const desc  = h("textarea",{maxlength:"1000", placeholder:"Xehetasunak (aukerakoa)"}, c.desc||"");
  const who   = h("input",{type:"text", value:c.assignee, maxlength:"40", list:"whos", placeholder:"Nor arduratzen da?"});
  const datalist = h("datalist",{id:"whos"}, [...new Set(state.cards.map(x=>x.assignee).filter(Boolean))].map(w => h("option",{value:w})));
  const due   = h("input",{type:"date", value:c.due||""});
  const col   = h("select",{}, state.columns.map(x => h("option",{value:x.id, selected: x.id===c.colId}, x.name)));
  let prio = c.priority;
  const prioBox = h("div",{class:"pri-pick"}, Object.entries(PRIOS).map(([k,v]) =>
    h("button",{type:"button", class: prio===k?"on":"", onclick:(e)=>{
      prio = k; qsa(".pri-pick button").forEach(b=>b.classList.remove("on")); e.currentTarget.classList.add("on");
    }}, v.label)));

  const del = isNew ? null : h("button",{class:"btn danger", type:"button", onclick: async ()=>{
    if (await confirmBox("Txartela ezabatu?", "\""+c.title+"\" ezabatuko da.", "Ezabatu")){
      state.cards = state.cards.filter(x => x.id !== c.id);
      change(); document.querySelector(".modal-back")?.remove(); toast("Ezabatuta","ok");
    }
  }}, "Ezabatu txartela");

  modal({
    title: isNew ? "Txartel berria" : "Txartela editatu",
    body: [
      field("Izenburua", title),
      field("Deskribapena", desc),
      h("div",{class:"grid", style:{gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"12px"}},
        field("Arduraduna", h("span",{}, who, datalist)),
        field("Epemuga", due),
        field("Zutabea", col)),
      h("label",{class:"field"}, "Lehentasuna", prioBox),
      del ? h("div",{style:{borderTop:"1px solid var(--rule)", paddingTop:"12px"}}, del) : null
    ].filter(Boolean),
    onOk: () => {
      if (!title.value.trim()) throw new Error("Izenburua beharrezkoa da.");
      Object.assign(c, {
        title: title.value.trim(), desc: desc.value.trim(), assignee: who.value.trim(),
        due: due.value || "", priority: prio, colId: col.value
      });
      if (isNew) state.cards.push(c);
      change();
    }
  });
}

/* ===================== ZUTABEAK ===================== */
function addColumn(){
  const name = h("input",{type:"text", required:true, maxlength:"40", placeholder:"Adib.: Probatzen"});
  modal({ title:"Zutabe berria", okText:"Gehitu", body:[field("Izena", name)], onOk: ()=>{
    if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
    state.columns.push({ id: uid("c"), name: name.value.trim(), color: COLORS[state.columns.length % COLORS.length], wip: 0 });
    change();
  }});
}

function columnMenu(col, ci){
  const name = h("input",{type:"text", value:col.name, required:true, maxlength:"40"});
  const wip  = h("input",{type:"number", min:"0", max:"99", value:col.wip||0});
  const sw   = h("div",{class:"swatches"}, COLORS.map(c =>
    h("button",{type:"button", class: col.color===c?"on":"", style:{background:"var(--"+c+")", width:"28px", height:"28px", border:"2px solid var(--rule)", cursor:"pointer"},
      onclick:(e)=>{ col.color = c; e.currentTarget.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("on")); e.currentTarget.classList.add("on"); }})));

  const nav = h("div",{class:"row"},
    h("button",{class:"btn sm", type:"button", disabled: ci===0, onclick:()=>{ swapCol(ci,-1); document.querySelector(".modal-back")?.remove(); }}, "← Ezkerrera"),
    h("button",{class:"btn sm", type:"button", disabled: ci===state.columns.length-1, onclick:()=>{ swapCol(ci,1); document.querySelector(".modal-back")?.remove(); }}, "Eskuinera →"));

  const del = h("button",{class:"btn danger", type:"button", onclick: async ()=>{
    const n = state.cards.filter(c => c.colId === col.id).length;
    if (state.columns.length <= 1){ toast("Gutxienez zutabe bat behar da.","err"); return; }
    if (await confirmBox("Zutabea ezabatu?", n ? "\""+col.name+"\" zutabeko "+n+" txartel lehen zutabera eramango dira." : "\""+col.name+"\" ezabatuko da.", "Ezabatu")){
      const first = state.columns.find(x => x.id !== col.id);
      state.cards.forEach(c => { if (c.colId === col.id) c.colId = first.id; });
      state.columns = state.columns.filter(x => x.id !== col.id);
      change(); document.querySelector(".modal-back")?.remove();
    }
  }}, "Zutabea ezabatu");

  modal({ title:"Zutabea: "+col.name, body:[
      field("Izena", name),
      h("label",{class:"field"}, "Kolorea", sw),
      field("WIP muga (0 = mugarik ez)", wip),
      h("p",{class:"muted", style:{fontSize:"12.5px", margin:0}, text:"WIP muga: zutabe honetan aldi berean egon daitezkeen txartel kopuru gomendatua. Gainditzean gorriz agertuko da."}),
      h("div",{style:{borderTop:"1px solid var(--rule)", paddingTop:"12px"}}, nav),
      h("div",{}, del)
    ],
    onOk: ()=>{
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      col.name = name.value.trim();
      col.wip = Math.max(0, parseInt(wip.value)||0);
      change();
    }
  });
}

function swapCol(i, dir){
  const j = i + dir;
  if (j < 0 || j >= state.columns.length) return;
  const [c] = state.columns.splice(i,1);
  state.columns.splice(j,0,c);
  change();
}

/* ===================== TRESNAK ===================== */
async function importFromGantt(){
  let tasks = [];
  try{
    const snap = await getDoc(S.dataRef(PID, "gantt"));
    tasks = snap.exists() ? (snap.data().tasks || []) : [];
  } catch(e){ toast(errMessage(e), "err"); return; }

  if (!tasks.length){ toast("Gantt diagraman ez dago atazarik.", "err"); return; }
  const existing = new Set(state.cards.map(c => c.title));
  const news = tasks.filter(t => !existing.has(t.name));
  if (!news.length){ toast("Ataza guztiak jada txartel bihurtuta daude.", ""); return; }

  const list = h("div",{class:"dep-list", style:{maxHeight:"220px"}},
    news.map(t => h("label",{}, h("input",{type:"checkbox", value:t.id, checked:true}), t.name)));
  const col = h("select",{}, state.columns.map(x => h("option",{value:x.id}, x.name)));

  modal({ title:"Gantt atazak txartel bihurtu", okText:"Sortu txartelak", body:[
      h("p",{class:"muted", style:{fontSize:"13px", margin:0}, text:"Aukeratu zein ataza bihurtu nahi dituzun Kanban txartel."}),
      list, field("Zein zutabetan", col)
    ],
    onOk: ()=>{
      const chosen = Array.from(list.querySelectorAll("input:checked")).map(i => i.value);
      const add = news.filter(t => chosen.includes(t.id));
      add.forEach(t => state.cards.push({
        id: uid("k"), colId: col.value, title: t.name, desc: t.notes || "",
        assignee: t.assignee || "", due: t.days ? ymd(parseYMD(t.start) + (t.days-1)*DAY) : (t.start||""),
        priority: "ertaina", createdAt: Date.now()
      }));
      change();
      toast(add.length + " txartel sortuta", "ok");
    }
  });
}

function exportCSV(){
  const rows = [["Zutabea","Izenburua","Arduraduna","Epemuga","Lehentasuna","Deskribapena"]];
  state.columns.forEach(col => state.cards.filter(c => c.colId===col.id).forEach(c =>
    rows.push([col.name, c.title, c.assignee, c.due, PRIOS[c.priority].label, (c.desc||"").replace(/\n/g," ")])));
  const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(";")).join("\r\n");
  download(slug(PROJ.name)+"-kanban.csv", "﻿"+csv, "text/csv;charset=utf-8");
}
const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "proiektua";
