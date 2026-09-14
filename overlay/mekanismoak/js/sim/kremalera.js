// Kremalera-pinoia eta torloju-azkoina: biraketatik higidura linealera
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';
import { gearPath } from './engranajeak.js';

const W = 600, H = 300;

export default function mount(box, opts = {}) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biraketa higidura lineal bihurtzen"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Mekanismoa">
            <button data-mode="kremalera">Kremalera-pinoia</button><button data-mode="torloju">Torloju-azkoina</button>
          </div>
          <div id="kr-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="kr-read"></div>
          <p class="dim" id="kr-hint" style="margin:0;font-size:14px"></p>
        </div>
      </div>
      <div class="sim-foot"><span id="kr-foot"></span><button class="btn sm ghost" id="kr-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#kr-ctl');
  let mode = opts.mode || 'kremalera';
  const sZ = slider(ctl, { id: 'kr-z', label: 'Pinoiaren hortzak, Z', min: 8, max: 30, value: 12, dot: 'f' });
  const sP = slider(ctl, { id: 'kr-p', label: 'Pausoa, p', min: 1, max: 8, step: 0.5, value: 5, format: v => fmt(v, 1), unit: 'mm' });
  const sN = slider(ctl, { id: 'kr-n', label: 'Abiadura, N', min: 5, max: 60, value: 20, unit: 'rpm' });
  [sZ, sP, sN].forEach(s => s.on(() => { phi = 0; build(); }));

  const setMode = m => {
    mode = m;
    box.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x.dataset.mode === mode));
    sZ.input.parentElement.hidden = mode !== 'kremalera';
    phi = 0;
    build();
  };
  box.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => setMode(bt.dataset.mode)));

  let phi = 0, running = !reducedMotion(), last = 0, raf = 0, parts = {};
  const play = box.querySelector('#kr-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  // kremalera eskuz arrastatu: pinoiak biratu egiten du (itzulgarria)
  let drag = null;
  const svgX = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()).x; };
  svg.addEventListener('pointerdown', ev => {
    if (mode !== 'kremalera' || !parts.rackHit || ev.target !== parts.rackHit) return;
    drag = { x: svgX(ev), phi, was: running };
    running = false; setPlay();
    svg.setPointerCapture(ev.pointerId);
  });
  svg.addEventListener('pointermove', ev => {
    if (!drag) return;
    phi = drag.phi - (svgX(ev) - drag.x) / parts.r;
    draw();
  });
  const endDrag = () => { if (drag) { running = drag.was; setPlay(); drag = null; } };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  function build() {
    svg.textContent = '';
    parts = {};
    const p = sP.value, N = sN.value;
    const ro = (k, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${v}</b></div>`;

    if (mode === 'kremalera') {
      const Z = sZ.value, m = Math.min(9, 150 / Z), r = m * Z / 2, cx = 300, cy = 40 + r + m + 20;
      const pp = Math.PI * m, yPitch = cy + r;
      parts.r = r;
      const g = svgEl('g', { transform: `translate(${cx} ${cy})` }, svg);
      parts.pin = svgEl('g', {}, g);
      svgEl('path', { d: gearPath(Z, m), fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, parts.pin);
      svgEl('line', { x1: 0, y1: 0, x2: 0, y2: -r * .7, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linecap': 'round' }, parts.pin);
      svgEl('circle', { r: 6, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      // kremalera: hortzak pausoaren arabera (pp = π · m)
      const teeth = Math.ceil(W / pp) + 6;
      let d = `M${-pp * 3} ${yPitch + 1.25 * m + 26}`;
      for (let j = -3; j < teeth; j++) {
        const x = j * pp;
        d += ` L${x - pp * .5} ${yPitch + 1.25 * m} L${x - pp * .28} ${yPitch + 1.25 * m} L${x - pp * .14} ${yPitch - m} L${x + pp * .14} ${yPitch - m} L${x + pp * .28} ${yPitch + 1.25 * m}`;
      }
      d += ` L${teeth * pp} ${yPitch + 1.25 * m + 26} Z`;
      parts.rackG = svgEl('g', {}, svg);
      parts.rack = svgEl('path', { d, fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, parts.rackG);
      parts.pp = pp; parts.cx = cx;
      parts.mark = svgEl('line', { x1: 0, y1: yPitch + 4, x2: 0, y2: yPitch + 1.25 * m + 22, stroke: 'var(--ink)', 'stroke-width': 3 }, parts.rackG);
      parts.rackHit = svgEl('rect', { x: 0, y: yPitch - m, width: W, height: 1.25 * m + 30 + m, fill: 'transparent', style: 'cursor:ew-resize' }, svg);
      svgText(svg, 20, H - 14, '← arrastatu kremalera →', { 'font-size': 13, fill: 'var(--ink3)' });
      parts.dist = svgText(svg, W - 20, H - 14, '', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700 });

      box.querySelector('#kr-read').innerHTML =
        ro('Bira bakoitzeko, Z · p', `${Z} · ${fmt(p, 1)} = ${fmt(Z * p, 1)} mm`) +
        ro('Abiadura lineala, N · Z · p', `${fmt(N * Z * p, 0)} mm/min`, true) +
        ro('Metrotan', `${fmt(N * Z * p / 1000, 2)} m/min`);
      box.querySelector('#kr-hint').textContent = 'Pinoiak kremalera mugitzen du (zirkularra → lineala). Arrastatu kremalera: orain pinoiak biratzen du (lineala → zirkularra).';
      box.querySelector('#kr-foot').textContent = 'Pinoiaren bira bat = Z hortz aurrera.';
    } else {
      const pitchPx = Math.max(10, Math.min(48, p * 8)), x0 = 110, x1 = 560, yA = 150, rad = 24;
      parts.pitchPx = pitchPx; parts.x0 = x0; parts.x1 = x1;
      svgEl('rect', { x: x0, y: yA - rad, width: x1 - x0, height: 2 * rad, fill: 'var(--chip)', stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
      const clip = svgEl('clipPath', { id: 'kr-clip' }, svgEl('defs', {}, svg));
      svgEl('rect', { x: x0, y: yA - rad, width: x1 - x0, height: 2 * rad }, clip);
      parts.thread = svgEl('g', { 'clip-path': 'url(#kr-clip)' }, svg);
      for (let x = x0 - 2 * pitchPx; x < x1 + 2 * pitchPx; x += pitchPx) {
        svgEl('line', { x1: x, y1: yA + rad, x2: x + pitchPx * .5, y2: yA - rad, stroke: 'var(--ink3)', 'stroke-width': 2 }, parts.thread);
      }
      // bolantea
      const wg = svgEl('g', { transform: `translate(${x0 - 50} ${yA})` }, svg);
      parts.wheel = svgEl('g', {}, wg);
      svgEl('circle', { r: 40, fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 2 }, parts.wheel);
      svgEl('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linecap': 'round' }, parts.wheel);
      svgEl('circle', { r: 5, fill: 'var(--ink)' }, wg);
      svgEl('line', { x1: x0 - 10, y1: yA, x2: x0, y2: yA, stroke: 'var(--ink)', 'stroke-width': 6 }, svg);
      // azkoina
      parts.nut = svgEl('g', {}, svg);
      svgEl('rect', { x: -34, y: yA - rad - 22, width: 68, height: 2 * rad + 44, fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2 }, parts.nut);
      svgText(parts.nut, 0, yA - rad - 30, 'azkoina', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
      svgText(svg, x0, H - 40, `Pausoa marrazkian handituta (p = ${fmt(p, 1)} mm)`, { 'font-size': 12, fill: 'var(--ink3)' });
      parts.dist = svgText(svg, W - 20, H - 14, '', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700 });

      box.querySelector('#kr-read').innerHTML =
        ro('Bira bakoitzeko aurrerapena', `p = ${fmt(p, 1)} mm`) +
        ro('Abiadura lineala, N · p', `${fmt(N * p, 1)} mm/min`, true) +
        ro('10 mm aurreratzeko', `${fmt(10 / p, 2)} bira`);
      box.querySelector('#kr-hint').textContent = 'Torlojuaren bira oso bakoitzean azkoinak pauso bat aurreratzen du. Pauso txikiarekin, mugimendu oso zehatza eta indar handia (mahai-tornua, katua).';
      box.querySelector('#kr-foot').textContent = 'Azkoinak ez du biratzen: gidari batek eusten dio.';
    }
    draw();
  }

  function draw() {
    const turns = phi / (2 * Math.PI);
    if (mode === 'kremalera' && parts.pin) {
      const Z = sZ.value, pz = 2 * Math.PI / Z;
      const a0 = Math.PI / 2 - pz / 2;
      parts.pin.setAttribute('transform', `rotate(${((a0 + phi) * 180 / Math.PI).toFixed(2)})`);
      const shift = parts.cx - parts.r * phi;
      parts.rackG.setAttribute('transform', `translate(${shift.toFixed(2)} 0)`);
      parts.dist.textContent = `Birak: ${fmt(turns, 2)} · kremalera: ${fmt(turns * Z * sP.value, 0)} mm`;
    } else if (parts.wheel) {
      const adv = turns * parts.pitchPx;
      const span = parts.x1 - parts.x0 - 80;
      const pos = ((adv % span) + span) % span;
      parts.wheel.setAttribute('transform', `rotate(${(phi * 180 / Math.PI).toFixed(2)})`);
      parts.thread.setAttribute('transform', `translate(${(adv % parts.pitchPx).toFixed(2)} 0)`);
      parts.nut.setAttribute('transform', `translate(${(parts.x0 + 40 + pos).toFixed(2)} 0)`);
      parts.dist.textContent = `Birak: ${fmt(turns, 2)} · azkoina: ${fmt(turns * sP.value, 1)} mm`;
    }
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

  setMode(mode);
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
