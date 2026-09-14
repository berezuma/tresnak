// Torloju amaigabea eta koroa: murrizketa handia eta ez-itzulgarritasuna
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';
import { gearPath } from './engranajeak.js';

const W = 600, H = 330, SLOW = 12;

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Torloju amaigabea koroa bat biratzen"></svg></div>
        <div class="sim-panel">
          <div id="ta-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="ta-read"></div>
          <div class="pills"><span class="pill strong" id="ta-kind">Murriztailea</span><span class="pill" id="ta-lock">Torlojuak koroa mugitzen du</span></div>
          <button class="btn sm" id="ta-push">Saiatu koroatik biratzen</button>
        </div>
      </div>
      <div class="sim-foot"><span>Animazioa ${SLOW} aldiz motelago.</span><button class="btn sm ghost" id="ta-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#ta-ctl');
  const sZ = slider(ctl, { id: 'ta-z', label: 'Koroaren hortzak, Z', min: 10, max: 60, value: 30, dot: 'r' });
  const sN = slider(ctl, { id: 'ta-n', label: 'Torlojuaren abiadura, N₁', min: 60, max: 1500, step: 30, value: 600, unit: 'rpm', dot: 'f' });
  sZ.on(build); sN.on(build);

  let phi = 0, running = !reducedMotion(), last = 0, raf = 0, parts = {}, pushTimer = 0;
  const play = box.querySelector('#ta-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  box.querySelector('#ta-push').addEventListener('click', () => {
    const lock = box.querySelector('#ta-lock');
    lock.className = 'pill warn';
    lock.textContent = 'Blokeatuta: koroak ezin du torlojua biratu';
    parts.wheelG?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(-1.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 400 });
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { lock.className = 'pill'; lock.textContent = 'Torlojuak koroa mugitzen du'; }, 2600);
  });

  function build() {
    const Z = sZ.value, N1 = sN.value;
    const m = Math.min(7, 190 / Z), r = m * Z / 2, cx = 300, cy = H - 34 - r - m;
    const pp = Math.PI * m, wr = 20, wy = cy - r - wr + 2 * m * .3;
    svg.textContent = '';
    parts = { Z, m, r, pp };

    // koroa
    const wg = svgEl('g', { transform: `translate(${cx} ${cy})` }, svg);
    parts.wheelG = wg;
    wg.style.transformBox = 'view-box';
    parts.wheel = svgEl('g', {}, wg);
    svgEl('path', { d: gearPath(Z, m), fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, parts.wheel);
    svgEl('line', { x1: 0, y1: 0, x2: r * .72, y2: 0, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linecap': 'round' }, parts.wheel);
    svgEl('circle', { r: 7, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, wg);

    // torlojua (alboko ikuspegia)
    const x0 = 130, x1 = 470;
    svgEl('rect', { x: x0, y: wy - wr, width: x1 - x0, height: 2 * wr, fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 2 }, svg);
    const clip = svgEl('clipPath', { id: 'ta-clip' }, svgEl('defs', {}, svg));
    svgEl('rect', { x: x0, y: wy - wr, width: x1 - x0, height: 2 * wr }, clip);
    parts.thread = svgEl('g', { 'clip-path': 'url(#ta-clip)' }, svg);
    parts.threadInner = svgEl('g', {}, parts.thread);
    for (let j = -Math.ceil((cx - x0) / pp) - 2; j <= Math.ceil((x1 - cx) / pp) + 2; j++) {
      const x = cx + j * pp;
      svgEl('line', { x1: x - pp * .3, y1: wy + wr, x2: x + pp * .3, y2: wy - wr, stroke: 'var(--s1)', 'stroke-width': 2.5 }, parts.threadInner);
    }
    svgEl('line', { x1: x0 - 50, y1: wy, x2: x0, y2: wy, stroke: 'var(--ink)', 'stroke-width': 5 }, svg);
    svgEl('line', { x1: x1, y1: wy, x2: x1 + 40, y2: wy, stroke: 'var(--ink)', 'stroke-width': 5 }, svg);
    // motorra
    const mg = svgEl('g', { transform: `translate(${x0 - 70} ${wy})` }, svg);
    svgEl('rect', { x: -40, y: -26, width: 50, height: 52, fill: 'var(--chip)', stroke: 'var(--ink)', 'stroke-width': 2 }, mg);
    svgText(mg, -15, 5, 'M', { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 18 });
    parts.motorMark = svgEl('circle', { cx: 0, cy: 0, r: 4, fill: 'var(--s1)' }, svg);
    parts.motorPos = [x0 - 20, wy];

    svgText(svg, x1 + 10, wy - 30, `↻ ${fmt(N1, 0)} rpm`, { 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ink3)' });
    svgText(svg, cx, H - 8, `Koroa · Z = ${Z} · ↻ ${fmt(N1 / Z, 1)} rpm`, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 14 });

    const ro = (k, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${v}</b></div>`;
    box.querySelector('#ta-read').innerHTML =
      ro('i = 1 / Z', `1 / ${Z} = ${fmt(1 / Z, 3)}`) +
      ro('N₂ = N₁ / Z', `${fmt(N1 / Z, 1)} rpm`, true) +
      ro('Koroaren bira bat', `${Z} torloju-bira`);
    draw();
  }

  function draw() {
    if (!parts.wheel) return;
    const pz = 2 * Math.PI / parts.Z;
    const a0 = -Math.PI / 2 - pz / 2;
    parts.wheel.setAttribute('transform', `rotate(${((a0 + phi / parts.Z) * 180 / Math.PI).toFixed(3)})`);
    const shift = (phi / (2 * Math.PI)) * parts.pp;
    parts.threadInner.setAttribute('transform', `translate(${(shift % parts.pp).toFixed(2)} 0)`);
    const [mx, my] = parts.motorPos;
    parts.motorMark.setAttribute('cy', (my - 14 * Math.cos(phi)).toFixed(1));
    parts.motorMark.setAttribute('cx', mx);
    parts.motorMark.setAttribute('opacity', (Math.sin(phi) > 0 ? 1 : .25).toFixed(2));
  }

  function tick(now) {
    if (running) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      phi += dt * (sN.value / 60) * 2 * Math.PI / SLOW;
      draw();
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }

  build();
  raf = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(raf); clearTimeout(pushTimer); };
}
