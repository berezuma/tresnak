// Erronkak: programatu baldintza batzuk betetzen dituen irtenbidea, lau gailutan.
// Robot-saretan simulagailuak berak egiaztatzen du (aldaera guztiekin). Kontsolan, Arduinon eta robot mugikorrean,
// programa isilean exekutatzen da egoera desberdinetan (sarrerak, sentsoreen balioak, pistak), eta baldintza
// bakoitza bereiz egiaztatzen da.
import { progress, esc, irakurri } from '../util.js';
import { Exekutatzailea } from '../blokeak/exekutatzailea.js';
import { kontsolaBlokeak } from '../sim/kontsola.js';
import { sortuPlaka, arduinoBlokeak, ARDUINO_HATAK } from '../sim/arduino.js';
import { sortuRobota, robotBlokeak } from '../sim/robota.js';

const GAILUAK = {
  sareta: { izena: 'Robot-sareta', sim: 'sareta' },
  kontsola: { izena: 'Kontsola', sim: 'kontsola' },
  arduino: { izena: 'Arduino', sim: 'arduino' },
  mugikorra: { izena: 'Robot mugikorra', sim: 'robota' }
};
export const BIHURGUNE_MUGA = 30; // s

// ---------- programa isilean exekutatzeko laguntzaileak ----------
function blokeak(json) {
  const motak = [], zenbakiak = [], testuak = [];
  const walk = b => {
    if (!b) return;
    motak.push(b.type);
    if (b.type === 'math_number') zenbakiak.push(Number(b.fields?.NUM));
    if (b.type === 'testua') testuak.push(String(b.fields?.TEXT ?? ''));
    Object.values(b.inputs || {}).forEach(i => { walk(i.block); walk(i.shadow); });
    walk(b.next?.block);
  };
  (json?.blocks?.blocks || []).forEach(walk);
  return { motak, zenbakiak, testuak };
}
const begiztaDu = json => blokeak(json).motak.some(t => ['kontrol_errepikatu', 'kontrol_bitartean', 'kontrol_arte', 'kontrol_betiko'].includes(t));

export function kontsolaIrteera(json) {
  const lerroak = [];
  const ex = new Exekutatzailea({ blokeak: kontsolaBlokeak({ idatzi: t => lerroak.push(String(t).trim()) }, 0), muga: 300000 });
  let err = null;
  ex.on('errorea', e => { err = e; });
  ex.kargatu(json);
  const eg = ex.goikoak.some(b => b.type === 'ekitaldia_hasi') ? ex.exekutatuOsorik() : 'hutsik';
  return { lerroak, ondo: eg === 'amaituta' && !err };
}

export function arduinoProba(json) {
  const u = sortuPlaka();
  const ex = new Exekutatzailea({ blokeak: arduinoBlokeak(u), hatak: ARDUINO_HATAK });
  let err = null;
  ex.on('errorea', e => { err = e; });
  ex.kargatu(json);
  const badu = ex.goikoak.some(b => b.type === 'ar_setup' || b.type === 'ar_loop');
  if (badu) ex.hasi();
  return {
    u,
    ondo: () => badu && !err,
    pasa(ms) { for (let t = 0; t < ms; t += 5) if (ex.egoera === 'martxan') ex.aurreratu(5); }
  };
}

function segmentuDist(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2)) : 0;
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}
export function robotProba(json, pista, s, begiratu) {
  const r = sortuRobota(pista);
  const ex = new Exekutatzailea({ blokeak: robotBlokeak(r), hatak: { mb_betiko: 'betiko' } });
  let err = null;
  ex.on('errorea', e => { err = e; });
  ex.kargatu(json);
  const badu = ex.goikoak.some(b => b.type === 'ekitaldia_hasi' || b.type === 'mb_betiko');
  if (badu) ex.hasi();
  for (let t = 0; badu && t < s * 1000 && !r.talka && !err; t += 5) {
    if (ex.egoera === 'martxan') ex.aurreratu(5);
    r.urratsa(0.005);
    begiratu?.(r, t);
  }
  return { r, ondo: badu && !err };
}
// Itzulia pistaren erdigunearen inguruan, eta lerrotik gehieneko distantzia
function itzulia(json, pista, s, cx = 150, cy = 100) {
  let angelua = 0, aurrekoa = null, denbora = null, maxDist = 0;
  const P = robotProba(json, pista, s, (r, t) => {
    const a = Math.atan2(r.y - cy, r.x - cx);
    if (aurrekoa !== null) { let d = a - aurrekoa; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; angelua += d; }
    aurrekoa = a;
    if (denbora === null && Math.abs(angelua) >= 2 * Math.PI) denbora = t / 1000;
    if (t % 50 === 0) {
      const pts = r.pista.lerroa;
      let m = Infinity;
      for (let i = 0; i < pts.length; i++) m = Math.min(m, segmentuDist(r.x, r.y, pts[i], pts[(i + 1) % pts.length]));
      maxDist = Math.max(maxDist, m);
    }
  });
  return { ...P, denbora, maxDist };
}

const lehena = n => n >= 2 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every(d => n % d);
const fizz = n => n % 15 === 0 ? 'fizzbuzz' : n % 3 === 0 ? 'fizz' : n % 5 === 0 ? 'buzz' : String(n);

export const ERRONKAK = [
  // ---------- robot-sareta ----------
  { id: 'mendia', gailua: 'sareta', puzlea: 'e1', maila: 1, izena: 'Mendia', laburra: 'Bi patroi, 10 bloke',
    brief: 'Igo mendia eta jaitsi beste aldetik helmugaraino, gehienez 10 bloke erabilita. Exekutatu programa saretan: ondo badago, erronka automatikoki markatzen da.',
    laguntza: 'Bilatu igotzeko patroia eta jaisteko patroia, eta erabili «errepikatu» bakoitzarentzat.',
    irizpideak: ['Robota helmugara iristen da, hormarik jo gabe', 'Gehienez 10 bloke'] },
  { id: 'korridorea', gailua: 'sareta', puzlea: 'e2', maila: 2, izena: 'Korridore bihurria', laburra: 'Sentsoreekin, hiru korridoretan',
    brief: 'Programa bakar batek hiru korridore desberdinetan iritsi behar du helmugara. Robotak ez daki non dauden bihurguneak: sentsoreak erabili behar ditu.',
    laguntza: 'Helmugan egon arte: aurrean libre bada, aurrera; bestela, ezkerrean libre bada, ezkerrera; bestela, eskuinera.',
    irizpideak: ['Hiru korridoreetan helmugara iristen da', 'Ez du hormarik jotzen'] },
  { id: 'errenkadak', gailua: 'sareta', puzlea: 'e3', maila: 2, izena: 'Bi errenkada', laburra: 'Izarrak ausaz, 64 kasu',
    brief: 'Izarrak ausaz agertzen dira bi errenkadatan. Hartu guztiak eta amaitu helmugan, gehienez 13 bloke erabilita. Programa izarren 64 konbinazioekin probatzen da.',
    laguntza: 'Errenkada bakoitzean 6 aldiz: baldin izarra hemen bada, hartu; gero aurrera. Errenkaden artean: eskuinera, aurrera, eskuinera.',
    irizpideak: ['Izar guztiak hartzen ditu, 64 kasuetan', 'Helmugan amaitzen du', 'Gehienez 13 bloke'] },

  // ---------- kontsola ----------
  { id: 'zazpi', gailua: 'kontsola', maila: 1, izena: 'Zazpiren taula', laburra: '7, 14, 21… 70',
    brief: 'Idatzi 7ren lehen hamar multiploak kontsolan, bakoitza bere lerroan: 7, 14, 21… 70. Erabili begizta bat (ez idatzi hamar bloke).',
    laguntza: 'Aldagai bat 1etik 10era, eta errepikapen bakoitzean idatzi aldagaia × 7.',
    irizpideak: ['Programa errorerik gabe amaitzen da', 'Hamar lerro idazten ditu', 'Lerroak 7, 14, 21… 70 dira, ordenan', 'Begizta bat erabiltzen du'],
    check(json) {
      const o = kontsolaIrteera(json), nahi = Array.from({ length: 10 }, (_, i) => String(7 * (i + 1)));
      return [o.ondo, o.lerroak.length === 10, nahi.every((v, i) => o.lerroak[i] === v), begiztaDu(json)];
    } },
  { id: 'fizzbuzz', gailua: 'kontsola', maila: 2, izena: 'FizzBuzz', laburra: 'Hondarra eta baldintzak',
    brief: 'Idatzi 1etik 20ra arteko zenbakiak, baina 3ren multiploen ordez «Fizz», 5enen ordez «Buzz», eta bienen (15) ordez «FizzBuzz».',
    laguntza: 'Lehenik begiratu 15ekin (mod 15 = 0), gero 3rekin eta gero 5ekin; bestela, idatzi zenbakia. Ordenak garrantzia du.',
    irizpideak: ['Programa errorerik gabe amaitzen da', '20 lerro idazten ditu', '3ren multiploetan «Fizz»', '5enetan «Buzz»', '15ean «FizzBuzz»', 'Gainerakoetan zenbakia bera'],
    check(json) {
      const o = kontsolaIrteera(json), l = o.lerroak.map(s => s.toLowerCase());
      return [o.ondo, l.length === 20, [3, 6, 9, 12, 18].every(n => l[n - 1] === 'fizz'), [5, 10, 20].every(n => l[n - 1] === 'buzz'), l[14] === 'fizzbuzz',
        [1, 2, 4, 7, 8, 11, 13, 14, 16, 17, 19].every(n => l[n - 1] === fizz(n))];
    } },
  { id: 'faktoriala', gailua: 'kontsola', maila: 2, izena: 'Faktoriala', laburra: '8! kalkulatu begizta batekin',
    brief: 'Kalkulatu 8! = 1 · 2 · 3 · … · 8, eta idatzi emaitza kontsolaren azken lerroan. Programak kalkulatu behar du: ezin da 40320 zenbakia idatzi.',
    laguntza: 'Metagailu biderkatzailea: hasi 1ekin, eta errepikapen bakoitzean biderkatu kontagailuaz.',
    irizpideak: ['Programa errorerik gabe amaitzen da', 'Azken lerroa 40320 da', 'Begizta bat erabiltzen du', 'Ez du emaitza zuzenean idazten'],
    check(json) {
      const o = kontsolaIrteera(json), b = blokeak(json);
      return [o.ondo, o.lerroak.at(-1) === '40320', begiztaDu(json), !b.zenbakiak.includes(40320) && !b.testuak.some(t => t.includes('40320'))];
    } },
  { id: 'lehenak', gailua: 'kontsola', maila: 3, izena: 'Zenbaki lehenak', laburra: '50 baino txikiagoak',
    brief: 'Idatzi 50 baino txikiagoak diren zenbaki lehen guztiak, txikienetik handienera, bakoitza bere lerroan (2, 3, 5, 7…).',
    laguntza: 'Zenbaki bakoitzeko (n), probatu 2tik aurrera zatitzaileak (d): n mod d = 0 bada, ez da lehena. Nahikoa da d · d ≤ n den bitartean probatzea.',
    irizpideak: ['Programa errorerik gabe amaitzen da', 'Idatzitako zenbaki guztiak lehenak dira eta 50 baino txikiagoak', '15 zenbaki lehenak idazten ditu', 'Ordenan, errepikatu gabe'],
    check(json) {
      const o = kontsolaIrteera(json), n = o.lerroak.map(Number);
      const nahi = Array.from({ length: 49 }, (_, i) => i + 1).filter(lehena);
      return [o.ondo, n.length > 0 && n.every(x => Number.isInteger(x) && x < 50 && lehena(x)), nahi.every(p => n.includes(p)), n.every((x, i) => i === 0 || x > n[i - 1])];
    } },

  // ---------- Arduino ----------
  { id: 'sos', gailua: 'arduino', maila: 1, izena: 'SOS', laburra: 'Hiru labur, hiru luze, hiru labur',
    brief: 'Egin 13 pineko LEDak SOS larrialdi-seinalea egin dezan Morse kodean: hiru keinu labur (200 ms inguru), hiru luze (600 ms inguru) eta hiru labur.',
    laguntza: 'Hiru «errepikatu 3 aldiz» bloke: bakoitzean piztu, itxaron (200 edo 600 ms), itzali eta itxaron 200 ms.',
    irizpideak: ['Programa errorerik gabe exekutatzen da', 'LEDak 9 keinu egiten ditu gutxienez 12 segundotan', 'Lehen hiru keinuak laburrak (100–400 ms)', 'Hurrengo hiruak luzeak (400 ms edo gehiago)', 'Azken hiruak laburrak'],
    check(json) {
      const P = arduinoProba(json), pultsuak = [];
      let on = false, has = 0;
      for (let t = 0; t < 12000; t += 5) {
        P.pasa(5);
        const v = P.u.pinak[13] === 1;
        if (v && !on) { on = true; has = t; } else if (!v && on) { on = false; pultsuak.push(t - has); }
      }
      const p = pultsuak.slice(0, 9), labur = d => d >= 100 && d < 400;
      return [P.ondo(), p.length >= 9, p.length >= 3 && p.slice(0, 3).every(labur), p.length >= 6 && p.slice(3, 6).every(d => d >= 400), p.length >= 9 && p.slice(6, 9).every(labur)];
    } },
  { id: 'barra', gailua: 'arduino', maila: 2, izena: 'Argi-barra', laburra: 'Potentziometroa eta hiru LED',
    brief: 'Potentziometroaren balioaren (A0) arabera, piztu LEDak barra batean: 341 baino gutxiago bada, berdea (11) bakarrik; 341 eta 681 artean, berdea eta horia (12); 682tik aurrera, hirurak (gorria 13).',
    laguntza: 'Irakurri A0 aldagai batean. Berdea beti piztuta. Horia: baldin balioa ≥ 341, piztu; bestela, itzali. Gorria: gauza bera 682rekin.',
    irizpideak: ['Programa errorerik gabe exekutatzen da', 'A0 = 100: berdea bakarrik', 'A0 = 500: berdea eta horia', 'A0 = 900: hiru LEDak', 'A0 = 200 berriro: berdea bakarrik (besteak itzali egiten dira)'],
    check(json) {
      const P = arduinoProba(json);
      const egoera = a0 => { P.u.A0 = a0; P.pasa(400); return [11, 12, 13].map(p => P.u.pinak[p] ? 1 : 0).join(''); };
      return [P.ondo(), egoera(100) === '100', egoera(500) === '110', egoera(900) === '111', egoera(200) === '100'];
    } },
  { id: 'kommutadorea', gailua: 'arduino', maila: 2, izena: 'Botoi-kommutadorea', laburra: 'Sakatu: piztu; berriro: itzali',
    brief: 'Botoia (2) sakatzen den bakoitzean, LED gorriak (13) egoera aldatu behar du: itzalita badago, piztu; piztuta badago, itzali. Botoia sakatuta mantenduz gero, behin bakarrik aldatu behar du.',
    laguntza: 'Gorde botoiaren aurreko irakurketa aldagai batean. Aldaketa botoia orain 1 eta lehen 0 zenean bakarrik egin (ertza detektatu).',
    irizpideak: ['Programa errorerik gabe exekutatzen da', 'Hasieran LEDa itzalita', 'Lehen sakatzean pizten da', 'Bigarren sakatzean itzaltzen da', 'Sakatuta mantenduta, behin bakarrik aldatzen da'],
    check(json) {
      const P = arduinoProba(json), led = () => P.u.pinak[13];
      P.pasa(300);
      const l0 = led();
      const sakatu = ms => { P.u.botoia = true; P.pasa(ms); P.u.botoia = false; P.pasa(300); };
      sakatu(150); const l1 = led();
      sakatu(150); const l2 = led();
      let aldaketak = 0, aurrekoa = led();
      P.u.botoia = true;
      for (let t = 0; t < 1900; t += 5) {
        if (t === 1500) P.u.botoia = false;
        P.pasa(5);
        if (led() !== aurrekoa) { aldaketak++; aurrekoa = led(); }
      }
      return [P.ondo(), l0 === 0, l1 === 1, l2 === 0, aldaketak === 1 && led() === 1];
    } },
  { id: 'farola', gailua: 'arduino', maila: 3, izena: 'Farola histeresiarekin', laburra: 'Bi atalase: 300 eta 500',
    brief: 'LED gorriak (13) farola bat da. Argia (A1) 300etik behera jaisten denean pizten da, eta 500etik gora igotzen denean itzaltzen da. Bien artean, bere egoerari eutsi behar dio.',
    laguntza: 'Bi baldintza bereiz: baldin argia < 300 bada, piztu; baldin argia > 500 bada, itzali. Bien artean ez da ezer egiten, eta LEDak bere egoera mantentzen du.',
    irizpideak: ['Programa errorerik gabe exekutatzen da', 'A1 = 700 (egunez): itzalita', 'A1 = 400, iluntzen ari dela: itzalita jarraitzen du', 'A1 = 250 (gauez): pizten da', 'A1 = 400, argitzen ari dela: piztuta jarraitzen du', 'A1 = 600: itzaltzen da'],
    check(json) {
      const P = arduinoProba(json);
      const egoera = a1 => { P.u.A1 = a1; P.pasa(400); return P.u.pinak[13] ? 1 : 0; };
      return [P.ondo(), egoera(700) === 0, egoera(400) === 0, egoera(250) === 1, egoera(400) === 1, egoera(600) === 0];
    } },

  // ---------- robot mugikorra ----------
  { id: 'pareta', gailua: 'mugikorra', pistaId: 'gela', maila: 1, izena: 'Paretaraino', laburra: 'Gelditu 10–20 cm-ra',
    brief: 'Robota gelaren ezkerraldean dago, eskuineko paretari begira. Egin aurrera eta gelditu paretatik 10 eta 20 cm artera, talkarik egin gabe. 30 segundo ondoren egiaztatzen da.',
    laguntza: 'Betiko: baldin distantzia < 15 bada, gelditu motorrak; bestela, aurrera.',
    irizpideak: ['Programa errorerik gabe exekutatzen da, talkarik gabe', 'Robotak aurrera egin du (gelaren erdia gainditu du)', 'Geldi dago 30 segundotara', 'Paretatik 10–20 cm-ra dago'],
    check(json) {
      const { r, ondo } = robotProba(json, 'gela', 30);
      const d = r.distantzia();
      return [ondo && !r.talka, r.x > 150, r.vL === 0 && r.vR === 0, d >= 10 && d <= 20];
    } },
  { id: 'itzulia', gailua: 'mugikorra', pistaId: 'obala', maila: 2, izena: 'Itzulia', laburra: 'Pista obala, minutu bat baino gutxiago',
    brief: 'Egin itzuli oso bat pista obalean lerro beltzari jarraituz, 60 segundo baino gutxiagoan, lerrotik irten gabe.',
    laguntza: 'Bi sentsore: ezkerrekoak beltza ikusten badu, biratu ezkerrera; eskuinekoak ikusten badu, eskuinera; bestela, zuzen.',
    irizpideak: ['Programa errorerik gabe exekutatzen da, talkarik gabe', 'Ez da lerrotik urruntzen (6 cm baino gutxiago)', 'Itzuli osoa 60 s baino gutxiagoan'],
    check(json) {
      const I = itzulia(json, 'obala', 62);
      return [I.ondo && !I.r.talka, I.denbora !== null && I.maxDist < 6, I.denbora !== null && I.denbora <= 60];
    } },
  { id: 'bihurguneak', gailua: 'mugikorra', pistaId: 'bihurgunea', maila: 3, izena: 'Bihurguneak azkar', laburra: `Itzulia ${BIHURGUNE_MUGA} s baino gutxiagoan`,
    brief: `Egin itzuli oso bat bihurguneen pistan ${BIHURGUNE_MUGA} segundo baino gutxiagoan, lerrotik irten gabe. Abiadura handitu behar da, baina azkarregi joanez gero, robota bihurguneetan irten egiten da.`,
    laguntza: 'Hasi lerro-jarraitzaile arruntarekin eta igo abiadura pixkanaka. Biratzean gurpil bat gelditu beharrean, moteldu bakarrik probatu.',
    irizpideak: ['Programa errorerik gabe exekutatzen da, talkarik gabe', 'Ez da lerrotik urruntzen (8 cm baino gutxiago)', `Itzuli osoa ${BIHURGUNE_MUGA} s baino gutxiagoan`],
    check(json) {
      const I = itzulia(json, 'bihurgunea', BIHURGUNE_MUGA + 2);
      return [I.ondo && !I.r.talka, I.denbora !== null && I.maxDist < 8, I.denbora !== null && I.denbora <= BIHURGUNE_MUGA];
    } },
  { id: 'esploratzailea', gailua: 'mugikorra', pistaId: 'gela', maila: 3, izena: 'Esploratzailea', laburra: '90 s talkarik gabe, gela osoa',
    brief: 'Programatu robota gela oztopoz betean 90 segundoz ibil dadin talkarik egin gabe, gelaren lau zatiak bisitatuz eta gutxienez 12 metro eginez.',
    laguntza: 'Oztopo bat hurbil dagoenean, ez biratu denbora finko bat: biratu aurrean bide librea izan arte («errepikatu … arte» blokea).',
    irizpideak: ['Programa errorerik gabe exekutatzen da', 'Ez du talkarik egiten 90 segundotan', 'Gelaren lau laurdenak bisitatzen ditu', 'Gutxienez 1200 cm egiten ditu'],
    check(json) {
      const laurdenak = new Set();
      let bidea = 0, px = null, py = null;
      const { r, ondo } = robotProba(json, 'gela', 90, R => {
        laurdenak.add((R.x < 150 ? 'W' : 'E') + (R.y < 100 ? 'N' : 'S'));
        if (px !== null) bidea += Math.hypot(R.x - px, R.y - py);
        px = R.x; py = R.y;
      });
      return [ondo, ondo && !r.talka, laurdenak.size === 4, bidea >= 1200];
    } }
];

export default function render(root, { footer, cfg }) {
  const mailak = cfg.mailak;
  const nireMaila = cfg.maila ? cfg.maila() : 1;
  const ebatziak = () => new Set(progress.get('erronkak').ebatziak || []);
  const markatu = id => { const s = ebatziak(); if (!s.has(id)) { s.add(id); progress.set('erronkak', { ebatziak: [...s] }); } };
  // robot-saretan simulagailuak gordetako ebazpenak
  ERRONKAK.filter(e => e.gailua === 'sareta').forEach(e => { if (irakurri(`robotika:erronka:${e.id}`, {}).ebatziak?.includes(e.puzlea)) markatu(e.id); });
  let cur = ERRONKAK.find(e => !ebatziak().has(e.id) && e.maila <= nireMaila) || ERRONKAK[0];
  let stop = null, ed = null, txanda = 0;

  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Aplikatu</div>
      <h1>Erronkak</h1>
      <p class="lede">Programatu zuk zeuk baldintza batzuk betetzen dituen irtenbidea. Sakatu <b>Egiaztatu</b>: zure programa egoera desberdinetan exekutatuko da (botoiak, sentsoreen balioak, pistak…), eta baldintza bakoitza bereiz egiaztatuko da. Programak nabigatzaile honetan gordetzen dira.</p>
    </header>
    <div id="er-grid"></div>
    <section class="challenge-card er-cur" id="er-cur" aria-live="polite"></section>
    <div id="er-sim" class="er-sim"></div>
    ${footer()}`;
  const $ = s => root.querySelector(s);

  function grid() {
    const done = ebatziak();
    let n = 0;
    $('#er-grid').innerHTML = Object.entries(GAILUAK).map(([g, G]) => `
      <h2 class="er-talde">${esc(G.izena)}</h2>
      <div class="er-grid">${ERRONKAK.filter(e => e.gailua === g).map(e => `
        <button class="er-card ${e === cur ? 'on' : ''} ${done.has(e.id) ? 'done' : ''}" data-er="${e.id}" aria-pressed="${e === cur}">
          <span class="er-num">${++n}</span>
          <b>${esc(e.izena)}</b>
          <span>${esc(e.laburra)}</span>
          <span class="state">${done.has(e.id) ? 'Ebatzita ✓' : 'Egiteko'}${e.maila > 1 ? ` <span class="lvl lvl-${e.maila}">${mailak[e.maila].laburra}</span>` : ''}</span>
        </button>`).join('')}</div>`).join('');
    root.querySelectorAll('[data-er]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.er === cur.id) return;
      cur = ERRONKAK.find(e => e.id === b.dataset.er);
      ireki();
      $('#er-cur').scrollIntoView({ block: 'start' });
    }));
  }

  function panela(emaitzak = null, oharra = '') {
    const done = ebatziak().has(cur.id);
    const sareta = cur.gailua === 'sareta';
    $('#er-cur').innerHTML = `
      <header><h2>${esc(cur.izena)}</h2>
        <div class="tags"><span class="pill">${esc(GAILUAK[cur.gailua].izena)}</span><span class="pill strong">${mailak[cur.maila].izena}</span>${done ? '<span class="pill ok">Ebatzita</span>' : ''}</div></header>
      <div class="challenge-body">
        <p class="brief">${cur.brief}</p>
        <ul class="er-crit">${cur.irizpideak.map((t, i) => {
          const ok = emaitzak ? !!emaitzak[i] : sareta && done ? true : null;
          return `<li class="${ok === null ? '' : ok ? 'ok' : 'no'}"><i aria-hidden="true">${ok === null ? '○' : ok ? '✓' : '✗'}</i>${esc(t)}</li>`;
        }).join('')}</ul>
        <div class="pills">
          ${sareta ? '' : '<button class="btn primary" id="er-check">Egiaztatu</button>'}
          <button class="btn" id="er-hint">Pista</button>
        </div>
        <p class="ch-hint" id="er-pista" hidden>${cur.laguntza}</p>
        ${sareta ? '<p class="er-oharra">Exekutatu programa saretan. Baldintza guztiak betetzen baditu, erronka automatikoki markatzen da.</p>' : ''}
        ${oharra ? `<p class="ch-result no"><span class="verdict">${esc(oharra)}</span></p>` : ''}
        ${emaitzak ? `<p class="ch-result ${emaitzak.every(Boolean) ? 'ok' : 'no'}"><span class="verdict">${emaitzak.every(Boolean) ? 'Erronka ebatzita! Programa bikaina.' : `${emaitzak.filter(Boolean).length} / ${emaitzak.length} baldintza betetzen dira. Aldatu programa eta egiaztatu berriro.`}</span></p>` : ''}
      </div>`;
    $('#er-check')?.addEventListener('click', egiaztatu);
    $('#er-hint').addEventListener('click', () => { $('#er-pista').hidden = !$('#er-pista').hidden; });
  }

  function egiaztatu() {
    if (!ed) { panela(null, 'Bloke-editorea oraindik kargatzen ari da. Itxaron pixka bat.'); return; }
    const btn = $('#er-check');
    btn.disabled = true;
    btn.textContent = 'Egiaztatzen…';
    // nabigatzaileak botoia eguneratu dezan, simulazioa hurrengo fotograman
    setTimeout(() => {
      let emaitzak;
      try { emaitzak = cur.check(ed.json()); } catch (err) { console.error(err); emaitzak = cur.irizpideak.map(() => false); }
      if (emaitzak.every(Boolean)) markatu(cur.id);
      panela(emaitzak);
      grid();
    }, 30);
  }

  async function ireki() {
    const n = ++txanda;
    stop?.();
    stop = null;
    ed = null;
    grid();
    panela();
    const box = $('#er-sim');
    box.innerHTML = '<div class="rb-kargatzen">Kargatzen…</div>';
    const e = cur, G = GAILUAK[e.gailua];
    const mod = await import(`../sim/${G.sim}.js`);
    if (n !== txanda || !box.isConnected) return;
    box.innerHTML = '';
    const aukerak = e.gailua === 'sareta'
      ? { modua: 'blokeak', puzleak: [e.puzlea], onEbatzi: () => { markatu(e.id); if (cur === e) panela(); grid(); } }
      : { adibideak: ['hutsa'], adibidea: 'hutsa', libre: true, pista: e.pistaId, onEditorea: editorea => { if (n === txanda) ed = editorea; } };
    stop = mod.default(box, { ...aukerak, gorde: `robotika:erronka:${e.id}`, maila: Math.max(nireMaila, e.maila) });
  }

  ireki();
  return () => { txanda++; stop?.(); };
}
