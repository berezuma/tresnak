// Adimen artifiziala: sailkapena datuetatik ikasiz. Fruituak bi ezaugarrirekin (tamaina eta kolorea):
// k auzokide hurbilenak (k-NN) eta neurona bakarra (pertzeptroia). Datuak gehitu, probarako zati bat gorde
// eta zehaztasuna neurtu. Datu alboratuek zer eragiten duten ere ikus daiteke.
// Aukerak: modua ('knn' | 'neurona'), maila
import { fmt, slider } from '../util.js';

const X0 = 50, Y0 = 370, S = 32;                 // grafikoa: 0–10 unitate, 32 px unitateko
const px = (x, y) => [X0 + x * S, Y0 - y * S];
const KLASEAK = { A: 'sagarra', B: 'laranja' };
const T = (x, y, s, cls = 'ia-t', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;

function ausazkoa(hazia) { let h = hazia >>> 0; return () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; }; }
function normala(r) { return Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()); }

export const DATUAK = {
  fruituak: { izena: 'Fruituak', sortu(r) {
    const d = [];
    for (let i = 0; i < 18; i++) d.push({ x: 5.4 + normala(r) * 0.9, y: 2.4 + normala(r) * 1.2, k: 'A' });
    for (let i = 0; i < 18; i++) d.push({ x: 7.2 + normala(r) * 0.9, y: 7.2 + normala(r) * 1.1, k: 'B' });
    return d;
  } },
  nahasia: { izena: 'Nahasiak (zaila)', sortu(r) {
    const d = [];
    for (let i = 0; i < 20; i++) d.push({ x: 5.8 + normala(r) * 1.4, y: 4.2 + normala(r) * 1.8, k: 'A' });
    for (let i = 0; i < 20; i++) d.push({ x: 6.8 + normala(r) * 1.4, y: 5.8 + normala(r) * 1.8, k: 'B' });
    return d;
  } },
  alboratua: { izena: 'Alboratuak', sortu(r) {
    // entrenamenduan laranja handiak bakarrik; probetan laranja txikiak ere badaude
    const d = [];
    for (let i = 0; i < 16; i++) d.push({ x: 4.6 + normala(r) * 0.7, y: 3 + normala(r) * 1.2, k: 'A' });
    for (let i = 0; i < 16; i++) d.push({ x: 8.3 + normala(r) * 0.5, y: 6.5 + normala(r) * 1.3, k: 'B' });
    for (let i = 0; i < 8; i++) d.push({ x: 4.8 + normala(r) * 0.5, y: 6.2 + normala(r) * 1, k: 'B', proba: true, beti: true });
    return d;
  } },
  hutsa: { izena: 'Hutsa', sortu: () => [] }
};

export default function mount(box, opts = {}) {
  const P = 'ia' + Math.random().toString(36).slice(2, 7);
  let modua = opts.modua === 'neurona' ? 'neurona' : 'knn';
  let did = 'fruituak', puntuak = [], tresna = 'A', probaZatia = false, hazia = 7;
  let w = [0, 0], bias = 0, aroak = 0, mapaCache = null;

  box.innerHTML = `
    <div class="sim ias">
      <div class="kn-modua"><div class="seg" role="group" aria-label="Algoritmoa"><button data-m="knn">k auzokide hurbilenak (k-NN)</button><button data-m="neurona">Neurona (pertzeptroia)</button></div></div>
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 400 410" role="img" aria-label="Sailkapen-grafikoa: fruituak tamainaren eta kolorearen arabera"></svg></div>
        <div class="sim-panel">
          <label class="fd-hautatu" for="${P}-d">Datu-multzoa
            <select id="${P}-d">${Object.entries(DATUAK).map(([k, d]) => `<option value="${k}">${d.izena}</option>`).join('')}</select>
          </label>
          <div><h4 class="fd-h">Sakatu grafikoan:</h4><div class="seg" role="group" aria-label="Tresna">
            <button data-t="A" class="active">+ Sagarra</button><button data-t="B">+ Laranja</button><button data-t="Q">? Galdetu</button>
          </div></div>
          <label class="check" for="${P}-proba"><input type="checkbox" id="${P}-proba"> Datuen herena probarako gorde (ez dira entrenatzeko erabiltzen)</label>
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="pills" id="${P}-botoiak"></div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <p class="lab-hint" id="${P}-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span><i class="ia-leg A"></i> sagarra · <i class="ia-leg B"></i> laranja · ◯ proba-datua · ◆ galdera</span><span id="${P}-foot"></span></div>
    </div>`;
  const $ = q => box.querySelector(q);
  const svg = $(`#${P}-svg`);
  let sK, sLr;

  function kargatu(k) {
    did = k;
    puntuak = DATUAK[k].sortu(ausazkoa(hazia++)).map(p => ({ ...p, x: Math.max(0.2, Math.min(9.8, p.x)), y: Math.max(0.2, Math.min(9.8, p.y)) }));
    markatuProba();
    w = [0, 0]; bias = 0; aroak = 0;
    mapaCache = null;
  }
  function markatuProba() {
    let i = 0;
    puntuak.forEach(p => { if (p.k === 'Q') return; if (p.beti) { p.proba = true; return; } p.proba = probaZatia && (i++ % 3 === 2); });
    mapaCache = null;
  }
  const entrenamendua = () => puntuak.filter(p => p.k !== 'Q' && !p.proba);

  // ---------- algoritmoak ----------
  function knn(x, y, k, baztertu = null) {
    const auzo = entrenamendua().filter(p => p !== baztertu).map(p => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
    if (!auzo.length) return { k: null, auzo };
    const a = auzo.filter(o => o.p.k === 'A').length, b = auzo.length - a;
    return { k: a === b ? auzo[0].p.k : a > b ? 'A' : 'B', auzo };
  }
  const neurona = (x, y) => w[0] * x / 10 + w[1] * y / 10 + bias;
  const iragarri = (x, y, baztertu = null) => modua === 'knn' ? knn(x, y, sK.value, baztertu).k : (entrenamendua().length ? (neurona(x, y) > 0 ? 'B' : 'A') : null);

  function aroBat() {
    const lr = sLr.value;
    const datuak = entrenamendua().slice().sort(() => Math.random() - 0.5);
    let akatsak = 0;
    datuak.forEach(p => {
      const t = p.k === 'B' ? 1 : 0, yv = neurona(p.x, p.y) > 0 ? 1 : 0;
      if (t !== yv) { akatsak++; w[0] += lr * (t - yv) * p.x / 10; w[1] += lr * (t - yv) * p.y / 10; bias += lr * (t - yv); }
    });
    aroak++;
    mapaCache = null;
    return akatsak;
  }

  function zehaztasuna(multzoa, loo = false) {
    if (!multzoa.length) return null;
    const ondo = multzoa.filter(p => iragarri(p.x, p.y, loo ? p : null) === p.k).length;
    return { ondo, guztira: multzoa.length };
  }

  function kontrolak() {
    const ctl = $(`#${P}-ctl`), bt = $(`#${P}-botoiak`);
    ctl.innerHTML = bt.innerHTML = '';
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === modua); b.setAttribute('aria-pressed', String(b.dataset.m === modua)); });
    sK = slider(ctl, { id: P + '-k', label: 'k (auzokide kopurua)', min: 1, max: 9, step: 2, value: 3, format: v => fmt(v, 0) }).on(() => { mapaCache = null; marraztu(); });
    sLr = slider(ctl, { id: P + '-lr', label: 'Ikasteko abiadura', min: 0.05, max: 1, step: 0.05, value: 0.3, format: v => fmt(v, 2) });
    sK.wrap.hidden = modua !== 'knn';
    sLr.wrap.hidden = modua !== 'neurona';
    if (modua === 'neurona') {
      bt.innerHTML = `<button class="btn sm primary" id="${P}-aro">Entrenatu: aro 1</button><button class="btn sm" id="${P}-aro10">10 aro</button><button class="btn sm ghost" id="${P}-pisuak">Berrezarri pisuak</button>`;
      $(`#${P}-aro`).addEventListener('click', () => { aroBat(); marraztu(); });
      $(`#${P}-aro10`).addEventListener('click', () => { for (let i = 0; i < 10; i++) aroBat(); marraztu(); });
      $(`#${P}-pisuak`).addEventListener('click', () => { w = [0, 0]; bias = 0; aroak = 0; mapaCache = null; marraztu(); });
      $(`#${P}-txt`).textContent = 'Neurona batek ezaugarri bakoitza pisu batez biderkatzen du eta batu egiten ditu. Emaitza 0 baino handiagoa bada, «laranja». Entrenatzean, akats bakoitzarekin pisuak pixka bat zuzentzen dira. Mugaketa beti lerro zuzen bat da.';
    } else {
      $(`#${P}-txt`).textContent = 'k-NN: fruitu berri bat sailkatzeko, entrenamenduko k fruitu antzekoenak (hurbilenak) bilatzen dira, eta gehiengoaren klasea ematen zaio. Ez du formularik ikasten: datuak gogoratzen ditu.';
    }
    mapaCache = null;
    marraztu();
  }

  function mapa() {
    if (mapaCache) return mapaCache;
    const N = 25, step = 10 / N;
    let s = '';
    if (entrenamendua().length) {
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const k = iragarri((i + 0.5) * step, (j + 0.5) * step);
        if (!k) continue;
        const [x, y] = px(i * step, (j + 1) * step);
        s += `<rect class="ia-mapa ${k}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(step * S + 0.5).toFixed(1)}" height="${(step * S + 0.5).toFixed(1)}"/>`;
      }
    }
    mapaCache = s;
    return s;
  }

  function marraztu() {
    let s = `<rect class="ia-plot" x="${X0}" y="${Y0 - 10 * S}" width="${10 * S}" height="${10 * S}"/>` + mapa();
    for (let v = 0; v <= 10; v += 2) {
      const [x, y] = px(v, v);
      s += `<line class="ia-sareta" x1="${x}" y1="${Y0}" x2="${x}" y2="${Y0 - 10 * S}"/><line class="ia-sareta" x1="${X0}" y1="${y}" x2="${X0 + 10 * S}" y2="${y}"/>${T(x, Y0 + 16, v, 'ia-t sm')}${T(X0 - 8, y + 4, v, 'ia-t sm', 'end')}`;
    }
    s += T(X0 + 5 * S, Y0 + 34, 'Tamaina (cm)', 'ia-t') + `<text class="ia-t" transform="translate(14 ${Y0 - 5 * S}) rotate(-90)" text-anchor="middle">Kolorea (0 gorria · 10 laranja)</text>`;
    if (modua === 'neurona' && (w[0] || w[1])) {
      // w0·x/10 + w1·y/10 + b = 0
      const pts = [];
      [[0, null], [10, null], [null, 0], [null, 10]].forEach(([x, y]) => {
        if (x !== null && w[1]) { const yy = -(bias + w[0] * x / 10) * 10 / w[1]; if (yy >= 0 && yy <= 10) pts.push([x, yy]); }
        if (y !== null && w[0]) { const xx = -(bias + w[1] * y / 10) * 10 / w[0]; if (xx >= 0 && xx <= 10) pts.push([xx, y]); }
      });
      if (pts.length >= 2) { const [a, b] = [px(...pts[0]), px(...pts[1])]; s += `<line class="ia-lerroa" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`; }
    }
    puntuak.filter(p => p.k === 'Q').forEach(q => {
      if (modua !== 'knn') return;
      knn(q.x, q.y, sK.value).auzo.forEach(o => { const [a, b] = [px(q.x, q.y), px(o.p.x, o.p.y)]; s += `<line class="ia-auzo" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`; });
    });
    puntuak.forEach(p => {
      const [x, y] = px(p.x, p.y);
      if (p.k === 'Q') {
        const k = iragarri(p.x, p.y);
        s += `<path class="ia-galdera ${k || ''}" d="M${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} L${x - 8} ${y} Z"/>`;
      } else {
        const ondo = !p.proba || iragarri(p.x, p.y) === p.k;
        s += `<circle class="ia-p ${p.k}${p.proba ? ' proba' : ''}${ondo ? '' : ' okerra'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5"/>`;
      }
    });
    svg.innerHTML = `<g class="ia">${s}</g>`;

    const entr = entrenamendua(), proba = puntuak.filter(p => p.proba && p.k !== 'Q'), galderak = puntuak.filter(p => p.k === 'Q');
    const zE = zehaztasuna(entr, modua === 'knn'), zP = zehaztasuna(proba);
    const ehun = z => z ? `${z.ondo} / ${z.guztira} (% ${fmt(z.ondo / z.guztira * 100, 0)})` : '—';
    $(`#${P}-read`).innerHTML = `
      <div><span>Entrenamendu-datuak</span><b>${entr.filter(p => p.k === 'A').length} sagar · ${entr.filter(p => p.k === 'B').length} laranja</b></div>
      <div><span>Zehaztasuna entrenamenduan${modua === 'knn' ? ' (bat kanpoan)' : ''}</span><b>${ehun(zE)}</b></div>
      <div class="hi"><span>Zehaztasuna proba-datuetan</span><b>${ehun(zP)}</b></div>
      ${modua === 'neurona' ? `<div><span>Pisuak (w₁, w₂, b) · aroak</span><b>${fmt(w[0], 2)}, ${fmt(w[1], 2)}, ${fmt(bias, 2)} · ${aroak}</b></div>` : ''}
      ${galderak.length ? `<div><span>Galderak</span><b>${galderak.map(q => KLASEAK[iragarri(q.x, q.y)] || '?').join(', ')}</b></div>` : ''}`;
    $(`#${P}-foot`).textContent = modua === 'neurona' ? 'irteera = w₁·tamaina + w₂·kolorea + b > 0 → laranja' : `k = ${sK.value}: auzokideen gehiengoa`;
  }

  svg.addEventListener('click', e => {
    const r = svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) / r.width * 400, sy = (e.clientY - r.top) / r.height * 410;
    const x = (sx - X0) / S, y = (Y0 - sy) / S;
    if (x < 0 || x > 10 || y < 0 || y > 10) return;
    puntuak.push({ x, y, k: tresna });
    markatuProba();
    marraztu();
  });
  box.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { tresna = b.dataset.t; box.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('active', x === b)); }));
  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { if (b.dataset.m !== modua) { modua = b.dataset.m; kontrolak(); } }));
  $(`#${P}-d`).addEventListener('change', e => { kargatu(e.target.value); if (e.target.value === 'alboratua') { probaZatia = false; $(`#${P}-proba`).checked = false; markatuProba(); } marraztu(); });
  $(`#${P}-proba`).addEventListener('change', e => { probaZatia = e.target.checked; markatuProba(); marraztu(); });

  kargatu('fruituak');
  kontrolak();
}
