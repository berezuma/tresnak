// Etxeko kontsumoa: aparailuak piztu, potentzia kontratatua, kontagailua, kWh eta faktura
import { fmt, slider, esc, reducedMotion } from '../util.js';

const APARAILUAK = [
  ['led', 'LED bonbillak (5 × 9 W)', 45, 5, true],
  ['hozkailua', 'Hozkailua (batez beste)', 60, 24, true],
  ['telebista', 'Telebista', 100, 3, true],
  ['ordenagailua', 'Ordenagailua', 200, 4, false],
  ['garbigailua', 'Garbigailua', 2000, 1, false],
  ['mikrouhina', 'Mikrouhin-labea', 900, 0.25, false],
  ['labea', 'Labea', 2200, 0.5, false],
  ['lehorgailua', 'Ile-lehorgailua', 1500, 0.25, false],
  ['berogailua', 'Berogailu elektrikoa', 2000, 3, false],
  ['termoa', 'Ur-berogailu elektrikoa', 1500, 2, false]
];
const KONTRATUAK = [3.45, 4.6, 5.75];

export default function mount(box, opts = {}) {
  const maila = opts.maila || 1;
  const st = Object.fromEntries(APARAILUAK.map(([id, , P, h, on]) => [id, { on, h, P }]));
  let kontratua = 4.6, kWh = 0, angle = 0;

  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage" style="align-items:start"><svg viewBox="0 0 600 400" role="img" aria-label="Kontagailua, potentzia-neurgailua eta aparailuen hileko kontsumoa"></svg></div>
        <div class="sim-panel">
          <div class="etxe-list" role="group" aria-label="Aparailuak">
            ${APARAILUAK.map(([id, izena, P]) => `<div class="etxe-row">
              <label for="et-${id}"><input type="checkbox" id="et-${id}" ${st[id].on ? 'checked' : ''}> ${esc(izena)} <span class="w">${P} W</span></label>
              <span class="h"><input type="number" id="et-h-${id}" min="0" max="24" step="0.25" value="${st[id].h}" aria-label="${esc(izena)}: ordu egunean"> h/egun</span>
            </div>`).join('')}
          </div>
          <div class="ctl"><div class="ctl-top"><span id="et-kl">Potentzia kontratatua</span></div>
            <div class="seg" role="group" aria-labelledby="et-kl">${KONTRATUAK.map(k => `<button data-k="${k}" class="${k === kontratua ? 'active' : ''}">${fmt(k, 2)} kW</button>`).join('')}</div></div>
          <div id="et-ctl"></div>
          <div class="readouts" aria-live="polite">
            <div class="hi"><span>Potentzia une honetan</span><b id="et-p"></b></div>
            <div><span>Korrontea (230 V)</span><b id="et-i"></b></div>
            <div><span>Energia egunean</span><b id="et-ed"></b></div>
            <div><span>Energia hilean (30 egun)</span><b id="et-em"></b></div>
            <div class="hi"><span>Hileko kostua</span><b id="et-k"></b></div>
            ${maila >= 3 ? `<div><span>Linean galdua (Joule, 40 m · 2,5 mm² Cu)</span><b id="et-j"></b></div>` : ''}
          </div>
        </div>
      </div>
      <div class="sim-foot"><span>Kontagailuak denbora azkartuan neurtzen du: segundo 1 = ordu 1.</span><span>P = V · I · E = P · t</span></div>
    </div>`;

  const $ = s => box.querySelector(s);
  const svg = box.querySelector('svg');
  const sPrice = slider($('#et-ctl'), { id: 'et-price', label: 'Argindarraren prezioa', min: 0.1, max: 0.35, step: 0.01, value: 0.2, unit: '€/kWh', format: v => fmt(v, 2) });

  svg.innerHTML = `
    <g font-family="Lato, system-ui, sans-serif">
      <rect x="20" y="16" width="200" height="140" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
      <text x="120" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink2)">KONTAGAILUA</text>
      <rect x="40" y="48" width="160" height="34" fill="var(--paper)" stroke="var(--ink3)"/>
      <text id="et-count" x="120" y="72" text-anchor="middle" font-size="21" font-family="var(--font-code), monospace" fill="var(--ink)"></text>
      <ellipse cx="120" cy="118" rx="62" ry="14" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
      <line id="et-mark" x1="120" y1="104" x2="120" y2="132" stroke="var(--danger)" stroke-width="5"/>
      <text x="250" y="38" font-size="15" font-weight="700" fill="var(--ink)">Potentzia une honetan</text>
      <rect x="250" y="50" width="320" height="30" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
      <rect id="et-bar" x="250" y="50" width="0" height="30"/>
      <line id="et-lim" y1="42" y2="88" stroke="var(--danger)" stroke-width="3"/>
      <text id="et-limt" y="104" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--danger)"></text>
      <text id="et-warn" x="250" y="140" font-size="14" font-weight="700" fill="var(--danger)"></text>
      <text x="20" y="190" font-size="15" font-weight="700" fill="var(--ink)">Hileko energia aparailuka (kWh)</text>
      <g id="et-bars"></g>
    </g>`;

  const total = () => APARAILUAK.reduce((s, [id]) => s + (st[id].on ? st[id].P : 0), 0);
  const eguna = () => APARAILUAK.reduce((s, [id]) => s + (st[id].on ? st[id].P / 1000 * st[id].h : 0), 0);

  function draw() {
    const P = total(), I = P / 230, Ed = eguna(), Em = Ed * 30, K = Em * sPrice.value;
    const scaleMax = Math.max(KONTRATUAK[KONTRATUAK.length - 1] * 1.25, P / 1000 * 1.05);
    const bw = 320 * Math.min(1, P / 1000 / scaleMax);
    const over = P / 1000 > kontratua;
    const bar = svg.querySelector('#et-bar');
    bar.setAttribute('width', bw);
    bar.setAttribute('style', `fill:${over ? 'var(--danger)' : 'var(--s2)'}`);
    const lx = 250 + 320 * kontratua / scaleMax;
    const lim = svg.querySelector('#et-lim');
    lim.setAttribute('x1', lx); lim.setAttribute('x2', lx);
    const lt = svg.querySelector('#et-limt');
    lt.setAttribute('x', Math.min(lx, 540)); lt.textContent = `kontratatua: ${fmt(kontratua, 2)} kW`;
    svg.querySelector('#et-warn').textContent = over ? 'Gehiegi! IKPak argia moztuko luke.' : '';

    const rows = APARAILUAK.filter(([id]) => st[id].on).map(([id, izena]) => [izena, st[id].P / 1000 * st[id].h * 30]).sort((a, b) => b[1] - a[1]);
    const maxE = Math.max(10, ...rows.map(r => r[1]));
    svg.querySelector('#et-bars').innerHTML = rows.map(([izena, e], i) => {
      const y = 204 + i * 19;
      return `<text x="20" y="${y + 13}" font-size="13" fill="var(--ink2)">${esc(izena.replace(/ \(.*\)/, ''))}</text>
        <rect x="200" y="${y + 2}" width="${Math.max(1, 300 * e / maxE)}" height="13" style="fill:color-mix(in srgb, var(--s1) 70%, var(--sheet))"/>
        <text x="${206 + 300 * e / maxE}" y="${y + 13}" font-size="12.5" font-weight="700" fill="var(--ink)">${fmt(e, 1)}</text>`;
    }).join('') || `<text x="20" y="220" font-size="13.5" fill="var(--ink3)">Ez dago aparailurik piztuta.</text>`;

    $('#et-p').textContent = P >= 1000 ? `${fmt(P / 1000, 2)} kW` : `${fmt(P, 0)} W`;
    $('#et-i').textContent = `${fmt(I, 2)} A`;
    $('#et-ed').textContent = `${fmt(Ed, 2)} kWh`;
    $('#et-em').textContent = `${fmt(Em, 1)} kWh`;
    $('#et-k').textContent = `${fmt(K, 2)} €`;
    if (maila >= 3) {
      const Rl = 0.0172 * 40 / 2.5;
      $('#et-j').textContent = `${fmt(I * I * Rl, 1)} W`;
    }
  }

  APARAILUAK.forEach(([id]) => {
    $(`#et-${id}`).addEventListener('change', e => { st[id].on = e.target.checked; draw(); });
    $(`#et-h-${id}`).addEventListener('input', e => { const v = parseFloat(e.target.value); if (isFinite(v)) { st[id].h = Math.min(24, Math.max(0, v)); draw(); } });
  });
  box.querySelectorAll('[data-k]').forEach(bt => bt.addEventListener('click', () => {
    kontratua = +bt.dataset.k;
    box.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('active', x === bt));
    draw();
  }));
  sPrice.on(draw);
  draw();

  let raf = 0, last = 0;
  const count = svg.querySelector('#et-count'), mark = svg.querySelector('#et-mark');
  const tick = ts => {
    const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
    last = ts;
    const P = total();
    kWh += P / 1000 * dt;                 // 1 s = 1 h
    count.textContent = kWh.toFixed(2).padStart(7, '0').replace('.', ',') + ' kWh';
    if (!reducedMotion()) {
      angle += dt * P / 150;              // diskoaren abiadura ∝ potentzia
      const x = 120 + 58 * Math.sin(angle);
      mark.setAttribute('x1', x); mark.setAttribute('x2', x);
      mark.setAttribute('visibility', Math.cos(angle) > 0 ? 'visible' : 'hidden');
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
