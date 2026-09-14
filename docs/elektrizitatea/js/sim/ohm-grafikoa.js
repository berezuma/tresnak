// Ohm-en legea: tentsioa aldatu, amperimetroa eta voltimetroa irakurri, neurketak gorde eta I–V grafikoa marraztu
import { fmt, svgEl, slider, fmtA, fmtR, reducedMotion } from '../util.js';

const VMAX = 12, IMAX = 1.2;
// Bonbilla (harizpia beroa): I = In · (V / Vn)^0,55 — 12 V-ra 1 A
const bonbillaI = V => V <= 0 ? 0 : Math.pow(V / 12, 0.55);

export default function mount(box, opts = {}) {
  const maila = opts.maila || 1;
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage stack-stage">
          <svg id="og-circ" viewBox="0 0 600 190" role="img" aria-label="Zirkuitua: pila, amperimetroa, osagaia eta voltimetroa"></svg>
          <svg id="og-graph" viewBox="0 0 600 330" role="img" aria-label="Intentsitatearen grafikoa tentsioaren arabera"></svg>
        </div>
        <div class="sim-panel">
          ${maila >= 2 ? `<div class="seg" role="group" aria-label="Osagaia"><button data-o="R" class="active" aria-pressed="true">Erresistentzia</button><button data-o="L" aria-pressed="false">Bonbilla</button></div>` : ''}
          <div id="og-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Voltimetroa, V</span><b id="og-v"></b></div>
            <div><span>Amperimetroa, I</span><b id="og-i"></b></div>
            <div class="hi"><span>V / I</span><b id="og-r"></b></div>
          </div>
          <div class="pills"><button class="btn sm primary" id="og-save">Gorde neurketa</button><button class="btn sm ghost" id="og-clear">Garbitu</button></div>
          <div class="table-scroll" style="max-height:180px;overflow-y:auto">
            <table class="table-mini"><thead><tr><th>#</th><th>Osagaia</th><th>V (V)</th><th>I (A)</th><th>V / I (Ω)</th></tr></thead><tbody id="og-tb"></tbody></table>
          </div>
        </div>
      </div>
      <div class="sim-foot"><span>Aldatu tentsioa eta gorde hainbat neurketa: puntuak lerro zuzen batean daude?</span><span>${maila >= 2 ? 'Malda = 1 / R' : 'V = I · R'}</span></div>
    </div>`;

  const $ = s => box.querySelector(s);
  const ctl = $('#og-ctl');
  let osagaia = 'R';
  const sV = slider(ctl, { id: 'og-sv', label: 'Pilaren tentsioa', min: 0, max: VMAX, step: 0.5, value: 6, unit: 'V', format: v => fmt(v, 1) });
  const sR = slider(ctl, { id: 'og-sr', label: 'Erresistentzia', min: 10, max: 100, step: 1, value: 20, unit: 'Ω', format: v => fmt(v, 0) });
  const puntuak = [];

  // ---------- zirkuitua ----------
  const circ = $('#og-circ');
  circ.innerHTML = `
    <g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M70 83 V40 H184 M216 40 H430 V70 M430 120 V150 H70 V107"/>
      <path d="M430 40 H530 V73 M530 117 V150 H430"/>
    </g>
    <line x1="52" y1="83" x2="88" y2="83" stroke="var(--ink)" stroke-width="2.5"/>
    <line x1="61" y1="95" x2="79" y2="95" stroke="var(--ink)" stroke-width="6"/>
    <line x1="70" y1="95" x2="70" y2="107" stroke="var(--ink)" stroke-width="2.5"/>
    <text x="94" y="80" font-size="14" font-weight="700" fill="var(--s4)" font-family="Lato, system-ui, sans-serif">+</text>
    <text id="og-bat" x="40" y="93" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)" font-family="Lato, system-ui, sans-serif"></text>
    <circle cx="200" cy="40" r="16" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <text x="200" y="45" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)" font-family="Lato, system-ui, sans-serif">A</text>
    <text id="og-at" x="200" y="15" text-anchor="middle" font-size="15" font-weight="700" fill="var(--s1)" font-family="Lato, system-ui, sans-serif"></text>
    <g id="og-dots"></g>
    <g id="og-comp"></g>
    <circle cx="530" cy="95" r="22" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <text x="530" y="101" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)" font-family="Lato, system-ui, sans-serif">V</text>
    <text id="og-vt" x="530" y="178" text-anchor="middle" font-size="15" font-weight="700" fill="var(--s1)" font-family="Lato, system-ui, sans-serif"></text>`;
  const comp = circ.querySelector('#og-comp'), dotsG = circ.querySelector('#og-dots');

  // korrontearen puntuak begizta nagusian (erlojuaren orratzen noranzkoan: + bornatik)
  const loop = [[70, 83], [70, 40], [430, 40], [430, 150], [70, 150], [70, 107]];
  const segs = loop.slice(1).map((p, i) => ({ a: loop[i], b: p, l: Math.hypot(p[0] - loop[i][0], p[1] - loop[i][1]) }));
  const total = segs.reduce((s, g) => s + g.l, 0);
  const NDOT = 22;
  const dots = Array.from({ length: NDOT }, () => svgEl('circle', { r: 3.2, fill: 'var(--s1)' }, dotsG));
  let phase = 0;
  function placeDots() {
    dots.forEach((d, i) => {
      let s = ((phase + i * total / NDOT) % total + total) % total;
      let g = segs[0];
      for (const seg of segs) { if (s <= seg.l) { g = seg; break; } s -= seg.l; }
      const t = s / g.l;
      const x = g.a[0] + (g.b[0] - g.a[0]) * t, y = g.a[1] + (g.b[1] - g.a[1]) * t;
      const hidden = (Math.abs(x - 200) < 18 && Math.abs(y - 40) < 5) || (Math.abs(x - 430) < 5 && y > 70 && y < 120);
      d.setAttribute('cx', x); d.setAttribute('cy', y);
      d.setAttribute('visibility', hidden ? 'hidden' : 'visible');
    });
  }

  // ---------- grafikoa ----------
  const graph = $('#og-graph');
  const X0 = 64, X1 = 580, Y0 = 290, Y1 = 22;
  const gx = V => X0 + V / VMAX * (X1 - X0), gy = I => Y0 - I / IMAX * (Y0 - Y1);
  let grid = '';
  for (let v = 0; v <= VMAX; v += 2) grid += `<line x1="${gx(v)}" y1="${Y1}" x2="${gx(v)}" y2="${Y0}" stroke="var(--rule)"/><text x="${gx(v)}" y="${Y0 + 18}" text-anchor="middle" font-size="12.5" fill="var(--ink2)">${v}</text>`;
  for (let i = 0; i <= 6; i++) { const I = i * 0.2; grid += `<line x1="${X0}" y1="${gy(I)}" x2="${X1}" y2="${gy(I)}" stroke="var(--rule)"/><text x="${X0 - 8}" y="${gy(I) + 4}" text-anchor="end" font-size="12.5" fill="var(--ink2)">${fmt(I, 1)}</text>`; }
  graph.innerHTML = `<g font-family="Lato, system-ui, sans-serif">${grid}
    <line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" stroke="var(--ink)" stroke-width="1.5"/><line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="${X1}" y="${Y0 + 36}" text-anchor="end" font-size="13.5" font-weight="700" fill="var(--ink)">Tentsioa, V (V)</text>
    <text x="16" y="${Y1 - 6}" font-size="13.5" font-weight="700" fill="var(--ink)">I (A)</text></g>
    <g id="og-lines"></g><g id="og-pts"></g><circle id="og-now" r="7" fill="var(--sheet)" stroke="var(--s4)" stroke-width="3"/>`;
  const linesG = graph.querySelector('#og-lines'), ptsG = graph.querySelector('#og-pts'), now = graph.querySelector('#og-now');

  const current = () => osagaia === 'R' ? sV.value / sR.value : bonbillaI(sV.value);

  function draw() {
    const V = sV.value, I = current();
    sR.wrap.hidden = osagaia !== 'R';
    // zirkuitua
    circ.querySelector('#og-bat').textContent = `${fmt(V, 1)} V`;
    circ.querySelector('#og-at').textContent = fmtA(I);
    circ.querySelector('#og-vt').textContent = `${fmt(V, 1)} V`;
    if (osagaia === 'R') {
      comp.innerHTML = `<rect x="422" y="70" width="16" height="50" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
        <text x="452" y="100" font-size="14" font-weight="700" fill="var(--ink)" font-family="Lato, system-ui, sans-serif">${fmt(sR.value, 0)} Ω</text>`;
    } else {
      const k = Math.min(1, I * I * 12 / 12);
      comp.innerHTML = `${k > 0.02 ? `<circle cx="430" cy="95" r="${18 + 16 * k}" style="fill:var(--s2)" opacity="${0.12 + 0.3 * k}"/>` : ''}
        <line x1="430" y1="70" x2="430" y2="80" stroke="var(--ink)" stroke-width="2.5"/><line x1="430" y1="110" x2="430" y2="120" stroke="var(--ink)" stroke-width="2.5"/>
        <circle cx="430" cy="95" r="15" style="fill:color-mix(in srgb, var(--s2) ${Math.round(k * 85)}%, var(--sheet))" stroke="var(--ink)" stroke-width="2.5"/>
        <path d="M419.4 84.4 L440.6 105.6 M440.6 84.4 L419.4 105.6" stroke="var(--ink)" stroke-width="2"/>
        <text x="452" y="100" font-size="14" font-weight="700" fill="var(--ink)" font-family="Lato, system-ui, sans-serif">12 V · 12 W</text>`;
    }
    // grafikoa
    let ls = '';
    if (osagaia === 'R') {
      const Vend = Math.min(VMAX, IMAX * sR.value);
      ls += `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(Vend)}" y2="${gy(Vend / sR.value)}" stroke="var(--s1)" stroke-width="2" stroke-dasharray="6 5"/>`;
      ls += `<text x="${gx(Vend) - 6}" y="${gy(Vend / sR.value) + (Vend < VMAX ? 18 : -8)}" text-anchor="end" font-size="13" font-weight="700" fill="var(--s1)" font-family="Lato, system-ui, sans-serif">R = ${fmt(sR.value, 0)} Ω</text>`;
    } else {
      const pts = [];
      for (let v = 0; v <= VMAX + 1e-9; v += 0.25) pts.push(`${gx(v)},${gy(bonbillaI(v))}`);
      ls += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--s2)" stroke-width="2.5" stroke-dasharray="6 5"/>`;
      ls += `<text x="${gx(VMAX) - 6}" y="${gy(1) + 20}" text-anchor="end" font-size="13" font-weight="700" fill="var(--ink2)" font-family="Lato, system-ui, sans-serif">bonbilla: ez da lerro zuzena</text>`;
    }
    linesG.innerHTML = ls;
    ptsG.innerHTML = puntuak.map(p => `<circle cx="${gx(p.V)}" cy="${gy(Math.min(p.I, IMAX))}" r="5" fill="${p.o === 'R' ? 'var(--s1)' : 'var(--s2)'}" stroke="var(--ink)" stroke-width="1"/>`).join('');
    now.setAttribute('cx', gx(V));
    now.setAttribute('cy', gy(Math.min(I, IMAX)));
    // irakurketak
    $('#og-v').textContent = `${fmt(V, 1)} V`;
    $('#og-i').textContent = fmtA(I);
    $('#og-r').textContent = I > 1e-9 ? fmtR(V / I) : '—';
  }

  function table() {
    $('#og-tb').innerHTML = puntuak.map((p, i) => `<tr><td>${i + 1}</td><td>${p.o === 'R' ? `R ${fmt(p.R, 0)} Ω` : 'bonbilla'}</td><td>${fmt(p.V, 1)}</td><td>${fmt(p.I, 3)}</td><td>${p.I > 0 ? fmt(p.V / p.I, 1) : '—'}</td></tr>`).join('')
      || `<tr><td colspan="5" style="text-align:left;color:var(--ink3)">Oraindik ez duzu neurketarik gorde.</td></tr>`;
  }

  sV.on(draw);
  sR.on(draw);
  box.querySelectorAll('[data-o]').forEach(bt => bt.addEventListener('click', () => {
    osagaia = bt.dataset.o;
    box.querySelectorAll('[data-o]').forEach(x => { x.classList.toggle('active', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    draw();
  }));
  $('#og-save').addEventListener('click', () => {
    if (puntuak.length >= 30) puntuak.shift();
    puntuak.push({ V: sV.value, I: current(), o: osagaia, R: sR.value });
    table(); draw();
  });
  $('#og-clear').addEventListener('click', () => { puntuak.length = 0; table(); draw(); });

  // hasierako neurketa batzuk, grafikoak zer egiten duen erakusteko
  [2, 4, 6].forEach(V => puntuak.push({ V, I: V / 20, o: 'R', R: 20 }));
  table();
  draw();

  let raf = 0, last = 0;
  const tick = ts => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    if (!reducedMotion()) phase += dt * 160 * Math.sqrt(current() / 0.3);
    placeDots();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
