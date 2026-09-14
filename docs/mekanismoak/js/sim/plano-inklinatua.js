// Plano inklinatuaren simulagailua: arrapala, kaxa eta indarrak
import { G, fmt, svgEl, svgText, svgArrow, slider } from '../util.js';

const W = 600, H = 340, X0 = 60, Y0 = 290;

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Plano inklinatua: kaxa bat arrapalan gora"></svg></div>
        <div class="sim-panel">
          <div id="pi-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Pisua, P = m · g</span><b id="pi-p"></b></div>
            <div><span>Angelua / malda</span><b id="pi-ang"></b></div>
            <div class="hi"><span>Behar den indarra, F = P · h / L</span><b id="pi-f"></b></div>
            <div><span>Abantaila mekanikoa, L / h</span><b id="pi-am"></b></div>
            <div><span>Guk egindako lana, F · s</span><b id="pi-wf"></b></div>
            <div><span>Kaxak irabazitako energia, P · (igoera)</span><b id="pi-wp"></b></div>
          </div>
        </div>
      </div>
      <div class="sim-foot"><span>Marruskadurarik gabe.</span><span>g = 9,8 m/s²</span></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#pi-ctl');
  const sL = slider(ctl, { id: 'pi-l', label: 'Arrapalaren luzera, L', min: 1, max: 6, step: 0.1, value: 4, format: v => fmt(v, 1), unit: 'm' });
  const sH = slider(ctl, { id: 'pi-h', label: 'Altuera, h', min: 0.2, max: 3, step: 0.1, value: 1, format: v => fmt(v, 1), unit: 'm' });
  const sM = slider(ctl, { id: 'pi-m', label: 'Kaxaren masa', min: 10, max: 200, step: 5, value: 50, unit: 'kg', dot: 'r' });
  const sS = slider(ctl, { id: 'pi-s', label: 'Kaxa arrapalan, s', min: 0, max: 100, step: 1, value: 60, format: v => v + ' %' , dot: 'f' });
  [sL, sH, sM, sS].forEach(s => s.on(draw));

  function draw() {
    let L = sL.value, h = sH.value;
    if (h > L * 0.9) { h = Math.round(L * 9) / 10; sH.value = h; }
    const base = Math.sqrt(L * L - h * h);
    const k = Math.min(380 / base, 220 / h, 200);   // eskuinean tokia "Zuzenean" alderaketarako
    const P = sM.value * G, F = P * h / L;
    const frac = sS.value / 100, s = frac * L;
    const ang = Math.atan2(h, base);

    const A = [X0, Y0], B = [X0 + base * k, Y0], C = [X0 + base * k, Y0 - h * k];
    svg.textContent = '';
    svgEl('line', { x1: 20, y1: Y0, x2: W - 20, y2: Y0, stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
    svgEl('path', { d: `M${A} L${B} L${C} Z`, fill: 'var(--chip)', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    // neurriak
    // L etiketa arrapalaren azpian (kaxa gainean dago)
    const lx = (A[0] + C[0]) / 2 + 22 * Math.sin(ang), ly = (A[1] + C[1]) / 2 + 22 * Math.cos(ang);
    svgText(svg, lx, ly, `L = ${fmt(L, 1)} m`, { 'text-anchor': 'middle', 'font-weight': 700, transform: `rotate(${-ang * 180 / Math.PI} ${lx} ${ly})` });
    svgText(svg, C[0] + 12, (B[1] + C[1]) / 2 + 5, `h = ${fmt(h, 1)} m`, { 'font-weight': 700 });
    svgEl('path', { d: `M${A[0] + 40} ${Y0} A40 40 0 0 0 ${A[0] + 40 * Math.cos(ang)} ${Y0 - 40 * Math.sin(ang)}`, fill: 'none', stroke: 'var(--ink3)', 'stroke-width': 1.5 }, svg);
    svgText(svg, A[0] + 48, Y0 - 8, `${fmt(ang * 180 / Math.PI, 1)}°`, { 'font-size': 12, fill: 'var(--ink3)' });

    // kaxa arrapalan
    const size = 26 + sM.value / 10;
    const px = A[0] + s * k * Math.cos(ang), py = A[1] - s * k * Math.sin(ang);
    const g = svgEl('g', { transform: `translate(${px} ${py}) rotate(${-ang * 180 / Math.PI})` }, svg);
    svgEl('rect', { x: -size / 2, y: -size, width: size, height: size, fill: 'var(--g2-fill)', stroke: 'var(--s2)', 'stroke-width': 2 }, g);
    svgText(g, 0, -size / 2 + 4, `${sM.value} kg`, { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700 });
    // indarra arrapalaren norabidean
    const cx = px - (size / 2) * Math.sin(ang), cy = py - (size / 2) * Math.cos(ang);
    const fl = 30 + Math.min(80, F / 8);
    const fx = cx + (size / 2 + 4) * Math.cos(ang), fy = cy - (size / 2 + 4) * Math.sin(ang);
    svgArrow(svg, fx, fy, fx + fl * Math.cos(ang), fy - fl * Math.sin(ang), 'var(--s1)', 3.5);
    svgText(svg, fx + fl * Math.cos(ang) + 6, fy - fl * Math.sin(ang) - 6, `F = ${fmt(F, 0)} N`, { 'font-weight': 700, fill: 'var(--s1)', 'font-size': 13 });
    // pisua
    svgArrow(svg, cx, cy, cx, cy + 44, 'var(--s2)', 2.5);
    svgText(svg, cx + 8, cy + 46, `P = ${fmt(P, 0)} N`, { 'font-size': 12, 'font-weight': 700, fill: 'var(--s2-ink)' });

    // zuzenean igotzeko alderaketa
    svgEl('line', { x1: C[0] + 70, y1: Y0, x2: C[0] + 70, y2: C[1], stroke: 'var(--ink3)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
    svgText(svg, C[0] + 78, C[1] + 16, 'Zuzenean:', { 'font-size': 12, fill: 'var(--ink3)' });
    svgText(svg, C[0] + 78, C[1] + 32, `F = ${fmt(P, 0)} N`, { 'font-size': 12, fill: 'var(--ink3)' });

    box.querySelector('#pi-p').textContent = fmt(P, 0) + ' N';
    box.querySelector('#pi-ang').textContent = `${fmt(ang * 180 / Math.PI, 1)}° · % ${fmt(h / base * 100, 0)}`;
    box.querySelector('#pi-f').textContent = fmt(F, 1) + ' N';
    box.querySelector('#pi-am').textContent = fmt(L / h, 2);
    box.querySelector('#pi-wf').textContent = `${fmt(F, 1)} · ${fmt(s, 2)} = ${fmt(F * s, 0)} J`;
    box.querySelector('#pi-wp').textContent = `${fmt(P, 0)} · ${fmt(frac * h, 2)} = ${fmt(P * frac * h, 0)} J`;
  }

  draw();
  return () => {};
}
