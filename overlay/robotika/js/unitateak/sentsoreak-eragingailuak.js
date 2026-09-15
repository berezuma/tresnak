import { nahastu } from '../util.js';

export default {
  izena: 'Sentsoreak eta eragingailuak',
  galdera: 'Nola daki ate automatiko batek norbait hurbiltzen ari dela, eta nola mugitzen du atea behar adina, ez gehiago?',

  ikusi: {
    sim: 'sentsoreak',
    proba: '<b>Sentsoreak:</b> aldatu argia, tenperatura eta distantzia, eta begiratu tentsioa eta analogRead-en balioa. Zein sentsore dira digitalak? <b>PWM:</b> jarri lan-zikloa % 50ean: zein da batez besteko tentsioa? <b>Eragingailuak:</b> lortu servoa 45°-ra, aldatu motorraren noranzkoa IN1 eta IN2-rekin, eta piztu lanpara errelearekin.'
  },

  ulertu: () => `
    <p class="def"><strong>Sentsoreek</strong> inguruneko magnitude fisiko bat (argia, tenperatura, distantzia…) seinale elektriko bihurtzen dute, kontrolagailuak irakur dezan. <strong>Eragingailuek</strong> alderantzizkoa egiten dute: seinale elektriko bat ekintza fisiko bihurtzen dute (mugimendua, argia, soinua, beroa).</p>

    <h3>Sentsore ohikoak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Magnitudea</th><th>Sentsorea</th><th>Seinalea</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td>Ukipena, posizioa</td><td>Botoia, ibilbide-amaierako etengailua</td><td>Digitala</td><td>Igogailuaren atea itxita dagoen</td></tr>
        <tr><td>Argia</td><td>LDR, fotodiodoa</td><td>Analogikoa</td><td>Farola automatikoa, pantailaren distira</td></tr>
        <tr><td>Tenperatura</td><td>NTC, LM35, DHT11 (digitala)</td><td>Analogikoa / digitala</td><td>Termostatoa, berotegia</td></tr>
        <tr><td>Distantzia</td><td>Ultrasoinuak (HC-SR04), infragorria</td><td>Pultsu baten denbora</td><td>Aparkatzeko sentsorea, robotak</td></tr>
        <tr><td>Mugimendua</td><td>PIR, azelerometroa</td><td>Digitala / datuak</td><td>Alarmak, mugikorraren pantaila biratzea</td></tr>
        <tr><td>Hezetasuna</td><td>Lurraren hezetasun-sentsorea</td><td>Analogikoa</td><td>Ureztatze automatikoa</td></tr>
        <tr><td>Biraketa</td><td>Potentziometroa, enkoderra</td><td>Analogikoa / pultsuak</td><td>Bolumena, gurpilaren abiadura</td></tr>
      </tbody>
    </table></div>

    <h3>Seinale digitalak eta analogikoak</h3>
    <ul>
      <li><strong>Digitala:</strong> bi egoera, 0 V (0, LOW) edo 5 V (1, HIGH). <code>digitalRead(pin)</code>.</li>
      <li><strong>Analogikoa:</strong> tarte bateko edozein tentsio. Mikrokontrolagailuaren <strong>ADC</strong>-ak (bihurgailu analogiko-digitalak) zenbaki bihurtzen du. Arduino UNOn 10 bit: 0 V → 0 eta 5 V → 1023. <code>analogRead(A0)</code>.</li>
    </ul>
    <div class="formula">n = V / 5 V · 1023 &nbsp;&nbsp;·&nbsp;&nbsp; V = n / 1023 · 5 V</div>
    <p>LDR edo NTC gehienek ez dute tentsiorik ematen: erresistentzia aldatzen dute. Horregatik, <strong>tentsio-zatitzaile</strong> batean jartzen dira beste erresistentzia batekin, eta erdiko puntuaren tentsioa neurtzen da.</p>
    <div class="worked">
      <h4>Adibidea: argi-sentsorea</h4>
      <p>LDR baten zatitzaileak A0 pinean 818 irakurtzen du. Zein tentsio dago?</p>
      <ol><li>V = 818 / 1023 · 5</li><li>V = 4,0 V</li></ol>
      <p class="ans">4 V inguru: argi asko dago (LDRaren erresistentzia txikia).</p>
    </div>

    <h3>Eragingailuak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Eragingailua</th><th>Zer egiten du</th><th>Nola kontrolatzen da</th></tr></thead>
      <tbody>
        <tr><td><strong>LEDa, buzzerra</strong></td><td>Argia, soinua</td><td>Pin digitala edo PWM (distira); <code>tone()</code></td></tr>
        <tr><td><strong>DC motorra</strong></td><td>Biraketa jarraitua</td><td>Abiadura PWMarekin; noranzkoa H zubiarekin (L298N)</td></tr>
        <tr><td><strong>Servomotorra</strong></td><td>Angelu zehatz batera biratu (0–180°)</td><td>Pultsu-zabalera (1–2 ms, 20 ms-ro)</td></tr>
        <tr><td><strong>Urrats-motorra</strong></td><td>Urrats zehatzak (adib. 1,8° bakoitza)</td><td>Bobinak ordenan aktibatu (driver bat)</td></tr>
        <tr><td><strong>Errelea</strong></td><td>Potentzia handiko zirkuitu bat piztu</td><td>Pin digitala + transistorea bobinarentzat</td></tr>
        <tr><td><strong>Elektrobalbula, ponpa</strong></td><td>Ura edo airea bideratu</td><td>Errelea edo transistorea</td></tr>
      </tbody>
    </table></div>
    <p class="note">Arduinoren pin batek 20 mA inguru bakarrik eman ditzake. Motor batek ehunka miliampere behar ditu: <strong>ez da inoiz motorrik zuzenean pin batera lotzen</strong>. Transistore, driver edo errele bat erabiltzen da, eta motorrak bere elikadura du.</p>

    <h3>PWM: potentzia erregulatu pin digital batekin</h3>
    <p><strong>PWM</strong> (<em>Pulse Width Modulation</em>, pultsu-zabaleraren modulazioa) seinalea 0 V eta 5 V artean oso azkar txandakatzen da. Piztuta dagoen denbora-zatiari <strong>lan-zikloa</strong> deitzen zaio. LED batek edo motor batek batez besteko balioa «sentitzen» du.</p>
    <div class="formula">V<sub>bb</sub> = lan-zikloa · 5 V &nbsp;&nbsp;·&nbsp;&nbsp; analogWrite(pin, 0–255)<small>% 50 → 2,5 V → analogWrite(9, 127)</small></div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> ate automatikoek mugimendu-sentsore bat dute (PIR edo mikrouhinak), eta kontrolagailuak motorra pizten du. Ibilbide-amaierako etengailu edo enkoder batek adierazten du atea guztiz irekita dagoela, eta motorra gelditu egiten da. Sentsoreak, erabakia eta eragingailua: kontrol-sistema bat.</p>

    <details class="sakondu" data-maila="2"><summary>Ultrasoinu-sentsorea</summary><div class="in">
      <p>HC-SR04 sentsoreak 40 kHz-eko soinu-pultsu bat igortzen du (gizakiok ez dugu entzuten), eta oihartzuna itzuli arte igarotako denbora neurtzen du. Soinuak joan-etorria egiten duenez:</p>
      <div class="formula">d = v · t / 2 &nbsp;&nbsp;(v = 343 m/s = 0,0343 cm/µs)</div>
      <p>Adibidez, 1160 µs → 0,0343 · 1160 / 2 = 19,9 cm. Gainazal bigunek (oihalak) edo angeluan daudenek ez dute ondo islatzen soinua.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Bereizmena, kalibrazioa eta ez-linealtasuna</summary><div class="in">
      <ul>
        <li><strong>Bereizmena:</strong> 10 biteko ADC batek 5 V / 1023 ≈ 4,9 mV bereizten ditu. ESP32-k 12 bit ditu (4096 maila, 0–3,3 V).</li>
        <li><strong>Kalibrazioa:</strong> sentsorearen irakurketa magnitude errealarekin lotzea, balio ezagunekin neurtuz (adib. izotz-ura 0 °C-an).</li>
        <li><strong>NTC ez da lineala:</strong> R = R₀ · e<sup>B(1/T − 1/T₀)</sup> (B ≈ 3950 K). Horregatik, sentsore digitalak (DS18B20, DHT22) erabiltzen dira askotan: zuzenean ematen dute tenperatura.</li>
        <li><strong>Zarata:</strong> irakurketak dardara egiten du. Batez besteko mugikorra (azken n irakurketak) erabiltzen da leuntzeko.</li>
      </ul>
    </div></details>`,

  ariketak: ['adc', 'pwm', 'ultrasoinua'],

  galdetegia: nahastu([
    { g: 'Zer egiten du sentsore batek?', a: ['Magnitude fisiko bat seinale elektriko bihurtu', 'Seinale elektriko bat mugimendu bihurtu', 'Programa bat gorde', 'Energia metatu'], z: 0, zergatik: 'Sentsoreek ingurunea neurtzen dute; eragingailuek ekiten dute.' },
    { g: 'Hauetako zein da eragingailu bat?', a: ['Servomotorra', 'LDRa', 'Ultrasoinu-sentsorea', 'Potentziometroa'], z: 0, zergatik: 'Servoak mugimendua sortzen du; besteak sentsoreak dira.' },
    { g: 'Arduino UNOren analogRead-ek zein balio-tarte ematen du?', a: ['0–1023', '0–255', '0–5', '0–100'], z: 0, zergatik: 'ADCa 10 bitekoa da: 2¹⁰ = 1024 maila.' },
    { g: 'analogRead-ek 512 ematen badu, zenbat tentsio dago gutxi gorabehera?', a: ['2,5 V', '5 V', '1 V', '512 V'], z: 0, zergatik: '512 / 1023 · 5 ≈ 2,5 V.' },
    { g: 'Zergatik jartzen da LDR bat beste erresistentzia batekin tentsio-zatitzaile batean?', a: ['Erresistentzia-aldaketa tentsio-aldaketa bihurtzeko, pin analogikoak neur dezan', 'LDRa ez erretzeko bakarrik', 'Argi gehiago neurtzeko', 'Ez da beharrezkoa'], z: 0, zergatik: 'Mikrokontrolagailuek tentsioa neurtzen dute, ez erresistentzia.' },
    { g: 'PWM seinale batek % 25eko lan-zikloa badu 5 V-ko pin batean, zein da batez besteko tentsioa?', a: ['1,25 V', '2,5 V', '3,75 V', '0,25 V'], z: 0, zergatik: '0,25 · 5 = 1,25 V.' },
    { g: 'Zergatik ez da DC motor bat zuzenean Arduinoren pin batera lotzen?', a: ['Pinak ezin duelako motorrak behar duen korrontea eman', 'Motorrak ez duelako tentsiorik behar', 'Pinak analogikoak ez direlako', 'Motorra alderantziz biratuko litzatekeelako'], z: 0, zergatik: 'Pinek 20–40 mA ematen dituzte; motorrek askoz gehiago behar dute. Driver edo transistore bat erabiltzen da.' },
    { g: 'Zer kontrolatzen du H zubi batek DC motor batean?', a: ['Biraketa-noranzkoa (eta abiadura, PWMarekin)', 'Motorraren tenperatura', 'Angelu zehatza', 'Zarata'], z: 0, zergatik: 'Bikote diagonal bat edo bestea ixtean, korronteak noranzko batean edo bestean zeharkatzen du motorra.' },
    { g: 'Servo batean, pultsuaren iraupenak zer adierazten du?', a: ['Zein angelutara mugitu behar den', 'Zenbat azkar biratu', 'Zenbat denbora egon piztuta', 'Motorraren tentsioa'], z: 0, maila: 2, zergatik: '1 ms → 0°, 1,5 ms → 90°, 2 ms → 180° (20 ms-ro).' },
    { g: 'Ultrasoinu-sentsore batek 580 µs neurtzen ditu. Zein distantziatara dago oztopoa?', a: ['10 cm inguru', '20 cm inguru', '5 cm inguru', '58 cm'], z: 0, maila: 2, zergatik: '0,0343 · 580 / 2 ≈ 9,9 cm (joan-etorria).' },
    { g: '10 biteko ADC batek 5 V-ko tartean, zein da bereizmena gutxi gorabehera?', a: ['4,9 mV', '0,5 V', '50 mV', '1 mV'], z: 0, maila: 3, zergatik: '5 V / 1023 ≈ 0,0049 V.' }
  ])
};
