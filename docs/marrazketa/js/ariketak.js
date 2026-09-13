/* Ariketen orria: mailen mapa, teoria eta ariketen zerrenda. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear } from "./ui.js";
import * as S from "./store.js";
import { isoSVG, sheetSVG } from "./geo/svg.js";
import { buildSolid, toCellMap } from "./geo/solid.js";
import { LEVELS, TYPES, levelByN, levelExercises, levelProgress, parseCellString } from "./levels.js";

const app = qs("#app");
let USER, PROGRESS = {}, TEACHER = [];

(async () => {
  USER = await requireAuth();
  renderHeader(USER, "ariketak.html");
  [PROGRESS, TEACHER] = await Promise.all([
    S.getProgress(USER),
    S.listTeacherExercises().catch(e => { console.warn(errMessage(e)); return []; })
  ]);
  app.className = "";
  render();
  window.addEventListener("hashchange", renderDetail);
})();

function render(){
  const total = LEVELS.reduce((s, L) => s + levelProgress(L.n, PROGRESS).total, 0);
  const done = LEVELS.reduce((s, L) => s + levelProgress(L.n, PROGRESS).done, 0);
  clear(app).appendChild(h("div",{class:"wrap", style:{paddingBottom:"40px"}},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"ARIKETAK"}),
      h("span",{class:"tb-name", text:"Hasiberritik adituraino"}),
      h("span",{class:"spacer"}),
      h("span",{class:"tb-meta", text: done + " / " + total + " eginda"})),
    h("div",{class:"notice", style:{marginTop:"12px"}, html:
      "Maila bakoitzak <b>teoria laburra</b> eta ariketa <b>autozuzenduak</b> ditu. Ariketa bat %100ean egiten duzunean «eginda» geratzen da; nahi adina aldiz errepika dezakezu. " +
      "Ariketak ikasle guztientzat <b>berdinak</b> dira: gelan elkarrekin komentatu ditzakezue."}),
    h("div",{class:"levels"}, LEVELS.map(levelCard)),
    h("div",{id:"detail", style:{marginTop:"22px"}}),
    teacherSection()));
  renderDetail();
}

function levelCard(L){
  const p = levelProgress(L.n, PROGRESS);
  const sample = isoSVG(parseCellString(L.sample), { pad: 0.2 });
  return h("article",{class:"level", id:"card-"+L.n},
    h("div",{class:"level-top"},
      h("div",{class:"level-num", text:String(L.n)}),
      h("div",{},
        h("div",{class:"eyebrow", text:L.code}),
        h("h3",{text:L.title}),
        h("ul",{}, L.goals.map(g => h("li",{text:g}))))),
    h("div",{class:"level-sample"}, sample),
    h("div",{class:"level-foot"},
      h("div",{class:"row", style:{fontSize:"12px"}},
        h("span",{class:"mono dim", text: p.done + " / " + p.total + " eginda"}), h("span",{class:"spacer"}),
        h("a",{class:"btn sm" + (p.pct < 100 ? " primary" : ""), href:"#maila-"+L.n}, p.done ? "Jarraitu" : "Hasi")),
      h("div",{class:"pbar"+(p.pct>=100?" done":"")}, h("i",{style:{width:p.pct+"%"}}))));
}

function renderDetail(){
  const box = qs("#detail");
  if (!box) return;
  const m = /^#maila-(\d)$/.exec(location.hash);
  if (!m){ clear(box); return; }
  const L = levelByN(m[1]);
  if (!L){ clear(box); return; }
  const cells = parseCellString(L.sample);
  const sheet = sheetSVG(buildSolid(cells), { hidden: L.hidden, labels: true }).svg;
  const byType = new Map();
  for (const ex of levelExercises(L.n)){
    if (!byType.has(ex.type)) byType.set(ex.type, []);
    byType.get(ex.type).push(ex);
  }
  clear(box).appendChild(h("section",{class:"card", id:"maila-"+L.n},
    h("div",{class:"row"},
      h("div",{class:"level-num", text:String(L.n), style:{width:"38px", height:"38px", fontSize:"20px"}}),
      h("div",{}, h("div",{class:"eyebrow", text:L.code}), h("h2",{style:{fontSize:"20px"}, text:L.title})),
      h("span",{class:"spacer"}),
      h("a",{class:"btn sm", href:"#"}, "Itxi")),
    h("div",{class:"eyebrow", style:{margin:"18px 0 8px"}, text:"Ikasi"}),
    h("div",{class:"theory"}, L.theory.map(t => h("article",{}, h("h4",{text:t.h}), h("p",{html:t.p})))),
    h("div",{class:"grid", style:{gridTemplateColumns:"minmax(0,1fr) minmax(0,1.4fr)", marginTop:"16px", alignItems:"center"}},
      h("div",{style:{padding:"8px 20px"}}, isoSVG(cells, { pad: 0.3 })),
      h("div",{}, sheet)),
    h("div",{class:"eyebrow", style:{margin:"18px 0 8px"}, text:"Ariketak"}),
    Array.from(byType.entries()).map(([type, list]) => h("div",{style:{marginBottom:"12px"}},
      h("div",{style:{fontSize:"13.5px", marginBottom:"6px"}}, h("b",{text:TYPES[type].title}), h("span",{class:"muted", text:" — " + TYPES[type].desc})),
      h("div",{class:"ex-list"}, list.map(ex => exItem(ex.key, TYPES[type].short + " " + ex.i)))))));
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exItem(key, label){
  const p = PROGRESS[key];
  return h("a",{class:"ex-item" + (p?.done ? " done" : p ? " tried" : ""), href:"ariketa.html?k="+encodeURIComponent(key)},
    h("span",{class:"st", text: p?.done ? "✓" : p ? String(p.best||0) : ""}),
    h("span",{text:label}));
}

function teacherSection(){
  if (!TEACHER.length) return null;
  return h("section",{style:{marginTop:"26px"}},
    h("div",{class:"eyebrow", style:{marginBottom:"8px"}, text:"Irakaslearen ariketak"}),
    h("div",{class:"grid grid-2"}, TEACHER.map(p => {
      const L = levelByN(p.exercise?.level) || LEVELS[2];
      const cells = toCellMap(p.cells);
      return h("article",{class:"card", style:{display:"flex", gap:"14px", alignItems:"center"}},
        h("div",{style:{width:"110px", flex:"0 0 auto"}}, cells.size ? isoSVG(cells, { pad: 0.2 }) : null),
        h("div",{style:{flex:"1 1 auto"}},
          h("div",{class:"eyebrow", text:L.code}),
          h("h3",{text:p.name}),
          p.description ? h("p",{class:"muted", style:{fontSize:"13px", margin:"2px 0 6px"}, text:p.description}) : null,
          h("div",{class:"ex-list", style:{gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))"}},
            (p.exercise?.types || []).map(t => exItem("P-" + p.id + "-" + t, TYPES[t]?.short || t)))));
    })));
}
