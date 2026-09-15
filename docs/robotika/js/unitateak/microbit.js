import { programa } from '../blokeHTML.js';
import { nahastu } from '../util.js';

const SRP = `<figure class="fig diagram" style="max-width:640px">
  <svg viewBox="0 0 640 170" role="img" aria-label="Kontrol-sistema programatua: sarrerak, kontrolagailua eta irteerak">
    <defs><marker id="srp-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--ink)"/></marker></defs>
    <g style="fill:var(--sheet);stroke:var(--ink);stroke-width:2.5"><rect x="10" y="30" width="170" height="110"/><rect x="235" y="30" width="170" height="110" style="fill:var(--g1-fill)"/><rect x="460" y="30" width="170" height="110"/></g>
    <g style="stroke:var(--ink);stroke-width:2.5;fill:none"><line x1="182" y1="85" x2="231" y2="85" marker-end="url(#srp-g)"/><line x1="407" y1="85" x2="456" y2="85" marker-end="url(#srp-g)"/></g>
    <g style="font-family:Lato, system-ui, sans-serif;fill:var(--ink)" text-anchor="middle">
      <text x="95" y="58" style="font-weight:700;font-size:17px">Sarrerak</text>
      <text x="95" y="86" style="font-size:14px;fill:var(--ink2)">botoiak</text><text x="95" y="106" style="font-size:14px;fill:var(--ink2)">sentsoreak</text><text x="95" y="126" style="font-size:14px;fill:var(--ink2)">(argia, tenperatura…)</text>
      <text x="320" y="58" style="font-weight:700;font-size:17px">Kontrolagailua</text>
      <text x="320" y="86" style="font-size:14px;fill:var(--ink2)">mikrokontrolagailua</text><text x="320" y="106" style="font-size:14px;fill:var(--ink2)">+ programa</text><text x="320" y="126" style="font-size:14px;fill:var(--ink2)">(erabakiak)</text>
      <text x="545" y="58" style="font-weight:700;font-size:17px">Irteerak</text>
      <text x="545" y="86" style="font-size:14px;fill:var(--ink2)">LEDak, pantaila</text><text x="545" y="106" style="font-size:14px;fill:var(--ink2)">soinua</text><text x="545" y="126" style="font-size:14px;fill:var(--ink2)">motorrak, ponpak</text>
      <text x="95" y="20" style="font-size:13px;font-weight:700;fill:var(--s1)">informazioa jaso</text>
      <text x="320" y="20" style="font-size:13px;font-weight:700;fill:var(--s1)">prozesatu</text>
      <text x="545" y="20" style="font-size:13px;font-weight:700;fill:var(--s1)">ekin</text>
    </g>
  </svg>
  <figcaption>Kontrol-sistema programatu baten egitura. Micro:bit-ek hiru zatiak ditu plaka bakarrean.</figcaption>
</figure>`;

function ledSareta() {
  let s = '<b></b>' + [0, 1, 2, 3, 4].map(x => `<b>${x}</b>`).join('');
  for (let y = 0; y < 5; y++) {
    s += `<b>${y}</b>`;
    for (let x = 0; x < 5; x++) s += `<i class="${(x === 0 && y === 0) || (x === 3 && y === 1) ? 'on' : ''}"></i>`;
  }
  return `<figure class="fig" style="max-width:260px"><div class="ex-leds lab" role="img" aria-label="LED pantaila koordenatuekin: (0, 0) eta (3, 1) piztuta">${s}</div><figcaption>x zutabea da (0–4, ezkerretik eskuinera) eta y errenkada (0–4, goitik behera). Piztuta: (0, 0) eta (3, 1).</figcaption></figure>`;
}

const forma = (html, testua) => `<figure>${html}<figcaption>${testua}</figcaption></figure>`;

export default {
  izena: 'Micro:bit plaka',
  galdera: 'Nola daki berotegi batek noiz ureztatu behar duen, inor bertan egon gabe?',

  ikusi: {
    sim: 'microbit',
    aukerak: { gorde: 'robotika:microbit:v1' },
    proba: 'Probatu adibideak. «Kontagailua»-n sakatu A eta B. «Termometroa»-n eta «Farola automatikoa»-n mugitu graduatzaileak. «Nekazaritza adimenduna»-n, ikusi nola pizten eta itzaltzen den ponpa bere kabuz. Gero, aldatu programa bat: beste ikono bat, beste atalase bat, edo soinu bat alarma gisa.'
  },

  ulertu: () => `
    <p class="def"><strong>Micro:bit</strong> poltsikoko ordenagailu txiki bat da (<strong>mikrokontrolagailu</strong>-plaka bat), hezkuntzarako diseinatua (BBC, 2016). 5 × 5 LEDeko pantaila, bi botoi, sentsoreak (argia, tenperatura, azelerometroa, iparrorratza eta, 2. bertsioan, mikrofonoa eta bozgorailua) eta beste gailu batzuk lotzeko pinak ditu. Blokeekin programatzen da, MakeCode inguruneko blokeen antzekoekin.</p>

    <h3>Kontrol-sistema programatu bat</h3>
    ${SRP}
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Micro:bit-en</th><th>Nekazaritza-proiektuan</th></tr></thead>
      <tbody>
        <tr><td><strong>Sarrerak</strong></td><td>A eta B botoiak, argi-sentsorea, tenperatura-sentsorea, azelerometroa (astintzea), pinak</td><td>Lurraren hezetasun-sentsorea P1 pinean</td></tr>
        <tr><td><strong>Kontrolagailua</strong></td><td>Mikrokontrolagailua eta zure programa</td><td>«baldin hezetasuna &lt; 400 bada…»</td></tr>
        <tr><td><strong>Irteerak</strong></td><td>LED pantaila, pinak, soinua, irratia</td><td>Ur-ponpa P0 pinean (errele baten bidez)</td></tr>
      </tbody>
    </table></div>

    <h3>Programaren egitura</h3>
    <div class="bk-row">
      ${forma(programa([['gertaera', 'hasieran', [['pantaila', 'erakutsi ikonoa ♥']]]]), '<strong>hasieran</strong>: behin, plaka piztean.')}
      ${forma(programa([['gertaera', 'betiko', [['sentsorea', 'irakurri sentsorea'], ['kontrola', 'itxaron {500} ms']]]]), '<strong>betiko</strong>: etengabe, plaka piztuta dagoen bitartean.')}
      ${forma(programa([['gertaera', 'botoia {A} sakatzean', [['aldagaiak', 'aldatu [kontagailua], gehitu {1}']]]]), '<strong>gertaerak</strong>: zerbait gertatzen denean.')}
    </div>
    <p>Kontrol-sistema gehienek <strong>betiko</strong> begizta erabiltzen dute: sentsoreak irakurri, erabaki eta eragingailuak aktibatu, behin eta berriz. «itxaron» blokeak sentsorea zenbatero irakurtzen den erabakitzen du.</p>

    <h3>LED pantaila eta koordenatuak</h3>
    ${ledSareta()}

    <h3>Seinale digitalak eta analogikoak</h3>
    <ul>
      <li><strong>Digitala:</strong> bi balio bakarrik, 0 edo 1 (itzalita edo piztuta). Botoi bat sakatuta dago edo ez; ponpa bat piztuta dago edo ez.</li>
      <li><strong>Analogikoa:</strong> tarte bateko edozein balio. Micro:bit-en pin analogikoek 0 eta 1023 arteko zenbaki bat ematen dute (0 V eta 3,3 V artean).</li>
    </ul>
    <div class="formula">ehunekoa = balioa / 1023 × 100 &nbsp;&nbsp;·&nbsp;&nbsp; tentsioa = balioa / 1023 × 3,3 V</div>

    <div class="worked">
      <h4>Adibidea: nekazaritza adimenduna</h4>
      <p>Hezetasun-sentsoreak 350 irakurtzen du. Programak ponpa pizten du hezetasuna 400 baino txikiagoa bada.</p>
      ${programa([['gertaera', 'betiko', [['aldagaiak', 'ezarri [hezetasuna] ← irakurri P1 pin analogikoa'], ['kontrola', 'baldin ⟨[hezetasuna] < {400}⟩ bada', [['pinak', 'idatzi {1} P0 pin digitalean'], ['pantaila', 'erakutsi ikonoa ●']], 'bestela', [['pinak', 'idatzi {0} P0 pin digitalean'], ['pantaila', 'erakutsi ikonoa ☺']]], ['kontrola', 'itxaron {500} ms']]]], 'Nekazaritza adimendunaren programa')}
      <ol><li>350 / 1023 × 100 = % 34,2 inguru: lurra lehorra dago.</li><li>350 &lt; 400 → egia → P0 = 1: ponpa pizten da.</li><li>Ura botatzean hezetasuna igo egiten da; 400 gainditzean, ponpa itzaltzen da.</li></ol>
      <p class="ans">Inork esku hartu gabe, sistemak lurraren hezetasuna mantentzen du.</p>
    </div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> sentsore batek (hezetasuna) lurraren egoera neurtzen du, mikrokontrolagailuak programa baten bidez erabakitzen du (lehorregia al dago?) eta eragingailu batek ekiten du (ponpa). Begizta bat da: behin eta berriz neurtu, erabaki eta ekin.</p>

    <details class="sakondu" data-maila="2"><summary>Atalasea eta histeresia</summary><div class="in">
      <p>Atalase bakarrarekin (400), hezetasuna 399 eta 401 artean dabilenean ponpa etengabe pizten eta itzaltzen da. Horrek ponpa eta errelea hondatzen ditu.</p>
      <p>Konponbidea <strong>histeresia</strong> da: bi atalase erabiltzea. Adibidez, 350etik behera piztu eta 450etik gora itzali. Bien artean, ponpak bere egoerari eusten dio.</p>
      ${programa([['gertaera', 'betiko', [['kontrola', 'baldin ⟨[hezetasuna] < {350}⟩ bada', [['pinak', 'idatzi {1} P0 pin digitalean']]], ['kontrola', 'baldin ⟨[hezetasuna] > {450}⟩ bada', [['pinak', 'idatzi {0} P0 pin digitalean']]], ['kontrola', 'itxaron {500} ms']]]], 'Histeresia duen programa')}
      <p>Etxeetako termostatoek ere horrela funtzionatzen dute. Sistema hauek <strong>begizta itxiko</strong> sistemak dira: irteeraren ondorioa (ura) sentsoreak neurtzen du berriro.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Mikrokontrolagailua barrutik</summary><div class="in">
      <ul>
        <li>Micro:bit v2-ren mikrokontrolagailua <strong>nRF52833</strong> da: 32 biteko Arm Cortex-M4 prozesadorea, 512 KB flash memoria (programa) eta 128 KB RAM (aldagaiak).</li>
        <li><strong>ADC</strong> (bihurgailu analogiko-digitala) 10 bitekoa da: 2¹⁰ = 1024 balio desberdin (0–1023). 3,3 V / 1023 ≈ 3,2 mV-eko bereizmena.</li>
        <li>Blokeak JavaScript (TypeScript) kode bihurtzen dira, gero makina-kode bihurtzen dira (<em>konpilazioa</em>), eta <code>.hex</code> fitxategi bat kopiatzen da plakara USB bidez. MicroPython-ekin ere programa daiteke.</li>
        <li>Pinek 3,3 V ematen dituzte eta korronte gutxi: ponpa edo motor bat zuzenean lotu ezin denez, <strong>errele</strong> edo <strong>transistore</strong> bat behar da.</li>
      </ul>
    </div></details>`,

  ariketak: ['led-koordenatuak', 'analogikoa', 'denbora'],

  galdetegia: nahastu([
    { g: 'Micro:bit-en LED pantailan, zein da goiko ezkerreko LEDaren koordenatua?', a: ['(0, 0)', '(1, 1)', '(4, 4)', '(5, 5)'], z: 0, zergatik: 'Koordenatuak 0tik hasten dira: x zutabea eta y errenkada.' },
    { g: '«betiko» blokearen barruko blokeak…', a: ['etengabe errepikatzen dira, plaka piztuta dagoen bitartean', 'behin exekutatzen dira, piztean', 'botoia sakatzean bakarrik', 'inoiz ez'], z: 0, zergatik: 'Horregatik erabiltzen da sentsoreak behin eta berriz irakurtzeko.' },
    { g: 'Hauetako zein da sarrera bat?', a: ['Tenperatura-sentsorea', 'LED pantaila', 'Bozgorailua', 'Ur-ponpa'], z: 0, zergatik: 'Sentsoreek ingurunetik informazioa jasotzen dute; LEDak, bozgorailua eta ponpa irteerak dira.' },
    { g: 'Pin analogiko batek zein balio-tarte irakurtzen du Micro:bit-en?', a: ['0 eta 1023 artean', '0 eta 1 artean', '0 eta 100 artean', '0 eta 255 artean'], z: 0, zergatik: 'ADCak 10 bit ditu: 1024 balio, 0tik 1023ra.' },
    { g: 'Nekazaritza-proiektuan ponpa P0 pinari lotuta dago. Zer egiten du «idatzi 1 P0 pin digitalean» blokeak?', a: ['P0 pina aktibatzen du, eta ponpa pizten da', 'Hezetasuna irakurtzen du', 'Pantailan 1 idazten du', 'Ponpa itzaltzen du'], z: 0, zergatik: '1 idaztean pinak tentsioa ematen du (3,3 V) eta erreleak ponpa aktibatzen du.' },
    { g: 'Bi irudi txandakatzen dituen «betiko» begizta batean, zergatik behar dira «itxaron» blokeak?', a: ['Bestela aldaketa azkarregia da eta ez da ondo ikusten', 'Plaka ez berotzeko', 'Ez dira inoiz behar', 'Sentsoreak irakurtzeko'], z: 0, zergatik: 'Mikrokontrolagailuak segundoko milaka agindu exekutatzen ditu; pausarik gabe, begiak ez du aldaketa ikusten.' },
    { g: 'Sentsore batek 0 edo 1 bakarrik ematen badu, seinalea:', a: ['digitala da', 'analogikoa da', 'ez da seinale bat', 'tenperatura da'], z: 0, zergatik: 'Bi balio bakarrik dituzten seinaleak digitalak dira.' },
    { g: 'Zergatik erabiltzen dira bi atalase (histeresia) ponpa bat kontrolatzeko?', a: ['Ponpa atalasearen inguruan etengabe piztu eta itzali ez dadin', 'Ponpa inoiz ez pizteko', 'Sentsorea kalibratzeko', 'Programa laburragoa izateko'], z: 0, maila: 2, zergatik: 'Bi atalaseen artean egoerari eusten zaio, eta etengabeko pizte-itzaltzeak saihesten dira.' },
    { g: 'Micro:bit-en ADCak 10 bit ditu. Zenbat balio desberdin irakur ditzake?', a: ['1024', '1023', '100', '512'], z: 0, maila: 3, zergatik: '2¹⁰ = 1024 balio: 0tik 1023ra.' }
  ])
};
