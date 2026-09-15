// Robot-besoa: bi artikulazioko beso planarra (bi askatasun-gradu) eta pintza.
// Zinematika zuzena (angeluetatik posiziora), alderantzizkoa (posiziotik angeluetara, ukondoa gora edo behera)
// eta zeregin bat: kuboak hartu eta helburura eraman.
// Aukerak: modua ('zuzena' | 'alderantzizkoa' | 'zeregina'), maila
import { fmt, slider } from '../util.js';

const L1 = 12, L2 = 9;               // cm
const SC = 13;                       // px / cm
const OX = 320, OY = 300;            // oinarria SVGn
const rad = g => g * Math.PI / 180, deg = r => r * 180 / Math.PI;
const px = (x, y) => [OX + x * SC, OY - y * SC];
const T = (x, y, s, cls = 'rbs-t', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;

export function zuzena(t1, t2) {
  const x1 = L1 * Math.cos(rad(t1)), y1 = L1 * Math.sin(rad(t1));
  return { x1, y1, x: x1 + L2 * Math.cos(rad(t1 + t2)), y: y1 + L2 * Math.sin(rad(t1 + t2)) };
}
export function alderantzizkoa(x, y, goian = true) {
  const c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c2 < -1 || c2 > 1) return null;
  const t2 = (goian ? -1 : 1) * Math.acos(c2);
  const t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
  return { t1: deg(t1), t2: deg(t2) };
}

export default function mount(box, opts = {}) {
  const P = 'rb' + Math.random().toString(36).slice(2, 7);
  let modua = ['zuzena', 'alderantzizkoa', 'zeregina'].includes(opts.modua) ? opts.modua : 'zuzena';
  let t1 = 60, t2 = 45, helbT1 = 60, helbT2 = 45, pintzaItxita = false, goian = true;
  let helburua = { x: 10, y: 10 }, kuboak = [], zona = { x: -14, y: 0 }, lortuak = 0, heldua = null, arrastoa = [];
  let raf = 0, last = performance.now(), hilda = false, arrastatzen = false, azkenRead = '';

  box.innerHTML = `
    <div class="sim rbss">
      <div class="kn-modua"><div class="seg" role="group" aria-label="Modua">
        <button data-m="zuzena">Zinematika zuzena</button><button data-m="alderantzizkoa">Alderantzizkoa</button><button data-m="zeregina">Hartu eta utzi</button>
      </div></div>
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 640 340" role="img" aria-label="Bi artikulazioko robot-besoa"></svg></div>
        <div class="sim-panel">
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="pills" id="${P}-botoiak"></div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          <p class="lab-hint" id="${P}-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span>x = L₁·cos θ₁ + L₂·cos(θ₁ + θ₂) · y = L₁·sin θ₁ + L₂·sin(θ₁ + θ₂)</span><span>L₁ = ${L1} cm · L₂ = ${L2} cm</span></div>
    </div>`;
  const $ = q => box.querySelector(q);
  const svg = $(`#${P}-svg`);
  let s1, s2;

  function mezua(t, mota = '') { const el = $(`#${P}-msg`); el.className = 'rb-msg' + (mota ? ' ' + mota : ''); el.textContent = t; }

  function kuboBerriak() {
    kuboak = [];
    while (kuboak.length < 2) {
      const r = 6 + Math.random() * 13, a = rad(15 + Math.random() * 70);
      const k = { x: Math.round(r * Math.cos(a) * 2) / 2, y: 0.75, hartuta: false, utzita: false };
      if (kuboak.every(o => Math.abs(o.x - k.x) > 3)) kuboak.push(k);
    }
    lortuak = 0;
    heldua = null;
  }

  function kontrolak() {
    const ctl = $(`#${P}-ctl`), bt = $(`#${P}-botoiak`);
    ctl.innerHTML = bt.innerHTML = '';
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === modua); b.setAttribute('aria-pressed', String(b.dataset.m === modua)); });
    mezua('');
    if (modua === 'alderantzizkoa') {
      bt.innerHTML = `<div class="seg" role="group" aria-label="Ukondoa"><button data-u="1" class="${goian ? 'active' : ''}">Ukondoa gora</button><button data-u="0" class="${goian ? '' : 'active'}">Ukondoa behera</button></div>`;
      bt.querySelectorAll('[data-u]').forEach(b => b.addEventListener('click', () => { goian = b.dataset.u === '1'; bt.querySelectorAll('[data-u]').forEach(x => x.classList.toggle('active', x === b)); ebatzi(); }));
      s1 = slider(ctl, { id: P + '-hx', label: 'Helburua, x', min: -21, max: 21, step: 0.5, value: helburua.x, unit: 'cm', format: v => fmt(v, 1) }).on(v => { helburua.x = v; ebatzi(); });
      s2 = slider(ctl, { id: P + '-hy', label: 'Helburua, y', min: 0, max: 21, step: 0.5, value: helburua.y, unit: 'cm', format: v => fmt(v, 1) }).on(v => { helburua.y = v; ebatzi(); });
      $(`#${P}-txt`).textContent = 'Zinematika alderantzizkoa: pintzaren posizioa (x, y) ematen da, eta programak kalkulatzen ditu artikulazioen angeluak. Puntu gehienetara bi modutan irits daiteke: ukondoa gora edo behera. Sakatu edo arrastatu eszenan helburua mugitzeko.';
      ebatzi();
    } else {
      s1 = slider(ctl, { id: P + '-t1', label: 'Sorbalda, θ₁', min: 0, max: 180, step: 1, value: Math.round(helbT1), unit: '°', format: v => fmt(v, 0) }).on(v => { helbT1 = v; });
      s2 = slider(ctl, { id: P + '-t2', label: 'Ukondoa, θ₂', min: -150, max: 150, step: 1, value: Math.round(helbT2), unit: '°', format: v => fmt(v, 0) }).on(v => { helbT2 = v; });
      if (modua === 'zeregina') {
        bt.innerHTML = `<button class="btn primary" id="${P}-pintza">Itxi pintza</button><button class="btn ghost" id="${P}-berri">Kubo berriak</button>`;
        $(`#${P}-pintza`).addEventListener('click', pintza);
        $(`#${P}-berri`).addEventListener('click', () => { kuboBerriak(); mezua(''); });
        if (!kuboak.length) kuboBerriak();
        $(`#${P}-txt`).textContent = 'Mugitu besoa angeluekin, itxi pintza kubo baten gainean, eraman kutxa berdera eta ireki pintza. Industriako robotek mugimendu hauek programatuta errepikatzen dituzte (pick and place).';
      } else {
        $(`#${P}-txt`).textContent = 'Zinematika zuzena: artikulazio bakoitzaren angelua ezagututa, pintzaren posizioa kalkulatzen da. Sorbaldaren angelua lurrarekiko neurtzen da; ukondoarena, lehen segmentuarekiko.';
      }
    }
  }

  function ebatzi() {
    const s = alderantzizkoa(helburua.x, helburua.y, goian);
    if (!s) { mezua(`Helburua lan-eremutik kanpo dago: ${fmt(Math.hypot(helburua.x, helburua.y), 1)} cm; tartea ${L1 - L2}–${L1 + L2} cm.`, 'err'); return; }
    let t1n = s.t1;
    if (t1n < -90) t1n += 360;
    if (t1n < -1 || t1n > 181) { mezua(`Irtenbide horretan sorbaldak ${fmt(t1n, 0)}° beharko lituzke (muga: 0°–180°). Probatu beste ukondo-posizioa.`, 'warn'); return; }
    helbT1 = t1n; helbT2 = s.t2;
    mezua('');
  }

  function pintza() {
    const p = zuzena(t1, t2);
    if (!pintzaItxita) {
      pintzaItxita = true;
      const k = kuboak.find(o => !o.utzita && Math.hypot(o.x - p.x, o.y - p.y) < 1.6);
      if (k) { heldua = k; k.hartuta = true; mezua('Kuboa hartuta! Eraman kutxa berdera.', 'ok'); }
      else mezua('Pintza itxi da, baina ez dago kuborik azpian. Hurbildu gehiago.', 'warn');
    } else {
      pintzaItxita = false;
      if (heldua) {
        const barruan = Math.abs(p.x - zona.x) < 3 && p.y < 5;
        if (barruan) { heldua.utzita = true; heldua.x = p.x; heldua.y = 0.75; lortuak++; mezua(lortuak === kuboak.length ? 'Zeregina osatuta: kubo guztiak kutxan!' : 'Kuboa kutxan. Hurrengoa!', 'ok'); }
        else { heldua.x = p.x; heldua.y = 0.75; mezua('Kuboa kutxatik kanpo erori da.', 'warn'); }
        heldua.hartuta = false;
        heldua = null;
      }
    }
    $(`#${P}-pintza`).textContent = pintzaItxita ? 'Ireki pintza' : 'Itxi pintza';
  }

  function marraztu() {
    const p = zuzena(t1, t2);
    const [bx, by] = px(0, 0), [ex, ey] = px(p.x1, p.y1), [tx, ty] = px(p.x, p.y);
    let s = `<rect class="rbs-lurra" x="0" y="${OY}" width="640" height="40"/>`;
    s += `<path class="rbs-eremua" d="M${OX - (L1 + L2) * SC} ${OY} A${(L1 + L2) * SC} ${(L1 + L2) * SC} 0 0 1 ${OX + (L1 + L2) * SC} ${OY} H${OX + (L1 - L2) * SC} A${(L1 - L2) * SC} ${(L1 - L2) * SC} 0 0 0 ${OX - (L1 - L2) * SC} ${OY} Z"/>`;
    for (let c = -20; c <= 20; c += 5) s += `<line class="rbs-sareta" x1="${OX + c * SC}" y1="${OY}" x2="${OX + c * SC}" y2="${OY + 6}"/>${c % 10 === 0 ? T(OX + c * SC, OY + 20, `${c}`, 'rbs-t sm') : ''}`;
    s += T(628, OY + 20, 'x (cm)', 'rbs-t sm', 'end');
    if (modua === 'zeregina') {
      const [zx, zy] = px(zona.x, 0);
      s += `<rect class="rbs-zona" x="${zx - 3 * SC}" y="${zy - 2.5 * SC}" width="${6 * SC}" height="${2.5 * SC}"/>${T(zx, zy - 2.5 * SC - 6, 'kutxa', 'rbs-t sm')}`;
      kuboak.filter(k => k !== heldua).forEach(k => { const [kx, ky] = px(k.x, k.y); s += `<rect class="rbs-kuboa${k.utzita ? ' ondo' : ''}" x="${kx - 10}" y="${ky - 10}" width="20" height="20" rx="2"/>`; });
    }
    if (modua === 'alderantzizkoa') { const [hx, hy] = px(helburua.x, helburua.y); s += `<g class="rbs-helburua"><circle cx="${hx}" cy="${hy}" r="10"/><path d="M${hx - 16} ${hy} H${hx + 16} M${hx} ${hy - 16} V${hy + 16}"/></g>`; }
    if (arrastoa.length > 1) s += `<polyline class="rbs-arrastoa" points="${arrastoa.map(q => px(q[0], q[1]).map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
    // angeluen arkuak
    s += `<path class="rbs-arku" d="M${bx + 34} ${by} A34 34 0 0 0 ${bx + 34 * Math.cos(rad(t1))} ${by - 34 * Math.sin(rad(t1))}"/>${T(bx + 48 * Math.cos(rad(t1 / 2)), by - 48 * Math.sin(rad(t1 / 2)) + 4, `θ₁ ${fmt(t1, 0)}°`, 'rbs-t sm on')}`;
    s += `<line class="rbs-luzapena" x1="${ex}" y1="${ey}" x2="${ex + 40 * Math.cos(rad(t1))}" y2="${ey - 40 * Math.sin(rad(t1))}"/>`;
    s += T(ex + 50 * Math.cos(rad(t1 + t2 / 2)), ey - 50 * Math.sin(rad(t1 + t2 / 2)) + 4, `θ₂ ${fmt(t2, 0)}°`, 'rbs-t sm on');
    // besoa
    s += `<rect class="rbs-oinarria" x="${bx - 28}" y="${by - 14}" width="56" height="14" rx="3"/>`;
    s += `<line class="rbs-segmentua" x1="${bx}" y1="${by}" x2="${ex}" y2="${ey}"/><line class="rbs-segmentua b" x1="${ex}" y1="${ey}" x2="${tx}" y2="${ty}"/>`;
    const a = rad(t1 + t2), zab = pintzaItxita ? 5 : 11;
    const perp = [Math.sin(a), Math.cos(a)];
    const f = [Math.cos(a), -Math.sin(a)];
    s += `<path class="rbs-pintza" d="M${tx + perp[0] * zab} ${ty + perp[1] * zab} l${f[0] * 12} ${f[1] * 12} M${tx - perp[0] * zab} ${ty - perp[1] * zab} l${f[0] * 12} ${f[1] * 12} M${tx + perp[0] * zab} ${ty + perp[1] * zab} L${tx - perp[0] * zab} ${ty - perp[1] * zab}"/>`;
    if (heldua) s += `<rect class="rbs-kuboa" x="${tx + f[0] * 8 - 10}" y="${ty + f[1] * 8 - 10}" width="20" height="20" rx="2"/>`;
    s += `<circle class="rbs-artik" cx="${bx}" cy="${by}" r="8"/><circle class="rbs-artik" cx="${ex}" cy="${ey}" r="7"/><circle class="rbs-muturra" cx="${tx}" cy="${ty}" r="4"/>`;
    const talka = p.y < 0 || p.y1 < 0;
    if (talka) s += T(OX, 30, 'Kontuz: besoak mahaia jotzen du!', 'rbs-t err');
    svg.innerHTML = `<g class="rbs">${s}</g>`;
    const r = Math.hypot(p.x, p.y);
    const read = `<div><span>θ₁ · θ₂</span><b>${fmt(t1, 0)}° · ${fmt(t2, 0)}°</b></div>
      <div class="hi"><span>Pintza (x, y)</span><b>(${fmt(p.x, 1)}, ${fmt(p.y, 1)}) cm</b></div>
      <div><span>Oinarrirako distantzia</span><b>${fmt(r, 1)} cm</b></div>
      ${modua === 'zeregina' ? `<div><span>Kutxan</span><b>${lortuak} / ${kuboak.length}</b></div>` : ''}`;
    if (read !== azkenRead) { $(`#${P}-read`).innerHTML = read; azkenRead = read; }
  }

  function frame(now) {
    if (hilda) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    const pausoa = 90 * dt;
    const hurbildu = (a, b) => Math.abs(b - a) <= pausoa ? b : a + Math.sign(b - a) * pausoa;
    const lehen = [t1, t2];
    t1 = hurbildu(t1, helbT1); t2 = hurbildu(t2, helbT2);
    if (lehen[0] !== t1 || lehen[1] !== t2) {
      const p = zuzena(t1, t2);
      arrastoa.push([p.x, p.y]);
      if (arrastoa.length > 200) arrastoa.shift();
    }
    marraztu();
    raf = requestAnimationFrame(frame);
  }

  function puntuaSVGn(e) {
    const r = svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) / r.width * 640, sy = (e.clientY - r.top) / r.height * 340;
    return { x: Math.round((sx - OX) / SC * 2) / 2, y: Math.max(0, Math.round((OY - sy) / SC * 2) / 2) };
  }
  svg.addEventListener('pointerdown', e => {
    if (modua !== 'alderantzizkoa') return;
    arrastatzen = true;
    try { svg.setPointerCapture(e.pointerId); } catch { /* */ }
    helburua = puntuaSVGn(e);
    s1.value = helburua.x; s2.value = helburua.y;
    ebatzi();
  });
  svg.addEventListener('pointermove', e => {
    if (!arrastatzen || modua !== 'alderantzizkoa') return;
    helburua = puntuaSVGn(e);
    s1.value = helburua.x; s2.value = helburua.y;
    ebatzi();
  });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { arrastatzen = false; }));
  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.m === modua) return;
    if (modua === 'alderantzizkoa') { helbT1 = Math.round(helbT1); helbT2 = Math.round(helbT2); }
    modua = b.dataset.m;
    arrastoa = [];
    kontrolak();
  }));

  kontrolak();
  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
