// Kontrol-sistemak: gela baten tenperatura berogailu batekin. Begizta irekia (eskuzko potentzia), begizta itxia
// (termostatoa, histeresiarekin) eta kontrol proportzionala. Blokeen diagrama eta tenperaturaren grafikoa denboran.
// Eredua: τ · dT/dt = 25 °C · u − (T − T_kanpoa) · galerak   (τ = 2 h; u = berogailuaren potentzia, 0–1)
// Aukerak: modua ('irekia' | 'itxia' | 'proportzionala'), maila
import { fmt, slider } from '../util.js';

const TAU = 120;           // min
const DT_MAX = 25;         // °C, potentzia osoan
const P_KW = 2;            // berogailuaren potentzia
const LEIHOA = 12 * 60;    // grafikoaren leihoa, min

const T = (x, y, s, cls = 'ks-t', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
const ordua = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.floor(min % 60)).padStart(2, '0')}`;

export default function mount(box, opts = {}) {
  const P = 'kc' + Math.random().toString(36).slice(2, 7);
  let modua = ['irekia', 'itxia', 'proportzionala'].includes(opts.modua) ? opts.modua : 'itxia';
  let Tg = 12, t = 0, u = 0, piztuta = false, leihoa = false, abiadura = 1, energia = 0, piztekop = 0, laginak = [[0, 12, 0]];
  let last = performance.now(), raf = 0, hilda = false, azkenRead = '';

  box.innerHTML = `
    <div class="sim kcs">
      <div class="kn-modua"><div class="seg" role="group" aria-label="Kontrol mota">
        <button data-m="irekia">Begizta irekia</button><button data-m="itxia">Begizta itxia (termostatoa)</button><button data-m="proportzionala">Proportzionala</button>
      </div></div>
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 640 420" role="img" aria-label="Kontrol-sistema: blokeen diagrama eta tenperatura denboran"></svg></div>
        <div class="sim-panel">
          <div class="pills">
            <button class="btn sm" id="${P}-leihoa" aria-pressed="false">🪟 Ireki leihoa</button>
            <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
          </div>
          <div class="seg" role="group" aria-label="Abiadura"><button data-ab="1" class="active">1 s = 3 min</button><button data-ab="5">1 s = 15 min</button></div>
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" id="${P}-read" aria-live="off"></div>
          <p class="lab-hint" id="${P}-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span id="${P}-f1"></span><span id="${P}-f2"></span></div>
    </div>`;
  const $ = q => box.querySelector(q);
  const ctl = $(`#${P}-ctl`);
  const sOut = slider(ctl, { id: P + '-out', label: 'Kanpoko tenperatura', min: -5, max: 20, step: 0.5, value: 8, unit: '°C', format: v => fmt(v, 1) });
  const sSP = slider(ctl, { id: P + '-sp', label: 'Konsigna (nahi den tenperatura)', min: 15, max: 26, step: 0.5, value: 21, unit: '°C', format: v => fmt(v, 1) });
  const extra = document.createElement('div');
  extra.style.cssText = 'display:grid;gap:10px';
  ctl.appendChild(extra);
  const sH = slider(extra, { id: P + '-h', label: 'Histeresia (tartea)', min: 0, max: 4, step: 0.25, value: 1, unit: '°C', format: v => fmt(v, 2) });
  const sU = slider(extra, { id: P + '-u', label: 'Berogailuaren potentzia (eskuz)', min: 0, max: 100, step: 1, value: 55, unit: '%', format: v => fmt(v, 0) });
  const sKp = slider(extra, { id: P + '-kp', label: 'Irabazia, Kp', min: 5, max: 100, step: 5, value: 30, unit: '%/°C', format: v => fmt(v, 0) });

  const TESTUAK = {
    irekia: 'Begizta irekia: berogailuak potentzia finko batekin lan egiten du, tenperatura neurtu gabe. Kanpoan hotzago egiten badu edo leihoa irekitzen bada, ez du ezer zuzentzen.',
    itxia: 'Begizta itxia: sentsore batek tenperatura neurtzen du eta termostatoak konsignarekin konparatzen du. Behetik pasatzean piztu, eta gainetik pasatzean itzali. Histeresiak piztu-itzaltze gehiegi saihesten ditu.',
    proportzionala: 'Kontrol proportzionala: potentzia errorearekiko proportzionala da (u = Kp · e). Leunagoa da, baina beti geratzen da errore txiki bat. Kp handitzean errorea txikitu egiten da, baina sistema ezegonkorragoa izan daiteke.'
  };
  function ezarriModua(m) {
    modua = m;
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === m); b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
    sH.wrap.hidden = m !== 'itxia';
    sU.wrap.hidden = m !== 'irekia';
    sKp.wrap.hidden = m !== 'proportzionala';
    $(`#${P}-txt`).textContent = TESTUAK[m];
  }

  function kontrolatu() {
    const sp = sSP.value, e = sp - Tg;
    if (modua === 'irekia') u = sU.value / 100;
    else if (modua === 'itxia') {
      const lehen = piztuta;
      if (Tg < sp - sH.value / 2) piztuta = true;
      else if (Tg > sp + sH.value / 2) piztuta = false;
      if (piztuta && !lehen) piztekop++;
      u = piztuta ? 1 : 0;
    } else u = Math.max(0, Math.min(1, sKp.value * e / 100));
  }

  function diagrama() {
    const itxia = modua !== 'irekia';
    const sp = sSP.value, e = sp - Tg;
    const kutxa = (x, y, w, izena, balioa, cls = '') => `<rect class="ks-kutxa ${cls}" x="${x}" y="${y}" width="${w}" height="46"/>${T(x + w / 2, y + 20, izena, 'ks-t')}${T(x + w / 2, y + 38, balioa, 'ks-t sm on')}`;
    const gezia = (x1, y1, x2, y2, cls = '') => `<line class="ks-lerroa ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${P}-g)"/>`;
    let s = `<defs><marker id="${P}-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="ks-punta"/></marker></defs>`;
    s += kutxa(8, 34, 92, 'Konsigna', `${fmt(sp, 1)} °C`);
    if (itxia) s += `<circle class="ks-kutxa" cx="136" cy="57" r="13"/>${T(136, 62, '−', 'ks-t')}${T(118, 44, '+', 'ks-t sm')}${gezia(100, 57, 121, 57)}${T(170, 28, `e = ${fmt(e, 1)}`, 'ks-t sm on')}`;
    s += kutxa(172, 34, 116, modua === 'irekia' ? 'Eskuzko agintea' : modua === 'itxia' ? 'Termostatoa' : 'P kontrolagailua', modua === 'irekia' ? `${fmt(u * 100, 0)} %` : modua === 'itxia' ? (piztuta ? 'PIZTU' : 'ITZALI') : `u = ${fmt(u * 100, 0)} %`);
    s += itxia ? gezia(149, 57, 170, 57) : gezia(100, 57, 170, 57);
    s += kutxa(318, 34, 110, 'Berogailua', `${fmt(u * P_KW, 1)} kW`, u > 0 ? 'bero' : '');
    s += gezia(288, 57, 316, 57);
    s += kutxa(458, 34, 110, 'Gela', `${fmt(Tg, 1)} °C`);
    s += gezia(428, 57, 456, 57) + gezia(568, 57, 632, 57);
    s += T(600, 48, 'T', 'ks-t');
    if (leihoa) s += `${gezia(513, 6, 513, 32, 'nahas')}${T(522, 14, 'leihoa: galerak ×4', 'ks-t sm err', 'start')}`;
    s += `<path class="ks-lerroa${itxia ? '' : ' itzalita'}" d="M600 57 V118 H136 V72" marker-end="url(#${P}-g)"/>`;
    s += `<rect class="ks-kutxa${itxia ? '' : ' itzalita'}" x="318" y="100" width="110" height="36"/>${T(373, 123, 'Sentsorea', `ks-t${itxia ? '' : ' itzalita'}`)}`;
    s += T(8, 152, itxia ? 'Atzeraelikadura: irteera neurtu eta sarrerarekin konparatzen da.' : 'Ez dago atzeraelikadurarik: irteera ez da neurtzen.', 'ks-t sm', 'start');
    return s;
  }

  function grafikoa() {
    const X0 = 48, X1 = 628, Y0 = 400, Y1 = 176, Tmax = 35;
    const tHas = Math.max(0, t - LEIHOA);
    const X = tt => X0 + (tt - tHas) / LEIHOA * (X1 - X0), Y = v => Y0 - Math.max(0, Math.min(Tmax, v)) / Tmax * (Y0 - Y1);
    const sp = sSP.value;
    let s = `<rect class="ks-plot" x="${X0}" y="${Y1}" width="${X1 - X0}" height="${Y0 - Y1}"/>`;
    [0, 10, 20, 30].forEach(v => { s += `<line class="ks-sareta" x1="${X0}" y1="${Y(v)}" x2="${X1}" y2="${Y(v)}"/>${T(X0 - 6, Y(v) + 4, `${v}°`, 'ks-t sm', 'end')}`; });
    for (let h = Math.ceil(tHas / 120) * 120; h <= tHas + LEIHOA; h += 120) s += `<line class="ks-sareta" x1="${X(h)}" y1="${Y1}" x2="${X(h)}" y2="${Y0}"/>${T(X(h), Y0 + 14, ordua(h), 'ks-t sm')}`;
    if (modua === 'itxia' && sH.value > 0) s += `<rect class="ks-banda" x="${X0}" y="${Y(sp + sH.value / 2)}" width="${X1 - X0}" height="${Y(sp - sH.value / 2) - Y(sp + sH.value / 2)}"/>`;
    s += `<line class="ks-konsigna" x1="${X0}" y1="${Y(sp)}" x2="${X1}" y2="${Y(sp)}"/>`;
    s += `<line class="ks-kanpoa" x1="${X0}" y1="${Y(sOut.value)}" x2="${X1}" y2="${Y(sOut.value)}"/>${T(X1 - 4, Y(sOut.value) - 5, 'kanpoan', 'ks-t sm', 'end')}`;
    // berogailuaren egoera behean
    s += laginak.filter(l => l[2] > 0.01).map(l => `<rect class="ks-bero" x="${X(l[0]).toFixed(1)}" y="${Y0 - 8}" width="${Math.max(1, (X1 - X0) * 2 / LEIHOA).toFixed(1)}" height="8" opacity="${(0.3 + 0.7 * l[2]).toFixed(2)}"/>`).join('');
    s += `<polyline class="ks-tenp" points="${laginak.map(l => `${X(l[0]).toFixed(1)},${Y(l[1]).toFixed(1)}`).join(' ')}"/>`;
    s += T(X0 + 4, Y1 - 6, 'Tenperatura (°C) · lerro etena: konsigna · behean: berogailua piztuta', 'ks-t sm', 'start');
    return s;
  }

  function frame(now) {
    if (hilda) return;
    const dtReal = Math.min(now - last, 100) / 1000;
    last = now;
    let dt = dtReal * 3 * abiadura;
    while (dt > 0) {
      const h = Math.min(0.5, dt);
      kontrolatu();
      const galerak = leihoa ? 4 : 1;
      Tg += h / TAU * (DT_MAX * u - (Tg - sOut.value) * galerak);
      energia += P_KW * u * h / 60;
      t += h;
      dt -= h;
      if (t - laginak[laginak.length - 1][0] >= 2) { laginak.push([t, Tg, u]); while (laginak.length && laginak[0][0] < t - LEIHOA - 4) laginak.shift(); }
    }
    $(`#${P}-svg`).innerHTML = `<g class="ks">${diagrama()}${grafikoa()}</g>`;
    const e = sSP.value - Tg;
    const read = `<div><span>Ordua (simulazioa)</span><b>${ordua(t)}</b></div>
      <div class="hi"><span>Gelaren tenperatura</span><b>${fmt(Tg, 1)} °C</b></div>
      <div><span>Errorea (konsigna − T)</span><b>${fmt(e, 1)} °C</b></div>
      <div><span>Berogailua</span><b>${fmt(u * 100, 0)} %</b></div>
      ${modua === 'itxia' ? `<div><span>Piztu da</span><b>${piztekop} aldiz</b></div>` : ''}
      <div><span>Energia</span><b>${fmt(energia, 2)} kWh</b></div>`;
    if (read !== azkenRead) { $(`#${P}-read`).innerHTML = read; azkenRead = read; }
    $(`#${P}-f1`).textContent = modua === 'proportzionala' ? 'u = Kp · e (0 eta % 100 artean)' : modua === 'itxia' ? 'T < konsigna − h/2 → piztu · T > konsigna + h/2 → itzali' : 'u finkoa: ez da neurtzen';
    $(`#${P}-f2`).textContent = modua === 'irekia' ? `Oreka: ${fmt(sOut.value, 1)} + 25 · ${fmt(u, 2)}${leihoa ? ' / 4' : ''} = ${fmt(sOut.value + DT_MAX * u / (leihoa ? 4 : 1), 1)} °C` : '';
    raf = requestAnimationFrame(frame);
  }

  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => ezarriModua(b.dataset.m)));
  box.querySelectorAll('[data-ab]').forEach(b => b.addEventListener('click', () => { abiadura = +b.dataset.ab; box.querySelectorAll('[data-ab]').forEach(x => x.classList.toggle('active', x === b)); }));
  $(`#${P}-leihoa`).addEventListener('click', e => {
    leihoa = !leihoa;
    e.currentTarget.setAttribute('aria-pressed', String(leihoa));
    e.currentTarget.classList.toggle('primary', leihoa);
    e.currentTarget.textContent = leihoa ? '🪟 Itxi leihoa' : '🪟 Ireki leihoa';
  });
  $(`#${P}-reset`).addEventListener('click', () => { Tg = 12; t = 0; energia = 0; piztekop = 0; piztuta = false; laginak = [[0, 12, 0]]; });

  ezarriModua(modua);
  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
