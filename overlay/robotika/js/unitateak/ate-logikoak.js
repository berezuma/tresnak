import { nahastu } from '../util.js';
import { ATEAK, atea, ezH } from '../sim/logika-marrazkia.js';

// Ezeztapen habiaratua: barruko HTMLa ez da ihes-karakterez babestu behar
const ez = s => `<span class="ez">${s}</span>`;

function ateIkurra(mota) {
  const n = ATEAK[mota].n;
  const g = atea(mota, 22, 30, n, '', false);
  const hariak = g.sar.map(([x, y]) => `<line x1="4" y1="${y}" x2="${x}" y2="${y}"/>`).join('') + `<line x1="${g.irt[0]}" y1="30" x2="${g.irt[0] + 14}" y2="30"/>`;
  return `<svg class="ikurra ate" viewBox="0 0 110 60" role="img" aria-label="${ATEAK[mota].izena} atearen ikurra"><g class="lg"><g stroke="var(--ink)" stroke-width="2">${hariak}</g>${g.svg}</g></svg>`;
}
function taulaTxikia(mota) {
  const n = ATEAK[mota].n;
  const errenk = n === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return `<table class="lg-taula mini"><thead><tr>${n === 1 ? '<th>A</th>' : '<th>A</th><th>B</th>'}<th class="q">Q</th></tr></thead><tbody>${errenk.map(r => {
    const q = ATEAK[mota].f(r.map(Boolean));
    return `<tr>${r.map(v => `<td>${v}</td>`).join('')}<td class="q${q ? ' bat' : ''}">${q ? 1 : 0}</td></tr>`;
  }).join('')}</tbody></table>`;
}

const ETENGAILUAK = `<figure class="fig diagram" style="max-width:600px">
  <svg viewBox="0 0 600 170" role="img" aria-label="Etengailuak seriean (ETA) eta paraleloan (EDO), lanpara batekin">
    <g fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round">
      <path d="M30 79 V40 H70 M110 40 H140 M180 40 H230 V71 M230 99 V130 H30 V91"/>
      <path d="M70 40 L106 26 M140 40 L176 26"/>
      <path d="M340 79 V40 H390 M390 40 V20 H420 M460 20 H490 V40 M390 40 V70 H420 M460 70 H490 V40 H550 V71 M550 99 V130 H340 V91"/>
      <path d="M420 20 L456 6 M420 70 L456 56"/>
      <line x1="12" y1="79" x2="48" y2="79"/><line x1="21" y1="91" x2="39" y2="91" stroke-width="6"/>
      <line x1="322" y1="79" x2="358" y2="79"/><line x1="331" y1="91" x2="349" y2="91" stroke-width="6"/>
    </g>
    <g fill="var(--ink)"><circle cx="70" cy="40" r="3.5"/><circle cx="110" cy="40" r="3.5"/><circle cx="140" cy="40" r="3.5"/><circle cx="180" cy="40" r="3.5"/>
      <circle cx="420" cy="20" r="3.5"/><circle cx="460" cy="20" r="3.5"/><circle cx="420" cy="70" r="3.5"/><circle cx="460" cy="70" r="3.5"/><circle cx="390" cy="40" r="3.5"/><circle cx="490" cy="40" r="3.5"/></g>
    <g fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.5"><circle cx="230" cy="85" r="14"/><circle cx="550" cy="85" r="14"/></g>
    <path d="M220 75 L240 95 M240 75 L220 95 M540 75 L560 95 M560 75 L540 95" stroke="var(--ink)" stroke-width="1.6"/>
    <g font-family="Lato, system-ui, sans-serif" font-size="14" font-weight="700" fill="var(--ink)">
      <text x="88" y="62" text-anchor="middle">A</text><text x="158" y="62" text-anchor="middle">B</text>
      <text x="440" y="46" text-anchor="end">A</text><text x="440" y="96" text-anchor="end">B</text>
      <text x="252" y="90">Q</text><text x="572" y="90">Q</text>
      <text x="130" y="160" text-anchor="middle">Seriean: ETA (A · B)</text>
      <text x="445" y="160" text-anchor="middle">Paraleloan: EDO (A + B)</text>
    </g>
  </svg>
  <figcaption>Etengailu itxia = 1, lanpara piztuta = 1. Seriean biak itxi behar dira; paraleloan, bat nahikoa da.</figcaption>
</figure>`;

const ALARMA = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]];

export default {
  izena: 'Boole-ren aljebra eta ate logikoak',
  galdera: 'Nola erabakitzen du etxeko alarma batek jo behar duen ala ez, ateko, leihoko eta aktibazio-botoiko seinaleen arabera?',

  ikusi: {
    sim: 'logika',
    aukerak: { modua: 'ateak' },
    proba: 'Aukeratu ate bat eta probatu sarreren konbinazio guztiak, sarreren laukiak sakatuz. Zein atek ematen du 1 sarrera guztiak 1 direnean bakarrik? Eta sarrerak desberdinak direnean bakarrik? Gero, sakatu <b>Zirkuituak</b>: probatu alarma, ureztatze automatikoa eta bozketa, eta aurkitu egia-taulan irteera 1 duten errenkadak.'
  },

  ulertu: () => `
    <p class="def"><strong>Boole-ren aljebran</strong> (George Boole, 1854) aldagaiek bi balio bakarrik izan ditzakete: <strong>1</strong> (egia, piztuta, tentsioa) edo <strong>0</strong> (gezurra, itzalita, tentsiorik ez). Hiru oinarrizko eragiketa ditu: EZ, ETA eta EDO. Ordenagailu, mugikor eta robot guztien barruan milioika <strong>ate logiko</strong> daude, eragiketa horiek transistoreekin egiten dituztenak.</p>

    <h3>Ate logikoak</h3>
    <div class="table-scroll"><table class="tbl ate-taula">
      <thead><tr><th>Atea</th><th>Ikurra</th><th>Adierazpena</th><th>Egia-taula</th><th>Noiz da Q = 1?</th></tr></thead>
      <tbody>
        <tr><td><strong>EZ</strong> (NOT)</td><td>${ateIkurra('EZ')}</td><td>Q = ${ezH('A')}</td><td>${taulaTxikia('EZ')}</td><td>Sarrera 0 denean. Aurkakoa.</td></tr>
        <tr><td><strong>ETA</strong> (AND)</td><td>${ateIkurra('ETA')}</td><td>Q = A · B</td><td>${taulaTxikia('ETA')}</td><td>Sarrera guztiak 1 direnean.</td></tr>
        <tr><td><strong>EDO</strong> (OR)</td><td>${ateIkurra('EDO')}</td><td>Q = A + B</td><td>${taulaTxikia('EDO')}</td><td>Gutxienez sarrera bat 1 denean.</td></tr>
        <tr><td><strong>EZ-ETA</strong> (NAND)</td><td>${ateIkurra('EZETA')}</td><td>Q = ${ezH('A · B')}</td><td>${taulaTxikia('EZETA')}</td><td>Sarrera guztiak 1 ez direnean.</td></tr>
        <tr><td><strong>EZ-EDO</strong> (NOR)</td><td>${ateIkurra('EZEDO')}</td><td>Q = ${ezH('A + B')}</td><td>${taulaTxikia('EZEDO')}</td><td>Sarrera guztiak 0 direnean.</td></tr>
        <tr><td><strong>EDO-B</strong> (XOR)</td><td>${ateIkurra('EDOB')}</td><td>Q = A ⊕ B</td><td>${taulaTxikia('EDOB')}</td><td>Sarrerak desberdinak direnean.</td></tr>
      </tbody>
    </table></div>
    <p>«·» ikurra ETA da (biderketaren antzera irakurtzen da, baina ez da biderketa) eta «+» ikurra EDO. Goiko marrak ezeztapena adierazten du: ${ezH('A')} irakurtzen da «EZ A».</p>

    <h3>Etengailuekin</h3>
    ${ETENGAILUAK}

    <h3>Egia-taula</h3>
    <p><strong>Egia-taulak</strong> sarreren konbinazio guztiak eta bakoitzaren irteera erakusten ditu. <strong>n</strong> sarrerarekin 2<sup>n</sup> errenkada daude, eta zenbaki bitarren ordenan idazten dira: 000, 001, 010…</p>
    <div class="worked">
      <h4>Adibidea: etxeko alarma</h4>
      <p>A = atea irekita, B = leihoa irekita, C = alarma aktibatuta. Alarmak jotzen du (atea EDO leihoa) ETA aktibatuta badago: <strong>Q = (A + B) · C</strong>.</p>
      <div class="table-scroll"><table class="lg-taula">
        <thead><tr><th>A</th><th>B</th><th>C</th><th>A + B</th><th class="q">Q</th></tr></thead>
        <tbody>${ALARMA.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td><td>${a | b}</td><td class="q${(a | b) & c ? ' bat' : ''}">${(a | b) & c}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="ans">Alarmak 3 kasutan jotzen du: 011, 101 eta 111.</p>
    </div>

    <h3>Aljebraren oinarrizko propietateak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>ETA</th><th>EDO</th><th>Esanahia</th></tr></thead>
      <tbody>
        <tr><td>A · 0 = 0</td><td>A + 1 = 1</td><td>Balio batek emaitza finkatzen du</td></tr>
        <tr><td>A · 1 = A</td><td>A + 0 = A</td><td>Balio neutroa</td></tr>
        <tr><td>A · A = A</td><td>A + A = A</td><td>Aldagaia bera errepikatzea</td></tr>
        <tr><td>A · ${ezH('A')} = 0</td><td>A + ${ezH('A')} = 1</td><td>Aldagaia eta bere aurkakoa</td></tr>
        <tr><td colspan="2">${ez(ezH('A'))} = A</td><td>Ezeztapen bikoitza</td></tr>
      </tbody>
    </table></div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> sentsore bakoitza aldagai boolear bat da (irekita = 1). Alarmaren erabakia adierazpen logiko bat da, Q = (A + B) · C, eta EDO ate batekin eta ETA ate batekin eraikitzen da. Mikrokontrolagailu batean, adierazpen bera «baldin (atea EDO leihoa) ETA aktibatuta bada» bloke batekin idazten da.</p>

    <details class="sakondu" data-maila="2"><summary>Ate unibertsalak: EZ-ETA eta EZ-EDO</summary><div class="in">
      <p>EZ-ETA ateekin bakarrik, beste edozein ate eraiki daiteke. Horregatik esaten zaie <strong>unibertsalak</strong>, eta fabrikazioan asko erabiltzen dira (mota bakarreko ateak merkeagoak dira).</p>
      <ul>
        <li><strong>EZ:</strong> EZ-ETA ate baten bi sarrerak elkarrekin lotuta: ${ezH('A · A')} = ${ezH('A')}.</li>
        <li><strong>ETA:</strong> EZ-ETA bat eta, ondoren, EZ bat (beste EZ-ETA bat).</li>
        <li><strong>EDO:</strong> sarrera bakoitza ezeztatu eta EZ-ETA batean sartu: ${ez(ezH('A') + ' · ' + ezH('B'))} = A + B.</li>
      </ul>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>De Morgan-en legeak</summary><div class="in">
      <div class="formula">${ezH('A · B')} = ${ezH('A')} + ${ezH('B')} &nbsp;&nbsp;·&nbsp;&nbsp; ${ezH('A + B')} = ${ezH('A')} · ${ezH('B')}</div>
      <p>Hitzez: «biak ez» eta «bat gutxienez ez» gauza bera dira. Egiaztatzeko, egin bi adierazpenen egia-taulak: lau errenkadetan berdinak dira. Simulagailuan, «Zirkuituak» → «De Morgan-en legea»: bi irteerak beti berdinak dira.</p>
      <p>Legeak adierazpenak sinplifikatzeko eta zirkuituak ate mota bakarrarekin eraikitzeko erabiltzen dira. Adibidez, ${ezH('A + B')} · C = ${ezH('A')} · ${ezH('B')} · C.</p>
    </div></details>`,

  ariketak: ['ate-irteera', 'egia-taula-batak', 'errenkadak'],

  galdetegia: nahastu([
    { g: 'ETA ate batek bi sarrera ditu. Noiz da irteera 1?', a: ['Bi sarrerak 1 direnean bakarrik', 'Sarreraren bat 1 denean', 'Bi sarrerak 0 direnean', 'Sarrerak desberdinak direnean'], z: 0, zergatik: 'ETA: sarrera guztiak 1 izan behar dira.' },
    { g: 'A = 1 eta B = 0 badira, zenbat da A + B (EDO)?', a: ['1', '0', '2', '10'], z: 0, zergatik: 'EDO: sarreraren bat 1 bada, irteera 1 da. Ez da batuketa aritmetikoa.' },
    { g: 'Zein atek ematen du sarreraren aurkako balioa?', a: ['EZ', 'ETA', 'EDO', 'EDO-B'], z: 0, zergatik: 'EZ ateak 0 → 1 eta 1 → 0 egiten du.' },
    { g: 'Bi etengailu seriean eta lanpara bat: zein eragiketa logiko da?', a: ['ETA', 'EDO', 'EZ', 'EDO-B'], z: 0, zergatik: 'Seriean biak itxi behar dira lanpara pizteko.' },
    { g: 'Zenbat errenkada ditu 3 sarrerako egia-taula batek?', a: ['8', '3', '6', '9'], z: 0, zergatik: '2³ = 8 konbinazio.' },
    { g: 'Eskailera batean, behean eta goian dagoen etengailuek argia aldatzen dute. Zein atek adierazten du?', a: ['EDO-B (XOR)', 'ETA', 'EDO', 'EZ-EDO'], z: 0, zergatik: 'Argia piztuta dago etengailuak desberdin daudenean: EDO esklusiboa.' },
    { g: 'Zenbat da A · 0, A edozein izanda?', a: ['0', 'A', '1', 'Ā'], z: 0, zergatik: 'ETA eragiketan 0 batek emaitza 0 egiten du beti.' },
    { g: 'Q = (A + B) · C adierazpenean, A = 0, B = 1 eta C = 1 badira, zenbat da Q?', a: ['1', '0', '2', 'Ezin da jakin'], z: 0, zergatik: 'A + B = 1, eta 1 · 1 = 1.' },
    { g: 'Zergatik esaten zaie EZ-ETA ateei «unibertsalak»?', a: ['Haiekin bakarrik beste edozein ate eraiki daitekeelako', 'Herrialde guztietan erabiltzen direlako', 'Sarrera asko dituztelako', 'Beti 1 ematen dutelako'], z: 0, maila: 2, zergatik: 'EZ, ETA eta EDO EZ-ETA ateekin eraiki daitezke.' },
    { g: 'De Morgan-en legearen arabera, (A · B) ezeztatua baliokidea da…', a: ['Ā + B̄', 'Ā · B̄', 'A + B', 'A · B'], z: 0, maila: 3, zergatik: 'ETA baten ezeztapena sarrera ezeztatuen EDO bat da.' }
  ])
};
