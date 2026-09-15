// Micro:bit birtuala: 5×5 LED pantaila, A eta B botoiak, tenperatura- eta argi-sentsoreak, pinak eta soinua.
// Programa blokeekin egiten da, eta benetako plakan bezala exekutatzen da: «hasieran» lehenik,
// gero «betiko» etengabe, eta botoien gertaerak sakatzean.
// Aukerak: adibideak [id], adibidea, gorde (gakoa), libre (programa hutsarekin hasi), maila
import { esc, slider, irakurri, gorde, fmt } from '../util.js';
import { Exekutatzailea, ProgramaErrorea, zenbakia, fmtBalioa } from '../blokeak/exekutatzailea.js';
import { IKONOAK } from '../blokeak/definizioak.js';
import * as E from '../blokeak/eraiki.js';

// 5×5 letra-tipoa (errenkadak goitik behera; zabalera marrazkitik ateratzen da)
const LETRAK = {
  0: ['01110', '10011', '10101', '11001', '01110'], 1: ['00100', '01100', '00100', '00100', '01110'],
  2: ['11100', '00010', '01100', '10000', '11110'], 3: ['11110', '00010', '00100', '10010', '01100'],
  4: ['00110', '01010', '10010', '11111', '00010'], 5: ['11111', '10000', '11110', '00001', '11110'],
  6: ['00010', '00100', '01110', '10001', '01110'], 7: ['11111', '00010', '00100', '01000', '10000'],
  8: ['01110', '10001', '01110', '10001', '01110'], 9: ['01110', '10001', '01110', '00100', '01000'],
  A: ['01100', '10010', '11110', '10010', '10010'], B: ['11100', '10010', '11100', '10010', '11100'],
  C: ['01110', '10000', '10000', '10000', '01110'], D: ['11100', '10010', '10010', '10010', '11100'],
  E: ['11110', '10000', '11100', '10000', '11110'], F: ['11110', '10000', '11100', '10000', '10000'],
  G: ['01110', '10000', '10011', '10001', '01110'], H: ['10010', '10010', '11110', '10010', '10010'],
  I: ['111', '010', '010', '010', '111'], J: ['11111', '00010', '00010', '10010', '01100'],
  K: ['10010', '10100', '11000', '10100', '10010'], L: ['1000', '1000', '1000', '1000', '1111'],
  M: ['10001', '11011', '10101', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01100', '10010', '10010', '10010', '01100'], P: ['11100', '10010', '11100', '10000', '10000'],
  Q: ['01100', '10010', '10010', '01100', '00110'], R: ['11100', '10010', '11100', '10010', '10001'],
  S: ['01110', '10000', '01100', '00010', '11100'], T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10010', '10010', '10010', '10010', '01100'], V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'], X: ['10010', '10010', '01100', '10010', '10010'],
  Y: ['10001', '01010', '00100', '00100', '00100'], Z: ['11110', '00100', '01000', '10000', '11110'],
  ' ': ['000', '000', '000', '000', '000'], '!': ['1', '1', '1', '0', '1'], '?': ['1110', '0001', '0110', '0000', '0100'],
  '.': ['0', '0', '0', '0', '1'], ',': ['00', '00', '00', '01', '10'], ':': ['0', '1', '0', '1', '0'],
  '-': ['000', '000', '111', '000', '000'], '+': ['000', '010', '111', '010', '000'], '=': ['000', '111', '000', '111', '000'],
  '°': ['010', '101', '010', '000', '000'], '%': ['11001', '11010', '00100', '01011', '10011']
};
const letra = ch => LETRAK[ch.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')] || LETRAK['?'];

// Testua zutabeetan (zutabe bakoitza: 5 bit, goitik behera)
export function zutabeak(testua) {
  const cols = [];
  for (const ch of String(testua)) {
    const g = letra(ch);
    const w = ch === ' ' ? 3 : Math.max(1, ...g.map(r => r.lastIndexOf('1') + 1));
    for (let c = 0; c < w; c++) cols.push(g.map(r => r[c] === '1' ? 1 : 0));
    cols.push([0, 0, 0, 0, 0]);
  }
  cols.pop();
  return cols;
}

export function sortuPlaka() {
  const leds = Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]);
  const p = {
    leds,
    botoiak: { A: false, B: false },
    sentsoreak: { tenperatura: 21, argia: 120, P1: 600 },
    pinak: { P0: 0, P1: 0, P2: 0 },
    onAldaketa: null,
    onNota: null,
    marraztu(rows) {
      for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) leds[y][x] = rows[y][x] === '1' || rows[y][x] === 1 ? 1 : 0;
      p.onAldaketa?.();
    },
    garbitu() { p.marraztu(Array(5).fill('00000')); },
    led(ekintza, x, y) {
      leds[y][x] = ekintza === 'PIZTU' ? 1 : ekintza === 'ITZALI' ? 0 : 1 - leds[y][x];
      p.onAldaketa?.();
    },
    *testua(t) {
      const cols = zutabeak(t);
      if (cols.length <= 5) {
        const x0 = Math.floor((5 - cols.length) / 2);
        for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) leds[y][x] = cols[x - x0]?.[y] || 0;
        p.onAldaketa?.();
        yield { mota: 'itxaron', ms: 600 };
        return;
      }
      for (let off = -5; off <= cols.length; off++) {
        for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) leds[y][x] = cols[off + x]?.[y] || 0;
        p.onAldaketa?.();
        yield { mota: 'itxaron', ms: 120 };
      }
    },
    pinIrakurri: pin => pin === 'P1' ? Math.round(p.sentsoreak.P1) : p.pinak[pin] ? 1023 : 0,
    berrezarri() { p.pinak.P0 = p.pinak.P1 = p.pinak.P2 = 0; p.garbitu(); }
  };
  return p;
}

export function microbitBlokeak(p) {
  const koord = (x, b, izena) => {
    const v = Math.round(zenbakia(x.balioa(b, izena)));
    if (v < 0 || v > 4) throw new ProgramaErrorea(`LEDaren ${izena.toLowerCase()} koordenatuak 0 eta 4 artean egon behar du (orain ${v}).`, b.id);
    return v;
  };
  return {
    mb_ikonoa: { *agindua(x, b) { p.marraztu(IKONOAK[b.fields?.IKONOA] || IKONOAK.BIHOTZA); yield { mota: 'itxaron', ms: 600 }; } },
    mb_zenbakia: { *agindua(x, b) { yield* p.testua(fmtBalioa(Math.round(zenbakia(x.balioa(b, 'ZENB')) * 100) / 100)); } },
    mb_testua: { *agindua(x, b) { yield* p.testua(b.fields?.TEXT ?? ''); } },
    mb_led: { *agindua(x, b) { const X = koord(x, b, 'X'), Y = koord(x, b, 'Y'); p.led(b.fields?.EKINTZA, X, Y); } },
    mb_garbitu: { *agindua() { p.garbitu(); } },
    mb_botoia_sakatuta: { balioa: (x, b) => !!p.botoiak[b.fields?.BOTOIA] },
    mb_tenperatura: { balioa: () => Math.round(p.sentsoreak.tenperatura) },
    mb_argia: { balioa: () => Math.round(p.sentsoreak.argia) },
    mb_pin_idatzi: { *agindua(x, b) { p.pinak[b.fields?.PIN] = +b.fields?.BALIOA ? 1 : 0; p.onAldaketa?.(); } },
    mb_pin_analogikoa: { balioa: (x, b) => p.pinIrakurri(b.fields?.PIN) },
    mb_nota: {
      *agindua(x, b) {
        const ms = Math.max(0, zenbakia(x.balioa(b, 'MS')));
        p.onNota?.(+b.fields?.NOTA, ms);
        yield { mota: 'itxaron', ms };
      }
    }
  };
}
export const MICROBIT_HATAK = { mb_betiko: 'betiko', mb_botoia: b => 'gertaera:botoia' + b.fields?.BOTOIA, mb_astindu: 'gertaera:astindu' };

export const ADIBIDEAK = {
  hutsa: { izena: 'Programa hutsa', azalpena: 'Hasi hutsetik: arrastatu blokeak ezkerreko kategorietatik.', programa: () => E.programa([E.hasieran([]), E.betiko([])]) },
  bihotza: { izena: 'Bihotz taupadak', azalpena: 'Hasieran agurra, eta gero «betiko» blokeak bi irudi txandakatzen ditu. Aldatu itxaronaldiak: bihotza azkarrago ari da taupadaka?',
    programa: () => E.programa([E.hasieran([E.mbTestua('Kaixo!')]), E.betiko([E.ikonoa('BIHOTZA'), E.itxaron(300), E.ikonoa('BIHOTZ_TXIKIA'), E.itxaron(300)])]) },
  kontagailua: { izena: 'Kontagailua', azalpena: 'A botoiak 1 gehitzen dio «kontagailua» aldagaiari, eta B botoiak zerora itzultzen du. Aldagaiak plakaren memorian gordetzen dira.',
    programa: () => E.programa([
      E.hasieran([E.ezarri('kontagailua', 0), E.mbZenbakia(E.aldagaia('kontagailua'))]),
      E.botoia('A', [E.aldatu('kontagailua', 1), E.mbZenbakia(E.aldagaia('kontagailua'))]),
      E.botoia('B', [E.ezarri('kontagailua', 0), E.mbZenbakia(E.aldagaia('kontagailua'))])
    ], ['kontagailua']) },
  termometroa: { izena: 'Termometroa', azalpena: 'Tenperatura 25 °C-tik gorakoa bada, eguzkia; bestela, tenperatura zenbakiz. Aldatu tenperatura graduatzailearekin.',
    programa: () => E.programa([E.betiko([E.baldinBestela(E.konparatu(E.tenperatura(), 'GT', 25), [E.ikonoa('EGUZKIA')], [E.mbZenbakia(E.tenperatura())]), E.itxaron(500)])]) },
  dadoa: { izena: 'Dadoa', azalpena: 'Astintzean, 1 eta 6 arteko ausazko zenbaki bat agertzen da. Sakatu «Astindu».',
    programa: () => E.programa([E.hasieran([E.ikonoa('BAI')]), E.astintzean([E.mbZenbakia(E.ausazkoa(1, 6))])]) },
  farola: { izena: 'Farola automatikoa', azalpena: 'Argi-maila 60tik behera jaisten bada, P0 pinari lotutako argia pizten da. Sentsorea (argia), erabakia (baldin) eta eragingailua (P0): kontrol-sistema baten adibidea.',
    programa: () => E.programa([E.betiko([E.baldinBestela(E.konparatu(E.argia(), 'LT', 60), [E.pinIdatzi('P0', 1), E.ikonoa('EGUZKIA')], [E.pinIdatzi('P0', 0), E.garbituPantaila()]), E.itxaron(200)])]) },
  nekazaritza: { izena: 'Nekazaritza adimenduna', landarea: true, azalpena: 'Hezetasun-sentsorea P1 pinean dago, eta ur-ponpa P0 pinean. Lurra lehorregia badago (400 baino gutxiago), ponpa pizten da. «Landarea simulatu» aktibatuta, ponpak lurra hezetzen du, eta bestela lurra lehortu egiten da.',
    programa: () => E.programa([E.betiko([
      E.ezarri('hezetasuna', E.pinAnalogikoa('P1')),
      E.baldinBestela(E.konparatu(E.aldagaia('hezetasuna'), 'LT', 400), [E.pinIdatzi('P0', 1), E.ikonoa('TANTA')], [E.pinIdatzi('P0', 0), E.ikonoa('POZIK')]),
      E.itxaron(500)
    ])], ['hezetasuna']) },
  musika: { izena: 'Doinua', azalpena: 'A botoia sakatzean, eskala bat jotzen du. Soinua entzuteko, egiaztatu ordenagailuaren bolumena.',
    programa: () => E.programa([E.hasieran([E.ikonoa('NOTA')]), E.botoia('A', [E.nota(262, 250), E.nota(294, 250), E.nota(330, 250), E.nota(349, 250), E.nota(392, 500)])]) }
};

function plakaSVG(P) {
  let leds = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) leds += `<rect class="mb-led" id="${P}-l${x}${y}" x="${106 + x * 20}" y="${58 + y * 22}" width="8" height="14" rx="2"/>`;
  const pads = [['0', 50], ['1', 105], ['2', 160], ['3V', 215], ['GND', 262]];
  const botoia = (b, cx) => `<g class="mb-btn" data-b="${b}" role="button" tabindex="0" aria-label="${b} botoia">
      <text x="${cx}" y="84" text-anchor="middle" font-family="Lato, system-ui, sans-serif" font-weight="700" font-size="15" fill="#fff">${b}</text>
      <rect x="${cx - 15}" y="96" width="30" height="30" rx="3" fill="#3d3d3f" stroke="#000" stroke-width="1"/>
      <circle class="mb-botoi" cx="${cx}" cy="111" r="10"/></g>`;
  return `
    <rect x="8" y="8" width="284" height="236" rx="18" fill="#232427" stroke="#000" stroke-width="2"/>
    <g fill="none" stroke="#c7c7c7" stroke-width="2"><rect x="135" y="22" width="30" height="16" rx="8"/><circle cx="143" cy="30" r="3"/><circle cx="157" cy="30" r="3"/></g>
    ${leds}
    ${botoia('A', 50)}${botoia('B', 250)}
    <circle class="mb-p0" id="${P}-p0" cx="50" cy="176" r="5"/>
    <text x="62" y="180" font-family="Lato, system-ui, sans-serif" font-size="11" fill="#c7c7c7">P0</text>
    ${pads.map(([t, cx]) => `<g><rect x="${cx - 19}" y="192" width="38" height="48" rx="3" fill="#c9a227"/><circle cx="${cx}" cy="208" r="7" fill="var(--paper)"/>
      <text x="${cx}" y="233" text-anchor="middle" font-family="Lato, system-ui, sans-serif" font-weight="700" font-size="11" fill="#1d1d1f">${t}</text></g>`).join('')}`;
}

export default function mount(box, opts = {}) {
  const P = 'mb' + Math.random().toString(36).slice(2, 7);
  const ids = opts.adibideak || Object.keys(ADIBIDEAK).filter(k => k !== 'hutsa' || opts.libre);
  const GAKOA = opts.gorde || 'robotika:microbit:v1';
  const egoera = { programak: {}, ...irakurri(GAKOA, {}) };
  let aid = ids.includes(opts.adibidea) ? opts.adibidea : ids.includes(egoera.azkena) ? egoera.azkena : ids[0];
  const plaka = sortuPlaka();
  let ex = null, ed = null, raf = 0, last = 0, hilda = false, gordeT = 0, audioa = null, azkenAldagaiak = '';
  let landarea = !!ADIBIDEAK[aid].landarea;

  box.innerHTML = `
    <div class="sim rb mb">
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
          <div class="rb-stage mb-stage"><svg id="${P}-svg" viewBox="0 0 300 252" role="img" aria-label="Micro:bit plaka: LED pantaila eta botoiak">${plakaSVG(P)}</svg></div>
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Exekutatu</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <div class="mb-sarrerak" role="group" aria-label="Plakaren sarrerak">
              <button class="btn sm" data-b="A">A</button><button class="btn sm" data-b="B">B</button>
              <button class="btn sm" data-b="AB">A+B</button><button class="btn sm" id="${P}-shake">Astindu</button>
            </div>
            <div id="${P}-sliders" style="display:grid;gap:8px"></div>
            <label class="check"><input type="checkbox" id="${P}-land" ${landarea ? 'checked' : ''}> Landarea simulatu (P0 ponpak lurra hezetzen du)</label>
            <div class="readouts" aria-live="off">
              <div><span>P0 irteera</span><b class="mb-ponpa" id="${P}-p0t"><i></i>0</b></div>
              <div><span>Aldagaiak</span><b id="${P}-vars">—</b></div>
            </div>
            <label class="check"><input type="checkbox" id="${P}-audio" checked> Soinua</label>
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </div>`;

  const $ = s => box.querySelector(s);
  const sl = $(`#${P}-sliders`);
  const sT = slider(sl, { id: P + '-t', label: 'Tenperatura', min: -10, max: 45, step: 1, value: plaka.sentsoreak.tenperatura, unit: '°C', format: v => fmt(v, 0) }).on(v => { plaka.sentsoreak.tenperatura = v; });
  const sA = slider(sl, { id: P + '-a', label: 'Argi-maila', min: 0, max: 255, step: 1, value: plaka.sentsoreak.argia, format: v => fmt(v, 0) }).on(v => { plaka.sentsoreak.argia = v; });
  const sP = slider(sl, { id: P + '-p1', label: 'P1 sentsorea (hezetasuna)', min: 0, max: 1023, step: 1, value: plaka.sentsoreak.P1, format: v => fmt(v, 0) }).on(v => { plaka.sentsoreak.P1 = v; });

  function mezua(t, mota = '') {
    const el = $(`#${P}-msg`);
    el.className = 'rb-msg' + (mota ? ' ' + mota : '');
    el.textContent = t;
  }
  function pantaila() {
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) svgLed[y * 5 + x].classList.toggle('on', !!plaka.leds[y][x]);
    const on = !!plaka.pinak.P0;
    $(`#${P}-p0`).classList.toggle('on', on);
    const t = $(`#${P}-p0t`);
    t.classList.toggle('on', on);
    t.lastChild.textContent = on ? '1 (piztuta)' : '0';
  }
  const svgLed = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) svgLed.push($(`#${P}-l${x}${y}`));
  plaka.onAldaketa = pantaila;
  plaka.onNota = (hz, ms) => {
    if (!$(`#${P}-audio`).checked || ms <= 0) return;
    try {
      audioa ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = audioa.createOscillator(), g = audioa.createGain();
      o.type = 'square';
      o.frequency.value = hz;
      g.gain.value = 0.04;
      o.connect(g).connect(audioa.destination);
      o.start();
      o.stop(audioa.currentTime + ms / 1000 * 0.9);
    } catch { /* soinurik gabe */ }
  };

  function brief() { $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena; }

  // ---------- exekuzioa ----------
  function exekutatu() {
    const json = ed?.json();
    if (!json) return;
    gelditu();
    plaka.berrezarri();
    ed.errorea(null);
    ex = new Exekutatzailea({ blokeak: microbitBlokeak(plaka), hatak: MICROBIT_HATAK });
    ex.on('errorea', e => { mezua(e.message, 'err'); ed?.errorea(e.id); botoiak(); });
    ex.on('egoera', eg => {
      if (eg === 'amaituta') { mezua('Programa amaitu da.'); ed?.nabarmendu(null); }
      botoiak();
    });
    ex.kargatu(json);
    if (!ex.goikoak.some(b => ['ekitaldia_hasi', 'mb_betiko', 'mb_botoia', 'mb_astindu'].includes(b.type))) {
      mezua('Jarri blokeak «hasieran», «betiko» edo botoi baten blokearen barruan.', 'err');
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
      if (landarea) {
        const v = Math.max(0, Math.min(1023, plaka.sentsoreak.P1 + (plaka.pinak.P0 ? 90 : -14) * dt / 1000));
        if (Math.round(v) !== Math.round(plaka.sentsoreak.P1)) sP.value = Math.round(v);
        plaka.sentsoreak.P1 = v;
      }
      if (ex && ex.egoera === 'martxan') {
        ex.aurreratu(dt);
        ed?.nabarmendu(ex.egoera === 'martxan' ? ex.azkena : null);
        const vars = ex.aldagaiZerrenda().filter(([, v]) => v !== undefined).map(([k, v]) => `${k} = ${fmtBalioa(typeof v === 'number' ? Math.round(v * 100) / 100 : v)}`).join(' · ') || '—';
        if (vars !== azkenAldagaiak) { $(`#${P}-vars`).textContent = vars; azkenAldagaiak = vars; }
      }
      raf = (ex && ex.egoera === 'martxan') || landarea ? requestAnimationFrame(frame) : 0;
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
  $(`#${P}-run`).addEventListener('click', () => {
    if (ex && ex.egoera === 'martxan') { gelditu(); mezua('Geldituta.'); } else exekutatu();
  });
  $(`#${P}-reset`).addEventListener('click', () => {
    gelditu();
    plaka.berrezarri();
    $(`#${P}-vars`).textContent = '—';
    azkenAldagaiak = '';
    mezua('');
    ed?.errorea(null);
  });

  // ---------- sarrerak ----------
  function sakatu(b, bai) {
    if (b === 'AB') { plaka.botoiak.A = plaka.botoiak.B = bai; } else plaka.botoiak[b] = bai;
    box.querySelectorAll(`[data-b="${b}"]`).forEach(el => el.classList.toggle('sakatuta', bai));
    if (!bai && ex) ex.gertaera('botoia' + b);
  }
  box.querySelectorAll('[data-b]').forEach(el => {
    const b = el.dataset.b;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch { /* erakuslerik gabe (adib. ukipen-simulazioa) */ }
      sakatu(b, true);
    });
    el.addEventListener('pointerup', () => { if (plaka.botoiak.A || plaka.botoiak.B) sakatu(b, false); });
    el.addEventListener('pointercancel', () => sakatu(b, false));
    el.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      sakatu(b, true);
      setTimeout(() => sakatu(b, false), 120);
    });
  });
  $(`#${P}-shake`).addEventListener('click', () => {
    const svg = $(`#${P}-svg`);
    svg.animate?.([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 300 });
    ex?.gertaera('astindu');
  });
  $(`#${P}-land`).addEventListener('change', e => {
    landarea = e.target.checked;
    if (landarea && !raf) begizta();
  });

  // ---------- adibideak eta editorea ----------
  function gordeLaster() {
    clearTimeout(gordeT);
    gordeT = setTimeout(() => {
      if (hilda || !ed) return;
      egoera.programak[aid] = ed.json();
      egoera.azkena = aid;
      gorde(GAKOA, egoera);
    }, 400);
  }
  $(`#${P}-adib`).addEventListener('change', e => {
    if (ed) egoera.programak[aid] = ed.json();
    gelditu();
    aid = e.target.value;
    egoera.azkena = aid;
    gorde(GAKOA, egoera);
    brief();
    const land = !!ADIBIDEAK[aid].landarea;
    if (land !== landarea) { landarea = land; $(`#${P}-land`).checked = land; if (land) begizta(); }
    ed?.kargatu(egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa());
    mezua('');
  });
  $(`#${P}-orig`).addEventListener('click', () => {
    gelditu();
    delete egoera.programak[aid];
    gorde(GAKOA, egoera);
    ed?.kargatu(ADIBIDEAK[aid].programa());
    mezua('Jatorrizko programa kargatuta.');
  });

  brief();
  pantaila();
  if (landarea) begizta();
  import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
    tresnak: 'microbit',
    json: egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa(),
    onAldaketa: gordeLaster
  })).then(editorea => {
    if (hilda) { editorea.dispose(); return; }
    ed = editorea;
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
