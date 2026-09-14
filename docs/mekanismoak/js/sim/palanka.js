// Palankaren simulagailua: euskarria, karga eta indarra barran mugitu, oreka ikusi
import { G, fmt, svgEl, svgText, svgArrow, slider } from '../util.js';

const L = 5;                    // barraren luzera, m
const X0 = 50, PX = 100;        // barraren hasiera (px) eta eskala (px/m)
const Y = 175;                  // barraren altuera

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 600 330" role="img" aria-label="Palanka: barra, euskarria, karga eta indarra"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Palanka mota">
            <button data-mota="1">1. maila</button><button data-mota="2">2. maila</button><button data-mota="3">3. maila</button>
          </div>
          <div id="pal-ctl"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Indar-besoa, d<sub>F</sub></span><b id="pal-df"></b></div>
            <div><span>Erresistentzia-besoa, d<sub>R</sub></span><b id="pal-dr"></b></div>
            <div><span>F · d<sub>F</sub></span><b id="pal-mf"></b></div>
            <div><span>R · d<sub>R</sub></span><b id="pal-mr"></b></div>
            <div class="hi"><span>Orekarako indarra</span><b id="pal-need"></b></div>
          </div>
          <div class="pills"><span class="pill strong" id="pal-mota"></span><span class="pill" id="pal-egoera"></span></div>
          <button class="btn sm" id="pal-orekatu">Jarri orekarako indarra</button>
        </div>
      </div>
      <div class="sim-foot"><span>Arrastatu euskarria <span class="dot e"></span>, karga <span class="dot r"></span> eta indarra <span class="dot f"></span> barraren gainean.</span><span>g = 9,8 m/s²</span></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#pal-ctl');
  const st = { e: 2, r: 1, f: 4.5 };
  const posFmt = v => fmt(v, 1) + ' m';
  const sE = slider(ctl, { id: 'pal-e', label: 'Euskarria', min: 0, max: L, step: 0.1, value: st.e, format: posFmt, dot: 'e' });
  const sR = slider(ctl, { id: 'pal-r', label: 'Karga', min: 0, max: L, step: 0.1, value: st.r, format: posFmt, dot: 'r' });
  const sF = slider(ctl, { id: 'pal-f', label: 'Indarra', min: 0, max: L, step: 0.1, value: st.f, format: posFmt, dot: 'f' });
  const sM = slider(ctl, { id: 'pal-m', label: 'Kargaren masa', min: 10, max: 200, step: 5, value: 100, unit: 'kg' });
  const sN = slider(ctl, { id: 'pal-n', label: 'Egiten dugun indarra', min: 0, max: 3000, step: 1, value: 400, unit: 'N' });
  ctl.style.display = 'grid';
  ctl.style.gap = '10px';

  [sE, sR, sF, sM, sN].forEach(s => s.on(draw));

  box.querySelectorAll('[data-mota]').forEach(bt => bt.addEventListener('click', () => {
    const p = { 1: [2, 1, 4.5], 2: [0.3, 1.5, 4.7], 3: [0.3, 4.7, 1.8] }[bt.dataset.mota];
    sE.value = p[0]; sR.value = p[1]; sF.value = p[2];
    draw();
  }));
  box.querySelector('#pal-orekatu').addEventListener('click', () => {
    const need = required();
    if (isFinite(need)) { sN.value = Math.min(3000, Math.round(need)); draw(); }
  });

  function required() {
    const dR = Math.abs(sR.value - sE.value), dF = Math.abs(sF.value - sE.value);
    return dF > 0 ? sM.value * G * dR / dF : Infinity;
  }

  // --- arrastatzea ---
  let dragging = null;
  const toMeters = ev => {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return Math.max(0, Math.min(L, Math.round((p.x - X0) / PX * 10) / 10));
  };
  svg.addEventListener('pointermove', ev => {
    if (!dragging) return;
    ({ e: sE, r: sR, f: sF })[dragging].value = toMeters(ev);
    draw();
  });
  const stop = () => { dragging = null; };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  function handle(g, key, label) {
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'slider');
    g.setAttribute('aria-label', label);
    g.style.cursor = 'grab';
    g.addEventListener('pointerdown', ev => { dragging = key; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    g.addEventListener('keydown', ev => {
      const s = ({ e: sE, r: sR, f: sF })[key];
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        s.value = Math.max(0, Math.min(L, Math.round((s.value + (ev.key === 'ArrowRight' ? .1 : -.1)) * 10) / 10));
        draw(); ev.preventDefault();
      }
    });
  }

  function draw() {
    const xE = sE.value, xR = sR.value, xF = sF.value;
    const R = sM.value * G, F = sN.value;
    const dR = Math.abs(xR - xE), dF = Math.abs(xF - xE);
    const sameSide = Math.sign(xR - xE) === Math.sign(xF - xE) && dR > 0 && dF > 0;
    const fDir = sameSide ? -1 : 1;              // alde berean → indarra gora
    const tR = R * (xR - xE), tF = fDir * F * (xF - xE);
    const net = tR + tF;
    const scale = Math.abs(tR) + Math.abs(tF) + 1;
    const balanced = Math.abs(net) <= 0.005 * scale || (dR === 0 && dF === 0);
    const angle = balanced ? 0 : 9 * Math.tanh(3 * net / scale);

    // mota
    let mota = '—';
    if (dR > 0 && dF > 0) {
      if (!sameSide) mota = '1. mailako palanka';
      else mota = dR < dF ? '2. mailako palanka' : '3. mailako palanka';
    }

    svg.textContent = '';
    // lurra eta euskarria
    svgEl('line', { x1: 20, y1: 300, x2: 580, y2: 300, stroke: 'var(--rule)', 'stroke-width': 2 }, svg);
    const pxE = X0 + xE * PX;
    const eG = svgEl('g', {}, svg);
    svgEl('path', { d: `M${pxE} ${Y + 7} L${pxE - 26} 300 L${pxE + 26} 300 Z`, fill: 'var(--g3-fill)', stroke: 'var(--s3)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, eG);
    handle(eG, 'e', 'Euskarriaren posizioa');

    // barra biratua
    const beam = svgEl('g', { transform: `rotate(${angle} ${pxE} ${Y})` }, svg);
    svgEl('rect', { x: X0 - 6, y: Y - 7, width: L * PX + 12, height: 14, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, beam);
    for (let m = 0; m <= L; m++) {
      svgEl('line', { x1: X0 + m * PX, y1: Y - 7, x2: X0 + m * PX, y2: Y + 7, stroke: 'var(--ink3)', 'stroke-width': 1 }, beam);
      svgText(beam, X0 + m * PX, Y + 26, `${m} m`, { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink3)' });
    }
    svgEl('circle', { cx: pxE, cy: Y, r: 4, fill: 'var(--ink)' }, beam);

    // karga (beti behera)
    const pxR = X0 + xR * PX;
    const rG = svgEl('g', {}, beam);
    const size = 34 + sM.value / 8;
    svgEl('rect', { x: pxR - size / 2, y: Y - 7 - size, width: size, height: size, fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2 }, rG);
    svgText(rG, pxR, Y - 7 - size / 2 + 5, `${sM.value} kg`, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 13 });
    svgArrow(rG, pxR, Y + 34, pxR, Y + 84, 'var(--s2)');
    svgText(rG, pxR, Y + 102, `R = ${fmt(R, 0)} N`, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
    handle(rG, 'r', 'Kargaren posizioa');

    // indarra
    const pxF = X0 + xF * PX;
    const fG = svgEl('g', {}, beam);
    const len = 30 + Math.min(70, F / 30);
    if (fDir > 0) svgArrow(fG, pxF, Y - 10 - len, pxF, Y - 10, 'var(--s1)', 3.5);
    else svgArrow(fG, pxF, Y + 10 + len, pxF, Y + 10, 'var(--s1)', 3.5);
    svgEl('circle', { cx: pxF, cy: Y, r: 9, fill: 'var(--g1-fill)', stroke: 'var(--s1)', 'stroke-width': 2 }, fG);
    svgText(fG, pxF, fDir > 0 ? Y - 18 - len : Y + 30 + len, `F = ${fmt(F, 0)} N`, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: 'var(--s1)' });
    handle(fG, 'f', 'Indarraren posizioa');

    // irakurketak
    const need = required();
    box.querySelector('#pal-df').textContent = fmt(dF, 1) + ' m';
    box.querySelector('#pal-dr').textContent = fmt(dR, 1) + ' m';
    box.querySelector('#pal-mf').textContent = fmt(F * dF, 0) + ' N·m';
    box.querySelector('#pal-mr').textContent = fmt(R * dR, 0) + ' N·m';
    box.querySelector('#pal-need').textContent = isFinite(need) ? fmt(need, 1) + ' N' : '—';
    box.querySelector('#pal-mota').textContent = mota;
    const eg = box.querySelector('#pal-egoera');
    eg.className = 'pill ' + (balanced ? 'ok' : 'warn');
    eg.textContent = balanced ? 'Orekan' : (F * dF < R * dR ? 'Indar gutxiegi' : 'Indar gehiegi');
    box.querySelectorAll('[data-mota]').forEach(bt => bt.classList.toggle('active', mota.startsWith(bt.dataset.mota)));
  }

  draw();
  return () => {};
}
