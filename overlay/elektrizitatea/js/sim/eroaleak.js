// Eroaleak eta isolatzaileak: elektroi askeak hari barruan, pila konektatzean noranzko batean mugitzen dira
import { fmt, svgEl, slider, reducedMotion } from '../util.js';

const MATERIALAK = {
  kobrea: { izena: 'Kobrea', askeak: 64, azalpena: 'Metalak eroaleak dira: atomo bakoitzak elektroi bat "askatzen" du, eta elektroi aske horiek hari osoan zehar mugi daitezke.' },
  grafitoa: { izena: 'Grafitoa', askeak: 22, azalpena: 'Grafitoa (arkatzaren mina) eroalea da, baina metalek baino elektroi aske gutxiago ditu: korronte txikiagoa eroaten du.' },
  plastikoa: { izena: 'Plastikoa', askeak: 0, azalpena: 'Plastikoa isolatzailea da: elektroiak bere atomoei lotuta daude eta ezin dira haritik mugitu. Horregatik estaltzen dira kableak plastikoz.' }
};
const X0 = 60, X1 = 540, Y0 = 118, Y1 = 232, MID = 300;

export default function mount(box, opts = {}) {
  let mat = 'kobrea', konektatuta = true;
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 600 300" role="img" aria-label="Hari baten barrualdea: atomoak eta elektroiak"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Materiala">${Object.entries(MATERIALAK).map(([id, m]) => `<button data-m="${id}" class="${id === mat ? 'active' : ''}">${m.izena}</button>`).join('')}</div>
          <label class="check" for="er-on" style="display:flex;gap:8px;align-items:center;font-size:15.5px"><input type="checkbox" id="er-on" checked> Pila konektatuta</label>
          <div id="er-ctl"></div>
          <div class="readouts" aria-live="polite">
            <div><span>Elektroi askeak (irudian)</span><b id="er-n"></b></div>
            <div class="hi"><span>Marra etenetik igarotakoak</span><b id="er-rate"></b></div>
          </div>
          <p class="lab-hint" id="er-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span><span class="dot" style="background:var(--s1);border-color:var(--s1);border-radius:50%"></span>elektroia (−) · <span class="dot" style="background:var(--chip);border-radius:50%"></span>atomoaren nukleoa (+)</span><span>I = Q / t</span></div>
    </div>`;
  const $ = s => box.querySelector(s);
  const svg = box.querySelector('svg');
  const sV = slider($('#er-ctl'), { id: 'er-v', label: 'Pilaren tentsioa', min: 1.5, max: 9, step: 1.5, value: 4.5, unit: 'V', format: v => fmt(v, 1) });

  svg.innerHTML = `
    <g font-family="Lato, system-ui, sans-serif">
      <path d="M40 175 V60 H270 M330 60 H560 V175" fill="none" stroke="var(--ink)" stroke-width="3"/>
      <line x1="270" y1="42" x2="270" y2="78" stroke="var(--ink)" stroke-width="3"/>
      <line x1="330" y1="50" x2="330" y2="70" stroke="var(--ink)" stroke-width="8"/>
      <line x1="270" y1="60" x2="330" y2="60" stroke="var(--ink)" stroke-width="3" id="er-gap" stroke-dasharray="4 4"/>
      <text x="262" y="36" text-anchor="end" font-size="16" font-weight="700" fill="var(--s4)">+</text>
      <text x="344" y="36" font-size="18" font-weight="700" fill="var(--s1)">−</text>
      <rect x="${X0}" y="${Y0 - 8}" width="${X1 - X0}" height="${Y1 - Y0 + 16}" rx="10" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
      <rect x="22" y="160" width="38" height="30" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
      <rect x="540" y="160" width="38" height="30" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
      <line x1="${MID}" y1="${Y0 - 14}" x2="${MID}" y2="${Y1 + 14}" stroke="var(--s3)" stroke-width="2" stroke-dasharray="6 5"/>
      <g id="er-atoms"></g><g id="er-el"></g>
      <g id="er-arrows"></g>
    </g>`;
  const atomsG = svg.querySelector('#er-atoms'), elG = svg.querySelector('#er-el'), arrows = svg.querySelector('#er-arrows');

  const atoms = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) atoms.push({ x: X0 + 24 + i * 39 + (j % 2) * 18, y: Y0 + 16 + j * 41 });
  atomsG.innerHTML = atoms.map(a => `<circle cx="${a.x}" cy="${a.y}" r="11" fill="var(--chip)" stroke="var(--ink3)" stroke-width="1.5"/><text x="${a.x}" y="${a.y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink2)">+</text>`).join('');

  let els = [], crossings = [];
  function setup() {
    elG.innerHTML = '';
    els = [];
    crossings = [];
    const m = MATERIALAK[mat];
    for (let i = 0; i < m.askeak; i++) {
      els.push({ free: true, x: X0 + 10 + Math.random() * (X1 - X0 - 20), y: Y0 + Math.random() * (Y1 - Y0), a: Math.random() * 6.28, c: svgEl('circle', { r: 4, fill: 'var(--s1)' }, elG) });
    }
    if (!m.askeak) atoms.forEach(a => els.push({ free: false, atom: a, a: Math.random() * 6.28, c: svgEl('circle', { r: 3.5, fill: 'var(--s1)' }, elG) }));
    $('#er-n').textContent = m.askeak || '0 (lotuta)';
    $('#er-txt').textContent = m.azalpena;
    labels();
  }
  function labels() {
    const flow = konektatuta && MATERIALAK[mat].askeak > 0;
    svg.querySelector('#er-gap').setAttribute('stroke-dasharray', konektatuta ? '0' : '4 4');
    svg.querySelector('#er-gap').setAttribute('stroke', konektatuta ? 'var(--ink)' : 'var(--ink3)');
    arrows.innerHTML = flow ? `
      <path d="M200 268 H400 M388 260 L400 268 L388 276" fill="none" stroke="var(--s1)" stroke-width="3"/>
      <text x="410" y="273" font-size="14" font-weight="700" fill="var(--s1)">elektroiak: − → +</text>
      <path d="M400 92 H200 M212 84 L200 92 L212 100" fill="none" stroke="var(--s4)" stroke-width="3"/>
      <text x="410" y="97" font-size="14" font-weight="700" fill="var(--s4)">korronte konbentzionala</text>`
      : `<text x="300" y="276" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink3)">${konektatuta ? 'Ez dago korronterik: elektroiak lotuta' : 'Zirkuitua irekita: mugimendua ausazkoa, korronterik ez'}</text>`;
  }

  box.querySelectorAll('[data-m]').forEach(bt => bt.addEventListener('click', () => {
    mat = bt.dataset.m;
    box.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('active', x === bt));
    setup();
  }));
  $('#er-on').addEventListener('change', e => { konektatuta = e.target.checked; crossings = []; labels(); });
  setup();

  let raf = 0, last = 0, time = 0;
  const tick = ts => {
    let dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    if (reducedMotion()) dt *= 0.25;
    time += dt;
    const drift = konektatuta ? 14 * sV.value : 0;   // px/s, eskuinera (− bornatik + bornara)
    els.forEach(e => {
      if (!e.free) {
        e.a += dt * 3;
        e.c.setAttribute('cx', e.atom.x + 15 * Math.cos(e.a));
        e.c.setAttribute('cy', e.atom.y + 15 * Math.sin(e.a) * 0.6);
        return;
      }
      // mugimendu termikoa (norabide aldakorra) + arrastatze-abiadura
      e.a += (Math.random() - 0.5) * 6 * dt;
      const ox = e.x;
      e.x += (Math.cos(e.a) * 70 + drift) * dt;
      e.y += Math.sin(e.a) * 70 * dt;
      if (e.y < Y0) { e.y = Y0; e.a = -e.a; }
      if (e.y > Y1) { e.y = Y1; e.a = -e.a; }
      if (ox < MID && e.x >= MID) crossings.push([time, 1]);
      if (ox >= MID && e.x < MID) crossings.push([time, -1]);
      if (e.x > X1 - 6) e.x -= X1 - X0 - 12;
      if (e.x < X0 + 6) e.x += X1 - X0 - 12;
      e.c.setAttribute('cx', e.x);
      e.c.setAttribute('cy', e.y);
    });
    crossings = crossings.filter(c => time - c[0] < 2);
    const net = crossings.reduce((s, c) => s + c[1], 0) / 2;
    $('#er-rate').textContent = `${fmt(Math.max(0, net), 1)} elektroi/s`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
