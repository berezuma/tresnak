// Uhal-transmisioa, kate-transmisioa eta marruskadura-gurpilak
//   aukerak: { mode: 'zuzena' | 'gurutzatua' | 'katea' | 'gurpilak', modes: [...] }
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';
import { gearPath } from './engranajeak.js';

const W = 600, H = 330, SLOW = 20, CX1 = 170, CX2 = 440, CY = 150;

export default function mount(box, opts = {}) {
  const modes = opts.modes || ['zuzena', 'gurutzatua', 'katea'];
  const IZENAK = { zuzena: 'Uhal zuzena', gurutzatua: 'Uhal gurutzatua', katea: 'Katea', gurpilak: 'Gurpilak' };
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bi gurpil biraka: uhala, katea edo ukipena"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Transmisio mota" ${modes.length < 2 ? 'hidden' : ''}>
            ${modes.map(m => `<button data-mode="${m}">${IZENAK[m]}</button>`).join('')}
          </div>
          <div id="uh-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="uh-read"></div>
          <div class="pills" id="uh-pills"></div>
        </div>
      </div>
      <div class="sim-foot"><span>Animazioa ${SLOW} aldiz motelago.</span><button class="btn sm ghost" id="uh-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#uh-ctl');
  let mode = opts.mode || modes[0];
  const sD1 = slider(ctl, { id: 'uh-d1', label: 'D₁ (eragilea)', min: 4, max: 30, value: 10, unit: 'cm', dot: 'f' });
  const sD2 = slider(ctl, { id: 'uh-d2', label: 'D₂', min: 4, max: 40, value: 30, unit: 'cm', dot: 'r' });
  const sZ1 = slider(ctl, { id: 'uh-z1', label: 'Platera, Z₁', min: 22, max: 52, value: 44, unit: 'hortz', dot: 'f' });
  const sZ2 = slider(ctl, { id: 'uh-z2', label: 'Pinoia, Z₂', min: 11, max: 34, value: 16, unit: 'hortz', dot: 'r' });
  const sN = slider(ctl, { id: 'uh-n1', label: 'N₁', min: 30, max: 2000, step: 10, value: mode === 'katea' ? 80 : 1000, unit: 'rpm' });
  [sD1, sD2, sZ1, sZ2, sN].forEach(s => s.on(build));

  box.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => {
    mode = bt.dataset.mode;
    if (mode === 'katea' && sN.value > 200) sN.value = 80;
    if (mode !== 'katea' && sN.value < 300) sN.value = 1000;
    build();
  }));

  let rot1, rot2, belt, w2 = 1, phi = 0, dash = 0, beltSpeed = 0, running = !reducedMotion(), last = 0, raf = 0;
  const play = box.querySelector('#uh-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  function build() {
    box.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x.dataset.mode === mode));
    const chain = mode === 'katea', crossed = mode === 'gurutzatua', wheels = mode === 'gurpilak';
    sD1.input.parentElement.hidden = chain; sD2.input.parentElement.hidden = chain;
    sZ1.input.parentElement.hidden = !chain; sZ2.input.parentElement.hidden = !chain;

    // erradioak pixeletan
    let r1, r2, ratio;
    if (chain) {
      const pitch = 5.2;
      r1 = pitch * sZ1.value / (2 * Math.PI) * 2.2; r2 = pitch * sZ2.value / (2 * Math.PI) * 2.2;
      ratio = sZ1.value / sZ2.value;
    } else {
      const k = Math.min(6, 118 / (Math.max(sD1.value, sD2.value) / 2));
      r1 = sD1.value / 2 * k; r2 = sD2.value / 2 * k;
      ratio = sD1.value / sD2.value;
    }
    let cx1 = CX1, cx2 = CX2;
    if (wheels) { cx1 = (W - 2 * (r1 + r2)) / 2 + r1; cx2 = cx1 + r1 + r2; }
    w2 = (crossed || wheels ? -1 : 1) * ratio;
    const d = cx2 - cx1;

    svg.textContent = '';
    belt = null;
    if (!wheels) {
      let path;
      if (!crossed) {
        const b = Math.asin((r1 - r2) / d), sb = Math.sin(b), cb = Math.cos(b);
        const t1 = [cx1 + r1 * sb, CY - r1 * cb], t2 = [cx2 + r2 * sb, CY - r2 * cb];
        const u1 = [cx1 + r1 * sb, CY + r1 * cb], u2 = [cx2 + r2 * sb, CY + r2 * cb];
        path = `M${t1} L${t2} A${r2} ${r2} 0 ${b < 0 ? 1 : 0} 1 ${u2} L${u1} A${r1} ${r1} 0 ${b > 0 ? 1 : 0} 1 ${t1} Z`;
      } else {
        const g = Math.asin(Math.min(.999, (r1 + r2) / d)), sg = Math.sin(g), cg = Math.cos(g);
        const a1 = [cx1 + r1 * sg, CY - r1 * cg], b2 = [cx2 - r2 * sg, CY + r2 * cg];
        const a2 = [cx2 - r2 * sg, CY - r2 * cg], b1 = [cx1 + r1 * sg, CY + r1 * cg];
        path = `M${a1} L${b2} A${r2} ${r2} 0 1 0 ${a2} L${b1} A${r1} ${r1} 0 1 1 ${a1} Z`;
      }
      svgEl('path', { d: path, fill: 'none', stroke: chain ? 'var(--ink3)' : 'var(--ink)', 'stroke-width': chain ? 9 : 7, 'stroke-linejoin': 'round' }, svg);
      belt = svgEl('path', { d: path, fill: 'none', stroke: chain ? 'var(--sheet)' : 'var(--ink3)', 'stroke-width': chain ? 4 : 2, 'stroke-dasharray': chain ? '6 5' : '10 14', 'stroke-linecap': chain ? 'round' : 'butt' }, svg);
      beltSpeed = r1;
    }

    const wheel = (cx, r, fill, stroke, Z) => {
      const g = svgEl('g', { transform: `translate(${cx} ${CY})` }, svg);
      const rot = svgEl('g', {}, g);
      if (Z) svgEl('path', { d: gearPath(Z, 2 * r / Z), fill, stroke, 'stroke-width': 1.5 }, rot);
      else {
        svgEl('circle', { r, fill, stroke, 'stroke-width': 2 }, rot);
        if (wheels) svgEl('circle', { r: r - 3, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5 }, rot);
      }
      for (let k = 0; k < 3; k++) {
        const a = k * 2 * Math.PI / 3;
        svgEl('line', { x1: 0, y1: 0, x2: r * .78 * Math.cos(a), y2: r * .78 * Math.sin(a), stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linecap': 'round' }, rot);
      }
      svgEl('circle', { r: 5, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      return rot;
    };
    rot1 = wheel(cx1, r1, 'var(--g1-fill)', 'var(--s1)', chain ? sZ1.value : 0);
    rot2 = wheel(cx2, r2, 'var(--g2-fill)', 'var(--s2)', chain ? sZ2.value : 0);
    if (wheels) svgEl('circle', { cx: cx1 + r1, cy: CY, r: 4.5, fill: 'var(--danger)', stroke: 'var(--sheet)', 'stroke-width': 1.5 }, svg); // ukipen-puntua

    const N1 = sN.value, N2 = N1 * ratio;
    const n1l = chain ? `Platera · ${sZ1.value} hortz` : `D₁ = ${sD1.value} cm`;
    const n2l = chain ? `Pinoia · ${sZ2.value} hortz` : `D₂ = ${sD2.value} cm`;
    svgText(svg, cx1, H - 26, n1l, { 'text-anchor': 'middle', 'font-weight': 700 });
    svgText(svg, cx1, H - 8, `↻ ${fmt(N1, 0)} rpm`, { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ink3)' });
    svgText(svg, cx2, H - 26, n2l, { 'text-anchor': 'middle', 'font-weight': 700 });
    svgText(svg, cx2, H - 8, `${w2 < 0 ? '↺' : '↻'} ${fmt(N2, 0)} rpm`, { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ink3)' });

    const ro = (k, v, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${v}</b></div>`;
    box.querySelector('#uh-read').innerHTML = chain
      ? ro('i = Z₁ / Z₂', `${sZ1.value} / ${sZ2.value} = ${fmt(ratio)}`) + ro('N₂ = N₁ · i', `${fmt(N2, 1)} rpm`, true)
      : ro('i = D₁ / D₂', `${sD1.value} / ${sD2.value} = ${fmt(ratio)}`) + ro('N₂ = N₁ · i', `${fmt(N2, 1)} rpm`, true) + ro('Indar-momentua irteeran', `× ${fmt(1 / ratio)}`);
    const kind = Math.abs(ratio - 1) < 1e-9 ? 'Neutroa' : ratio > 1 ? 'Biderkatzailea' : 'Murriztailea';
    const extra = chain ? '<span class="pill">Ez du irristatzen</span>' : wheels ? '<span class="pill">Irrist egin dezake · indar txikiak</span>' : '<span class="pill">Irrist egin dezake</span>';
    box.querySelector('#uh-pills').innerHTML = `<span class="pill strong">${kind}</span><span class="pill">${w2 < 0 ? 'Kontrako noranzkoan' : 'Noranzko berean'}</span>${extra}`;
    draw();
  }

  function draw() {
    rot1?.setAttribute('transform', `rotate(${(phi * 180 / Math.PI).toFixed(2)})`);
    rot2?.setAttribute('transform', `rotate(${(w2 * phi * 180 / Math.PI).toFixed(2)})`);
    belt?.setAttribute('stroke-dashoffset', (-dash).toFixed(1));
  }
  function tick(now) {
    if (running) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      const dphi = dt * (sN.value / 60) * 2 * Math.PI / SLOW;
      phi += dphi;
      dash += dphi * beltSpeed;
      draw();
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }

  build();
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
