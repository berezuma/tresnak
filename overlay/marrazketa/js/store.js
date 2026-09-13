/* ============================================================
   BERTSIO IREKIA: datu guztiak nabigatzailean (localStorage).
   Eskolako store.js-en funtzio berak (taldeak eta irakaslea kenduta).
     index            -> piezen IDak
     piece.{pid}      -> pieza: { name, cells, dims, size, … }
     progress         -> ariketen emaitzak: { gakoa: {best, tries, done, last, at} }
   ============================================================ */

import { uid } from "./ui.js";
import { DEFAULT_SIZE, UNIT_MM } from "./config.js";
import { validShape, MAX_SIZE } from "./geo/solid.js";

const P = "marrazketa.v1.";
const listeners = new Map();

function read(k, def){
  try { const v = localStorage.getItem(P + k); return v === null ? def : JSON.parse(v); }
  catch(e){ return def; }
}
function write(k, v){
  try { localStorage.setItem(P + k, JSON.stringify(v)); }
  catch(e){ throw new Error("Ezin da nabigatzailean gorde (memoria beteta edo leiho pribatua?)."); }
}
function remove(k){ try { localStorage.removeItem(P + k); } catch(e){} }
function on(k, cb){
  if (!listeners.has(k)) listeners.set(k, new Set());
  listeners.get(k).add(cb);
  return () => listeners.get(k).delete(cb);
}
function emit(k){
  for (const key of [k, "*"]) (listeners.get(key) || []).forEach(cb => { try { cb(); } catch(e){ console.error(e); } });
}
/* Beste fitxa batean egindako aldaketak */
if (typeof window !== "undefined" && window.addEventListener){
  window.addEventListener("storage", (e) => { if (e.key && e.key.startsWith(P)) emit(e.key.slice(P.length)); });
}
const now = () => ({ seconds: Math.floor(Date.now() / 1000) });

const index = () => read("index", []);
const get = (pid) => read("piece." + pid, null);

function mutate(pid, fn){
  const p = get(pid);
  if (!p) throw new Error("Pieza ez dago nabigatzaile honetan.");
  fn(p);
  p.updatedAt = now();
  write("piece." + pid, p);
  return p;
}

/* ===================== TALDEAK (bertsio irekian ez) ===================== */
export async function myTeams(){ return []; }
export async function listTeacherExercises(){ return []; }

/* ===================== PIEZAK ===================== */

export async function createPiece(user, { name, description = "", cells = {} }){
  const id = uid("k");
  write("piece." + id, {
    name: String(name).trim(), description: String(description).trim(), teamId: null,
    ownerUid: user.uid, ownerName: user.name, ownerEmail: "",
    cells, dims: {}, unit: UNIT_MM, size: { ...DEFAULT_SIZE }, isExercise: false,
    createdAt: now(), updatedAt: now(), updatedBy: user.name
  });
  write("index", [...index().filter(x => x !== id), id]);
  emit("index");
  return id;
}

export async function getPiece(pid){
  const p = get(pid);
  if (!p) throw new Error("Pieza ez dago nabigatzaile honetan. Beste gailu batean sortu bazenuen, esportatu han eta inportatu hemen.");
  return { id: pid, ...p };
}

/* Hasierako datuak + beste fitxetako aldaketak (norberaren idazketak ez) */
export function watchPiece(pid, cb){
  const fire = () => { const p = get(pid); cb(p ? { id: pid, ...p } : null, false); };
  setTimeout(fire, 0);
  return on("piece." + pid, fire);
}

export async function patchCells(pid, patch, user){
  mutate(pid, p => {
    p.cells = p.cells || {};
    for (const [k, v] of Object.entries(patch)) v ? p.cells[k] = v : delete p.cells[k];
    p.updatedBy = user.name;
  });
}

export async function replaceCells(pid, cells, user){
  mutate(pid, p => { p.cells = cells; p.dims = {}; p.updatedBy = user.name; });
}

export async function patchDims(pid, patch, user){
  mutate(pid, p => {
    p.dims = p.dims || {};
    for (const [id, d] of Object.entries(patch)) d ? p.dims[id] = d : delete p.dims[id];
    p.updatedBy = user.name;
  });
}

export async function updatePiece(pid, patch, user){
  mutate(pid, p => { Object.assign(p, patch, { teamId: null, isExercise: false }); if (user) p.updatedBy = user.name; });
  emit("index");
}

export async function deletePiece(pid){
  remove("piece." + pid);
  write("index", index().filter(x => x !== pid));
  emit("index");
}

export function watchMyPieces(user, teamIds, cb){
  const fire = () => {
    const list = index().map(id => { const p = get(id); return p && { id, ...p }; }).filter(Boolean);
    list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    cb(list);
  };
  setTimeout(fire, 0);
  return on("*", fire);
}

/* ===================== AURRERAPENA ===================== */

export async function getProgress(){ return read("progress", {}); }

/* solved: ariketa azkenean asmatu da (saiakera batzuen ondoren ere) → eginda. */
export async function recordAttempt(user, exKey, score, prev = {}, { solved = false } = {}){
  const best = Math.max(prev.best || 0, score);
  const entry = { best, tries: (prev.tries || 0) + 1, done: solved || best >= 100 || !!prev.done, last: score, at: Date.now() };
  const all = read("progress", {});
  all[exKey] = entry;
  write("progress", all);
  return entry;
}

/* ===================== ESPORTATU / INPORTATU ===================== */

export const FORMAT = "marrazketa-pieza";

export function exportPiece(pid){
  const p = get(pid);
  if (!p) throw new Error("Pieza ez da aurkitu.");
  return {
    format: FORMAT, version: 1, exportedAt: new Date().toISOString(),
    piece: { name: p.name, description: p.description || "", cells: p.cells || {}, dims: p.dims || {}, unit: p.unit || UNIT_MM, size: p.size || DEFAULT_SIZE }
  };
}

export async function importPiece(user, obj){
  if (!obj || obj.format !== FORMAT || !obj.piece) throw new Error("Fitxategi hau ez da Marrazketa Lantegiko pieza bat.");
  const src = obj.piece;
  const cells = {};
  for (const [k, v] of Object.entries(src.cells || {})){
    /* gelaxka lan-eremuaren barruan egon behar da (0 … MAX_SIZE-1 ardatz bakoitzean) */
    const inside = /^\d{1,2}_\d{1,2}_\d{1,2}$/.test(k) && k.split("_").every(n => +n < MAX_SIZE);
    if (inside && validShape(v)) cells[k] = v;
  }
  if (Object.keys(cells).length > 1000) throw new Error("Piezak gelaxka gehiegi ditu.");
  const dims = {};
  for (const [id, d] of Object.entries(src.dims || {})){
    const pt = (a) => Array.isArray(a) && a.length === 2 && a.every(n => typeof n === "number" && isFinite(n));
    if (d && ["F", "T", "L", "R"].includes(d.view) && pt(d.a) && pt(d.b) && (d.dir === "h" || d.dir === "v"))
      dims[String(id).replace(/[^\w-]/g, "").slice(0, 40) || uid("d")] = { id, view: d.view, a: d.a, b: d.b, dir: d.dir, side: d.side === -1 ? -1 : 1 };
  }
  const clamp = (n, def) => Math.max(1, Math.min(MAX_SIZE, parseInt(n) || def));
  const id = await createPiece(user, {
    name: String(src.name || "Inportatutako pieza").slice(0, 80),
    description: String(src.description || "").slice(0, 400),
    cells
  });
  mutate(id, p => {
    p.dims = Object.fromEntries(Object.values(dims).map(d => [d.id, d]));
    p.size = { x: clamp(src.size?.x, DEFAULT_SIZE.x), y: clamp(src.size?.y, DEFAULT_SIZE.y), z: clamp(src.size?.z, DEFAULT_SIZE.z) };
  });
  emit("index");
  return id;
}
