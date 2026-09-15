// Robotikaren Lantegia — tresna partekatuak (oinarria/lantegia) eta aurrerapena
import { makeProgress } from '../../oinarria/lantegia/util.js';
export * from '../../oinarria/lantegia/util.js';

export const progress = makeProgress('robotika:aurrerapena:v1');

// Nabigatzailean gordetako datu txikiak (programak, puzzle ebatziak); huts eginez gero, memorian bakarrik
export function irakurri(gakoa, lehenetsia = null) {
  try { const v = JSON.parse(localStorage.getItem(gakoa)); return v ?? lehenetsia; } catch { return lehenetsia; }
}
// Galdetegiko aukerak ordena nahasian, erantzun zuzena beti leku berean egon ez dadin.
// Ordena galderaren testutik kalkulatzen da: beti berdina da, kargatzen den bakoitzean.
export function nahastu(galderak) {
  return galderak.map(q => {
    let h = 2166136261;
    for (const c of q.g) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    const ordena = q.a.map((_, i) => i);
    for (let i = ordena.length - 1; i > 0; i--) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      const j = (h >>> 8) % (i + 1);
      [ordena[i], ordena[j]] = [ordena[j], ordena[i]];
    }
    return { ...q, a: ordena.map(i => q.a[i]), z: ordena.indexOf(q.z) };
  });
}

export function gorde(gakoa, balioa) {
  try { localStorage.setItem(gakoa, JSON.stringify(balioa)); } catch { /* nabigatzaile pribatua */ }
}
