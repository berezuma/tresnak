/* Ariketa baten orria: ariketa sortu, egin eta emaitza gorde. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear, toast, param } from "./ui.js";
import * as S from "./store.js";
import { buildExercise, parseExKey, levelExercises, levelByN } from "./levels.js";
import { renderExercise } from "./exercise-ui.js";

const app = qs("#app");

(async () => {
  const USER = await requireAuth();
  renderHeader(USER, "ariketak.html");
  app.className = "";
  const key = param("k") || "";
  const parsed = parseExKey(key);
  if (!parsed) return fatal("Ariketa ez da existitzen.");

  let teacherPiece = null;
  if (parsed.pid){
    try { teacherPiece = await S.getPiece(parsed.pid); }
    catch(e){ return fatal(errMessage(e)); }
    if (!teacherPiece.isExercise || !(teacherPiece.exercise?.types || []).includes(parsed.type))
      return fatal("Ariketa hau ez dago argitaratuta.");
  } else if (!levelByN(parsed.level) || !levelExercises(parsed.level).some(e => e.key === key)){
    return fatal("Ariketa ez da existitzen.");
  }

  const progress = await S.getProgress(USER);
  const ex = buildExercise(parsed, teacherPiece);
  if (teacherPiece) ex.pieceName = teacherPiece.name;

  let next = null;
  if (!teacherPiece){
    const list = levelExercises(parsed.level);
    const i = list.findIndex(e => e.key === key);
    next = list[i + 1] ? "ariketa.html?k=" + list[i + 1].key : "ariketak.html#maila-" + (parsed.level < 5 ? parsed.level + 1 : parsed.level);
  } else {
    const types = teacherPiece.exercise.types;
    const i = types.indexOf(parsed.type);
    next = types[i + 1] ? "ariketa.html?k=P-" + teacherPiece.id + "-" + types[i + 1] : "ariketak.html";
  }

  const wrap = h("div",{class:"wrap-wide"});
  clear(app).appendChild(wrap);
  const crumbs = h("div",{class:"row", style:{marginTop:"12px", fontSize:"13px"}},
    h("a",{href:"ariketak.html"}, "Ariketak"), h("span",{class:"dim", text:"/"}),
    teacherPiece ? h("span",{text:"Irakaslearena"}) : h("a",{href:"ariketak.html#maila-"+parsed.level}, ex.levelInfo.code + " · " + ex.levelInfo.title));
  const body = h("div");
  wrap.append(crumbs, body);

  renderExercise(body, ex, {
    progress: progress[key],
    onResult: async (score, info = {}) => {
      try { progress[key] = await S.recordAttempt(USER, key, score, progress[key], info); return progress[key]; }
      catch(e){ toast("Emaitza ez da gorde: " + errMessage(e), "err"); throw e; }
    },
    onNext: () => { location.href = next; }
  });
})();

function fatal(msg){
  clear(app).appendChild(h("div",{class:"wrap"},
    h("div",{class:"notice err", style:{marginTop:"30px"}, text:msg}),
    h("p",{}, h("a",{href:"ariketak.html"}, "← Ariketetara itzuli"))));
}
