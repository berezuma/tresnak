// Engranajeen simulagailua: bi engranaje, tarteko engranajea eta tren konposatua
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';

const W = 600, H = 330, SLOW = 20;
const FILLS = [['var(--g1-fill)', 'var(--s1)'], ['var(--g2-fill)', 'var(--s2)'], ['var(--g3-fill)', 'var(--s3)'], ['var(--chip)', 'var(--ink)']];

export function gearPath(Z, m) {
  const r = m * Z / 2, ra = r + m, rr = r - 1.25 * m, p = 2 * Math.PI / Z;
  let d = '';
  for (let k = 0; k < Z; k++) {
    const t = k * p;
    [[rr, t - p * .5], [rr, t - p * .28], [ra, t - p * .14], [ra, t + p * .14], [rr, t + p * .28]].forEach(([R, a], i) => {
      d += (k === 0 && i === 0 ? 'M' : 'L') + (R * Math.cos(a)).toFixed(2) + ' ' + (R * Math.sin(a)).toFixed(2) + ' ';
    });
  }
  return d + 'Z';
}
const frac = x => x - Math.floor(x);

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Engranajeak biraka"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Muntaia">
            <button data-mode="bi" class="active">Bi engranaje</button><button data-mode="tarteko">Tartekoa</button><button data-mode="tren">Tren konposatua</button>
          </div>
          <div id="eng-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="eng-read"></div>
          <div class="pills" id="eng-pills"></div>
        </div>
      </div>
      <div class="sim-foot"><span>Animazioa ${SLOW} aldiz motelago.</span><button class="btn sm ghost" id="eng-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#eng-ctl');
  let mode = 'bi';
  const s1 = slider(ctl, { id: 'eng-z1', label: 'Z₁ (eragilea)', min: 8, max: 40, value: 20, dot: 'f' });
  const s2 = slider(ctl, { id: 'eng-z2', label: 'Z₂', min: 8, max: 60, value: 40, dot: 'r' });
  const s3 = slider(ctl, { id: 'eng-z3', label: 'Z₃', min: 8, max: 40, value: 12, dot: 'e' });
  const s4 = slider(ctl, { id: 'eng-z4', label: 'Z₄', min: 8, max: 60, value: 36 });
  const sN = slider(ctl, { id: 'eng-n1', label: 'N₁ (motorra)', min: 100, max: 2000, step: 50, value: 1000, unit: 'rpm' });
  const wrap3 = s3.input.parentElement, wrap4 = s4.input.parentElement;
  [s1, s2, s3, s4, sN].forEach(s => s.on(build));

  box.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => {
    mode = bt.dataset.mode;
    box.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === bt));
    build();
  }));

  let gears = [], phi = 0, running = !reducedMotion(), last = 0, raf = 0;
  const play = box.querySelector('#eng-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  function build() {
    wrap3.hidden = mode === 'bi';
    wrap4.hidden = mode !== 'tren';
    s3.input.parentElement.querySelector('label').lastChild.textContent = mode === 'tarteko' ? 'Z₃ (irteera)' : 'Z₃ (Z₂-ren ardatzean)';
    const Z = [s1.value, s2.value, s3.value, s4.value];
    const N1 = sN.value;

    // engranajeen deskribapena: aita, lotura (ahokatu / ardatz bera)
    let spec;
    if (mode === 'bi') spec = [{ Z: Z[0] }, { Z: Z[1], p: 0, j: 'mesh' }];
    else if (mode === 'tarteko') spec = [{ Z: Z[0] }, { Z: Z[1], p: 0, j: 'mesh' }, { Z: Z[2], p: 1, j: 'mesh' }];
    else spec = [{ Z: Z[0] }, { Z: Z[1], p: 0, j: 'mesh' }, { Z: Z[2], p: 1, j: 'shaft' }, { Z: Z[3], p: 2, j: 'mesh' }];

    // eskala: zabalera eta altuera
    let span = 0;
    spec.forEach((g, i) => {
      if (i === 0) span += g.Z / 2 + 1;
      else if (g.j === 'mesh') span += (spec[g.p].Z + g.Z) / 2;
      if (i === spec.length - 1) span += g.Z / 2 + 1;
    });
    const maxZ = Math.max(...spec.map(g => g.Z));
    const m = Math.min((W - 30) / span, (H - 90) / (maxZ + 2.5), 7);
    const cy = (H - 50) / 2 + 6;
    let x = (W - span * m) / 2 + (spec[0].Z / 2 + 1) * m;

    const list = [];
    spec.forEach((g, i) => {
      const r = m * g.Z / 2, pz = 2 * Math.PI / g.Z;
      const out = { ...g, r, pz, idx: i };
      if (i === 0) { out.cx = x; out.w = 1; out.a0 = 0; }
      else {
        const par = list[g.p];
        if (g.j === 'shaft') { out.cx = par.cx; out.w = par.w; out.a0 = par.a0; }
        else {
          out.cx = par.cx + par.r + r;
          out.w = -par.w * par.Z / g.Z;
          const fParent = frac(-par.a0 / par.pz);          // aitaren hortz-fasea ukipenean (eskuinean)
          out.a0 = Math.PI - pz * (0.5 - fParent);          // haurrak hutsunea han
        }
      }
      list.push(out);
    });
    gears = list;

    svg.textContent = '';
    // handienak lehenik ardatz berean daudenean
    const order = [...gears].sort((a, b) => (a.cx - b.cx) || (b.r - a.r));
    order.forEach(g => {
      const [fill, stroke] = FILLS[g.idx];
      const grp = svgEl('g', { transform: `translate(${g.cx.toFixed(1)} ${cy})` }, svg);
      g.rot = svgEl('g', {}, grp);
      svgEl('path', { d: gearPath(g.Z, m), fill, stroke, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g.rot);
      svgEl('line', { x1: 0, y1: 0, x2: g.r * .7, y2: 0, stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g.rot);
      svgEl('circle', { r: Math.max(4, g.r * .13), fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, g.rot);
    });

    // etiketak
    const rpm = gears.map(g => N1 * Math.abs(g.w));
    const labels = gears.filter(g => !(mode === 'tren' && g.idx === 2));
    labels.forEach(g => {
      const lx = mode === 'tren' && g.idx === 1 ? g.cx : g.cx;
      const name = mode === 'tren' && g.idx === 1 ? `Z₂ = ${g.Z} · Z₃ = ${gears[2].Z}` : `Z${'₁₂₃₄'[g.idx]} = ${g.Z}`;
      svgText(svg, lx, H - 24, name, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 14 });
      svgText(svg, lx, H - 7, `${g.w > 0 ? '↻' : '↺'} ${fmt(rpm[g.idx], 0)} rpm`, { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ink3)' });
    });

    // irakurketak
    const last = gears[gears.length - 1];
    const Nout = N1 * Math.abs(last.w);
    const i = Nout / N1;
    const rd = box.querySelector('#eng-read');
    const ro = (k, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${v}</b></div>`;
    if (mode === 'bi') {
      rd.innerHTML = ro('i = Z₁ / Z₂', `${Z[0]} / ${Z[1]} = ${fmt(i)}`) + ro('N₂ = N₁ · i', `${fmt(Nout, 1)} rpm`, true) + ro('Indar-momentua irteeran', `× ${fmt(1 / i)}`);
    } else if (mode === 'tarteko') {
      rd.innerHTML = ro('N₂', `${fmt(rpm[1], 1)} rpm`) + ro('N₃ = N₁ · Z₁ / Z₃', `${fmt(Nout, 1)} rpm`, true) + ro('Z₂-k abiadura aldatzen du?', 'Ez');
    } else {
      rd.innerHTML = ro('i = (Z₁/Z₂) · (Z₃/Z₄)', `${fmt(Z[0] / Z[1], 3)} · ${fmt(Z[2] / Z[3], 3)} = ${fmt(i, 3)}`) + ro('N₂ = N₃', `${fmt(rpm[1], 1)} rpm`) + ro('N₄ = N₁ · i', `${fmt(Nout, 1)} rpm`, true);
    }
    const kind = Math.abs(i - 1) < 1e-9 ? 'Neutroa' : i > 1 ? 'Biderkatzailea' : 'Murriztailea';
    const same = last.w > 0;
    box.querySelector('#eng-pills').innerHTML = `<span class="pill strong">${kind}</span><span class="pill">${same ? 'Irteera noranzko berean' : 'Irteera kontrako noranzkoan'}</span>`;
    draw();
  }

  function draw() {
    gears.forEach(g => g.rot?.setAttribute('transform', `rotate(${((g.a0 + g.w * phi) * 180 / Math.PI).toFixed(2)})`));
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
  return () => cancelAnimationFrame(raf);
}
