/* Hasierako orria (bertsio irekia): proiektuen zerrenda, saio-hasierarik gabe. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear, toast, modal, field, confirmBox, fmtWhen, download } from "./ui.js";
import * as S from "./store.js";

const app = qs("#app");
const slug = (s) => (String(s || "proiektua").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "proiektua");

(async () => {
  const user = await requireAuth();
  renderHeader(user, "index.html");
  app.className = "";
  const fileIn = h("input",{type:"file", accept:".json,application/json", hidden:true, onchange:(e)=>importFile(user, e)});
  clear(app).appendChild(h("div",{class:"wrap"},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"PROIEKTUAK"}),
      h("span",{class:"tb-name", text:"Gantt diagramak eta Kanban taulak"}),
      h("span",{class:"spacer"}),
      h("span",{class:"tb-meta", id:"pcount", text:"—"}),
      h("button",{class:"btn", onclick:()=>fileIn.click()}, "Inportatu"),
      h("button",{class:"btn primary", onclick:()=>newProjectDialog(user)}, "+ Proiektu berria")),
    h("div",{class:"notice", style:{marginTop:"12px"}, html:
      "Proiektuak <b>nabigatzaile honetan</b> gordetzen dira: ez dira Internetera bidaltzen. " +
      "Beste ordenagailu batean jarraitzeko edo irakasleari bidaltzeko, erabili <b>⋯ → Esportatu</b> eta gero <b>Inportatu</b>. " +
      "Nabigatzailearen datuak ezabatzen badituzu, proiektuak ere ezabatuko dira."}),
    fileIn,
    h("div",{id:"list", style:{marginTop:"14px", marginBottom:"40px"}},
      h("div",{class:"loading", style:{minHeight:"180px"}}, h("div",{class:"spin"})))));
  S.watchMyProjects(user, [], list => renderProjects(user, list));
})();

function renderProjects(user, list){
  const box = clear(qs("#list"));
  qs("#pcount").textContent = list.length + " proiektu";
  if (!list.length){
    box.appendChild(h("div",{class:"empty"},
      h("h3",{text:"Oraindik ez duzu proiekturik"}),
      h("p",{text:"Sortu lehen proiektua Gantt diagrama eta Kanban taula batekin hasteko."}),
      h("div",{class:"row", style:{justifyContent:"center", marginTop:"12px"}},
        h("button",{class:"btn primary", onclick:()=>newProjectDialog(user)}, "+ Proiektu berria"),
        h("a",{class:"btn", href:"ikasgaiak/gantt-diagrama.html"}, "Zer da Gantt diagrama?"))));
    return;
  }
  box.appendChild(h("div",{class:"grid grid-3"}, list.map(p => projectCard(user, p))));
}

function projectCard(user, p){
  return h("article",{class:"proj"},
    h("div",{class:"proj-top"},
      h("div",{class:"row", style:{gap:"6px", marginBottom:"7px"}},
        h("span",{class:"spacer"}),
        h("button",{class:"btn icon ghost sm", title:"Aukerak", onclick:(e)=>projectMenu(e, user, p)}, "⋯")),
      h("h3",{text:p.name}),
      p.description ? h("p",{class:"proj-desc", text:p.description}) : null,
      h("p",{class:"mono", style:{fontSize:"11px", color:"var(--ink3)", margin:"8px 0 0"}, text: "aldatuta: " + fmtWhen(p.updatedAt)})),
    h("div",{class:"proj-foot"},
      h("a",{href:"gantt.html?p="+p.id}, "Gantt"),
      h("a",{href:"kanban.html?p="+p.id}, "Kanban")));
}

function exportProject(p){
  try {
    download(slug(p.name) + ".proiektua.json", JSON.stringify(S.exportProject(p.id), null, 2), "application/json");
    toast("Esportatuta: gorde fitxategia edo bidali", "ok");
  } catch(e){ toast(errMessage(e), "err"); }
}

function projectMenu(e, user, p){
  e.preventDefault();
  const name = h("input",{type:"text", value:p.name, required:true, maxlength:"80"});
  const desc = h("textarea",{maxlength:"400"}, p.description||"");
  const m = modal({
    title: "Proiektua: " + p.name,
    okText: "Gorde aldaketak",
    body: [
      field("Izena", name),
      field("Deskribapena", desc),
      h("div",{class:"row", style:{borderTop:"1px solid var(--rule)", paddingTop:"12px"}},
        h("button",{class:"btn", type:"button", onclick:()=>exportProject(p)}, "Esportatu (.json)"),
        h("span",{class:"spacer"}),
        h("button",{class:"btn danger", type:"button", onclick: async ()=>{
          if (await confirmBox("Proiektua ezabatu?", "\""+p.name+"\" eta bere Gantt eta Kanban datu guztiak betiko ezabatuko dira nabigatzaile honetatik.")){
            try{ await S.deleteProject(p.id); toast("Ezabatuta","ok"); m.close(); }
            catch(err){ toast(errMessage(err),"err"); }
          }
        }}, "Ezabatu"))
    ],
    onOk: async () => {
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      await S.updateProject(p.id, { name: name.value.trim(), description: desc.value.trim() });
      toast("Gordeta","ok");
    }
  });
}

function newProjectDialog(user){
  const name = h("input",{type:"text", required:true, maxlength:"80", placeholder:"Adib.: Animazio laburra — 2. ebaluazioa"});
  const desc = h("textarea",{maxlength:"400", placeholder:"Zertan datza proiektua? (aukerakoa)"});
  modal({
    title: "Proiektu berria",
    okText: "Sortu",
    body: [field("Izena", name), field("Deskribapena", desc)],
    onOk: async () => {
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      const id = await S.createProject(user, { name: name.value, description: desc.value });
      location.href = "gantt.html?p=" + id;
    }
  });
}

async function importFile(user, e){
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("Fitxategia handiegia da.");
    const obj = JSON.parse(await file.text());
    await S.importProject(user, obj);
    toast("Proiektua inportatuta", "ok");
  } catch(err){
    toast(err instanceof SyntaxError ? "Fitxategia ez da baliozkoa (.json)." : errMessage(err), "err");
  }
}
