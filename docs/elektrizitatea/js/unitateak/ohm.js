const TRIANGELUA = `<figure class="fig" style="max-width:220px">
  <svg viewBox="0 0 220 170" role="img" aria-label="Ohm-en legearen triangelua: V goian, I eta R behean">
    <path d="M110 12 L206 158 H14 Z" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="52" y1="100" x2="168" y2="100" stroke="var(--ink)" stroke-width="2"/>
    <line x1="110" y1="100" x2="110" y2="158" stroke="var(--ink)" stroke-width="2"/>
    <g font-family="DM Serif Display, Georgia, serif" font-size="36" text-anchor="middle" fill="var(--ink)">
      <text x="110" y="84">V</text><text x="76" y="144" fill="var(--s1)">I</text><text x="144" y="144" fill="var(--s2)">R</text>
    </g>
  </svg>
  <figcaption>Estali bilatzen duzuna: V = I · R, I = V / R, R = V / I</figcaption>
</figure>`;

export default {
  izena: 'Ohm-en legea',
  galdera: 'Pila baten tentsioa bikoizten badugu, zer gertatzen zaio zirkuituko korronteari?',

  ikusi: {
    sim: 'ohm-grafikoa',
    proba: 'Gorde neurketak 2, 4, 6, 8… V-tan. Taulako azken zutabeak (<b>V / I</b>) beti balio bera ematen du? Aldatu erresistentzia eta ikusi nola aldatzen den lerroaren malda. DBH 3-4tik aurrera, probatu <b>bonbilla</b>: puntuak lerro zuzen batean daude?'
  },

  ulertu: () => `
    <p class="def"><strong>Ohm-en legea</strong> (Georg Simon Ohm, 1827): eroale batetik igarotzen den korrontearen intentsitatea bere muturren arteko tentsioaren zuzenki proportzionala da, eta bere erresistentziaren alderantziz proportzionala.</p>
    <div class="formula">I = V / R &nbsp;&nbsp;⇔&nbsp;&nbsp; V = I · R &nbsp;&nbsp;⇔&nbsp;&nbsp; R = V / I</div>
    <dl class="where">
      <dt>V</dt><dd>tentsioa, voltetan (V)</dd>
      <dt>I</dt><dd>intentsitatea, amperetan (A)</dd>
      <dt>R</dt><dd>erresistentzia, ohmetan (Ω)</dd>
    </dl>
    ${TRIANGELUA}

    <div class="worked">
      <h4>1. adibidea: intentsitatea</h4>
      <p>4 Ω-eko erresistentzia bat 12 V-ko pila bati lotuta dago.</p>
      <ol><li>I = V / R</li><li>I = 12 V / 4 Ω</li></ol>
      <p class="ans">I = 3 A</p>
    </div>
    <div class="worked">
      <h4>2. adibidea: erresistentzia</h4>
      <p>Bonbilla batek 6 V-ra 0,5 A kontsumitzen ditu.</p>
      <ol><li>R = V / I</li><li>R = 6 V / 0,5 A</li></ol>
      <p class="ans">R = 12 Ω</p>
    </div>

    <h3>Proportzionaltasuna</h3>
    <ul>
      <li>Erresistentzia berarekin, <strong>tentsioa bikoizten bada, intentsitatea ere bikoiztu</strong> egiten da.</li>
      <li>Tentsio berarekin, <strong>erresistentzia bikoizten bada, intentsitatea erdira</strong> jaisten da.</li>
    </ul>

    <h3>I–V grafikoa</h3>
    <p>Osagai ohmiko baten neurketak grafikoan jartzean, <strong>jatorritik pasatzen den lerro zuzen</strong> bat ateratzen da. Lerroaren malda erresistentziaren araberakoa da: zenbat eta erresistentzia handiagoa, orduan eta lerro <strong>etzanagoa</strong> (korronte gutxiago tentsio berarekin).</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> erresistentzia aldatzen ez bada, korrontea ere bikoiztu egiten da. Ohm-en legeak proportzionaltasun hori adierazten du.</p>

    <details class="sakondu" data-maila="2"><summary>Osagai ohmikoak eta ez-ohmikoak</summary><div class="in">
      <p>Ohm-en legea ez da osagai guztietan betetzen. <strong>Osagai ohmikoen</strong> erresistentzia ez da aldatzen tentsioarekin (metalezko erresistentziak, tenperatura konstantean).</p>
      <p><strong>Osagai ez-ohmikoetan</strong> V / I ez da konstantea:</p>
      <ul>
        <li><strong>Bonbilla gori bat:</strong> harizpia berotzean erresistentzia handitu egiten da (hotz dagoenean baino 10 aldiz handiagoa izan daiteke). Grafikoa kurbatu egiten da.</li>
        <li><strong>LEDa eta diodoa:</strong> tentsio jakin batetik behera ia ez dute korronterik uzten, eta gero korrontea azkar igotzen da.</li>
        <li><strong>Termistoreak eta LDRak:</strong> tenperaturaren edo argiaren arabera aldatzen dute erresistentzia (sentsoreak).</li>
      </ul>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Erresistentzia eta tenperatura</summary><div class="in">
      <p>Metaletan erresistentzia tenperaturarekin handitzen da, gutxi gorabehera linealki:</p>
      <div class="formula">R = R₀ · (1 + α · ΔT)</div>
      <p>Kobrean α ≈ 0,0039 °C⁻¹ da: 0 °C-tik 100 °C-ra berotzean erresistentzia % 39 handitzen da. Wolframiozko harizpi batek 2500 °C inguru hartzen ditu, eta hori da bonbillaren portaera ez-ohmikoaren arrazoia.</p>
      <p>Ikuspegi mikroskopikotik, Ohm-en legea J = σ · E da: korronte-dentsitatea eremu elektrikoaren proportzionala, σ eroankortasuna izanik.</p>
    </div></details>`,

  ariketak: ['ohm-i', 'ohm-v', 'ohm-r'],

  galdetegia: [
    { g: 'Nola idazten da Ohm-en legea?', a: ['V = I · R', 'V = I / R', 'I = V · R', 'R = V · I'], z: 0, zergatik: 'Tentsioa = intentsitatea bider erresistentzia. Beraz I = V / R eta R = V / I.' },
    { g: 'Erresistentzia berarekin tentsioa bikoizten bada, intentsitatea:', a: ['Bikoiztu egiten da', 'Erdira jaisten da', 'Ez da aldatzen', 'Laukoiztu egiten da'], z: 0, zergatik: 'I = V / R: V bikoitza → I bikoitza (proportzionaltasun zuzena).' },
    { g: '12 V-ko pila bati 6 Ω-eko erresistentzia lotzen badiogu, zein da korrontea?', a: ['72 A', '2 A', '0,5 A', '18 A'], z: 1, zergatik: 'I = 12 / 6 = 2 A.' },
    { g: 'Tentsio berarekin erresistentzia handitzen bada:', a: ['Intentsitatea txikitu egiten da', 'Intentsitatea handitu egiten da', 'Intentsitatea ez da aldatzen', 'Tentsioa txikitu egiten da'], z: 0, zergatik: 'Erresistentzia oztopoa da: handiagoa bada, korronte gutxiago igarotzen da.' },
    { g: 'I–V grafikoan, zein erresistentziari dagokio lerro zutikena (malda handiena)?', a: ['Erresistentzia handienari', 'Erresistentzia txikienari', 'Guztiek berdina dute', 'Ezin da jakin'], z: 1, zergatik: 'Malda I / V = 1 / R da: R txikia bada, korronte handia tentsio berarekin, lerro zutikoa.' },
    { g: 'Zergatik ez da bonbilla gori bat osagai ohmikoa?', a: ['Harizpia berotzean erresistentzia handitzen delako', 'Beirazkoa delako', 'Argia ematen duelako eta ez beroa', 'Tentsio txikian ez duelako funtzionatzen'], z: 0, maila: 2, zergatik: 'Erresistentzia tenperaturarekin aldatzen denez, V / I ez da konstantea.' },
    { g: 'Kobrezko hari bat 0 °C-tik 100 °C-ra berotzen da (α = 0,0039 °C⁻¹). Bere erresistentzia:', a: ['% 39 inguru handitzen da', '% 39 inguru txikitzen da', 'Ez da aldatzen', 'Bikoiztu egiten da'], z: 0, maila: 3, zergatik: 'R = R₀ (1 + 0,0039 · 100) = 1,39 R₀.' }
  ]
};
