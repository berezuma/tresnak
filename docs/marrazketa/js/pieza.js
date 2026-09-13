/* Pieza-editorearen orria: Firestore-ra lotuta. */

import { requireAuth, renderHeader, errMessage } from "./auth.js";
import { h, qs, clear, toast, param } from "./ui.js";
import * as S from "./store.js";
import { mountEditor } from "./editor-ui.js";

const app = qs("#app");
const PID = param("p");

(async () => {
  const USER = await requireAuth();
  if (!PID){ location.replace("index.html"); return; }
  renderHeader(USER, "index.html");
  let piece;
  try { piece = await S.getPiece(PID); }
  catch(e){ return fatal(errMessage(e)); }

  app.className = "";
  const wrap = h("div",{class:"wrap-wide", style:{paddingBottom:"24px"}});
  clear(app).appendChild(wrap);

  const backend = {
    patchCells: (p) => S.patchCells(PID, p, USER),
    patchDims:  (p) => S.patchDims(PID, p, USER),
    update:     (p) => S.updatePiece(PID, p, USER),
    subscribe:  (cb) => S.watchPiece(PID, cb, err => toast(errMessage(err), "err"))
  };
  const teamLabel = piece.teamId ? h("span",{class:"tag team", text:"taldea " + piece.teamId}) : h("span",{class:"tag solo", text:"bakarka"});
  mountEditor(wrap, piece, backend, { isAdmin: USER.admin, teamLabel });
})();

function fatal(msg){
  app.className = "";
  clear(app).appendChild(h("div",{class:"wrap"},
    h("div",{class:"notice err", style:{marginTop:"30px"}, text:msg}),
    h("p",{}, h("a",{href:"index.html"}, "← Piezetara itzuli"))));
}
