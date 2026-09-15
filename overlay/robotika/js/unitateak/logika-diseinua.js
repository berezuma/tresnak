import { nahastu } from '../util.js';
import { ezH } from '../sim/logika-marrazkia.js';

// Karnaugh-en mapa estatikoa (3 aldagai): bat = minterminoak, taldeak = [[minterminoak], kolorea]
function mapa3(bat, taldeak) {
  const zut = [0, 1, 3, 2];
  return `<table class="kn-mapa estatikoa" aria-label="Karnaugh-en mapa">
    <thead><tr><th class="kn-izk"><span>A</span><span>BC</span></th>${zut.map(c => `<th>${c.toString(2).padStart(2, '0')}</th>`).join('')}</tr></thead>
    <tbody>${[0, 1].map(r => `<tr><th>${r}</th>${zut.map(c => {
      const k = r << 2 | c;
      return `<td><span class="kn-q${bat.includes(k) ? ' bat' : ''}">${bat.includes(k) ? 1 : 0}</span><small>m${k}</small>${taldeak.map(([g, kol], j) => g.includes(k) ? `<i class="kn-g" style="--c:${kol};--j:${j}"></i>` : '').join('')}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table>`;
}

const B = [2, 4, 5, 6, 7];
const TAULA = [0, 1, 2, 3, 4, 5, 6, 7].map(k => [k >> 2 & 1, k >> 1 & 1, k & 1, B.includes(k) ? 1 : 0, k]);
const term = k => ['A', 'B', 'C'].map((s, i) => (k >> (2 - i) & 1) ? s : ezH(s)).join('·');

export default {
  izena: 'Diseinu logikoa',
  galdera: 'Nola diseinatzen da zirkuitu logiko bat, zer egin behar duen bakarrik jakinda eta ahalik eta ate gutxien erabiliz?',

  ikusi: {
    sim: 'karnaugh',
    aukerak: { gorde: 'robotika:karnaugh:v1' },
    proba: 'Aukeratu <b>Berotegiko haizagailua</b> eta begiratu mapako bi taldeak eta zirkuitua. Aldatu Q zutabeko gelaxka bat: nola aldatzen dira taldeak eta adierazpena? <b>7 segmentuko pantailan</b>, jarri X gelaxkak 0 eta ikusi adierazpena nola luzatzen den. Azkenik, <b>RS biegonkorra</b>: sakatu S, askatu, eta ikusi motorrak martxan jarraitzen duela.'
  },

  ulertu: () => `
    <p class="def"><strong>Diseinu logikoa</strong> problema baten enuntziatutik zirkuitu logiko batera iristeko metodoa da. Zirkuitu <strong>konbinazionaletan</strong> irteera uneko sarreren araberakoa da bakarrik; <strong>sekuentzialetan</strong>, aurreko egoeraren araberakoa ere bai (memoria dute).</p>

    <h3>Urratsak</h3>
    <ol>
      <li><strong>Sarrerak eta irteerak</strong> identifikatu, eta bakoitzaren esanahia erabaki (1 = zer?).</li>
      <li><strong>Egia-taula</strong> osatu: konbinazio bakoitzeko, zer egin behar du irteerak?</li>
      <li><strong>Forma kanonikoa</strong> idatzi, 1 duten errenkadetatik.</li>
      <li><strong>Sinplifikatu</strong>: aljebraz edo Karnaugh-en mapa batekin.</li>
      <li><strong>Zirkuitua</strong> marraztu eta egiaztatu (simulagailuan, protoboard batean…).</li>
    </ol>

    <h3>Adibidea: berotegiko haizagailua</h3>
    <p>Sarrerak: <strong>A</strong> = tenperatura altua, <strong>B</strong> = hezetasun altua, <strong>C</strong> = euria ari du. Haizagailua (Q) piztu behar da tenperatura altua denean, edo hezetasuna altua denean euririk ez badago.</p>
    <div class="table-scroll"><table class="lg-taula">
      <thead><tr><th class="dim">m</th><th>A</th><th>B</th><th>C</th><th class="q">Q</th><th>Mintermino</th></tr></thead>
      <tbody>${TAULA.map(([a, b, c, q, k]) => `<tr><td class="dim">${k}</td><td>${a}</td><td>${b}</td><td>${c}</td><td class="q${q ? ' bat' : ''}">${q}</td><td>${q ? term(k) : ''}</td></tr>`).join('')}</tbody>
    </table></div>

    <h3>Forma kanonikoa</h3>
    <p>1 duen errenkada bakoitzak <strong>mintermino</strong> bat ematen du: aldagai guztien ETA bat, 0 dutenak ezeztatuta. Minterminoen EDOa da <strong>forma kanonikoa</strong> (produktuen batura):</p>
    <div class="formula">Q = ${[2, 4, 5, 6, 7].map(term).join(' + ')} = Σm(2, 4, 5, 6, 7)</div>
    <p>Zuzena da, baina garestia: 5 ETA ate (3 sarrerakoak), 5 sarrerako EDO bat eta EZ ateak.</p>

    <h3>Karnaugh-en mapa</h3>
    <p>Mapa egia-taula bera da, baina gelaxkak <strong>Gray kodean</strong> ordenatuta (00, 01, 11, 10): ondoz ondoko bi gelaxkak aldagai bakar batean desberdintzen dira. Ertzak ere auzokideak dira (mapa zilindro bat balitz bezala).</p>
    <div class="kn-bikotea">
      ${mapa3(B, [[[4, 5, 6, 7], 'var(--s1)'], [[2, 6], 'var(--s3)']])}
      <ul>
        <li><span class="kn-t" style="--c:var(--s1)">Talde urdina</span> (m4, m5, m7, m6): A = 1 beti; B eta C aldatu egiten dira → <strong>A</strong>.</li>
        <li><span class="kn-t" style="--c:var(--s3)">Talde berdea</span> (m2, m6): B = 1 eta C = 0; A aldatu egiten da → <strong>B·${ezH('C')}</strong>.</li>
      </ul>
    </div>
    <p><strong>Taldekatzeko arauak:</strong></p>
    <ul>
      <li>Taldeak laukizuzenak dira, eta 1, 2, 4 edo 8 gelaxkakoak.</li>
      <li>1eko guztiak talderen batean egon behar dira; 0rik ez.</li>
      <li>Taldeak <strong>ahalik eta handienak</strong> (aldagai gutxiago) eta <strong>ahalik eta gutxien</strong> (ate gutxiago).</li>
      <li>Taldeak gainjarri daitezke, eta ertzetik bestera jarraitu.</li>
      <li>Talde bakoitzean, aldatzen ez diren aldagaiak geratzen dira.</li>
      <li><strong>X</strong> gelaxkak («berdin dio»: inoiz gertatzen ez diren konbinazioak) 1 edo 0 bezala erabil daitezke, taldeak handitzeko komeni den moduan.</li>
    </ul>
    <div class="worked">
      <h4>Emaitza</h4>
      <div class="formula">Q = A + B · ${ezH('C')}</div>
      <p class="ans">Ate bat EZ, ETA bat (2 sarrera) eta EDO bat (2 sarrera): forma kanonikoaren 11 ate baino askoz gutxiago.</p>
    </div>

    <h3>Zirkuitu sekuentzialak: biegonkorrak</h3>
    <p><strong>Biegonkorra</strong> (<em>flip-flop</em>) bit bat gordetzen duen zirkuitua da: bi egoera egonkor ditu, eta sarrerak aldatu arte bati eusten dio. Oinarrizkoena <strong>RS</strong> biegonkorra da, bi EZ-EDO atez egina, bakoitzaren irteera bestearen sarrerara lotuta (<strong>atzeraelikadura</strong>).</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>S</th><th>R</th><th>Q</th><th>Esanahia</th></tr></thead>
      <tbody>
        <tr><td>0</td><td>0</td><td>aurrekoa</td><td>Memoria: ez da aldatzen</td></tr>
        <tr><td>1</td><td>0</td><td>1</td><td>Ezarri (<em>set</em>)</td></tr>
        <tr><td>0</td><td>1</td><td>0</td><td>Berrezarri (<em>reset</em>)</td></tr>
        <tr><td>1</td><td>1</td><td>—</td><td>Debekatua</td></tr>
      </tbody>
    </table></div>
    <p>Makinetako <strong>martxa/geldi</strong> botoiak horrela funtzionatzen dute: «martxa» sakatu eta askatzean, motorrak martxan jarraitzen du «geldi» sakatu arte. Biegonkorrak kateatuz <strong>kontagailuak</strong>, <strong>erregistroak</strong> eta ordenagailuen <strong>RAM memoria</strong> eraikitzen dira.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> enuntziatutik egia-taula egiten da, 1ekoetatik forma kanonikoa idazten da, eta Karnaugh-en mapan ahalik eta talde handienak eginez adierazpen minimoa lortzen da. Adierazpen horretatik zirkuitua zuzenean marrazten da. Memoria behar bada (martxa/geldi), biegonkorrak erabiltzen dira.</p>

    <details class="sakondu" data-maila="3"><summary>Sinplifikazio aljebraikoa eta EZ-ETA ateekin eraikitzea</summary><div class="in">
      <p>Mapak egiten duena aljebraz ere egin daiteke, A · X + ${ezH('A')} · X = X propietatearekin:</p>
      <div class="formula">A·B·${ezH('C')} + ${ezH('A')}·B·${ezH('C')} = (A + ${ezH('A')}) · B·${ezH('C')} = B·${ezH('C')}</div>
      <p>Zirkuitu integratuetan ohikoa da dena EZ-ETA ateekin egitea. Produktuen batura bat zuzenean bihurtzen da, De Morgan erabiliz: ETA ateak eta EDO atea EZ-ETA ateekin ordezkatzen dira.</p>
      <div class="formula">Q = A + B·${ezH('C')} = <span class="ez"><span class="ez">A</span> · <span class="ez">B·<span class="ez">C</span></span></span></div>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>D biegonkorra eta erlojua</summary><div class="in">
      <p>RS biegonkorrak egoera debekatu bat du. <strong>D biegonkorrak</strong> sarrera bakarra du (D, datua) eta <strong>erloju-seinale</strong> bat (CLK): erlojuaren ertz bakoitzean, Q-k D-ren balioa hartzen eta gordetzen du. Mikroprozesadore guztiak erloju batekin sinkronizatzen dira: 3 GHz-eko prozesadore batean, 3000 milioi ertz segundoko.</p>
    </div></details>`,

  ariketak: ['karnaugh-terminoak', 'biegonkorra', 'ate-irteera'],

  galdetegia: nahastu([
    { g: 'Zer da mintermino bat?', a: ['Aldagai guztien ETA bat, irteera 1 duen errenkada bati dagokiona', 'Egia-taulako irteera 0 bat', 'Ate txikiena', 'Karnaugh-en mapako talde bat'], z: 0, zergatik: 'Adibidez, m5 (101) = A·B̄·C.' },
    { g: 'Karnaugh-en mapan, zergatik ordenatzen dira zutabeak 00, 01, 11, 10 (eta ez 00, 01, 10, 11)?', a: ['Ondoz ondoko gelaxkak aldagai bakar batean desberdintzeko (Gray kodea)', 'Alfabetoaren ordena delako', 'Mapa txikiagoa izateko', 'Berdin dio ordenak'], z: 0, zergatik: 'Horrela, auzokideak taldekatzean aldatzen den aldagaia desagertu egiten da.' },
    { g: 'Zenbat gelaxka izan ditzake Karnaugh-en mapako talde batek?', a: ['1, 2, 4 edo 8', '3', 'Edozein kopuru', '2 bakarrik'], z: 0, zergatik: 'Taldeak 2ren berreturak dira eta laukizuzenak.' },
    { g: '3 aldagaiko mapa batean, 4 gelaxkako talde batek zenbat aldagai ditu bere terminoan?', a: ['1', '2', '3', '4'], z: 0, zergatik: 'Gelaxka-kopurua bikoizten den bakoitzean aldagai bat desagertzen da: 8 → 0, 4 → 1, 2 → 2, 1 → 3.' },
    { g: 'Zer esan nahi du X batek egia-taulan?', a: ['Konbinazio hori inoiz ez da gertatzen, eta irteera 0 edo 1 izan daiteke (berdin dio)', 'Errore bat dagoela', 'Irteera 1 dela beti', 'Sarrera bat falta dela'], z: 0, zergatik: 'X gelaxkak taldeak handitzeko erabil daitezke, komeni bada.' },
    { g: 'Zein da zirkuitu konbinazional baten eta sekuentzial baten arteko desberdintasuna?', a: ['Sekuentzialak memoria du: irteera aurreko egoeraren araberakoa ere bada', 'Konbinazionalak ate gehiago ditu', 'Sekuentzialak ez du sarrerarik', 'Ez dago desberdintasunik'], z: 0, zergatik: 'Biegonkorrak dituzten zirkuituek aurreko egoera gogoratzen dute.' },
    { g: 'RS biegonkorrean Q = 1 dago. S = 0 eta R = 0 jartzen dira. Zenbat da Q?', a: ['1 (memoria)', '0', 'Debekatua', 'Ezin da jakin'], z: 0, zergatik: 'S = R = 0 denean biegonkorrak aurreko balioari eusten dio.' },
    { g: 'Zergatik saihestu behar da S = R = 1 RS biegonkorrean?', a: ['Q eta Q̄ biak 0 direlako, eta gero ezin delako jakin zein egoeratara igaroko den', 'Zirkuitua erre egiten delako', 'Q = 1 delako beti', 'Ez da saihestu behar'], z: 0, zergatik: 'Egoera debekatua da: bi sarrerak aldi berean 0ra itzultzean, emaitza ez da aurreikusten.' },
    { g: 'Q = Σm(2, 4, 5, 6, 7) sinplifikatuta:', a: ['A + B·C̄', 'A·B + C', 'A + B + C', 'A·B·C̄'], z: 0, zergatik: 'm4–m7 taldea (A) eta m2–m6 taldea (B·C̄).' }
  ])
};
