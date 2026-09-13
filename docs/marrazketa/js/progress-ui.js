/* ============================================================
   AURRERAPENAREN OSAGAIAK
   Mailen txartelak (ibilbidea) eta hurrengo ariketaren txartela:
   hasierako orrian eta Ariketak orrian. Ariketak dira tresnaren bihotza.
   ============================================================ */

import { h } from "./ui.js";
import { isoSVG, viewSVG } from "./geo/svg.js";
import { buildSolid } from "./geo/solid.js";
import { projectView, VIEWS } from "./geo/project.js";
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
  const nx = nextExercise(progress);
  const state = p.pct >= 100 ? " is-done" : (nx && nx.L.n === L.n ? " is-current" : "");
  const label = p.pct >= 100 ? "Errepasatu" : p.done ? "Jarraitu" : "Hasi";
  return h("article",{class:"level" + state, id:"card-"+L.n},
    h("div",{class:"level-top"},
      h("div",{class:"level-num", text:String(L.n), "aria-hidden":"true"}),
      h("div",{class:"eyebrow", text:L.n + ". maila: " + L.code}),
      h("h3",{text:L.title}),
      h("ul",{}, L.goals.map(g => h("li",{text:g})))),
    h("div",{class:"level-sample"}, isoSVG(parseCellString(L.sample), { pad: 0.2 })),
    h("div",{class:"level-foot"},
      h("div",{class:"row", style:{fontSize:"14px"}},
        h("span",{class:"mono dim", text: p.done + " / " + p.total + " eginda"}), h("span",{class:"spacer"}),
        h("a",{class:"btn sm" + (state === " is-current" ? " primary" : ""), href: base + "#maila-" + L.n}, label)),
      h("div",{class:"pbar"+(p.pct>=100?" done":"")}, h("i",{style:{width:p.pct+"%"}}))));
}

/* Pieza isometrikoan, eta ondoan bere hiru bistak koloretan */
function pieceWithViews(cells){
  const solid = buildSolid(cells);
  const iso = isoSVG(solid, { pad: 0.2 });
  iso.querySelectorAll("line").forEach((l, i) => { l.setAttribute("pathLength", "1"); l.style.setProperty("--i", i); });
  return h("div",{class:"hn-art", "aria-hidden":"true"},
    h("div",{class:"hn-iso"}, iso),
    h("div",{class:"hn-views"}, ["F", "T", "L"].map((v, j) =>
      h("figure",{class:"hn-view v" + v, style:{"--j": j}},
        viewSVG(projectView(solid, v), { hidden: true, pad: 0.25 }),
        h("figcaption",{text: VIEWS[v].name})))));
}

/* Hurrengo ariketaren txartel handia */
export function nextCard(progress){
  const nx = nextExercise(progress);
  const t = totals(progress);
  if (!nx){
    return h("section",{class:"hero-next all-done"},
      h("div",{class:"hn-body"},
        h("h2",{text:"Ariketa guztiak eginda"}),
        h("p",{class:"hn-ex", text: t.total + " ariketak asmatu dituzu. Errepasatu nahi dituzunak, edo sortu zure piezak eta akotatu."}),
        h("div",{class:"hn-actions"}, h("a",{class:"btn primary big", href:"ariketak.html"}, "Errepasatu ariketak"))));
  }
  const { ex, L } = nx;
  const p = levelProgress(L.n, progress);
  const started = Object.keys(progress).length > 0;
  return h("section",{class:"hero-next"},
    pieceWithViews(parseCellString(L.sample)),
    h("div",{class:"hn-body"},
      h("p",{class:"hn-level", text: L.n + ". maila: " + L.code}),
      h("h2",{}, h("span",{class:"hn-num", text:String(L.n), "aria-hidden":"true"}), L.title),
      h("p",{class:"hn-ex"}, h("b",{text: TYPES[ex.type].title + " (" + ex.i + ")"}), ". " + TYPES[ex.type].desc),
      h("div",{class:"hn-prog"},
        h("div",{class:"pbar"+(p.pct>=100?" done":"")}, h("i",{style:{width:p.pct+"%"}})),
        h("span",{class:"mono", text: p.done + " / " + p.total + " eginda maila honetan"})),
      h("div",{class:"hn-actions"},
        h("a",{class:"btn primary big", href:"ariketa.html?k=" + encodeURIComponent(ex.key)}, started ? "Jarraitu ariketa" : "Hasi ariketa"),
        h("a",{href:"ariketak.html#maila-" + L.n}, "Mailako ariketa guztiak"))));
}
