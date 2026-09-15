// Programazio-laborategia: robota (sareta librea), Micro:bit, kontsola eta logika (egia-taulatik zirkuitura),
// programak eta taulak nabigatzailean gordeta
import { irakurri, gorde, esc } from '../util.js';

const GAILUAK = {
  robota: {
    izena: 'Robota', sim: 'sareta', aukerak: { libre: true, gorde: 'robotika:lab:robota:v1' },
    ideiak: [
      'Marraztu zure labirintoa hormekin, jarri helmuga, eta programatu «eskuineko eskuaren araua». Labirintoa aldatzean ere funtzionatzen du?',
      'Margotu zure izenaren lehen letra «margotu laukia» blokearekin. Erabili begiztak ahalik eta bloke gutxien erabiltzeko.',
      'Jarri izarrak ausaz sareta osoan, eta idatzi errenkadaz errenkada guztiak biltzen dituen programa bat.'
    ]
  },
  microbit: {
    izena: 'Micro:bit', sim: 'microbit', aukerak: { libre: true, adibidea: 'hutsa', gorde: 'robotika:lab:microbit:v1' },
    ideiak: [
      '<b>Harria, papera, guraizeak:</b> astintzean, ausazko zenbaki bat 1 eta 3 artean, eta zenbaki bakoitzeko ikono bat.',
      '<b>Alarma:</b> argi-maila bat-batean aldatzen bada (norbaitek kutxa ireki du), jo doinu bat.',
      '<b>Bozketa:</b> A botoia «bai» eta B botoia «ez»; A+B sakatzean, erakutsi emaitza.'
    ]
  },
  kontsola: {
    izena: 'Kontsola', sim: 'kontsola', aukerak: { libre: true, adibidea: 'hutsa', gorde: 'robotika:lab:kontsola:v1' },
    ideiak: [
      'Idatzi 1etik 100era arteko 7ren multiplo guztiak.',
      '<b>FizzBuzz:</b> 1etik 30era, 3ren multiploetan idatzi «Fizz», 5enetan «Buzz» eta bienetan «FizzBuzz».',
      'Kalkulatu 2ren berreturak (1, 2, 4, 8…) 1000 gainditu arte, eta zenbatu zenbat diren.'
    ]
  },
  arduino: {
    izena: 'Arduino', sim: 'arduino', aukerak: { libre: true, adibidea: 'hutsa', gorde: 'robotika:lab:arduino:v1' },
    ideiak: [
      '<b>Oinezkoen semaforoa:</b> berdea autoentzat; botoia sakatzean, horia 2 s, gorria 5 s buzzerraren soinuarekin, eta berriro berdea.',
      '<b>Argi-neurgailua:</b> LDRaren balioaren arabera, LED bat, bi, hiru edo lau piztu (barra-grafiko bat).',
      '<b>Sarraila:</b> servoa 0°-tik 90°-ra botoia hiru aldiz sakatzean, eta berriro itxi 5 s ondoren.'
    ]
  },
  mugikorra: {
    izena: 'Robot mugikorra', sim: 'robota', aukerak: { libre: true, adibidea: 'hutsa', gorde: 'robotika:lab:mugikorra:v1' },
    ideiak: [
      '<b>Lerroa eta oztopoak:</b> jarraitu lerroari, eta 20 cm baino hurbilago zerbait badago, gelditu.',
      '<b>Lerro-jarraitzaile leuna:</b> biratzean gurpil bat ez gelditu, moteldu bakarrik. Azkarrago egiten du itzulia?',
      '<b>Esploratzailea:</b> gelan ahalik eta leku gehien zeharkatu talkarik egin gabe (erabili ausazko biraketak).'
    ]
  },
  aplikazioa: {
    izena: 'Aplikazioa', sim: 'aplikazioa', aukerak: { libre: true, adibidea: 'hutsa', gorde: 'robotika:lab:aplikazioa:v1' },
    ideiak: [
      '<b>Dadoa:</b> Botoia1 sakatzean, 1 eta 6 arteko zenbaki bat etiketan, eta 6 ateratzean izarra.',
      '<b>Erreakzio-jokoa:</b> tenporizadoreak pantaila kolorez aldatzen du; berdea denean Botoia1 sakatzeak puntu bat ematen du.',
      '<b>Galdetegia:</b> galdera bat etiketan, eta Botoia1 (bai) edo Botoia2 (ez) erantzuteko; zenbatu asmatutakoak.'
    ]
  },
  logika: {
    izena: 'Logika', sim: 'karnaugh', aukerak: { libre: true, gorde: 'robotika:lab:logika:v1' },
    ideiak: [
      '<b>Garaje-atea:</b> atea mugitzen da urrutiko agintea EDO barruko botoia sakatzean, ETA oztopo-sentsoreak ezer detektatzen ez badu. Egin egia-taula eta sinplifikatu.',
      '<b>Lau laguneko bozketa:</b> proposamena onartzen da gutxienez hiruk «bai» esaten badute. Zenbat termino ditu adierazpen minimoak?',
      '<b>Zenbaki lehenak:</b> 4 biteko zenbaki bat (0–15) lehena denean, Q = 1. Diseinatu zirkuitua, eta konparatu forma kanonikoaren kostuarekin.'
    ]
  }
};

export default function render(root, { footer, cfg }) {
  const maila = cfg.maila ? cfg.maila() : 1;
  let g = irakurri('robotika:lab:gailua', 'robota');
  if (!GAILUAK[g]) g = 'robota';
  let stop = null, hilda = false, txanda = 0;

  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Aplikatu</div>
      <h1>Programazio-laborategia</h1>
      <p class="lede">Programatu libreki. Aukeratu gailu bat, idatzi zure programa blokeekin eta exekutatu. Programak nabigatzaile honetan gordetzen dira, eta hurrengo batean bertan aurkituko dituzu.</p>
    </header>
    <div class="lab-gailuak"><div class="seg" role="group" aria-label="Gailua">
      ${Object.entries(GAILUAK).map(([k, G]) => `<button data-g="${k}" class="${k === g ? 'active' : ''}" aria-pressed="${k === g}">${esc(G.izena)}</button>`).join('')}
    </div></div>
    <div id="lab-sim"></div>
    <section class="prose" style="margin-top:22px">
      <h3>Proiektu-ideiak</h3>
      <ul id="lab-ideiak"></ul>
    </section>
    ${footer()}`;

  const box = root.querySelector('#lab-sim');
  async function kargatu() {
    const n = ++txanda;
    stop?.();
    stop = null;
    const G = GAILUAK[g];
    root.querySelector('#lab-ideiak').innerHTML = G.ideiak.map(i => `<li>${i}</li>`).join('');
    box.innerHTML = '<div class="rb-kargatzen">Kargatzen…</div>';
    const mod = await import(`../sim/${G.sim}.js`);
    if (hilda || n !== txanda) return;
    box.innerHTML = '';
    stop = mod.default(box, { ...G.aukerak, maila });
  }
  root.querySelectorAll('[data-g]').forEach(bt => bt.addEventListener('click', () => {
    if (bt.dataset.g === g) return;
    g = bt.dataset.g;
    gorde('robotika:lab:gailua', g);
    root.querySelectorAll('[data-g]').forEach(x => { x.classList.toggle('active', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    kargatu();
  }));
  kargatu();

  return () => { hilda = true; stop?.(); };
}
