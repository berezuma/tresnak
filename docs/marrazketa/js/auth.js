/* Bertsio irekia: saio-hasierarik ez. Erabiltzaile lokal bakarra. */

import { APP_NAME, APP_SUB } from "./config.js";
import { h } from "./ui.js";

export const LOCAL_USER = { uid: "lokala", email: "", name: "Ni", admin: false };

export async function requireAuth(){ return LOCAL_USER; }

export function brandGlyph(){
  return h("span",{class:"glyph views"}, h("i"), h("i"), h("i"));
}

export function renderHeader(user, current){
  const nav = [
    ["index.html", "Hasiera"],
    ["ariketak.html", "Ariketak"]
  ];
  const bar = h("header",{class:"topbar no-print"},
    h("div",{class:"topbar-in"},
      h("a",{class:"brand", href:"index.html"},
        brandGlyph(),
        h("span",{}, h("b",{text:APP_NAME}), h("br"), h("span",{text:APP_SUB}))),
      h("nav",{class:"topnav"}, nav.map(([href,label]) =>
        h("a",{href, class: current===href ? "on" : "", text:label}))),
      h("span",{class:"spacer"}),
      h("a",{class:"tag", href:"pribatutasuna.html", style:{textDecoration:"none"},
        title:"Zure lana nabigatzaile honetan bakarrik gordetzen da"}, "gailu honetan gordeta")
    )
  );
  document.body.insertBefore(bar, document.body.firstChild);
  return bar;
}

export function errMessage(e){
  return (e && e.message) || "Errore ezezaguna";
}
