// Blokeen irudi estatikoak, HTML hutsez: azalpenetan, ariketetan eta fitxa inprimagarrietan.
// Programa bat lerroen zerrenda da. Lerroa: 'testua' (mugimendu-blokea) edo
//   [kategoria, 'testua', barnekoak?, 'bestela-testua'?, bestelakoak?]
// Testuaren barruan: {4} zenbaki-hutsunea · [x] aldagaia · ⟨bidea libre⟩ baldintza
import { KOLOREAK } from './blokeak/definizioak.js';
import { esc } from './util.js';

const inline = t => esc(t)
  .replace(/\{([^}]*)\}/g, '<span class="bk-n">$1</span>')
  .replace(/\[([^\]]*)\]/g, '<span class="bk-v">$1</span>')
  .replace(/⟨([^⟩]*)⟩/g, '<span class="bk-b">$1</span>');

const laua = t => t.replace(/[{}[\]⟨⟩]/g, '');

function lerroa(r) {
  if (typeof r === 'string') r = ['mugimendua', r];
  const [kat, testua, barne, bestelaT, bestela] = r;
  const c = KOLOREAK[kat] || kat;
  if (!barne) return `<div class="bk" style="--bk:${c}">${inline(testua)}</div>`;
  const multzoa = l => `<div class="bk-in">${l.length ? l.map(lerroa).join('') : '<div class="bk-hutsik"></div>'}</div>`;
  return `<div class="bk bk-c${kat === 'gertaera' ? ' bk-hat' : ''}" style="--bk:${c}">
    <div class="bk-h">${inline(testua)}</div>${multzoa(barne)}
    ${bestelaT ? `<div class="bk-h">${inline(bestelaT)}</div>${multzoa(bestela || [])}` : ''}
    <div class="bk-f"></div></div>`;
}

function testuLaua(lerroak, sakonera = 0) {
  return lerroak.map(r => {
    if (typeof r === 'string') r = ['', r];
    const [, testua, barne, bestelaT, bestela] = r;
    let s = laua(testua);
    if (barne) s += ': ' + (barne.length ? testuLaua(barne, sakonera + 1) : '(hutsik)') + ' ·';
    if (bestelaT) s += ` ${laua(bestelaT)}: ${testuLaua(bestela || [], sakonera + 1)} ·`;
    return s;
  }).join('; ');
}

export function programa(lerroak, izena = 'Programa') {
  return `<div class="bk-prog" role="img" aria-label="${esc(izena)}. ${esc(testuLaua(lerroak))}">${lerroak.map(lerroa).join('')}</div>`;
}
