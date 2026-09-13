/* ============================================================
   BERTSIO IREKIA: datu guztiak nabigatzailean (localStorage).
   Eskolako store.js-en funtzio berak, gantt.js eta kanban.js
   aldatu gabe erabiltzeko.
     index                       -> proiektuen IDak
     project.{pid}               -> proiektuaren fitxa
     data.{pid}.gantt / .kanban  -> taulen datuak
   ============================================================ */

import { uid as newId } from "./ui.js";

const P = "proiektu-taula.v1.";
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
const getMeta = (pid) => read("project." + pid, null);

/* ===================== PROIEKTUAK ===================== */

export function defaultColumns(){
  return [
    { id: newId("c"), name: "Egiteke",    color: "s1" },
    { id: newId("c"), name: "Egiten",     color: "s2" },
    { id: newId("c"), name: "Berrikusten",color: "s5" },
    { id: newId("c"), name: "Eginda",     color: "s3" }
  ];
}

export async function createProject(user, { name, description = "" }){
  const id = newId("p");
  write("project." + id, {
    name: String(name).trim(), description: String(description).trim(), teamId: null,
    ownerUid: user.uid, ownerName: user.name, ownerEmail: "",
    createdAt: now(), updatedAt: now(), updatedBy: user.name
  });
  write("data." + id + ".gantt", { tasks: [] });
  write("data." + id + ".kanban", { columns: defaultColumns(), cards: [] });
  write("index", [...index().filter(x => x !== id), id]);
  emit("index");
  return id;
}

export async function updateProject(pid, patch){
  const p = getMeta(pid);
  if (!p) throw new Error("Proiektua ez dago nabigatzaile honetan.");
  write("project." + pid, { ...p, ...patch, teamId: null, updatedAt: now() });
  emit("index");
}

export async function deleteProject(pid){
  remove("project." + pid);
  remove("data." + pid + ".gantt");
  remove("data." + pid + ".kanban");
  write("index", index().filter(x => x !== pid));
  emit("index");
}

export async function getProject(pid){
  const p = getMeta(pid);
  if (!p) throw new Error("Proiektua ez dago nabigatzaile honetan. Beste gailu batean sortu bazenuen, esportatu han eta inportatu hemen.");
  return { id: pid, ...p };
}

export function watchMyProjects(user, teamIds, cb){
  const fire = () => {
    const list = index().map(id => { const p = getMeta(id); return p && { id, ...p }; }).filter(Boolean);
    list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    cb(list);
  };
  setTimeout(fire, 0);
  return on("*", fire);
}

/* ===================== TAULEN DATUAK ===================== */

export const dataRef = (pid, kind) => ({ pid, kind });
export const readData = (pid, kind) => read("data." + pid + "." + kind, null);

/* Hasierako datuak + beste fitxetako aldaketak (norberaren idazketak ez) */
export function watchData(pid, kind, cb){
  setTimeout(() => cb(readData(pid, kind), false), 0);
  return on("data." + pid + "." + kind, () => cb(readData(pid, kind), false));
}

export async function saveData(pid, kind, data, user){
  write("data." + pid + "." + kind, data);
  const p = getMeta(pid);
  if (p) write("project." + pid, { ...p, updatedAt: now(), updatedBy: user.name });
}

/* ===================== ESPORTATU / INPORTATU ===================== */

export const FORMAT = "proiektu-taula";

export function exportProject(pid){
  const p = getMeta(pid);
  if (!p) throw new Error("Proiektua ez da aurkitu.");
  return {
    format: FORMAT, version: 1, exportedAt: new Date().toISOString(),
    project: { name: p.name, description: p.description || "" },
    gantt: readData(pid, "gantt"), kanban: readData(pid, "kanban")
  };
}

export async function importProject(user, obj){
  if (!obj || obj.format !== FORMAT) throw new Error("Fitxategi hau ez da Proiektu Taula-ren proiektu bat.");
  const name = String(obj.project?.name || "Inportatutako proiektua").slice(0, 80);
  const id = await createProject(user, { name, description: String(obj.project?.description || "").slice(0, 400) });
  if (obj.gantt && Array.isArray(obj.gantt.tasks)) write("data." + id + ".gantt", { tasks: obj.gantt.tasks });
  if (obj.kanban && Array.isArray(obj.kanban.columns) && obj.kanban.columns.length)
    write("data." + id + ".kanban", { columns: obj.kanban.columns, cards: Array.isArray(obj.kanban.cards) ? obj.kanban.cards : [] });
  emit("index");
  return id;
}
