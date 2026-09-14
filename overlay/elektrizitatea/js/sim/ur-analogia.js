// Ur-analogia: ponpa ↔ pila, presioa ↔ tentsioa, emaria ↔ intentsitatea, hodi estua ↔ erresistentzia
import { fmt, svgEl, slider, fmtA, reducedMotion } from '../util.js';

// Laukizuzen baten perimetroa, erlojuaren orratzen noranzkoan goiko-ezkerretik
function onRect(x1, y1, x2, y2, s) {
  const w = x2 - x1, h = y2 - y1, P = 2 * (w + h);
  s = ((s % P) + P) % P;
  if (s < w) return [x1 + s, y1];
  if (s < w + h) return [x2, y1 + s - w];
  if (s < 2 * w + h) return [x2 - (s - w - h), y2];
  return [x1, y2 - (s - 2 * w - h)];
}

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 640 330" role="img" aria-label="Ur-zirkuitua eta zirkuitu elektrikoa alboz albo"></svg></div>
        <div class="sim-panel">
          <div id="ua-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Tentsioa, V</span><b id="ua-v"></b></div>
            <div><span>Erresistentzia, R</span><b id="ua-r"></b></div>
            <div class="hi"><span>Intentsitatea, I = V / R</span><b id="ua-i"></b></div>
          </div>
          <table class="table-mini">
            <thead><tr><th>Ur-zirkuitua</th><th style="text-align:left">Zirkuitu elektrikoa</th></tr></thead>
            <tbody>
              <tr><td>Ponpa</td><td style="text-align:left">Pila (sorgailua)</td></tr>
              <tr><td>Presio-aldea</td><td style="text-align:left">Tentsioa (V, voltak)</td></tr>
              <tr><td>Emaria (L/s)</td><td style="text-align:left">Intentsitatea (A, amperak)</td></tr>
              <tr><td>Hodi estua</td><td style="text-align:left">Erresistentzia (Ω, ohmak)</td></tr>
              <tr><td>Hodia</td><td style="text-align:left">Kablea</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="sim-foot"><span>Analogia bat da: urak eta elektroiek ez dute berdin jokatzen, baina ideia nagusiak ulertzeko balio du.</span></div>
    </div>`;

  const $ = s => box.querySelector(s);
  const sV = slider($('#ua-ctl'), { id: 'ua-sv', label: 'Pilaren tentsioa (ponparen indarra)', min: 1, max: 12, step: 0.5, value: 6, unit: 'V', format: v => fmt(v, 1) });
  const sR = slider($('#ua-ctl'), { id: 'ua-sr', label: 'Erresistentzia (hodiaren estugunea)', min: 2, max: 24, step: 1, value: 6, unit: 'Ω', format: v => fmt(v, 0) });

  const svg = box.querySelector('svg');
  const W = [40, 60, 280, 270], E = [370, 60, 610, 270];
  svg.innerHTML = `
    <g font-family="Lato, system-ui, sans-serif">
      <text x="160" y="24" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">Ur-zirkuitua</text>
      <text x="490" y="24" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">Zirkuitu elektrikoa</text>
      <rect x="${W[0]}" y="${W[1]}" width="${W[2] - W[0]}" height="${W[3] - W[1]}" fill="none" stroke="var(--ink)" stroke-width="24"/>
      <rect x="${W[0]}" y="${W[1]}" width="${W[2] - W[0]}" height="${W[3] - W[1]}" fill="none" style="stroke:color-mix(in srgb, var(--s1) 22%, var(--sheet))" stroke-width="18"/>
      <rect id="ua-narrow-bg" x="${W[2] - 14}" y="130" width="28" height="70" fill="var(--paper)"/>
      <rect id="ua-narrow" y="130" height="70" fill="var(--ink)"/>
      <rect id="ua-narrow-in" y="130" height="70" style="fill:color-mix(in srgb, var(--s1) 22%, var(--sheet))"/>
      <circle cx="${W[0]}" cy="165" r="26" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <path d="M${W[0]} 180 V150 M${W[0] - 9} 159 L${W[0]} 148 L${W[0] + 9} 159" fill="none" stroke="var(--s4)" stroke-width="3"/>
      <text x="${W[0] + 36}" y="170" font-size="13.5" font-weight="700" fill="var(--ink2)">ponpa</text>
      <text id="ua-nt" x="${W[2] - 26}" y="170" text-anchor="end" font-size="13.5" font-weight="700" fill="var(--ink2)">estugunea</text>
      <rect id="ua-press" x="${W[0] + 40}" width="14" fill="var(--s4)" opacity=".75"/>
      <text x="${W[0] + 60}" y="118" font-size="12.5" fill="var(--ink3)">presioa</text>
      <g id="ua-wd"></g>

      <rect x="${E[0]}" y="${E[1]}" width="${E[2] - E[0]}" height="${E[3] - E[1]}" fill="none" stroke="var(--ink)" stroke-width="3"/>
      <rect x="${E[0] - 22}" y="150" width="44" height="30" fill="var(--paper)"/>
      <line x1="${E[0] - 20}" y1="152" x2="${E[0] + 20}" y2="152" stroke="var(--ink)" stroke-width="3"/>
      <line x1="${E[0] - 10}" y1="170" x2="${E[0] + 10}" y2="170" stroke="var(--ink)" stroke-width="7"/>
      <line x1="${E[0]}" y1="140" x2="${E[0]}" y2="152" stroke="var(--ink)" stroke-width="3"/><line x1="${E[0]}" y1="170" x2="${E[0]}" y2="182" stroke="var(--ink)" stroke-width="3"/>
      <text x="${E[0] + 18}" y="146" font-size="15" font-weight="700" fill="var(--s4)">+</text>
      <text id="ua-ev" x="${E[0] + 28}" y="168" font-size="14" font-weight="700" fill="var(--ink)"></text>
      <rect x="${E[2] - 11}" y="125" width="22" height="80" fill="var(--sheet)" stroke="var(--ink)" stroke-width="3"/>
      <text id="ua-er" x="${E[2] - 20}" y="170" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)"></text>
      <circle cx="490" cy="${E[1]}" r="17" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <text x="490" y="${E[1] + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">A</text>
      <text id="ua-ea" x="490" y="${E[1] + 42}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--s1)"></text>
      <g id="ua-ed"></g>
      <text x="160" y="312" text-anchor="middle" font-size="13.5" fill="var(--ink2)" id="ua-wflow"></text>
      <text x="490" y="312" text-anchor="middle" font-size="13.5" fill="var(--ink2)">puntuak: korronte konbentzionala</text>
    </g>`;

  const N = 20;
  const wd = Array.from({ length: N }, () => svgEl('circle', { r: 4.5, fill: 'var(--s1)' }, svg.querySelector('#ua-wd')));
  const ed = Array.from({ length: N }, () => svgEl('circle', { r: 3.5, fill: 'var(--s1)' }, svg.querySelector('#ua-ed')));
  let phase = 0;

  function draw() {
    const V = sV.value, Rv = sR.value, I = V / Rv;
    const w = Math.max(4, 18 * Math.sqrt(2 / Rv));
    const n = svg.querySelector('#ua-narrow'), ni = svg.querySelector('#ua-narrow-in');
    n.setAttribute('x', W[2] - w / 2 - 3); n.setAttribute('width', w + 6);
    ni.setAttribute('x', W[2] - w / 2); ni.setAttribute('width', w);
    const ph = 80 * V / 12;
    const p = svg.querySelector('#ua-press');
    p.setAttribute('y', 210 - ph); p.setAttribute('height', ph);
    svg.querySelector('#ua-ev').textContent = `${fmt(V, 1)} V`;
    svg.querySelector('#ua-er').textContent = `${fmt(Rv, 0)} Ω`;
    svg.querySelector('#ua-ea').textContent = fmtA(I);
    svg.querySelector('#ua-wflow').textContent = `emaria ∝ ${fmt(I, 2)}`;
    $('#ua-v').textContent = `${fmt(V, 1)} V`;
    $('#ua-r').textContent = `${fmt(Rv, 0)} Ω`;
    $('#ua-i').textContent = fmtA(I);
  }
  sV.on(draw); sR.on(draw);
  draw();

  let raf = 0, last = 0;
  const tick = ts => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    if (!reducedMotion()) phase += dt * 55 * (sV.value / sR.value);
    const Pw = 2 * (W[2] - W[0] + W[3] - W[1]), Pe = 2 * (E[2] - E[0] + E[3] - E[1]);
    wd.forEach((c, i) => { const [x, y] = onRect(...W, phase + i * Pw / N); c.setAttribute('cx', x); c.setAttribute('cy', y); });
    ed.forEach((c, i) => {
      const [x, y] = onRect(...E, phase * Pe / Pw + i * Pe / N);
      const hide = (Math.abs(x - E[0]) < 2 && y > 140 && y < 182) || (Math.abs(x - E[2]) < 2 && y > 125 && y < 205) || (Math.abs(y - E[1]) < 2 && Math.abs(x - 490) < 18);
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('visibility', hide ? 'hidden' : 'visible');
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
