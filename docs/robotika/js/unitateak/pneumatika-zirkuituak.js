import { nahastu } from '../util.js';

// A+ B+ A− B− sekuentziaren espazio-fase diagrama estatikoa
function faseDiagrama() {
  const X = i => 90 + i * 120, yA = [60, 30], yB = [130, 100];
  const A = [0, 1, 1, 0, 0], B = [0, 0, 1, 1, 0];
  const bidea = (v, y) => v.map((b, i) => `${X(i)},${y[b]}`).join(' ');
  return `<figure class="fig diagram" style="max-width:640px">
    <svg viewBox="0 0 640 175" role="img" aria-label="A+ B+ A− B− sekuentziaren espazio-fase diagrama">
      <g stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 4">${[0, 1, 2, 3, 4].map(i => `<line x1="${X(i)}" y1="18" x2="${X(i)}" y2="140"/>`).join('')}</g>
      <g stroke="var(--ink3)" stroke-width="1"><line x1="90" y1="60" x2="570" y2="60"/><line x1="90" y1="130" x2="570" y2="130"/></g>
      <polyline points="${bidea(A, yA)}" fill="none" stroke="var(--s1)" stroke-width="3.5" stroke-linejoin="round"/>
      <polyline points="${bidea(B, yB)}" fill="none" stroke="var(--s4)" stroke-width="3.5" stroke-linejoin="round"/>
      <g font-family="Lato, system-ui, sans-serif" font-size="13" font-weight="700" fill="var(--ink2)">
        ${[1, 2, 3, 4, 5].map((n, i) => `<text x="${X(i)}" y="160" text-anchor="middle">${n}</text>`).join('')}
        <text x="30" y="160" fill="var(--ink3)">urratsa</text>
        <text x="40" y="50" font-size="20" font-family="DM Serif Display, Georgia, serif" font-weight="400" fill="var(--ink)">A</text>
        <text x="40" y="120" font-size="20" font-family="DM Serif Display, Georgia, serif" font-weight="400" fill="var(--ink)">B</text>
        <text x="80" y="34" text-anchor="end" font-size="11">1</text><text x="80" y="64" text-anchor="end" font-size="11">0</text>
        <text x="80" y="104" text-anchor="end" font-size="11">1</text><text x="80" y="134" text-anchor="end" font-size="11">0</text>
        <text x="150" y="22" text-anchor="middle" fill="var(--s1)">A+</text><text x="270" y="92" text-anchor="middle" fill="var(--s4)">B+</text>
        <text x="390" y="22" text-anchor="middle" fill="var(--s1)">A−</text><text x="510" y="92" text-anchor="middle" fill="var(--s4)">B−</text>
      </g>
    </svg>
    <figcaption>Espazio-fase diagrama: zilindro bakoitzaren posizioa (0 atzean, 1 aurrean) urrats bakoitzean.</figcaption>
  </figure>`;
}

export default {
  izena: 'Zirkuitu pneumatikoak',
  galdera: 'Nola egiten ditu makina automatiko batek mugimenduak ordena zehatzean, behin eta berriz, ordenagailurik gabe?',

  ikusi: {
    sim: 'pneumatika-zirkuituak',
    proba: '<b>Aginte zeharkakoa:</b> sakatu S1, askatu, eta ikusi zilindroak aurrean jarraitzen duela. <b>ETA / EDO:</b> probatu sakagailuen lau konbinazioak. <b>A+ B+ A− B−:</b> sakatu «Hasi» eta jarraitu fase-diagrama. <b>Gatazka:</b> sakatu «Hasi» eta aurkitu zein balbula dagoen blokeatuta eta zergatik. <b>Kaskada:</b> sekuentzia bera, gatazkarik gabe; begiratu G1 eta G2 taldeak.'
  },

  ulertu: () => `
    <p class="def"><strong>Automatizazio pneumatikoan</strong> aire-seinaleek egiten dute kontrola: sakagailuek, ibilbide-amaierako detektagailuek eta balbula logikoek erabakitzen dute zein zilindro mugitu eta noiz. Elektronikako ate logikoen eta biegonkorren baliokide pneumatikoak daude.</p>

    <h3>Aginte zuzena eta zeharkakoa</h3>
    <ul>
      <li><strong>Aginte zuzena:</strong> operadoreak eragiten duen balbulak berak elikatzen du zilindroa. Zilindro txikietarako bakarrik: zilindro handi batek balbula handia behar du, eta hori ez da eskuz erraz eragiten.</li>
      <li><strong>Aginte zeharkakoa:</strong> balbula txiki batek (sakagailua) aire-seinale bat bidaltzen dio balbula handi bati, <strong>pilotaje pneumatikoz</strong> eragindakoari. Balbula handiak elikatzen du zilindroa. Horrela, agintea urrunetik egin daiteke, eta seinaleak konbinatu.</li>
    </ul>

    <h3>Balbula logikoak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Balbula</th><th>Funtzioa</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>Bi presiokoa</strong></td><td><strong>ETA</strong>: irteeran airea dago bi sarrerek airea badute.</td><td>Prentsa: bi eskuekin sakatu behar da, eskuak ez harrapatzeko.</td></tr>
        <tr><td><strong>Hautagailua</strong></td><td><strong>EDO</strong>: irteeran airea dago sarreraren batek airea badu.</td><td>Ate bat barrutik edo kanpotik ireki.</td></tr>
        <tr><td><strong>5/2 biegonkorra</strong> (bi pilotu)</td><td><strong>Memoria</strong>: azken seinalearen posizioa gordetzen du.</td><td>RS biegonkorraren baliokidea: 14 = ezarri, 12 = berrezarri.</td></tr>
      </tbody>
    </table></div>

    <h3>Sekuentziak</h3>
    <p>Sekuentzia bat zilindroen mugimenduen ordena da. Zilindro bakoitzari letra bat ematen zaio, eta <strong>+</strong> ikurrak aurrera adierazten du eta <strong>−</strong> ikurrak atzera. Adibidez, zulatzeko makina batean: A+ (pieza finkatu), B+ (zulatu), A− (askatu), B− (zulagailua jaso).</p>
    <p>Zilindro bakoitzaren ibilbidearen muturretan <strong>ibilbide-amaierako detektagailuak</strong> daude (rola duten 3/2 balbulak): a0 (A atzean), a1 (A aurrean), b0, b1. Mugimendu bakoitza aurreko mugimenduaren amaierak abiarazten du.</p>
    ${faseDiagrama()}
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mugimendua</th><th>Balbularen pilotua</th><th>Seinalea (nork abiarazten du)</th></tr></thead>
      <tbody>
        <tr><td>A+</td><td>A balbula, 14</td><td>hasi · b0 (sakagailua ETA B atzean)</td></tr>
        <tr><td>B+</td><td>B balbula, 14</td><td>a1 (A iritsi da)</td></tr>
        <tr><td>A−</td><td>A balbula, 12</td><td>b1 (B iritsi da)</td></tr>
        <tr><td>B−</td><td>B balbula, 12</td><td>a0 (A itzuli da)</td></tr>
      </tbody>
    </table></div>

    <h3>Seinale-gatazka</h3>
    <p>Balbula biegonkor batek bi pilotuetan presioa badu aldi berean, ez da mugitzen: <strong>seinale-gatazka</strong> dago. A+ B+ B− A− sekuentzian gertatzen da:</p>
    <ul>
      <li>Hasieran, <strong>b0</strong> aktibo dago (B atzean) eta A−-ren pilotua da. «Hasi» sakatzean, A+-ren pilotuak ere presioa du: A ez da mugitzen.</li>
      <li>B+ ondoren, <strong>a1</strong> oraindik aktibo dago (B+-ren seinalea) <strong>b1</strong> B−-ren seinalea bidaltzen duenean: B ere blokeatuta geratuko litzateke.</li>
    </ul>
    <p>Gatazka dagoen jakiteko: mugimendu baten seinalea aktibo al dago oraindik, zilindro berak kontrako mugimendua egin behar duenean? Gatazka ohikoa da letra bat bi aldiz errepikatzen denean zilindro bat itzuli baino lehen (A+ B+ <strong>B−</strong> A−).</p>

    <h3>Kaskada-metodoa</h3>
    <ol>
      <li>Sekuentzia <strong>taldetan</strong> banatu: talde batean ezin da letra bat errepikatu. A+ B+ | B− A− → <strong>G1</strong> = A+ B+ · <strong>G2</strong> = B− A−.</li>
      <li>Talde bakoitzak aire-lerro bat du. <strong>Memoria-balbula</strong> batek (5/2 biegonkorra) lerro bakar bati ematen dio airea aldi berean: talde-kopurua − 1 memoria-balbula behar dira.</li>
      <li>Talde bakoitzeko lehen mugimendua talde-lerrotik zuzenean elikatzen da; hurrengoak, talde-lerroak elikatzen dituen detektagailuek.</li>
      <li>Talde bateko azken detektagailuak hurrengo taldera aldatzen du memoria. «Hasi» sakagailua azken taldearen lerrotik elikatzen da.</li>
    </ol>
    <div class="worked">
      <h4>A+ B+ B− A−, kaskadan</h4>
      <ol>
        <li>Atsedenean G2 aktibo. Hasi · a0 → memoria G1-era.</li>
        <li>G1 → A+ (zuzenean). a1 · G1 → B+.</li>
        <li>b1 · G1 → memoria G2-ra. G1-ek airea galtzen du: A+ eta B+ seinaleak desagertzen dira.</li>
        <li>G2 → B− (zuzenean). b0 · G2 → A−.</li>
      </ol>
      <p class="ans">Seinale bakoitza bere taldea aktibo dagoenean bakarrik dago: ez dago gatazkarik.</p>
    </div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> zilindro bakoitzaren ibilbide-amaierako detektagailuek hurrengo mugimenduaren seinalea bidaltzen dute, eta balbula biegonkorrek posizioa gordetzen dute. Sekuentziak gatazkak baditu, kaskada-metodoak seinaleak taldetan antolatzen ditu. Gaur egun, makina gehienek elektrobalbulak eta PLC bat erabiltzen dituzte, baina logika bera da.</p>

    <details class="sakondu" data-maila="3"><summary>Elektropneumatika, PLCak eta GRAFCET</summary><div class="in">
      <ul>
        <li><strong>Elektrobalbulak:</strong> elektroiman batek eragiten ditu, eta sentsore elektrikoek (induktiboak, magnetikoak) detektatzen dute zilindroaren posizioa.</li>
        <li><strong>PLCa</strong> (<em>programagailu logiko kontrolagailua</em>) industriako ordenagailu sendo bat da: sentsoreak irakurri eta elektrobalbulak aktibatzen ditu programa baten arabera. Sekuentzia aldatzeko ez da hodirik aldatu behar: programa bakarrik.</li>
        <li><strong>GRAFCET</strong> sekuentziak deskribatzeko diagrama normalizatua da: etapak (karratuak), trantsizioak (baldintzak) eta ekintzak. Fluxu-diagramen antzekoa da, eta PLCetan zuzenean programatzen da.</li>
      </ul>
    </div></details>`,

  ariketak: ['pn-sekuentzia', 'pn-indarra', 'pn-kontsumoa'],

  galdetegia: nahastu([
    { g: 'Zer da aginte zeharkakoa?', a: ['Balbula txiki batek aire-seinale bat bidaltzen dio zilindroa elikatzen duen balbula bati', 'Zilindroa eskuz mugitzea', 'Balbulak zilindroa zuzenean elikatzea', 'Airerik gabe lan egitea'], z: 0, zergatik: 'Pilotaje pneumatikoari esker, seinale txikiek balbula handiak kontrolatzen dituzte.' },
    { g: 'Zein balbula erabiltzen da prentsa bat bi eskuekin bakarrik abiarazteko?', a: ['Bi presioko balbula (ETA)', 'Hautagailu-balbula (EDO)', 'Emari-erregulagailua', 'Atzera-ezinezko balbula'], z: 0, zergatik: 'Irteeran airea dago bi sakagailuak sakatuta badaude bakarrik.' },
    { g: 'Zein balbula erabiltzen da zilindro bat bi lekutatik abiarazteko?', a: ['Hautagailu-balbula (EDO)', 'Bi presioko balbula (ETA)', '3/2 balbula NI', 'Manometroa'], z: 0, zergatik: 'Edozein sarreratatik iristen den airea irteerara pasatzen da.' },
    { g: '5/2 balbula biegonkor batek bi pilotuetan presioa badu, zer gertatzen da?', a: ['Ez da mugitzen: seinale-gatazka dago', 'Erdiko posizioan geratzen da', '14 pilotuak irabazten du beti', 'Balbula hautsi egiten da'], z: 0, zergatik: 'Bi indarrak orekatu egiten dira, eta balbulak azken posizioari eusten dio.' },
    { g: 'A+ B+ A− B− sekuentzian, zein detektagailuk abiarazten du B+?', a: ['a1', 'a0', 'b0', 'b1'], z: 0, zergatik: 'A aurrean dagoenean (a1), B aurrera egin daiteke.' },
    { g: 'Zer adierazten du espazio-fase diagramak?', a: ['Zilindro bakoitzaren posizioa urrats bakoitzean', 'Airearen presioa denboran', 'Balbulen prezioa', 'Hodien luzera'], z: 0, zergatik: 'Zilindro bakoitzeko lerro bat, 0 (atzean) eta 1 (aurrean) artean.' },
    { g: 'Zergatik du gatazka A+ B+ B− A− sekuentzia zuzenak?', a: ['Detektagailu baten seinalea aktibo dagoelako oraindik, zilindro berak kontrako mugimendua egin behar duenean', 'Zilindro gehiegi dituelako', 'Presioa txikiegia delako', 'Ez du gatazkarik'], z: 0, zergatik: 'Adibidez, a1 aktibo dago (B+) b1-ek B− eskatzen duenean.' },
    { g: 'Kaskada-metodoan, zenbat memoria-balbula behar dira 3 talde badaude?', a: ['2', '3', '1', '6'], z: 0, zergatik: 'Talde-kopurua − 1 memoria-balbula.' },
    { g: 'Kaskada-metodoan, nola banatzen da sekuentzia taldetan?', a: ['Talde batean letra bakoitza behin bakarrik ager daiteke', 'Bi mugimenduko taldeetan beti', 'Zilindro bakoitzeko talde bat', 'Aurrerako mugimenduak talde batean eta atzerakoak bestean'], z: 0, zergatik: 'A+ B+ | B− A−: letra bat errepikatzen den lekuan hasten da talde berria.' }
  ])
};
