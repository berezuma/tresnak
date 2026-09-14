// Polimetroa: hautagailua (V, A, Ω), eskalak eta puntak. Zirkuitua benetan ebazten da neurgailua barne.
import { fmt, fmtFixed } from '../util.js';
import { ebatzi, neurketa } from '../zirkuitua.js';

const MODUAK = [
  { id: 'V2', mota: 'V', eskala: 2, izena: '2 V' },
  { id: 'V20', mota: 'V', eskala: 20, izena: '20 V' },
  { id: 'V200', mota: 'V', eskala: 200, izena: '200 V' },
  { id: 'A200m', mota: 'A', eskala: 0.2, izena: '200 mA' },
  { id: 'A10', mota: 'A', eskala: 10, izena: '10 A' },
  { id: 'O200', mota: 'O', eskala: 200, izena: '200 Ω' },
  { id: 'O2k', mota: 'O', eskala: 2000, izena: '2 kΩ' },
  { id: 'O20k', mota: 'O', eskala: 20000, izena: '20 kΩ' }
];
const POS = { A: [90, 70], A2: [150, 70], B: [340, 70], C: [340, 250], D: [90, 250] };
const IZENA = { A: 'A', A2: 'A′', B: 'B', C: 'C', D: 'D' };
const E = 9, R1 = 100, R2 = 200;
const ZEREGINAK = [
  { id: 'v2', testua: 'Neurtu R₂-ren tentsioa', ok: (m, v) => m.mota === 'V' && Math.abs(v - 6) < 0.1 },
  { id: 'e', testua: 'Neurtu pilaren tentsioa', ok: (m, v) => m.mota === 'V' && Math.abs(v - 9) < 0.1 },
  { id: 'i', testua: 'Neurtu zirkuituko korrontea', ok: (m, v, st) => m.mota === 'A' && st.eten !== 'ez' && Math.abs(v - 0.03) < 0.001 },
  { id: 'r1', testua: 'Neurtu R₁-en erresistentzia', ok: (m, v) => m.mota === 'O' && Math.abs(v - 100) < 1 }
];

export default function mount(box) {
  const st = { modua: 'V20', gorria: 'A', beltza: 'B', pila: true, eten: 'ez', fusiblea: true };
  const eginak = new Set();

  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 600 330" role="img" aria-label="Zirkuitua eta polimetroa"></svg></div>
        <div class="sim-panel">
          <div class="ctl"><div class="ctl-top"><span id="po-dl">Hautagailua</span></div>
            <div class="seg po-dial" role="group" aria-labelledby="po-dl">${MODUAK.map(m => `<button data-mod="${m.id}">${m.izena}</button>`).join('')}</div></div>
          <div class="ctl"><div class="ctl-top"><span id="po-rl">Punta gorria (VΩmA)</span></div><div class="seg" role="group" aria-labelledby="po-rl" id="po-red"></div></div>
          <div class="ctl"><div class="ctl-top"><span id="po-bl">Punta beltza (COM)</span></div><div class="seg" role="group" aria-labelledby="po-bl" id="po-black"></div></div>
          <div class="ctl"><div class="ctl-top"><span id="po-el">Zirkuitua eten</span></div>
            <div class="seg" role="group" aria-labelledby="po-el"><button data-eten="ez">Ez</button><button data-eten="R1">R₁ aurretik</button><button data-eten="behea">Beheko kablea</button></div></div>
          <label class="check" for="po-pila" style="display:flex;gap:8px;align-items:center;font-size:15px"><input type="checkbox" id="po-pila" checked> Pila konektatuta</label>
          <p class="lab-hint" id="po-hint" aria-live="polite"></p>
          <button class="btn sm" id="po-fuse" hidden>Polimetroaren fusiblea aldatu</button>
          <div class="readouts" id="po-tasks"></div>
        </div>
      </div>
      <div class="sim-foot"><span>E = 9 V · R₁ = 100 Ω · R₂ = 200 Ω</span><span>Voltimetroa paraleloan · amperimetroa seriean · ohmetroa elikadurarik gabe</span></div>
    </div>`;
  const $ = s => box.querySelector(s);
  const svg = box.querySelector('svg');

  const puntuak = () => st.eten === 'R1' ? ['A', 'A2', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D'];

  function neurtu() {
    const md = MODUAK.find(m => m.id === st.modua);
    const comps = [];
    if (st.pila) comps.push({ id: 'pila', mota: 'pila', a: 'D', b: 'A', balioa: E });
    comps.push({ id: 'R1', mota: 'erresistentzia', a: st.eten === 'R1' ? 'A2' : 'A', b: 'B', balioa: R1 });
    comps.push({ id: 'R2', mota: 'erresistentzia', a: 'B', b: 'C', balioa: R2 });
    if (st.eten !== 'behea') comps.push({ id: 'w', mota: 'kablea', a: 'C', b: 'D' });
    if (st.gorria === st.beltza) return { md, val: 0, circuitI: null };
    let meter = null;
    if (md.mota === 'V') meter = { id: 'm', mota: 'voltimetroa', a: st.gorria, b: st.beltza };
    else if (md.mota === 'A') meter = st.fusiblea ? { id: 'm', mota: 'erresistentzia', a: st.gorria, b: st.beltza, balioa: md.eskala < 1 ? 0.5 : 0.01 } : null;
    else {
      if (st.pila) return { md, err: 'pila' };
      meter = { id: 'm', mota: 'pila', a: st.beltza, b: st.gorria, balioa: 1 };
    }
    const res = ebatzi(meter ? [...comps, meter] : comps);
    if (!res.ondo) return { md, err: 'ebatzi' };
    let val = 0;
    if (meter && md.mota === 'V') val = neurketa(meter, res).U;
    else if (meter && md.mota === 'A') val = res.I.get('m');
    else if (meter) { const I = res.I.get('m'); val = I > 1e-9 ? 1 / I : Infinity; }
    return { md, val, res, circuitI: res.I.get('R2') };
  }

  function lcd(r) {
    const md = r.md;
    if (r.err === 'pila') return ['Err', ''];
    if (md.mota === 'V') return Math.abs(r.val) >= md.eskala ? ['OL', 'V'] : [fmtFixed(r.val, { 2: 3, 20: 2, 200: 1 }[md.eskala]), 'V'];
    if (md.mota === 'A') {
      if (Math.abs(r.val) >= md.eskala) return ['OL', md.eskala < 1 ? 'mA' : 'A'];
      return md.eskala < 1 ? [fmtFixed(r.val * 1000, 1), 'mA'] : [fmtFixed(r.val, 2), 'A'];
    }
    if (!isFinite(r.val) || r.val >= md.eskala) return ['OL', md.eskala >= 2000 ? 'kΩ' : 'Ω'];
    return md.eskala === 200 ? [fmtFixed(r.val, 1), 'Ω'] : md.eskala === 2000 ? [fmtFixed(r.val / 1000, 3), 'kΩ'] : [fmtFixed(r.val / 1000, 2), 'kΩ'];
  }

  function update() {
    const pts = puntuak();
    if (!pts.includes(st.gorria)) st.gorria = 'B';
    if (!pts.includes(st.beltza)) st.beltza = 'C';
    let r = neurtu();
    let blown = false;
    if (r.md.mota === 'A' && st.fusiblea && Math.abs(r.val) > (r.md.eskala < 1 ? 0.2 : 10)) {
      st.fusiblea = false; blown = true;
      r = neurtu();
    }
    const [txt, unit] = lcd(r);

    // zeregin betetakoak
    if (!r.err && txt !== 'OL') ZEREGINAK.forEach(z => { if (z.ok(r.md, r.val, st)) eginak.add(z.id); });

    // botoiak
    const segs = (id, key) => {
      $(id).innerHTML = pts.map(p => `<button data-p="${p}" class="${st[key] === p ? 'active' : ''}">${IZENA[p]}</button>`).join('');
      $(id).querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { st[key] = b.dataset.p; update(); }));
    };
    segs('#po-red', 'gorria'); segs('#po-black', 'beltza');
    box.querySelectorAll('[data-mod]').forEach(b => b.classList.toggle('active', b.dataset.mod === st.modua));
    box.querySelectorAll('[data-eten]').forEach(b => b.classList.toggle('active', b.dataset.eten === st.eten));
    $('#po-fuse').hidden = st.fusiblea;

    // azalpena
    const pair = [st.gorria, st.beltza].sort().join('');
    let hint = '';
    if (r.err === 'pila') hint = '<b>Ez!</b> Ohmetroak bere pila du: ezin da erabili zirkuitua elikatuta dagoela. Deskonektatu pila.';
    else if (blown || (!st.fusiblea && r.md.mota === 'A')) hint = '<b>Polimetroaren fusiblea fundituta!</b> Amperimetroa paraleloan jarri duzu: ia erresistentziarik ez duenez, korronte handia igaro da. Amperimetroa zirkuitua etenda eta seriean jartzen da.';
    else if (r.md.mota === 'A' && st.eten === 'ez') hint = 'Amperimetroa seriean jartzeko, lehenik <b>zirkuitua eten</b> behar da, eta puntak etenaren bi aldeetan jarri.';
    else if (r.md.mota === 'A' && (pair === 'AA2' || pair === 'CD')) hint = '<b>Ondo:</b> amperimetroa seriean dago. Korronte guztia neurgailutik igarotzen da.';
    else if (r.md.mota === 'V' && txt === 'OL') hint = 'Pantailan <b>OL</b>: tentsioa eskala baino handiagoa da. Aukeratu eskala handiago bat.';
    else if (r.md.mota === 'V' && r.val < -0.001) hint = 'Balio <b>negatiboa</b>: puntak alderantziz daude (gorria potentzial baxuagoan).';
    else if (r.md.mota === 'V') hint = `Voltimetroak V(${IZENA[st.gorria]}) − V(${IZENA[st.beltza]}) neurtzen du, paraleloan.`;
    else if (r.md.mota === 'O' && txt === 'OL') hint = '<b>OL</b>: erresistentzia eskala baino handiagoa da, edo puntuen artean ez dago biderik.';
    else if (r.md.mota === 'O') hint = 'Ohmetroak bi punturen arteko erresistentzia neurtzen du, pilarik gabe.';
    $('#po-hint').innerHTML = hint;
    $('#po-tasks').innerHTML = ZEREGINAK.map(z => `<div><span>${z.testua}</span><b style="color:${eginak.has(z.id) ? 'var(--ok)' : 'var(--ink3)'}">${eginak.has(z.id) ? '✓' : '—'}</b></div>`).join('');

    // ---------- marrazkia ----------
    const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    let w = L(90, 70, 90, 153) + L(90, 167, 90, 250);
    w += st.eten === 'R1' ? L(90, 70, 122, 70) + L(150, 70, 185, 70) : L(90, 70, 185, 70);
    w += L(245, 70, 340, 70) + L(340, 70, 340, 130) + L(340, 190, 340, 250);
    w += st.eten === 'behea' ? L(340, 250, 240, 250) + L(190, 250, 90, 250) : L(340, 250, 90, 250);
    const probe = (p, col, sx) => { const [px, py] = POS[p]; return `<path d="M${sx} 300 C${sx} 330 ${px} ${py + 110} ${px} ${py}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`; };
    const dialIdx = MODUAK.findIndex(m => m.id === st.modua);
    const ang = -150 + dialIdx * (300 / (MODUAK.length - 1));
    const lcdCol = r.err || txt === 'OL' ? '#8a1f15' : '#1d2a1d';
    svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">
      <g stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round">${w}</g>
      ${st.pila ? `<line x1="72" y1="153" x2="108" y2="153" stroke="var(--ink)" stroke-width="2.5"/><line x1="81" y1="167" x2="99" y2="167" stroke="var(--ink)" stroke-width="6"/><text x="114" y="150" font-size="15" font-weight="700" fill="var(--s4)">+</text><text x="64" y="165" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)">9 V</text>`
        : `<line x1="90" y1="153" x2="90" y2="167" stroke="var(--paper)" stroke-width="6"/><text x="64" y="165" text-anchor="end" font-size="13" fill="var(--ink3)">pilarik ez</text>`}
      <rect x="185" y="61" width="60" height="18" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <text x="215" y="50" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">R₁ = 100 Ω</text>
      <rect x="331" y="130" width="18" height="60" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
      <text x="362" y="165" font-size="14" font-weight="700" fill="var(--ink)">R₂ = 200 Ω</text>
      ${st.eten !== 'ez' ? `<text x="${st.eten === 'R1' ? 136 : 215}" y="${st.eten === 'R1' ? 98 : 238}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--danger)">etena</text>` : ''}
      ${probe(st.beltza, 'var(--ink)', 470)}${probe(st.gorria, '#d63a2f', 540)}
      ${puntuak().map(p => { const [x, y] = POS[p]; const on = p === st.gorria ? '#d63a2f' : p === st.beltza ? 'var(--ink)' : 'var(--sheet)';
        return `<circle cx="${x}" cy="${y}" r="7" fill="${on}" stroke="var(--ink)" stroke-width="2"/><text x="${x + (x < 200 ? -14 : 14)}" y="${y + (y < 150 ? -10 : 22)}" text-anchor="${x < 200 ? 'end' : 'start'}" font-size="15" font-weight="700" fill="var(--ink)">${IZENA[p]}</text>`; }).join('')}
      <rect x="430" y="20" width="150" height="290" rx="14" style="fill:color-mix(in srgb, var(--s2) 70%, var(--sheet))" stroke="var(--ink)" stroke-width="2"/>
      <rect x="445" y="36" width="120" height="58" rx="4" fill="#cfd8c8" stroke="var(--ink)" stroke-width="1.5"/>
      <text x="553" y="76" text-anchor="end" font-size="30" font-family="ui-monospace, 'DejaVu Sans Mono', monospace" fill="${lcdCol}">${txt}</text>
      <text x="553" y="89" text-anchor="end" font-size="11" font-weight="700" fill="#1d2a1d">${unit}</text>
      <text x="505" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${r.md.mota === 'V' ? 'V⎓' : r.md.mota === 'A' ? 'A⎓' : 'Ω'} · ${r.md.izena}</text>
      <circle cx="505" cy="180" r="44" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
      <line x1="505" y1="180" x2="${505 + 36 * Math.sin(ang * Math.PI / 180)}" y2="${180 - 36 * Math.cos(ang * Math.PI / 180)}" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="505" cy="180" r="7" fill="var(--ink)"/>
      <circle cx="470" cy="286" r="10" fill="var(--ink)"/><text x="470" y="270" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--ink)">COM</text>
      <circle cx="540" cy="286" r="10" fill="#d63a2f" stroke="var(--ink)"/><text x="540" y="270" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--ink)">VΩmA</text>
      ${!st.fusiblea ? `<text x="505" y="246" text-anchor="middle" font-size="12" font-weight="700" fill="var(--danger)">FUSIBLEA ✗</text>` : ''}
    </g>`;
  }

  box.querySelectorAll('[data-mod]').forEach(b => b.addEventListener('click', () => { st.modua = b.dataset.mod; update(); }));
  box.querySelectorAll('[data-eten]').forEach(b => b.addEventListener('click', () => { st.eten = b.dataset.eten; update(); }));
  $('#po-pila').addEventListener('change', e => { st.pila = e.target.checked; update(); });
  // fusible berria jartzean, hautagailua tentsiora itzuli: bestela puntak lekuz aldatu gabe berriro funditzen da
  $('#po-fuse').addEventListener('click', () => { st.fusiblea = true; st.modua = 'V20'; update(); $('#po-hint').innerHTML = 'Fusible berria jarrita. Hautagailua <b>20 V</b>-ra itzuli da, segurtasunez. Orain jarri ondo puntak korrontea neurtu aurretik.'; });
  update();
}
