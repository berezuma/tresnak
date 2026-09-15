// Gauzen Internet: berotegi bateko nodo batek (sentsoreak eta ponpa) datuak bidaltzen dizkio hodeiko zerbitzari bati (MQTT),
// eta mugikorreko aginte-panelak ikusten ditu eta aginduak bidaltzen ditu. Paketeak bidean ikusten dira.
// WiFi-a eten daiteke (nodoak mezuak gordetzen ditu), eta zerbitzariko arau automatiko batek ponpa kontrola dezake.
// Aukerak: maila
import { fmt, slider, esc } from '../util.js';

const BIDEA = [[140, 150], [230, 150], [290, 138], [360, 100], [460, 100], [540, 140]];
const IRAUPENA = 1.4; // s, paketea nodotik mugikorrera
const T = (x, y, s, cls = 'it-t', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;

function bideanPuntua(bidea, f) {
  const luzerak = bidea.slice(1).map((p, i) => Math.hypot(p[0] - bidea[i][0], p[1] - bidea[i][1]));
  let d = f * luzerak.reduce((a, b) => a + b, 0);
  for (let i = 0; i < luzerak.length; i++) {
    if (d <= luzerak[i]) { const k = d / luzerak[i]; return [bidea[i][0] + (bidea[i + 1][0] - bidea[i][0]) * k, bidea[i][1] + (bidea[i + 1][1] - bidea[i][1]) * k]; }
    d -= luzerak[i];
  }
  return bidea[bidea.length - 1];
}

export default function mount(box, opts = {}) {
  const P = 'it' + Math.random().toString(36).slice(2, 7);
  let t = 0, azkenBidalketa = -99, wifi = true, araua = true, ponpa = false, hez = 55, tenp = 22;
  let paketeak = [], buferra = [], log = [], historia = [], bidaliak = 0, byteak = 0, panela = { tenp: null, hez: null, ponpa: false, ordua: null };
  let raf = 0, last = performance.now(), hilda = false, azkenPanela = '';

  box.innerHTML = `
    <div class="sim its">
      <div class="sim-body">
        <div class="sim-stage it-stage">
          <svg id="${P}-svg" viewBox="0 0 640 250" role="img" aria-label="Gauzen Interneteko sistema: nodoa, bideratzailea, hodeia eta mugikorra"></svg>
          <div class="it-panela" id="${P}-panela" aria-live="off"></div>
        </div>
        <div class="sim-panel">
          <div class="pills">
            <button class="btn sm" id="${P}-wifi" aria-pressed="true">📶 WiFi: konektatuta</button>
          </div>
          <div id="${P}-ctl"></div>
          <label class="check" for="${P}-araua"><input type="checkbox" id="${P}-araua" checked> Arau automatikoa zerbitzarian: hezetasuna &lt; % 40 → ponpa piztu; &gt; % 60 → itzali</label>
          <div class="readouts" id="${P}-read" aria-live="off"></div>
          <div><h4 class="fd-h">MQTT mezuak (azkenak)</h4><pre class="ks-out it-log" id="${P}-log"></pre></div>
          <p class="lab-hint">Nodoak (Micro:bit edo ESP32 bat) sentsoreak irakurri eta mezu txikiak argitaratzen ditu gai (<em>topic</em>) batean. Zerbitzariak (<em>broker</em>) gai horretara harpidetutako guztiei bidaltzen dizkie.</p>
        </div>
      </div>
    </div>`;
  const $ = q => box.querySelector(q);
  const sTartea = slider($(`#${P}-ctl`), { id: P + '-tar', label: 'Bidalketa-tartea', min: 1, max: 10, step: 1, value: 3, unit: 's', format: v => fmt(v, 0) });

  const segundoak = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function erregistratu(norabidea, gaia, datua) {
    log.unshift(`${segundoak(t)} ${norabidea} ${gaia}  ${datua}`);
    if (log.length > 9) log.pop();
    $(`#${P}-log`).textContent = log.join('\n');
  }

  function argitaratu() {
    const mezua = { mota: 'datuak', gorantz: true, has: t, tenp: Math.round(tenp * 10) / 10, hez: Math.round(hez * 10) / 10, sortua: t };
    const karga = JSON.stringify({ tenperatura: mezua.tenp, hezetasuna: mezua.hez });
    byteak += karga.length + 'berotegia/sentsoreak'.length + 20;
    if (!wifi) { buferra.push(mezua); if (buferra.length > 20) buferra.shift(); return; }
    bidaliak++;
    paketeak.push(mezua);
    erregistratu('→', 'berotegia/sentsoreak', karga);
  }
  function agindua(egoera, zeinek) {
    const m = { mota: 'agindua', gorantz: false, has: t, egoera };
    erregistratu('←', 'berotegia/ponpa', `"${egoera ? 'ON' : 'OFF'}"  (${zeinek})`);
    byteak += 'berotegia/ponpa'.length + 24;
    paketeak.push(m);
  }

  function iritsi(m) {
    if (m.gorantz) {
      panela = { ...panela, tenp: m.tenp, hez: m.hez, ordua: m.sortua };
      historia.push(m.hez);
      if (historia.length > 30) historia.shift();
      if (araua) {
        if (m.hez < 40 && !panela.ponpa) { panela.ponpa = true; agindua(true, 'araua'); }
        else if (m.hez > 60 && panela.ponpa) { panela.ponpa = false; agindua(false, 'araua'); }
      }
    } else if (wifi) {
      ponpa = m.egoera;
    } else {
      m.galdua = true;
    }
  }

  function marraztuPanela() {
    const kurba = historia.length > 1 ? historia.map((h, i) => `${(i / 29 * 200).toFixed(1)},${(50 - h / 100 * 50).toFixed(1)}`).join(' ') : '';
    const berandu = panela.ordua !== null ? Math.max(0, t - panela.ordua) : null;
    const html = `
      <div class="it-txartela"><span>Tenperatura</span><b>${panela.tenp === null ? '—' : fmt(panela.tenp, 1) + ' °C'}</b></div>
      <div class="it-txartela"><span>Hezetasuna</span><b>${panela.hez === null ? '—' : '% ' + fmt(panela.hez, 1)}</b><i style="--h:${panela.hez ?? 0}%"></i></div>
      <div class="it-txartela"><span>Ponpa</span><button class="btn sm${panela.ponpa ? ' primary' : ''}" id="${P}-ponpa" ${araua ? 'disabled title="Arau automatikoa aktibo dago"' : ''}>${panela.ponpa ? 'Piztuta' : 'Itzalita'}</button></div>
      <div class="it-txartela zabala"><span>Hezetasuna (azken 30 neurketak)</span><svg viewBox="0 0 200 50" preserveAspectRatio="none"><line x1="0" y1="30" x2="200" y2="30" class="it-muga"/><line x1="0" y1="20" x2="200" y2="20" class="it-muga"/><polyline points="${kurba}" class="it-kurba"/></svg></div>
      <div class="it-egoera">${berandu === null ? 'Datuen zain…' : berandu > sTartea.value * 2 + 2 ? `⚠ Azken datuak duela ${fmt(berandu, 0)} s: nodoa konexiorik gabe?` : 'Datuak eguneratuta'}</div>`;
    if (html !== azkenPanela) {
      $(`#${P}-panela`).innerHTML = html;
      azkenPanela = html;
      $(`#${P}-ponpa`)?.addEventListener('click', () => { if (araua) return; panela.ponpa = !panela.ponpa; agindua(panela.ponpa, 'eskuz'); marraztuPanela(); });
    }
  }

  function frame(now) {
    if (hilda) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    t += dt;
    hez = Math.max(5, Math.min(95, hez + (ponpa ? 2.2 : -0.9) * dt));
    tenp = 22 + 4 * Math.sin(t / 25) + (Math.random() - 0.5) * 0.05;
    if (t - azkenBidalketa >= sTartea.value) { azkenBidalketa = t; argitaratu(); }
    paketeak = paketeak.filter(m => {
      if (t - m.has >= IRAUPENA) { if (!m.galdua) iritsi(m); return false; }
      if (!m.gorantz && !wifi && t - m.has > IRAUPENA * 0.8) { m.galdua = true; }
      return true;
    });

    let s = `<defs><marker id="${P}-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="it-punta"/></marker></defs>`;
    s += `<polyline class="it-bidea" points="${BIDEA.slice(1).map(p => p.join(',')).join(' ')}"/>`;
    s += `<line class="it-bidea wifi${wifi ? '' : ' etena'}" x1="${BIDEA[0][0]}" y1="150" x2="${BIDEA[1][0]}" y2="150"/>`;
    if (!wifi) s += T(185, 140, '✕', 'it-t err');
    // nodoa
    s += `<rect class="it-kutxa" x="20" y="100" width="120" height="100" rx="8"/>${T(80, 122, 'Berotegia', 'it-t b')}
      ${T(80, 146, `🌡 ${fmt(tenp, 1)} °C`, 'it-t sm')}${T(80, 166, `💧 % ${fmt(hez, 0)}`, 'it-t sm')}
      <circle class="it-ponpa${ponpa ? ' on' : ''}" cx="80" cy="184" r="7"/>${T(92, 188, ponpa ? 'ponpa ON' : 'ponpa OFF', 'it-t sm', 'start')}
      ${buferra.length ? T(80, 218, `${buferra.length} mezu gordeta`, 'it-t sm warn') : ''}`;
    s += `<rect class="it-kutxa" x="210" y="130" width="40" height="40" rx="6"/>${T(230, 156, '📶', 'it-t')}${T(230, 188, 'bideratzailea', 'it-t sm')}`;
    s += `<path class="it-hodeia" d="M330 120 a26 26 0 0 1 20 -44 a34 34 0 0 1 62 -8 a28 28 0 0 1 48 20 a22 22 0 0 1 -6 32 Z"/>${T(400, 94, 'Hodeia', 'it-t b')}${T(400, 112, 'MQTT zerbitzaria', 'it-t sm')}`;
    s += `<rect class="it-kutxa" x="545" y="100" width="60" height="100" rx="10"/><rect class="it-pantaila" x="552" y="112" width="46" height="72" rx="3"/>${T(575, 152, '📱', 'it-t')}${T(575, 218, 'aginte-panela', 'it-t sm')}`;
    paketeak.forEach(m => {
      const f = Math.min(1, (t - m.has) / IRAUPENA);
      const [x, y] = bideanPuntua(m.gorantz ? BIDEA : [...BIDEA].reverse(), f);
      s += `<g class="it-paketea${m.gorantz ? '' : ' agindua'}${m.galdua ? ' galdua' : ''}"><rect x="${(x - 11).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="22" height="16" rx="3"/>${T(x, y + 4, m.gorantz ? '{…}' : '⚙', 'it-t xs')}</g>`;
    });
    $(`#${P}-svg`).innerHTML = `<g class="it">${s}</g>`;
    marraztuPanela();
    $(`#${P}-read`).innerHTML = `<div><span>Bidalitako mezuak</span><b>${bidaliak}</b></div>
      <div><span>Nodoan gordeta (WiFi gabe)</span><b>${buferra.length}</b></div>
      <div><span>Datuak guztira</span><b>${fmt(byteak / 1024, 2)} KB</b></div>`;
    raf = requestAnimationFrame(frame);
  }

  $(`#${P}-wifi`).addEventListener('click', e => {
    wifi = !wifi;
    e.currentTarget.textContent = wifi ? '📶 WiFi: konektatuta' : '📵 WiFi: etenda';
    e.currentTarget.setAttribute('aria-pressed', String(wifi));
    e.currentTarget.classList.toggle('danger', !wifi);
    if (wifi && buferra.length) {
      buferra.forEach((m, i) => { m.has = t + i * 0.25; m.sortua = m.sortua ?? t; bidaliak++; paketeak.push(m); });
      erregistratu('→', 'berotegia/sentsoreak', `(${buferra.length} mezu gordeta bidalita)`);
      buferra = [];
    }
  });
  $(`#${P}-araua`).addEventListener('change', e => { araua = e.target.checked; azkenPanela = ''; });

  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
