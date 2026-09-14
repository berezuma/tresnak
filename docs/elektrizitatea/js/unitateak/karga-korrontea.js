export default {
  izena: 'Karga eta korronte elektrikoa',
  galdera: 'Etengailua sakatzean argia berehala pizten da. Elektroiak hain azkar mugitzen al dira kableetan?',

  ikusi: {
    sim: 'eroaleak',
    proba: 'Aldatu materiala eta deskonektatu pila. <b>Plastikoan</b> zergatik ez da ezer igarotzen? Eta pila deskonektatzean, elektroiak geldi geratzen dira? Konparatu <b>kobrea</b> eta <b>grafitoa</b> marra etenetik igarotzen diren elektroiekin.'
  },

  ulertu: () => `
    <h3>Materia eta karga elektrikoa</h3>
    <p>Materia guztia atomoz osatuta dago. Atomoaren nukleoan <strong>protoiak</strong> (karga positiboa, +) eta neutroiak (kargarik gabe) daude, eta inguruan <strong>elektroiak</strong> (karga negatiboa, −) mugitzen dira.</p>
    <p class="def"><strong>Karga elektrikoa</strong> materiaren propietate bat da: bi motatakoa izan daiteke, positiboa edo negatiboa. Zeinu bereko kargak aldaratu egiten dira, eta zeinu desberdinekoak erakarri. Unitatea <strong>coulomba (C)</strong> da.</p>
    <p>Elektroi baten karga oso txikia da: −1,6 · 10⁻¹⁹ C. Coulomb bat osatzeko 6 250 000 000 000 000 000 elektroi (6,25 · 10¹⁸) behar dira.</p>

    <h3>Eroaleak eta isolatzaileak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Zer gertatzen da barruan</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Eroaleak</strong></td><td>Elektroi askeak dituzte, material osoan zehar mugi daitezkeenak.</td><td>Kobrea, aluminioa, urrea, burdina, grafitoa, ur gazia</td></tr>
        <tr><td><strong>Isolatzaileak</strong></td><td>Elektroiak atomoei lotuta daude: ezin dute korronterik eroan.</td><td>Plastikoa, beira, zeramika, egurra (lehorra), airea</td></tr>
      </tbody>
    </table></div>
    <p>Horregatik egiten dira kableak kobrez (barnean) eta plastikoz (kanpoan): kobreak korrontea eroaten du, eta plastikoak gu babesten gaitu.</p>

    <h3>Korronte elektrikoa</h3>
    <p class="def"><strong>Korronte elektrikoa</strong> karga elektrikoen mugimendu ordenatua da, eroale batean zehar. Metaletan, elektroi askeak dira mugitzen direnak.</p>
    <p>Pila bat konektatu arte, elektroi askeak ausaz mugitzen dira, norabide guztietan: ez dago korronterik. Pilak "bultzada" bat ematen die, eta noranzko batean aurreratzen hasten dira.</p>
    <p><strong>Intentsitateak</strong> adierazten du zenbat karga igarotzen den eroalearen sekzio batetik segundo bakoitzean:</p>
    <div class="formula">I = Q / t<small>intentsitatea = karga / denbora</small></div>
    <dl class="where">
      <dt>I</dt><dd>intentsitatea, amperetan (A)</dd>
      <dt>Q</dt><dd>igarotako karga, coulombetan (C)</dd>
      <dt>t</dt><dd>denbora, segundotan (s)</dd>
    </dl>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>Hari batetik 30 C igaro dira 10 segundotan. Zein da intentsitatea?</p>
      <ol><li>I = Q / t</li><li>I = 30 C / 10 s</li></ol>
      <p class="ans">I = 3 A (hau da, 3 coulomb segundoko)</p>
    </div>

    <h3>Korrontearen noranzkoa</h3>
    <p>Elektroiak pilaren borna negatibotik (−) positibora (+) mugitzen dira kanpoko zirkuituan. Hala ere, eskemetan <strong>korronte konbentzionala</strong> erabiltzen da: <strong>+ bornatik − bornara</strong>.</p>
    <p class="note">Konbentzio hori XVIII. mendean hautatu zen (Benjamin Franklin), elektroia ezagutu baino lehen. Kalkuluetarako berdin dio: karga positiboak noranzko batean mugitzea eta negatiboak kontrakoan mugitzea baliokidea da.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> elektroiak oso motel aurreratzen dira (milimetro gutxi minutuko!). Baina kablea elektroiz beteta dago, ur-hodi bat urez beteta dagoen bezala: pilak bultzatzean, "bultzada" ia argiaren abiaduran zabaltzen da, eta bonbillako elektroiak berehala mugitzen hasten dira.</p>

    <details class="sakondu" data-maila="2"><summary>Korronte zuzena eta korronte alternoa</summary><div class="in">
      <p><strong>Korronte zuzenean (KZ)</strong> elektroiak beti noranzko berean mugitzen dira. Pilek, bateriek eta eguzki-panelek korronte zuzena ematen dute.</p>
      <p><strong>Korronte alternoan (KA)</strong> noranzkoa etengabe aldatzen da. Etxeko entxufeetan 230 V eta <strong>50 Hz</strong> dira: segundoan 50 aldiz joan eta 50 aldiz etorri. Zentraletako sorgailuek korronte alternoa sortzen dute, errazago garraiatzen delako.</p>
      <p>Lantegi honetan korronte zuzeneko zirkuituak aztertzen ditugu.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Arrastatze-abiadura</summary><div class="in">
      <p>Eroale batean, intentsitatea eramaile askeen dentsitatearen (n), kargaren (q), abiaduraren (v) eta sekzioaren (S) araberakoa da:</p>
      <div class="formula">I = n · q · v · S</div>
      <p>Kobrean n ≈ 8,5 · 10²⁸ elektroi/m³. 1 mm²-ko hari batetik 1 A igarotzen bada:</p>
      <div class="formula">v = I / (n · q · S) = 1 / (8,5·10²⁸ · 1,6·10⁻¹⁹ · 10⁻⁶) ≈ 7,4 · 10⁻⁵ m/s</div>
      <p>Hau da, <strong>0,074 mm/s</strong> inguru: barraskilo bat baino askoz motelago. Eremu elektrikoa, aldiz, argiaren abiaduratik gertu hedatzen da.</p>
    </div></details>`,

  ariketak: ['karga', 'unitateak'],

  galdetegia: [
    { g: 'Zer da korronte elektrikoa?', a: ['Karga elektrikoen mugimendu ordenatua eroale batean', 'Hari baten barruko beroaren fluxua', 'Atomoen nukleoen mugimendua', 'Pilaren barruan pilatutako karga'], z: 0, zergatik: 'Korrontea kargen (metaletan, elektroien) mugimendu ordenatua da, noranzko jakin batean.' },
    { g: 'Zein da isolatzailea?', a: ['Kobrea', 'Aluminioa', 'Plastikoa', 'Grafitoa'], z: 2, zergatik: 'Plastikoan elektroiak atomoei lotuta daude; metalek eta grafitoak elektroi askeak dituzte.' },
    { g: 'Zein da korronte konbentzionalaren noranzkoa kanpoko zirkuituan?', a: ['+ bornatik − bornara', '− bornatik + bornara', 'Ez du noranzkorik', 'Elektroien noranzko bera'], z: 0, zergatik: 'Konbentzioz, korrontea + bornatik − bornara doa; elektroiak kontrako noranzkoan mugitzen dira.' },
    { g: 'Zein da intentsitatearen unitatea?', a: ['Volta (V)', 'Amperea (A)', 'Ohma (Ω)', 'Coulomba (C)'], z: 1, zergatik: 'Intentsitatea amperetan neurtzen da: 1 A = 1 C/s.' },
    { g: '20 C-eko karga 4 segundotan igarotzen bada, zein da intentsitatea?', a: ['80 A', '5 A', '0,2 A', '24 A'], z: 1, zergatik: 'I = Q / t = 20 / 4 = 5 A.' },
    { g: 'Zergatik estaltzen dira kableak plastikoz?', a: ['Plastikoa isolatzailea delako eta korrontea kabletik ateratzea saihesten duelako', 'Plastikoak korrontea azkarrago eroaten duelako', 'Kobrea ez oxidatzeko bakarrik', 'Kableak astunagoak izateko'], z: 0, zergatik: 'Plastikoak ez du korronterik eroaten: kobrezko eroalea ukitzea eta zirkuitulaburrak saihesten ditu.' },
    { g: 'Nolako korrontea dago etxeko entxufeetan?', a: ['Zuzena, 9 V', 'Alternoa, 230 V eta 50 Hz', 'Zuzena, 230 V', 'Alternoa, 12 V eta 1 Hz'], z: 1, maila: 2, zergatik: 'Sare elektrikoak korronte alternoa ematen du: 230 V eta 50 Hz Europan.' },
    { g: 'Korronte bera igarotzen bada, zer gertatzen zaio elektroien arrastatze-abiadurari haria meheagoa denean?', a: ['Handitu egiten da', 'Txikitu egiten da', 'Ez da aldatzen', 'Zero bihurtzen da'], z: 0, maila: 3, zergatik: 'v = I / (n · q · S): sekzioa (S) txikiagoa bada, abiadura handiagoa behar da karga bera igarotzeko.' }
  ]
};
