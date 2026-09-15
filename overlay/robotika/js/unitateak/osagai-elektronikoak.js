import { nahastu } from '../util.js';

const ik = (inner, label) => `<svg class="ikurra" viewBox="0 0 90 40" role="img" aria-label="${label}"><g fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
const GEZIAK_SARRERA = '<path d="M8 2 L22 12 M15 12 L22 12 L19 5 M2 10 L16 20 M9 20 L16 20 L13 13"/>';
const IK = {
  erresistentzia: ik('<path d="M4 20 H25 M65 20 H86"/><rect x="25" y="12" width="40" height="16"/>', 'Erresistentziaren ikurra'),
  potentziometroa: ik('<path d="M4 20 H25 M65 20 H86"/><rect x="25" y="12" width="40" height="16"/><path d="M45 39 V31 M40 35 L45 30 L50 35"/>', 'Potentziometroaren ikurra'),
  ldr: ik(`<path d="M4 20 H29 M61 20 H86"/><rect x="29" y="14" width="32" height="12"/><circle cx="45" cy="20" r="17"/>${GEZIAK_SARRERA}`, 'LDR baten ikurra'),
  ntc: ik('<path d="M4 20 H27 M63 20 H86"/><rect x="27" y="13" width="36" height="14"/><path d="M22 34 L60 6 H68"/>', 'NTC termistorearen ikurra'),
  diodoa: ik('<path d="M4 20 H34 M56 20 H86"/><path d="M34 8 V32 L56 20 Z"/><path d="M56 8 V32"/>', 'Diodoaren ikurra'),
  led: ik('<path d="M4 20 H30 M52 20 H86"/><path d="M30 10 V30 L52 20 Z"/><path d="M52 10 V30"/><path d="M50 8 l10 -7 m-6 0 h6 v6 M58 12 l10 -7 m-6 0 h6 v6"/>', 'LEDaren ikurra'),
  kondentsadorea: ik('<path d="M4 20 H40 M50 20 H86 M40 6 V34 M50 6 V34"/>', 'Kondentsadorearen ikurra'),
  elektrolitikoa: ik('<path d="M4 20 H40 M52 20 H86 M40 6 V34"/><path d="M53 6 Q46 20 53 34"/><path d="M28 6 V14 M24 10 H32"/>', 'Kondentsadore elektrolitikoaren ikurra'),
  transistorea: ik('<circle cx="52" cy="20" r="17"/><path d="M4 20 H44 M44 9 V31 M44 15 L60 5 V0 M44 25 L60 35 V40"/><path d="M60 35 L52 34 L56 28 Z" fill="var(--ink)"/>', 'NPN transistorearen ikurra'),
  errelea: ik('<rect x="6" y="10" width="24" height="20"/><path d="M18 1 V10 M18 30 V39"/><path d="M30 20 H56" stroke-dasharray="3 3"/><path d="M50 30 H58 L80 16 M78 30 H88"/>', 'Errelearen ikurra')
};

const LED_FIG = `<figure class="fig diagram" style="max-width:520px">
  <svg viewBox="0 0 520 190" role="img" aria-label="LED bat erresistentzia batekin seriean, pila batera lotuta">
    <g fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round">
      <path d="M70 89 V40 H200 M280 40 H420 V74 M420 110 V150 H70 V101"/>
      <line x1="52" y1="89" x2="88" y2="89"/><line x1="61" y1="101" x2="79" y2="101" stroke-width="6"/>
    </g>
    <rect x="200" y="29" width="80" height="22" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"/>
    <path d="M404 74 H436 L420 102 Z" fill="#ff3b30" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="402" y1="104" x2="438" y2="104" stroke="var(--ink)" stroke-width="3"/>
    <path d="M442 82 l14 -12 m-7 0 h7 v7 M444 96 l14 -12 m-7 0 h7 v7" stroke="#ff3b30" stroke-width="2" fill="none"/>
    <path d="M140 40 l-9 -6 v12 z M330 150 l9 -6 v12 z" fill="var(--s1)"/>
    <g font-family="Lato, system-ui, sans-serif" font-size="14" font-weight="700" fill="var(--ink)">
      <text x="240" y="20" text-anchor="middle">R (V<tspan dy="4" font-size="10">R</tspan><tspan dy="-4"> = E − V</tspan><tspan dy="4" font-size="10">LED</tspan><tspan dy="-4">)</tspan></text>
      <text x="44" y="100" text-anchor="end">E</text><text x="92" y="84" fill="var(--s4)">+</text>
      <text x="466" y="95">LEDa</text>
      <text x="398" y="80" text-anchor="end" font-size="12" fill="var(--ink2)">anodoa</text>
      <text x="398" y="112" text-anchor="end" font-size="12" fill="var(--ink2)">katodoa</text>
      <text x="300" y="178" text-anchor="middle" fill="var(--s1)">I (korronte bera osagai guztietan)</text>
    </g>
  </svg>
  <figcaption>LEDa beti erresistentzia batekin seriean. Hanka luzea anodoa da (+), eta motza katodoa (−).</figcaption>
</figure>`;

export default {
  izena: 'Osagai elektronikoak',
  galdera: 'Nola pizten du Micro:bit-en pin txiki batek ur-ponpa edo motor bat, pina bera erre gabe?',

  ikusi: {
    sim: 'osagaiak',
    aukerak: { modua: 'led' },
    proba: '<b>LEDa:</b> jaitsi erresistentzia LEDa erre arte, eta jarri LED berri bat; gero, konektatu alderantziz. <b>Kondentsadorea:</b> kargatu eta deskargatu, eta konparatu kurba R edo C bikoiztean. <b>Transistorea:</b> jaitsi R<sub>B</sub> motorra abiadura osoan ibili arte (asetasuna), eta ikusi zer gertatzen den V<sub>in</sub> 0,7 V-etik behera jaistean.'
  },

  ulertu: () => `
    <p class="def"><strong>Elektronika</strong> korronte elektrikoa kontrolatzeko osagaiak aztertzen ditu: korronte txiki batek beste handiago bat piztu, seinale bat anplifikatu, informazioa gorde edo neurri bat hartu. Osagai asko <strong>erdieroaleak</strong> dira (silizioa), eta ordenagailu, mugikor eta robot guztien oinarria dira.</p>

    <h3>Osagai nagusiak</h3>
    <div class="table-scroll"><table class="tbl ikur-taula">
      <thead><tr><th>Osagaia</th><th>Ikurra</th><th>Zertarako</th></tr></thead>
      <tbody>
        <tr><td><strong>Erresistentzia</strong></td><td>${IK.erresistentzia}</td><td>Korrontea mugatu eta tentsioa banatu. Balioa koloreen kodearekin adierazten da (Ω).</td></tr>
        <tr><td><strong>Potentziometroa</strong></td><td>${IK.potentziometroa}</td><td>Erresistentzia aldakorra, eskuz: bolumena, joysticka, posizio-sentsorea.</td></tr>
        <tr><td><strong>LDR</strong></td><td>${IK.ldr}</td><td>Argiarekin erresistentzia jaisten zaio: argi-sentsorea (farola automatikoak).</td></tr>
        <tr><td><strong>NTC termistorea</strong></td><td>${IK.ntc}</td><td>Beroarekin erresistentzia jaisten zaio: tenperatura-sentsorea.</td></tr>
        <tr><td><strong>Diodoa</strong></td><td>${IK.diodoa}</td><td>Korrontea noranzko bakarrean uzten du pasatzen: babesa eta korronte zuzena lortzea.</td></tr>
        <tr><td><strong>LEDa</strong></td><td>${IK.led}</td><td>Argia egiten duen diodoa: adierazleak, pantailak eta argiztapena.</td></tr>
        <tr><td><strong>Kondentsadorea</strong></td><td>${IK.kondentsadorea} ${IK.elektrolitikoa}</td><td>Karga elektrikoa metatu eta askatu: tenporizadoreak, iragazkiak, kameren flasha. Elektrolitikoek polaritatea dute (+).</td></tr>
        <tr><td><strong>Transistorea</strong></td><td>${IK.transistorea}</td><td>Korronte txiki batekin korronte handi bat kontrolatu: etengailu elektronikoa edo anplifikadorea.</td></tr>
        <tr><td><strong>Errelea</strong></td><td>${IK.errelea}</td><td>Elektroiman batek kontaktu bat ixten du: zirkuitu txiki batek (5 V) beste handi bat (230 V) kontrolatzen du, bien artean lotura elektrikorik gabe.</td></tr>
      </tbody>
    </table></div>

    <h3>Diodoa eta LEDa</h3>
    <p>Diodoak bi mutur ditu: <strong>anodoa</strong> (A) eta <strong>katodoa</strong> (K). Korrontea anodotik katodora bakarrik pasatzen da (<strong>polarizazio zuzena</strong>). Alderantziz konektatuta, ez du korronterik uzten pasatzen (<strong>alderantzizko polarizazioa</strong>).</p>
    <p>Pasatzen denean, diodoaren muturretan tentsio ia finkoa dago: 0,7 V inguru silizioko diodo batean, eta 1,8–3 V LED batean, kolorearen arabera. Horregatik, LEDari ez zaio pila bat zuzenean lotzen: korrontea asko igoko litzateke eta erre egingo litzateke. <strong>Erresistentzia batek</strong> mugatzen du korrontea.</p>
    ${LED_FIG}
    <div class="formula">R = (E − V<sub>LED</sub>) / I<small>LED arrunt batek 10–20 mA behar ditu</small></div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>LEDaren kolorea</th><th>Gorria</th><th>Horia</th><th>Berdea</th><th>Urdina / zuria</th></tr></thead>
      <tbody><tr><td><strong>V<sub>LED</sub> (gutxi gorabehera)</strong></td><td>1,8 V</td><td>2,0 V</td><td>2,1 V</td><td>3,0–3,2 V</td></tr></tbody>
    </table></div>

    <div class="worked">
      <h4>Adibidea: LED gorria 9 V-eko pilarekin</h4>
      <p>LED gorri batek 1,8 V eta 20 mA behar ditu. Zein erresistentzia jarri?</p>
      <ol><li>Erresistentziaren tentsioa: V<sub>R</sub> = 9 − 1,8 = 7,2 V</li><li>I = 20 mA = 0,020 A</li><li>R = 7,2 / 0,020 = 360 Ω</li></ol>
      <p class="ans">Balio normalizatu handiagoa hartzen da: 390 Ω (korrontea pixka bat txikiagoa, 18,5 mA).</p>
    </div>

    <h3>Kondentsadorea</h3>
    <p>Kondentsadoreak bi xafla eroale ditu, isolatzaile batek bereizita. Tentsio bat aplikatzean, xaflek karga metatzen dute. Metatzen duen karga-kopuruari <strong>kapazitatea</strong> deitzen zaio, eta <strong>faradetan</strong> (F) neurtzen da. Farada oso handia denez, µF (mikrofarad, milioiren bat) eta nF erabiltzen dira.</p>
    <p>Erresistentzia baten bidez kargatzean, ez da berehala kargatzen: hasieran azkar, eta gero gero eta mantsoago. Abiadura <strong>denbora-konstanteak</strong> adierazten du:</p>
    <div class="formula">τ = R · C<small>τ denboran % 63 kargatzen da · 5τ ondoren, ia % 100 (Ω · F = s)</small></div>
    <div class="worked">
      <h4>Adibidea: tenporizadore bat</h4>
      <p>R = 10 kΩ eta C = 470 µF. Zenbat denbora behar du kondentsadoreak ia guztiz kargatzeko?</p>
      <ol><li>τ = 10 000 Ω · 0,000 47 F = 4,7 s</li><li>5τ = 5 · 4,7 = 23,5 s</li></ol>
      <p class="ans">23,5 s inguru. R edo C bikoiztuz gero, denbora ere bikoiztu egiten da.</p>
    </div>

    <h3>Transistorea</h3>
    <p><strong>NPN transistore</strong> bipolarrak hiru terminal ditu: <strong>oinarria</strong> (B), <strong>kolektorea</strong> (C) eta <strong>igorlea</strong> (E). Oinarritik korronte txiki bat (I<sub>B</sub>) sartzen denean, kolektoretik igorlera korronte askoz handiagoa (I<sub>C</sub>) pasatzen uzten du.</p>
    <div class="formula">I<sub>C</sub> = β · I<sub>B</sub> &nbsp;&nbsp;·&nbsp;&nbsp; I<sub>E</sub> = I<sub>B</sub> + I<sub>C</sub><small>β korronte-irabazia da: 50–400 transistore arruntetan</small></div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Egoera</th><th>Noiz</th><th>Nola jokatzen du</th></tr></thead>
      <tbody>
        <tr><td><strong>Ebakidura</strong></td><td>V<sub>BE</sub> &lt; 0,7 V (I<sub>B</sub> = 0)</td><td>Etengailu irekia: ez da korronterik pasatzen.</td></tr>
        <tr><td><strong>Eskualde aktiboa</strong></td><td>β · I<sub>B</sub> &lt; I<sub>C</sub> maximoa</td><td>Anplifikadorea: I<sub>C</sub> = β · I<sub>B</sub>.</td></tr>
        <tr><td><strong>Asetasuna</strong></td><td>β · I<sub>B</sub> ≥ I<sub>C</sub> maximoa</td><td>Etengailu itxia: kargak ahal duen korronte guztia jasotzen du.</td></tr>
      </tbody>
    </table></div>
    <p>Robotikan, transistorea <strong>etengailu</strong> gisa erabiltzen da gehienetan: ebakiduran (itzalita) edo asetasunean (piztuta). Horretarako, R<sub>B</sub> nahikoa txikia aukeratzen da.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> Micro:bit-en pinak 3,3 V eta korronte gutxi ematen ditu, ez motor bat mugitzeko adina. Pinak transistore baten oinarria kontrolatzen du (R<sub>B</sub> erresistentzia baten bidez): oinarriko miliampere gutxi batzuekin, transistoreak motorraren ehunka miliampere uzten ditu pasatzen, beste iturri batetik. 230 V-eko ponpa baterako, transistoreak errele bat aktibatzen du.</p>

    <details class="sakondu" data-maila="2"><summary>Sentsore erresistiboak: LDR eta NTC</summary><div class="in">
      <p>LDRak eta NTCak erresistentzia aldatzen dute, baina mikrokontrolagailuek tentsioa neurtzen dute. Horregatik, <strong>tentsio-zatitzaile</strong> batean jartzen dira, beste erresistentzia finko batekin: argiarekin (edo beroarekin) erresistentzia aldatzean, erdiko puntuaren tentsioa ere aldatzen da, eta pin analogiko batek irakurtzen du.</p>
      <p>Zatitzailea simulagailuan probatzeko: <a href="../elektrizitatea/#/zatitzailea">Elektrizitatearen Lantegia → Tentsio-zatitzailea</a>.</p>
    </div></details>

    <details class="sakondu" data-maila="2"><summary>Errelea eta babes-diodoa</summary><div class="in">
      <p>Errelearen bobina (edo motor bat) itzaltzean, haren eremu magnetikoak tentsio-puntu handi bat sortzen du, transistorea hondatu dezakeena. Babesteko, <strong>diodo bat</strong> jartzen da bobinaren paraleloan, alderantziz polarizatuta (<em>diodo libre</em> edo <em>flyback</em>): funtzionamendu normalean ez du ezer egiten, eta itzaltzean energia xurgatzen du.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Erdieroaleak: PN juntura eta MOSFETak</summary><div class="in">
      <ul>
        <li><strong>Silizio purua</strong> isolatzaile txarra eta eroale txarra da. Beste elementu batzuekin <em>dopatzen</em> da: fosforoarekin elektroi askeak dituen <strong>N motako</strong> silizioa lortzen da, eta boroarekin hutsuneak (karga positiboak) dituen <strong>P motakoa</strong>.</li>
        <li><strong>Diodoa</strong> PN juntura bat da. Junturan hesi bat sortzen da, eta 0,7 V inguruko tentsio zuzen batek gainditzen du (silizioan).</li>
        <li><strong>Transistore bipolarra</strong> (NPN edo PNP) hiru geruzakoa da, eta korrontez kontrolatzen da. <strong>MOSFETa</strong>, berriz, tentsioz kontrolatzen da (ateko korronterik ez): motorrak eta LED zerrendak kontrolatzeko eta prozesadoreetan erabiltzen da. Prozesadore moderno batek milaka milioi MOSFET ditu.</li>
        <li><strong>Kondentsadore baten energia:</strong> E = ½ · C · V². 1000 µF-eko kondentsadore bat 12 V-ra kargatuta: ½ · 0,001 · 144 = 0,072 J.</li>
      </ul>
    </div></details>`,

  ariketak: ['led-erresistentzia', 'rc-denbora', 'transistorea'],

  galdetegia: nahastu([
    { g: 'LED bat alderantziz konektatzen bada (katodoa +-ra), zer gertatzen da?', a: ['Ez da pizten: ez du korronterik uzten pasatzen', 'Argi gehiago egiten du', 'Beste kolore batekoa da', 'Berehala erretzen da'], z: 0, zergatik: 'Diodoek korrontea noranzko bakarrean uzten dute pasatzen, anodotik katodora.' },
    { g: 'Zergatik jartzen zaio erresistentzia bat LED bati seriean?', a: ['Korrontea mugatzeko, LEDa erre ez dadin', 'Argi gehiago egiteko', 'Kolorea aldatzeko', 'Pila gehiago irauteko bakarrik'], z: 0, zergatik: 'Erresistentziarik gabe korrontea oso handia izango litzateke eta LEDa erre egingo litzateke.' },
    { g: 'LED batek 2 V eta 20 mA behar ditu, eta pila 6 V-ekoa da. Zein erresistentzia behar da?', a: ['200 Ω', '300 Ω', '100 Ω', '4 Ω'], z: 0, zergatik: 'R = (6 − 2) / 0,020 = 200 Ω.' },
    { g: 'Zein osagaik du erresistentzia txikiagoa argi gehiago jasotzen duenean?', a: ['LDRak', 'NTCak', 'Kondentsadoreak', 'Diodoak'], z: 0, zergatik: 'LDR: Light Dependent Resistor, argiaren araberako erresistentzia.' },
    { g: 'R = 10 kΩ eta C = 100 µF badira, zein da denbora-konstantea (τ)?', a: ['1 s', '10 s', '0,1 s', '1000 s'], z: 0, zergatik: 'τ = R · C = 10 000 Ω · 0,0001 F = 1 s.' },
    { g: 'Denbora-konstante bat (τ) igarotakoan, kondentsadorea gutxi gorabehera…', a: ['% 63 kargatuta dago', '% 100 kargatuta dago', '% 50 kargatuta dago', '% 10 kargatuta dago'], z: 0, zergatik: '1 − e⁻¹ ≈ 0,63. Ia guztiz kargatzeko 5τ behar dira.' },
    { g: 'Transistore batean, zein terminaletatik sartzen da kontrol-korronte txikia?', a: ['Oinarritik (B)', 'Kolektoretik (C)', 'Igorletik (E)', 'Ez du kontrol-korronterik'], z: 0, zergatik: 'Oinarriko korronteak kolektoreko korrontea kontrolatzen du: I_C = β · I_B.' },
    { g: 'β = 100 eta I_B = 2 mA badira (eskualde aktiboan), zenbat da I_C?', a: ['200 mA', '2 mA', '102 mA', '50 mA'], z: 0, zergatik: 'I_C = β · I_B = 100 · 2 = 200 mA.' },
    { g: 'Transistorea etengailu itxi gisa erabiltzeko, zein egoeratan egon behar du?', a: ['Asetasunean', 'Ebakiduran', 'Eskualde aktiboan', 'Alderantzizko polarizazioan'], z: 0, maila: 2, zergatik: 'Asetasunean kolektore-igorleko tentsioa oso txikia da, eta kargak korronte guztia jasotzen du.' },
    { g: 'Zer egiten du erreleak?', a: ['Zirkuitu txiki batek beste handi bat kontrolatzen du, elektroiman baten bidez', 'Korrontea anplifikatzen du, kontakturik gabe', 'Karga metatzen du', 'Argia egiten du'], z: 0, maila: 2, zergatik: 'Bobinak kontaktu mekaniko bat mugitzen du; bi zirkuituak isolatuta daude.' },
    { g: 'Zein da MOSFET baten eta transistore bipolar baten arteko desberdintasun nagusia?', a: ['MOSFETa tentsioz kontrolatzen da, eta bipolarra korrontez', 'MOSFETak ez du terminalik', 'Bipolarra argiarekin kontrolatzen da', 'Ez dago desberdintasunik'], z: 0, maila: 3, zergatik: 'MOSFETaren ateak ia ez du korronterik kontsumitzen: tentsioak kontrolatzen du kanala.' }
  ])
};
