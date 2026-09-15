// Ate logikoak: ate bakarra (sarrerak, irteera eta egia-taula) edo zirkuitu logiko txikiak (alarma, bozketa…).
// Sarrerak aldatzeko: sakatu busen goiko laukiak edo egia-taulako errenkada bat.
// Aukerak: modua ('ateak' | 'zirkuituak'), zirkuitua, maila
import { esc } from '../util.js';
import { ATEAK, ezH, zirkuituaSVG, ebaluatu, konbinazioak } from './logika-marrazkia.js';

export const ZIRKUITUAK = {
  alarma: {
    izena: 'Etxeko alarma', maila: 2, w: 620, h: 220,
    azalpena: 'Alarmak jotzen du atea EDO leihoa irekita badago, ETA alarma aktibatuta badago.',
    etiketak: { A: 'A: atea irekita', B: 'B: leihoa irekita', C: 'C: alarma aktibatuta' },
    sarrerak: ['A', 'B', 'C'],
    ateak: [{ id: 'g1', mota: 'EDO', x: 200, y: 120, sar: ['A', 'B'] }, { id: 'g2', mota: 'ETA', x: 340, y: 150, sar: ['g1', 'C'] }],
    irteerak: [{ izena: 'Q', src: 'g2' }],
    adierazpenak: ['Q = (A + B) · C']
  },
  ureztatu: {
    izena: 'Ureztatze automatikoa', maila: 2, w: 560, h: 210,
    azalpena: 'Ponpa lurra lehorra dagoenean pizten da, ETA EZ badago euririk: euria ari badu, ez da ura alferrik botatzen.',
    etiketak: { L: 'L: lurra lehorra', E: 'E: euria ari du' },
    sarrerak: ['L', 'E'], ezeztuak: ['E'],
    ateak: [{ id: 'g1', mota: 'ETA', x: 220, y: 150, sar: ['L', 'E!'] }],
    irteerak: [{ izena: 'P', src: 'g1' }],
    adierazpenak: [`P = L · ${ezH('E')}`]
  },
  bozketa: {
    izena: 'Bozketa (gehiengoa)', maila: 2, w: 620, h: 290,
    azalpena: 'Hiru epaileko lehiaketa: argia pizten da gutxienez bi epailek «bai» esaten badute.',
    etiketak: { A: 'A epailea', B: 'B epailea', C: 'C epailea' },
    sarrerak: ['A', 'B', 'C'],
    ateak: [
      { id: 'g1', mota: 'ETA', x: 200, y: 100, sar: ['A', 'B'] },
      { id: 'g2', mota: 'ETA', x: 200, y: 170, sar: ['A', 'C'] },
      { id: 'g3', mota: 'ETA', x: 200, y: 240, sar: ['B', 'C'] },
      { id: 'g4', mota: 'EDO', x: 370, y: 170, sar: ['g1', 'g2', 'g3'] }
    ],
    irteerak: [{ izena: 'Q', src: 'g4' }],
    adierazpenak: ['Q = A · B + A · C + B · C']
  },
  eskailera: {
    izena: 'Eskailerako argia', maila: 2, w: 560, h: 190,
    azalpena: 'Eskaileraren behean eta goian etengailu bana dago. Edozeinek aldatzen du argiaren egoera: argia piztuta dago etengailuak desberdin daudenean.',
    etiketak: { A: 'A: beheko etengailua', B: 'B: goiko etengailua' },
    sarrerak: ['A', 'B'],
    ateak: [{ id: 'g1', mota: 'EDOB', x: 220, y: 130, sar: ['A', 'B'] }],
    irteerak: [{ izena: 'Q', src: 'g1' }],
    adierazpenak: ['Q = A ⊕ B']
  },
  batutzailea: {
    izena: 'Batutzaile erdia', maila: 2, w: 620, h: 270,
    azalpena: 'Bi bit batzen ditu: S batura da eta C eramana (1 + 1 = 10 bitarrez). Ordenagailuen batutzaileak zirkuitu hauekin eraikitzen dira.',
    etiketak: { A: 'A bita', B: 'B bita' },
    sarrerak: ['A', 'B'],
    ateak: [{ id: 'g1', mota: 'EDOB', x: 220, y: 120, sar: ['A', 'B'] }, { id: 'g2', mota: 'ETA', x: 220, y: 210, sar: ['A', 'B'] }],
    irteerak: [{ izena: 'S', src: 'g1' }, { izena: 'C', src: 'g2' }],
    adierazpenak: ['S = A ⊕ B', 'C = A · B']
  },
  eskailera2: {
    izena: 'EDO-B ate oinarrizkoekin', maila: 3, w: 620, h: 270,
    azalpena: 'EDO-B atea ETA, EDO eta EZ ateekin eraiki daiteke: A eta EZ B, EDO EZ A eta B. Konparatu egia-taula «Eskailerako argia» zirkuituarenarekin.',
    etiketak: { A: 'A etengailua', B: 'B etengailua' },
    sarrerak: ['A', 'B'], ezeztuak: ['A', 'B'],
    ateak: [
      { id: 'g1', mota: 'ETA', x: 220, y: 140, sar: ['A', 'B!'] },
      { id: 'g2', mota: 'ETA', x: 220, y: 210, sar: ['A!', 'B'] },
      { id: 'g3', mota: 'EDO', x: 370, y: 175, sar: ['g1', 'g2'] }
    ],
    irteerak: [{ izena: 'Q', src: 'g3' }],
    adierazpenak: [`Q = A · ${ezH('B')} + ${ezH('A')} · B`]
  },
  demorgan: {
    izena: 'De Morgan-en legea', maila: 3, w: 620, h: 280,
    azalpena: 'Bi zirkuitu desberdin, beti irteera berarekin: EZ-ETA ate bat eta sarrera ezeztatuen EDO bat baliokideak dira.',
    etiketak: { A: 'A', B: 'B' },
    sarrerak: ['A', 'B'], ezeztuak: ['A', 'B'],
    ateak: [{ id: 'g1', mota: 'EZETA', x: 220, y: 140, sar: ['A', 'B'] }, { id: 'g2', mota: 'EDO', x: 220, y: 225, sar: ['A!', 'B!'] }],
    irteerak: [{ izena: 'Q₁', src: 'g1' }, { izena: 'Q₂', src: 'g2' }],
    adierazpenak: [`Q₁ = ${ezH('A · B')}`, `Q₂ = ${ezH('A')} + ${ezH('B')}`]
  }
};

const ATE_INFO = {
  EZ: { adierazpena: `Q = ${ezH('A')}`, baliokidea: 'Irteera sarreraren aurkakoa da. Etengailu normalki itxi bat bezala: sakatzean, argia itzali.' },
  ETA: { adierazpena: 'Q = A · B', baliokidea: 'Bi sarrerak 1 direnean bakarrik da 1. Bi etengailu seriean bezala.' },
  EDO: { adierazpena: 'Q = A + B', baliokidea: 'Sarreraren bat 1 bada, 1 da. Bi etengailu paraleloan bezala.' },
  EZETA: { adierazpena: `Q = ${ezH('A · B')}`, baliokidea: 'ETA baten aurkakoa: bi sarrerak 1 direnean bakarrik da 0.' },
  EZEDO: { adierazpena: `Q = ${ezH('A + B')}`, baliokidea: 'EDO baten aurkakoa: bi sarrerak 0 direnean bakarrik da 1.' },
  EDOB: { adierazpena: 'Q = A ⊕ B', baliokidea: 'EDO esklusiboa: sarrerak desberdinak direnean da 1. Eskailerako etengailu konmutatuak bezala.' }
};

function ateZirkuitua(mota) {
  const n = ATEAK[mota].n;
  return {
    w: 420, h: 190, etiketak: false,
    sarrerak: n === 1 ? ['A'] : ['A', 'B'],
    ateak: [{ id: 'g', mota, x: n === 1 ? 150 : 170, y: 124, sar: n === 1 ? ['A'] : ['A', 'B'] }],
    irteerak: [{ izena: 'Q', src: 'g' }]
  };
}

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  const P = 'lg' + Math.random().toString(36).slice(2, 7);
  const zIds = Object.keys(ZIRKUITUAK).filter(k => ZIRKUITUAK[k].maila <= Math.max(maila, 2));
  let modua = opts.modua === 'zirkuituak' ? 'zirkuituak' : 'ateak';
  let mota = 'ETA', zid = zIds.includes(opts.zirkuitua) ? opts.zirkuitua : zIds[0];
  let sarrerak = {};

  box.innerHTML = `
    <div class="sim lgs">
      <div class="sim-body">
        <div class="sim-stage" id="${P}-stage"></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Modua">
            <button data-modua="ateak">Ate bakarra</button><button data-modua="zirkuituak">Zirkuituak</button>
          </div>
          <div id="${P}-ateak" class="lg-ateak" role="group" aria-label="Atea">
            ${Object.entries(ATEAK).map(([k, a]) => `<button class="btn sm" data-atea="${k}" aria-pressed="false">${a.izena}<small>${a.en}</small></button>`).join('')}
          </div>
          <label class="fd-hautatu" id="${P}-zl" for="${P}-z">Zirkuitua
            <select id="${P}-z">${zIds.map(k => `<option value="${k}" ${k === zid ? 'selected' : ''}>${esc(ZIRKUITUAK[k].izena)}</option>`).join('')}</select>
          </label>
          <p class="lab-hint" id="${P}-desk"></p>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <div>
            <h4 class="fd-h">Egia-taula</h4>
            <div class="table-scroll lg-taula-w"><table class="lg-taula" id="${P}-taula"></table></div>
          </div>
        </div>
      </div>
      <div class="sim-foot"><span>Sakatu sarreren laukiak (0/1) edo egia-taulako errenkada bat.</span><span>1 = tentsioa (egia) · 0 = tentsiorik ez (gezurra)</span></div>
    </div>`;

  const $ = s => box.querySelector(s);

  function Z() { return modua === 'ateak' ? ateZirkuitua(mota) : ZIRKUITUAK[zid]; }

  function marraztu() {
    const z = Z();
    z.sarrerak.forEach(s => { sarrerak[s] = !!sarrerak[s]; });
    const bal = ebaluatu(z, sarrerak);
    $(`#${P}-stage`).innerHTML = zirkuituaSVG(z, bal, { izenburua: modua === 'ateak' ? `${ATEAK[mota].izena} atea` : z.izena, etiketak: z.etiketak || {} });

    box.querySelectorAll('[data-modua]').forEach(b => { b.classList.toggle('active', b.dataset.modua === modua); b.setAttribute('aria-pressed', String(b.dataset.modua === modua)); });
    $(`#${P}-ateak`).hidden = modua !== 'ateak';
    $(`#${P}-zl`).hidden = modua !== 'zirkuituak';
    box.querySelectorAll('[data-atea]').forEach(b => { const on = b.dataset.atea === mota; b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });

    const irt = z.irteerak.map(o => o.izena);
    if (modua === 'ateak') {
      const I = ATE_INFO[mota];
      $(`#${P}-desk`).textContent = I.baliokidea;
      $(`#${P}-read`).innerHTML = `<div><span>Adierazpena</span><b>${I.adierazpena}</b></div>
        <div class="hi"><span>Irteera</span><b>Q = ${bal['Q:Q'] ? 1 : 0}</b></div>`;
    } else {
      $(`#${P}-desk`).textContent = z.azalpena;
      $(`#${P}-read`).innerHTML = `${z.sarrerak.map(s => `<div><span>${esc(z.etiketak[s])}</span><b>${sarrerak[s] ? 1 : 0}</b></div>`).join('')}
        ${z.adierazpenak.map((a, i) => `<div class="hi"><span>${a}</span><b>${esc(irt[i])} = ${bal['Q:' + irt[i]] ? 1 : 0}</b></div>`).join('')}`;
    }

    const lerroak = konbinazioak(z.sarrerak);
    const unekoa = lerroak.findIndex(r => z.sarrerak.every(s => r[s] === sarrerak[s]));
    $(`#${P}-taula`).innerHTML = `<thead><tr>${z.sarrerak.map(s => `<th>${esc(s)}</th>`).join('')}${irt.map(o => `<th class="q">${esc(o)}</th>`).join('')}</tr></thead>
      <tbody>${lerroak.map((r, k) => {
        const b = ebaluatu(z, r);
        return `<tr data-k="${k}" tabindex="0" class="${k === unekoa ? 'on' : ''}" aria-label="Errenkada ${k + 1}">${z.sarrerak.map(s => `<td>${r[s] ? 1 : 0}</td>`).join('')}${irt.map(o => `<td class="q${b['Q:' + o] ? ' bat' : ''}">${b['Q:' + o] ? 1 : 0}</td>`).join('')}</tr>`;
      }).join('')}</tbody>`;
  }

  function aldatu(s) { sarrerak[s] = !sarrerak[s]; marraztu(); box.querySelector(`[data-in="${s}"]`)?.focus({ preventScroll: true }); }

  box.addEventListener('click', e => {
    const inp = e.target.closest('[data-in]');
    if (inp) { aldatu(inp.dataset.in); return; }
    const tr = e.target.closest('tr[data-k]');
    if (tr) {
      const r = konbinazioak(Z().sarrerak)[+tr.dataset.k];
      sarrerak = { ...sarrerak, ...r };
      marraztu();
      box.querySelector(`tr[data-k="${tr.dataset.k}"]`)?.focus({ preventScroll: true });
    }
  });
  box.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('[data-in], tr[data-k]');
    if (!t) return;
    e.preventDefault();
    t.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  box.querySelectorAll('[data-modua]').forEach(b => b.addEventListener('click', () => { modua = b.dataset.modua; marraztu(); }));
  box.querySelectorAll('[data-atea]').forEach(b => b.addEventListener('click', () => { mota = b.dataset.atea; marraztu(); }));
  $(`#${P}-z`).addEventListener('change', e => { zid = e.target.value; sarrerak = {}; marraztu(); });

  marraztu();
}
