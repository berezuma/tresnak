// Erresistentzia eta materialak: hari baten R = ρ · L / S (eta tenperatura), eta erresistentzien kolore-kodea
import { fmt, slider, esc } from '../util.js';
import { erresistentziaSVG, KOLOREAK, TOLERANTZIAK } from '../eskema.js';

export const MATERIALAK = [
  { id: 'kobrea', izena: 'Kobrea', rho: 0.017, alpha: 0.0039, kolorea: '#c8743a' },
  { id: 'aluminioa', izena: 'Aluminioa', rho: 0.028, alpha: 0.004, kolorea: '#b8bec6' },
  { id: 'burdina', izena: 'Burdina', rho: 0.1, alpha: 0.005, kolorea: '#7d7f83' },
  { id: 'konstantana', izena: 'Konstantana', rho: 0.5, alpha: 0.00002, kolorea: '#b09a6e' },
  { id: 'nikromoa', izena: 'Nikromoa', rho: 1.1, alpha: 0.0004, kolorea: '#8e8478' }
];
const fmtOhm = R => R >= 1000 ? `${fmt(R / 1000, 3)} kΩ` : `${fmt(R, R >= 1 ? 2 : 3)} Ω`;

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  let modua = opts.modua || 'haria';
  let cleanup = () => {};

  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage" id="ha-stage"></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Modua">
            <button data-modua="haria">Haria</button><button data-modua="kodea">Kolore-kodea</button>
          </div>
          <div id="ha-panel" style="display:grid;gap:12px"></div>
        </div>
      </div>
      <div class="sim-foot"><span id="ha-foot"></span><span id="ha-formula"></span></div>
    </div>`;
  const $ = s => box.querySelector(s);

  function setMode(m) {
    modua = m;
    box.querySelectorAll('[data-modua]').forEach(b => b.classList.toggle('active', b.dataset.modua === m));
    cleanup();
    cleanup = m === 'haria' ? hariaMode() : kodeaMode();
  }
  box.querySelectorAll('[data-modua]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.modua)));

  // ---------- haria ----------
  function hariaMode() {
    let mat = MATERIALAK[0];
    $('#ha-stage').innerHTML = `<svg viewBox="0 0 600 300" role="img" aria-label="Hari bat ohmetro batekin neurtzen"></svg>`;
    $('#ha-panel').innerHTML = `
      <div class="seg" role="group" aria-label="Materiala" style="flex-wrap:wrap">${MATERIALAK.map(m => `<button data-mat="${m.id}" class="${m === mat ? 'active' : ''}">${m.izena}</button>`).join('')}</div>
      <div id="ha-ctl" style="display:grid;gap:10px"></div>
      <div class="readouts" aria-live="polite">
        <div><span>Erresistibitatea, ρ</span><b id="ha-rho"></b></div>
        <div class="hi"><span>Erresistentzia, R</span><b id="ha-r"></b></div>
      </div>
      <table class="table-mini"><thead><tr><th>Materiala (L eta S berak)</th><th>R</th></tr></thead><tbody id="ha-tb"></tbody></table>`;
    $('#ha-foot').textContent = 'Luzera bikoitza → erresistentzia bikoitza. Sekzio bikoitza → erresistentzia erdia.';
    $('#ha-formula').textContent = 'R = ρ · L / S';
    const ctl = $('#ha-ctl');
    const sL = slider(ctl, { id: 'ha-l', label: 'Luzera, L', min: 1, max: 100, step: 1, value: 50, unit: 'm', format: v => fmt(v, 0) });
    const sS = slider(ctl, { id: 'ha-s', label: 'Sekzioa, S', min: 0.5, max: 10, step: 0.5, value: 1.5, unit: 'mm²', format: v => fmt(v, 1) });
    const sT = maila >= 3 ? slider(ctl, { id: 'ha-t', label: 'Tenperatura, T', min: -20, max: 300, step: 5, value: 20, unit: '°C', format: v => fmt(v, 0) }) : null;
    const svg = $('#ha-stage svg');

    function draw() {
      const L = sL.value, S = sS.value, T = sT ? sT.value : 20;
      const R20 = mat.rho * L / S, R = R20 * (1 + mat.alpha * (T - 20));
      const len = 60 + 440 * L / 100, th = 6 + 30 * Math.sqrt(S / 10), x0 = 300 - len / 2, y = 200;
      const hot = Math.max(0, Math.min(1, (T - 60) / 240));
      svg.innerHTML = `<g font-family="Lato, system-ui, sans-serif">
        <rect x="200" y="14" width="200" height="74" rx="8" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
        <rect x="216" y="26" width="168" height="38" fill="#cfd8c8" stroke="var(--ink3)"/>
        <text x="300" y="54" text-anchor="middle" font-size="24" font-family="ui-monospace, monospace" fill="#1d2a1d">${esc(fmtOhm(R))}</text>
        <text x="300" y="81" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink2)">OHMETROA</text>
        <path d="M230 88 C230 140 ${x0} 130 ${x0} ${y}" fill="none" stroke="#d63a2f" stroke-width="3"/>
        <path d="M370 88 C370 140 ${x0 + len} 130 ${x0 + len} ${y}" fill="none" stroke="var(--ink)" stroke-width="3"/>
        <rect x="${x0}" y="${y - th / 2}" width="${len}" height="${th}" rx="${th / 2}" fill="${mat.kolorea}" stroke="var(--ink)" stroke-width="1.5"/>
        ${hot > 0 ? `<rect x="${x0}" y="${y - th / 2}" width="${len}" height="${th}" rx="${th / 2}" fill="#ff5a1f" opacity="${(hot * 0.7).toFixed(2)}"/>` : ''}
        <rect x="${x0 + 6}" y="${y - th / 2 + th * 0.18}" width="${Math.max(0, len - 12)}" height="${Math.max(1.5, th * 0.16)}" rx="2" fill="#fff" opacity=".35"/>
        <circle cx="${x0}" cy="${y}" r="5" fill="var(--ink)"/><circle cx="${x0 + len}" cy="${y}" r="5" fill="var(--ink)"/>
        <path d="M${x0} ${y + 40} H${x0 + len} M${x0} ${y + 33} V${y + 47} M${x0 + len} ${y + 33} V${y + 47}" stroke="var(--ink2)" stroke-width="1.5"/>
        <text x="300" y="${y + 62}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">L = ${fmt(L, 0)} m</text>
        <text x="${x0 + len + 14}" y="${y + 5}" font-size="14" font-weight="700" fill="var(--ink)">S = ${fmt(S, 1)} mm²</text>
        <text x="${x0}" y="${y - th / 2 - 10}" font-size="13.5" fill="var(--ink2)">${mat.izena}${sT ? ` · ${fmt(T, 0)} °C` : ''}</text>
      </g>`;
      $('#ha-rho').textContent = `${fmt(mat.rho, 3)} Ω·mm²/m`;
      $('#ha-r').textContent = fmtOhm(R);
      $('#ha-tb').innerHTML = MATERIALAK.map(m => {
        const r = m.rho * L / S * (1 + m.alpha * (T - 20));
        return `<tr style="${m === mat ? 'font-weight:700' : ''}"><td>${m.izena}</td><td>${fmtOhm(r)}</td></tr>`;
      }).join('');
    }
    $('#ha-panel').querySelectorAll('[data-mat]').forEach(bt => bt.addEventListener('click', () => {
      mat = MATERIALAK.find(m => m.id === bt.dataset.mat);
      $('#ha-panel').querySelectorAll('[data-mat]').forEach(x => x.classList.toggle('active', x === bt));
      draw();
    }));
    [sL, sS, sT].forEach(s => s?.on(draw));
    draw();
    return () => {};
  }

  // ---------- kolore-kodea ----------
  function kodeaMode() {
    const st = { d1: 4, d2: 7, m: 2, tol: 'urrea', jolasa: false };
    $('#ha-stage').innerHTML = `<div class="kodea-fig" id="ha-fig"></div><p class="kodea-val" id="ha-val" aria-live="polite"></p>`;
    const opt = (from, sel) => KOLOREAK.slice(from).map(([n], i) => `<option value="${i + from}" ${i + from === sel ? 'selected' : ''}>${n} (${i + from})</option>`).join('');
    $('#ha-panel').innerHTML = `
      <div class="teacher-row" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <label for="ha-b1">1. banda<select id="ha-b1">${opt(1, st.d1)}</select></label>
        <label for="ha-b2">2. banda<select id="ha-b2">${opt(0, st.d2)}</select></label>
        <label for="ha-b3">Biderkatzailea<select id="ha-b3">${KOLOREAK.slice(0, 7).map(([n], i) => `<option value="${i}" ${i === st.m ? 'selected' : ''}>${n} (× ${fmt(10 ** i, 0)})</option>`).join('')}<option value="-1">urrea (× 0,1)</option></select></label>
        <label for="ha-b4">Tolerantzia<select id="ha-b4">${Object.entries(TOLERANTZIAK).map(([n, [, p]]) => `<option value="${n}">${n} (±${p} %)</option>`).join('')}</select></label>
      </div>
      <div class="readouts" id="ha-read" aria-live="polite"></div>
      <div class="pills"><button class="btn sm primary" id="ha-game">Asmatu balioa</button></div>
      <div id="ha-gamebox"></div>`;
    $('#ha-foot').textContent = 'Beltza 0 · marroia 1 · gorria 2 · laranja 3 · horia 4 · berdea 5 · urdina 6 · morea 7 · grisa 8 · zuria 9';
    $('#ha-formula').textContent = 'R = (1. · 10 + 2.) · biderkatzailea';
    const value = () => (st.d1 * 10 + st.d2) * 10 ** st.m;
    const fmtR = R => R >= 1e6 ? `${fmt(R / 1e6, 2)} MΩ` : R >= 1000 ? `${fmt(R / 1000, 2)} kΩ` : `${fmt(R, 1)} Ω`;
    function draw() {
      const R = value(), p = TOLERANTZIAK[st.tol][1];
      $('#ha-fig').innerHTML = erresistentziaSVG([st.d1, st.d2, st.m, st.tol], 520);
      const hide = st.jolasa;
      $('#ha-val').textContent = hide ? '? Ω' : `${fmtR(R)} ± ${p} %`;
      $('#ha-read').innerHTML = hide ? '<div><span>Balioa</span><b>?</b></div>' : `
        <div class="hi"><span>Balio nominala</span><b>${fmtR(R)}</b></div>
        <div><span>Tolerantzia</span><b>± ${p} %</b></div>
        <div><span>Tartea</span><b>${fmtR(R * (1 - p / 100))} – ${fmtR(R * (1 + p / 100))}</b></div>`;
    }
    const bind = (id, key, num = true) => $(id).addEventListener('change', e => { st[key] = num ? +e.target.value : e.target.value; st.jolasa = false; $('#ha-gamebox').innerHTML = ''; draw(); });
    bind('#ha-b1', 'd1'); bind('#ha-b2', 'd2'); bind('#ha-b3', 'm'); bind('#ha-b4', 'tol', false);
    $('#ha-game').addEventListener('click', () => {
      st.d1 = 1 + Math.floor(Math.random() * 9); st.d2 = Math.floor(Math.random() * 10); st.m = Math.floor(Math.random() * 5);
      st.tol = Math.random() < 0.7 ? 'urrea' : 'zilarra';
      st.jolasa = true;
      $('#ha-b1').value = st.d1; $('#ha-b2').value = st.d2; $('#ha-b3').value = st.m; $('#ha-b4').value = st.tol;
      $('#ha-gamebox').innerHTML = `<div class="answer"><label for="ha-ans">Balioa</label><input id="ha-ans" type="text" inputmode="decimal" autocomplete="off"><span class="unit">Ω</span><button class="btn sm" id="ha-chk">Egiaztatu</button></div><p class="fb" id="ha-fb" aria-live="polite"></p>`;
      const chk = () => {
        const raw = $('#ha-ans').value.trim().replace(',', '.').toLowerCase();
        let v = parseFloat(raw);
        if (/k/.test(raw)) v *= 1000;
        if (/m(?!.*k)/.test(raw) && /mω|mohm|meg/.test(raw)) v *= 1e6;
        const ok = Math.abs(v - value()) <= value() * 0.005;
        $('#ha-fb').className = 'fb ' + (ok ? 'ok' : 'no');
        $('#ha-fb').textContent = ok ? `Zuzena! ${fmtR(value())}` : 'Ez da hori. Begiratu koloreen taula (ohmetan idatzi, adibidez 4700).';
        if (ok) { st.jolasa = false; draw(); }
      };
      $('#ha-chk').addEventListener('click', chk);
      $('#ha-ans').addEventListener('keydown', e => { if (e.key === 'Enter') chk(); });
      draw();
    });
    draw();
    return () => {};
  }

  setMode(modua);
  return () => cleanup();
}
