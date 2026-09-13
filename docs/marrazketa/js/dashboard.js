/* Hasierako orria (bertsio irekia): ariketak lehenik, piezak bigarren mailan. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear, toast, modal, field, confirmBox, fmtWhen, download } from "./ui.js";
import * as S from "./store.js";
import { isoSVG } from "./geo/svg.js";
import { toCellMap, volume } from "./geo/solid.js";
import { LEVELS, parseCellString } from "./levels.js";
import { levelCard, nextCard, totals } from "./progress-ui.js";

const app = qs("#app");
const slug = (s) => (String(s || "pieza").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "pieza");

(async () => {
  const user = await requireAuth();
  renderHeader(user, "index.html");
  app.className = "";
  const progress = await S.getProgress(user);
  const t = totals(progress);
  const fileIn = h("input",{type:"file", accept:".json,application/json", hidden:true, onchange:(e)=>importFile(user, e)});

  clear(app).appendChild(h("div",{class:"wrap", style:{paddingBottom:"40px"}},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"MARRAZKETA LANTEGIA"}),
      h("span",{class:"tb-name", text:"Bistak, akotazioa eta 3D ikuspegia"}),
      h("span",{class:"spacer"}),
      h("span",{class:"tb-meta", text: t.done + " / " + t.total + " ariketa eginda"})),

    /* 1. hurrengo ariketa */
    nextCard(progress),

    /* 2. mailak */
    h("div",{class:"section-head"},
      h("h2",{text:"Mailak"}),
      h("span",{class:"muted", style:{fontSize:"13.5px"}, text:"Hasiberritik adituraino, zure erritmoan"}),
      h("span",{class:"spacer"}),
      h("a",{class:"btn sm", href:"ariketak.html"}, "Ariketa guztiak →")),
    h("div",{class:"levels", style:{marginTop:0}}, LEVELS.map(L => levelCard(L, progress, "ariketak.html"))),

    /* 3. piezak (bigarren mailan) */
    h("div",{class:"section-head minor"},
      h("h2",{text:"Nire piezak"}),
      h("span",{class:"muted", style:{fontSize:"13px"}, text:"Eraiki zure piezak 3Dn: bistak berez marrazten dira."}),
      h("span",{class:"spacer"}),
      h("span",{class:"tb-meta", id:"pcount", text:""}),
      h("button",{class:"btn sm ghost", onclick:()=>fileIn.click()}, "Inportatu"),
      h("button",{class:"btn sm", onclick:()=>newPieceDialog(user)}, "+ Pieza berria")),
    fileIn,
    h("div",{id:"list"}, h("div",{class:"loading", style:{minHeight:"120px"}}, h("div",{class:"spin"}))),
    h("p",{class:"muted", style:{fontSize:"12.5px", marginTop:"14px"}, html:
      "Piezak eta emaitzak <b>nabigatzaile honetan</b> gordetzen dira: ez dira Internetera bidaltzen. " +
      "Pieza bat beste ordenagailu batera eramateko edo irakasleari bidaltzeko, erabili <b>⋯ → Esportatu</b> eta gero <b>Inportatu</b>."})
  ));

  S.watchMyPieces(user, [], list => renderPieces(user, list));
})();

function renderPieces(user, list){
  const box = clear(qs("#list"));
  qs("#pcount").textContent = list.length ? list.length + " pieza" : "";
  if (!list.length){
    box.appendChild(h("p",{class:"muted", style:{fontSize:"13.5px", margin:"4px 0 0"}},
      "Oraindik ez duzu piezarik. ",
      h("a",{href:"#", onclick:(e)=>{ e.preventDefault(); newPieceDialog(user); }}, "Sortu lehena")));
    return;
  }
  box.appendChild(h("div",{class:"grid pieces-compact"}, list.map(p => pieceCard(p))));
}

function pieceCard(p){
  const cells = toCellMap(p.cells);
  return h("article",{class:"proj"},
    h("a",{class:"piece-thumb", href:"pieza.html?p="+p.id}, cells.size ? isoSVG(cells, { pad: 0.2 }) : h("span",{class:"eyebrow", text:"hutsik"})),
    h("div",{class:"proj-top"},
      h("div",{class:"row", style:{gap:"6px"}},
        h("h3",{text:p.name, style:{flex:"1 1 auto"}}),
        h("button",{class:"btn icon ghost sm", title:"Aukerak", onclick:(e)=>pieceMenu(e, p)}, "⋯")),
      h("p",{class:"mono", style:{fontSize:"10.5px", color:"var(--ink3)", margin:"4px 0 0"},
        text: volume(cells) + " kubo · " + Object.keys(p.dims||{}).length + " kota · " + fmtWhen(p.updatedAt)})),
    h("div",{class:"proj-foot"}, h("a",{href:"pieza.html?p="+p.id}, "Ireki")));
}

function exportPiece(p){
  try {
    download(slug(p.name) + ".pieza.json", JSON.stringify(S.exportPiece(p.id), null, 2), "application/json");
    toast("Esportatuta: gorde fitxategia edo bidali", "ok");
  } catch(e){ toast(errMessage(e), "err"); }
}

function pieceMenu(e, p){
  e.preventDefault();
  const name = h("input",{type:"text", value:p.name, required:true, maxlength:"80"});
  const desc = h("textarea",{maxlength:"400"}, p.description||"");
  const m = modal({
    title: "Pieza: " + p.name, okText: "Gorde aldaketak",
    body: [
      field("Izena", name), field("Deskribapena", desc),
      h("div",{class:"row", style:{borderTop:"1px solid var(--rule)", paddingTop:"12px"}},
        h("button",{class:"btn", type:"button", onclick:()=>exportPiece(p)}, "Esportatu (.json)"),
        h("span",{class:"spacer"}),
        h("button",{class:"btn danger", type:"button", onclick: async ()=>{
          if (await confirmBox("Pieza ezabatu?", "\""+p.name+"\" eta bere kota guztiak betiko ezabatuko dira nabigatzaile honetatik.")){
            try{ await S.deletePiece(p.id); toast("Ezabatuta","ok"); m.close(); }
            catch(err){ toast(errMessage(err),"err"); }
          }
        }}, "Ezabatu"))
    ],
    onOk: async () => {
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      await S.updatePiece(p.id, { name: name.value.trim(), description: desc.value.trim() });
      toast("Gordeta","ok");
    }
  });
}

function newPieceDialog(user){
  const name = h("input",{type:"text", required:true, maxlength:"80", placeholder:"Adib.: Eskailera-pieza"});
  const desc = h("textarea",{maxlength:"400", placeholder:"Aukerakoa"});
  const start = h("select",{},
    h("option",{value:""}, "Hutsik"),
    LEVELS.map(L => h("option",{value:String(L.n)}, "Adibidea: " + L.code + " mailako pieza")));
  modal({
    title: "Pieza berria", okText: "Sortu",
    body: [field("Izena", name), field("Deskribapena", desc), field("Hasteko", start)],
    onOk: async () => {
      if (!name.value.trim()) throw new Error("Izena beharrezkoa da.");
      const cells = start.value ? Object.fromEntries(parseCellString(LEVELS[+start.value - 1].sample)) : {};
      const id = await S.createPiece(user, { name:name.value, description:desc.value, cells });
      location.href = "pieza.html?p=" + id;
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
    await S.importPiece(user, obj);
    toast("Pieza inportatuta", "ok");
  } catch(err){
    toast(err instanceof SyntaxError ? "Fitxategia ez da baliozkoa (.json)." : errMessage(err), "err");
  }
}
