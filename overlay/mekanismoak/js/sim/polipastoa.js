// Polipastoaren simulagailua: polea mugikorrak, soka tiratu eta karga igo
import { G, fmt, svgEl, svgText, svgArrow, slider } from '../util.js';

const W = 600, H = 380, RP = 20;     // SVG neurriak eta polearen erradioa
const Y_FIX = 70, Y_LOAD0 = 280, PXM = 35; // polea finkoen altuera, hasierako polea mugikorra, px/m

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Polipastoa: polea finkoak, polea mugikorrak eta karga"></svg></div>
        <div class="sim-panel">
          <div id="pol-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Karga, R = m · g</span><b id="pol-r"></b></div>
            <div><span>Kargari eusten dioten soka-zatiak</span><b id="pol-z"></b></div>
            <div class="hi"><span>Behar den indarra, F</span><b id="pol-f"></b></div>
            <div><span>Karga igo da, h</span><b id="pol-h"></b></div>
            <div><span>Guk egindako lana, F · s</span><b id="pol-wf"></b></div>
            <div><span>Kargak jasotako lana, R · h</span><b id="pol-wr"></b></div>
          </div>
          <div class="pills"><span class="pill strong" id="pol-am"></span></div>
        </div>
      </div>
      <div class="sim-foot"><span>Marruskadurarik eta polearen pisurik gabe.</span><span>g = 9,8 m/s²</span></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#pol-ctl');
  const sN = slider(ctl, { id: 'pol-n', label: 'Polea mugikorrak', min: 0, max: 3, step: 1, value: 1, format: v => v === 0 ? '0 (finkoa bakarrik)' : String(v) });
  const sM = slider(ctl, { id: 'pol-m', label: 'Kargaren masa', min: 10, max: 200, step: 5, value: 80, unit: 'kg', dot: 'r' });
  const sS = slider(ctl, { id: 'pol-s', label: 'Tiratu dugun soka, s', min: 0, max: 4, step: 0.1, value: 0, format: v => fmt(v, 1), unit: 'm', dot: 'f' });
  [sN, sM, sS].forEach(s => s.on(draw));

  function draw() {
    const n = sN.value, m = sM.value, s = sS.value;
    const zatiak = n === 0 ? 1 : 2 * n;
    const R = m * G, F = R / zatiak, h = s / zatiak;
    const yMov = Y_LOAD0 - h * PXM;
    svg.textContent = '';

    // sabaia
    svgEl('rect', { x: 60, y: 14, width: 480, height: 12, fill: 'var(--chip)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, svg);
    for (let x = 70; x < 540; x += 16) svgEl('line', { x1: x, y1: 14, x2: x - 8, y2: 6, stroke: 'var(--ink3)', 'stroke-width': 1 }, svg);

    const rope = { stroke: 'var(--ink)', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' };
    const pulley = (cx, cy, fixed) => {
      const g = svgEl('g', {}, svg);
      svgEl('circle', { cx, cy, r: RP, fill: fixed ? 'var(--chip)' : 'var(--g1-fill)', stroke: fixed ? 'var(--ink)' : 'var(--s1)', 'stroke-width': 2 }, g);
      svgEl('circle', { cx, cy, r: 3.5, fill: 'var(--ink)' }, g);
      return g;
    };

    let handX, loadX, loadTop;
    if (n === 0) {
      const cx = 300;
      svgEl('line', { x1: cx, y1: 26, x2: cx, y2: Y_FIX, stroke: 'var(--ink)', 'stroke-width': 3 }, svg);
      const yLoad = Y_LOAD0 + 40 - h * PXM;
      svgEl('path', { d: `M${cx - RP} ${yLoad} L${cx - RP} ${Y_FIX} A${RP} ${RP} 0 0 1 ${cx + RP} ${Y_FIX}`, ...rope }, svg);
      handX = cx + RP;
      loadX = cx - RP; loadTop = yLoad;
      pulley(cx, Y_FIX, true);
    } else {
      const x0 = 300 - (n - 1) * 45 - 20;
      const xs = Array.from({ length: n }, (_, i) => x0 + i * 90);
      // soka: sabaitik → mugikorra → finkoa → … → eskua
      let d = `M${xs[0] - RP} 26 L${xs[0] - RP} ${yMov}`;
      xs.forEach((x, i) => {
        d += ` A${RP} ${RP} 0 0 0 ${x + RP} ${yMov} L${x + RP} ${Y_FIX}`;
        d += ` A${RP} ${RP} 0 0 1 ${x + RP + 2 * RP} ${Y_FIX}`;
        if (i < n - 1) d += ` L${xs[i + 1] - RP} ${yMov}`;
      });
      svgEl('path', { d, ...rope }, svg);
      handX = xs[n - 1] + 3 * RP;
      xs.forEach(x => {
        svgEl('line', { x1: x + 2 * RP, y1: 26, x2: x + 2 * RP, y2: Y_FIX, stroke: 'var(--ink)', 'stroke-width': 3 }, svg);
        pulley(x + 2 * RP, Y_FIX, true);
        pulley(x, yMov, false);
      });
      // polea mugikorren barra eta karga
      const bx1 = xs[0], bx2 = xs[n - 1];
      svgEl('line', { x1: bx1, y1: yMov, x2: bx1, y2: yMov + 34, stroke: 'var(--s1)', 'stroke-width': 3 }, svg);
      if (n > 1) svgEl('line', { x1: bx2, y1: yMov, x2: bx2, y2: yMov + 34, stroke: 'var(--s1)', 'stroke-width': 3 }, svg);
      svgEl('line', { x1: bx1 - 6, y1: yMov + 34, x2: bx2 + 6, y2: yMov + 34, stroke: 'var(--s1)', 'stroke-width': 3 }, svg);
      loadX = (bx1 + bx2) / 2; loadTop = yMov + 34;
    }

    // karga
    const size = 40 + m / 6;
    svgEl('rect', { x: loadX - size / 2, y: loadTop, width: size, height: size * .8, fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2 }, svg);
    svgText(svg, loadX, loadTop + size * .4 + 5, `${m} kg`, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 13 });

    // soka librea eta eskua
    const yHand = Math.min(H - 36, 170 + s * PXM);
    svgEl('line', { x1: handX, y1: Y_FIX, x2: handX, y2: yHand, ...rope }, svg);
    svgArrow(svg, handX + 26, yHand - 44, handX + 26, yHand + 6, 'var(--s1)', 3.5);
    svgText(svg, handX + 36, yHand - 16, `F = ${fmt(F, 0)} N`, { 'font-weight': 700, fill: 'var(--s1)', 'font-size': 14 });

    // altuera-eskala
    svgEl('line', { x1: 40, y1: Y_LOAD0 + 40, x2: 40, y2: Y_LOAD0 + 40 - 4 * PXM, stroke: 'var(--rule)', 'stroke-width': 2 }, svg);
    for (let k = 0; k <= 4; k++) svgText(svg, 34, Y_LOAD0 + 44 - k * PXM, `${k} m`, { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink3)' });

    box.querySelector('#pol-r').textContent = fmt(R, 0) + ' N';
    box.querySelector('#pol-z').textContent = String(zatiak);
    box.querySelector('#pol-f').textContent = fmt(F, 1) + ' N';
    box.querySelector('#pol-h').textContent = fmt(h, 2) + ' m';
    box.querySelector('#pol-wf').textContent = fmt(F * s, 0) + ' J';
    box.querySelector('#pol-wr').textContent = fmt(R * h, 0) + ' J';
    box.querySelector('#pol-am').textContent = `Abantaila mekanikoa: ${zatiak}`;
  }

  draw();
  return () => {};
}
