export default {
  izena: 'Tentsioa, intentsitatea eta erresistentzia',
  galdera: 'Zergatik ez digu kalterik egiten 9 V-ko pila batek, eta bai, ordea, etxeko 230 V-ko entxufe batek?',

  ikusi: {
    sim: 'ur-analogia',
    proba: 'Igo pilaren tentsioa: emaria (intentsitatea) handitu egiten da. Orain estutu hodia, <b>erresistentzia</b> handituz: zer gertatzen zaio emariari? Lortu 1 A tentsio eta erresistentzia desberdinekin.'
  },

  ulertu: () => `
    <p>Zirkuitu bat ulertzeko hiru magnitude nagusi erabiltzen dira. Ur-analogiak laguntzen du haien arteko lotura ikusten.</p>

    <h3>Tentsioa (V)</h3>
    <p class="def"><strong>Tentsioa</strong> edo potentzial-diferentzia sorgailuak kargei ematen dien "bultzada" da: zirkuituko bi punturen arteko energia-aldea. Unitatea <strong>volta (V)</strong> da, eta <strong>voltimetroarekin</strong> neurtzen da.</p>
    <p>Ur-zirkuituan, ponpak sortzen duen presio-aldearen baliokidea da.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Sorgailua</th><th>Tentsioa</th></tr></thead>
      <tbody>
        <tr><td>AA pila</td><td>1,5 V</td></tr>
        <tr><td>Mugikorraren bateria</td><td>3,7 V</td></tr>
        <tr><td>Pila karratua</td><td>9 V</td></tr>
        <tr><td>Autoaren bateria</td><td>12 V</td></tr>
        <tr><td>Etxeko entxufea</td><td>230 V</td></tr>
        <tr><td>Goi-tentsioko linea</td><td>400 000 V</td></tr>
      </tbody>
    </table></div>

    <h3>Intentsitatea (I)</h3>
    <p class="def"><strong>Intentsitatea</strong> eroale batetik segundo bakoitzean igarotzen den karga da. Unitatea <strong>amperea (A)</strong> da, eta <strong>amperimetroarekin</strong> neurtzen da.</p>
    <p>Ur-zirkuituan, emariaren baliokidea da: segundoko zenbat litro igarotzen diren.</p>
    <p>Adibideak: LED batek 0,02 A (20 mA), mugikorraren kargagailuak 1–3 A, mikrouhin-labeak 4 A inguru, tximista batek 30 000 A.</p>

    <h3>Erresistentzia (R)</h3>
    <p class="def"><strong>Erresistentzia</strong> materialak korronteari jartzen dion oztopoa da. Unitatea <strong>ohma (Ω)</strong> da, eta <strong>ohmetroarekin</strong> neurtzen da (zirkuitua deskonektatuta).</p>
    <p>Ur-zirkuituan, hodiaren estugunea da: zenbat eta estuagoa, orduan eta ur gutxiago igarotzen da. Erresistentzia materialaren, luzeraren eta lodieraren araberakoa da.</p>

    <h3>Laburpena</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Magnitudea</th><th>Ikurra</th><th>Unitatea</th><th>Neurgailua</th><th>Nola konektatu</th></tr></thead>
      <tbody>
        <tr><td>Tentsioa</td><td>V</td><td>volta (V)</td><td>voltimetroa</td><td><strong>paraleloan</strong></td></tr>
        <tr><td>Intentsitatea</td><td>I</td><td>amperea (A)</td><td>amperimetroa</td><td><strong>seriean</strong></td></tr>
        <tr><td>Erresistentzia</td><td>R</td><td>ohma (Ω)</td><td>ohmetroa</td><td>zirkuitutik kanpo</td></tr>
      </tbody>
    </table></div>

    <h3>Multiploak eta azpimultiploak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Aurrizkia</th><th>Ikurra</th><th>Balioa</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td>mega</td><td>M</td><td>1 000 000</td><td>1 MΩ = 1 000 000 Ω</td></tr>
        <tr><td>kilo</td><td>k</td><td>1000</td><td>4,7 kΩ = 4700 Ω</td></tr>
        <tr><td>mili</td><td>m</td><td>1 / 1000</td><td>250 mA = 0,25 A</td></tr>
        <tr><td>mikro</td><td>µ</td><td>1 / 1 000 000</td><td>500 µA = 0,0005 A</td></tr>
      </tbody>
    </table></div>
    <div class="worked">
      <h4>Adibideak</h4>
      <ol>
        <li>0,25 A → mA: 0,25 · 1000 = <strong>250 mA</strong></li>
        <li>4,7 kΩ → Ω: 4,7 · 1000 = <strong>4700 Ω</strong></li>
        <li>1500 mA → A: 1500 / 1000 = <strong>1,5 A</strong></li>
      </ol>
    </div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> gorputzari kalte egiten diona <strong>korrontea</strong> da, eta korrontea tentsioaren eta erresistentziaren araberakoa da. Gure larruazalak milaka ohmeko erresistentzia du: 9 V-rekin korrontea txikiegia da sentitzeko ere. 230 V-rekin, ordea, korrontea arriskutsua izan daiteke (30 mA-tik gora).</p>

    <details class="sakondu" data-maila="2"><summary>Potentziala eta potentzial-diferentzia</summary><div class="in">
      <p>Zirkuituko puntu bakoitzak <strong>potentzial</strong> bat du. Erreferentzia gisa puntu bat hartzen da (lurra edo pilaren − borna, 0 V), eta tentsioa bi punturen arteko potentzial-aldea da:</p>
      <div class="formula">V<sub>AB</sub> = V<sub>A</sub> − V<sub>B</sub></div>
      <p>Horregatik esaten da "tentsioa bi punturen artean" neurtzen dela: voltimetroaren bi puntak beti bi puntutan jartzen dira.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Tentsioaren definizio energetikoa</summary><div class="in">
      <p>Tentsioa karga-unitateko energia da: q karga bat V tentsioko bi punturen artean mugitzean, W = q · V lana egiten da.</p>
      <div class="formula">V = W / q &nbsp;&nbsp;→&nbsp;&nbsp; 1 V = 1 J / C</div>
      <p>12 V-ko bateria batean, coulomb bakoitzak 12 J energia hartzen du kanpoko zirkuituan. Eta 1 A = 1 C/s denez, 12 V · 1 A = 12 J/s = 12 W: hortik dator P = V · I.</p>
    </div></details>`,

  ariketak: ['unitateak'],

  galdetegia: [
    { g: 'Zein da tentsioaren unitatea?', a: ['Amperea', 'Volta', 'Ohma', 'Watta'], z: 1, zergatik: 'Tentsioa voltetan (V) neurtzen da.' },
    { g: 'Nola konektatzen da amperimetroa?', a: ['Seriean', 'Paraleloan', 'Pilaren ordez', 'Zirkuitutik kanpo'], z: 0, zergatik: 'Korronte guztia bere barnetik igaro behar denez, amperimetroa seriean jartzen da.' },
    { g: 'Nola konektatzen da voltimetroa?', a: ['Seriean', 'Paraleloan, neurtu nahi den osagaiaren muturretara', 'Pilaren barruan', 'Kable baten ordez'], z: 1, zergatik: 'Tentsioa bi punturen artean neurtzen da: voltimetroa paraleloan jartzen da.' },
    { g: '250 mA zenbat ampere dira?', a: ['2,5 A', '0,25 A', '25 A', '0,025 A'], z: 1, zergatik: '250 / 1000 = 0,25 A.' },
    { g: 'Ur-analogian, zer da erresistentzia?', a: ['Hodiaren estugunea', 'Ponpa', 'Ur-emaria', 'Ura bera'], z: 0, zergatik: 'Hodi estuak ura igarotzea oztopatzen du, erresistentziak korrontea oztopatzen duen bezala.' },
    { g: '4,7 kΩ zenbat ohm dira?', a: ['47 Ω', '470 Ω', '4700 Ω', '0,0047 Ω'], z: 2, zergatik: 'kilo = 1000: 4,7 · 1000 = 4700 Ω.' },
    { g: 'Zirkuitu bateko A puntuaren potentziala 9 V da eta B puntuarena 4 V. Zein da V<sub>AB</sub>?', a: ['13 V', '5 V', '−5 V', '36 V'], z: 1, maila: 2, zergatik: 'V_AB = V_A − V_B = 9 − 4 = 5 V.' },
    { g: 'Zer da 1 volta?', a: ['1 J / C', '1 C / J', '1 A · s', '1 Ω / A'], z: 0, maila: 3, zergatik: 'Tentsioa karga-unitateko energia da: 1 V = 1 J/C.' }
  ]
};
