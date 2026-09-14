// Lantegien tresna partekatuak (Mekanismoen Lantegia, Elektrizitatearen Lantegia)

// app.css-eko kolore-aldagaiak (gai argia eta iluna)
export const tok = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function onTheme(cb) {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

// Zenbakiak euskaraz: koma hamartarra, gehienez `d` hamartar, zero soberakinik gabe
// (toLocaleString ez: nabigatzaile guztiek ez dute euskarazko formatua)
export function fmt(x, d = 2) {
  if (!isFinite(x)) return '—';
  const s = String(Number(Number(x).toFixed(d)));
  return (s === '-0' ? '0' : s).replace('.', ',');
}
export const fmtFixed = (x, d = 2) => Number(x).toFixed(d).replace('.', ',');

// Ikaslearen erantzuna irakurri: koma edo puntua, unitaterik gabe
export function parseNum(raw) {
  const s = String(raw).trim().replace(/\s/g, '').replace(/[a-zA-ZΩμ²³°/·]+$/g, '').replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

const NS = 'http://www.w3.org/2000/svg';
export function svgEl(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}
export function svgText(parent, x, y, text, attrs = {}) {
  const t = svgEl('text', { x, y, fill: 'var(--ink)', 'font-family': 'Lato, system-ui, sans-serif', 'font-size': 14, ...attrs }, parent);
  t.textContent = text;
  return t;
}
// Gezia: lerroa eta punta
export function svgArrow(parent, x1, y1, x2, y2, color, width = 2.5, head = 9) {
  const g = svgEl('g', { stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', fill: 'none' }, parent);
  svgEl('line', { x1, y1, x2, y2 }, g);
  const a = Math.atan2(y2 - y1, x2 - x1);
  svgEl('path', {
    d: `M${x2} ${y2} L${x2 - head * Math.cos(a - .45)} ${y2 - head * Math.sin(a - .45)} M${x2} ${y2} L${x2 - head * Math.cos(a + .45)} ${y2 - head * Math.sin(a + .45)}`
  }, g);
  return g;
}

// HTML testua ihes-karaktereekin
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Graduatzailea + irteera; `on(cb)` balioa aldatzean deitzen du
export function slider(parent, { id, label, min, max, step = 1, value, unit = '', format = v => fmt(v), dot }) {
  const wrap = document.createElement('div');
  wrap.className = 'ctl';
  wrap.innerHTML = `<div class="ctl-top"><label for="${id}">${dot ? `<span class="dot ${dot}"></span>` : ''}${label}</label><output for="${id}"></output></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">`;
  parent.appendChild(wrap);
  const input = wrap.querySelector('input'), out = wrap.querySelector('output');
  const show = () => { out.textContent = format(+input.value) + (unit ? ' ' + unit : ''); };
  show();
  return {
    input, wrap,
    get value() { return +input.value; },
    set value(v) { input.value = v; show(); },
    on(cb) { input.addEventListener('input', () => { show(); cb(+input.value); }); return this; }
  };
}

// ---------- aurrerapena (nabigatzailean, konturik gabe) ----------
export function makeProgress(KEY) {
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = data => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* nabigatzaile pribatua: memorian bakarrik */ } };
  let cache = load();
  const changed = () => document.dispatchEvent(new CustomEvent('aurrerapena'));
  return {
    get(unit) { return cache[unit] || {}; },
    set(unit, patch) { cache[unit] = { ...cache[unit], ...patch }; save(cache); changed(); },
    all() { return cache; },
    replace(data) { cache = data || {}; save(cache); changed(); }
  };
}
