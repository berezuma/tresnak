/* ============================================================
   AURRERAPENAREN OSAGAIAK
   Mailen txartelak eta "Jarraitu" txartela: hasierako orrian eta
   Ariketak orrian. Ariketak dira tresnaren bihotza.
   ============================================================ */

import { h } from "./ui.js";
import { isoSVG } from "./geo/svg.js";
import { LEVELS, TYPES, levelExercises, levelProgress, parseCellString } from "./levels.js";

/* Egin gabeko lehen ariketa, mailen ordenan */
export function nextExercise(progress){
  for (const L of LEVELS) for (const ex of levelExercises(L.n)){
    if (!progress[ex.key]?.done) return { ex, L };
  }
  return null;
}

export function totals(progress){
  return LEVELS.reduce((acc, L) => {
    const p = levelProgress(L.n, progress);
    return { done: acc.done + p.done, total: acc.total + p.total };
  }, { done: 0, total: 0 });
}

/* Maila baten txartela. base: "" Ariketak orrian, "ariketak.html" beste orrietan */
export function levelCard(L, progress, base = ""){
  const p = levelProgress(L.n, progress);
  const label = p.pct >= 100 ? "Errepasatu" : p.done ? "Jarraitu" : "Hasi";
  return h("article",{class:"level", id:"card-"+L.n},
    h("div",{class:"level-top"},
      h("div",{class:"level-num", text:String(L.n)}),
      h("div",{},
        h("div",{class:"eyebrow", text:L.code}),
        h("h3",{text:L.title}),
        h("ul",{}, L.goals.map(g => h("li",{text:g}))))),
    h("div",{class:"level-sample"}, isoSVG(parseCellString(L.sample), { pad: 0.2 })),
    h("div",{class:"level-foot"},
      h("div",{class:"row", style:{fontSize:"12px"}},
        h("span",{class:"mono dim", text: p.done + " / " + p.total + " eginda"}), h("span",{class:"spacer"}),
        h("a",{class:"btn sm" + (p.pct < 100 ? " primary" : ""), href: base + "#maila-" + L.n}, label)),
      h("div",{class:"pbar"+(p.pct>=100?" done":"")}, h("i",{style:{width:p.pct+"%"}}))));
}

/* "Jarraitu" txartel handia: hurrengo ariketa zuzenean */
export function nextCard(progress){
  const nx = nextExercise(progress);
  const t = totals(progress);
  if (!nx){
    return h("section",{class:"hero-next all-done"},
      h("div",{class:"hn-body"},
        h("div",{class:"eyebrow", text: t.done + " / " + t.total + " ariketa eginda"}),
        h("h2",{text:"Ariketa guztiak eginda! 🎉"}),
        h("p",{class:"hn-ex", text:"Errepasatu nahi duzuna, edo sortu zure piezak eta akotatu."}),
        h("a",{class:"btn primary big", href:"ariketak.html"}, "Ariketak errepasatu →")));
  }
  const { ex, L } = nx;
  const p = levelProgress(L.n, progress);
  const started = t.done > 0 || Object.keys(progress).length > 0;
  return h("section",{class:"hero-next"},
    h("div",{class:"hn-art"}, isoSVG(parseCellString(L.sample), { pad: 0.2 })),
    h("div",{class:"hn-body"},
      h("div",{class:"eyebrow", text: started ? "Jarraitu hemen" : "Hasi hemen"}),
      h("h2",{}, h("span",{class:"hn-num", text:String(L.n)}), L.code + " · " + L.title),
      h("p",{class:"hn-ex"}, h("b",{text: TYPES[ex.type].title + " " + ex.i}), " — " + TYPES[ex.type].desc),
      h("div",{class:"hn-prog"},
        h("div",{class:"pbar"+(p.pct>=100?" done":"")}, h("i",{style:{width:p.pct+"%"}})),
        h("span",{class:"mono dim", text: p.done + " / " + p.total + " maila honetan · " + t.done + " / " + t.total + " guztira"})),
      h("div",{class:"row", style:{marginTop:"14px"}},
        h("a",{class:"btn primary big", href:"ariketa.html?k=" + encodeURIComponent(ex.key)}, (started ? "Jarraitu" : "Hasi") + " ariketarekin →"),
        h("a",{class:"btn", href:"ariketak.html#maila-" + L.n}, "Mailako ariketak"))));
}
