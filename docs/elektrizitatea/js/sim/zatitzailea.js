// Tentsio-zatitzailea: bi erresistentzia, potentziometroa eta LDR sentsorea (farola automatikoa)
import { fmt, slider } from '../util.js';

const fmtK = R => R >= 1000 ? `${fmt(R / 1000, 2)} MΩ` : R >= 1 ? `${fmt(R, 2)} kΩ` : `${fmt(R * 1000, 0)} Ω`;
const ldrR = lux => 10 * Math.pow(lux / 10, -0.7);   // kΩ: 10 lux → 10 kΩ, 1000 lux → 0,4 kΩ, 1 lux → 50 kΩ
const MUGA = 2.5;

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  let modua = 'finkoa';
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 620 320" role="img" aria-label="Tentsio-zatitzailea"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Zirkuitua">
            <button data-m="finkoa" class="active">Bi erresistentzia</button><button data-m="poten">Potentziometroa</button><button data-m="ldr">LDR</button>
          </div>
          <div id="za-ctl" style="display:grid;gap:10px"></div>
          ${maila >= 3 ? `<label class="check" for="za-load" style="display:flex;gap:8px;align-items:center;font-size:15px"><input type="checkbox" id="za-load"> Karga bat konektatu irteeran (R<sub>L</sub>)</label><div id="za-lctl"></div>` : ''}
          <div class="readouts" aria-live="polite" id="za-read"></div>
          <p class="lab-hint" id="za-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span>V<sub>irteera</sub> = E · R₂ / (R₁ + R₂)</span><span id="za-f"></span></div>
    </div>`;
  const $ = s => box.querySelector(s);
  const svg = box.querySelector('svg');
  let s = {};
  let sRL = null;

  function controls() {
    const ctl = $('#za-ctl');
    ctl.innerHTML = '';
    s.E = slider(ctl, { id: 'za-e', label: 'Pilaren tentsioa, E', min: 1, max: 12, step: 0.5, value: modua === 'ldr' ? 5 : 9, unit: 'V', format: v => fmt(v, 1) });
    if (modua === 'finkoa') {
      s.R1 = slider(ctl, { id: 'za-r1', label: 'R₁ (goian)', min: 1, max: 100, step: 1, value: 10, unit: 'kΩ', format: v => fmt(v, 0) });
      s.R2 = slider(ctl, { id: 'za-r2', label: 'R₂ (behean)', min: 1, max: 100, step: 1, value: 20, unit: 'kΩ', format: v => fmt(v, 0) });
      $('#za-txt').textContent = 'Irteerako tentsioa R₂-ren muturretan hartzen da. R₂ handiagoa bada R₁ baino, tentsioaren zati handiagoa hartzen du.';
    } else if (modua === 'poten') {
      s.P = slider(ctl, { id: 'za-p', label: 'Kurtsorearen posizioa', min: 0, max: 100, step: 1, value: 50, unit: '%', format: v => fmt(v, 0) });
      $('#za-txt').textContent = 'Potentziometroa 10 kΩ-eko erresistentzia bat da, erdiko kontaktu mugikor batekin: bi erresistentzietan banatzen du. Bolumen-kontroletan eta joysticketan erabiltzen da.';
    } else {
      s.L = slider(ctl, { id: 'za-l', label: 'Argia', min: 0, max: 3, step: 0.05, value: 2.3, format: v => `${fmt(10 ** v, 0)} lux` });
      $('#za-txt').textContent = `LDRaren erresistentzia argiarekin jaisten da. Iluntzean R₂ handitu, irteerako tentsioa igo eta ${fmt(MUGA, 1)} V gainditzean farola pizten da.`;
    }
    Object.values(s).forEach(x => x.on(draw));
  }

  function values() {
    const E = s.E.value;
    let R1, R2;
    if (modua === 'finkoa') { R1 = s.R1.value; R2 = s.R2.value; }
    else if (modua === 'poten') { R2 = 10 * s.P.value / 100; R1 = 10 - R2; }
    else { R1 = 10; R2 = ldrR(10 ** s.L.value); }
    const load = maila >= 3 && $('#za-load')?.checked;
    const RL = load ? sRL.value : Infinity;
    const R2e = load ? (R2 * RL) / (R2 + RL || 1) : R2;
    const Rt = R1 + R2e;
    const V = Rt > 0 ? E * R2e / Rt : 0, Videal = R1 + R2 > 0 ? E * R2 / (R1 + R2) : 0;
    return { E, R1, R2, RL, load, V, Videal, I: Rt > 0 ? E / Rt : 0 };
  }

  function draw() {
    const v = values();
    const X = 300, yT = 50, yN = 160, yB = 270;
    const res = (cy, label, extra = '') => `<rect x="${X - 10}" y="${cy - 36}" width="20" height="72" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>${extra}<text x="${X - 22}" y="${cy + 5}" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)">${label}</text>`;
    let body;
    if (modua === 'poten') {
      const yw = 88 + (1 - s.P.value / 100) * 144;
      body = `<rect x="${X - 10}" y="88" width="20" height="144" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
        <path d="M${X + 46} ${yw} H${X + 14} M${X + 24} ${yw - 7} L${X + 13} ${yw} L${X + 24} ${yw + 7}" fill="none" stroke="var(--s1)" stroke-width="3"/>
        <path d="M${X} ${yT} V88 M${X} 232 V${yB} M${X + 46} ${yw} H400 V${yN} H470" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
        <text x="${X - 22}" y="${(88 + yw) / 2 + 5}" text-anchor="end" font-size="13.5" font-weight="700" fill="var(--ink)">R₁ = ${fmtK(v.R1)}</text>
        <text x="${X - 22}" y="${(yw + 232) / 2 + 5}" text-anchor="end" font-size="13.5" font-weight="700" fill="var(--ink)">R₂ = ${fmtK(v.R2)}</text>`;
    } else {
      const ldr = modua === 'ldr';
      const lux = ldr ? 10 ** s.L.value : 0;
      const arrows = ldr ? `<circle cx="${X}" cy="215" r="44" fill="none" stroke="var(--ink)" stroke-width="2"/>
        <path d="M${X - 78} 162 L${X - 44} 190 M${X - 52} 178 L${X - 44} 190 L${X - 58} 190 M${X - 88} 186 L${X - 54} 214 M${X - 62} 202 L${X - 54} 214 L${X - 68} 214" stroke="var(--s2)" stroke-width="2.5" fill="none"/>` : '';
      body = `<path d="M${X} ${yT} V${yN - 74} M${X} ${yN - 38} V${yN + 17} M${X} ${yN + 91} V${yB} M${X} ${yN} H470" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
        ${res(yN - 56 + 0, `R₁ = ${fmtK(v.R1)}`)}
        ${ldr ? arrows + `<rect x="${X - 10}" y="179" width="20" height="72" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/><text x="${X + 52}" y="250" font-size="13.5" font-weight="700" fill="var(--ink)">LDR = ${fmtK(v.R2)}</text>` : res(yN + 54, `R₂ = ${fmtK(v.R2)}`)}`;
      if (ldr) {
        const on = v.V > MUGA;
        body += `<g transform="translate(560 40)">
          <rect x="-3" y="30" width="6" height="200" fill="var(--ink3)"/>
          <path d="M0 30 Q0 10 -30 10 H-44" fill="none" stroke="var(--ink3)" stroke-width="6"/>
          ${on ? `<path d="M-60 16 L-100 120 H-8 L-28 16 Z" fill="var(--s2)" opacity=".25"/><circle cx="-44" cy="18" r="16" fill="var(--s2)" opacity=".5"/>` : ''}
          <path d="M-58 8 H-30 L-36 22 H-52 Z" fill="${on ? 'var(--s2)' : 'var(--sheet)'}" stroke="var(--ink)" stroke-width="2"/>
          <text x="0" y="252" text-anchor="middle" font-size="13" font-weight="700" fill="${on ? 'var(--ok)' : 'var(--ink3)'}">${on ? 'PIZTUTA' : 'itzalita'}</text></g>
          <text x="40" y="30" font-size="13" fill="var(--ink2)">${lux < 50 ? 'gaua' : lux < 300 ? 'ilunabarra' : 'eguna'}</text>`;
      }
    }
    const loadDraw = v.load ? `<path d="M470 ${yN} H520 V${yN + 30} M520 ${yN + 90} V${yB} H470" fill="none" stroke="var(--ink)" stroke-width="2.5"/><rect x="510" y="${yN + 30}" width="20" height="60" fill="var(--sheet)" stroke="var(--s4)" stroke-width="2.5"/><text x="538" y="${yN + 65}" font-size="13.5" font-weight="700" fill="var(--s4)">R<tspan font-size="10" dy="3">L</tspan></text>` : '';
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">
      <path d="M90 ${yT} H${X} M90 ${yB} H470 M90 ${yT} V${(yT + yB) / 2 - 7} M90 ${(yT + yB) / 2 + 7} V${yB}" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
      <line x1="72" y1="${(yT + yB) / 2 - 7}" x2="108" y2="${(yT + yB) / 2 - 7}" stroke="var(--ink)" stroke-width="2.5"/>
      <line x1="81" y1="${(yT + yB) / 2 + 7}" x2="99" y2="${(yT + yB) / 2 + 7}" stroke="var(--ink)" stroke-width="6"/>
      <text x="114" y="${(yT + yB) / 2 - 12}" font-size="15" font-weight="700" fill="var(--s4)">+</text>
      <text x="62" y="${(yT + yB) / 2 + 5}" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)">${fmt(v.E, 1)} V</text>
      ${body}
      <path d="M470 ${yN} V${yN + 32} M470 ${yN + 76} V${yB}" stroke="var(--ink)" stroke-width="2.5"/>
      <circle cx="470" cy="${yN + 54}" r="22" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <text x="470" y="${yN + 60}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">V</text>
      <text x="${v.load ? 470 : 500}" y="${v.load ? yN - 12 : yN + 60}" text-anchor="${v.load ? 'middle' : 'start'}" font-size="16" font-weight="700" fill="var(--s1)">${fmt(v.V, 2)} V</text>
      <circle cx="${X}" cy="${yN}" r="4.5" fill="var(--ink)"/>
      ${loadDraw}
    </g>`;
    $('#za-read').innerHTML = `
      <div><span>R₁ / R₂</span><b>${fmtK(v.R1)} / ${fmtK(v.R2)}</b></div>
      <div><span>Korrontea, I</span><b>${fmt(v.I, 3)} mA</b></div>
      <div class="hi"><span>Irteerako tentsioa</span><b>${fmt(v.V, 3)} V</b></div>
      ${v.load ? `<div><span>Kargarik gabe</span><b>${fmt(v.Videal, 3)} V</b></div>` : ''}`;
    $('#za-f').textContent = `${fmt(v.E, 1)} · ${fmt(v.R2, 2)} / (${fmt(v.R1, 2)} + ${fmt(v.R2, 2)}) = ${fmt(v.Videal, 2)} V`;
  }

  box.querySelectorAll('[data-m]').forEach(bt => bt.addEventListener('click', () => {
    modua = bt.dataset.m;
    box.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('active', x === bt));
    s = {};
    controls();
    draw();
  }));
  if (maila >= 3) {
    sRL = slider($('#za-lctl'), { id: 'za-rl', label: 'Kargaren erresistentzia, R_L', min: 1, max: 100, step: 1, value: 10, unit: 'kΩ', format: x => fmt(x, 0) });
    sRL.on(draw);
    $('#za-load').addEventListener('change', draw);
  }
  controls();
  draw();
}
