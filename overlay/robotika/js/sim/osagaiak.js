// Osagai elektronikoak: LEDa eta bere erresistentzia, kondentsadorearen karga eta deskarga (RC), eta transistorea etengailu gisa.
// Aukerak: modua ('led' | 'kondentsadorea' | 'transistorea'), maila
import { fmt, slider, reducedMotion } from '../util.js';

const LEDAK = {
  gorria: { izena: 'Gorria', Vf: 1.8, kolorea: '#ff3b30' },
  berdea: { izena: 'Berdea', Vf: 2.1, kolorea: '#2fbf5b' },
  urdina: { izena: 'Urdina', Vf: 3.0, kolorea: '#2f7bff' }
};
const ERRE = 0.04;   // 40 mA-tik gora LEDa erre egiten da
const IMAX = 0.02;   // 20 mA: korronte nominala
const T = (x, y, s, a = {}) => `<text x="${x}" y="${y}" ${Object.entries({ 'font-size': 14, 'font-weight': 700, fill: 'var(--ink)', ...a }).map(([k, v]) => `${k}="${v}"`).join(' ')}>${s}</text>`;
// Azpiindizea SVG testuan: azpi('V', 'C', ' = 3 V')
const azpi = (a, b, gero = '') => `${a}<tspan dy="4" font-size="10">${b}</tspan><tspan dy="-4">${gero}</tspan>`;
const fmtR = R => R >= 1000 ? `${fmt(R / 1000, 2)} kΩ` : `${fmt(R, 0)} Ω`;
const fmtI = I => I >= 0.1 ? `${fmt(I, 3)} A` : `${fmt(I * 1000, 1)} mA`;

// Pila bertikala (+ goian): x, y erdian
const pila = (x, y, label) => `<line x1="${x - 18}" y1="${y - 6}" x2="${x + 18}" y2="${y - 6}" stroke="var(--ink)" stroke-width="2.5"/>
  <line x1="${x - 9}" y1="${y + 6}" x2="${x + 9}" y2="${y + 6}" stroke="var(--ink)" stroke-width="6"/>
  ${T(x + 24, y - 12, '+', { fill: 'var(--s4)', 'font-size': 16 })}${T(x - 26, y + 5, label, { 'text-anchor': 'end' })}`;
// Korronte-gezia (punta), noranzkoa: r, l, u, d
const gezia = (x, y, dir, col = 'var(--s1)') => {
  const [dx, dy] = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[dir];
  return `<path d="M${x + dx * 8} ${y + dy * 8} L${x - dx * 6 - dy * 6} ${y - dy * 6 + dx * 6} L${x - dx * 6 + dy * 6} ${y - dy * 6 - dx * 6} Z" fill="${col}"/>`;
};

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  const P = 'os' + Math.random().toString(36).slice(2, 7);
  let modua = ['led', 'kondentsadorea', 'transistorea'].includes(opts.modua) ? opts.modua : 'led';
  let s = {}, raf = 0, hilda = false;
  // LED egoera
  let kolorea = 'gorria', alderantziz = false, erreta = false;
  // RC egoera
  let kargatzen = true, Vc = 0, t = 0, historia = [[0, 0]], abiadura = 1, last = 0;

  box.innerHTML = `
    <div class="sim oss">
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 620 350" role="img" aria-label="Zirkuitu elektronikoa"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Osagaia">
            <button data-m="led">LEDa</button><button data-m="kondentsadorea">Kondentsadorea</button><button data-m="transistorea">Transistorea</button>
          </div>
          <div id="${P}-extra" style="display:grid;gap:10px"></div>
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <p class="lab-hint" id="${P}-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span id="${P}-f1"></span><span id="${P}-f2"></span></div>
    </div>`;
  const $ = q => box.querySelector(q);
  const svg = $(`#${P}-svg`);

  function kontrolak() {
    cancelAnimationFrame(raf);
    const ctl = $(`#${P}-ctl`), ex = $(`#${P}-extra`);
    ctl.innerHTML = ex.innerHTML = '';
    s = {};
    // RC moduan balioak fotograma bakoitzean aldatzen dira: pantaila-irakurgailuak ez ditu iragartzen
    $(`#${P}-read`).setAttribute('aria-live', modua === 'kondentsadorea' ? 'off' : 'polite');
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === modua); b.setAttribute('aria-pressed', String(b.dataset.m === modua)); });
    if (modua === 'led') {
      ex.innerHTML = `<div class="seg" role="group" aria-label="LEDaren kolorea">${Object.entries(LEDAK).map(([k, L]) => `<button data-kol="${k}" class="${k === kolorea ? 'active' : ''}">${L.izena}</button>`).join('')}</div>
        <label class="check" for="${P}-alder"><input type="checkbox" id="${P}-alder" ${alderantziz ? 'checked' : ''}> LEDa alderantziz konektatu</label>
        <button class="btn sm" id="${P}-berria" hidden>Jarri LED berri bat</button>`;
      s.E = slider(ctl, { id: P + '-e', label: 'Pilaren tentsioa, E', min: 1.5, max: 12, step: 0.5, value: 9, unit: 'V', format: v => fmt(v, 1) });
      s.R = slider(ctl, { id: P + '-r', label: 'Erresistentzia, R', min: 10, max: 1000, step: 10, value: 470, unit: 'Ω', format: v => fmt(v, 0) });
      ex.querySelectorAll('[data-kol]').forEach(b => b.addEventListener('click', () => {
        kolorea = b.dataset.kol;
        ex.querySelectorAll('[data-kol]').forEach(x => x.classList.toggle('active', x === b));
        marraztu();
      }));
      $(`#${P}-alder`).addEventListener('change', e => { alderantziz = e.target.checked; marraztu(); });
      $(`#${P}-berria`).addEventListener('click', () => { erreta = false; marraztu(); });
      $(`#${P}-txt`).innerHTML = 'LEDak korrontea noranzko batean bakarrik uzten du pasatzen (anodotik katodora), eta bere muturretan tentsio ia finkoa du. Erresistentziak korrontea mugatzen du: gabe, LEDa erre egiten da.';
    } else if (modua === 'kondentsadorea') {
      ex.innerHTML = `<div class="seg" role="group" aria-label="Etengailua"><button data-k="1" class="${kargatzen ? 'active' : ''}">Kargatu</button><button data-k="0" class="${kargatzen ? '' : 'active'}">Deskargatu</button></div>
        <div class="seg" role="group" aria-label="Abiadura"><button data-ab="1" class="${abiadura === 1 ? 'active' : ''}">Denbora erreala</button><button data-ab="5" class="${abiadura === 5 ? 'active' : ''}">× 5</button></div>`;
      s.E = slider(ctl, { id: P + '-e', label: 'Pilaren tentsioa, E', min: 1, max: 12, step: 0.5, value: 9, unit: 'V', format: v => fmt(v, 1) });
      s.R = slider(ctl, { id: P + '-r', label: 'Erresistentzia, R', min: 1, max: 47, step: 1, value: 10, unit: 'kΩ', format: v => fmt(v, 0) });
      s.C = slider(ctl, { id: P + '-c', label: 'Kapazitatea, C', min: 100, max: 2200, step: 100, value: 470, unit: 'µF', format: v => fmt(v, 0) });
      ex.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k === '1';
        if (k === kargatzen) return;
        kargatzen = k;
        t = 0;
        historia = [[0, Vc]];
        ex.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('active', x === b));
      }));
      ex.querySelectorAll('[data-ab]').forEach(b => b.addEventListener('click', () => {
        abiadura = +b.dataset.ab;
        ex.querySelectorAll('[data-ab]').forEach(x => x.classList.toggle('active', x === b));
      }));
      $(`#${P}-txt`).innerHTML = 'Kondentsadoreak karga elektrikoa metatzen du. Ez da berehala kargatzen: erresistentziak korrontea mugatzen du. <b>τ = R · C</b> denboran % 63ra iristen da, eta 5τ ondoren ia beteta dago.';
      last = performance.now();
      const frame = now => {
        if (hilda || modua !== 'kondentsadorea') return;
        const dt = Math.min(now - last, 100) / 1000 * abiadura;
        last = now;
        const tau = s.R.value * 1e3 * s.C.value * 1e-6;
        const helb = kargatzen ? s.E.value : 0;
        Vc = helb + (Vc - helb) * Math.exp(-dt / tau);
        t += dt;
        if (t <= 5.2 * tau) historia.push([t, Vc]);
        if (historia.length > 1500) historia = historia.filter((_, i) => i % 2 === 0);
        marraztu();
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    } else {
      s.V = slider(ctl, { id: P + '-v', label: 'Sarrerako tentsioa, V<sub>in</sub>', min: 0, max: 5, step: 0.1, value: 3.3, unit: 'V', format: v => fmt(v, 1) });
      s.Rb = slider(ctl, { id: P + '-rb', label: 'Oinarriko erresistentzia, R<sub>B</sub>',min: 1, max: 100, step: 1, value: 10, unit: 'kΩ', format: v => fmt(v, 0) });
      s.B = slider(ctl, { id: P + '-b', label: 'Korronte-irabazia, β', min: 50, max: 400, step: 10, value: 150, format: v => fmt(v, 0) });
      $(`#${P}-txt`).innerHTML = 'Oinarriko korronte txiki batek (I<sub>B</sub>) kolektoreko korronte handi bat (I<sub>C</sub>) kontrolatzen du. Horrela, 3,3 V-ko pin batek motor bat piztu dezake. Transistorea <b>asetasunean</b> dagoenean, etengailu itxi bat bezala dago.';
    }
    Object.values(s).forEach(x => x.on(() => { if (modua === 'kondentsadorea') { t = 0; historia = [[0, Vc]]; } marraztu(); }));
    marraztu();
  }

  // ---------- LEDa ----------
  function led() {
    const L = LEDAK[kolorea], E = s.E.value, R = s.R.value;
    const I0 = !alderantziz && E > L.Vf ? (E - L.Vf) / R : 0;
    if (I0 > ERRE) erreta = true;
    const I = erreta ? 0 : I0;
    const VR = I * R, VL = erreta ? E : alderantziz ? E : Math.min(E, L.Vf);
    const argia = Math.min(I / IMAX, 1);
    const egoera = erreta ? 'erreta!' : alderantziz ? 'itzalita (alderantziz: ez du uzten pasatzen)' : I === 0 ? 'itzalita (tentsio gutxiegi)' : I < 0.004 ? 'argi ahula' : I <= 0.025 ? 'ondo' : 'arriskuan: korronte gehiegi';
    const yT = 60, yB = 270, xL = 90, xR = 500, yM = (yT + yB) / 2;
    let g = `<g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M${xL} ${yM - 6} V${yT} H230 M310 ${yT} H${xR} V${yM - 22} M${xR} ${yM + 22} V${yB} H${xL} V${yM + 6}"/></g>
      ${pila(xL, yM, `${fmt(E, 1)} V`)}
      <rect x="230" y="${yT - 11}" width="80" height="22" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      ${T(270, yT - 20, `R = ${fmtR(R)}`, { 'text-anchor': 'middle' })}`;
    // LED ikurra
    const up = alderantziz;
    const tri = up ? `M${xR - 16} ${yM + 14} L${xR + 16} ${yM + 14} L${xR} ${yM - 14} Z` : `M${xR - 16} ${yM - 14} L${xR + 16} ${yM - 14} L${xR} ${yM + 14} Z`;
    const barY = up ? yM - 14 : yM + 14;
    if (argia > 0) g += `<circle cx="${xR}" cy="${yM}" r="${30 + 16 * argia}" fill="${L.kolorea}" opacity="${0.15 + 0.4 * argia}"/>`;
    g += `<path d="${tri}" fill="${argia > 0 ? L.kolorea : 'var(--sheet)'}" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="${xR - 18}" y1="${barY}" x2="${xR + 18}" y2="${barY}" stroke="var(--ink)" stroke-width="3"/>
      <path d="M${xR + 22} ${yM - 4} l14 -14 m-7 0 h7 v7 M${xR + 24} ${yM + 10} l14 -14 m-7 0 h7 v7" stroke="${argia > 0 ? L.kolorea : 'var(--ink3)'}" stroke-width="2" fill="none"/>
      ${T(xR + 50, yM + 5, `LED ${L.izena.toLowerCase()}`)}
      ${T(xR - 26, yM - 16, up ? 'K' : 'A', { 'text-anchor': 'end', fill: 'var(--ink2)', 'font-size': 12 })}${T(xR - 26, yM + 26, up ? 'A' : 'K', { 'text-anchor': 'end', fill: 'var(--ink2)', 'font-size': 12 })}`;
    if (erreta) g += `<path d="M${xR - 22} ${yM - 22} L${xR + 22} ${yM + 22} M${xR + 22} ${yM - 22} L${xR - 22} ${yM + 22}" stroke="var(--danger)" stroke-width="5"/>${T(xR, yB + 30, 'Erreta!', { 'text-anchor': 'middle', fill: 'var(--danger)' })}`;
    if (I > 0) g += gezia(170, yT, 'r') + gezia(400, yT, 'r') + gezia(300, yB, 'l') + T(400, yT + 26, `I = ${fmtI(I)}`, { 'text-anchor': 'middle', fill: 'var(--s1)' });
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">${g}</g>`;
    svg.setAttribute('aria-label', `LED zirkuitua: E = ${fmt(E, 1)} V, R = ${fmt(R, 0)} Ω, I = ${fmtI(I)}, LEDa ${egoera}`);
    $(`#${P}-berria`).hidden = !erreta;
    const Rgom = Math.max(0, (E - L.Vf) / 0.015);
    $(`#${P}-read`).innerHTML = `
      <div><span>LEDaren tentsioa, V<sub>LED</sub></span><b>${fmt(VL, 1)} V</b></div>
      <div><span>Erresistentziarena, V<sub>R</sub></span><b>${fmt(VR, 2)} V</b></div>
      <div class="hi"><span>Korrontea, I</span><b>${fmtI(I)}</b></div>
      <div><span>R-ren potentzia</span><b>${fmt(I * I * R * 1000, 0)} mW</b></div>
      <div><span>LEDa</span><b style="color:${erreta || I > 0.025 ? 'var(--danger)' : I > 0.004 ? 'var(--ok)' : 'var(--ink2)'}">${egoera}</b></div>`;
    $(`#${P}-f1`).innerHTML = 'I = (E − V<sub>LED</sub>) / R';
    $(`#${P}-f2`).textContent = E > L.Vf ? `15 mA-rako: R = (${fmt(E, 1)} − ${fmt(L.Vf, 1)}) / 0,015 = ${fmt(Rgom, 0)} Ω` : `E ≤ ${fmt(L.Vf, 1)} V: LEDak ez du argirik egiten`;
  }

  // ---------- kondentsadorea ----------
  function kondentsadorea() {
    const E = s.E.value, R = s.R.value, C = s.C.value, tau = R * 1e3 * C * 1e-6;
    const I = kargatzen ? (E - Vc) / (R * 1e3) : Vc / (R * 1e3);
    let g = '';
    // eskema
    const yT = 40, yB = 140;
    g += `<g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M60 ${(yT + yB) / 2 - 6} V${yT} H150 M60 ${(yT + yB) / 2 + 6} V${yB} H440 V${(yT + yB) / 2 + 6} M440 ${(yT + yB) / 2 - 6} V${yT} H320 M240 ${yT} H200"/>
      <path d="M200 ${yT} L${kargatzen ? '152 ' + yT : '176 ' + (yT + 30)}" stroke="var(--s4)" stroke-width="3"/>
      <path d="M176 ${yT + 42} V${yB}"/></g>
      <circle cx="150" cy="${yT}" r="4" fill="var(--ink)"/><circle cx="200" cy="${yT}" r="4" fill="var(--ink)"/><circle cx="176" cy="${yT + 38}" r="4" fill="var(--ink)"/><circle cx="176" cy="${yB}" r="4" fill="var(--ink)"/>
      ${T(176, yT - 12, kargatzen ? 'kargatu' : 'deskargatu', { 'text-anchor': 'middle', fill: 'var(--s4)', 'font-size': 12.5 })}
      ${pila(60, (yT + yB) / 2, `${fmt(E, 1)} V`)}
      <rect x="240" y="${yT - 10}" width="80" height="20" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      ${T(280, yT - 17, `R = ${fmt(R, 0)} kΩ`, { 'text-anchor': 'middle' })}
      <line x1="418" y1="${(yT + yB) / 2 - 6}" x2="462" y2="${(yT + yB) / 2 - 6}" stroke="var(--ink)" stroke-width="3.5"/>
      <line x1="418" y1="${(yT + yB) / 2 + 6}" x2="462" y2="${(yT + yB) / 2 + 6}" stroke="var(--ink)" stroke-width="3.5"/>
      ${T(472, (yT + yB) / 2 + 5, `C = ${fmt(C, 0)} µF`)}
      ${T(472, (yT + yB) / 2 + 25, azpi('V', 'C', ` = ${fmt(Vc, 2)} V`), { fill: 'var(--s1)' })}`;
    if (Math.abs(I) > 1e-6 && Math.abs(I) * R * 1e3 > 0.02) g += gezia(360, yT, kargatzen ? 'r' : 'l');
    // grafikoa
    const gx0 = 60, gx1 = 590, gy0 = 320, gy1 = 180;
    const tMax = 5 * tau, X = tt => gx0 + (gx1 - gx0) * Math.min(tt / tMax, 1), Y = v => gy0 - (gy0 - gy1) * v / Math.max(E, 0.1);
    g += `<g stroke="var(--rule)" stroke-width="1">${[1, 2, 3, 4, 5].map(k => `<line x1="${X(k * tau)}" y1="${gy1}" x2="${X(k * tau)}" y2="${gy0}" stroke-dasharray="3 4"/>`).join('')}</g>
      <path d="M${gx0} ${gy1 - 6} V${gy0} H${gx1 + 8}" stroke="var(--ink)" stroke-width="1.8" fill="none"/>
      ${[1, 2, 3, 4, 5].map(k => T(X(k * tau), gy0 + 16, `${k}τ`, { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink2)' })).join('')}
      ${T(gx0 - 8, Y(E) + 4, fmt(E, 1) + ' V', { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--ink2)' })}
      ${T(gx0 - 8, gy0 + 4, '0', { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--ink2)' })}
      <line x1="${gx0}" y1="${Y(E * (kargatzen ? 0.632 : 0.368))}" x2="${X(tau)}" y2="${Y(E * (kargatzen ? 0.632 : 0.368))}" stroke="var(--s2)" stroke-width="1.5" stroke-dasharray="5 4"/>
      ${T(gx0 + 4, Y(E * (kargatzen ? 0.632 : 0.368)) - 5, kargatzen ? '% 63' : '% 37', { 'font-size': 12, fill: 'var(--s2-ink)' })}
      <polyline points="${historia.map(([tt, v]) => `${X(tt).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--s1)" stroke-width="3"/>
      <circle cx="${X(t)}" cy="${Y(Vc)}" r="4.5" fill="var(--s4)"/>
      ${T(gx1, gy1 - 8, azpi('V', 'C', `(t) · ${kargatzen ? 'karga' : 'deskarga'}`),{ 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ink2)' })}`;
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">${g}</g>`;
    svg.setAttribute('aria-label', `RC zirkuitua: τ = ${fmt(tau, 2)} s, kondentsadorearen tentsioa ${fmt(Vc, 2)} V`);
    $(`#${P}-read`).innerHTML = `
      <div><span>Denbora-konstantea, τ = R·C</span><b>${fmt(tau, 2)} s</b></div>
      <div><span>Denbora (${kargatzen ? 'kargatzen' : 'deskargatzen'})</span><b>${fmt(Math.min(t, 99.9), 1)} s</b></div>
      <div class="hi"><span>Tentsioa, V<sub>C</sub></span><b>${fmt(Vc, 2)} V (% ${fmt(Vc / E * 100, 0)})</b></div>
      <div><span>Korrontea</span><b>${fmt(Math.abs(I) * 1000, 3)} mA</b></div>
      <div><span>Karga, Q = C·V</span><b>${fmt(C * Vc / 1000, 2)} mC</b></div>`;
    $(`#${P}-f1`).textContent = `τ = ${fmt(R, 0)} kΩ · ${fmt(C, 0)} µF = ${fmt(tau, 2)} s`;
    $(`#${P}-f2`).textContent = `5τ = ${fmt(5 * tau, 1)} s: % 99 kargatuta`;
  }

  // ---------- transistorea ----------
  function transistorea() {
    const Vin = s.V.value, Rb = s.Rb.value * 1e3, beta = s.B.value, Vcc = 9, Rm = 60;
    const Ib = Math.max(0, (Vin - 0.7) / Rb);
    const Isat = (Vcc - 0.2) / Rm;
    const Ic = Math.min(beta * Ib, Isat);
    const egoera = Ib === 0 ? 'ebakidura' : beta * Ib >= Isat ? 'asetasuna' : 'eskualde aktiboa';
    const Vce = Vcc - Ic * Rm;
    const txt = { ebakidura: 'ebakidura: etengailu irekia', asetasuna: 'asetasuna: etengailu itxia', 'eskualde aktiboa': 'aktiboa: I<sub>C</sub> = β · I<sub>B</sub>' }[egoera];
    const bizkor = Ic / Isat;
    const bx = 400, by = 200;
    let g = `<g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M340 40 H520 M430 40 V78 M430 122 V${by - 32} L${bx - 10} ${by - 12} M${bx - 10} ${by + 12} L430 ${by + 32} V290 H120 V${by + 30} M120 ${by} H250 M310 ${by} H${bx - 10}"/>
      <line x1="${bx - 10}" y1="${by - 22}" x2="${bx - 10}" y2="${by + 22}" stroke-width="4"/></g>
      <circle cx="${bx + 12}" cy="${by}" r="36" fill="none" stroke="var(--ink)" stroke-width="2"/>
      ${gezia(418, by + 26, 'r', 'var(--ink)').replace('d="', 'transform="rotate(27 418 ' + (by + 26) + ')" d="')}
      <circle cx="120" cy="${by}" r="6" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <path d="M104 290 H136 M110 297 H130 M116 304 H124" stroke="var(--ink)" stroke-width="2.5"/>
      ${T(120, by - 14, azpi('V', 'in', ` = ${fmt(Vin, 1)} V`), { 'text-anchor': 'middle' })}
      <rect x="250" y="${by - 10}" width="60" height="20" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      ${T(280, by - 18, azpi('R', 'B', ` = ${fmt(Rb / 1000, 0)} kΩ`), { 'text-anchor': 'middle' })}
      ${T(bx + 54, by - 22, 'C', { fill: 'var(--ink2)', 'font-size': 12 })}${T(bx - 34, by - 8, 'B', { fill: 'var(--ink2)', 'font-size': 12 })}${T(bx + 54, by + 32, 'E', { fill: 'var(--ink2)', 'font-size': 12 })}
      ${T(520, 34, '+9 V', { 'text-anchor': 'end' })}
      <g class="os-motor${bizkor > 0.02 ? ' on' : ''}" style="--abiadura:${bizkor > 0.02 ? (1.6 / bizkor).toFixed(2) + 's' : '0s'}">
        <circle cx="430" cy="100" r="22" fill="${bizkor > 0.02 ? 'color-mix(in srgb, var(--s1) 22%, var(--sheet))' : 'var(--sheet)'}" stroke="var(--ink)" stroke-width="2.5"/>
        <g class="os-helize" style="transform-origin:430px 100px">${reducedMotion() ? '' : `<path d="M430 86 V114 M416 100 H444" stroke="var(--s1)" stroke-width="2" opacity="${bizkor > 0.02 ? 0.7 : 0}"/>`}</g>
        ${T(430, 105, 'M', { 'text-anchor': 'middle' })}</g>
      ${T(462, 105, `motorra (${Rm} Ω)`, { 'font-size': 13, fill: 'var(--ink2)' })}`;
    if (Ib > 0) g += gezia(200, by, 'r') + T(200, by + 26, azpi('I', 'B', ` = ${fmt(Ib * 1000, 2)} mA`), { 'text-anchor': 'middle', fill: 'var(--s1)', 'font-size': 13 });
    if (Ic > 0) g += gezia(430, 150, 'd') + T(440, 158, azpi('I', 'C', ` = ${fmtI(Ic)}`),{ fill: 'var(--s1)', 'font-size': 13 }) + gezia(430, 262, 'd');
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">${g}</g>`;
    svg.setAttribute('aria-label', `NPN transistorea etengailu gisa: I_B = ${fmt(Ib * 1000, 2)} mA, I_C = ${fmtI(Ic)}, ${egoera}`);
    $(`#${P}-read`).innerHTML = `
      <div><span>Oinarriko korrontea, I<sub>B</sub></span><b>${fmt(Ib * 1000, 2)} mA</b></div>
      <div><span>β · I<sub>B</sub></span><b>${fmtI(beta * Ib)}</b></div>
      <div><span>Korronte maximoa (asetasuna)</span><b>${fmtI(Isat)}</b></div>
      <div class="hi"><span>Kolektoreko korrontea, I<sub>C</sub></span><b>${fmtI(Ic)}</b></div>
      <div><span>V<sub>CE</sub></span><b>${fmt(Vce, 2)} V</b></div>
      <div><span>Egoera</span><b style="color:${egoera === 'asetasuna' ? 'var(--ok)' : egoera === 'ebakidura' ? 'var(--ink2)' : 'var(--s2-ink)'}">${txt}</b></div>`;
    $(`#${P}-f1`).innerHTML = 'I<sub>B</sub> = (V<sub>in</sub> − 0,7 V) / R<sub>B</sub> · I<sub>C</sub> = β · I<sub>B</sub>';
    $(`#${P}-f2`).innerHTML = `Asetzeko: I<sub>B</sub> ≥ ${fmt(Isat / beta * 1000, 2)} mA`;
  }

  function marraztu() {
    if (modua === 'led') led();
    else if (modua === 'kondentsadorea') kondentsadorea();
    else transistorea();
  }

  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.m === modua) return;
    modua = b.dataset.m;
    kontrolak();
  }));
  void maila;
  kontrolak();
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
