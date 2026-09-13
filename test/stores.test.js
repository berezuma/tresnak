/* Bertsio irekiko datu-geruzen probak (Node, localStorage simulatuta).
   Lehenik ./build.sh, gero: node test/stores.test.js */
import assert from "node:assert/strict";

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => mem.has(k) ? mem.get(k) : null,
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k)
};
const tick = () => new Promise(r => setTimeout(r, 5));
const user = { uid: "lokala", name: "Ni" };

/* ---------- Proiektu Taula ---------- */
const PT = await import("../docs/proiektu-taula/js/store.js");
const FB = await import("../docs/proiektu-taula/js/firebase.js");
{
  let lists = [];
  PT.watchMyProjects(user, [], l => lists.push(l));
  const id = await PT.createProject(user, { name: " Proba ", description: "d" });
  await tick();
  assert.equal(lists.at(-1).length, 1);
  assert.equal((await PT.getProject(id)).name, "Proba");
  await PT.saveData(id, "gantt", { tasks: [{ id: "t1", name: "Ataza" }] }, user);
  const snap = await FB.getDoc(PT.dataRef(id, "gantt"));
  assert.equal(snap.exists(), true);
  assert.equal(snap.data().tasks[0].name, "Ataza");
  let got = null;
  PT.watchData(id, "kanban", d => got = d);
  await tick();
  assert.equal(got.columns.length, 4);
  const exp = PT.exportProject(id);
  const id2 = await PT.importProject(user, JSON.parse(JSON.stringify(exp)));
  assert.notEqual(id2, id);
  assert.equal(PT.readData(id2, "gantt").tasks.length, 1);
  await assert.rejects(PT.importProject(user, { format: "beste-bat" }));
  await PT.deleteProject(id);
  await assert.rejects(PT.getProject(id));
  await tick();
  assert.equal(lists.at(-1).length, 1);
  console.log("ok - Proiektu Taula: sortu, gorde, Gantt-etik irakurri, esportatu/inportatu, ezabatu");
}

/* ---------- Marrazketa Lantegia ---------- */
const MK = await import("../docs/marrazketa/js/store.js");
{
  const id = await MK.createPiece(user, { name: "Pieza", cells: { "0_0_0": "c" } });
  await MK.patchCells(id, { "1_0_0": "w000", "0_0_0": null }, user);
  await MK.patchDims(id, { d1: { id: "d1", view: "F", a: [0, 0], b: [1, 0], dir: "h", side: -1 } }, user);
  let p = await MK.getPiece(id);
  assert.deepEqual(p.cells, { "1_0_0": "w000" });
  assert.equal(Object.keys(p.dims).length, 1);
  await MK.updatePiece(id, { name: "Berria", isExercise: true }, user);
  p = await MK.getPiece(id);
  assert.equal(p.name, "Berria");
  assert.equal(p.isExercise, false, "bertsio irekian ez dago ariketarik argitaratzerik");
  const e = await MK.recordAttempt(user, "L1-aukeratu-1", 50);
  const e2 = await MK.recordAttempt(user, "L1-aukeratu-1", 100, e);
  assert.equal(e2.done, true); assert.equal(e2.tries, 2);
  assert.equal((await MK.getProgress(user))["L1-aukeratu-1"].best, 100);
  const exp = JSON.parse(JSON.stringify(MK.exportPiece(id)));
  exp.piece.cells["99_0_0"] = "c"; exp.piece.cells["2_0_0"] = "<script>";
  const id2 = await MK.importPiece(user, exp);
  const p2 = await MK.getPiece(id2);
  assert.deepEqual(p2.cells, { "1_0_0": "w000" }, "baliogabeak baztertuta");
  assert.equal(Object.keys(p2.dims).length, 1);
  assert.deepEqual(await MK.myTeams(), []);
  assert.deepEqual(await MK.listTeacherExercises(), []);
  await MK.deletePiece(id);
  await assert.rejects(MK.getPiece(id));
  console.log("ok - Marrazketa Lantegia: pieza, gelaxkak, kotak, emaitzak, esportatu/inportatu, ezabatu");
}
console.log("\ndatu-geruzak ondo");
