import { R, Pr, ebatzi, eskemaSVG } from '../eskema.js';

const tree = Pr(R('R1', 20), R('R2', 30), R('R3', 60));

export default {
  izena: 'Paraleloko zirkuituak',
  galdera: 'Etxean argi bat itzaltzean, zergatik ez dira besteak ere itzaltzen?',

  ikusi: {
    sim: 'laborategia',
    aukerak: { adibidea: 'paraleloa', adibideak: ['paraleloa', 'paraleloa-r', 'etxea'], balioak: true },
    proba: 'Sakatu bonbilla bakoitza: biek dute pilaren tentsio osoa? Konparatu haien distira seriezko zirkuituarekin. Kargatu «Hiru adar paraleloan»: amperimetroak adarretako korronteen batura neurtzen du? Kendu adar bat eta begiratu besteei.'
  },

  ulertu: () => `
    <p class="def">Osagaiak <strong>paraleloan</strong> daude haien muturrak puntu berberetara lotuta daudenean. Korronteak <strong>adar</strong> bat baino gehiago ditu, eta adarrak <strong>nodoetan</strong> elkartzen dira.</p>

    <h3>Paraleloko zirkuituen hiru propietateak</h3>
    <ol>
      <li><strong>Tentsioa berdina da</strong> adar guztietan: denak bi puntu berberen artean daude.
        <div class="formula">V = V₁ = V₂ = V₃</div></li>
      <li><strong>Korrontea adarren artean banatzen da:</strong> pilaren korrontea adarretako korronteen batura da.
        <div class="formula">I = I₁ + I₂ + I₃</div></li>
      <li><strong>Erresistentzia baliokidearen alderantzizkoa</strong> alderantzizkoen batura da (beti txikiena baino txikiagoa).
        <div class="formula">1 / R<sub>b</sub> = 1 / R₁ + 1 / R₂ + 1 / R₃</div></li>
    </ol>
    <p>Bi erresistentzia bakarrik badaude, formula laburragoa erabil daiteke, eta n erresistentzia berdin badaude, baten n-rena da:</p>
    <div class="formula">R<sub>b</sub> = R₁ · R₂ / (R₁ + R₂) &nbsp;&nbsp;&nbsp; R<sub>b</sub> = R / n</div>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>12 V-ko pila bati hiru erresistentzia lotu zaizkio paraleloan: 20 Ω, 30 Ω eta 60 Ω.</p>
      <div class="diagram" style="max-width:360px">${eskemaSVG(tree, { E: 12, emaitzak: ebatzi(tree, 12) })}</div>
      <ol>
        <li>Adar bakoitzak 12 V ditu.</li>
        <li>I₁ = 12 / 20 = 0,6 A; &nbsp;I₂ = 12 / 30 = 0,4 A; &nbsp;I₃ = 12 / 60 = 0,2 A</li>
        <li>I = 0,6 + 0,4 + 0,2 = 1,2 A</li>
        <li>1 / R<sub>b</sub> = 1/20 + 1/30 + 1/60 = 6/60 → R<sub>b</sub> = 10 Ω. Egiaztatu: 12 / 10 = 1,2 A ✓</li>
      </ol>
      <p class="ans">Erresistentzia txikienetik igarotzen da korronte handiena.</p>
    </div>

    <h3>Etxeko instalazioa paraleloan</h3>
    <p>Etxeko entxufe eta argi guztiak <strong>paraleloan</strong> daude: guztiek 230 V jasotzen dituzte, eta bakoitza bere etengailuarekin pizten eta itzaltzen da. Aparailu bat itzaltzean, bere adarra bakarrik irekitzen da.</p>

    <h3>Seriea eta paraleloa konparatuta</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Seriea</th><th>Paraleloa</th></tr></thead>
      <tbody>
        <tr><td>Intentsitatea</td><td>Berdina guztietan</td><td>Adarren artean banatzen da</td></tr>
        <tr><td>Tentsioa</td><td>Osagaien artean banatzen da</td><td>Berdina guztietan</td></tr>
        <tr><td>Erresistentzia baliokidea</td><td>Batura (handiena baino handiagoa)</td><td>Alderantzizkoen batura (txikiena baino txikiagoa)</td></tr>
        <tr><td>Osagai bat kentzean</td><td>Guztiak itzaltzen dira</td><td>Besteek funtzionatzen jarraitzen dute</td></tr>
        <tr><td>Bonbillen distira</td><td>Gutxiago, bonbilla gehiago jarri ahala</td><td>Berdina, bonbilla bakarra balego bezala</td></tr>
      </tbody>
    </table></div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> etxeko argiak paraleloan daude. Etengailu batek bere adarra bakarrik irekitzen du; beste adarrek tentsio osoa jasotzen jarraitzen dute.</p>

    <details class="sakondu" data-maila="2"><summary>Entxufe-lapurrak eta gainkarga</summary><div class="in">
      <p>Paraleloan aparailu bat gehitzen den bakoitzean, pilaren (edo sarearen) korrontea handitu egiten da. Entxufe-lapur batean 2000 W-eko berogailua, 1500 W-eko ile-lehorgailua eta 1000 W-eko burdina konektatzen badira:</p>
      <div class="formula">I = (2000 + 1500 + 1000) / 230 ≈ 19,6 A</div>
      <p>Linea hori 16 A-rako prestatuta badago, etengailu magnetotermikoak korrontea moztuko du, kablea gehiegi berotu ez dadin (Joule efektua).</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Konduktantzia eta korronte-zatitzailea</summary><div class="in">
      <p><strong>Konduktantzia</strong> erresistentziaren alderantzizkoa da: G = 1 / R, eta siemensetan (S) neurtzen da. Paraleloan konduktantziak batu egiten dira: G<sub>b</sub> = G₁ + G₂ + G₃.</p>
      <p>Bi adarretan, korrontea erresistentziaren alderantziz banatzen da (<strong>korronte-zatitzailea</strong>):</p>
      <div class="formula">I₁ = I · R₂ / (R₁ + R₂) &nbsp;&nbsp;&nbsp; I₂ = I · R₁ / (R₁ + R₂)</div>
      <p>Adibidez, I = 3 A, R₁ = 10 Ω eta R₂ = 20 Ω: I₁ = 3 · 20 / 30 = 2 A eta I₂ = 1 A.</p>
    </div></details>`,

  ariketak: ['paraleloa-req', 'paraleloa-i'],

  galdetegia: [
    { g: 'Paraleloko zirkuitu batean, zer da berdina adar guztietan?', a: ['Tentsioa', 'Intentsitatea', 'Erresistentzia', 'Potentzia'], z: 0, zergatik: 'Adar guztiak bi puntu berberen artean daude: tentsio bera dute.' },
    { g: 'Bi 20 Ω-eko erresistentzia paraleloan. Erresistentzia baliokidea:', a: ['40 Ω', '10 Ω', '20 Ω', '400 Ω'], z: 1, zergatik: 'Bi berdin paraleloan: baten erdia → 10 Ω.' },
    { g: 'Paraleloan dagoen adar bat irekitzen bada:', a: ['Beste adarrek funtzionatzen jarraitzen dute', 'Guztiak itzaltzen dira', 'Besteek distira gutxiago egiten dute', 'Zirkuitulaburra gertatzen da'], z: 0, zergatik: 'Beste adarrek bide itxia dute oraindik, tentsio berarekin.' },
    { g: 'Bi adarretako korronteak 0,5 A eta 1,5 A dira. Zein da pilaren korrontea?', a: ['2 A', '1 A', '0,75 A', '1,5 A'], z: 0, zergatik: 'I = I₁ + I₂ = 0,5 + 1,5 = 2 A.' },
    { g: 'Paraleloan erresistentzia gehiago gehitzean, erresistentzia baliokidea:', a: ['Txikitu egiten da', 'Handitu egiten da', 'Ez da aldatzen', 'Zero bihurtzen da'], z: 0, zergatik: 'Korronteak bide gehiago ditu: oztopo osoa txikiagoa da.' },
    { g: 'Paraleloan, zein adarretatik igarotzen da korronte gehien?', a: ['Erresistentzia txikienetik', 'Erresistentzia handienetik', 'Denetatik berdin', 'Pilatik urrunenekotik'], z: 0, zergatik: 'Tentsio bera: I = V / R → R txikiena, I handiena.' },
    { g: 'Entxufe-lapur batean aparailu indartsu asko aldi berean konektatzean:', a: ['Korronteak batu egiten dira eta etengailu automatikoak salta dezake', 'Tentsioa aparailuen artean banatzen da', 'Korrontea txikitu egiten da', 'Ez da ezer gertatzen'], z: 0, maila: 2, zergatik: 'Paraleloan korronteak batu egiten dira; korronte handiegiak kableak berotzen ditu.' },
    { g: 'I = 3 A bi adarretan banatzen da: R₁ = 10 Ω eta R₂ = 20 Ω. Zenbat da I₁?', a: ['2 A', '1 A', '1,5 A', '3 A'], z: 0, maila: 3, zergatik: 'I₁ = I · R₂ / (R₁ + R₂) = 3 · 20 / 30 = 2 A.' }
  ]
};
