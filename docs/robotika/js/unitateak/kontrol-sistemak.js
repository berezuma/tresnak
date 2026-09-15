import { nahastu } from '../util.js';

const DIAGRAMA = `<figure class="fig diagram" style="max-width:680px">
  <svg viewBox="0 0 680 190" role="img" aria-label="Begizta itxiko kontrol-sistema baten blokeen diagrama">
    <defs><marker id="ks-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--ink)"/></marker></defs>
    <g style="fill:var(--sheet);stroke:var(--ink);stroke-width:2.5">
      <rect x="150" y="40" width="120" height="54" style="fill:var(--g1-fill)"/><rect x="310" y="40" width="120" height="54"/><rect x="470" y="40" width="110" height="54" style="fill:var(--g3-fill)"/>
      <rect x="310" y="128" width="120" height="44" style="fill:var(--g2-fill)"/><circle cx="110" cy="67" r="15"/>
    </g>
    <g style="stroke:var(--ink);stroke-width:2.5;fill:none">
      <line x1="10" y1="67" x2="93" y2="67" marker-end="url(#ks-g)"/><line x1="125" y1="67" x2="147" y2="67" marker-end="url(#ks-g)"/>
      <line x1="270" y1="67" x2="307" y2="67" marker-end="url(#ks-g)"/><line x1="430" y1="67" x2="467" y2="67" marker-end="url(#ks-g)"/>
      <line x1="580" y1="67" x2="668" y2="67" marker-end="url(#ks-g)"/>
      <path d="M625 67 V150 H433" marker-end="url(#ks-g)"/><path d="M310 150 H110 V85" marker-end="url(#ks-g)"/>
      <line x1="525" y1="6" x2="525" y2="37" marker-end="url(#ks-g)" style="stroke:var(--danger)"/>
    </g>
    <g style="font-family:Lato, system-ui, sans-serif;fill:var(--ink)" text-anchor="middle">
      <text x="40" y="58" style="font-size:13px;font-weight:700">konsigna</text>
      <text x="110" y="72" style="font-size:16px;font-weight:700">−</text><text x="88" y="56" style="font-size:12px">+</text>
      <text x="136" y="58" style="font-size:12px;fill:var(--ink2)">e</text>
      <text x="210" y="64" style="font-size:14px;font-weight:700">Kontrolagailua</text><text x="210" y="82" style="font-size:12px;fill:var(--ink2)">erabaki</text>
      <text x="370" y="64" style="font-size:14px;font-weight:700">Eragingailua</text><text x="370" y="82" style="font-size:12px;fill:var(--ink2)">ekin</text>
      <text x="525" y="64" style="font-size:14px;font-weight:700">Prozesua</text><text x="525" y="82" style="font-size:12px;fill:var(--ink2)">planta</text>
      <text x="370" y="148" style="font-size:14px;font-weight:700">Sentsorea</text><text x="370" y="164" style="font-size:12px;fill:var(--ink2)">neurtu</text>
      <text x="645" y="58" style="font-size:13px;font-weight:700">irteera</text>
      <text x="570" y="18" style="font-size:12px;fill:var(--danger);font-weight:700">perturbazioak</text>
      <text x="210" y="168" style="font-size:12px;fill:var(--ink2)">atzeraelikadura</text>
    </g>
  </svg>
  <figcaption>Begizta itxia: irteera neurtu eta konsignarekin konparatzen da. Errorearen arabera erabakitzen du kontrolagailuak.</figcaption>
</figure>`;

export default {
  izena: 'Kontrol-sistemak',
  galdera: 'Zergatik mantentzen du etxeko termostatoak tenperatura ia berdin, kanpoan hotz edo bero egin, eta leihoa irekita egon arren?',

  ikusi: {
    sim: 'kontrola',
    proba: 'Hasi <b>begizta irekian</b>: bilatu 21 °C-ra iristeko potentzia, eta gero jaitsi kanpoko tenperatura edo ireki leihoa. Aldatu <b>begizta itxira</b> eta errepikatu. Zer gertatzen da histeresia 0 denean (zenbat aldiz pizten da)? Azkenik, <b>proportzionalean</b>, handitu Kp: errorea txikitzen al da?'
  },

  ulertu: () => `
    <p class="def"><strong>Kontrol-sistema</strong> bat magnitude bat (tenperatura, abiadura, maila…) nahi den balioan mantentzeko edo aldatzeko elkarri lotutako elementuen multzoa da. Nahi den balioari <strong>konsigna</strong> deitzen zaio.</p>

    <h3>Elementuak</h3>
    ${DIAGRAMA}
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Elementua</th><th>Zer egiten du</th><th>Termostatoan</th></tr></thead>
      <tbody>
        <tr><td><strong>Konsigna</strong></td><td>Nahi den balioa</td><td>21 °C</td></tr>
        <tr><td><strong>Sentsorea</strong></td><td>Irteera neurtu</td><td>Tenperatura-sentsorea</td></tr>
        <tr><td><strong>Kontrolagailua</strong></td><td>Konsigna eta neurketa konparatu eta erabaki</td><td>Termostatoaren zirkuitua edo programa</td></tr>
        <tr><td><strong>Eragingailua</strong></td><td>Prozesuan eragin</td><td>Galdara edo berogailua</td></tr>
        <tr><td><strong>Prozesua</strong></td><td>Kontrolatu nahi den sistema</td><td>Etxea</td></tr>
        <tr><td><strong>Perturbazioak</strong></td><td>Kanpoko aldaketak</td><td>Leihoa ireki, kanpoko hotza</td></tr>
      </tbody>
    </table></div>

    <h3>Begizta irekia eta itxia</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Begizta irekia</th><th>Begizta itxia</th></tr></thead>
      <tbody>
        <tr><td><strong>Irteera neurtzen du?</strong></td><td>Ez</td><td>Bai (atzeraelikadura)</td></tr>
        <tr><td><strong>Perturbazioak zuzentzen ditu?</strong></td><td>Ez</td><td>Bai</td></tr>
        <tr><td><strong>Kostua</strong></td><td>Merkeagoa, sinpleagoa</td><td>Sentsorea behar du</td></tr>
        <tr><td><strong>Adibideak</strong></td><td>Txigorgailua, denborarekin ureztatzea, garbigailuaren programa</td><td>Termostatoa, lerro-jarraitzailea, autoaren abiadura-kontrola, gorputz-tenperatura</td></tr>
      </tbody>
    </table></div>

    <h3>Piztu-itzali kontrola eta histeresia</h3>
    <p>Kontrolagailu sinpleenak eragingailua potentzia osoan pizten edo guztiz itzaltzen du. Atalase bakarrarekin, tenperatura konsignaren inguruan dabilenean berogailua etengabe piztu eta itzaliko litzateke. <strong>Histeresiak</strong> bi atalase erabiltzen ditu, tarte batez bereizita.</p>
    <div class="worked">
      <h4>Adibidea: termostatoa</h4>
      <p>Konsigna 21 °C da eta histeresia 1 °C (tarte osoa).</p>
      <ol><li>Piztu: T &lt; 21 − 0,5 = 20,5 °C</li><li>Itzali: T &gt; 21 + 0,5 = 21,5 °C</li><li>Bien artean: aurreko egoerari eutsi.</li></ol>
      <p class="ans">Tenperatura 20,5 eta 21,5 °C artean ibiliko da, eta berogailua gutxiagotan piztuko da.</p>
    </div>

    <h3>Kontrol proportzionala</h3>
    <p>Eragingailuak potentzia errorearen araberakoa ematen du: errore handia, potentzia handia; errore txikia, potentzia txikia.</p>
    <div class="formula">e = konsigna − neurketa &nbsp;&nbsp;·&nbsp;&nbsp; u = K<sub>p</sub> · e</div>
    <p>Mugimendu leunagoak lortzen dira, baina <strong>errore iraunkor</strong> bat geratzen da beti: errorerik ez badago, potentziarik ere ez. K<sub>p</sub> handiagoarekin errorea txikiagoa da, baina handiegia bada sistemak oszilatu egiten du.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> termostatoa begizta itxiko kontrol-sistema bat da: sentsoreak tenperatura neurtzen du etengabe, kontrolagailuak konsignarekin konparatzen du, eta hotzegi badago galdara pizten du. Leihoa irekitzean tenperatura jaitsi egiten da, errorea handitu, eta sistemak berak zuzentzen du, inork ezer egin gabe.</p>

    <details class="sakondu" data-maila="2"><summary>Kontrol-sistema programatuak</summary><div class="in">
      <p>Mikrokontrolagailu batekin, kontrol-sistema bat begizta bat da programan:</p>
      <ol><li><strong>Irakurri</strong> sentsorea.</li><li><strong>Konparatu</strong> konsignarekin (baldin…).</li><li><strong>Ekin</strong>: eragingailua piztu, itzali edo erregulatu.</li><li><strong>Itxaron</strong> pixka bat, eta errepikatu.</li></ol>
      <p>Horixe egiten dute Micro:bit-en «Nekazaritza adimenduna» programak eta Arduinoren termostatoak. Programa aldatuz, kontrol-estrategia aldatzen da hardwarea aldatu gabe.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>PID kontrolagailua</summary><div class="in">
      <p>Industriako kontrolagailu gehienak <strong>PID</strong> motakoak dira: hiru ekintza batzen dituzte.</p>
      <div class="formula">u(t) = K<sub>p</sub> · e + K<sub>i</sub> · ∫e dt + K<sub>d</sub> · de/dt</div>
      <ul>
        <li><strong>P (proportzionala):</strong> uneko errorearen araberakoa.</li>
        <li><strong>I (integrala):</strong> errore metatuaren araberakoa; errore iraunkorra ezabatzen du.</li>
        <li><strong>D (deribatiboa):</strong> errorearen aldaketa-abiaduraren araberakoa; oszilazioak moteltzen ditu.</li>
      </ul>
      <p>Hiru irabaziak doitzeari <strong>sintonizazioa</strong> deitzen zaio. Droneek, 3D inprimagailuek eta autoen abiadura-kontrolek PID kontrolagailuak erabiltzen dituzte.</p>
    </div></details>`,

  ariketak: ['kontrol-errorea', 'berotze-energia'],

  galdetegia: nahastu([
    { g: 'Zer da konsigna?', a: ['Sistemak lortu behar duen balioa', 'Sentsoreak neurtzen duen balioa', 'Eragingailuaren potentzia', 'Errorea'], z: 0, zergatik: 'Adibidez, termostatoan aukeratzen den tenperatura.' },
    { g: 'Zer du begizta itxiko sistema batek, irekiak ez duena?', a: ['Atzeraelikadura: irteera neurtzen duen sentsorea', 'Eragingailua', 'Kontrolagailua', 'Elikadura'], z: 0, zergatik: 'Irteera neurtu eta konsignarekin konparatzen da.' },
    { g: 'Hauetako zein da begizta irekiko sistema bat?', a: ['Txigorgailua, denborarekin', 'Termostatoa', 'Lerro-jarraitzailea', 'Autoaren abiadura-kontrola'], z: 0, zergatik: 'Txigorgailuak ez du ogiaren kolorea neurtzen: denbora bat itxaroten du.' },
    { g: 'Zer da perturbazio bat?', a: ['Irteera aldatzen duen kanpoko aldaketa bat', 'Kontrolagailuaren akats bat', 'Konsignaren balioa', 'Sentsore mota bat'], z: 0, zergatik: 'Adibidez, leihoa irekitzea edo kanpoko tenperatura jaistea.' },
    { g: 'Konsigna 22 °C da eta sentsoreak 19 °C neurtzen ditu. Zein da errorea?', a: ['3 °C', '−3 °C', '41 °C', '19 °C'], z: 0, zergatik: 'e = konsigna − neurketa = 22 − 19 = 3 °C.' },
    { g: 'Zertarako erabiltzen da histeresia piztu-itzali kontrol batean?', a: ['Eragingailua etengabe piztu eta itzali ez dadin', 'Tenperatura zehatzago mantentzeko', 'Energia gehiago kontsumitzeko', 'Sentsorea kalibratzeko'], z: 0, zergatik: 'Bi atalaseen artean aurreko egoerari eusten zaio.' },
    { g: 'Konsigna 20 °C eta histeresia 2 °C badira, noiz pizten da berogailua?', a: ['19 °C-tik behera', '18 °C-tik behera', '20 °C-tik behera', '22 °C-tik behera'], z: 0, zergatik: '20 − 2/2 = 19 °C.' },
    { g: 'Kontrol proportzional batean, zer gertatzen da errorea zero denean?', a: ['Kontrolagailuak ez du potentziarik ematen', 'Potentzia maximoa ematen du', 'Sistema gelditu egiten da', 'Kp aldatu egiten da'], z: 0, maila: 2, zergatik: 'u = Kp · 0 = 0. Horregatik geratzen da errore txiki bat beti.' },
    { g: 'PID kontrolagailu batean, zein ekintzak ezabatzen du errore iraunkorra?', a: ['Integralak (I)', 'Proportzionalak (P)', 'Deribatiboak (D)', 'Bat ere ez'], z: 0, maila: 3, zergatik: 'Integralak errorea metatzen du denboran, eta potentzia handitzen du errorea desagertu arte.' }
  ])
};
