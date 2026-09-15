import { nahastu } from '../util.js';

const MOTAK = `<figure class="fig diagram" style="max-width:680px">
  <svg viewBox="0 0 680 170" role="img" aria-label="Robot-beso moten eskemak: kartesiarra, SCARA eta antropomorfikoa">
    <g style="fill:none;stroke:var(--ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round">
      <path d="M30 140 H200 M50 140 V40 H190 M180 40 V60 M120 40 V110" />
      <path d="M270 140 H400 M300 140 V70 L360 50 L410 80 M410 80 V110"/>
      <path d="M480 140 H650 M540 140 V110 L560 60 L630 70 L645 105"/>
    </g>
    <g style="fill:var(--s1)"><circle cx="120" cy="40" r="6"/><circle cx="120" cy="110" r="5"/><circle cx="300" cy="70" r="7"/><circle cx="360" cy="50" r="7"/><circle cx="410" cy="95" r="5"/><circle cx="540" cy="110" r="7"/><circle cx="560" cy="60" r="7"/><circle cx="630" cy="70" r="7"/></g>
    <g style="font-family:Lato, system-ui, sans-serif;font-size:14px;font-weight:700;fill:var(--ink)" text-anchor="middle">
      <text x="120" y="164">Kartesiarra (X, Y, Z)</text><text x="340" y="164">SCARA</text><text x="565" y="164">Antropomorfikoa</text>
    </g>
  </svg>
  <figcaption>Artikulazio prismatikoak (lerratzen direnak) eta errotaziokoak (biratzen direnak) konbinatuz, konfigurazio desberdinak lortzen dira.</figcaption>
</figure>`;

export default {
  izena: 'Robot-besoa',
  galdera: 'Nola daki auto-fabrika bateko robot-beso batek bere pintza non dagoen, begiratu gabe?',

  ikusi: {
    sim: 'besoa',
    proba: '<b>Zinematika zuzena:</b> jarri θ₁ = 60° eta θ₂ = 45°, eta konparatu pintzaren posizioa beheko adibidearekin. <b>Alderantzizkoa:</b> arrastatu helburua eta aldatu ukondoa gora eta behera: angelu desberdinekin, puntu bera. Nora ezin da iritsi? <b>Hartu eta utzi:</b> eraman bi kuboak kutxara.'
  },

  ulertu: () => `
    <p class="def"><strong>Robot-besoa</strong> edo <strong>manipulatzailea</strong> artikulazioz lotutako segmentuen kate bat da, amaieran tresna bat duena (pintza, bentosa, soldagailua, pintura-pistola). Industriako robot ohikoena da.</p>

    <h3>Atalak</h3>
    <ul>
      <li><strong>Oinarria:</strong> finkoa, lurrean edo errail batean.</li>
      <li><strong>Segmentuak</strong> (loturak): pieza zurrunak.</li>
      <li><strong>Artikulazioak:</strong> <em>errotaziokoak</em> (biratzen dira, servo edo motor batekin) edo <em>prismatikoak</em> (lerratzen dira, zilindro edo ardatz batekin).</li>
      <li><strong>Amaierako elementua:</strong> zeregina egiten duen tresna.</li>
    </ul>

    <h3>Askatasun-graduak</h3>
    <p><strong>Askatasun-gradu</strong> (AG) bakoitza modu independentean mugi daitekeen artikulazio bat da. Espazioko edozein puntutara edozein orientaziorekin iristeko, <strong>6 AG</strong> behar dira: 3 posiziorako (x, y, z) eta 3 orientaziorako. Simulagailuko besoak 2 AG ditu, eta plano batean mugitzen da.</p>
    ${MOTAK}

    <h3>Zinematika zuzena</h3>
    <p>Artikulazioen angeluak ezagututa, amaierako elementuaren posizioa kalkulatzea. Bi segmentuko beso planar batean:</p>
    <div class="formula">x = L₁ · cos θ₁ + L₂ · cos(θ₁ + θ₂) &nbsp;&nbsp;·&nbsp;&nbsp; y = L₁ · sin θ₁ + L₂ · sin(θ₁ + θ₂)<small>θ₁ horizontalarekiko · θ₂ lehen segmentuarekiko</small></div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>L₁ = 12 cm, L₂ = 9 cm, θ₁ = 60° eta θ₂ = 45°.</p>
      <ol>
        <li>θ₁ + θ₂ = 105°</li>
        <li>x = 12 · cos 60° + 9 · cos 105° = 12 · 0,5 + 9 · (−0,259) = 6 − 2,33 = 3,67 cm</li>
        <li>y = 12 · sin 60° + 9 · sin 105° = 12 · 0,866 + 9 · 0,966 = 10,39 + 8,69 = 19,08 cm</li>
      </ol>
      <p class="ans">Pintza (3,67; 19,08) cm-an dago.</p>
    </div>

    <h3>Lan-eremua</h3>
    <p>Besoa iris daitekeen puntuen multzoa. Bi segmenturekin, eraztun bat da: gehienez L₁ + L₂ (besoa luzatuta) eta gutxienez |L₁ − L₂| (ukondoa guztiz tolestuta). Artikulazioen mugek (adibidez, θ₁ 0° eta 180° artean) eta mahaiak murrizten dute gehiago.</p>

    <h3>Zinematika alderantzizkoa</h3>
    <p>Robot bat programatzean, normalean pintza non egotea nahi den adierazten da, ez angeluak. <strong>Zinematika alderantzizkoak</strong> posiziotik angeluak kalkulatzen ditu. Kosinuaren teoremarekin:</p>
    <div class="formula">cos θ₂ = (x² + y² − L₁² − L₂²) / (2 · L₁ · L₂)</div>
    <p>Bi irtenbide daude askotan (<strong>ukondoa gora</strong> edo <strong>behera</strong>), eta bat ere ez puntua lan-eremutik kanpo badago (|cos θ₂| &gt; 1).</p>

    <h3>Nola programatzen dira</h3>
    <ul>
      <li><strong>Irakatsiz</strong> (<em>teach pendant</em>): operadoreak besoa puntu batzuetara eramaten du aginte batekin, eta robotak gorde egiten ditu.</li>
      <li><strong>Lineaz kanpo:</strong> ordenagailuan, fabrikaren simulazio 3D batean, eta gero robotera kargatzen da.</li>
      <li><strong>Sentsoreekin:</strong> kamera batek piezen posizioa detektatzen du, eta zinematika alderantzizkoak angeluak kalkulatzen ditu.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> artikulazio bakoitzak enkoder bat du, eta motorraren angelua zehatz neurtzen du. Segmentuen luzerak ezagunak direnez, zinematika zuzenak pintzaren posizioa kalkulatzen du etengabe. Pintza puntu jakin batera eraman nahi denean, zinematika alderantzizkoak kalkulatzen ditu angeluak.</p>

    <details class="sakondu" data-maila="3"><summary>Transformazio homogeneoak eta Denavit-Hartenberg</summary><div class="in">
      <p>Hiru dimentsiotan eta 6 AGrekin, formulak luzeak dira. Artikulazio bakoitzaren biraketa eta desplazamendua <strong>4 × 4 matrize homogeneo</strong> batekin adierazten da, eta matrizeak biderkatuz lortzen da amaierako elementuaren posizioa eta orientazioa.</p>
      <p><strong>Denavit-Hartenberg</strong> metodoak artikulazio bakoitzeko lau parametro erabiltzen ditu (θ, d, a, α) matrize horiek sistematikoki eraikitzeko. Robot industrialen fabrikatzaileek parametro horiek ematen dituzte.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Segurtasuna eta robot kolaboratiboak</summary><div class="in">
      <p>Robot industrial klasikoak hesien atzean lan egiten dute: azkarrak eta indartsuak dira, eta pertsona bat jo dezakete. <strong>Robot kolaboratiboek</strong> (cobotek) indar-sentsoreak dituzte artikulazioetan: ezusteko kontaktu bat detektatzean gelditu egiten dira. Horrela, pertsonen ondoan lan egin dezakete, ISO 10218 eta ISO/TS 15066 arauen arabera.</p>
    </div></details>`,

  ariketak: ['zinematika', 'lan-eremua'],

  galdetegia: nahastu([
    { g: 'Zer da askatasun-gradu bat robot-beso batean?', a: ['Modu independentean mugi daitekeen artikulazio bat', 'Besoaren luzera', 'Pintzaren indarra', 'Motorraren abiadura'], z: 0, zergatik: 'Artikulazio bakoitzak askatasun-gradu bat ematen du.' },
    { g: 'Zenbat askatasun-gradu behar dira espazioko puntu batera edozein orientaziorekin iristeko?', a: ['6', '3', '2', '12'], z: 0, zergatik: '3 posiziorako eta 3 orientaziorako.' },
    { g: 'Zer kalkulatzen du zinematika zuzenak?', a: ['Amaierako elementuaren posizioa, artikulazioen angeluetatik', 'Artikulazioen angeluak, posiziotik', 'Motorren korrontea', 'Besoaren pisua'], z: 0, zergatik: 'Zuzena: angeluak → posizioa. Alderantzizkoa: posizioa → angeluak.' },
    { g: 'L₁ = 10 cm eta L₂ = 6 cm badira, zein da gehieneko irismena?', a: ['16 cm', '4 cm', '60 cm', '10 cm'], z: 0, zergatik: 'Besoa luzatuta: L₁ + L₂.' },
    { g: 'Beso bakarreko segmentu batek 10 cm ditu eta 90° osatzen ditu horizontalarekin. Zein da muturraren x koordenatua?', a: ['0 cm', '10 cm', '5 cm', '−10 cm'], z: 0, zergatik: 'x = 10 · cos 90° = 0.' },
    { g: 'Zergatik izan ditzake zinematika alderantzizkoak bi irtenbide?', a: ['Puntu berera ukondoa gora edo behera jarrita irits daitekeelako', 'Kalkulua gaizki dagoelako', 'Bi motor daudelako', 'Besoak bi pintza dituelako'], z: 0, zergatik: 'Bi konfigurazio geometrikok amaierako posizio bera ematen dute.' },
    { g: 'Zer da artikulazio prismatiko bat?', a: ['Lerratuz mugitzen den artikulazioa', 'Biratzen den artikulazioa', 'Pintza mota bat', 'Sentsore bat'], z: 0, zergatik: 'Adibidez, zilindro pneumatiko bat edo ardatz lineal bat.' },
    { g: 'Nola dakite robot-besoek artikulazio bakoitzaren angelua?', a: ['Enkoderrekin edo potentziometroekin', 'Kamera batekin bakarrik', 'Ez dakite', 'Denborarekin kalkulatuz'], z: 0, zergatik: 'Artikulazioetako sentsoreek angelua neurtzen dute.' },
    { g: 'Zer da «teach pendant» bidez programatzea?', a: ['Besoa aginte batekin puntuetara eraman eta puntuak gordetzea', 'Programa testuz idaztea', 'Robotak bere kabuz ikastea', 'Simulazio batean programatzea'], z: 0, zergatik: 'Operadoreak irakatsi egiten dio robotari bidea.' }
  ])
};
