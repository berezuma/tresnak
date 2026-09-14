// Biela-biradera eta lau aldiko motorra
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';

const W = 600, H = 400, CX = 190, CY = 325, PXCM = 8, SLOW = 50;
const ALDIAK = [
  { izena: 'Sarrera', desk: 'Pistoia jaisten da; sarrera-balbula irekita: nahasketa sartzen da.', gas: 'var(--g1-fill)', in: true, ex: false },
  { izena: 'Konpresioa', desk: 'Pistoia igotzen da; balbulak itxita: nahasketa estutzen da.', gas: 'var(--g3-fill)', in: false, ex: false },
  { izena: 'Leherketa', desk: 'Bujiaren txinparta: gasek pistoia indarrez bultzatzen dute. Lana egiten den aldi bakarra.', gas: 'var(--g2-fill)', in: false, ex: false },
  { izena: 'Ihesa', desk: 'Pistoia igotzen da; ihes-balbula irekita: erretako gasak kanpora.', gas: 'var(--chip)', in: false, ex: true }
];

export default function mount(box, opts = {}) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pistoia, biela eta biradera"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Modua">
            <button data-mode="biela">Biela-biradera</button><button data-mode="motorra">Lau aldiko motorra</button>
          </div>
          <div class="seg" role="group" aria-label="Eragilea" id="mo-drive">
            <button data-d="motorra">Pistoiak eragin (motorra)</button><button data-d="konpresorea">Biraderak eragin (konpresorea)</button>
          </div>
          <div id="mo-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="mo-read"></div>
          <p id="mo-desk" style="margin:0;font-size:15px"></p>
        </div>
      </div>
      <div class="sim-foot"><span>Animazioa ${SLOW} aldiz motelago.</span><button class="btn sm ghost" id="mo-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#mo-ctl');
  let mode = opts.mode || 'biela', drive = 'motorra';
  const sR = slider(ctl, { id: 'mo-r', label: 'Biraderaren besoa, r', min: 2, max: 6, step: 0.5, value: 4, format: v => fmt(v, 1), unit: 'cm', dot: 'r' });
  const sN = slider(ctl, { id: 'mo-n', label: 'Birabarkiaren abiadura', min: 300, max: 3600, step: 60, value: 1200, unit: 'rpm' });
  sR.on(build); sN.on(build);
  box.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => { mode = bt.dataset.mode; build(); }));
  box.querySelectorAll('[data-d]').forEach(bt => bt.addEventListener('click', () => { drive = bt.dataset.d; build(); }));

  let theta = 0, running = !reducedMotion(), last = 0, raf = 0, parts = {};
  const play = box.querySelector('#mo-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  function build() {
    box.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x.dataset.mode === mode));
    box.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('active', x.dataset.d === drive));
    box.querySelector('#mo-drive').hidden = mode !== 'biela';
    const r = sR.value * PXCM, l = 3 * r, pw = 86;
    const topDead = CY - (r + l), botDead = CY - (l - r);
    svg.textContent = '';
    parts = { r, l, pw, topDead };

    // zilindroa
    const cylTop = topDead - 55;   // pistoiaren goialdea (goiko puntu hilean) - ganbera
    svgEl('path', { d: `M${CX - pw / 2 - 8} ${botDead + 40} V${cylTop} H${CX + pw / 2 + 8} V${botDead + 40}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 4 }, svg);
    parts.gas = svgEl('rect', { x: CX - pw / 2, y: cylTop, width: pw, height: 10, fill: 'var(--chip)' }, svg);
    parts.cylTop = cylTop;

    if (mode === 'motorra') {
      // balbulak eta bujia
      parts.vin = svgEl('g', {}, svg);
      svgEl('path', { d: `M${CX - 24} ${cylTop - 34} V${cylTop} M${CX - 38} ${cylTop} H${CX - 10}`, stroke: 'var(--s1)', 'stroke-width': 4, fill: 'none' }, parts.vin);
      parts.vex = svgEl('g', {}, svg);
      svgEl('path', { d: `M${CX + 24} ${cylTop - 34} V${cylTop} M${CX + 10} ${cylTop} H${CX + 38}`, stroke: 'var(--s2)', 'stroke-width': 4, fill: 'none' }, parts.vex);
      svgText(svg, CX - 30, cylTop - 42, 'sarrera', { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--s1)', 'font-weight': 700 });
      svgText(svg, CX + 30, cylTop - 42, 'ihesa', { 'font-size': 12, fill: 'var(--s2-ink)', 'font-weight': 700 });
      svgEl('rect', { x: CX - 4, y: cylTop - 30, width: 8, height: 26, fill: 'var(--ink3)' }, svg);
      parts.spark = svgEl('path', { d: `M${CX} ${cylTop + 2} l-7 10 h9 l-6 12`, stroke: 'var(--s2)', 'stroke-width': 3, fill: 'none', opacity: 0 }, svg);
      // kama-ardatza (erdiko abiaduran)
      const kg = svgEl('g', { transform: `translate(${CX + 150} ${cylTop - 10})` }, svg);
      parts.camshaft = svgEl('g', {}, kg);
      svgEl('path', { d: 'M0 -22 C 14 -22, 18 10, 0 16 C -18 10, -14 -22, 0 -22 Z', fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2 }, parts.camshaft);
      svgEl('circle', { r: 3.5, fill: 'var(--ink)' }, kg);
      svgText(svg, CX + 150, cylTop + 30, 'kama-ardatza', { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink3)' });
      svgText(svg, CX + 150, cylTop + 45, `${fmt(sN.value / 2, 0)} rpm`, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700 });
      // zikloaren adierazlea
      parts.cycle = [];
      ALDIAK.forEach((a, i) => {
        const x = 360, y = 150 + i * 44;
        const g = svgEl('g', {}, svg);
        svgEl('rect', { x, y, width: 200, height: 36, fill: a.gas, stroke: 'var(--rule)', 'stroke-width': 1.5 }, g);
        svgText(g, x + 12, y + 23, `${i + 1}. ${a.izena}`, { 'font-weight': 700, 'font-size': 14 });
        svgText(g, x + 188, y + 23, i % 2 === 0 ? '↓' : '↑', { 'text-anchor': 'end', 'font-size': 16 });
        parts.cycle.push(g.firstChild);
      });
    } else {
      svgText(svg, CX + pw / 2 + 20, topDead - 30, 'pistoia', { 'font-size': 13, 'font-weight': 700, fill: 'var(--s1)' });
      svgText(svg, CX + 60, CY - l / 2 - 10, 'biela', { 'font-size': 13, 'font-weight': 700 });
      svgText(svg, CX - r - 20, CY + r + 26, 'biradera', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: 'var(--s2-ink)' });
      // kurtsoaren neurria
      svgEl('path', { d: `M${CX - pw / 2 - 30} ${topDead - 30} V${botDead - 30}`, stroke: 'var(--ink3)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      svgText(svg, CX - pw / 2 - 36, (topDead + botDead) / 2 - 26, `kurtsoa ${fmt(2 * sR.value, 1)} cm`, { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--ink3)' });
      parts.driveArrow = svgText(svg, 380, 200, '', { 'font-size': 15, 'font-weight': 700 });
    }

    // biradera eta biela
    svgEl('circle', { cx: CX, cy: CY, r: r + 16, fill: 'none', stroke: 'var(--rule)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
    parts.piston = svgEl('g', {}, svg);
    svgEl('rect', { x: CX - pw / 2, y: -30, width: pw, height: 60, fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 2 }, parts.piston);
    svgEl('line', { x1: CX - pw / 2, y1: -18, x2: CX + pw / 2, y2: -18, stroke: 'var(--s1)', 'stroke-width': 1 }, parts.piston);
    parts.rod = svgEl('line', { stroke: 'var(--ink)', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
    parts.crank = svgEl('line', { x1: CX, y1: CY, stroke: 'var(--s2)', 'stroke-width': 12, 'stroke-linecap': 'round' }, svg);
    svgEl('circle', { cx: CX, cy: CY, r: 7, fill: 'var(--ink)' }, svg);
    parts.pin = svgEl('circle', { r: 5, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
    parts.wrist = svgEl('circle', { r: 5, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, svg);

    const ro = (k, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${v}</b></div>`;
    const N = sN.value;
    box.querySelector('#mo-read').innerHTML = mode === 'biela'
      ? ro('Kurtsoa = 2 · r', `${fmt(2 * sR.value, 1)} cm`, true) + ro('Joan-etorriak minutuko', fmt(N, 0)) + ro('Pistoiaren bidea minutuan', `${fmt(4 * sR.value * N / 100, 0)} m`)
      : ro('Kurtsoa = 2 · r', `${fmt(2 * sR.value, 1)} cm`) + ro('Kama-ardatza = N / 2', `${fmt(N / 2, 0)} rpm`, true) + ro('Leherketak minutuko', fmt(N / 2, 0)) + `<div><span>Birabarkiaren birak zikloan</span><b id="mo-turn"></b></div>`;
    draw();
  }

  function draw() {
    if (!parts.piston) return;
    const { r, l, pw } = parts;
    const sx = CX + r * Math.sin(theta), sy = CY - r * Math.cos(theta);
    const py = CY - (r * Math.cos(theta) + Math.sqrt(l * l - (r * Math.sin(theta)) ** 2));
    parts.piston.setAttribute('transform', `translate(0 ${py.toFixed(2)})`);
    parts.crank.setAttribute('x2', sx.toFixed(2)); parts.crank.setAttribute('y2', sy.toFixed(2));
    parts.rod.setAttribute('x1', sx.toFixed(2)); parts.rod.setAttribute('y1', sy.toFixed(2));
    parts.rod.setAttribute('x2', CX); parts.rod.setAttribute('y2', (py + 10).toFixed(2));
    parts.pin.setAttribute('cx', sx.toFixed(2)); parts.pin.setAttribute('cy', sy.toFixed(2));
    parts.wrist.setAttribute('cx', CX); parts.wrist.setAttribute('cy', (py + 10).toFixed(2));
    parts.gas.setAttribute('height', Math.max(0, py - 30 - parts.cylTop).toFixed(2));

    const desk = box.querySelector('#mo-desk');
    if (mode === 'motorra') {
      const cyc = ((theta % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
      const idx = Math.min(3, Math.floor(cyc / Math.PI));
      const a = ALDIAK[idx];
      parts.gas.setAttribute('fill', a.gas);
      parts.vin.setAttribute('transform', `translate(0 ${a.in ? 10 * Math.sin(cyc % Math.PI) : 0})`);
      parts.vex.setAttribute('transform', `translate(0 ${a.ex ? 10 * Math.sin(cyc % Math.PI) : 0})`);
      parts.spark.setAttribute('opacity', idx === 2 && (cyc % Math.PI) < .35 ? 1 : 0);
      parts.camshaft.setAttribute('transform', `rotate(${(theta / 2 * 180 / Math.PI).toFixed(2)})`);
      parts.cycle.forEach((rc, i) => { rc.setAttribute('stroke', i === idx ? 'var(--ink)' : 'var(--rule)'); rc.setAttribute('stroke-width', i === idx ? 3 : 1.5); });
      desk.innerHTML = `<b>${idx + 1}. ${a.izena}.</b> ${a.desk}`;
      const t = box.querySelector('#mo-turn');
      if (t) t.textContent = `${fmt(cyc / (2 * Math.PI), 2)} / 2`;
    } else {
      const down = Math.sin(theta) > 0;
      desk.innerHTML = drive === 'motorra'
        ? `<b>Motorra:</b> pistoiak (lineala) bielaren bidez biradera bultzatzen du, eta ardatzak biratzen du (zirkularra).`
        : `<b>Konpresorea:</b> motorrak biradera biratzen du (zirkularra), eta bielak pistoia mugitzen du (alternatiboa).`;
      parts.driveArrow.textContent = drive === 'motorra' ? (down ? 'Pistoiak bultzatzen du ↓' : 'Pistoia igotzen da ↑') : 'Biraderak eragiten du ↻';
      parts.driveArrow.setAttribute('fill', drive === 'motorra' ? 'var(--s1)' : 'var(--s2-ink)');
    }
  }

  function tick(now) {
    if (running) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      theta += dt * (sN.value / 60) * 2 * Math.PI / SLOW;
      draw();
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }

  build();
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
