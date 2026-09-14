// Zirkuitu mistoak urratsez urrats: taldeak sinplifikatu, pilaren korrontea kalkulatu eta atzera itzuli
import { fmt, slider, fmtA, fmtV, fmtP, esc } from '../util.js';
import { R, Sr, Pr, baliokidea, ebatzi, eskemaSVG, murrizketa, formula } from '../eskema.js';
import { mistoa } from '../ariketak.js';

const ZIRKUITUAK = {
  A: () => Sr(R('R1', 10), Pr(R('R2', 30), R('R3', 60))),
  B: () => Sr(Pr(R('R1', 20), R('R2', 20)), Pr(R('R3', 12), R('R4', 6))),
  C: () => Sr(R('R1', 2), Pr(R('R2', 12), Sr(R('R3', 4), R('R4', 2))))
};

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  let tree = ZIRKUITUAK.A(), states = [], k = 0;

  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage stack-stage">
          <div id="mu-svg"></div>
          <p class="murr-text" id="mu-text" aria-live="polite" style="padding:4px 8px 8px"></p>
        </div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Zirkuitua">
            ${Object.keys(ZIRKUITUAK).map(id => `<button data-z="${id}" class="${id === 'A' ? 'active' : ''}">${id}</button>`).join('')}
            <button data-z="X">Ausazkoa</button>
          </div>
          <div id="mu-ctl"></div>
          <div class="pills">
            <button class="btn sm" id="mu-prev">← Aurrekoa</button>
            <button class="btn sm primary" id="mu-next">Hurrengo urratsa →</button>
            <button class="btn sm ghost" id="mu-reset">Hasieratik</button>
          </div>
          <ol class="murr-steps" id="mu-list"></ol>
          <div class="readouts" id="mu-read"></div>
        </div>
      </div>
      <div class="sim-foot"><span id="mu-formula"></span><span id="mu-k"></span></div>
    </div>`;

  const $ = s => box.querySelector(s);
  const sE = slider($('#mu-ctl'), { id: 'mu-e', label: 'Pilaren tentsioa', min: 3, max: 24, step: 1, value: 12, unit: 'V', format: v => fmt(v, 0) });

  function build() {
    const E = sE.value;
    const steps = murrizketa(tree);
    const Rb = baliokidea(tree), I = E / Rb;
    states = [];
    states.push({ tree, nab: steps[0] ? hostoIzenak(steps[0].taldea) : null, text: `Hasierako zirkuitua: <b>${esc(formula(tree))}</b>. Bilatu barruan dagoen talde sinple bat: seriean edo paraleloan dauden erresistentziak (nabarmenduta).`, list: -1 });
    steps.forEach((s, i) => {
      const next = steps[i + 1];
      const mota = s.taldea.t === 'S' ? 'seriean daude: batu egiten dira' : 'paraleloan daude: alderantzizkoak batu';
      states.push({ tree: s.zuhaitza, nab: next ? hostoIzenak(next.taldea) : null, text: `${s.taldea.ume.map(u => u.izena).join(' eta ')} ${mota}. <b>${esc(s.izena)} = ${fmt(baliokidea(s.taldea))} Ω</b>.`, list: i });
    });
    states.push({ tree: steps.length ? steps[steps.length - 1].zuhaitza : tree, text: `Erresistentzia bakarra geratu da: <b>Rb = ${fmt(Rb)} Ω</b>. Ohm-en legea: <b>I = E / Rb = ${fmt(E)} / ${fmt(Rb)} = ${fmt(I, 3)} A</b>.`, list: steps.length, final: true });
    const sol = ebatzi(tree, E);
    states.push({ tree, emaitzak: sol, text: `Orain atzera: pilaren korrontearekin talde bakoitzaren tentsioa (V = I · R) eta adar bakoitzeko korrontea kalkulatzen dira. Seriean korronte bera; paraleloan tentsio bera.`, list: steps.length + 1, sol });
    $('#mu-list').innerHTML = steps.map(s => `<li>${esc(s.testua)}</li>`).join('') + `<li>I = E / Rb = ${fmt(I, 3)} A</li><li>Atzera: V eta I osagai bakoitzean</li>`;
    $('#mu-formula').textContent = formula(tree);
    k = Math.min(k, states.length - 1);
    show();
  }
  const hostoIzenak = g => g.ume.map(u => u.izena);

  function show() {
    const s = states[k], E = sE.value;
    $('#mu-svg').innerHTML = eskemaSVG(s.tree, { E, nabarmendu: s.nab, emaitzak: s.emaitzak });
    $('#mu-text').innerHTML = s.text;
    $('#mu-list').querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', i <= s.list));
    $('#mu-prev').disabled = k === 0;
    $('#mu-next').disabled = k === states.length - 1;
    $('#mu-k').textContent = `${k + 1} / ${states.length}`;
    const Rb = baliokidea(tree), I = E / Rb;
    let rows = [['Erresistentzia baliokidea', `${fmt(Rb)} Ω`]];
    if (k >= states.length - 2) rows.push(['Pilaren korrontea', fmtA(I)], ['Potentzia guztira', fmtP(E * I)]);
    if (s.sol) rows = rows.concat(Object.entries(s.sol).map(([n, v]) => [`${n} (${fmt(v.R)} Ω)`, `${fmtV(v.V)} · ${fmtA(v.I)}`]));
    $('#mu-read').innerHTML = rows.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  }

  box.querySelectorAll('[data-z]').forEach(bt => bt.addEventListener('click', () => {
    box.querySelectorAll('[data-z]').forEach(x => x.classList.toggle('active', x === bt));
    tree = bt.dataset.z === 'X' ? mistoa(Math.max(2, Math.min(3, maila + 1))) : ZIRKUITUAK[bt.dataset.z]();
    k = 0;
    build();
  }));
  $('#mu-prev').addEventListener('click', () => { if (k > 0) { k--; show(); } });
  $('#mu-next').addEventListener('click', () => { if (k < states.length - 1) { k++; show(); } });
  $('#mu-reset').addEventListener('click', () => { k = 0; show(); });
  sE.on(build);
  build();
}
