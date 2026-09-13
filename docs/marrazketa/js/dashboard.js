/* Hasierako orria (bertsio irekia): piezen zerrenda, saio-hasierarik gabe. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear, toast, modal, field, confirmBox, fmtWhen, download } from "./ui.js";
import * as S from "./store.js";
import { isoSVG } from "./geo/svg.js";
import { toCellMap, volume } from "./geo/solid.js";
import { LEVELS, parseCellString, levelProgress } from "./levels.js";

const app = qs("#app");
const slug = (s) => (String(s || "pieza").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "pieza");

(async () => {
  const user = await requireAuth();
  renderHeader(user, "index.html");
  app.className = "";
  const fileIn = h("input",{type:"file", accept:".json,application/json", hidden:true, onchange:(e)=>importFile(user, e)});
  clear(app).appendChild(h("div",{class:"wrap"},
    h("div",{class:"titleblock"},
      h("span",{class:"tb-id", text:"PIEZAK"}),
      h("span",{class:"tb-name", text:"Bistak, akotazioa eta 3D ikuspegia"}),
      h("span",{class:"spacer"}),
      h("span",{class:"tb-meta", id:"pcount", text:"—"}),
      h("button",{class:"btn", onclick:()=>fileIn.click()}, "Inportatu"),
      h("button",{class:"btn primary", onclick:()=>newPieceDialog(user)}, "+ Pieza berria")),
    h("section",{class:"card", style:{marginTop:"12px", padding:"12px 14px"}},
      h("div",{class:"row"},
        h("span",{class:"eyebrow", text:"Nire aurrerapena ariketetan"}),
        h("span",{class:"spacer"}),
        h("a",{class:"btn sm primary", href:"ariketak.html"}, "Ariketetara →")),
      h("div",{id:"lvstrip", class:"row", style:{marginTop:"8px", gap:"8px"}})),
    h("div",{class:"notice", style:{marginTop:"12px"}, html:
      "Piezak eta emaitzak <b>nabigatzaile honetan</b> gordetzen dira: ez dira Internetera bidaltzen. " +
      "Pieza bat beste ordenagailu batera eramateko edo irakasleari bidaltzeko, erabili <b>⋯ → Esportatu</b> eta gero <b>Inportatu</b>."}),
    fileIn,
    h("div",{id:"list", style:{marginTop:"14px", marginBottom:"40px"}},
      h("div",{class:"loading", style:{minHeight:"180px"}}, h("div",{class:"spin"})))));

  renderLevelStrip(await S.getProgress(user));
  S.watchMyPieces(user, [], list => renderPieces(user, list));
})();

function renderLevelStrip(progress){
  const strip = clear(qs("#lvstrip"));
  LEVELS.forEach(L => {
    const p = levelProgress(L.n, progress);
    strip.appendChild(h("a",{href:"ariketak.html#maila-"+L.n, style:{textDecoration:"none", color:"inherit", flex:"1 1 140px", minWidth:"130px"}},
      h("div",{class:"row", style:{gap:"6px", fontSize:"12px"}},
        h("b",{text:L.code}), h("span",{class:"spacer"}), h("span",{class:"mono dim", text:p.done+"/"+p.total})),
      h("div",{class:"pbar"+(p.pct>=100?" done":""), style:{marginTop:"4px"}}, h("i",{style:{width:p.pct+"%"}}))));
  });
}

function renderPieces(user, list){
  const box = clear(qs("#list"));
  qs("#pcount").textContent = list.length + " pieza";
  if (!list.length){
    box.appendChild(h("div",{class:"empty"},
      h("h3",{text:"Oraindik ez duzu piezarik"}),
      h("p",{text:"Sortu pieza bat 3Dn kuboekin eraikitzeko: bistak berez marrazten dira, eta kotak jar ditzakezu."}),
      h("div",{class:"row", style:{justifyContent:"center", marginTop:"12px"}},
        h("button",{class:"btn primary", onclick:()=>newPieceDialog(user)}, "+ Pieza berria"),
        h("a",{class:"btn", href:"ariketak.html"}, "Ariketak egin"))));
    return;
  }
  box.appendChild(h("div",{class:"grid grid-3"}, list.map(p => pieceCard(user, p))));
}

function pieceCard(user, p){
  const cells = toCellMap(p.cells);
  return h("article",{class:"proj"},
    h("a",{class:"piece-thumb", href:"pieza.html?p="+p.id}, cells.size ? isoSVG(cells, { pad: 0.2 }) : h("span",{class:"eyebrow", text:"hutsik"})),
    h("div",{class:"proj-top"},
      h("div",{class:"row", style:{gap:"6px", marginBottom:"7px"}},
        h("h3",{text:p.name, style:{flex:"1 1 auto"}}),
        h("button",{class:"btn icon ghost sm", title:"Aukerak", onclick:(e)=>pieceMenu(e, p)}, "⋯")),
      p.description ? h("p",{class:"proj-desc", text:p.description}) : null,
      h("p",{class:"mono", style:{fontSize:"11px", color:"var(--ink3)", margin:"8px 0 0"},
        text: volume(cells) + " kubo · " + Object.keys(p.dims||{}).length + " kota · " + fmtWhen(p.updatedAt)})),
    h("div",{class:"proj-foot"}, h("a",{href:"pieza.html?p="+p.id}, "Ireki editorea")));
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
