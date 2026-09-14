// Sorgailu erreala: i.e.e. (ε) eta barne-erresistentzia (r); V–I ezaugarria eta potentzia kanpoko erresistentziaren arabera
import { fmt, slider, fmtA } from '../util.js';

const RMAX = 30;

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 620 360" role="img" aria-label="Sorgailu erreala, karga eta grafikoak"></svg></div>
        <div class="sim-panel">
          <div id="so-ctl" style="display:grid;gap:10px"></div>
          <div class="pills"><button class="btn sm" id="so-open">Zirkuitu irekia</button><button class="btn sm" id="so-max">R = r (potentzia max.)</button><button class="btn sm ghost" id="so-short">Zirkuitulaburra</button></div>
          <div class="readouts" id="so-read" aria-live="polite"></div>
        </div>
      </div>
      <div class="sim-foot"><span>V = ε − r · I &nbsp;·&nbsp; I = ε / (R + r)</span><span>P max: R = r</span></div>
    </div>`;
  const $ = s => box.querySelector(s);
  const svg = box.querySelector('svg');
  const ctl = $('#so-ctl');
  const sE = slider(ctl, { id: 'so-e', label: 'Indar elektroeragilea, ε', min: 1.5, max: 24, step: 0.5, value: 12, unit: 'V', format: v => fmt(v, 1) });
  const sr = slider(ctl, { id: 'so-r', label: 'Barne-erresistentzia, r', min: 0.1, max: 5, step: 0.1, value: 2, unit: 'Ω', format: v => fmt(v, 1) });
  const sR = slider(ctl, { id: 'so-R', label: 'Kanpoko erresistentzia, R', min: 0, max: RMAX, step: 0.1, value: 6, unit: 'Ω', format: v => fmt(v, 1) });
  let open = false;

  function draw() {
    const e = sE.value, r = sr.value, Rv = sR.value;
    const I = open ? 0 : e / (Rv + r), V = e - r * I, PR = V * I, Pr = I * I * r, Pmax = e * e / (4 * r);
    const eta = e > 0 ? V / e : 0;
    // ---- zirkuitua ----
    const yT = 60, yB = 280;
    let s = `<g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M100 ${yT} V120 M100 134 V172 M100 228 V${yB}"/>
      <path d="M100 ${yT} H140 M168 ${yT} H${open ? 244 : 260} M${open ? 262 : 260} ${yT} H270 V142 M270 198 V${yB} H100"/>
      <path d="M205 ${yT} V142 M205 198 V${yB}"/>
    </g>
    <rect x="52" y="86" width="96" height="170" rx="6" fill="none" stroke="var(--ink3)" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="100" y="304" text-anchor="middle" font-size="12.5" fill="var(--ink3)">sorgailua</text>
    <line x1="82" y1="120" x2="118" y2="120" stroke="var(--ink)" stroke-width="2.5"/><line x1="91" y1="134" x2="109" y2="134" stroke="var(--ink)" stroke-width="6"/>
    <text x="72" y="131" text-anchor="end" font-size="15" font-weight="700" fill="var(--ink)">ε</text>
    <rect x="92" y="172" width="16" height="56" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <text x="72" y="205" text-anchor="end" font-size="15" font-weight="700" fill="var(--ink)">r</text>
    <circle cx="100" cy="${yT}" r="5" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><circle cx="100" cy="${yB}" r="5" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
    <circle cx="154" cy="${yT}" r="14" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/><text x="154" y="${yT + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">A</text>
    <text x="154" y="${yT - 22}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--s1)">${fmtA(I)}</text>
    <circle cx="205" cy="170" r="20" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/><text x="205" y="176" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">V</text>
    <text x="205" y="212" text-anchor="middle" font-size="14" font-weight="700" fill="var(--s1)">${fmt(V, 2)} V</text>
    <rect x="261" y="142" width="18" height="56" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <path d="M250 212 L292 128 M284 132 L292 128 L292 137" stroke="var(--ink)" stroke-width="2" fill="none"/>
    <text x="270" y="232" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--ink)">R = ${fmt(Rv, 1)} Ω</text>
    ${open ? '<text x="253" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="var(--danger)">irekita</text>' : ''}`;

    // ---- V–I grafikoa ----
    const gx0 = 350, gx1 = 600, gy0 = 150, gy1 = 24;
    const Icc = e / r, Imax = Icc;
    const X = i => gx0 + i / Imax * (gx1 - gx0), Y = v => gy0 - v / e * (gy0 - gy1);
    s += `<g font-family="Lato, system-ui, sans-serif">
      <line x1="${gx0}" y1="${gy0}" x2="${gx1}" y2="${gy0}" stroke="var(--ink)" stroke-width="1.5"/><line x1="${gx0}" y1="${gy0}" x2="${gx0}" y2="${gy1 - 6}" stroke="var(--ink)" stroke-width="1.5"/>
      <line x1="${X(0)}" y1="${Y(e)}" x2="${X(Icc)}" y2="${Y(0)}" stroke="var(--s1)" stroke-width="2.5"/>
      <line x1="${X(I)}" y1="${gy0}" x2="${X(I)}" y2="${Y(V)}" stroke="var(--ink3)" stroke-dasharray="4 3"/>
      <circle cx="${X(I)}" cy="${Y(V)}" r="6.5" fill="var(--sheet)" stroke="var(--s4)" stroke-width="3"/>
      <text x="${gx0 - 6}" y="${gy1 + 5}" text-anchor="end" font-size="12.5" fill="var(--ink2)">ε</text>
      <text x="${gx1}" y="${gy0 + 16}" text-anchor="end" font-size="12.5" fill="var(--ink2)">I<tspan font-size="9" dy="2">cc</tspan><tspan dy="-2"> = ${fmt(Icc, 2)} A</tspan></text>
      <text x="${gx0 + 6}" y="${gy1 - 6}" font-size="13" font-weight="700" fill="var(--ink)">V bornetan – I</text>`;

    // ---- P–R grafikoa ----
    const px0 = 350, px1 = 600, py0 = 330, py1 = 200;
    const PX = R => px0 + R / RMAX * (px1 - px0), PY = P => py0 - P / (Pmax * 1.1) * (py0 - py1);
    const pts = [];
    for (let R = 0; R <= RMAX + 1e-9; R += 0.25) pts.push(`${PX(R)},${PY(e * e * R / ((R + r) ** 2))}`);
    s += `<line x1="${px0}" y1="${py0}" x2="${px1}" y2="${py0}" stroke="var(--ink)" stroke-width="1.5"/><line x1="${px0}" y1="${py0}" x2="${px0}" y2="${py1 - 6}" stroke="var(--ink)" stroke-width="1.5"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="var(--s2)" stroke-width="2.5"/>
      <line x1="${PX(r)}" y1="${py0}" x2="${PX(r)}" y2="${PY(Pmax)}" stroke="var(--s2)" stroke-dasharray="4 3"/>
      <text x="${PX(r) + 4}" y="${py0 - 4}" font-size="12" fill="var(--ink2)">R = r</text>
      ${!open && Rv <= RMAX ? `<circle cx="${PX(Rv)}" cy="${PY(PR)}" r="6.5" fill="var(--sheet)" stroke="var(--s4)" stroke-width="3"/>` : ''}
      <text x="${px0 + 6}" y="${py1 - 6}" font-size="13" font-weight="700" fill="var(--ink)">P kanpoan – R</text>
      <text x="${px1}" y="${py0 + 16}" text-anchor="end" font-size="12.5" fill="var(--ink2)">R (0–${RMAX} Ω)</text>
      <text x="${px0 - 6}" y="${PY(Pmax) + 4}" text-anchor="end" font-size="12" fill="var(--ink2)">${fmt(Pmax, 1)} W</text>
    </g>`;
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">${s}</g>`;

    $('#so-read').innerHTML = `
      <div><span>Korrontea, I</span><b>${fmtA(I)}</b></div>
      <div class="hi"><span>Bornen arteko tentsioa, V</span><b>${fmt(V, 2)} V</b></div>
      <div><span>Barnean galdua, r·I</span><b>${fmt(r * I, 2)} V</b></div>
      <div><span>Kanpoko potentzia, P<sub>R</sub></span><b>${fmt(PR, 2)} W</b></div>
      <div><span>Barneko galerak, r·I²</span><b>${fmt(Pr, 2)} W</b></div>
      <div><span>Errendimendua, η = V / ε</span><b>${fmt(eta * 100, 0)} %</b></div>`;
  }
  [sE, sr, sR].forEach(s => s.on(() => { open = false; draw(); }));
  $('#so-open').addEventListener('click', () => { open = true; draw(); });
  $('#so-max').addEventListener('click', () => { open = false; sR.value = sr.value; draw(); });
  $('#so-short').addEventListener('click', () => { open = false; sR.value = 0; draw(); });
  draw();
}
