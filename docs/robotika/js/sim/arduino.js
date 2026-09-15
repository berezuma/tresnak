// Arduino UNO birtuala: blokeekin programatu (setup eta loop), plakako osagaiak ikusi eta sortutako C++ kodea irakurri.
// Muntaia finkoa: 13 LED gorria · 12 LED horia · ~11 LED berdea · ~9 LED urdina · 7 haizagailua (transistore bidez)
// · 8 buzzerra · ~6 servoa · 2 botoia · A0 potentziometroa · A1 LDR. Serie-monitorea eta kodea eskuinean.
// Aukerak: adibideak [id], adibidea, gorde (gakoa), libre, maila
import { esc, slider, irakurri, gorde, fmt } from '../util.js';
import { Exekutatzailea, ProgramaErrorea, zenbakia, fmtBalioa } from '../blokeak/exekutatzailea.js';
import { sortuKodea, margotu } from '../blokeak/kodea.js';
import * as E from '../blokeak/eraiki.js';

const L = (...a) => a.reduce((x, y) => E.lotu(x, y));
const V = E.aldagaia, T = E.testua;

export function sortuPlaka() {
  const u = {
    pinak: { 13: 0, 12: 0, 11: 0, 9: 0, 8: 0, 7: 0 }, pwm: { 11: 0, 9: 0 },
    botoia: false, A0: 512, A1: 700, servo: 90, tonua: null, serieak: [],
    onAldaketa: null, onTonua: null, onSerie: null,
    idatzi(pin, v255) {
      u.pinak[pin] = v255 > 0 ? 1 : 0;
      if (pin in u.pwm) u.pwm[pin] = v255;
      u.onAldaketa?.();
    },
    serieanIdatzi(t) { u.serieak.push(t); if (u.serieak.length > 300) u.serieak.shift(); u.onSerie?.(); },
    berrezarri() {
      Object.keys(u.pinak).forEach(p => { u.pinak[p] = 0; });
      u.pwm[11] = u.pwm[9] = 0;
      u.servo = 90; u.tonua = null; u.serieak = [];
      u.onAldaketa?.(); u.onSerie?.();
    }
  };
  return u;
}

const serieTestua = v => typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : typeof v === 'boolean' ? (v ? '1' : '0') : String(v);

export function arduinoBlokeak(u) {
  const zenbOsoa = (x, b, izena) => Math.round(zenbakia(x.balioa(b, izena)));
  return {
    ar_digital_idatzi: { *agindua(x, b) { u.idatzi(+b.fields?.PIN, b.fields?.BALIOA === 'HIGH' ? 255 : 0); } },
    ar_digital_irakurri: { balioa: () => u.botoia ? 1 : 0 },
    ar_analogiko_irakurri: { balioa: (x, b) => Math.round(b.fields?.PIN === 'A1' ? u.A1 : u.A0) },
    ar_pwm: {
      *agindua(x, b) {
        const v = zenbOsoa(x, b, 'BALIOA');
        if (v < 0 || v > 255) throw new ProgramaErrorea(`analogWrite: balioak 0 eta 255 artean egon behar du (orain ${v}). Erabili «mapatu» blokea.`, b.id);
        u.idatzi(+b.fields?.PIN, v);
      }
    },
    ar_servo: {
      *agindua(x, b) {
        const v = zenbOsoa(x, b, 'GRADUAK');
        if (v < 0 || v > 180) throw new ProgramaErrorea(`Servoak 0° eta 180° artean bakarrik biratzen du (orain ${v}°).`, b.id);
        u.servo = v;
        u.onAldaketa?.();
        yield { mota: 'itxaron', ms: 15 };
      }
    },
    ar_tonua: {
      *agindua(x, b) {
        const hz = Math.max(0, zenbakia(x.balioa(b, 'HZ'))), ms = Math.max(0, zenbakia(x.balioa(b, 'MS')));
        u.tonua = hz;
        u.onTonua?.(hz, ms);
        u.onAldaketa?.();
        yield { mota: 'itxaron', ms };
        u.tonua = null;
        u.onAldaketa?.();
      }
    },
    ar_map: {
      balioa(x, b) {
        const [v, a, c, d, e] = ['BALIOA', 'NL', 'NH', 'TL', 'TH'].map(k => zenbakia(x.balioa(b, k)));
        if (a === c) throw new ProgramaErrorea('mapatu: jatorrizko tartearen bi muturrak ezin dira berdinak izan.', b.id);
        return Math.trunc((v - a) * (e - d) / (c - a) + d);
      }
    },
    ar_serial: { *agindua(x, b) { u.serieanIdatzi(serieTestua(x.balioa(b, 'BALIOA'))); } }
  };
}
export const ARDUINO_HATAK = { ar_setup: 'hasiera', ar_loop: 'betiko' };

export const ADIBIDEAK = {
  hutsa: { izena: 'Programa hutsa', azalpena: 'Hasi hutsetik: «setup» behin exekutatzen da, eta «loop» etengabe.', programa: () => E.programa([E.setup([]), E.loop([])], []) },
  keinua: { izena: 'Keinuka (Blink)', azalpena: 'Arduinoren lehen programa klasikoa: 13 pineko LEDa segundo erdiz piztu eta segundo erdiz itzali, behin eta berriz.',
    programa: () => E.programa([E.setup([]), E.loop([E.dIdatzi(13, 1), E.itxaron(500), E.dIdatzi(13, 0), E.itxaron(500)])]) },
  semaforoa: { izena: 'Semaforoa', azalpena: 'Sekuentzia bat denborarekin: berdea 3 s, horia 1 s eta gorria 3 s. Aldatu denborak.',
    programa: () => E.programa([E.setup([]), E.loop([E.dIdatzi(11, 1), E.itxaron(3000), E.dIdatzi(11, 0), E.dIdatzi(12, 1), E.itxaron(1000), E.dIdatzi(12, 0), E.dIdatzi(13, 1), E.itxaron(3000), E.dIdatzi(13, 0)])]) },
  botoia: { izena: 'Botoia eta LEDa', azalpena: 'Sarrera digitala: 2 pineko botoia sakatuta dagoen bitartean (1), LED gorria piztuta. Eutsi botoia sakatuta.',
    programa: () => E.programa([E.setup([]), E.loop([E.baldinBestela(E.konparatu(E.dIrakurri(2), 'EQ', 1), [E.dIdatzi(13, 1)], [E.dIdatzi(13, 0)])])]) },
  dimmerra: { izena: 'Argi-erregulagailua (PWM)', azalpena: 'Potentziometroa (A0, 0–1023) irakurri, 0–255 tartera mapatu eta LED urdinaren distira PWM bidez aldatu. Serie-monitorean balioak ikusten dira.',
    programa: () => E.programa([E.setup([]), E.loop([
      E.ezarri('balioa', E.aIrakurri('A0')),
      E.pwm(9, E.mapatu(V('balioa'), 0, 1023, 0, 255)),
      E.serial(L(T('A0 = '), V('balioa'))),
      E.itxaron(200)
    ])], ['balioa']) },
  farola: { izena: 'Farola automatikoa', azalpena: 'LDRak (A1) argia neurtzen du. Balioa 300etik behera jaisten denean (iluntzean), LED gorria pizten da. Mugitu argiaren graduatzailea.',
    programa: () => E.programa([E.setup([]), E.loop([
      E.ezarri('argia', E.aIrakurri('A1')),
      E.baldinBestela(E.konparatu(V('argia'), 'LT', 300), [E.dIdatzi(13, 1)], [E.dIdatzi(13, 0)]),
      E.itxaron(100)
    ])], ['argia']) },
  servoa: { izena: 'Servoa potentziometroarekin', azalpena: 'Potentziometroaren posizioa (0–1023) servoaren angelu bihurtzen da (0–180°). Robot-beso baten artikulazio bat horrela kontrolatzen da.',
    programa: () => E.programa([E.setup([E.servo(90)]), E.loop([E.servo(E.mapatu(E.aIrakurri('A0'), 0, 1023, 0, 180)), E.itxaron(50)])]) },
  termostatoa: { izena: 'Haizagailua (termostatoa)', azalpena: 'Potentziometroak tenperatura-sentsore bat simulatzen du (0–1023 → 0–50 °C). 30 °C gainditzean haizagailua (7) pizten da. Kontrol-sistema itxi bat da.',
    programa: () => E.programa([E.setup([]), E.loop([
      E.ezarri('tenperatura', E.mapatu(E.aIrakurri('A0'), 0, 1023, 0, 50)),
      E.serial(L(T('T = '), V('tenperatura'), T(' °C'))),
      E.baldinBestela(E.konparatu(V('tenperatura'), 'GT', 30), [E.dIdatzi(7, 1)], [E.dIdatzi(7, 0)]),
      E.itxaron(500)
    ])], ['tenperatura']) },
  alarma: { izena: 'Alarma', azalpena: 'Botoia sakatzean, buzzerrak bi tonu txandakatzen ditu eta LED gorriak keinu egiten du.',
    programa: () => E.programa([E.setup([]), E.loop([E.baldin(E.konparatu(E.dIrakurri(2), 'EQ', 1), [E.dIdatzi(13, 1), E.tonua(880, 200), E.dIdatzi(13, 0), E.tonua(660, 200)])])]) }
};

const LEDAK = [[13, 45, '#ff3b30', 'gorria'], [12, 80, '#ffcc00', 'horia'], [11, 115, '#34c759', 'berdea'], [9, 150, '#2f7bff', 'urdina']];
const pinX = p => 92 + (13 - p) * 12;
const analogX = a => 177 + a * 12;

function plakaSVG(P) {
  const hari = pts => `<polyline class="ar-hari" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
  let s = '';
  // hariak
  const mailak = { 13: 172, 12: 166, 11: 160, 9: 154 };
  LEDAK.forEach(([p, x]) => { s += hari([[x, 100], [x, mailak[p]], [pinX(p), mailak[p]], [pinX(p), 186]]); });
  s += hari([[215, 66], [215, 136], [pinX(8), 136], [pinX(8), 186]]);
  s += hari([[300, 84], [300, 142], [pinX(7), 142], [pinX(7), 186]]);
  s += hari([[340, 142], [340, 160], [pinX(6), 160], [pinX(6), 186]]);
  s += hari([[310, 215], [285, 215], [285, 176], [pinX(2), 176], [pinX(2), 186]]);
  s += hari([[320, 294], [320, 322], [analogX(1), 322], [analogX(1), 304]]);
  s += hari([[380, 294], [380, 328], [analogX(0), 328], [analogX(0), 304]]);
  // plaka
  s += `<rect x="20" y="180" width="250" height="130" rx="10" fill="#0e7c86" stroke="#07545b" stroke-width="2"/>
    <rect x="4" y="198" width="28" height="34" rx="2" fill="#b8b8b8" stroke="#777"/><rect x="4" y="262" width="22" height="30" rx="2" fill="#222"/>
    <text x="150" y="252" text-anchor="middle" class="ar-plaka-t">ARDUINO</text><text x="150" y="272" text-anchor="middle" class="ar-plaka-t sm">UNO</text>
    <rect x="86" y="186" width="176" height="14" fill="#1c1c1c"/><rect x="170" y="290" width="80" height="14" fill="#1c1c1c"/>`;
  for (let p = 13; p >= 0; p--) {
    s += `<rect class="ar-pin" id="${P}-pin${p}" x="${pinX(p) - 3.5}" y="189.5" width="7" height="7"/>
      <text class="ar-pin-t" x="${pinX(p)}" y="210" text-anchor="middle">${[11, 10, 9, 6, 5, 3].includes(p) ? '~' : ''}${p}</text>`;
  }
  for (let a = 0; a < 6; a++) s += `<rect class="ar-pin" x="${analogX(a) - 3.5}" y="293.5" width="7" height="7"/><text class="ar-pin-t" x="${analogX(a)}" y="287" text-anchor="middle">A${a}</text>`;
  s += '<text class="ar-pin-t" x="174" y="220" text-anchor="middle">DIGITAL (~PWM)</text>';
  // LEDak
  LEDAK.forEach(([p, x, kol, iz]) => {
    s += `<circle class="ar-dirdira" id="${P}-g${p}" cx="${x}" cy="60" r="22" fill="${kol}" opacity="0"/>
      <path class="ar-led" id="${P}-l${p}" d="M${x - 10} 72 V58 A10 10 0 0 1 ${x + 10} 58 V72 Z" fill="${kol}"/>
      <line x1="${x - 4}" y1="72" x2="${x - 4}" y2="100" class="ar-hanka"/><line x1="${x + 4}" y1="72" x2="${x + 4}" y2="92" class="ar-hanka"/>
      <text class="ar-tag" x="${x}" y="34" text-anchor="middle">D${p}</text><title>LED ${iz}, ${p} pina</title>`;
  });
  // buzzerra
  s += `<circle cx="215" cy="50" r="15" fill="#222" stroke="#000"/><circle cx="215" cy="50" r="3" fill="#555"/>
    <g id="${P}-buz" class="ar-uhinak" opacity="0"><path d="M234 40 Q242 50 234 60 M240 34 Q252 50 240 66"/></g>
    <text class="ar-tag" x="215" y="26" text-anchor="middle">D8 buzzerra</text>`;
  // haizagailua
  s += `<circle cx="300" cy="60" r="24" class="ar-kaxa"/>
    <g id="${P}-fan" class="ar-fan" style="transform-origin:300px 60px">${[0, 120, 240].map(a => `<ellipse cx="300" cy="47" rx="6" ry="12" transform="rotate(${a} 300 60)"/>`).join('')}<circle cx="300" cy="60" r="4"/></g>
    <text class="ar-tag" x="300" y="28" text-anchor="middle">D7 haizagailua</text>`;
  // servoa
  s += `<rect x="318" y="118" width="44" height="24" rx="3" fill="#2f6fd6" stroke="#1a4390"/>
    <g id="${P}-horn"><rect x="350" y="127" width="28" height="6" rx="3" fill="#fff" stroke="#555"/></g><circle cx="352" cy="130" r="4" fill="#ddd" stroke="#555"/>
    <text class="ar-tag" x="340" y="110" text-anchor="middle">D6 servoa</text>`;
  // botoia
  s += `<g class="ar-btn" id="${P}-btn" role="button" tabindex="0" aria-label="2 pineko botoia (eutsi sakatuta)">
      <rect x="310" y="200" width="40" height="30" rx="4" fill="#555" stroke="#222"/><circle class="ar-btn-c" cx="330" cy="215" r="9"/></g>
    <text class="ar-tag" x="330" y="194" text-anchor="middle">D2 botoia</text>`;
  // LDR eta potentziometroa
  s += `<circle id="${P}-eguzkia" cx="320" cy="262" r="10" fill="#f0b83f" opacity=".6"/>
    <circle cx="320" cy="280" r="13" fill="#e8d3a8" stroke="#8a6d3b"/><path d="M312 276 h4 v8 h4 v-8 h4 v8" fill="none" stroke="#8a1c1c" stroke-width="1.6"/>
    <text class="ar-tag" x="320" y="248" text-anchor="middle">A1 LDR</text>
    <circle cx="380" cy="280" r="14" fill="#3a6ea5" stroke="#1d3d63"/><line id="${P}-pot" x1="380" y1="280" x2="380" y2="268" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <text class="ar-tag" x="380" y="258" text-anchor="middle">A0 pot.</text>`;
  return s;
}

export default function mount(box, opts = {}) {
  const P = 'ar' + Math.random().toString(36).slice(2, 7);
  const ids = opts.adibideak || Object.keys(ADIBIDEAK).filter(k => k !== 'hutsa' || opts.libre);
  const GAKOA = opts.gorde || 'robotika:arduino:v1';
  const egoera = { programak: {}, ...irakurri(GAKOA, {}) };
  let aid = ids.includes(opts.adibidea) ? opts.adibidea : ids.includes(egoera.azkena) ? egoera.azkena : ids[0];
  const u = sortuPlaka();
  let ex = null, ed = null, raf = 0, last = 0, hilda = false, gordeT = 0, audioa = null, azkenRead = '';

  box.innerHTML = `
    <div class="sim rb ars">
      <div class="rb-head">
        <label for="${P}-adib">Adibidea</label>
        <select id="${P}-adib">${ids.map(k => `<option value="${k}" ${k === aid ? 'selected' : ''}>${esc(ADIBIDEAK[k].izena)}</option>`).join('')}</select>
        <button class="btn sm ghost" id="${P}-orig" title="Adibidearen jatorrizko programa berriro kargatu">Jatorrizkoa</button>
      </div>
      <div class="rb-body">
        <div class="rb-kodea">
          <div class="rb-brief"><p class="rb-azal" id="${P}-desk"></p></div>
          <div class="rb-editorea" id="${P}-ed"><div class="rb-kargatzen">Blokeak kargatzen…</div></div>
        </div>
        <div class="rb-mundua">
          <div class="rb-stage"><svg id="${P}-svg" viewBox="0 0 410 336" role="img" aria-label="Arduino UNO plaka eta osagaiak">${plakaSVG(P)}</svg></div>
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Exekutatu</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
              <button class="btn sm" id="${P}-botoia">D2 botoia (eutsi)</button>
            </div>
            <div id="${P}-sliders" style="display:grid;gap:8px"></div>
            <div class="readouts" id="${P}-read" aria-live="off"></div>
            <label class="check"><input type="checkbox" id="${P}-audio" checked> Soinua</label>
            <div><h4 class="fd-h">Serie-monitorea</h4><pre class="ks-out ar-serie" id="${P}-serie" aria-live="polite"></pre></div>
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
      <div class="kd-panela">
        <div class="kd-head"><span class="rb-head-l">C++ kodea (Arduino IDE)</span><span class="kd-oharra">Blokeek sortua. Kopiatu eta kargatu benetako plaka batean.</span></div>
        <pre class="kd-kodea"><code id="${P}-kodea"></code></pre>
      </div>
    </div>`;

  const $ = s => box.querySelector(s);
  const sl = $(`#${P}-sliders`);
  slider(sl, { id: P + '-a0', label: 'Potentziometroa (A0)', min: 0, max: 1023, step: 1, value: u.A0, format: v => fmt(v, 0) }).on(v => { u.A0 = v; pantaila(); });
  slider(sl, { id: P + '-a1', label: 'Argia LDRan (A1)', min: 0, max: 1023, step: 1, value: u.A1, format: v => fmt(v, 0) }).on(v => { u.A1 = v; pantaila(); });

  function mezua(t, mota = '') { const el = $(`#${P}-msg`); el.className = 'rb-msg' + (mota ? ' ' + mota : ''); el.textContent = t; }

  function pantaila() {
    LEDAK.forEach(([p]) => {
      const argia = p in u.pwm ? u.pwm[p] / 255 : u.pinak[p];
      $(`#${P}-g${p}`).setAttribute('opacity', (argia * 0.55).toFixed(2));
      $(`#${P}-l${p}`).style.opacity = 0.3 + 0.7 * argia;
    });
    [13, 12, 11, 9, 8, 7, 6, 2].forEach(p => {
      const on = p === 2 ? u.botoia : p === 6 ? true : p === 8 ? u.tonua !== null : !!u.pinak[p];
      $(`#${P}-pin${p}`).classList.toggle('on', on);
    });
    $(`#${P}-fan`).classList.toggle('on', !!u.pinak[7]);
    $(`#${P}-buz`).setAttribute('opacity', u.tonua !== null ? 1 : 0);
    $(`#${P}-horn`).setAttribute('transform', `rotate(${-u.servo} 352 130)`);
    $(`#${P}-btn`).classList.toggle('sakatuta', u.botoia);
    $(`#${P}-pot`).setAttribute('transform', `rotate(${-135 + 270 * u.A0 / 1023} 380 280)`);
    $(`#${P}-eguzkia`).setAttribute('opacity', (0.1 + 0.9 * u.A1 / 1023).toFixed(2));
    const vars = ex ? ex.aldagaiZerrenda().filter(([, v]) => v !== undefined).map(([k, v]) => `${k} = ${fmtBalioa(v)}`).join(' · ') : '';
    const read = `<div><span>Pinak 13 · 12 · 11 · 9 · 7</span><b>${u.pinak[13]} · ${u.pinak[12]} · ${u.pwm[11]} · ${u.pwm[9]} · ${u.pinak[7]}</b></div>
      <div><span>Servoa (6)</span><b>${u.servo}°</b></div>
      <div><span>Botoia (2) · A0 · A1</span><b>${u.botoia ? 1 : 0} · ${Math.round(u.A0)} · ${Math.round(u.A1)}</b></div>
      ${vars ? `<div><span>Aldagaiak</span><b>${esc(vars)}</b></div>` : ''}`;
    if (read !== azkenRead) { $(`#${P}-read`).innerHTML = read; azkenRead = read; }
  }
  u.onAldaketa = pantaila;
  u.onSerie = () => { const o = $(`#${P}-serie`); o.textContent = u.serieak.join('\n'); o.scrollTop = o.scrollHeight; };
  u.onTonua = (hz, ms) => {
    if (!$(`#${P}-audio`).checked || ms <= 0 || hz <= 0) return;
    try {
      audioa ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = audioa.createOscillator(), g = audioa.createGain();
      o.type = 'square'; o.frequency.value = hz; g.gain.value = 0.04;
      o.connect(g).connect(audioa.destination);
      o.start(); o.stop(audioa.currentTime + ms / 1000 * 0.9);
    } catch { /* soinurik gabe */ }
  };

  function kodea() { if (ed) $(`#${P}-kodea`).innerHTML = margotu(sortuKodea(ed.json(), 'cpp'), 'cpp'); }

  function exekutatu() {
    const json = ed?.json();
    if (!json) return;
    gelditu();
    u.berrezarri();
    ed.errorea(null);
    ex = new Exekutatzailea({ blokeak: arduinoBlokeak(u), hatak: ARDUINO_HATAK });
    ex.on('errorea', e => { mezua(e.message, 'err'); ed?.errorea(e.id); botoiak(); });
    ex.on('egoera', eg => { if (eg === 'amaituta') { mezua('Programa amaitu da (loop hutsik).'); ed?.nabarmendu(null); } botoiak(); });
    ex.kargatu(json);
    if (!ex.goikoak.some(b => b.type === 'ar_setup' || b.type === 'ar_loop')) {
      mezua('Jarri blokeak «setup» edo «loop» blokeen barruan.', 'err');
      ex = null;
      return;
    }
    mezua('');
    ex.hasi();
    begizta();
    botoiak();
  }
  function begizta() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const frame = now => {
      if (hilda) return;
      const dt = Math.min(now - last, 100);
      last = now;
      if (ex && ex.egoera === 'martxan') {
        ex.aurreratu(dt);
        ed?.nabarmendu(ex.egoera === 'martxan' ? ex.azkena : null);
        pantaila();
        raf = requestAnimationFrame(frame);
      } else raf = 0;
    };
    raf = requestAnimationFrame(frame);
  }
  function gelditu() {
    if (ex && ex.egoera === 'martxan') ex.gelditu();
    ed?.nabarmendu(null);
    botoiak();
  }
  function botoiak() {
    const martxan = ex && ex.egoera === 'martxan';
    const run = $(`#${P}-run`);
    run.textContent = martxan ? '■ Gelditu' : '▶ Exekutatu';
    run.classList.toggle('primary', !martxan);
  }
  $(`#${P}-run`).addEventListener('click', () => { if (ex && ex.egoera === 'martxan') { gelditu(); mezua('Geldituta.'); } else exekutatu(); });
  $(`#${P}-reset`).addEventListener('click', () => { gelditu(); ex = null; u.berrezarri(); mezua(''); ed?.errorea(null); pantaila(); });

  // botoia: eutsi sakatuta (panelekoa eta plakakoa)
  const sakatu = bai => { u.botoia = bai; $(`#${P}-botoia`).classList.toggle('sakatuta', bai); pantaila(); };
  [$(`#${P}-botoia`), $(`#${P}-btn`)].forEach(el => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch { /* */ } sakatu(true); });
    ['pointerup', 'pointercancel'].forEach(ev => el.addEventListener(ev, () => sakatu(false)));
    el.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); sakatu(true); } });
    el.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') sakatu(false); });
    el.addEventListener('blur', () => { if (u.botoia) sakatu(false); });
  });

  function gordeLaster() {
    clearTimeout(gordeT);
    gordeT = setTimeout(() => {
      if (hilda || !ed) return;
      egoera.programak[aid] = ed.json();
      egoera.azkena = aid;
      gorde(GAKOA, egoera);
      kodea();
    }, 300);
  }
  $(`#${P}-adib`).addEventListener('change', e => {
    if (ed) egoera.programak[aid] = ed.json();
    gelditu();
    aid = e.target.value;
    egoera.azkena = aid;
    gorde(GAKOA, egoera);
    $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
    ed?.kargatu(egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa());
    kodea();
    mezua('');
  });
  $(`#${P}-orig`).addEventListener('click', () => {
    gelditu();
    delete egoera.programak[aid];
    gorde(GAKOA, egoera);
    ed?.kargatu(ADIBIDEAK[aid].programa());
    kodea();
    mezua('Jatorrizko programa kargatuta.');
  });

  $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
  pantaila();
  import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
    tresnak: 'arduino',
    json: egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa(),
    onAldaketa: gordeLaster
  })).then(editorea => {
    if (hilda) { editorea.dispose(); return; }
    ed = editorea;
    opts.onEditorea?.(editorea);
    kodea();
  }).catch(err => {
    console.error(err);
    $(`#${P}-ed`).innerHTML = '<div class="notice err">Bloke-editorea ezin izan da kargatu. Freskatu orria.</div>';
  });

  return () => {
    hilda = true;
    cancelAnimationFrame(raf);
    if (ex && ex.egoera === 'martxan') ex.gelditu();
    clearTimeout(gordeT);
    if (ed) { egoera.programak[aid] = ed.json(); gorde(GAKOA, egoera); ed.dispose(); }
    try { audioa?.close(); } catch { /* */ }
  };
}
