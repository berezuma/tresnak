/* Bertsio irekia: Firebase-rik ez. kanban.js-ek getDoc(dataRef(...)) erabiltzen
   du Gantt-eko atazak irakurtzeko; hemen nabigatzailetik irakurtzen da. */
import { readData } from "./store.js";

export const isConfigured = true;

export async function getDoc(ref){
  const d = readData(ref.pid, ref.kind);
  return { exists: () => d !== null, data: () => d };
}
