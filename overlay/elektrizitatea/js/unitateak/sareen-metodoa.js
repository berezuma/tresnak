import { bisareSVG } from '../eskema.js';

const Z = { E1: 12, E2: 6, R1: 4, R2: 6, R3: 3 };

export default {
  izena: 'Sare-korronteen metodoa',
  galdera: 'Nola ebazten da bi pila adar desberdinetan dituen zirkuitu bat, erresistentzia baliokiderik kalkulatu ezin denean?',

  ikusi: {
    sim: 'sareak',
    proba: 'Aldatu E₂ 0 V-ra: nolako zirkuitua geratzen da? Igo E₂ 12 V-ra: zer gertatzen zaio I₁-i? Bilatu E₂-ren balio bat R₂-tik korronterik igaro ez dadin. Aldatu ikuspegia <b>Adar-korronteak</b> modura geziak ikusteko.'
  },

  ulertu: () => `
    <p>Zirkuitu bat serie eta paralelo taldeka murriztu ezin denean (sorgailu bat baino gehiago adar desberdinetan, zubiak…), Kirchhoff-en legeekin ekuazio-sistema bat idazten da. <strong>Sare-korronteen metodoa</strong> (Maxwell-en metodoa) da modu sistematikoena.</p>

    <h3>Zenbat ekuazio behar dira?</h3>
    <p>Zirkuitu batek <strong>a</strong> adar eta <strong>n</strong> nodo baditu, sare independenteak (barruan beste sarerik ez duten begiztak) hauek dira:</p>
    <div class="formula">s = a − n + 1</div>
    <p>Irudiko zirkuituak 3 adar eta 2 nodo ditu: 3 − 2 + 1 = <strong>2 sare</strong>, beraz 2 ekuazio.</p>

    <h3>Metodoa urratsez urrats</h3>
    <ol>
      <li>Sare bakoitzari <strong>sare-korronte</strong> bat esleitu (J₁, J₂…), denak noranzko berean (erlojuaren orratzena).</li>
      <li>Sare bakoitzean tentsioen legea idatzi:
        <ul>
          <li>Diagonalean: sarearen erresistentzia guztien batura, J-ren koefiziente gisa.</li>
          <li>Bi sareren arteko erresistentziak: <strong>−R</strong> koefizientea besteen korrontearekin.</li>
          <li>Eskuinean: sarearen sorgailuen batura (+ J-ren noranzkoan bultzatzen badu, − kontra).</li>
        </ul></li>
      <li>Sistema ebatzi (ordezkapenez, laburketaz edo <strong>Cramer-en erregelaz</strong>).</li>
      <li>Adar-korronteak lortu: kanpoko adarrean I = J; bi sareren arteko adarrean I = J₁ − J₂.</li>
      <li>Emaitza negatiboak: benetako noranzkoa suposatutakoaren kontrakoa.</li>
    </ol>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <div class="diagram">${bisareSVG({ ...Z, sareak: true })}</div>
      <ol>
        <li><strong>1. sarea</strong> (E₁, R₁, R₂): (4 + 6)·J₁ − 6·J₂ = 12</li>
        <li><strong>2. sarea</strong> (R₂, R₃, E₂): −6·J₁ + (6 + 3)·J₂ = −6 &nbsp;(E₂-k J₂-ren kontra bultzatzen du)</li>
        <li>Δ = 10·9 − (−6)(−6) = 54</li>
        <li>J₁ = (12·9 − (−6)(−6)) / 54 = 72 / 54 = 1,333 A</li>
        <li>J₂ = (10·(−6) − (−6)·12) / 54 = 12 / 54 = 0,222 A</li>
        <li>I₁ = J₁ = 1,333 A (gora E₁-etik) · I₂ = J₁ − J₂ = 1,111 A (behera R₂-tik) · I₃ = J₂ = 0,222 A</li>
      </ol>
      <div class="diagram">${bisareSVG({ ...Z, adarrak: { I1: 72 / 54, I2: 60 / 54, I3: 12 / 54 } })}</div>
      <p class="ans">Egiaztatu goiko nodoan: 1,333 = 1,111 + 0,222 ✓. E₂ kargatzen ari da: I₃ bere + bornatik sartzen zaio.</p>
    </div>

    <h3>Egiaztapena: potentzia-balantzea</h3>
    <p>Sorgailuek emandako potentzia eta erresistentziek xahututakoa berdinak izan behar dira:</p>
    <div class="formula">E₁·I₁ − E₂·I₃ = R₁·I₁² + R₂·I₂² + R₃·I₃²<small>16 − 1,33 = 7,11 + 7,41 + 0,15 = 14,67 W ✓</small></div>

    <h3>Beste bide bat: Kirchhoff zuzenean</h3>
    <p>Hiru adar-korronte ezezagun (I₁, I₂, I₃) erabil daitezke: korronteen lege bat (goiko nodoan, I₁ = I₂ + I₃) eta tentsioen bi lege (sare bakoitzean). Emaitza bera da, baina 3 × 3 sistema bat ebatzi behar da; sare-korronteekin 2 × 2 nahikoa da.</p>

    <h3>Hiru sare edo gehiago</h3>
    <p>Metodoa berdin orokortzen da. Hiru sarerekin, 3 × 3 sistema bat idazten da; koefizienteen matrizea simetrikoa da:</p>
    <div class="formula">[ R₁₁ −R₁₂ −R₁₃ ; −R₁₂ R₂₂ −R₂₃ ; −R₁₃ −R₂₃ R₃₃ ] · [ J₁ ; J₂ ; J₃ ] = [ E₁ ; E₂ ; E₃ ]</div>
    <p class="note">Probatu laborategian «Wheatstone-ren zubia» adibidea: hiru sare ditu, eta erdiko adarreko amperimetroak zero neurtzen du R₁/R₃ = R₂/R₄ denean (zubia orekatuta).</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> sare bakoitzari korronte bat esleitu, sare bakoitzean tentsioen legea idatzi, eta ekuazio-sistema ebatzi. Adar bakoitzeko korrontea sare-korronteen konbinazioa da.</p>`,

  ariketak: ['sareak'],

  galdetegia: [
    { g: 'Zirkuitu batek 5 adar eta 3 nodo ditu. Zenbat sare independente?', a: ['3', '2', '5', '8'], z: 0, zergatik: 's = a − n + 1 = 5 − 3 + 1 = 3.' },
    { g: 'Sare-korronteen metodoan, zer lege aplikatzen da sare bakoitzean?', a: ['Kirchhoff-en tentsioen legea', 'Kirchhoff-en korronteen legea bakarrik', 'Joule-ren legea', 'Coulomb-en legea'], z: 0, zergatik: 'Sare bakoitzean ΣE = Σ(R·I) idazten da.' },
    { g: 'Bi sareren artean dagoen erresistentziatik zein korronte igarotzen da?', a: ['J₁ − J₂ (noranzko berean hartuta)', 'J₁ + J₂', 'J₁ bakarrik', 'Zero beti'], z: 0, zergatik: 'Bi sare-korronteak kontrako noranzkoan igarotzen dira adar komunetik.' },
    { g: 'J₂ = −0,4 A atera da. Zer esan nahi du?', a: ['2. sarearen korrontea 0,4 A da, erlojuaren orratzen kontra', 'Kalkulua gaizki dago', 'Sare horretan ez dago korronterik', 'Pila hondatuta dago'], z: 0, zergatik: 'Zeinuak noranzkoa adierazten du.' },
    { g: '(R₁ + R₂)·J₁ − R₂·J₂ = E₁ ekuazioan, zergatik agertzen da −R₂·J₂?', a: ['R₂ bi sareen artean dagoelako eta J₂ kontrako noranzkoan igarotzen delako', 'R₂ pila bat delako', 'J₂ beti negatiboa delako', 'Akats bat da'], z: 0, zergatik: 'Adar komunean J₂-k J₁-en kontrako tentsio-jaitsiera sortzen du.' },
    { g: 'Nola egiaztatu daiteke zirkuitu baten ebazpena?', a: ['Sorgailuek emandako potentzia eta erresistentziek xahututakoa berdinak direla', 'Korronte guztiak positiboak direla', 'Erresistentzien batura E dela', 'Ezin da egiaztatu'], z: 0, zergatik: 'Potentzia-balantzea: ΣE·I = ΣR·I² (edo nodoetan korronteen legea).' },
    { g: 'Zergatik da sare-korronteen metodoa Kirchhoff zuzenean baino laburragoa?', a: ['Ezezagun gutxiago behar dituelako (sareak, ez adarrak)', 'Ez duelako tentsioen legea erabiltzen', 'Zirkuitu sinpleetan bakarrik balio duelako', 'Ez da laburragoa'], z: 0, zergatik: 'Korronteen legea sare-korronteetan berez betetzen da: s ezezagun a-ren ordez.' }
  ]
};
