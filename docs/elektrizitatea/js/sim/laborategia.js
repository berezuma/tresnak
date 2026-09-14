// Zirkuitu-laborategia: sarean osagaiak jarri, kableekin lotu, eta zirkuitua benetan ebatzi (analisi nodala).
// Aukerak: adibidea, adibideak[], tresnak[], analisia, balioak, zabala, gorde (localStorage gakoa), id, maila, onChange
import { fmt, svgEl, esc, reducedMotion, slider, fmtA, fmtV, fmtR, fmtP } from '../util.js';
import { ebatzi, neurketa, distira, bonbilla, BONBILLAK } from '../zirkuitua.js';
import { ADIBIDEAK } from '../zirkuituak.js';

const S = 80, M = 56, L = S / 2;
const R_BALIOAK = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 22, 25, 30, 33, 40, 47, 50, 60, 68, 75, 82, 100, 120, 150, 200, 220, 250, 300, 330, 470, 500, 680, 1000, 1500, 2200, 4700, 10000];
const FUS_BALIOAK = [0.5, 1, 2, 5];

export const MOTAK = {
  hautatu: { izena: 'Hautatu' },
  kablea: { izena: 'Kablea', gorputza: 0 },
  pila: { izena: 'Pila', gorputza: 7, aurrizkia: 'E' },
  erresistentzia: { izena: 'Erresistentzia', gorputza: 20, aurrizkia: 'R' },
  bonbilla: { izena: 'Bonbilla', gorputza: 15, aurrizkia: 'L' },
  etengailua: { izena: 'Etengailua', gorputza: 0, aurrizkia: 'S' },
  amperimetroa: { izena: 'Amperimetroa', gorputza: 14, aurrizkia: 'A' },
  voltimetroa: { izena: 'Voltimetroa', gorputza: 14, aurrizkia: 'V' },
  fusiblea: { izena: 'Fusiblea', gorputza: 16, aurrizkia: 'F' },
  ezabatu: { izena: 'Ezabatu' },
  nodoa: { izena: 'Nodoa' },
  begizta: { izena: 'Begizta' }
};
const OSAGAIAK = ['kablea', 'pila', 'erresistentzia', 'bonbilla', 'etengailua', 'amperimetroa', 'voltimetroa', 'fusiblea'];

// ---------- ikurrak (IEC), ertzaren norabidean: -L … +L ----------
export function ikurra(c, { distira: b = 0, rot = 0, kolorea } = {}) {
  const ink = 'var(--ink)';
  const wire = kolorea || ink;
  const g = s => `<g stroke="${wire}" stroke-width="2.5" stroke-linecap="round" fill="none">${s}</g>`;
  const lead = (x1, x2) => `<line x1="${x1}" y1="0" x2="${x2}" y2="0"/>`;
  const letter = t => `<text transform="rotate(${-rot})" text-anchor="middle" dominant-baseline="central" font-family="Lato, system-ui, sans-serif" font-weight="700" font-size="15" fill="${ink}">${t}</text>`;
  switch (c.mota) {
    case 'kablea': return g(lead(-L, L));
    case 'pila': {
      const p = c.alderantziz ? -1 : 1;
      return g(lead(-L, -5) + lead(5, L)) +
        `<line x1="${5 * p}" y1="-17" x2="${5 * p}" y2="17" stroke="${ink}" stroke-width="2.5"/>` +
        `<line x1="${-5 * p}" y1="-9" x2="${-5 * p}" y2="9" stroke="${ink}" stroke-width="6"/>` +
        `<g stroke="var(--s4)" stroke-width="2"><line x1="${16 * p - 4}" y1="-15" x2="${16 * p + 4}" y2="-15"/><line x1="${16 * p}" y1="-19" x2="${16 * p}" y2="-11"/></g>`;
    }
    case 'erresistentzia':
      return g(lead(-L, -20) + lead(20, L)) + `<rect x="-20" y="-8" width="40" height="16" fill="var(--sheet)" stroke="${ink}" stroke-width="2.5"/>`;
    case 'bonbilla': {
      if (c.fundituta) {
        return g(lead(-L, -15) + lead(15, L)) + `<circle r="15" fill="var(--sheet)" stroke="var(--ink3)" stroke-width="2.5" stroke-dasharray="4 3"/>` +
          `<g stroke="var(--danger)" stroke-width="2"><line x1="-10.6" y1="-10.6" x2="-3" y2="-3"/><line x1="10.6" y1="10.6" x2="3" y2="3"/><line x1="-10.6" y1="10.6" x2="10.6" y2="-10.6"/></g>`;
      }
      const kk = Math.min(b, 1.6);
      return (kk > 0.02 ? `<circle r="${(16 + 16 * kk).toFixed(1)}" style="fill:var(--s2)" opacity="${(0.1 + 0.28 * kk).toFixed(2)}"/>` : '') +
        g(lead(-L, -15) + lead(15, L)) +
        `<circle r="15" style="fill:color-mix(in srgb, var(--s2) ${Math.round(Math.min(kk, 1) * 85)}%, var(--sheet))" stroke="${ink}" stroke-width="2.5"/>` +
        `<g stroke="${ink}" stroke-width="2"><line x1="-10.6" y1="-10.6" x2="10.6" y2="10.6"/><line x1="-10.6" y1="10.6" x2="10.6" y2="-10.6"/></g>`;
    }
    case 'etengailua':
      return g(lead(-L, -14) + lead(14, L) + (c.itxita ? `<line x1="-14" y1="0" x2="14" y2="0"/>` : `<line x1="-14" y1="0" x2="11" y2="-16"/>`)) +
        `<circle cx="-14" r="3.5" fill="${ink}"/><circle cx="14" r="3.5" fill="var(--sheet)" stroke="${ink}" stroke-width="2"/>`;
    case 'amperimetroa': case 'voltimetroa':
      return g(lead(-L, -14) + lead(14, L)) + `<circle r="14" fill="var(--sheet)" stroke="${ink}" stroke-width="2.5"/>` + letter(c.mota === 'amperimetroa' ? 'A' : 'V');
    case 'fusiblea':
      return g(lead(-L, -16) + lead(16, L)) + `<rect x="-16" y="-6" width="32" height="12" fill="var(--sheet)" stroke="${ink}" stroke-width="2.5"/>` +
        (c.fundituta ? `<g stroke="var(--danger)" stroke-width="2"><line x1="-16" y1="0" x2="-5" y2="2"/><line x1="16" y1="0" x2="5" y2="-2"/></g>` : `<line x1="-16" y1="0" x2="16" y2="0" stroke="${ink}" stroke-width="1.5"/>`);
  }
  return '';
}

function tresnaIkonoa(t) {
  const box = inner => `<svg viewBox="-44 -24 88 48" aria-hidden="true">${inner}</svg>`;
  if (t === 'hautatu') return box(`<path d="M-8 -16 L10 2 L2 3 L7 14 L3 16 L-2 5 L-8 11 Z" fill="var(--ink)"/>`);
  if (t === 'ezabatu') return box(`<g stroke="var(--danger)" stroke-width="3" stroke-linecap="round"><line x1="-10" y1="-10" x2="10" y2="10"/><line x1="10" y1="-10" x2="-10" y2="10"/></g>`);
  if (t === 'nodoa') return box(`<g stroke="var(--ink)" stroke-width="2.5"><line x1="-30" y1="0" x2="30" y2="0"/><line x1="0" y1="0" x2="0" y2="20"/></g><circle r="6" fill="var(--s3)"/>`);
  if (t === 'begizta') return box(`<path d="M-14 -12 H14 V12 H-14 Z" fill="none" stroke="var(--s3)" stroke-width="3"/><path d="M8 -18 L15 -12 L8 -6" fill="none" stroke="var(--s3)" stroke-width="3"/>`);
  return box(ikurra({ mota: t, itxita: false }, {}));
}

export default function mount(box, opts = {}) {
  const P = opts.id || 'lab';
  const maila = opts.maila || 1;
  const analisia = opts.analisia ?? (maila >= 2 || ['nodoa', 'begizta'].includes(opts.tresna));
  const tresnak = opts.tresnak || ['hautatu', ...OSAGAIAK, 'ezabatu', ...(analisia ? ['nodoa', 'begizta'] : [])];
  const adibideZerrenda = opts.adibideak || Object.keys(ADIBIDEAK);
  let adibideId = opts.adibidea || 'sinplea';

  let nx = 9, ny = 6;
  let comps = new Map();
  let res = { ondo: true, V: new Map(), I: new Map() };
  let tool = opts.tresna || 'hautatu', sel = null, selNode = null, path = [];
  let drag = null;
  const aukerak = { dots: true, elektroiak: false, balioak: !!opts.balioak, potentzialak: false };
  const phases = new Map();
  let flows = [];

  box.innerHTML = `
    <div class="sim lab ${opts.zabala ? 'wide' : ''}">
      <div class="lab-tools" role="toolbar" aria-label="Tresnak eta osagaiak">
        ${tresnak.map(t => `<button class="lab-tool" data-tool="${t}" aria-pressed="${t === tool}" title="${MOTAK[t].izena}">${tresnaIkonoa(t)}<span>${MOTAK[t].izena}</span></button>`).join('')}
      </div>
      <div class="sim-body">
        <div class="sim-stage">
          <svg tabindex="0" role="img" aria-label="Zirkuitu-eskema editagarria"></svg>
          <div class="lab-alert" id="${P}-alert" role="status" hidden></div>
        </div>
        <div class="sim-panel">
          <div id="${P}-sel"></div>
          <div class="readouts" id="${P}-glob" aria-live="polite"></div>
          <div class="lab-opts">
            <label class="check" for="${P}-o-dots"><input type="checkbox" id="${P}-o-dots" checked> Korrontea ikusi</label>
            <label class="check" for="${P}-o-elec"><input type="checkbox" id="${P}-o-elec"> Elektroien noranzkoa</label>
            <label class="check" for="${P}-o-val"><input type="checkbox" id="${P}-o-val" ${aukerak.balioak ? 'checked' : ''}> Tentsioak eta korronteak eskeman</label>
            ${maila >= 3 ? `<label class="check" for="${P}-o-pot"><input type="checkbox" id="${P}-o-pot"> Potentzialak (0 V pilaren − bornan)</label>` : ''}
          </div>
          <div class="lab-row">
            ${adibideZerrenda.length > 1 ? `<label for="${P}-adib" class="lab-adib">Adibidea
              <select id="${P}-adib">${adibideZerrenda.map(id => `<option value="${id}" ${id === adibideId ? 'selected' : ''}>${esc(ADIBIDEAK[id].izena)}</option>`).join('')}</select></label>` : ''}
            <button class="btn sm" id="${P}-reset">Berrezarri</button>
            <button class="btn sm ghost" id="${P}-clear">Garbitu</button>
          </div>
        </div>
      </div>
      <div class="sim-foot"><span id="${P}-hint"></span><span class="lab-legend"><i class="lg-c"></i><span id="${P}-leg">Korronte konbentzionala (+ → −)</span></span></div>
    </div>`;

  const $ = s => box.querySelector(s);
  const svg = box.querySelector('.sim-stage svg');
  const gridG = svgEl('g', {}, svg), pathG = svgEl('g', {}, svg), compG = svgEl('g', {}, svg), dotsG = svgEl('g', {}, svg), labelG = svgEl('g', {}, svg);
  const hover = svgEl('rect', { fill: 'none', stroke: 'var(--s1)', 'stroke-width': 2, 'stroke-dasharray': '5 4', rx: 4, visibility: 'hidden' }, svg);

  // ---------- egoera ----------
  const parseKey = key => { const [x, y, d] = key.split(','); return { x: +x, y: +y, d }; };
  function ends(key) {
    const { x, y, d } = parseKey(key);
    return [`${x},${y}`, d === 'h' ? `${x + 1},${y}` : `${x},${y + 1}`];
  }
  function nextNum(mota) {
    let n = 0;
    comps.forEach(c => { if (c.mota === mota) n = Math.max(n, c.n || 0); });
    return n + 1;
  }
  function makeComp(key, mota, props = {}) {
    const [a, b] = ends(key);
    const def = { pila: { balioa: 9, r: 0 }, erresistentzia: { balioa: 100 }, fusiblea: { balioa: 1 }, etengailua: { itxita: false }, bonbilla: { bonbilla: '6V3W' } }[mota] || {};
    const c = { key, id: key, mota, a, b, ...def, ...props };
    if (MOTAK[mota].aurrizkia && !c.n) c.n = nextNum(mota);
    return c;
  }
  const izena = c => MOTAK[c.mota].aurrizkia ? `${MOTAK[c.mota].aurrizkia}${c.n}` : MOTAK[c.mota].izena.toLowerCase();

  function load(data) {
    comps = new Map();
    // taula librean lekua utzi eraikitzeko; unitateetan, adibidearen neurria
    nx = opts.zabala ? Math.max((data.nx || 7) + (data.fixed ? 0 : 2), 8) : (data.nx || 9);
    ny = opts.zabala ? Math.max((data.ny || 4) + (data.fixed ? 0 : 1), 5) : (data.ny || 6);
    (data.osagaiak || []).forEach(([key, mota, props]) => {
      if (!MOTAK[mota]) return;
      const { x, y, d } = parseKey(key);
      if (x < 0 || y < 0 || x >= nx || y >= ny || (d === 'h' && x >= nx - 1) || (d === 'v' && y >= ny - 1)) return;
      comps.set(key, makeComp(key, mota, { ...props }));
    });
    sel = null; selNode = null; path = [];
    const vw = 2 * M + (nx - 1) * S, vh = 2 * M + (ny - 1) * S;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    phases.clear();
  }
  function serialize() {
    return { nx, ny, fixed: true, osagaiak: [...comps.values()].map(c => {
      const { key, id, mota, a, b, ...props } = c;
      return [key, mota, props];
    }) };
  }
  function save() {
    if (!opts.gorde) return;
    try { localStorage.setItem(opts.gorde, JSON.stringify(serialize())); } catch { /* ez da gordetzen */ }
  }

  // ---------- ebatzi eta marraztu ----------
  function recompute() {
    const list = [...comps.values()];
    res = list.length ? ebatzi(list) : { ondo: true, V: new Map(), I: new Map(), funditu: [] };
    render();
    readouts();
    save();
    opts.onChange?.(api);
  }

  function render() {
    const used = new Map();
    comps.forEach(c => { used.set(c.a, (used.get(c.a) || 0) + 1); used.set(c.b, (used.get(c.b) || 0) + 1); });
    const ok = res.ondo;
    const laburra = ok && res.zirkuitulaburra;
    let Vmax = 0, Vmin = 0;
    if (ok) res.V.forEach(v => { Vmax = Math.max(Vmax, v); Vmin = Math.min(Vmin, v); });
    const potCol = v => {
      const t = Vmax - Vmin > 1e-6 ? (v - Vmin) / (Vmax - Vmin) : 0;
      return `color-mix(in srgb, var(--s4) ${Math.round(t * 100)}%, var(--s1))`;
    };

    // sareko puntuak
    let gs = '';
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      if (!used.get(`${x},${y}`)) gs += `<circle cx="${M + x * S}" cy="${M + y * S}" r="2.2" fill="var(--ink3)" opacity=".5"/>`;
    }
    gridG.innerHTML = gs;

    // begizta (KVL)
    pathG.innerHTML = path.length > 1
      ? `<polyline points="${path.map(p => { const [x, y] = p.split(',').map(Number); return `${M + x * S},${M + y * S}`; }).join(' ')}" fill="none" stroke="var(--s3)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".32"/>`
      : '';
    if (path.length) { const [x, y] = path[0].split(',').map(Number); pathG.innerHTML += `<circle cx="${M + x * S}" cy="${M + y * S}" r="9" fill="none" stroke="var(--s3)" stroke-width="3"/>`; }

    // osagaiak
    let cs = '', ls = '';
    const pilaKop = [...comps.values()].filter(c => c.mota === 'pila').length;
    const halo = `stroke="var(--paper)" stroke-width="4" paint-order="stroke" stroke-linejoin="round"`;
    const label = (c, lines) => {
      const { x, y, d } = parseKey(c.key);
      const mx = M + x * S + (d === 'h' ? L : 0), my = M + y * S + (d === 'v' ? L : 0);
      lines.filter(Boolean).forEach((ln, i) => {
        const [txt, cls] = Array.isArray(ln) ? ln : [ln, ''];
        const fill = cls === 'dim' ? 'var(--ink2)' : cls === 'err' ? 'var(--danger)' : cls === 'hi' ? 'var(--s1)' : 'var(--ink)';
        const weight = cls === 'hi' || i === 0 ? 700 : 400;
        if (d === 'h') {
          const ty = i === 0 ? my - 25 : my + 31 + (i - 1) * 15;
          ls += `<text x="${mx}" y="${ty}" text-anchor="middle" font-size="${i ? 13 : 14}" font-weight="${weight}" fill="${fill}" ${halo} font-family="Lato, system-ui, sans-serif">${esc(txt)}</text>`;
        } else {
          ls += `<text x="${mx + 25}" y="${my - 6 + i * 15}" text-anchor="start" font-size="${i ? 13 : 14}" font-weight="${weight}" fill="${fill}" ${halo} font-family="Lato, system-ui, sans-serif">${esc(txt)}</text>`;
        }
      });
    };
    comps.forEach(c => {
      const { x, y, d } = parseKey(c.key);
      const rot = d === 'h' ? 0 : 90;
      const mx = M + x * S + (d === 'h' ? L : 0), my = M + y * S + (d === 'v' ? L : 0);
      const m = ok ? neurketa(c, res) : { U: 0, I: 0, P: 0 };
      let kolorea;
      if (ok && aukerak.potentzialak && c.mota === 'kablea') kolorea = potCol(res.V.get(c.a));
      if (laburra && Math.abs(m.I) > 5 && c.mota !== 'voltimetroa') kolorea = 'var(--danger)';
      const isSel = sel === c.key;
      if (isSel) cs += `<rect x="${mx - (d === 'h' ? L - 4 : 24)}" y="${my - (d === 'h' ? 24 : L - 4)}" width="${d === 'h' ? S - 8 : 48}" height="${d === 'h' ? 48 : S - 8}" rx="5" style="fill:color-mix(in srgb, var(--s1) 12%, transparent)" stroke="var(--s1)" stroke-width="2" stroke-dasharray="5 4"/>`;
      cs += `<g transform="translate(${mx} ${my}) rotate(${rot})" ${kolorea ? `style="--wire:${kolorea}"` : ''}>${ikurra(c, { distira: ok ? distira(c, res) : 0, rot, kolorea })}</g>`;

      // noranzko-geziak (mugimendu murriztua) kableetan
      if (ok && reducedMotion() && aukerak.dots && c.mota === 'kablea' && Math.abs(m.I) > 2e-4) {
        const dir = Math.sign(m.I) * (aukerak.elektroiak ? -1 : 1);
        cs += `<path transform="translate(${mx} ${my}) rotate(${rot + (dir < 0 ? 180 : 0)})" d="M-5 -6 L4 0 L-5 6" fill="none" stroke="${aukerak.elektroiak ? 'var(--s4)' : 'var(--s1)'}" stroke-width="2.5" stroke-linecap="round"/>`;
      }

      const showVal = aukerak.balioak && ok;
      const UI = showVal ? [[fmtV(Math.abs(m.U)), 'dim'], [fmtA(Math.abs(m.I)), 'dim']] : [];
      switch (c.mota) {
        case 'pila': label(c, [`${pilaKop > 1 ? izena(c) + ' · ' : ''}${fmt(c.balioa, 1)} V${c.r ? ` · r ${fmt(c.r, 1)} Ω` : ''}`, showVal ? [`${fmtA(Math.abs(m.I))}`, 'dim'] : null]); break;
        case 'erresistentzia': label(c, [`${izena(c)} · ${fmtR(c.balioa)}`, ...UI]); break;
        case 'bonbilla': label(c, [c.fundituta ? [`${izena(c)} fundituta`, 'err'] : `${izena(c)}`, ...(c.fundituta ? [] : UI)]); break;
        case 'amperimetroa': label(c, [[ok && !laburra ? fmtA(Math.abs(m.I)) : '—', 'hi']]); break;
        case 'voltimetroa': label(c, [[ok ? fmtV(Math.abs(m.U)) : '—', 'hi']]); break;
        case 'fusiblea': label(c, [c.fundituta ? [`${izena(c)} fundituta`, 'err'] : `${izena(c)} · ${fmt(c.balioa, 1)} A`]); break;
        case 'etengailua': label(c, [`${izena(c)}${c.itxita ? '' : ' (irekita)'}`]); break;
      }
    });
    // nodoak (hiru osagai edo gehiago) eta potentzialak
    used.forEach((n, key) => {
      const [x, y] = key.split(',').map(Number);
      const cx = M + x * S, cy = M + y * S;
      if (n >= 3) cs += `<circle cx="${cx}" cy="${cy}" r="5" fill="${ok && aukerak.potentzialak ? potCol(res.V.get(key)) : 'var(--ink)'}"/>`;
      if (ok && aukerak.potentzialak && n >= 3) {
        ls += `<text x="${cx + 8}" y="${cy + 18}" font-size="12.5" font-weight="700" fill="var(--s5)" ${halo} font-family="Lato, system-ui, sans-serif">${esc(fmtV(res.V.get(key)))}</text>`;
      }
    });
    if (selNode) {
      const [x, y] = selNode.split(',').map(Number);
      cs += `<circle cx="${M + x * S}" cy="${M + y * S}" r="12" fill="none" stroke="var(--s3)" stroke-width="3"/>`;
    }
    compG.innerHTML = cs;
    labelG.innerHTML = ls;
    buildDots();
  }

  // ---------- korrontearen puntuak ----------
  function buildDots() {
    dotsG.innerHTML = '';
    flows = [];
    if (!res.ondo || !aukerak.dots || reducedMotion()) return;
    const col = aukerak.elektroiak ? 'var(--s4)' : 'var(--s1)';
    comps.forEach(c => {
      if (c.mota === 'voltimetroa') return;
      const I = res.I.get(c.id) || 0;
      if (Math.abs(I) < 2e-4) return;
      const { x, y, d } = parseKey(c.key);
      const circles = [0, 1, 2, 3].map(() => svgEl('circle', { r: 3.3, fill: res.zirkuitulaburra ? 'var(--danger)' : col }, dotsG));
      flows.push({ key: c.key, I, x0: M + x * S, y0: M + y * S, dx: d === 'h' ? 1 : 0, dy: d === 'v' ? 1 : 0, circles, body: MOTAK[c.mota].gorputza });
    });
    placeDots(0);
  }
  function placeDots(dt) {
    const SP = S / 4;
    flows.forEach(f => {
      const dir = Math.sign(f.I) * (aukerak.elektroiak ? -1 : 1);
      const speed = res.zirkuitulaburra ? 170 : Math.min(150, Math.max(10, 45 * Math.sqrt(Math.abs(f.I) / 0.1)));
      const ph = ((phases.get(f.key) || 0) + dir * speed * dt) % SP;
      phases.set(f.key, ph);
      const off = ((ph % SP) + SP) % SP;
      f.circles.forEach((ci, i) => {
        const t = off + i * SP;
        const hide = Math.abs(t - L) < f.body + 3 || t > S;
        ci.setAttribute('cx', f.x0 + f.dx * t);
        ci.setAttribute('cy', f.y0 + f.dy * t);
        ci.setAttribute('visibility', hide ? 'hidden' : 'visible');
      });
    });
  }
  let raf = 0, last = 0;
  const loop = ts => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    if (flows.length) placeDots(dt);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // ---------- panela ----------
  function hint() {
    const t = MOTAK[tool];
    if (tool === 'hautatu') return 'Sakatu osagai bat haren balioak ikusteko eta aldatzeko. Etengailuak sakatzean irekitzen eta ixten dira.';
    if (tool === 'kablea') return 'Arrastatu puntu batetik bestera kableak marrazteko, edo sakatu bi punturen arteko tarte bat.';
    if (tool === 'ezabatu') return 'Sakatu osagai bat kentzeko.';
    if (tool === 'nodoa') return 'Sakatu nodo bat (hiru osagai edo gehiago elkartzen diren puntua): sartzen eta irteten diren korronteak ikusiko dituzu.';
    if (tool === 'begizta') return 'Sakatu puntuak banan-banan, osagaien gainetik, hasierako puntura itzuli arte: tentsioen batura ikusiko duzu.';
    return `Sakatu bi punturen arteko tarte bat ${t.izena.toLowerCase()} bat jartzeko.`;
  }

  function editor() {
    const root = $(`#${P}-sel`);
    $(`#${P}-hint`).textContent = sel || tool === 'nodoa' || tool === 'begizta' ? hint() : '';
    if (tool === 'nodoa' || tool === 'begizta') {
      root.innerHTML = `<div class="lab-card"><h4>${tool === 'nodoa' ? 'Korronteen legea (nodoak)' : 'Tentsioen legea (begiztak)'}</h4><div id="${P}-an" class="lab-an"></div></div>`;
      return;
    }
    const c = comps.get(sel);
    if (!c) { root.innerHTML = `<p class="lab-hint">${hint()}</p>`; return; }
    root.innerHTML = `<div class="lab-card">
      <div class="lab-card-head"><h4>${esc(MOTAK[c.mota].izena)}${MOTAK[c.mota].aurrizkia ? ` <span class="dim">${izena(c)}</span>` : ''}</h4>
        <button class="btn sm ghost" id="${P}-del">Kendu</button></div>
      <div class="lab-ctl" id="${P}-ctl"></div>
      <div class="readouts" id="${P}-selread"></div>
    </div>`;
    const ctl = $(`#${P}-ctl`);
    $(`#${P}-del`).addEventListener('click', () => { comps.delete(c.key); sel = null; editor(); recompute(); });
    if (c.mota === 'pila') {
      slider(ctl, { id: `${P}-e`, label: 'Tentsioa (i.e.e.)', min: 0.5, max: 24, step: 0.5, value: c.balioa, unit: 'V', format: v => fmt(v, 1) }).on(v => { c.balioa = v; recompute(); });
      if (maila >= 3) slider(ctl, { id: `${P}-r`, label: 'Barne-erresistentzia, r', min: 0, max: 5, step: 0.1, value: c.r || 0, unit: 'Ω', format: v => fmt(v, 1) }).on(v => { c.r = v; recompute(); });
      addButton(ctl, 'Buelta eman polaritateari', () => { c.alderantziz = !c.alderantziz; recompute(); });
    } else if (c.mota === 'erresistentzia') {
      const i0 = R_BALIOAK.reduce((bi, v, i) => Math.abs(v - c.balioa) < Math.abs(R_BALIOAK[bi] - c.balioa) ? i : bi, 0);
      slider(ctl, { id: `${P}-rv`, label: 'Erresistentzia', min: 0, max: R_BALIOAK.length - 1, step: 1, value: i0, format: i => fmtR(R_BALIOAK[i]) }).on(i => { c.balioa = R_BALIOAK[i]; recompute(); });
    } else if (c.mota === 'bonbilla') {
      ctl.insertAdjacentHTML('beforeend', `<div class="seg" role="group" aria-label="Bonbilla mota">${BONBILLAK.map(b => `<button data-b="${b.id}" class="${c.bonbilla === b.id ? 'active' : ''}">${b.izena}</button>`).join('')}</div>`);
      ctl.querySelectorAll('[data-b]').forEach(bt => bt.addEventListener('click', () => {
        c.bonbilla = bt.dataset.b; c.fundituta = false;
        ctl.querySelectorAll('[data-b]').forEach(x => x.classList.toggle('active', x === bt));
        recompute();
      }));
      addButton(ctl, 'Bonbilla berria jarri', () => { c.fundituta = false; recompute(); }, `${P}-fix`);
    } else if (c.mota === 'etengailua') {
      addButton(ctl, c.itxita ? 'Ireki' : 'Itxi', function () { c.itxita = !c.itxita; this.textContent = c.itxita ? 'Ireki' : 'Itxi'; recompute(); });
    } else if (c.mota === 'fusiblea') {
      ctl.insertAdjacentHTML('beforeend', `<div class="ctl-top"><span>Korronte maximoa</span></div><div class="seg" role="group" aria-label="Fusiblearen korronte maximoa">${FUS_BALIOAK.map(v => `<button data-f="${v}" class="${c.balioa === v ? 'active' : ''}">${fmt(v, 1)} A</button>`).join('')}</div>`);
      ctl.querySelectorAll('[data-f]').forEach(bt => bt.addEventListener('click', () => {
        c.balioa = +bt.dataset.f; c.fundituta = false;
        ctl.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('active', x === bt));
        recompute();
      }));
      addButton(ctl, 'Fusible berria jarri', () => { c.fundituta = false; recompute(); }, `${P}-fix`);
    } else if (c.mota === 'kablea') {
      ctl.innerHTML = `<p class="lab-hint">Kable idealak ez du ia erresistentziarik: bere bi muturrek potentzial bera dute.</p>`;
    } else if (c.mota === 'amperimetroa') {
      ctl.innerHTML = `<p class="lab-hint">Amperimetroa <b>seriean</b> konektatzen da: korronte guztiak haren barnetik pasatu behar du. Ia ez du erresistentziarik.</p>`;
    } else if (c.mota === 'voltimetroa') {
      ctl.innerHTML = `<p class="lab-hint">Voltimetroa <b>paraleloan</b> konektatzen da, neurtu nahi den osagaiaren bi muturretara. Erresistentzia oso handia du (10 MΩ).</p>`;
    }
  }
  function addButton(parent, text, fn, id) {
    const b = document.createElement('button');
    b.className = 'btn sm';
    b.textContent = text;
    if (id) b.id = id;
    b.addEventListener('click', fn);
    parent.appendChild(b);
    return b;
  }

  function readouts() {
    const ok = res.ondo;
    const alert = $(`#${P}-alert`);
    const pilak = [...comps.values()].filter(c => c.mota === 'pila');
    const fundituak = [...comps.values()].filter(c => c.fundituta);
    let msg = '';
    if (!ok) msg = '<b>Zirkuitu hau ezin da ebatzi.</b> Pilak zuzenean elkarri lotuta daude, kablerik edo osagairik gabe?';
    else if (res.zirkuitulaburra) msg = '<b>Zirkuitulaburra!</b> Korronteak ez du erresistentziarik aurkitzen: pila azkar hustu eta kableak berotuko lirateke. Jarri hartzaile bat edo fusible bat.';
    else if (res.funditu?.length) msg = `<b>${res.funditu.map(k => izena(comps.get(k))).join(', ')} fundituta!</b> ${comps.get(res.funditu[0])?.mota === 'fusiblea' ? 'Korrontea handiegia zen: fusibleak zirkuitua babestu du.' : 'Bonbillak bere tentsio nominala baino askoz gehiago jaso du.'}`;
    alert.innerHTML = msg;
    alert.hidden = !msg;
    alert.classList.toggle('err', !ok || !!res.zirkuitulaburra);

    // osagai hautatua
    const c = comps.get(sel);
    const sr = $(`#${P}-selread`);
    if (c && sr) {
      const m = ok ? neurketa(c, res) : { U: NaN, I: NaN, P: NaN };
      const rows = [];
      if (c.mota === 'pila') {
        rows.push(['Bornen arteko tentsioa', fmtV(Math.abs(m.U))], ['Ematen duen korrontea', fmtA(Math.abs(m.I))], ['Ematen duen potentzia', fmtP(Math.abs(c.balioa * m.I))]);
        if (c.r) rows.push(['Barnean galdutakoa (r·I²)', fmtP(c.r * m.I * m.I)]);
      } else if (c.mota === 'voltimetroa') {
        rows.push(['Neurtutako tentsioa', fmtV(Math.abs(m.U))]);
      } else if (c.mota === 'amperimetroa') {
        rows.push(['Neurtutako korrontea', fmtA(Math.abs(m.I))]);
      } else {
        rows.push(['Tentsioa, V', fmtV(Math.abs(m.U))], ['Intentsitatea, I', fmtA(Math.abs(m.I))]);
        if (['erresistentzia', 'bonbilla'].includes(c.mota)) rows.push(['Potentzia, P = V · I', fmtP(Math.abs(m.P))]);
        if (c.mota === 'bonbilla') {
          const b = bonbilla(c);
          rows.push(['Erresistentzia', fmtR(b.Vn * b.Vn / b.Pn)], ['Distira (P / Pn)', c.fundituta ? 'fundituta' : `${Math.round(distira(c, res) * 100)} %`]);
        }
      }
      sr.innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
      const fix = $(`#${P}-fix`);
      if (fix) fix.hidden = !c.fundituta;
    }

    // zirkuitu osoa
    const glob = [];
    if (ok && pilak.length === 1 && !res.zirkuitulaburra) {
      const p = pilak[0], I = Math.abs(res.I.get(p.id));
      glob.push(['Pilaren korrontea', fmtA(I)]);
      glob.push(['Erresistentzia baliokidea', I > 1e-6 ? fmtR(p.balioa / I - (p.r || 0)) : '∞ (zirkuitu irekia)']);
      glob.push(['Potentzia guztira', fmtP(p.balioa * I)]);
    } else if (ok && pilak.length > 1 && !res.zirkuitulaburra) {
      pilak.forEach(p => glob.push([`${izena(p)}-ren korrontea`, fmtA(Math.abs(res.I.get(p.id)))]));
    } else if (!pilak.length) {
      glob.push(['Pilarik ez', 'jarri sorgailu bat']);
    }
    $(`#${P}-glob`).innerHTML = glob.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    $(`#${P}-glob`).hidden = !glob.length;

    analysis();
  }

  // ---------- Kirchhoff: nodoa eta begizta ----------
  const norabidea = (from, to) => {
    const [x1, y1] = from.split(',').map(Number), [x2, y2] = to.split(',').map(Number);
    return x2 > x1 ? 'eskuinekoa' : x2 < x1 ? 'ezkerrekoa' : y2 > y1 ? 'behekoa' : 'goikoa';
  };
  function analysis() {
    const out = $(`#${P}-an`);
    if (!out) return;
    if (!res.ondo) { out.innerHTML = '<p class="lab-hint">Zirkuitua ezin da ebatzi.</p>'; return; }
    if (tool === 'nodoa') {
      if (!selNode) { out.innerHTML = `<p class="lab-hint">${hint()}</p>`; return; }
      const att = [...comps.values()].filter(c => (c.a === selNode || c.b === selNode) && c.mota !== 'voltimetroa');
      if (!att.length) { out.innerHTML = '<p class="lab-hint">Puntu honetan ez dago osagairik.</p>'; return; }
      let sIn = [], sOut = [];
      att.forEach(c => {
        const I = res.I.get(c.id) || 0;
        const into = c.b === selNode ? I : -I;
        const other = c.a === selNode ? c.b : c.a;
        const name = `${norabidea(selNode, other)} (${izena(c)})`;
        if (Math.abs(into) < 5e-7) return;
        (into > 0 ? sIn : sOut).push([name, Math.abs(into)]);
      });
      const sum = arr => arr.reduce((s, [, v]) => s + v, 0);
      const list = arr => arr.length ? arr.map(([n, v]) => `<div><span>${esc(n)}</span><b>${fmtA(v)}</b></div>`).join('') : '<div><span>—</span><b>0 A</b></div>';
      out.innerHTML = `
        <p class="an-h">Sartzen diren korronteak</p><div class="readouts">${list(sIn)}</div>
        <p class="an-h">Irteten diren korronteak</p><div class="readouts">${list(sOut)}</div>
        <p class="an-eq">ΣI<sub>sartu</sub> = ${fmtA(sum(sIn))} &nbsp; ΣI<sub>irten</sub> = ${fmtA(sum(sOut))}</p>
        <p class="lab-hint">${att.length < 3 ? 'Puntu honetan bi osagai bakarrik daude: ez da nodoa, korronte bera doa bietan.' : 'Nodo batera sartzen den korronte guztia irten egiten da: karga ez da pilatzen.'}</p>`;
      return;
    }
    if (tool === 'begizta') {
      if (path.length < 2) { out.innerHTML = `<p class="lab-hint">${hint()}</p>`; return; }
      const rows = [];
      let sum = 0;
      for (let i = 1; i < path.length; i++) {
        const c = edgeBetween(path[i - 1], path[i]);
        if (!c) continue;
        const dV = (res.V.get(path[i]) ?? 0) - (res.V.get(path[i - 1]) ?? 0);
        sum += dV;
        if (c.mota === 'kablea' || Math.abs(dV) < 5e-4) continue;
        rows.push([izena(c), dV]);
      }
      const closed = path.length > 2 && path[0] === path[path.length - 1];
      out.innerHTML = `
        <p class="an-h">Potentzial-aldaketak ibilbidean</p>
        <div class="readouts">${rows.length ? rows.map(([n, v]) => `<div><span>${esc(n)}</span><b style="color:${v > 0 ? 'var(--s4)' : 'var(--s1)'}">${v > 0 ? '+' : '−'}${fmtV(Math.abs(v))}</b></div>`).join('') : '<div><span>kableak bakarrik</span><b>0 V</b></div>'}</div>
        <p class="an-eq">ΣΔV = ${closed ? '<b>' + fmtV(Math.abs(sum) < 5e-3 ? 0 : sum) + '</b>' : fmtV(sum)}</p>
        <p class="lab-hint">${closed ? 'Begizta itxita: tentsioen batura zero da. Pilek igotzen dutena (+) hartzaileek jaisten dute (−).' : 'Jarraitu puntuak sakatzen hasierako puntura itzuli arte.'}</p>
        <button class="btn sm" id="${P}-path0">Begizta berria</button>`;
      $(`#${P}-path0`).addEventListener('click', () => { path = []; render(); analysis(); });
    }
  }
  function edgeBetween(p, q) {
    const [x1, y1] = p.split(',').map(Number), [x2, y2] = q.split(',').map(Number);
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) !== 1) return null;
    const key = y1 === y2 ? `${Math.min(x1, x2)},${y1},h` : `${x1},${Math.min(y1, y2)},v`;
    const c = comps.get(key);
    return c && c.mota !== 'voltimetroa' ? c : c || null;
  }

  // ---------- sakatu eta arrastatu ----------
  function svgPoint(e) {
    const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * vb.width / r.width, y: (e.clientY - r.top) * vb.height / r.height };
  }
  function nearest(p) {
    const fx = (p.x - M) / S, fy = (p.y - M) / S;
    const gx = Math.round(fx), gy = Math.round(fy);
    const point = gx >= 0 && gx < nx && gy >= 0 && gy < ny ? { key: `${gx},${gy}`, d: Math.hypot(fx - gx, fy - gy), x: gx, y: gy } : null;
    let edge = null;
    { const y = Math.round(fy), x = Math.floor(fx);
      if (y >= 0 && y < ny && x >= 0 && x < nx - 1) edge = { key: `${x},${y},h`, d: Math.abs(fy - y) + Math.max(0, Math.abs(fx - x - 0.5) - 0.5) }; }
    { const x = Math.round(fx), y = Math.floor(fy);
      if (x >= 0 && x < nx && y >= 0 && y < ny - 1) {
        const d = Math.abs(fx - x) + Math.max(0, Math.abs(fy - y - 0.5) - 0.5);
        if (!edge || d < edge.d) edge = { key: `${x},${y},v`, d };
      } }
    return { point, edge };
  }
  function select(key) {
    sel = key; selNode = null;
    editor(); render(); readouts();
  }
  function place(key, mota) {
    const ex = comps.get(key);
    if (ex && ex.mota === mota) { select(key); return; }
    comps.set(key, makeComp(key, mota));
    sel = mota === 'kablea' ? null : key;
    editor();
    recompute();
  }

  svg.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const p = svgPoint(e), { point, edge } = nearest(p);
    if (tool === 'kablea' && point && point.d < 0.3) {
      drag = { last: point.key, moved: false };
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    if (tool === 'nodoa') {
      selNode = point && point.d < 0.42 ? point.key : null;
      render(); analysis();
      return;
    }
    if (tool === 'begizta') {
      if (!point || point.d > 0.42) return;
      const lastP = path[path.length - 1];
      const closed = path.length > 2 && path[0] === lastP;
      if (!path.length || closed || !edgeBetween(lastP, point.key)) path = [point.key];
      else path.push(point.key);
      render(); analysis();
      return;
    }
    if (!edge || edge.d > 0.4) { if (tool === 'hautatu') select(null); return; }
    const c = comps.get(edge.key);
    if (tool === 'hautatu') {
      if (c?.mota === 'etengailua') { c.itxita = !c.itxita; sel = c.key; editor(); recompute(); return; }
      select(c ? edge.key : null);
    } else if (tool === 'ezabatu') {
      if (c) { comps.delete(edge.key); if (sel === edge.key) sel = null; editor(); recompute(); }
    } else if (OSAGAIAK.includes(tool)) {
      place(edge.key, tool);
    }
  });
  svg.addEventListener('pointermove', e => {
    const p = svgPoint(e), { point, edge } = nearest(p);
    if (drag) {
      if (point && point.d < 0.42 && point.key !== drag.last) {
        const [x1, y1] = drag.last.split(',').map(Number);
        if (Math.abs(x1 - point.x) + Math.abs(y1 - point.y) === 1) {
          const key = y1 === point.y ? `${Math.min(x1, point.x)},${y1},h` : `${x1},${Math.min(y1, point.y)},v`;
          if (!comps.has(key)) { comps.set(key, makeComp(key, 'kablea')); recompute(); }
          drag.last = point.key; drag.moved = true;
        }
      }
      return;
    }
    // sagua: non jarriko den erakutsi
    if (e.pointerType === 'mouse' && (OSAGAIAK.includes(tool) || tool === 'ezabatu') && edge && edge.d < 0.4) {
      const { x, y, d } = parseKey(edge.key);
      const mx = M + x * S + (d === 'h' ? L : 0), my = M + y * S + (d === 'v' ? L : 0);
      hover.setAttribute('x', mx - (d === 'h' ? L - 6 : 20)); hover.setAttribute('y', my - (d === 'h' ? 20 : L - 6));
      hover.setAttribute('width', d === 'h' ? S - 12 : 40); hover.setAttribute('height', d === 'h' ? 40 : S - 12);
      hover.setAttribute('stroke', tool === 'ezabatu' ? 'var(--danger)' : 'var(--s1)');
      hover.setAttribute('visibility', 'visible');
    } else hover.setAttribute('visibility', 'hidden');
  });
  const endDrag = e => {
    if (!drag) return;
    // arrastatu gabe sakatu bada: puntu ondoko ertza
    if (!drag.moved) {
      const { edge } = nearest(svgPoint(e));
      if (edge && edge.d < 0.3) place(edge.key, 'kablea');
    }
    drag = null;
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', () => { drag = null; });
  svg.addEventListener('pointerleave', () => hover.setAttribute('visibility', 'hidden'));
  svg.addEventListener('keydown', e => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { comps.delete(sel); sel = null; editor(); recompute(); e.preventDefault(); }
  });

  // ---------- kontrolak ----------
  box.querySelectorAll('[data-tool]').forEach(bt => bt.addEventListener('click', () => {
    tool = bt.dataset.tool;
    box.querySelectorAll('[data-tool]').forEach(x => x.setAttribute('aria-pressed', String(x === bt)));
    if (tool !== 'nodoa') selNode = null;
    if (tool !== 'begizta') path = [];
    if (tool !== 'hautatu') sel = null;
    editor(); render(); readouts();
  }));
  $(`#${P}-o-dots`).addEventListener('change', e => { aukerak.dots = e.target.checked; render(); });
  $(`#${P}-o-elec`).addEventListener('change', e => {
    aukerak.elektroiak = e.target.checked;
    $(`#${P}-leg`).textContent = aukerak.elektroiak ? 'Elektroiak (− → +)' : 'Korronte konbentzionala (+ → −)';
    box.querySelector('.lab-legend i').className = aukerak.elektroiak ? 'lg-e' : 'lg-c';
    render();
  });
  $(`#${P}-o-val`).addEventListener('change', e => { aukerak.balioak = e.target.checked; render(); });
  $(`#${P}-o-pot`)?.addEventListener('change', e => { aukerak.potentzialak = e.target.checked; render(); });
  $(`#${P}-adib`)?.addEventListener('change', e => { adibideId = e.target.value; load(ADIBIDEAK[adibideId]); editor(); recompute(); });
  $(`#${P}-reset`).addEventListener('click', () => { load(ADIBIDEAK[adibideId]); editor(); recompute(); });
  $(`#${P}-clear`).addEventListener('click', () => { load({ nx, ny, fixed: true, osagaiak: [] }); editor(); recompute(); });

  // ---------- hasiera ----------
  let hasiera = ADIBIDEAK[adibideId] || ADIBIDEAK.sinplea;
  if (opts.gorde) {
    try { const saved = JSON.parse(localStorage.getItem(opts.gorde)); if (saved?.osagaiak) hasiera = saved; } catch { /* adibidea */ }
  }
  load(hasiera);
  editor();
  recompute();

  const api = {
    osagaiak: () => [...comps.values()],
    emaitza: () => res,
    neurketa: c => neurketa(c, res)
  };
  const stop = () => cancelAnimationFrame(raf);
  stop.lab = api;
  return stop;
}
