import { R, Sr, ebatzi, eskemaSVG } from '../eskema.js';

const tree = Sr(R('R1', 10), R('R2', 20), R('R3', 30));

export default {
  izena: 'Seriezko zirkuituak',
  galdera: 'Gabonetako argi-kate zaharretan bonbilla bat fundituz gero, guztiak itzaltzen ziren. Zergatik?',

  ikusi: {
    sim: 'laborategia',
    aukerak: { adibidea: 'seriea', adibideak: ['seriea', 'seriea-r'], balioak: true },
    proba: 'Sakatu bonbilla bat: zenbateko tentsioa du? Pilaren erdia da? Kargatu «Hiru erresistentzia seriean» eta batu hiru tentsioak. Gero aukeratu <b>Ezabatu</b> eta kendu osagai bat: zer gertatzen zaio zirkuitu osoari?'
  },

  ulertu: () => `
    <p class="def">Osagaiak <strong>seriean</strong> daude bata bestearen atzetik lotuta daudenean, korronteak bide <strong>bakarra</strong> duela.</p>

    <h3>Seriezko zirkuituen hiru propietateak</h3>
    <ol>
      <li><strong>Intentsitatea berdina da</strong> osagai guztietan: ez dago adarkatzerik, beraz karga guztia osagai guztietatik igarotzen da.
        <div class="formula">I = I₁ = I₂ = I₃</div></li>
      <li><strong>Pilaren tentsioa osagaien artean banatzen da:</strong> tentsioen batura pilaren tentsioa da.
        <div class="formula">V = V₁ + V₂ + V₃</div></li>
      <li><strong>Erresistentzia baliokidea</strong> erresistentzien batura da (beti handiena baino handiagoa).
        <div class="formula">R<sub>b</sub> = R₁ + R₂ + R₃</div></li>
    </ol>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>12 V-ko pila bati hiru erresistentzia lotu zaizkio seriean: R₁ = 10 Ω, R₂ = 20 Ω eta R₃ = 30 Ω.</p>
      <div class="diagram" style="max-width:430px">${eskemaSVG(tree, { E: 12, emaitzak: ebatzi(tree, 12) })}</div>
      <ol>
        <li>R<sub>b</sub> = 10 + 20 + 30 = 60 Ω</li>
        <li>I = V / R<sub>b</sub> = 12 / 60 = 0,2 A (berdina hiruretan)</li>
        <li>V₁ = I · R₁ = 0,2 · 10 = 2 V; &nbsp;V₂ = 0,2 · 20 = 4 V; &nbsp;V₃ = 0,2 · 30 = 6 V</li>
        <li>Egiaztatu: 2 + 4 + 6 = 12 V ✓</li>
      </ol>
      <p class="ans">Erresistentzia handienak jasotzen du tentsio handiena.</p>
    </div>

    <h3>Bonbillak seriean</h3>
    <ul>
      <li>Bonbilla gehiago jartzean, erresistentzia handitu eta korrontea txikitu egiten da: <strong>distira gutxiago</strong> egiten dute.</li>
      <li>Bonbilla bat funditzen edo kentzen bada, zirkuitua <strong>ireki</strong> egiten da eta <strong>guztiak itzaltzen dira</strong>.</li>
      <li>Ezin da bonbilla bakoitza bere aldetik piztu edo itzali.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> argi-kate zaharretan bonbillak seriean zeuden. Bat funditzean bidea eten egiten zen, eta korronterik gabe gainerako guztiak itzaltzen ziren.</p>

    <details class="sakondu" data-maila="2"><summary>Pilak seriean eta tentsio-zatitzailea</summary><div class="in">
      <p><strong>Pilak seriean</strong> (+ borna hurrengoaren − bornari lotuta) jartzean, tentsioak batu egiten dira: 1,5 V-ko 4 pila = 6 V. Hori egiten da urrutiko aginteetan eta jostailuetan.</p>
      <p>Bi erresistentzia seriean <strong>tentsio-zatitzaile</strong> bat dira: R₂-ren tentsioa pilaren tentsioaren zati bat da.</p>
      <div class="formula">V₂ = V · R₂ / (R₁ + R₂)</div>
      <p>Sentsoreen zirkuituetan asko erabiltzen da (tenperatura, argia…).</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Potentzia seriean: bonbillen "paradoxa"</summary><div class="in">
      <p>Seriean korrontea berdina denez, osagai bakoitzaren potentzia P = I² · R da: <strong>erresistentzia handienak xahutzen du potentzia gehien</strong>.</p>
      <p>230 V · 60 W eta 230 V · 100 W bonbillak seriean 230 V-ra lotzen badira: R₆₀ = 230² / 60 ≈ 882 Ω eta R₁₀₀ = 529 Ω. I = 230 / 1411 ≈ 0,163 A.</p>
      <ul>
        <li>P₆₀ = 0,163² · 882 ≈ <strong>23,4 W</strong></li>
        <li>P₁₀₀ = 0,163² · 529 ≈ <strong>14,1 W</strong></li>
      </ul>
      <p>Harrigarria bada ere, 60 W-eko bonbillak egiten du distira gehiago.</p>
    </div></details>`,

  ariketak: ['seriea-req', 'seriea-i', 'seriea-v'],

  galdetegia: [
    { g: 'Seriezko zirkuitu batean, zer da berdina osagai guztietan?', a: ['Intentsitatea', 'Tentsioa', 'Potentzia', 'Erresistentzia'], z: 0, zergatik: 'Bide bakarra dagoenez, korronte bera igarotzen da osagai guztietatik.' },
    { g: '10 Ω eta 20 Ω seriean. Erresistentzia baliokidea:', a: ['30 Ω', '6,67 Ω', '200 Ω', '15 Ω'], z: 0, zergatik: 'Seriean batu egiten dira: 10 + 20 = 30 Ω.' },
    { g: 'Seriean dauden hiru bonbilletako bat funditzen bada:', a: ['Beste biak itzali egiten dira', 'Beste biek distira gehiago egiten dute', 'Beste biak berdin geratzen dira', 'Pila hustu egiten da'], z: 0, zergatik: 'Zirkuitua irekitzen da eta ez da korronterik igarotzen.' },
    { g: 'Seriezko zirkuitu batean, pilaren tentsioa:', a: ['Osagaien tentsioen batura da', 'Osagai bakoitzean berdina da', 'Erresistentzia handienaren tentsioa da', 'Zero da'], z: 0, zergatik: 'Tentsioa osagaien artean banatzen da: V = V₁ + V₂ + …' },
    { g: 'Bi bonbilla berdin seriean 6 V-ko pila bati lotuta. Bonbilla bakoitzaren tentsioa:', a: ['6 V', '3 V', '12 V', '1,5 V'], z: 1, zergatik: 'Berdinak direnez, tentsioa erdibana banatzen da: 3 V bakoitzak.' },
    { g: 'Seriean bonbilla gehiago jartzen badira (pila bera), bakoitzaren distira:', a: ['Txikitu egiten da', 'Handitu egiten da', 'Ez da aldatzen', 'Lehenengoarena bakarrik aldatzen da'], z: 0, zergatik: 'Erresistentzia baliokidea handitu → korrontea txikitu → distira gutxiago.' },
    { g: '1,5 V-ko 4 pila seriean lotzean, tentsio osoa:', a: ['1,5 V', '6 V', '0,375 V', '4 V'], z: 1, maila: 2, zergatik: 'Pilak seriean: tentsioak batu → 4 · 1,5 = 6 V.' },
    { g: '10 Ω eta 20 Ω seriean. Zeinek xahutzen du potentzia gehiago?', a: ['20 Ω-ekoak', '10 Ω-ekoak', 'Biek berdin', 'Ezin da jakin pila gabe'], z: 0, maila: 3, zergatik: 'Korronte bera: P = I² · R → R handienak potentzia handiena.' }
  ]
};
