// Kamen simulagailua: profila, jarraitzailea eta desplazamenduaren grafikoa
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';

const W = 600, H = 340, CX = 150, CY = 215, PX = 2;   // px/mm
const RMIN = 30;                                       // oinarrizko erradioa, mm
const GX = 300, GY = 60, GW = 270, GH = 150;            // grafikoa

const PROFILES = {
  eszentrikoa: { izena: 'Eszentrikoa', r: (t, k) => { const e = k / 2, Rc = RMIN + e; return e * Math.cos(t) + Math.sqrt(Rc * Rc - e * e * Math.sin(t) ** 2); } },
  obaloa: { izena: 'Obaloa', r: (t, k) => RMIN + k * (1 - Math.cos(2 * t)) / 2 },
  bihotza: { izena: 'Bihotz-forma', r: (t, k) => { const u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return RMIN + k * (u <= Math.PI ? u / Math.PI : (2 * Math.PI - u) / Math.PI); } }
};

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kama bat biraka eta jarraitzailearen desplazamenduaren grafikoa"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Kamaren profila">
            <button data-p="eszentrikoa">Eszentrikoa</button><button data-p="obaloa">Obaloa</button><button data-p="bihotza">Bihotz-forma</button>
          </div>
          <div id="km-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="km-read"></div>
          <p class="dim" id="km-hint" style="margin:0;font-size:14px"></p>
        </div>
      </div>
      <div class="sim-foot"><span>Jarraitzaile zuzena: higidura lineal alternatiboa.</span><button class="btn sm ghost" id="km-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#km-ctl');
  let prof = 'eszentrikoa';
  const sK = slider(ctl, { id: 'km-k', label: 'Kurtsoa', min: 6, max: 30, step: 1, value: 20, unit: 'mm', dot: 'r' });
  const sN = slider(ctl, { id: 'km-n', label: 'Abiadura', min: 5, max: 60, step: 5, value: 20, unit: 'rpm' });
  sK.on(build); sN.on(build);
  box.querySelectorAll('[data-p]').forEach(bt => bt.addEventListener('click', () => { prof = bt.dataset.p; build(); }));

  let phi = 0, running = !reducedMotion(), last = 0, raf = 0, parts = {};
  const play = box.querySelector('#km-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  // jarraitzailearen desplazamendua kamaren biraketaren arabera (goiko ukipen-puntuan)
  const follower = a => PROFILES[prof].r(-Math.PI / 2 - a, sK.value) - RMIN;

  function build() {
    box.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('active', x.dataset.p === prof));
    const k = sK.value;
    svg.textContent = '';
    parts = {};

    // kama (tokiko koordenatuak)
    let d = '';
    for (let i = 0; i <= 240; i++) {
      const t = i / 240 * 2 * Math.PI, rr = PROFILES[prof].r(t, k) * PX;
      d += (i ? 'L' : 'M') + (rr * Math.cos(t)).toFixed(1) + ' ' + (rr * Math.sin(t)).toFixed(1);
    }
    const cg = svgEl('g', { transform: `translate(${CX} ${CY})` }, svg);
    parts.cam = svgEl('g', {}, cg);
    svgEl('path', { d: d + 'Z', fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, parts.cam);
    svgEl('line', { x1: 0, y1: 0, x2: RMIN * PX * .8, y2: 0, stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, parts.cam);
    svgEl('circle', { r: 5, fill: 'var(--ink)' }, cg);

    // gidak
    const topMax = CY - (RMIN + k) * PX;
    svgEl('rect', { x: CX - 24, y: topMax - 80, width: 8, height: 36, fill: 'var(--chip)', stroke: 'var(--ink3)' }, svg);
    svgEl('rect', { x: CX + 16, y: topMax - 80, width: 8, height: 36, fill: 'var(--chip)', stroke: 'var(--ink3)' }, svg);
    parts.rod = svgEl('g', {}, svg);
    svgEl('rect', { x: CX - 8, y: -120, width: 16, height: 120, fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 2 }, parts.rod);
    svgEl('circle', { cx: CX, cy: -6, r: 8, fill: 'var(--sheet)', stroke: 'var(--s1)', 'stroke-width': 2 }, parts.rod);
    parts.base = RMIN * PX;
    svgText(svg, CX, H - 10, PROFILES[prof].izena, { 'text-anchor': 'middle', 'font-weight': 700 });

    // grafikoa
    svgEl('rect', { x: GX, y: GY, width: GW, height: GH, fill: 'var(--sheet)', stroke: 'var(--rule)' }, svg);
    for (let a = 0; a <= 360; a += 90) {
      const x = GX + a / 360 * GW;
      svgEl('line', { x1: x, y1: GY, x2: x, y2: GY + GH, stroke: 'var(--grid)' }, svg);
      svgText(svg, x, GY + GH + 16, `${a}°`, { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink3)' });
    }
    const sy = v => GY + GH - 10 - v / 30 * (GH - 20);
    [0, 10, 20, 30].forEach(v => svgText(svg, GX - 6, sy(v) + 4, `${v}`, { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink3)' }));
    svgText(svg, GX, GY - 10, 'Jarraitzailearen igoera (mm)', { 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)' });
    svgText(svg, GX + GW, GY + GH + 32, 'kamaren biraketa', { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--ink3)' });
    let gd = '';
    for (let i = 0; i <= 180; i++) {
      const a = i / 180 * 2 * Math.PI;
      gd += (i ? 'L' : 'M') + (GX + i / 180 * GW).toFixed(1) + ' ' + sy(follower(a)).toFixed(1);
    }
    svgEl('path', { d: gd, fill: 'none', stroke: 'var(--s1)', 'stroke-width': 2.5 }, svg);
    parts.dot = svgEl('circle', { r: 5, fill: 'var(--s1)', stroke: 'var(--sheet)', 'stroke-width': 2 }, svg);
    parts.sy = sy;

    // irakurketak
    let peaks = 0;
    for (let i = 0; i < 360; i++) { const a = f => follower(f * Math.PI / 180); if (a(i) > a(i - 1) && a(i) >= a(i + 1) && a(i) > k * .9) peaks++; }
    const ro = (kk, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${kk}</span><b>${v}</b></div>`;
    box.querySelector('#km-read').innerHTML =
      ro('Kurtsoa', `${k} mm`) +
      ro('Igoerak bira bakoitzeko', String(peaks), true) +
      ro('Joan-etorriak minutuko', `${fmt(peaks * sN.value, 0)}`) +
      `<div><span>Oraingo igoera</span><b id="km-s"></b></div>`;
    box.querySelector('#km-hint').textContent = {
      eszentrikoa: 'Zirkulu bat, ardatza erditik desplazatuta: igoera eta jaitsiera leunak. Kurtsoa = 2 · eszentrikotasuna.',
      obaloa: 'Bira bakoitzean bi aldiz igo eta jaisten da jarraitzailea.',
      bihotza: 'Abiadura konstantean igo eta jaisten da (grafikoan lerro zuzenak): harilkagailuetan erabiltzen da.'
    }[prof];
    draw();
  }

  function draw() {
    if (!parts.cam) return;
    const s = follower(phi);
    parts.cam.setAttribute('transform', `rotate(${(phi * 180 / Math.PI).toFixed(2)})`);
    parts.rod.setAttribute('transform', `translate(0 ${(CY - parts.base - s * PX).toFixed(2)})`);
    const a = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    parts.dot.setAttribute('cx', (GX + a / (2 * Math.PI) * GW).toFixed(1));
    parts.dot.setAttribute('cy', parts.sy(s).toFixed(1));
    const out = box.querySelector('#km-s');
    if (out) out.textContent = `${fmt(s, 1)} mm`;
  }

  function tick(now) {
    if (running) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      phi += dt * (sN.value / 60) * 2 * Math.PI;
      draw();
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }

  build();
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
